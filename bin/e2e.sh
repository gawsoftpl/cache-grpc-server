#!/usr/bin/env sh
docker-compose -f docker-compose.test.yaml up -d
sleep 5
yarn test:e2e:start