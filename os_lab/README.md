# OS Lab Module (C)

Simulates operating system concepts on placement data.

## Files

| File | Purpose |
|------|---------|
| `src/scheduler.c` | CPU scheduling: FCFS, SJF, RR, Priority on interview slots |
| `src/sync.c` | Race condition demo: seat allocation without/with locks |
| `src/threads.c` | Thread pool processing applications with per-thread logs |
| `src/deadlock.c` | Banker's algorithm + wait-for graph deadlock detection |
| `src/concurrent.c` | 50 concurrent applicants for 5 seats test |
| `Makefile` | Build all binaries |

## Concepts Mapped to Placement Problems

| OS Concept | Placement Scenario |
|------------|--------------------|
| CPU Scheduling | Interview slots: each candidate = process, burst = interview length |
| Multithreading | Process 500 applications at once with a thread pool |
| Process Synchronization | Final seat: two students apply simultaneously, mutex ensures correctness |
| Producer-Consumer | Students submit (producers), recruiters review (consumers) |
| Deadlock Handling | Two companies competing for rooms/panels — detect + recover |

## Build & Run

```bash
cd os_lab
make
# Binaries are in bin/
```

## Output

Each C program writes JSON to `output/` for the FastAPI backend to read.