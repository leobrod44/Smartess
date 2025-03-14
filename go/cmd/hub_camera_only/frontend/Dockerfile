# # Use the Nginx base image to serve static files
# FROM nginx:alpine

# # Copy the frontend code into the container
# COPY . /usr/share/nginx/html

# # Expose port 80 to serve the frontend via HTTP
# EXPOSE 80

# Step 1: Build the Next.js app
FROM node:18-alpine AS build

WORKDIR /app

COPY test-video/package.json test-video/package-lock.json ./

RUN npm install --frozen-lockfile

COPY test-video ./

RUN npm run build

# Step 2: Run Next.js Server
FROM node:18-alpine

WORKDIR /app

COPY --from=build /app ./

EXPOSE 3000

CMD ["npm", "run", "start"]