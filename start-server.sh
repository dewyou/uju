#!/bin/bash
# Quick start script for UJU Foreal backend server

echo "Starting UJU Foreal backend server..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  Warning: .env file not found!"
    echo "Creating .env file with default values..."
    echo "OPENAI_API_KEY=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" > .env
    echo "PORT=3000" >> .env
    echo "✅ Created .env file"
    echo ""
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "Installing dependencies..."
    npm install
    echo ""
fi

echo "Starting server on http://localhost:3000"
echo "Press Ctrl+C to stop"
echo ""
npm start

