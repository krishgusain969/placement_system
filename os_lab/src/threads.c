/*
 * threads.c - POSIX Threads Demonstration
 * OS Lab - Placement Management System Project
 */
#include <stdio.h>
#include <stdlib.h>
#include <pthread.h>
#include <unistd.h>

#define NUM_THREADS 5
#define NUM_ITERATIONS 3

int shared_counter = 0;
pthread_mutex_t counter_mutex = PTHREAD_MUTEX_INITIALIZER;

typedef struct {
    int thread_id;
    int iterations;
} ThreadArgs;

void *thread_worker(void *arg) {
    ThreadArgs *args = (ThreadArgs *)arg;
    for (int i = 0; i < args->iterations; i++) {
        pthread_mutex_lock(&counter_mutex);
        shared_counter++;
        printf("[Thread %d] Iteration %d: counter = %d\n", args->thread_id, i + 1, shared_counter);
        pthread_mutex_unlock(&counter_mutex);
        usleep(100000);
    }
    printf("[Thread %d] Done.\n", args->thread_id);
    return NULL;
}

int main(void) {
    pthread_t threads[NUM_THREADS];
    ThreadArgs args[NUM_THREADS];
    printf("=== POSIX Threads Demo ===\n");
    for (int i = 0; i < NUM_THREADS; i++) {
        args[i].thread_id = i + 1;
        args[i].iterations = NUM_ITERATIONS;
        if (pthread_create(&threads[i], NULL, thread_worker, &args[i]) != 0) {
            perror("pthread_create failed");
            exit(EXIT_FAILURE);
        }
    }
    for (int i = 0; i < NUM_THREADS; i++) pthread_join(threads[i], NULL);
    pthread_mutex_destroy(&counter_mutex);
    printf("Final counter: %d\n", shared_counter);
    return 0;
}
