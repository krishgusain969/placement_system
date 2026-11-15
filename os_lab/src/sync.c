
/*
 * Placement Management System - OS Lab
 *
 * Synchronization Demo: Race Condition on Seat Allocation
 *
 * Scenario:
 * Five students compete for the final seat in a job opening.
 *
 * Without a lock:
 * Multiple threads may read the same seat count and update it
 * incorrectly. This is called a race condition.
 *
 * With a mutex or semaphore:
 * Only one thread enters the critical section at a time,
 * preventing incorrect seat allocation.
 *
 * Usage: ./sync
 * Output: output/sync_demo.json
 * Build: make sync
 */

#include <stdio.h>      // Provides printf(), fprintf(), fopen(), fclose()
#include <stdlib.h>     // Provides system() and other utility functions
#include <string.h>     // Provides string-handling functions

#ifdef _WIN32

#include <windows.h>    // Provides Windows threads, locks and Sleep()

/*
 * Windows does not natively use the pthread API.
 * These definitions map the pthread functions used in this
 * program to equivalent Windows thread and lock functions.
 */

// Use a Windows thread handle as pthread_t.
typedef HANDLE pthread_t;

// Use a Windows critical section as a mutex.
typedef CRITICAL_SECTION pthread_mutex_t;

// Initialize the mutex.
static inline int pthread_mutex_init(pthread_mutex_t *m, void *attr) {
    (void)attr;                  // Attribute argument is unused
    InitializeCriticalSection(m);
    return 0;                     // Return success
}

// Lock the mutex before entering the critical section.
static inline int pthread_mutex_lock(pthread_mutex_t *m) {
    EnterCriticalSection(m);
    return 0;
}

// Unlock the mutex after leaving the critical section.
static inline int pthread_mutex_unlock(pthread_mutex_t *m) {
    LeaveCriticalSection(m);
    return 0;
}

// Release resources associated with the mutex.
static inline int pthread_mutex_destroy(pthread_mutex_t *m) {
    DeleteCriticalSection(m);
    return 0;
}

// Create a new thread.
static inline int pthread_create(
    pthread_t *t,
    void *attr,
    void *(*func)(void*),
    void *arg
) {
    (void)attr;   // Thread attributes are unused

    // Start executing the specified thread function.
    *t = CreateThread(NULL, 0, (LPTHREAD_START_ROUTINE)func,
                      arg, 0, NULL);

    // Return 0 if creation succeeded, otherwise -1.
    return (*t != NULL) ? 0 : -1;
}

// Wait until the specified thread finishes execution.
static inline int pthread_join(pthread_t t, void **res) {
    (void)res;    // Thread return value is not used

    WaitForSingleObject(t, INFINITE);
    CloseHandle(t);
    return 0;
}

// Convert microseconds to milliseconds for Windows Sleep().
#define usleep(x) Sleep((x) / 1000 == 0 ? 1 : (x) / 1000)

#else

// POSIX systems, such as Linux, provide pthreads directly.
#include <pthread.h>
#include <unistd.h>     // Provides usleep()

#endif

// File where simulation results will be stored.
#define OUTPUT_FILE "output/sync_demo.json"

// Number of student threads competing for seats.
#define NUM_THREADS 5

// Number of times each experiment will be repeated.
#define SIMULATIONS 100

// Initially, only one job seat is available.
#define INITIAL_SEATS 1


/*
 * GLOBAL VARIABLES WITHOUT A LOCK
 *
 * All threads share this variable.
 * Multiple threads may read and modify it simultaneously,
 * resulting in a race condition.
 */
int seats_unsafe = INITIAL_SEATS;


/*
 * GLOBAL VARIABLES WITH A MUTEX
 *
 * A mutex allows only one thread at a time to access
 * the protected critical section.
 */
int seats_safe = INITIAL_SEATS;

#ifdef _WIN32
// On Windows, initialize the mutex in main().
pthread_mutex_t lock;
#else
// On Linux/POSIX, initialize the mutex statically.
pthread_mutex_t lock = PTHREAD_MUTEX_INITIALIZER;
#endif


/*
 * GLOBAL VARIABLES WITH A BINARY SEMAPHORE-LIKE LOCK
 *
 * seats_sem stores the number of remaining seats.
 * semaphore controls access to the critical section.
 */
int seats_sem = INITIAL_SEATS;

