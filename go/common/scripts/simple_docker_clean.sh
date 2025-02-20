# Remove unused Docker images, containers, and volumes
docker system prune -af

# Remove all unused Docker volumes (use carefully as this can delete persistent data)
docker volume prune -f

# Clean up the build cache
docker builder prune -af
