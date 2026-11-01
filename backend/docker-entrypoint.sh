#!/bin/sh
set -e

# Read Docker secrets and export them as environment variables for Spring Boot.
# Each Swarm stack mounts its own environment-specific secrets under generic
# names such as /run/secrets/db_password.
if [ -f /run/secrets/db_password ]; then
  DB_PASSWORD="$(cat /run/secrets/db_password)"
  export DB_PASSWORD
  export SPRING_DATASOURCE_PASSWORD="$DB_PASSWORD"
fi
if [ -f /run/secrets/jwt_secret ]; then
  export JWT_SECRET="$(cat /run/secrets/jwt_secret)"
fi
if [ -f /run/secrets/mail_username ]; then
  export MAIL_USERNAME="$(cat /run/secrets/mail_username)"
fi
if [ -f /run/secrets/mail_password ]; then
  export MAIL_PASSWORD="$(cat /run/secrets/mail_password)"
fi
if [ -f /run/secrets/admin_email ]; then
  export ADMIN_EMAIL="$(cat /run/secrets/admin_email)"
fi
if [ -f /run/secrets/admin_password ]; then
  export ADMIN_PASSWORD="$(cat /run/secrets/admin_password)"
fi
if [ -f /run/secrets/cloudinary_cloud_name ]; then
  export CLOUDINARY_CLOUD_NAME="$(cat /run/secrets/cloudinary_cloud_name)"
fi
if [ -f /run/secrets/cloudinary_api_key ]; then
  export CLOUDINARY_API_KEY="$(cat /run/secrets/cloudinary_api_key)"
fi
if [ -f /run/secrets/cloudinary_api_secret ]; then
  export CLOUDINARY_API_SECRET="$(cat /run/secrets/cloudinary_api_secret)"
fi

exec "$@"
