FROM node:20.9.0 as base
WORKDIR /project
# Install pnpm
RUN npm install -g pnpm@9.7.0
# Install package and app dependencies
COPY ["package.json", "pnpm-lock.yaml", "pnpm-workspace.yaml", "./"]
COPY "apps/web/package.json" "./apps/web/package.json"
COPY packages /project/packages
COPY scripts /project/scripts
RUN pnpm install
COPY ["turbo.json", ".prettierrc", ".prettierrc", "./"]
# Run dist packages
RUN pnpm run dist
# Run linting
RUN pnpm run lint:packages
# Run testing
# RUN pnpm run test:packages

