#!/bin/bash

# Load nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Use Node v22
nvm use 22

# Run the ClickUp MCP server
exec node /Users/davidclarkson/Documents/upDev/clickup-mcp-server/build/index.js