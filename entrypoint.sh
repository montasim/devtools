#!/bin/sh
set -e

# Docker container entrypoint script for Next.js SaaS Starter
# This script handles startup tasks and signal forwarding

echo "Starting Next.js SaaS Starter..."

# Print environment information (for debugging)
echo "Node version: $(node --version)"
echo "pnpm version: $(pnpm --version)"
echo "Environment: ${NODE_ENV:-development}"

# Handle SIGTERM and SIGINT signals for graceful shutdown
# This allows the Next.js server to shut down cleanly
_term() {
  echo "Caught signal, shutting down gracefully..."
  if [ -n "$pid" ]; then
    kill -TERM "$pid" 2>/dev/null
    wait "$pid" 2>/dev/null
  fi
  exit 0
}

trap _term SIGTERM SIGINT

# If the first argument is a command, execute it
# Otherwise, start the default Next.js server
if [ "${1#-}" != "$1" ]; then
  # Arguments start with a dash, pass them to node
  exec node "$@"
elif [ -n "$1" ]; then
  # Custom command provided
  exec "$@"
else
  # Default: start the Next.js production server
  echo "Starting Next.js server..."
  # Run node in background to trap signals
  node server.js &
  pid=$!

  # Wait for the process to finish
  wait $pid
fi
