#!/bin/bash

# Define directories relative to the script's location
PROJECT_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)
directories=(
    "$PROJECT_ROOT"                      # Root of the project
    "$PROJECT_ROOT/go/cmd/mock_mongo_server"   # mock_mongo_server directory
    "$PROJECT_ROOT/go/cmd/hub"            # hub directory
    "$PROJECT_ROOT/go/cmd/mockhub"        # mockhub directory
)

# Loop through each directory and run Docker Compose commands
for dir in "${directories[@]}"; do
    echo "Project root: $PROJECT_ROOT"
    echo "Running Docker Compose commands in directory: $dir"

    # Check if directory exists
    if [[ -d "$dir" ]]; then
        cd "$dir" || exit 1

        if [[ -f "docker-compose.yml" || -f "docker-compose.yaml" ]]; then
            # Run the Docker Compose commands
            docker-compose pull
            docker-compose build --no-cache
            docker-compose up -d --force-recreate

            echo "Completed Docker Compose commands in directory: $dir"
        else
            echo "No docker-compose.yml found in directory: $dir. Skipping."
        fi
    else
        echo "Directory does not exist: $dir. Skipping."
    fi

    # Return to the previous directory
    cd - >/dev/null || exit
done

echo "All tasks completed."
