#!/bin/bash
# Netlify Build Debug Script

echo "=== Build Debug Information ==="
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "Current directory: $(pwd)"
echo "Environment: $NODE_ENV"

echo "=== Package.json check ==="
if [ -f "package.json" ]; then
    echo "✓ package.json exists"
    echo "Dependencies:"
    npm list --depth=0 2>/dev/null || echo "Dependencies not installed yet"
else
    echo "✗ package.json missing"
    exit 1
fi

echo "=== Installing dependencies ==="
npm install --verbose

echo "=== Checking Vite installation ==="
if command -v vite &> /dev/null; then
    echo "✓ Vite command available"
    vite --version
else
    echo "✗ Vite command not found"
    echo "Checking node_modules:"
    ls -la node_modules/.bin/ | grep vite || echo "Vite not in node_modules/.bin"
fi

echo "=== Running build ==="
npm run build
