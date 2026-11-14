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
# Swarm may start the backend before the database service has a DNS entry,
# and the JVM caches failed DNS resolutions. Retry for up to 5 minutes.
if [ -n "${SPRING_DATASOURCE_URL}" ]; then
  DB_HOST=$(echo "$SPRING_DATASOURCE_URL" | sed -n 's|jdbc:postgresql://\([^:/]*\).*|\1|p')
  DB_PORT=$(echo "$SPRING_DATASOURCE_URL" | sed -n 's|jdbc:postgresql://[^:/]*:\([0-9]*\).*|\1|p')
  DB_PORT="${DB_PORT:-5432}"

  if [ -n "$DB_HOST" ]; then
    echo "Waiting for PostgreSQL at $DB_HOST:$DB_PORT ..."
    attempts=0
    max_attempts=150
    until nc -z "$DB_HOST" "$DB_PORT" 2>/dev/null; do
      attempts=$((attempts + 1))
      if [ "$attempts" -ge "$max_attempts" ]; then
        echo "PostgreSQL did not become ready after $max_attempts attempts; starting anyway so Swarm can restart the task."
        break
      fi
      # Log every 10 attempts (20s) to avoid flooding the logs.
      if [ $((attempts % 10)) -eq 0 ]; then
        echo "Still waiting for PostgreSQL at $DB_HOST:$DB_PORT (attempt $attempts/$max_attempts) ..."
      fi
      sleep 2
    done
    if nc -z "$DB_HOST" "$DB_PORT" 2>/dev/null; then
      echo "PostgreSQL is available at $DB_HOST:$DB_PORT"
    fi
  fi
fi

exec "$@"
