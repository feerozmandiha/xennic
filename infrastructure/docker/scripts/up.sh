#!/bin/bash

docker compose \
<<<<<<< HEAD
--env-file ../.env \
-f ../compose/base/docker-compose.yml \
=======
--env-file .env \
-f infrastructure/docker/compose/base/docker-compose.yml \
>>>>>>> 224dcab25526dff14bfe3eb02e4a18e7cb25853a
up -d