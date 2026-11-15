FROM python:3.11-slim

# Install system dependencies (build-essential/gcc/make for C OS Lab binaries)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    default-mysql-client \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python requirements
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

# Copy source code
COPY backend /app/backend
COPY os_lab /app/os_lab

# Compile the C OS Lab binaries
WORKDIR /app/os_lab
RUN make clean || true
RUN make all

# Reset working directory back to backend for running FastAPI
WORKDIR /app/backend

# Environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
