#ifndef MM_TLB_H
#define MM_TLB_H

#include "common.h"
#include "mm.h"

/* TLB cache operations */
int tlb_cache_read(struct memphy_struct *mp, int pid, int pgnum, BYTE *value);
int tlb_cache_write(struct memphy_struct *mp, int pid, int pgnum, BYTE value);

/* TLB-wrapped memory operations */
int tlballoc(struct pcb_t *proc, uint32_t size, uint32_t reg_index);
int tlbfree_data(struct pcb_t *proc, uint32_t reg_index);
int tlbread(struct pcb_t *proc, uint32_t source, uint32_t offset, uint32_t *destination);
int tlbwrite(struct pcb_t *proc, BYTE data, uint32_t destination, uint32_t offset);

/* TLB init */
int init_tlb(struct memphy_struct *mp, int max_size);
int tlb_flush(struct memphy_struct *mp);

#endif
