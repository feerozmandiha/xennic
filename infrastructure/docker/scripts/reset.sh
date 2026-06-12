#!/bin/bash

docker compose \
--env-file .env \
-f infrastructure/docker/compose/base/docker-compose.yml \
down -v

docker volume prune -f