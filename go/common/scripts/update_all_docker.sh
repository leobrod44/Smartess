#!/bin/bash

# Run chmod +x "./go/common/scripts/update_all_docker.sh"
# in MINGW64/MSYS2/UNIX/LINUX terminal to make the script executable

directories=(
    "$PROJECT_ROOT"                      # Root of the project
    "$PROJECT_ROOT/go/cmd/mock_mongo_server"   # mock_mongo_server directory
    "$PROJECT_ROOT/go/cmd/hub"            # hub directory
)
PROJECT_ROOT=$(dirname "$(realpath "$0")")/../../..
# Loop through each directory and run the Docker Compose commands
for dir in "${directories[@]}"; do
    echo "Project root: $PROJECT_ROOT"
    echo "Running Docker Compose commands in directory: $dir"

    cd "$dir" || exit

    docker-compose pull
    docker-compose build --no-cache
    docker-compose up -d --force-recreate

    echo "Completed Docker Compose commands in directory: $dir"

    cd - || exit
done
