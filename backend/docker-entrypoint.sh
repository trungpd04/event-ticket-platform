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

# Disable real SMTP auto-configuration when MAIL_ENABLED is not "true".
# Spring Boot only creates a real JavaMailSender when spring.mail.host is set.
if [ "${MAIL_ENABLED}" != "true" ]; then
  export SPRING_MAIL_HOST=""
fi

# Wait for PostgreSQL to be reachable before starting the application.
# This avoids JVM DNS caching failed resolutions during Swarm startup.
if [ -n "${SPRING_DATASOURCE_URL}" ]; then
  DB_HOST=$(echo "$SPRING_DATASOURCE_URL" | sed -n 's|jdbc:postgresql://\([^:]*\):[0-9]*/.*|\1|p')
  DB_PORT=$(echo "$SPRING_DATASOURCE_URL" | sed -n 's|jdbc:postgresql://[^:]*:\([0-9]*\)/.*|\1|p')

  if [ -n "$DB_HOST" ] && [ -n "$DB_PORT" ]; then
    echo "Waiting for PostgreSQL at $DB_HOST:$DB_PORT ..."
    for i in $(seq 1 60); do
      if nc -z "$DB_HOST" "$DB_PORT" 2>/dev/null; then
        echo "PostgreSQL is available at $DB_HOST:$DB_PORT"
        break
      fi
      echo "PostgreSQL not ready yet (attempt $i/60), retrying in 2s ..."
      sleep 2
    done
  fi
fi

exec "$@"
