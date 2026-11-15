CC = gcc
CFLAGS = -Wall -Wextra -O2

ifeq ($(OS),Windows_NT)
    BIN_EXT = .exe
    LDFLAGS =
else
    BIN_EXT =
    LDFLAGS = -lpthread
endif

BIN_DIR = bin
SRC_DIR = src
OUTPUT_DIR = output
INPUT_DIR = input

BINARIES := scheduler sync deadlock

.PHONY: all clean $(BINARIES)

all: $(foreach b,$(BINARIES),$(BIN_DIR)/$(b)$(BIN_EXT))

scheduler: $(BIN_DIR)/scheduler$(BIN_EXT)
sync: $(BIN_DIR)/sync$(BIN_EXT)
deadlock: $(BIN_DIR)/deadlock$(BIN_EXT)

$(BIN_DIR)/scheduler$(BIN_EXT): $(SRC_DIR)/scheduler.c
	$(CC) $(CFLAGS) -o $@ $^ $(LDFLAGS)

$(BIN_DIR)/sync$(BIN_EXT): $(SRC_DIR)/sync.c
	$(CC) $(CFLAGS) -o $@ $^ $(LDFLAGS)

$(BIN_DIR)/deadlock$(BIN_EXT): $(SRC_DIR)/deadlock.c
	$(CC) $(CFLAGS) -o $@ $^ $(LDFLAGS)

clean:
ifeq ($(OS),Windows_NT)
	-cmd /c "del /Q $(BIN_DIR)\*"
else
	rm -f $(BIN_DIR)/*
endif