// Used as a spinlock: 0 means unlocked, 1 means locked.
int semaphore = 1;


/*
 * THREAD FUNCTION 1: WITHOUT LOCK
 *
 * Every student thread attempts to reserve a seat.
 * There is no synchronization between threads.
 */
void *apply_unsafe(void *arg) {

    (void)arg;  // Argument is not required

    // Check whether at least one seat is available.
    if (seats_unsafe > 0) {

        // Read the current seat count into a local variable.
        int temp = seats_unsafe;

        // Simulate processing time and allow other threads
        // to run before this thread updates the seat count.
        usleep(100);

        // Update the shared seat count.
        // Another thread may have already changed it.
        seats_unsafe = temp - 1;
    }

    // End this thread.
    return NULL;
}


/*
 * THREAD FUNCTION 2: WITH MUTEX
 *
 * The mutex protects the seat-checking and seat-updating
 * operations as one critical section.
 */
void *apply_safe_mutex(void *arg) {

    (void)arg;  // Argument is not required

    // Acquire the mutex. Other threads must wait here.
    pthread_mutex_lock(&lock);

    // Check the seat count while holding the mutex.
    if (seats_safe > 0) {

        // Read the available seats.
        int temp = seats_safe;

        // Simulate processing while still holding the mutex.
        usleep(100);

        // Update the seat count safely.
        seats_safe = temp - 1;
    }

    // Release the mutex so another thread can enter.
    pthread_mutex_unlock(&lock);

    return NULL;
}


/*
 * THREAD FUNCTION 3: WITH SEMAPHORE-LIKE SPINLOCK
 *
 * Atomic operations are used to ensure that only one thread
 * at a time enters the critical section.
 */
void *apply_safe_semaphore(void *arg) {

    (void)arg;  // Argument is not required

    /*
     * Atomically change semaphore from 0 to 1.
     *
     * If the old value was 0, this thread acquires the lock.
     * If the old value was 1, another thread holds the lock,
     * so this thread keeps waiting in the loop.
     *
     * This is a spinlock, not a standard POSIX semaphore.
     */
    while (__sync_lock_test_and_set(&semaphore, 1));

    // Only the thread holding the lock can check the seats.
    if (seats_sem > 0) {

        // Read the current number of available seats.
        int temp = seats_sem;

        // Simulate processing time.
        usleep(100);

        // Safely update the shared seat count.
        seats_sem = temp - 1;
    }

    // Release the spinlock so another thread can enter.
    __sync_lock_release(&semaphore);

    return NULL;
}


/*
 * RUN EXPERIMENT 1: WITHOUT LOCK
 *
 * Repeat the experiment multiple times.
 * In every simulation:
 * 1. Reset the seat count.
 * 2. Create five student threads.
 * 3. Wait for all threads to finish.
 * 4. Store the final seat count.
 */
void run_unsafe(int *results, int count) {

    for (int i = 0; i < count; i++) {

        // Reset seats before starting a new simulation.
        seats_unsafe = INITIAL_SEATS;

        // Array to store thread identifiers.
        pthread_t threads[NUM_THREADS];

        // Create five threads.
        for (int t = 0; t < NUM_THREADS; t++) {
            pthread_create(&threads[t], NULL,
                           apply_unsafe, NULL);
        }

        // Wait for all five threads to finish.
        for (int t = 0; t < NUM_THREADS; t++) {
            pthread_join(threads[t], NULL);
        }

        // Save the final seat count for this simulation.
        results[i] = seats_unsafe;
    }
}


/*
 * RUN EXPERIMENT 2: WITH MUTEX
 *
 * The procedure is the same as the unsafe experiment,
 * but each thread uses a mutex to protect shared data.
 */
void run_safe_mutex(int *results, int count) {

    for (int i = 0; i < count; i++) {

        // Reset the available seats.
        seats_safe = INITIAL_SEATS;

        pthread_t threads[NUM_THREADS];

        // Create the student threads.
        for (int t = 0; t < NUM_THREADS; t++) {
            pthread_create(&threads[t], NULL,
                           apply_safe_mutex, NULL);
        }

        // Wait for all threads to complete.
        for (int t = 0; t < NUM_THREADS; t++) {
            pthread_join(threads[t], NULL);
        }

        // Store the final seat count.
        results[i] = seats_safe;
    }
}


