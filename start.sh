#!/bin/bash
# This script starts the backend and frontend services.

echo "Starting backend..."
(cd twaire-backend && ./start.sh) &

echo "Starting frontend..."
(cd twaire-frontend && ./start.sh) &

echo "Twaire applications started."