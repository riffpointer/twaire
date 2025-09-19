#!/bin/bash
# This script starts the MongoDB server.
# IMPORTANT: You may need to adjust the --dbpath to your local MongoDB data directory.
# You might also need to create the directory if it doesn't exist.
# For example: mkdir -p ~/mongodb/data/db
mongod --dbpath ~/mongodb/data/db