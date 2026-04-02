#!/bin/bash

# TalentTalk Development Startup Script
# Starts both Flask backend and Vite frontend

echo "🚀 Starting TalentTalk Development Environment..."

# Check if backend dependencies are installed
if ! python -c "import flask" 2>/dev/null; then
    echo "📦 Installing backend dependencies..."
    cd backend
    pip install -r requirements.txt
    cd ..
fi

# Start backend in background
echo "🔄 Starting Flask backend on http://127.0.0.1:5000..."
cd backend
python app.py &
BACKEND_PID=$!
cd ..

# Give backend time to start
sleep 2

# Start frontend
echo "⚡ Starting Vite frontend on http://localhost:5173..."
npm run dev

# Cleanup: Kill backend when frontend stops
kill $BACKEND_PID 2>/dev/null
