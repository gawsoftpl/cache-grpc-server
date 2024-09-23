#!/usr/bin/env sh
docker-compose -f docker-compose.test.yaml up -d
sleep 15
yarn test:e2e:start && docker-compose -f docker-compose.test.yaml down
