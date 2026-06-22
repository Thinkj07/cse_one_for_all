# OS Assignment TODO

## 1. Scheduler Fixes
- `src/queue.c`: Modify `dequeue` to correctly find and extract the process with the highest priority (lowest priority value).
- `src/sched.c`: Modify `get_mlq_proc` to properly implement the Multi-Level Queue (MLQ) slot-based traversal. When all queues exhaust their slots (or are empty), the slots should be reset.

## 2. Memory Management (TLB)
- `include/os-cfg.h`: Enable `#define MM_PAGING` and `#define CPU_TLB`.
- `include/common.h`: Add `tlb` (type `struct memphy_struct *`) to `struct pcb_t` inside `#ifdef CPU_TLB`.
- `src/mm-tlb.c`: Create this file to implement TLB cache initialization and operations (`tlb_cache_read`, `tlb_cache_write`, `tlballoc`, `tlbfree`, `tlbread`, `tlbwrite`).
- `include/mm-tlb.h`: Create this header for the TLB functions.
- `src/cpu.c`: Modify `run` to call TLB operations instead of paging operations if `CPU_TLB` is defined.
- `src/os.c`: Update the `ld_routine` to initialize the TLB inside the PCB. If `MM_FIXED_MEMSZ` is not defined, update the configuration reading to load `tlb_size`.
- `Makefile`: Include `mm-tlb.o` in the `MEM_OBJ` and `OS_OBJ` list.

## 3. Synchronization
- `src/mm-memphy.c` (or `libmem.c`): Add a mutex to protect concurrent access to shared resources (`mram` and `mswp`). This will prevent race conditions when multiple processes allocate or access memory simultaneously.
