# ClickUp MCP Server Setup for Claude Code

## Installation Complete ✅

The ClickUp MCP server is now globally accessible at:
`/opt/homebrew/bin/clickup-mcp-server`

## For Other Claude Code Instances

To use this MCP server in other Claude Code instances, add the following to your Claude Code configuration:

```json
{
  "mcpServers": {
    "clickup": {
      "command": "clickup-mcp-server",
      "args": [],
      "env": {
        "CLICKUP_API_KEY": "pk_60741432_FFER7MJVE0PASA53I2KKVNJVLF2UM1U5",
        "CLICKUP_TEAM_ID": "9003065917"
      }
    }
  }
}
```

## Alternative: Direct Path Usage

If you prefer not to use the global command, you can reference the local build directly:

```json
{
  "mcpServers": {
    "clickup": {
      "command": "node",
      "args": ["/Users/davidclarkson/Documents/upDev/clickup-mcp-server/build/index.js"],
      "env": {
        "CLICKUP_API_KEY": "pk_60741432_FFER7MJVE0PASA53I2KKVNJVLF2UM1U5",
        "CLICKUP_TEAM_ID": "9003065917"
      }
    }
  }
}
```

## Notes
- The server is installed globally via `npm link`
- Node version warning can be ignored (v24 works fine despite the package requiring <v23)
- Document support is enabled by default