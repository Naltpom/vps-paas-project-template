#!/bin/bash
# Customize template with project-specific values

PROJECT_NAME="$1"
DESCRIPTION="$2"
EXECUTION_ID="$3"
MCP_API_URL="$4"
SLUG="$5"

if [ -z "$PROJECT_NAME" ]; then
  echo "Usage: $0 <project-name> <description> [execution-id] [mcp-api-url] [slug]"
  exit 1
fi

# Defaults
DESCRIPTION="${DESCRIPTION:-A modern Node.js application}"
EXECUTION_ID="${EXECUTION_ID:-}"
MCP_API_URL="${MCP_API_URL:-https://mcp-http.vps.naltpom.fr}"
CREATED_AT=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Generate slug if not provided
if [ -z "$SLUG" ]; then
  SLUG=$(echo "$PROJECT_NAME" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | sed 's/[^a-z0-9-]//g')
  SLUG="${SLUG}-$(openssl rand -hex 3)"
fi

echo "🔧 Customizing template..."
echo "   Project: $PROJECT_NAME"
echo "   Description: $DESCRIPTION"
echo "   Slug: $SLUG"
echo "   Execution ID: ${EXECUTION_ID:-not set}"
echo "   MCP API URL: $MCP_API_URL"
echo "   Created At: $CREATED_AT"

# Function to safely replace placeholders (escape special chars)
safe_replace() {
  local search="$1"
  local replace="$2"
  local file="$3"

  # Escape special characters for sed
  search_escaped=$(printf '%s\n' "$search" | sed 's/[[\.*^$/]/\\&/g')
  replace_escaped=$(printf '%s\n' "$replace" | sed 's/[&/\]/\\&/g')

  sed -i "s|${search_escaped}|${replace_escaped}|g" "$file"
}

# Replace placeholders in all files
find . -type f -not -path '*/node_modules/*' -not -path '*/.git/*' -not -name '*.sh' | while read -r file; do
  safe_replace "{{PROJECT_NAME}}" "$PROJECT_NAME" "$file"
  safe_replace "{{DESCRIPTION}}" "$DESCRIPTION" "$file"
  safe_replace "{{CREATED_AT}}" "$CREATED_AT" "$file"
  safe_replace "{{SLUG}}" "$SLUG" "$file"
  safe_replace "{{EXECUTION_ID}}" "$EXECUTION_ID" "$file"
  safe_replace "{{MCP_API_URL}}" "$MCP_API_URL" "$file"
done

echo "✅ Template customized!"
