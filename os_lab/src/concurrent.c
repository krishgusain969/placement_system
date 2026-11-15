/*
 * concurrent.c - Concurrency & Synchronization Demo
 * OS Lab - Placement Management System Project
 *
 * Demonstrates: Producer-Consumer problem using semaphores
 */
#include <stdio.h>
#include <stdlib.h>
#include <pthread.h>
#include <semaphore.h>
#include <unistd.h>

#define BUFFER_SIZE 5
#define NUM_ITEMS   10

int buffer[BUFFER_SIZE];
int in = 0, out = 0;

sem_t empty_slots;   /* counts empty slots */
sem_t full_slots;    /* counts full slots  */
pthread_mutex_t mutex = PTHREAD_MUTEX_INITIALIZER;

int items_produced = 0;
int items_consumed = 0;

void *producer(void *arg) {
    for (int i = 1; i <= NUM_ITEMS; i++) {
        sem_wait(&empty_slots);
        pthread_mutex_lock(&mutex);

        buffer[in] = i;
        printf("[Producer] Produced item %d at slot %d\n", i, in);
        in = (in + 1) % BUFFER_SIZE;
        items_produced++;

        pthread_mutex_unlock(&mutex);
        sem_post(&full_slots);
        usleep(150000);
    }
    return NULL;
}

void *consumer(void *arg) {
    for (int i = 1; i <= NUM_ITEMS; i++) {
        sem_wait(&full_slots);
        pthread_mutex_lock(&mutex);

        int item = buffer[out];
        printf("[Consumer] Consumed item %d from slot %d\n", item, out);
        out = (out + 1) % BUFFER_SIZE;
        items_consumed++;

        pthread_mutex_unlock(&mutex);
        sem_post(&empty_slots);
        usleep(250000);
    }
    return NULL;
}

int main(void) {
    pthread_t prod_thread, cons_thread;

    sem_init(&empty_slots, 0, BUFFER_SIZE);
    sem_init(&full_slots, 0, 0);

    printf("=== Producer-Consumer Problem (Semaphores) ===\n");
    printf("Buffer size: %d | Items to produce: %d\n\n", BUFFER_SIZE, NUM_ITEMS);

    pthread_create(&prod_thread, NULL, producer, NULL);
    pthread_create(&cons_thread, NULL, consumer, NULL);

    pthread_join(prod_thread, NULL);
    pthread_join(cons_thread, NULL);

    sem_destroy(&empty_slots);
    sem_destroy(&full_slots);
    pthread_mutex_destroy(&mutex);

    printf("\n=== Summary ===\n");
    printf("Items produced: %d\nItems consumed: %d\n", items_produced, items_consumed);
    printf("No race condition: %s\n", (items_produced == items_consumed) ? "YES" : "NO");

    return 0;
}
