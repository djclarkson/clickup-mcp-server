# Fix MCP parameter handling for get_list and get_workspace_tasks

## Description
This PR fixes parameter handling issues in the ClickUp MCP server when tools are called through MCP clients. The issue occurs when MCP clients wrap parameters in an additional `parameters` object, causing the handlers to fail to find the expected parameter values.

## Problem
When calling tools through an MCP client, parameters are sometimes double-wrapped:
```json
{
  "parameters": {
    "listId": "901809007878"
  }
}
```

Instead of the expected:
```json
{
  "listId": "901809007878"
}
```

This causes errors like:
- `get_list`: "Either listId or listName must be provided"
- `get_workspace_tasks`: "At least one filter parameter is required"

## Solution
Added parameter unwrapping logic to both handlers that:
1. Checks if the received parameters object contains a `parameters` property
2. If found, unwraps the nested parameters before processing
3. Maintains backward compatibility with direct parameter passing

## Changes
- `src/tools/list.ts`: Added parameter unwrapping in `handleGetList`
- `src/tools/task/handlers.ts`: Added parameter unwrapping in `getWorkspaceTasksHandler`

## Testing
The debug logging added will help identify the exact parameter structure being received, making it easier to diagnose similar issues in other handlers if needed.

## Related Issue
Fixes #73