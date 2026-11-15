/*
 * Placement Management System - OS Lab
 * CPU Scheduling Algorithms for Interview Slot Allocation
 *
 * Each shortlisted candidate is a "process" with:
 *   - arrival_time = when shortlisted
 *   - burst_time   = interview duration (minutes)
 *   - priority     = package tier (DREAM=1, SUPER_DREAM=2, NORMAL=3)
 *
 * Algorithms: FCFS, SJF (preemptive & non-preemptive), Round Robin, Priority
 *
 * Usage: ./scheduler <algo> [quantum]
 * Output: writes JSON to output/schedule.json
 *
 * Build: make scheduler
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <limits.h>

#define MAX_PROCESSES 100
#define OUTPUT_FILE "output/schedule.json"

typedef struct {
    int pid;          // process id (student app_id)
    int arrival;      // arrival time (shortlist time in "minutes" from start)
    int burst;        // burst time (interview duration)
    int priority;     // 1=high(DREAM), 2, 3=low(NORMAL)
    int remaining;    // remaining burst (for preemptive)
    int start;        // when execution started
    int finish;       // when completed
    int waiting;      // waiting time
    int turnaround;   // turnaround time
} Process;

int num_processes = 0;
Process processes[MAX_PROCESSES];

/* ---- Utility functions ---- */

void sort_by_arrival() {
    for (int i = 0; i < num_processes - 1; i++)
        for (int j = 0; j < num_processes - i - 1; j++)
            if (processes[j].arrival > processes[j + 1].arrival) {
                Process temp = processes[j];
                processes[j] = processes[j + 1];
                processes[j + 1] = temp;
            }
}

void sort_by_burst() {
    for (int i = 0; i < num_processes - 1; i++)
        for (int j = 0; j < num_processes - i - 1; j++)
            if (processes[j].burst > processes[j + 1].burst) {
                Process temp = processes[j];
                processes[j] = processes[j + 1];
                processes[j + 1] = temp;
            }
}

int find_min_remaining(int current_time) {
    int min_idx = -1;
    int min_rem = INT_MAX;
    for (int i = 0; i < num_processes; i++) {
        if (processes[i].arrival <= current_time && processes[i].remaining > 0) {
            if (processes[i].remaining < min_rem) {
                min_rem = processes[i].remaining;
                min_idx = i;
            }
        }
    }
    return min_idx;
}

int find_highest_priority(int current_time) {
    int best_idx = -1;
    int best_priority = INT_MAX;
    for (int i = 0; i < num_processes; i++) {
        if (processes[i].arrival <= current_time && processes[i].remaining > 0) {
            if (processes[i].priority < best_priority ||
                (processes[i].priority == best_priority &&
                 processes[i].arrival < processes[best_idx].arrival)) {
                best_priority = processes[i].priority;
                best_idx = i;
            }
        }
    }
    return best_idx;
}

/* ---- FCFS (First Come First Served) ---- */
void schedule_fcfs() {
    int current_time = 0;
    for (int i = 0; i < num_processes; i++) {
        if (current_time < processes[i].arrival)
            current_time = processes[i].arrival;

        processes[i].start = current_time;
        processes[i].finish = current_time + processes[i].burst;
        processes[i].turnaround = processes[i].finish - processes[i].arrival;
        processes[i].waiting = processes[i].turnaround - processes[i].burst;
        current_time = processes[i].finish;
    }
}

/* ---- SJF (Shortest Job First) - Non-preemptive ---- */
void schedule_sjf_nonpreemptive() {
    int completed = 0;
    int current_time = 0;

    while (completed < num_processes) {
        int shortest = -1;
        for (int i = 0; i < num_processes; i++) {
            if (processes[i].arrival <= current_time && processes[i].remaining > 0) {
                if (shortest == -1 || processes[i].burst < processes[shortest].burst)
                    shortest = i;
            }
        }

        if (shortest == -1) {
            current_time++;
            continue;
        }

        processes[shortest].start = current_time;
        processes[shortest].finish = current_time + processes[shortest].burst;
        processes[shortest].turnaround = processes[shortest].finish - processes[shortest].arrival;
        processes[shortest].waiting = processes[shortest].turnaround - processes[shortest].burst;
        processes[shortest].remaining = 0;
        current_time = processes[shortest].finish;
        completed++;
    }
}

