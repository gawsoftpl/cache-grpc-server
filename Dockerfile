FROM node:20.5-alpine3.18 as builder

WORKDIR /project

ARG ENV

COPY package.json .

RUN yarn install

COPY . .

RUN yarn build

USER node

FROM node:20.5-alpine3.18 as deploy

# Download GRPC healthcheck
RUN GRPC_HEALTH_PROBE_VERSION=v0.4.6  \
    && wget -qO/bin/grpc_health_probe https://github.com/grpc-ecosystem/grpc-health-probe/releases/download/${GRPC_HEALTH_PROBE_VERSION}/grpc_health_probe-linux-amd64 \
    && chmod +x /bin/grpc_health_probe

USER node

WORKDIR /project

COPY package.json /project/package.json
COPY protos /project/protos

RUN yarn install --production

# Copy data from builder
COPY --chown=node:node --from=builder /project/dist /project/dist

EXPOSE 3000

CMD [ "node", "/project/dist/main" ]
