#!/bin/bash
# Quick start script for UJU Foreal backend server

echo "Starting UJU Foreal backend server..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  Warning: .env file not found!"
    echo ""
    echo "Please create a .env file with your OpenAI API key:"
    echo "  1. Copy the example: cp .env.example .env"
    echo "  2. Edit .env and add your actual API key"
    echo "  3. Run this script again"
    echo ""
    echo "Example .env file contents:"
    echo "  OPENAI_API_KEY=your_openai_api_key_here"
    echo "  PORT=3000"
    echo ""
    exit 1
fi

# Verify that API key is set (not just placeholder)
if grep -q "your_openai_api_key_here\|your_key_here" .env 2>/dev/null; then
    echo "⚠️  Warning: .env file contains placeholder API key!"
    echo "Please edit .env and add your actual OpenAI API key"
    echo ""
    exit 1
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

