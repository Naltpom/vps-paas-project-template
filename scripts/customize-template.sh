#!/bin/bash
# Customize template with project-specific values

PROJECT_NAME="$1"
DESCRIPTION="$2"

if [ -z "$PROJECT_NAME" ]; then
  echo "Usage: $0 <project-name> [description]"
  exit 1
fi

DESCRIPTION="${DESCRIPTION:-A modern Node.js application}"

echo "🔧 Customizing template..."
echo "   Project: $PROJECT_NAME"
echo "   Description: $DESCRIPTION"

# Replace placeholders in all files
find . -type f -not -path '*/node_modules/*' -not -path '*/.git/*' \
  -exec sed -i "s/{{PROJECT_NAME}}/$PROJECT_NAME/g" {} \;

find . -type f -not -path '*/node_modules/*' -not -path '*/.git/*' \
  -exec sed -i "s/{{DESCRIPTION}}/$DESCRIPTION/g" {} \;

echo "✅ Template customized!"
