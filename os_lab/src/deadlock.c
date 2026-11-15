/*
 * deadlock.c - Deadlock Detection & Prevention Demo
 * OS Lab - Placement Management System Project
 *
 * Demonstrates: Banker's Algorithm for deadlock avoidance
 */
#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>
#include <string.h>

#define MAX_PROCESSES 5
#define MAX_RESOURCES 3

int available[MAX_RESOURCES];
int max_demand[MAX_PROCESSES][MAX_RESOURCES];
int allocation[MAX_PROCESSES][MAX_RESOURCES];
int need[MAX_PROCESSES][MAX_RESOURCES];
int num_processes, num_resources;

void calculate_need(void) {
    for (int i = 0; i < num_processes; i++)
        for (int j = 0; j < num_resources; j++)
            need[i][j] = max_demand[i][j] - allocation[i][j];
}

bool is_safe_state(int safe_seq[]) {
    int work[MAX_RESOURCES];
    bool finish[MAX_PROCESSES] = {false};
    memcpy(work, available, sizeof(int) * num_resources);
    int count = 0;
    while (count < num_processes) {
        bool found = false;
        for (int i = 0; i < num_processes; i++) {
            if (!finish[i]) {
                bool can_allocate = true;
                for (int j = 0; j < num_resources; j++)
                    if (need[i][j] > work[j]) { can_allocate = false; break; }
                if (can_allocate) {
                    for (int j = 0; j < num_resources; j++) work[j] += allocation[i][j];
                    safe_seq[count++] = i;
                    finish[i] = true;
                    found = true;
                }
            }
        }
        if (!found) return false;
    }
    return true;
}

bool request_resources(int pid, int request[]) {
    for (int j = 0; j < num_resources; j++)
        if (request[j] > need[pid][j]) { printf("Error: Request exceeds max need.\n"); return false; }
    for (int j = 0; j < num_resources; j++)
        if (request[j] > available[j]) { printf("Process %d must wait (resources unavailable).\n", pid); return false; }
    for (int j = 0; j < num_resources; j++) {
        available[j] -= request[j];
        allocation[pid][j] += request[j];
        need[pid][j] -= request[j];
    }
    int safe_seq[MAX_PROCESSES];
    if (is_safe_state(safe_seq)) {
        printf("Request granted. Safe sequence: ");
        for (int i = 0; i < num_processes; i++) printf("P%d%s", safe_seq[i], i < num_processes-1 ? " -> " : "\n");
        return true;
    }
    for (int j = 0; j < num_resources; j++) {
        available[j] += request[j];
        allocation[pid][j] -= request[j];
        need[pid][j] += request[j];
    }
    printf("Request denied: would cause unsafe state (deadlock risk).\n");
    return false;
}

int main(void) {
    num_processes = 5; num_resources = 3;
    int avail[] = {3, 3, 2};
    int max[][MAX_RESOURCES] = {{7,5,3},{3,2,2},{9,0,2},{2,2,2},{4,3,3}};
    int alloc[][MAX_RESOURCES] = {{0,1,0},{2,0,0},{3,0,2},{2,1,1},{0,0,2}};
    memcpy(available, avail, sizeof(avail));
    memcpy(max_demand, max, sizeof(max));
    memcpy(allocation, alloc, sizeof(alloc));
    calculate_need();
    printf("=== Banker's Algorithm - Deadlock Avoidance ===\n\n");
    int safe_seq[MAX_PROCESSES];
    bool safe = is_safe_state(safe_seq);
    if (safe) {
        printf("System is in SAFE state.\nSafe sequence: ");
        for (int i = 0; i < num_processes; i++) printf("P%d%s", safe_seq[i], i < num_processes-1 ? " -> " : "\n");
    } else {
        printf("System is in UNSAFE state! Deadlock may occur.\n");
    }
    printf("\n--- Testing resource request for P1: {1,0,2} ---\n");
    int request[] = {1, 0, 2};
    bool req_granted = request_resources(1, request);

    /* Write JSON output for backend integration */
    FILE *fp = fopen("output/deadlock.json", "w");
    if (!fp) {
        system("mkdir output 2>nul || mkdir output 2>/dev/null");
        fp = fopen("output/deadlock.json", "w");
    }
    if (fp) {
        fprintf(fp, "{\n  \"is_safe\": %s,\n  \"safe_sequence\": [", safe ? "true" : "false");
        for (int i = 0; i < num_processes; i++) {
            fprintf(fp, "\"P%d\"%s", safe_seq[i], i < num_processes - 1 ? ", " : "");
        }
        fprintf(fp, "],\n  \"request_granted\": %s\n}\n", req_granted ? "true" : "false");
        fclose(fp);
    }
    return 0;
}
