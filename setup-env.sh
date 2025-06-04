#!/bin/bash

echo "🔧 Setting up FyloCore environment files..."
echo ""

# Copy environment templates
if [ ! -f "core-server/.env" ]; then
    if [ -f "core-server/.env.example" ]; then
        cp core-server/.env.example core-server/.env
        echo "✅ Created core-server/.env from template"
    else
        echo "❌ core-server/.env.example not found"
        exit 1
    fi
else
    echo "ℹ️  core-server/.env already exists"
fi

if [ ! -f "core-ui/.env" ]; then
    if [ -f "core-ui/.env.example" ]; then
        cp core-ui/.env.example core-ui/.env
        echo "✅ Created core-ui/.env from template"
    else
        echo "❌ core-ui/.env.example not found"
        exit 1
    fi
else
    echo "ℹ️  core-ui/.env already exists"
fi

echo ""
echo "🎯 Next steps:"
echo "1. Edit core-server/.env with your Anthropic and Supabase API keys"
echo "2. Edit core-ui/.env with your frontend configuration"
echo "3. Run ./start-docker.sh to build and start the application"
echo ""
echo "📖 See README.md for detailed instructions on getting API keys"
