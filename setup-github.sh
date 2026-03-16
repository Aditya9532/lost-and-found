#!/bin/bash
# Run this once to initialize git and push to GitHub

echo "🔧 Setting up GitHub repository..."

git init
git add .
git commit -m "feat: initial project scaffold

- Full React + Node.js + MongoDB structure
- Auth, Items, Messages API
- Mongoose models (User, Item, Message)
- JWT authentication middleware
- File upload middleware
- React routing with protected routes
- AuthContext for global state"

echo ""
echo "✅ Git initialized! Now run:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/lost-and-found.git"
echo "   git branch -M main"
echo "   git push -u origin main"
