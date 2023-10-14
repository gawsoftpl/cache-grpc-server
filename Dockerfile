FROM node:20.5-alpine3.18 as builder

WORKDIR /project

ARG ENV

COPY package.json .

RUN if [[ "$ENV" == "dev" ]] ; then \
        echo "INSTALL development environment" ; \
        yarn install ; \
    else  \
        yarn install --production ; \
    fi

COPY . .

RUN yarn build

USER node

FROM node:20.5-alpine3.18 as deploy

WORKDIR /project

# Download GRPC healthcheck
RUN GRPC_HEALTH_PROBE_VERSION=v0.4.6  \
    && wget -qO/bin/grpc_health_probe https://github.com/grpc-ecosystem/grpc-health-probe/releases/download/${GRPC_HEALTH_PROBE_VERSION}/grpc_health_probe-linux-amd64 \
    && chmod +x /bin/grpc_health_probe

# Copy data from builder
COPY --from=builder /project/ /project/

EXPOSE 3000

USER node

CMD [ "yarn", "start" ]
