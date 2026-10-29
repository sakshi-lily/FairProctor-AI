# Python base image
FROM python:3.13-slim

# Working directory
WORKDIR /app

# Copy dependencies
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt \
    && pip install --no-cache-dir "uvicorn[standard]"

# Copy project files
COPY . .

# Python source path
ENV PYTHONPATH=/app/src

# API port
EXPOSE 8000

# Start FastAPI
CMD ["python", "-m", "uvicorn", "fairproctor.api.service:create_app", "--factory", "--host", "0.0.0.0", "--port", "8000"]
