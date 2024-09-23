ARG BASE_IMAGE=base
FROM ${BASE_IMAGE} as integration

COPY apps/relayer /project/apps/relayer
# Build api
RUN npx turbo run build --filter=relayer...
# Lint api
RUN npx turbo run lint --filter=relayer...
# Test api
RUN npx turbo run test --filter=relayer...
# Production build
RUN pnpm --filter=relayer deploy --prod /artifacts


FROM axelarnet/axelar-core:v1.0.2 as release
USER root
RUN apk add --update nodejs npm
USER axelard

ENV NODE_ENV=production
WORKDIR /app
COPY /apps/relayer/assets/wallet.info /home/axelard/.axelar/keyring-test/wallet.info
COPY --from=integration /artifacts/dist /app/dist
COPY --from=integration /artifacts/node_modules /app/node_modules
CMD [ "node /app/dist/src/main" ]
