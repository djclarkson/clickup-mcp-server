# Issue: MCP Parameter Handling Fails for get_list and get_workspace_tasks

## Description
When using the ClickUp MCP server through an MCP client, certain tools fail to recognize their parameters correctly:

1. **get_list** - Returns error "Either listId or listName must be provided" even when `listId` is provided
2. **get_workspace_tasks** - Returns error "At least one filter parameter is required" even when `list_ids` is provided

## Steps to Reproduce

1. Configure ClickUp MCP server with valid API key and team ID
2. Call `get_list` with parameters:
   ```json
   {"listId": "901809007878"}
   ```
   Result: Error - "Either listId or listName must be provided"

3. Call `get_workspace_tasks` with parameters:
   ```json
   {"list_ids": ["901809007878"], "limit": 10}
   ```
   Result: Error - "At least one filter parameter is required"

## Expected Behavior
- `get_list` should accept the listId parameter and return the list details
- `get_workspace_tasks` should recognize `list_ids` as a valid filter parameter

## Analysis
The issue appears to be related to how MCP passes parameters to the tool handlers. The MCP protocol wraps parameters in an `arguments` object, but the handlers may be expecting parameters at a different level.

## Proposed Solution
Add parameter extraction logic to handle both direct parameters and MCP-wrapped parameters in the affected handlers.