/* ---- SJF Preemptive (Shortest Remaining Time First) ---- */
void schedule_sjf_preemptive() {
    int current_time = 0;
    int completed = 0;

    while (completed < num_processes) {
        int idx = find_min_remaining(current_time);

        if (idx == -1) {
            // Find next arrival
            int next_arrival = INT_MAX;
            for (int i = 0; i < num_processes; i++)
                if (processes[i].arrival > current_time && processes[i].arrival < next_arrival)
                    next_arrival = processes[i].arrival;
            if (next_arrival != INT_MAX)
                current_time = next_arrival;
            else
                break;
            continue;
        }

        if (processes[idx].start == -1)
            processes[idx].start = current_time;

        processes[idx].remaining--;
        current_time++;

        if (processes[idx].remaining == 0) {
            processes[idx].finish = current_time;
            processes[idx].turnaround = processes[idx].finish - processes[idx].arrival;
            processes[idx].waiting = processes[idx].turnaround - processes[idx].burst;
            completed++;
        }
    }
}

/* ---- Round Robin ---- */
void schedule_rr(int quantum) {
    int current_time = 0;
    int completed = 0;
    int in_queue[MAX_PROCESSES] = {0};

    // Reset state
    for (int i = 0; i < num_processes; i++) {
        processes[i].remaining = processes[i].burst;
        processes[i].start = -1;
    }

    int queue[MAX_PROCESSES];
    int front = 0, rear = 0;

    // Enqueue processes that have arrived at time 0
    for (int i = 0; i < num_processes; i++) {
        if (processes[i].arrival <= current_time && !in_queue[i]) {
            queue[rear++] = i;
            in_queue[i] = 1;
        }
    }

    while (completed < num_processes) {
        if (front == rear) {
            // Idle until next arrival
            int next_arrival = INT_MAX;
            for (int i = 0; i < num_processes; i++)
                if (processes[i].arrival > current_time && !in_queue[i] && processes[i].remaining > 0)
                    next_arrival = processes[i].arrival < next_arrival ? processes[i].arrival : next_arrival;
            if (next_arrival != INT_MAX)
                current_time = next_arrival;
            for (int i = 0; i < num_processes; i++)
                if (processes[i].arrival <= current_time && !in_queue[i] && processes[i].remaining > 0) {
                    queue[rear++] = i;
                    in_queue[i] = 1;
                }
            if (front == rear) break;
            continue;
        }

        int idx = queue[front++];

        if (processes[idx].start == -1)
            processes[idx].start = current_time;

        if (processes[idx].remaining > quantum) {
            current_time += quantum;
            processes[idx].remaining -= quantum;
        } else {
            current_time += processes[idx].remaining;
            processes[idx].remaining = 0;
            processes[idx].finish = current_time;
            processes[idx].turnaround = processes[idx].finish - processes[idx].arrival;
            processes[idx].waiting = processes[idx].turnaround - processes[idx].burst;
            completed++;
        }

        // Add newly arrived processes
        for (int i = 0; i < num_processes; i++) {
            if (processes[i].arrival <= current_time && !in_queue[i] && processes[i].remaining > 0) {
                queue[rear++] = i;
                in_queue[i] = 1;
            }
        }

        // Re-enqueue current process if not finished
        if (processes[idx].remaining > 0)
            queue[rear++] = idx;
    }
}

/* ---- Priority Scheduling ---- */
void schedule_priority() {
    int current_time = 0;
    int completed = 0;

    while (completed < num_processes) {
        int idx = find_highest_priority(current_time);

        if (idx == -1) {
            int next_arrival = INT_MAX;
            for (int i = 0; i < num_processes; i++)
                if (processes[i].arrival > current_time && processes[i].remaining > 0)
                    next_arrival = processes[i].arrival < next_arrival ? processes[i].arrival : next_arrival;
            if (next_arrival != INT_MAX)
                current_time = next_arrival;
            else
                break;
            continue;
        }

        if (processes[idx].start == -1)
            processes[idx].start = current_time;

        current_time += processes[idx].remaining;
        processes[idx].remaining = 0;
        processes[idx].finish = current_time;
        processes[idx].turnaround = processes[idx].finish - processes[idx].arrival;
        processes[idx].waiting = processes[idx].turnaround - processes[idx].burst;
        completed++;
    }
}

