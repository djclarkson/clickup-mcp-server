# ClickUp MCP Server Setup

This guide helps you set up the ClickUp MCP Server for use with Claude Desktop.

## Prerequisites

- Node.js 18+ installed
- ClickUp API key from [ClickUp Settings](https://app.clickup.com/settings/apps)
- Team ID from your ClickUp workspace URL

## Installation Options

### Option 1: NPM Package (Recommended)

Use the published npm package:

```json
{
  "mcpServers": {
    "ClickUp": {
      "command": "npx",
      "args": [
        "-y",
        "@djclarkson/clickup-mcp-server@latest"
      ],
      "env": {
        "CLICKUP_API_KEY": "your-api-key-here",
        "CLICKUP_TEAM_ID": "your-team-id-here",
        "DOCUMENT_SUPPORT": "true"
      }
    }
  }
}
```

### Option 2: Local Development

For local development, use the built version directly:

```json
{
  "mcpServers": {
    "ClickUp": {
      "command": "node",
      "args": ["/path/to/clickup-mcp-server/build/index.js"],
      "env": {
        "CLICKUP_API_KEY": "your-api-key-here",
        "CLICKUP_TEAM_ID": "your-team-id-here",
        "DOCUMENT_SUPPORT": "true"
      }
    }
  }
}
```

## Configuration

- Replace `your-api-key-here` with your actual ClickUp API key
- Replace `your-team-id-here` with your actual ClickUp team ID
- Set `DOCUMENT_SUPPORT` to `"true"` if you want document management features

## Testing

After setup, restart Claude Desktop and test with a simple command:
"Show me my ClickUp workspace structure"