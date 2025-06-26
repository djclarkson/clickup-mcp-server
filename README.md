# ClickUp MCP Server (Enhanced Fork)

<img src="assets/images/clickup_mcp_server_social_image.png" alt="ClickUp MCP Server" width="100%">

[![NPM Version](https://img.shields.io/npm/v/@djclarkson/clickup-mcp-server.svg?style=flat&logo=npm)](https://www.npmjs.com/package/@djclarkson/clickup-mcp-server)
[![GitHub Stars](https://img.shields.io/github/stars/djclarkson/clickup-mcp-server?style=flat&logo=github)](https://github.com/djclarkson/clickup-mcp-server/stargazers)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-brightgreen.svg)](https://github.com/djclarkson/clickup-mcp-server/graphs/commit-activity)

> **Enhanced Fork** of the original [ClickUp MCP Server](https://github.com/TaazKareem/clickup-mcp-server) with additional features and improvements.

A Model Context Protocol (MCP) server for integrating ClickUp tasks with AI applications. This enhanced fork adds **task dependency management** and fixes critical parameter handling issues while maintaining full compatibility with the original.

## 🚀 New Features in This Fork

### ✨ **Task Dependencies Management**
- **Create Dependencies**: Link tasks with waiting_on/blocking relationships
- **Bulk Dependencies**: Add multiple dependencies efficiently
- **Dependency Visualization**: View complete dependency chains
- **Circular Dependency Prevention**: Automatic validation to prevent cycles
- **Smart Dependency Resolution**: Works with task IDs or names

### 🔧 **Parameter Handling Fixes**
- Fixed parameter validation issues in task operations
- Improved error handling for missing required parameters
- Enhanced parameter type checking and conversion
- Better support for optional parameters in bulk operations

### 🧪 **Enhanced Testing**
- Comprehensive test suite for dependency operations
- Mock-based testing for reliable CI/CD
- Parameter validation test coverage
- Edge case handling verification

## Quick Start

### NPM Installation (Recommended)

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
        "CLICKUP_API_KEY": "your-clickup-api-key-here",
        "CLICKUP_TEAM_ID": "your-clickup-team-id-here",
        "DOCUMENT_SUPPORT": "true"
      }
    }
  }
}
```

### Command Line Usage

```bash
npx -y @djclarkson/clickup-mcp-server@latest --env CLICKUP_API_KEY=your-api-key --env CLICKUP_TEAM_ID=your-team-id
```

## Setup

1. **Get your credentials:**
   - ClickUp API key from [ClickUp Settings](https://app.clickup.com/settings/apps)
   - Team ID from your ClickUp workspace URL

2. **Install via npm:**
   - Use the configuration above in your MCP client
   - Or run directly with npx

3. **Start managing tasks with natural language!**

## Enhanced Features

### 🔗 **Task Dependencies** (New!)

Create and manage task dependencies with natural language:

```javascript
// Create a dependency
"Make Task A depend on Task B being completed"

// View dependencies
"Show me all dependencies for Project Alpha tasks"

// Bulk dependencies
"Create dependencies: Task 1 depends on Tasks 2,3,4"
```

**Available Dependency Tools:**
- `get_task_dependencies` - View task dependency chains
- `add_bulk_dependencies` - Create multiple dependencies efficiently

### 📝 **Enhanced Task Management**

All original features plus improved parameter handling:
- ✅ Create, update, and delete tasks
- ✅ Move and duplicate tasks anywhere
- ✅ Support for single and bulk operations
- ✅ Set start/due dates with natural language
- ✅ Create and manage subtasks
- ✅ Add comments and attachments
- ✅ **Fixed parameter validation issues**

### 🏷️ **Tag Management**
- Create, update, and delete space tags
- Add and remove tags from tasks
- Use natural language color commands
- Automatic contrasting foreground colors
- View all space tags
- Tag-based task organization

### ⏱️ **Time Tracking**
- View time entries for tasks
- Start/stop time tracking
- Add manual time entries
- Delete time entries
- View currently running timer
- Track billable and non-billable time

### 🌳 **Workspace Organization**
- Navigate spaces, folders, and lists
- Create and manage folders
- Organize lists within spaces
- Create lists in folders
- View workspace hierarchy
- Efficient path navigation

### 👥 **Member Management**
- Find workspace members by name or email
- Resolve assignees for tasks
- View member details and permissions
- Assign tasks to users during creation and updates
- Support for user IDs, emails, or usernames

### 📄 **Document Management**
- Document listing through workspace
- Document page listing and details
- Document creation
- Document page updates (append & prepend)

## Available Tools (38+ Total)

This fork includes all original tools plus new dependency management tools:

| Category | Tools | Description |
|----------|-------|-------------|
| **Dependencies** | `get_task_dependencies`, `add_bulk_dependencies` | **New!** Manage task dependencies |
| **Task Management** | 16 tools | Create, update, delete, move, duplicate tasks |
| **Workspace** | 8 tools | Navigate spaces, folders, lists |
| **Tags** | 6 tools | Manage space tags and task tagging |
| **Time Tracking** | 6 tools | Track time on tasks |
| **Members** | 3 tools | Manage workspace members |
| **Documents** | 6 tools | Manage ClickUp documents |

[View complete API reference](docs/api-reference.md)

## Configuration Options

| Option | Description | Default |
|--------|-------------|---------|
| `CLICKUP_API_KEY` | Your ClickUp API key | Required |
| `CLICKUP_TEAM_ID` | Your ClickUp team ID | Required |
| `DOCUMENT_SUPPORT` | Enable document management | `false` |
| `DISABLED_TOOLS` | Comma-separated list of tools to disable | None |
| `ENABLE_SSE` | Enable HTTP/SSE transport | `false` |
| `PORT` | Port for HTTP server | `3231` |

## HTTP Transport Support

The server supports both modern **HTTP Streamable** transport (MCP Inspector compatible) and legacy **SSE (Server-Sent Events)** transport:

```json
{
  "mcpServers": {
    "ClickUp": {
      "command": "npx",
      "args": ["-y", "@djclarkson/clickup-mcp-server@latest"],
      "env": {
        "CLICKUP_API_KEY": "your-api-key",
        "CLICKUP_TEAM_ID": "your-team-id",
        "ENABLE_SSE": "true",
        "PORT": "3231"
      }
    }
  }
}
```

**Endpoints:**
- **Primary**: `http://127.0.0.1:3231/mcp` (Streamable HTTP)
- **Legacy**: `http://127.0.0.1:3231/sse` (SSE for backwards compatibility)

## Fork Differences

This enhanced fork maintains 100% compatibility with the original while adding:

1. **Task Dependencies**: Complete dependency management system
2. **Parameter Fixes**: Resolved parameter validation issues
3. **Enhanced Testing**: Comprehensive test coverage
4. **Better Error Handling**: Improved error messages and validation
5. **Code Quality**: Additional type safety and documentation

## Contributing

This fork welcomes contributions! Please see [CONTRIBUTING.md](.development-files/CONTRIBUTING.md) for guidelines.

## Original Project

This is an enhanced fork of the excellent [ClickUp MCP Server](https://github.com/TaazKareem/clickup-mcp-server) by [Talib Kareem](https://github.com/TaazKareem). All credit for the original architecture and implementation goes to the original author.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Support

- 🐛 **Issues**: [GitHub Issues](https://github.com/djclarkson/clickup-mcp-server/issues)
- 💡 **Features**: Submit feature requests via issues
- 🔧 **Original Project**: [TaazKareem/clickup-mcp-server](https://github.com/TaazKareem/clickup-mcp-server)
