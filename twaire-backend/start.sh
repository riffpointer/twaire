#!/bin/bash
# This script starts the MongoDB database and the backend server.

echo "Starting MongoDB..."
./scripts/start_mongod.sh &

echo "Starting backend server with nodemon..."
nodemon index.js