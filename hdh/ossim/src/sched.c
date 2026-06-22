#include "queue.h"
#include "sched.h"
#include <pthread.h>

#include <stdlib.h>
#include <stdio.h>
static struct queue_t ready_queue; // nếu đã DEFINE MLQ thì không sử dụng biến này
static struct queue_t run_queue;   // để vậy chứ không sử dụng
static pthread_mutex_t queue_lock;

static struct queue_t running_list; // lấy một phần tử trong mlq_ready_queue và gán vào biến running
									// để xử lí
#ifdef MLQ_SCHED
static struct queue_t mlq_ready_queue[MAX_PRIO];
static int slot[MAX_PRIO];
#endif

int queue_empty(void)
{
#ifdef MLQ_SCHED
	unsigned long prio;
	for (prio = 0; prio < MAX_PRIO; prio++)
		if (!empty(&mlq_ready_queue[prio]))
			return -1;
#endif
	return (empty(&ready_queue) && empty(&run_queue));
}

void init_scheduler(void)
{
#ifdef MLQ_SCHED
	int i;

	for (i = 0; i < MAX_PRIO; i++)
	{
		mlq_ready_queue[i].size = 0;
		slot[i] = MAX_PRIO - i;
	}
#endif
	ready_queue.size = 0;
	run_queue.size = 0;
	running_list.size = 0;
	pthread_mutex_init(&queue_lock, NULL);
}

#ifdef MLQ_SCHED
/*
 *  Stateful design for routine calling
 *  based on the priority and our MLQ policy
 *  We implement stateful here using transition technique
 *  State representation   prio = 0 .. MAX_PRIO, curr_slot = 0..(MAX_PRIO - prio)
 */

struct pcb_t *get_mlq_proc(void)
{
	struct pcb_t *proc = NULL;
	/*TODO: get a process from PRIORITY [ready_queue].
	 * Remember to use lock to protect the queue.
	 * */
	pthread_mutex_lock(&queue_lock);

	/* Check if all queues are empty */
	unsigned long prio;
	int all_empty = 1;
	for (prio = 0; prio < MAX_PRIO; prio++) {
		if (!empty(&mlq_ready_queue[prio])) {
			all_empty = 0;
			break;
		}
	}
	if (all_empty) {
		pthread_mutex_unlock(&queue_lock);
		return NULL;
	}

	/* Try to find a process from the highest priority queue that still has slots */
	for (prio = 0; prio < MAX_PRIO; prio++) {
		if (!empty(&mlq_ready_queue[prio]) && slot[prio] > 0) {
			proc = dequeue(&mlq_ready_queue[prio]);
			slot[prio]--;
			pthread_mutex_unlock(&queue_lock);
			return proc;
		}
	}

	/* All slots exhausted but there are still processes, reset all slots */
	for (prio = 0; prio < MAX_PRIO; prio++) {
		slot[prio] = MAX_PRIO - prio;
	}

	/* Try again after reset */
	for (prio = 0; prio < MAX_PRIO; prio++) {
		if (!empty(&mlq_ready_queue[prio]) && slot[prio] > 0) {
			proc = dequeue(&mlq_ready_queue[prio]);
			slot[prio]--;
			pthread_mutex_unlock(&queue_lock);
			return proc;
		}
	}

	pthread_mutex_unlock(&queue_lock);
	return proc;
}

void put_mlq_proc(struct pcb_t *proc)
{
	pthread_mutex_lock(&queue_lock);
	enqueue(&mlq_ready_queue[proc->prio], proc);
	pthread_mutex_unlock(&queue_lock);
}

void add_mlq_proc(struct pcb_t *proc)
{
	pthread_mutex_lock(&queue_lock);
	enqueue(&mlq_ready_queue[proc->prio], proc);
	pthread_mutex_unlock(&queue_lock);
}

struct pcb_t *get_proc(void)
{
	return get_mlq_proc();
}

void put_proc(struct pcb_t *proc)
{
	return put_mlq_proc(proc);
}

void add_proc(struct pcb_t *proc)
{
	return add_mlq_proc(proc);
}
#else
struct pcb_t *get_proc(void)
{
	struct pcb_t *proc = NULL;
	/*TODO: get a process from [ready_queue].
	 * Remember to use lock to protect the queue.
	 * */
	// TODO: bắt đầu làm
	pthread_mutex_lock(&queue_lock); // lock
	if (!empty(&ready_queue))
	{
		proc = dequeue(&ready_queue);
	}
	pthread_mutex_unlock(&queue_lock); // unlock
	// TODO: END
	return proc;
}

void put_proc(struct pcb_t *proc)
{
	pthread_mutex_lock(&queue_lock);
	enqueue(&ready_queue, proc);
	pthread_mutex_unlock(&queue_lock);
}

void add_proc(struct pcb_t *proc)
{
	proc->ready_queue = &ready_queue;
	proc->running_list = &running_list;

	/* TODO: put running proc to running_list */

	pthread_mutex_lock(&queue_lock);
	enqueue(&ready_queue, proc);
	pthread_mutex_unlock(&queue_lock);
}
#endif