/*
 * RUN EXPERIMENT 3: WITH SPINLOCK
 *
 * This experiment uses atomic operations for synchronization.
 */
void run_safe_semaphore(int *results, int count) {

    for (int i = 0; i < count; i++) {

        // Reset the available seats.
        seats_sem = INITIAL_SEATS;

        // Initialize the spinlock as unlocked.
        // 0 = unlocked; 1 = locked.
        semaphore = 0;

        pthread_t threads[NUM_THREADS];

        // Create the student threads.
        for (int t = 0; t < NUM_THREADS; t++) {
            pthread_create(&threads[t], NULL,
                           apply_safe_semaphore, NULL);
        }

        // Wait for all threads to finish.
        for (int t = 0; t < NUM_THREADS; t++) {
            pthread_join(threads[t], NULL);
        }

        // Store the final seat count.
        results[i] = seats_sem;
    }
}


/*
 * WRITE RESULTS TO A JSON FILE
 *
 * The function:
 * 1. Opens the output file.
 * 2. Counts simulations where the seat count is negative.
 * 3. Writes experiment results and conclusions as JSON.
 * 4. Closes the file.
 */
void write_json(
    int *unsafe_results,
    int *safe_results,
    int *sem_results,
    int count
) {

    // Open the file in write mode.
    FILE *fp = fopen(OUTPUT_FILE, "w");

    // If opening the file fails, print an error and return.
    if (!fp) {
        perror("Cannot write output");
        return;
    }

    // Counters for negative seat counts in each experiment.
    int unsafe_negative = 0;
    int safe_negative = 0;
    int sem_negative = 0;

    // Count the simulations with negative final seat counts.
    for (int i = 0; i < count; i++) {
        if (unsafe_results[i] < 0)
            unsafe_negative++;

        if (safe_results[i] < 0)
            safe_negative++;

        if (sem_results[i] < 0)
            sem_negative++;
    }

    // Begin the JSON object.
    fprintf(fp, "{\n");

    // Write general simulation information.
    fprintf(fp, "  \"threads\": %d,\n", NUM_THREADS);
    fprintf(fp, "  \"initial_seats\": %d,\n", INITIAL_SEATS);
    fprintf(fp, "  \"simulations\": %d,\n", count);

    // Write results for the experiment without a lock.
    fprintf(fp, "  \"no_lock\": {\n");

    /*
     * This records only the first result twice.
     * It is not the actual minimum and maximum range.
     */
    fprintf(fp, "    \"final_seats_range\": [%d, %d],\n",
            unsafe_results[0], unsafe_results[0]);

    // Number of simulations where the final seat count is negative.
    fprintf(fp, "    \"race_condition_hits\": %d,\n",
            unsafe_negative);

    // Write at most the first ten simulation results.
    fprintf(fp, "    \"results\": [");
    for (int i = 0; i < count && i < 10; i++) {
        if (i > 0)
            fprintf(fp, ", ");

        fprintf(fp, "%d", unsafe_results[i]);
    }
    fprintf(fp, "]\n");

    fprintf(fp, "  },\n");

    // Write results for the mutex experiment.
    fprintf(fp, "  \"with_mutex\": {\n");
    fprintf(fp, "    \"race_condition_hits\": %d,\n",
            safe_negative);

    fprintf(fp, "    \"results\": [");
    for (int i = 0; i < count && i < 10; i++) {
        if (i > 0)
            fprintf(fp, ", ");

        fprintf(fp, "%d", safe_results[i]);
    }
    fprintf(fp, "]\n");

    fprintf(fp, "  },\n");

    // Write results for the spinlock experiment.
    fprintf(fp, "  \"with_semaphore\": {\n");
    fprintf(fp, "    \"race_condition_hits\": %d,\n",
            sem_negative);

    fprintf(fp, "    \"results\": [");
    for (int i = 0; i < count && i < 10; i++) {
        if (i > 0)
            fprintf(fp, ", ");

        fprintf(fp, "%d", sem_results[i]);
    }
    fprintf(fp, "]\n");

    fprintf(fp, "  },\n");

    // Write a human-readable conclusion for each experiment.
    fprintf(fp, "  \"conclusion\": {\n");

    // Calculate the percentage of unsafe simulations
    // that ended with a negative seat count.
    fprintf(fp,
        "    \"no_lock\": \"With %d threads and %d seats, "
        "race condition observed in %d/%d simulations (%.0f%%). "
        "Seats went negative!\",\n",
        NUM_THREADS, INITIAL_SEATS, unsafe_negative, count,
        100.0 * unsafe_negative / count);

    fprintf(fp,
        "    \"with_mutex\": \"Mutex ensures atomic access "
        "- 0 race condition hits.\",\n");

    fprintf(fp,
        "    \"with_semaphore\": \"Semaphore (binary) "
        "also ensures correctness.\"\n");

    // End the JSON object.
    fprintf(fp, "  }\n");
    fprintf(fp, "}\n");

    // Close the file after writing all results.
    fclose(fp);
}


