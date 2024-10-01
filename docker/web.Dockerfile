ARG BASE_IMAGE=base
FROM ${BASE_IMAGE} as integration

# Config env vars
ARG AWS_REGION="eu-west-1"
ENV AWS_REGION=$AWS_REGION
ARG AWS_ACCESS_KEY_ID="AKIAUH43WJUPDRHFTFRW"
ENV AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID
ARG AWS_SECRET_ACCESS_KEY="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"
ENV AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY
ARG APP_CONFIG_IDENTIFIER="i2064wd"
ENV APP_CONFIG_IDENTIFIER=$APP_CONFIG_IDENTIFIER
ARG APP_CONFIG_PROFILE_IDENTIFIER="ub9h0lc"
ENV APP_CONFIG_PROFILE_IDENTIFIER=$APP_CONFIG_PROFILE_IDENTIFIER
ARG APP_CONFIG_ENVIRONMENT_IDENTIFIER="v40zhmn"
ENV APP_CONFIG_ENVIRONMENT_IDENTIFIER=$APP_CONFIG_ENVIRONMENT_IDENTIFIER

COPY apps/web /project/apps/web
# Build api
RUN npx turbo run build --filter=web...
# Lint api
# RUN npx turbo run lint --filter=web...
# Test api
# RUN npx turbo run test --filter=web...
# Config env vars
RUN pnpm --filter=web deploy --prod /artifacts


FROM nginx:latest as release
COPY --from=integration /artifacts/dist /usr/share/nginx/html/
COPY <<EOF /etc/nginx/templates/default.conf.template
server {
    listen       80;
    listen  [::]:80;
    server_name  localhost;
    location / {
        root   /usr/share/nginx/html;
        try_files \$uri \$uri/ /index.html;
    }
}
EOF
