#!/bin/bash

docker compose \
--env-file ../.env \
-f ../compose/base/docker-compose.yml \
up -d