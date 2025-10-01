#!/bin/bash

echo "Starting Blue Road EHP Calculator..."
echo ""

# Kill any existing servers
echo "Cleaning up old processes..."
pkill -f "http.server" 2>/dev/null
pkill -f "node.*server.js" 2>/dev/null
sleep 1

# Start backend
echo "Starting backend server..."
cd server
npm run dev &
BACKEND_PID=$!
cd ..

# Wait for backend
sleep 3

# Start frontend
echo "Starting frontend..."
./webserver.sh &
FRONTEND_PID=$!

echo ""
echo "Both servers started!"
echo "Press Ctrl+C to stop everything"
echo ""

# Cleanup
trap "echo ''; echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; pkill -f 'http.server' 2>/dev/null; exit" INT TERM

wait