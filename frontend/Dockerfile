# Build stage
FROM node:20-alpine AS builder

WORKDIR /monorepo

# Context is now project root. These files are at the root.
COPY package.json package-lock.json ./

# Copy the frontend's package.json into its place within the monorepo structure
# Path is relative to the project root context.
COPY frontend/package.json ./frontend/package.json

# Install dependencies for ONLY the frontend workspace using the root lockfile
RUN npm ci --workspace=frontend

# Copy the rest of the frontend's source code into its place
# Path is relative to the project root context.
COPY frontend/ ./frontend/

# Now, set the working directory to the frontend workspace to run its build script
WORKDIR /monorepo/frontend
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets from the frontend workspace's dist directory in the builder stage
COPY --from=builder /monorepo/frontend/dist /usr/share/nginx/html

# Copy nginx configuration. Path is relative to project root context.
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 3000

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 