/* ---- Output JSON ---- */
void write_json(const char *algo, int quantum) {
    FILE *fp = fopen(OUTPUT_FILE, "w");
    if (!fp) {
        perror("Cannot write output");
        return;
    }

    double total_waiting = 0, total_turnaround = 0;
    for (int i = 0; i < num_processes; i++) {
        total_waiting += processes[i].waiting;
        total_turnaround += processes[i].turnaround;
    }
    double avg_waiting = total_waiting / num_processes;
    double avg_turnaround = total_turnaround / num_processes;

    fprintf(fp, "{\n");
    fprintf(fp, "  \"algorithm\": \"%s\",\n", algo);
    if (quantum > 0)
        fprintf(fp, "  \"time_quantum\": %d,\n", quantum);
    fprintf(fp, "  \"processes_count\": %d,\n", num_processes);
    fprintf(fp, "  \"average_waiting_time\": %.2f,\n", avg_waiting);
    fprintf(fp, "  \"average_turnaround_time\": %.2f,\n", avg_turnaround);

    // Gantt chart data: array of {pid, start, end, duration}
    fprintf(fp, "  \"gantt\": [");
    int first = 1;
    for (int i = 0; i < num_processes; i++) {
        if (!first) fprintf(fp, ", ");
        fprintf(fp, "{\"pid\": %d, \"start\": %d, \"end\": %d, \"duration\": %d}",
                processes[i].pid, processes[i].start,
                processes[i].finish, processes[i].burst);
        first = 0;
    }
    fprintf(fp, "],\n");

    // Per-process data
    fprintf(fp, "  \"processes\": [");
    for (int i = 0; i < num_processes; i++) {
        if (i > 0) fprintf(fp, ", ");
        fprintf(fp, "{\"pid\": %d, \"burst\": %d, \"priority\": %d, \"waiting\": %d, \"turnaround\": %d, \"start\": %d, \"finish\": %d}",
                processes[i].pid, processes[i].burst, processes[i].priority,
                processes[i].waiting, processes[i].turnaround,
                processes[i].start, processes[i].finish);
    }
    fprintf(fp, "]\n");
    fprintf(fp, "}\n");
    fclose(fp);
}

/* ---- Load sample interview queue ---- */
int load_processes() {
    /*
     * Sample data: 5 shortlisted candidates for interview slots.
     * Priority: 1=DREAM (highest), 2=SUPER_DREAM, 3=NORMAL
     */
    Process data[] = {
        {1,  0,  5, 2},  // app_id 1, arrives at 0, 5min interview, SUPER_DREAM
        {2,  1,  3, 1},  // app_id 2, arrives at 1, 3min interview, DREAM
        {3,  2,  8, 1},  // app_id 3, arrives at 2, 8min interview, DREAM
        {4,  3,  6, 3},  // app_id 4, arrives at 3, 6min interview, NORMAL
        {5,  4,  4, 2},  // app_id 5, arrives at 4, 4min interview, SUPER_DREAM
    };
    num_processes = 5;
    memcpy(processes, data, sizeof(data));

    // Make output directory if it doesn't exist
    system("mkdir output 2>nul || mkdir -p output 2>/dev/null");

    return num_processes;
}

int main(int argc, char *argv[]) {
    if (!load_processes())
        return 1;

    const char *algo = "fcfs";
    int quantum = 0;

    if (argc > 1) algo = argv[1];
    if (argc > 2) quantum = atoi(argv[2]);

    // Reset process state
    for (int i = 0; i < num_processes; i++) {
        processes[i].start = -1;
        processes[i].finish = -1;
        processes[i].waiting = 0;
        processes[i].turnaround = 0;
        processes[i].remaining = processes[i].burst;
    }

    sort_by_arrival();

    printf("OS Lab Scheduler - Running %s algorithm on %d processes\n", algo, num_processes);
    for (int i = 0; i < num_processes; i++)
        printf("  Process %d: arrival=%d, burst=%d, priority=%d\n",
               processes[i].pid, processes[i].arrival, processes[i].burst, processes[i].priority);

    if (strcmp(algo, "sjf-p") == 0 || strcmp(algo, "sjf_preemptive") == 0) {
        schedule_sjf_preemptive();
        write_json("SJF Preemptive", 0);
    } else if (strcmp(algo, "sjf") == 0 || strcmp(algo, "sjf_np") == 0) {
        schedule_sjf_nonpreemptive();
        write_json("SJF Non-Preemptive", 0);
    } else if (strcmp(algo, "rr") == 0) {
        if (quantum <= 0) quantum = 2;
        schedule_rr(quantum);
        write_json("Round Robin", quantum);
    } else if (strcmp(algo, "priority") == 0) {
        schedule_priority();
        write_json("Priority", 0);
    } else {
        schedule_fcfs();
        write_json("FCFS", 0);
    }

    printf("\nResults written to %s\n", OUTPUT_FILE);
    printf("  Avg Waiting Time:     ");
    return 0;
}
