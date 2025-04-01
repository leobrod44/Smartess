DOCKER_BUILDKIT=1 docker-compose build --progress=plain | tee build.log
grep -E '^\#.*DONE|RUN ' build.log | grep -B 1 'DONE' | awk 'NR%2{printf "%s ", $0; next}1'
#grep "RUN" build.log | awk '{print $2, $3, $4}'

docker-compose up -d --force-recreate && docker ps --format "table {{.Names}}\t{{.Status}}"
docker-compose logs -t | grep -E 'Starting|Created'

docker stats
docker compose --profile debug up

#docker-compose up --build -d specificservice

#TODO: docker build --cache-from=myapp:latest -t myapp .