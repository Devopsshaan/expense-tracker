# Use a minimal Python base image
FROM python:3.12-slim

# Install required system packages and clean up to reduce image size
RUN apt update && apt install -y curl && rm -rf /var/lib/apt/lists/*

# Add metadata labels (useful for image inspection or CI pipelines)
LABEL app.expense.part="backend"
LABEL app.expense.version="1.0.0"

# Set the working directory inside the container
WORKDIR /app

# Copy only the dependency file first to leverage Docker layer caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the actual application source code
COPY app/ app/

# Expose the port the application will run on
EXPOSE 5000

# Define the default command to start the app
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "5000"]