/*
 * MAIN FUNCTION
 *
 * Program execution starts here.
 */
int main() {

#ifdef _WIN32
    // Initialize the Windows mutex before using it.
    pthread_mutex_init(&lock, NULL);
#endif

    // Create the output directory if it does not exist.
    // The command attempts Windows syntax first, then Unix syntax.
    system("mkdir output 2>nul || mkdir -p output 2>/dev/null");

    // Display the experiment details.
    printf("OS Lab - Synchronization Demo\n");
    printf("Scenario: %d students compete for %d seats simultaneously\n",
           NUM_THREADS, INITIAL_SEATS);
    printf("Running %d simulations...\n\n", SIMULATIONS);

    // Arrays store the results of all 100 simulations.
    int unsafe_results[SIMULATIONS];
    int safe_results[SIMULATIONS];
    int sem_results[SIMULATIONS];


    /*
     * EXPERIMENT 1: WITHOUT LOCK
     */
    printf("1. Running WITHOUT lock (demonstrating race condition)...\n");

    // Execute all unsafe simulations.
    run_unsafe(unsafe_results, SIMULATIONS);

    // Count negative seat counts.
    int unsafe_failures = 0;
    for (int i = 0; i < SIMULATIONS; i++) {
        if (unsafe_results[i] < 0)
            unsafe_failures++;
    }

    // Display the number and percentage of failures.
    printf("   Race condition occurred in %d/%d simulations (%.0f%%)\n",
           unsafe_failures, SIMULATIONS,
           100.0 * unsafe_failures / SIMULATIONS);

    // Print the first ten final seat counts.
    printf("   Sample results (first 10): ");
    for (int i = 0; i < 10; i++) {
        printf("%d ", unsafe_results[i]);
    }
    printf("\n");


    /*
     * EXPERIMENT 2: WITH MUTEX
     */
    printf("\n2. Running WITH mutex lock (correct behavior)...\n");

    // Execute all mutex-protected simulations.
    run_safe_mutex(safe_results, SIMULATIONS);

    // Count negative seat counts.
    int safe_failures = 0;
    for (int i = 0; i < SIMULATIONS; i++) {
        if (safe_results[i] < 0)
            safe_failures++;
    }

    // Display the number and percentage of failures.
    printf("   Race condition occurred in %d/%d simulations (%.0f%%)\n",
           safe_failures, SIMULATIONS,
           100.0 * safe_failures / SIMULATIONS);

    // Print the first ten results.
    printf("   Sample results (first 10): ");
    for (int i = 0; i < 10; i++) {
        printf("%d ", safe_results[i]);
    }
    printf("\n");


    /*
     * EXPERIMENT 3: WITH SPINLOCK
     */
    printf("\n3. Running WITH semaphore (correct behavior)...\n");

    // Execute all spinlock-protected simulations.
    run_safe_semaphore(sem_results, SIMULATIONS);

    // Count negative seat counts.
    int sem_failures = 0;
    for (int i = 0; i < SIMULATIONS; i++) {
        if (sem_results[i] < 0)
            sem_failures++;
    }

    // Display the number and percentage of failures.
    printf("   Race condition occurred in %d/%d simulations (%.0f%%)\n",
           sem_failures, SIMULATIONS,
           100.0 * sem_failures / SIMULATIONS);

    // Save the results of all three experiments to JSON.
    write_json(unsafe_results, safe_results, sem_results,
               SIMULATIONS);

    // Inform the user where the results were saved.
    printf("\nResults written to %s\n", OUTPUT_FILE);

#ifdef _WIN32
    // Destroy the mutex and release its resources on Windows.
    pthread_mutex_destroy(&lock);
#endif

    // Return 0 to indicate successful program execution.
    return 0;
}
