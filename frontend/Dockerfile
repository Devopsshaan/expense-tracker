# --- Stage 1: Build the frontend with Vite ---
FROM node:23 AS builder

# Optional: pass base API URL at build time
ARG VITE_API_BASE_URL

# Set working directory
WORKDIR /app

# Copy and install dependencies (lockfile ensures reproducibility)
COPY package.json package-lock.json .
RUN npm install --frozen-lockfile

# Copy the rest of the source code
COPY . .

# Build the static frontend assets
RUN npm run build

# --- Stage 2: Serve with Nginx (minimal Alpine image) ---
FROM nginx:alpine

# Add metadata labels
LABEL app.expense.part="frontend"
LABEL app.expense.version="1.0.0"

# Expose default HTTP port
EXPOSE 80

# Copy built frontend from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Use custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf