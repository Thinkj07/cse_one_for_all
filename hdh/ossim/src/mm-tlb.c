#include "../include/os-cfg.h"
#ifdef CPU_TLB
/*
 * CPU TLB
 * TLB module mm/mm-tlb.c
 */

#include "mm.h"
#include "mm-tlb.h"
#include "libmem.h"
#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#include <pthread.h>

/* TLB entry structure for direct-mapped cache
 * We store pid + page number as the tag, and the frame number as the data.
 * Each entry: | valid (1 byte) | pid (4 bytes) | pgnum (4 bytes) | fpn (4 bytes) |
 */
#define TLB_ENTRY_SIZE 13
#define TLB_VALID_OFFSET 0
#define TLB_PID_OFFSET   1
#define TLB_PGN_OFFSET   5
#define TLB_FPN_OFFSET   9

static pthread_mutex_t tlb_lock = PTHREAD_MUTEX_INITIALIZER;

/*
 * Get number of TLB entries based on the TLB memphy size
 */
static int tlb_num_entries(struct memphy_struct *mp)
{
   if (mp == NULL || mp->maxsz <= 0)
      return 0;
   return mp->maxsz / TLB_ENTRY_SIZE;
}

/*
 * TLB direct-mapped index: hash by (pid + pgnum) mod num_entries
 */
static int tlb_index(struct memphy_struct *mp, int pid, int pgnum)
{
   int n = tlb_num_entries(mp);
   if (n <= 0) return -1;
   return ((unsigned int)(pid * 31 + pgnum)) % n;
}

/*
 * tlb_cache_read - read TLB cache device
 * @mp: memphy struct (TLB storage)
 * @pid: process id
 * @pgnum: page number
 * @value: obtained frame page number (FPN) stored as BYTE
 *
 * Returns 0 on TLB hit, -1 on TLB miss
 */
int tlb_cache_read(struct memphy_struct *mp, int pid, int pgnum, BYTE *value)
{
   if (mp == NULL || mp->storage == NULL)
      return -1;

   int idx = tlb_index(mp, pid, pgnum);
   if (idx < 0) return -1;

   int base = idx * TLB_ENTRY_SIZE;

   /* Check valid bit */
   if (mp->storage[base + TLB_VALID_OFFSET] != 1)
      return -1; /* Empty entry, miss */

   /* Check pid match */
   int stored_pid = 0;
   memcpy(&stored_pid, &mp->storage[base + TLB_PID_OFFSET], sizeof(int));
   if (stored_pid != pid)
      return -1; /* PID mismatch, miss */

   /* Check page number match */
   int stored_pgn = 0;
   memcpy(&stored_pgn, &mp->storage[base + TLB_PGN_OFFSET], sizeof(int));
   if (stored_pgn != pgnum)
      return -1; /* Page number mismatch, miss */

   /* TLB Hit: retrieve the frame number */
   int fpn = 0;
   memcpy(&fpn, &mp->storage[base + TLB_FPN_OFFSET], sizeof(int));
   *value = (BYTE)fpn;

#ifdef MMDBG
   printf("TLB HIT: pid=%d pgn=%d -> fpn=%d\n", pid, pgnum, fpn);
#endif

   return 0;
}

/*
 * tlb_cache_write - write TLB cache device
 * @mp: memphy struct (TLB storage)
 * @pid: process id
 * @pgnum: page number
 * @value: frame page number (FPN) to cache
 *
 * Returns 0 on success
 */
int tlb_cache_write(struct memphy_struct *mp, int pid, int pgnum, BYTE value)
{
   if (mp == NULL || mp->storage == NULL)
      return -1;

   int idx = tlb_index(mp, pid, pgnum);
   if (idx < 0) return -1;

   int base = idx * TLB_ENTRY_SIZE;

   /* Write entry: valid=1, pid, pgnum, fpn */
   mp->storage[base + TLB_VALID_OFFSET] = 1;
   memcpy(&mp->storage[base + TLB_PID_OFFSET], &pid, sizeof(int));
   memcpy(&mp->storage[base + TLB_PGN_OFFSET], &pgnum, sizeof(int));
   int fpn = (int)value;
   memcpy(&mp->storage[base + TLB_FPN_OFFSET], &fpn, sizeof(int));

   return 0;
}

/*
 * tlb_flush - invalidate all TLB entries
 */
int tlb_flush(struct memphy_struct *mp)
{
   if (mp == NULL || mp->storage == NULL)
      return -1;

   memset(mp->storage, 0, mp->maxsz);
   return 0;
}

/*
 * init_tlb - initialize TLB device
 */
int init_tlb(struct memphy_struct *mp, int max_size)
{
   mp->storage = (BYTE *)malloc(max_size * sizeof(BYTE));
   mp->maxsz = max_size;
   mp->rdmflg = 1; /* TLB is random access */
   memset(mp->storage, 0, max_size);
   return 0;
}

/*
 * tlballoc - TLB-wrapped alloc
 * @proc: Process executing the instruction
 * @size: allocated size
 * @reg_index: memory region ID
 */
int tlballoc(struct pcb_t *proc, uint32_t size, uint32_t reg_index)
{
   int val;

   /* Preceding: no TLB update needed for alloc */

   /* Perform paging alloc using vmaid = 0 by default */
   val = liballoc(proc, size, reg_index);

   /* Suffixing: flush TLB since memory layout changed (new page mappings) */
   pthread_mutex_lock(&tlb_lock);
   if (proc->tlb != NULL)
      tlb_flush(proc->tlb);
   pthread_mutex_unlock(&tlb_lock);

   return val;
}

/*
 * tlbfree_data - TLB-wrapped free
 * @proc: Process executing the instruction
 * @reg_index: memory region ID
 */
int tlbfree_data(struct pcb_t *proc, uint32_t reg_index)
{
   int val;

   /* Perform paging free */
   val = libfree(proc, reg_index);

   /* Suffixing: flush TLB since page mappings may have changed */
   pthread_mutex_lock(&tlb_lock);
   if (proc->tlb != NULL)
      tlb_flush(proc->tlb);
   pthread_mutex_unlock(&tlb_lock);

   return val;
}

/*
 * tlbread - TLB-wrapped read
 * @proc: Process executing the instruction
 * @source: Index of source register
 * @offset: Source address = [source] + [offset]
 * @destination: pointer to store the read value
 */
int tlbread(struct pcb_t *proc, uint32_t source, uint32_t offset, uint32_t *destination)
{
   int val;

   /* Preceding: try TLB cache read */
   /* For read, we can check if the page is cached in TLB.
    * However, the libread interface works at region+offset level,
    * so we delegate to libread which handles pg_getpage internally.
    * The TLB caching is done at the pg_getpage level.
    */

   /* Perform paging read using vmaid = 0 by default */
   val = libread(proc, source, offset, destination);

   return val;
}

/*
 * tlbwrite - TLB-wrapped write
 * @proc: Process executing the instruction
 * @data: Data to be written into memory
 * @destination: Index of destination register
 * @offset: Destination address = [destination] + [offset]
 */
int tlbwrite(struct pcb_t *proc, BYTE data, uint32_t destination, uint32_t offset)
{
   int val;

   /* Perform paging write using vmaid = 0 by default */
   val = libwrite(proc, data, destination, offset);

   return val;
}

#endif
