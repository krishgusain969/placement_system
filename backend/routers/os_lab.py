"""
OS Lab router: exposes results from the C OS module.
The C programs write JSON output to /os_lab/output/,
this router reads and returns it.
"""
import os
import json
from fastapi import APIRouter, HTTPException
from sqlalchemy import text
from backend.database import get_db

router = APIRouter()

OUTPUT_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    "os_lab",
    "output",
)


def _get_binary(name: str) -> str:
    """Find binary supporting both POSIX and Windows .exe extensions."""
    base = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
        "os_lab",
        "bin",
        name,
    )
    if os.path.exists(base):
        return base
    if os.path.exists(base + ".exe"):
        return base + ".exe"
    return base


def _read_output(filename: str) -> dict:
    """Read JSON output from a C OS module run."""
    filepath = os.path.join(OUTPUT_DIR, filename)
    if not os.path.exists(filepath):
        raise HTTPException(
            status_code=404,
            detail=f"Output not found. Run the C program first: {filename}",
        )
    with open(filepath) as f:
        return json.load(f)


@router.get("/schedule")
def get_schedule(algo: str = "fcfs", time_quantum: int = 4):
    """Trigger C scheduler and return results.

    The C program reads /os_lab/input/queue.txt and writes /os_lab/output/schedule.json
    """
    input_dir = os.path.join(OUTPUT_DIR, "..", "input")
    os.makedirs(input_dir, exist_ok=True)
    output_dir = OUTPUT_DIR
    os.makedirs(output_dir, exist_ok=True)

    # Run the C scheduler binary
    binary = _get_binary("scheduler")

    if os.path.exists(binary):
        import subprocess
        result = subprocess.run(
            [binary, algo, str(time_quantum)],
            capture_output=True,
            text=True,
            timeout=10,
        )
        if result.returncode != 0:
            raise HTTPException(500, detail=result.stderr)

        return _read_output("schedule.json")

    # If binary not built yet, return placeholder
    return {
        "error": "C scheduler not built yet",
        "build_instructions": "Compile: make scheduler",
        "algo": algo,
        "time_quantum": time_quantum,
    }


@router.get("/sync-demo")
def sync_demo():
    """Run the synchronization demo (race condition).

    The C program writes /os_lab/output/sync_demo.json showing seats before/after lock.
    """
    binary = _get_binary("sync")

    if os.path.exists(binary):
        import subprocess
        subprocess.run([binary], capture_output=True, text=True, timeout=10)
        return _read_output("sync_demo.json")

    return {"error": "C sync demo not built yet", "build_instructions": "make sync"}


@router.get("/deadlock")
def deadlock_check():
    """Run deadlock detection.

    The C program writes /os_lab/output/deadlock.json with the wait-for graph
    and cycle detection result.
    """
    binary = _get_binary("deadlock")

    if os.path.exists(binary):
        import subprocess
        subprocess.run([binary], capture_output=True, text=True, timeout=10)
        return _read_output("deadlock.json")

    return {"error": "C deadlock detector not built yet", "build_instructions": "make deadlock"}


@router.get("/concurrent-test")
def concurrent_test(seats: int = 5, applicants: int = 50):
    """Fire concurrent applications and report how many succeeded.

    Uses the C thread pool to safely serialize seat allocation.
    """
    binary = _get_binary("concurrent")

    if os.path.exists(binary):
        import subprocess
        result = subprocess.run(
            [binary, str(seats), str(applicants)],
            capture_output=True,
            text=True,
            timeout=15,
        )
        if result.returncode != 0:
            raise HTTPException(500, detail=result.stderr)
        return _read_output("concurrent.json")

    return {
        "error": "C concurrent test not built yet",
        "build_instructions": "make concurrent",
    }
