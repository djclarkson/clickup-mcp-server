/**
 * SPDX-FileCopyrightText: © 2025 Talib Kareem <taazkareem@icloud.com>
 * SPDX-License-Identifier: MIT
 *
 * ClickUp MCP List Tools
 * 
 * This module defines list-related tools including creating, updating,
 * retrieving, and deleting lists. It supports creating lists both in spaces
 * and in folders.
 */

import { 
  CreateListData, 
  ClickUpList
} from '../services/clickup/types.js';
import { listService, workspaceService } from '../services/shared.js';
import config from '../config.js';
import { sponsorService } from '../utils/sponsor-service.js';

/**
 * Tool definition for creating a list directly in a space
 */
export const createListTool = {
  name: "create_list",
  description: `Creates a list in a ClickUp space. Use spaceId (preferred) or spaceName + list name. Name is required. For lists in folders, use create_list_in_folder. Optional: content, dueDate, priority, assignee, status.`,
  inputSchema: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "Name of the list"
      },
      spaceId: {
        type: "string",
        description: "ID of the space to create the list in. Use this instead of spaceName if you have the ID."
      },
      spaceName: {
        type: "string",
        description: "Name of the space to create the list in. Alternative to spaceId - one of them MUST be provided."
      },
      content: {
        type: "string",
        description: "Description or content of the list"
      },
      dueDate: {
        type: "string",
        description: "Due date for the list (Unix timestamp in milliseconds)"
      },
      priority: {
        type: "number",
        description: "Priority level: 1 (urgent), 2 (high), 3 (normal), 4 (low)"
      },
      assignee: {
        type: "number",
        description: "User ID to assign the list to"
      },
      status: {
        type: "string",
        description: "Status of the list"
      }
    },
    required: ["name"]
  }
};

/**
 * Tool definition for creating a list within a folder
 */
export const createListInFolderTool = {
  name: "create_list_in_folder",
  description: `Creates a list in a ClickUp folder. Use folderId (preferred) or folderName + space info + list name. Name is required. When using folderName, spaceId/spaceName required as folder names may not be unique. Optional: content, status.`,
  inputSchema: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "Name of the list"
      },
      folderId: {
        type: "string",
        description: "ID of the folder to create the list in. If you have this, you don't need folderName or space information."
      },
      folderName: {
        type: "string",
        description: "Name of the folder to create the list in. When using this, you MUST also provide either spaceName or spaceId."
      },
      spaceId: {
        type: "string",
        description: "ID of the space containing the folder. Required when using folderName instead of folderId."
      },
      spaceName: {
        type: "string", 
        description: "Name of the space containing the folder. Required when using folderName instead of folderId."
      },
      content: {
        type: "string",
        description: "Description or content of the list"
      },
      status: {
        type: "string",
        description: "Status of the list (uses folder default if not specified)"
      }
    },
    required: ["name"]
  }
};

/**
 * Tool definition for retrieving list details
 */
export const getListTool = {
  name: "get_list",
  description: `Gets details of a ClickUp list. Use listId (preferred) or listName. Returns list details including name, content, and space info. ListId more reliable as names may not be unique.`,
  inputSchema: {
    type: "object",
    properties: {
      listId: {
        type: "string",
        description: "ID of the list to retrieve. Use this instead of listName if you have the ID."
      },
      listName: {
        type: "string",
        description: "Name of the list to retrieve. May be ambiguous if multiple lists have the same name."
      }
    },
    required: []
  }
};

/**
 * Tool definition for updating a list
 */
export const updateListTool = {
  name: "update_list",
  description: `Updates a ClickUp list. Use listId (preferred) or listName + at least one update field (name/content/status). ListId more reliable as names may not be unique. Only specified fields updated.`,
  inputSchema: {
    type: "object",
    properties: {
      listId: {
        type: "string",
        description: "ID of the list to update. Use this instead of listName if you have the ID."
      },
      listName: {
        type: "string",
        description: "Name of the list to update. May be ambiguous if multiple lists have the same name."
      },
      name: {
        type: "string",
        description: "New name for the list"
      },
      content: {
        type: "string",
        description: "New description or content for the list"
      },
      status: {
        type: "string",
        description: "New status for the list"
      }
    },
    required: []
  }
};

/**
 * Tool definition for deleting a list
 */
export const deleteListTool = {
  name: "delete_list",
  description: `PERMANENTLY deletes a ClickUp list and all its tasks. Use listId (preferred/safest) or listName. WARNING: Cannot be undone, all tasks will be deleted, listName risky if not unique.`,
  inputSchema: {
    type: "object",
    properties: {
      listId: {
        type: "string",
        description: "ID of the list to delete. Use this instead of listName if you have the ID."
      },
      listName: {
        type: "string",
        description: "Name of the list to delete. May be ambiguous if multiple lists have the same name."
      }
    },
    required: []
  }
};

/**
 * Helper function to find a list ID by name
 * Uses the ClickUp service's global list search functionality
 */
export async function findListIDByName(workspaceService: any, listName: string): Promise<{ id: string; name: string } | null> {
  // Use workspace service to find the list in the hierarchy
  const hierarchy = await workspaceService.getWorkspaceHierarchy();
  const listInfo = workspaceService.findIDByNameInHierarchy(hierarchy, listName, 'list');
  if (!listInfo) return null;
  return { id: listInfo.id, name: listName };
}

/**
 * Handler for the create_list tool
 * Creates a new list directly in a space
 */
export async function handleCreateList(parameters: any) {
  const { name, spaceId, spaceName, content, dueDate, priority, assignee, status } = parameters;
  
  // Validate required fields
  if (!name) {
    throw new Error("List name is required");
  }
  
  let targetSpaceId = spaceId;
  
  // If no spaceId but spaceName is provided, look up the space ID
  if (!targetSpaceId && spaceName) {
    const spaceIdResult = await workspaceService.findSpaceIDByName(spaceName);
    if (!spaceIdResult) {
      throw new Error(`Space "${spaceName}" not found`);
    }
    targetSpaceId = spaceIdResult;
  }
  
  if (!targetSpaceId) {
    throw new Error("Either spaceId or spaceName must be provided");
  }

  // Prepare list data
  const listData: CreateListData = {
    name
  };

  // Add optional fields if provided
  if (content) listData.content = content;
  if (dueDate) listData.due_date = parseInt(dueDate);
  if (priority) listData.priority = priority;
  if (assignee) listData.assignee = assignee;
  if (status) listData.status = status;

  try {
    // Create the list
    const newList = await listService.createList(targetSpaceId, listData);
    
    return sponsorService.createResponse({
      id: newList.id,
      name: newList.name,
      content: newList.content,
      space: {
        id: newList.space.id,
        name: newList.space.name
      },
      url: `https://app.clickup.com/${config.clickupTeamId}/v/l/${newList.id}`,
      message: `List "${name}" created successfully`
    }, true);
  } catch (error: any) {
    return sponsorService.createErrorResponse(`Failed to create list: ${error.message}`);
  }
}

/**
 * Handler for the create_list_in_folder tool
 * Creates a new list inside a folder
 */
export async function handleCreateListInFolder(parameters: any) {
  const { name, folderId, folderName, spaceId, spaceName, content, status } = parameters;
  
  // Validate required fields
  if (!name) {
    throw new Error("List name is required");
  }
  
  let targetFolderId = folderId;
  
  // If no folderId but folderName is provided, look up the folder ID
  if (!targetFolderId && folderName) {
    let targetSpaceId = spaceId;
    
    // If no spaceId provided but spaceName is, look up the space ID first
    if (!targetSpaceId && spaceName) {
      const spaceIdResult = await workspaceService.findSpaceByName(spaceName);
      if (!spaceIdResult) {
        throw new Error(`Space "${spaceName}" not found`);
      }
      targetSpaceId = spaceIdResult.id;
    }
    
    if (!targetSpaceId) {
      throw new Error("When using folderName to identify a folder, you must also provide either spaceId or spaceName to locate the correct folder. This is because folder names might not be unique across different spaces.");
    }
    
    // Find the folder in the workspace hierarchy
    const hierarchy = await workspaceService.getWorkspaceHierarchy();
    const folderInfo = workspaceService.findIDByNameInHierarchy(hierarchy, folderName, 'folder');
    if (!folderInfo) {
      throw new Error(`Folder "${folderName}" not found in space`);
    }
    targetFolderId = folderInfo.id;
  }
  
  if (!targetFolderId) {
    throw new Error("Either folderId or folderName must be provided");
  }

  // Prepare list data
  const listData: CreateListData = {
    name
  };

  // Add optional fields if provided
  if (content) listData.content = content;
  if (status) listData.status = status;

  try {
    // Create the list in the folder
    const newList = await listService.createListInFolder(targetFolderId, listData);
    
    return sponsorService.createResponse({
      id: newList.id,
      name: newList.name,
      content: newList.content,
      folder: {
        id: newList.folder.id,
        name: newList.folder.name
      },
      space: {
        id: newList.space.id,
        name: newList.space.name
      },
      url: `https://app.clickup.com/${config.clickupTeamId}/v/l/${newList.id}`,
      message: `List "${name}" created successfully in folder "${newList.folder.name}"`
    }, true);
  } catch (error: any) {
    return sponsorService.createErrorResponse(`Failed to create list in folder: ${error.message}`);
  }
}

/**
 * Handler for the get_list tool
 * Retrieves details about a specific list
 */
export async function handleGetList(parameters: any) {
  // Debug logging to understand parameter passing
  console.log('[DEBUG] handleGetList - Received parameters:', JSON.stringify(parameters, null, 2));
  console.log('[DEBUG] handleGetList - Type of parameters:', typeof parameters);
  console.log('[DEBUG] handleGetList - Parameters keys:', Object.keys(parameters || {}));
  
  // Handle potential double-wrapped parameters from MCP
  let params = parameters;
  if (parameters && typeof parameters === 'object' && 'parameters' in parameters) {
    params = parameters.parameters;
    console.log('[DEBUG] handleGetList - Found wrapped parameters, unwrapping:', JSON.stringify(params, null, 2));
  }
  
  const { listId, listName } = params;
  
  console.log('[DEBUG] handleGetList - Extracted listId:', listId);
  console.log('[DEBUG] handleGetList - Extracted listName:', listName);
  
  let targetListId = listId;
  
  // If no listId provided but listName is, look up the list ID
  if (!targetListId && listName) {
    const listResult = await findListIDByName(workspaceService, listName);
    if (!listResult) {
      throw new Error(`List "${listName}" not found`);
    }
    targetListId = listResult.id;
  }
  
  if (!targetListId) {
    throw new Error("Either listId or listName must be provided");
  }

  try {
    // Get the list
    const list = await listService.getList(targetListId);
    
    return sponsorService.createResponse({
      id: list.id,
      name: list.name,
      content: list.content,
      space: {
        id: list.space.id,
        name: list.space.name
      },
      url: `https://app.clickup.com/${config.clickupTeamId}/v/l/${list.id}`
    }, true);
  } catch (error: any) {
    return sponsorService.createErrorResponse(`Failed to retrieve list: ${error.message}`);
  }
}

/**
 * Handler for the update_list tool
 * Updates an existing list's properties
 */
export async function handleUpdateList(parameters: any) {
  const { listId, listName, name, content, status } = parameters;
  
  let targetListId = listId;
  
  // If no listId provided but listName is, look up the list ID
  if (!targetListId && listName) {
    const listResult = await findListIDByName(workspaceService, listName);
    if (!listResult) {
      throw new Error(`List "${listName}" not found`);
    }
    targetListId = listResult.id;
  }
  
  if (!targetListId) {
    throw new Error("Either listId or listName must be provided");
  }
  
  // Ensure at least one update field is provided
  if (!name && !content && !status) {
    throw new Error("At least one of name, content, or status must be provided for update");
  }

  // Prepare update data
  const updateData: Partial<CreateListData> = {};
  if (name) updateData.name = name;
  if (content) updateData.content = content;
  if (status) updateData.status = status;

  try {
    // Update the list
    const updatedList = await listService.updateList(targetListId, updateData);
    
    return sponsorService.createResponse({
      id: updatedList.id,
      name: updatedList.name,
      content: updatedList.content,
      space: {
        id: updatedList.space.id,
        name: updatedList.space.name
      },
      url: `https://app.clickup.com/${config.clickupTeamId}/v/l/${updatedList.id}`,
      message: `List "${updatedList.name}" updated successfully`
    }, true);
  } catch (error: any) {
    return sponsorService.createErrorResponse(`Failed to update list: ${error.message}`);
  }
}

/**
 * Handler for the delete_list tool
 * Permanently removes a list from the workspace
 */
export async function handleDeleteList(parameters: any) {
  const { listId, listName } = parameters;
  
  let targetListId = listId;
  
  // If no listId provided but listName is, look up the list ID
  if (!targetListId && listName) {
    const listResult = await findListIDByName(workspaceService, listName);
    if (!listResult) {
      throw new Error(`List "${listName}" not found`);
    }
    targetListId = listResult.id;
  }
  
  if (!targetListId) {
    throw new Error("Either listId or listName must be provided");
  }

  try {
    // Get list details before deletion for confirmation message
    const list = await listService.getList(targetListId);
    const listName = list.name;
    
    // Delete the list
    await listService.deleteList(targetListId);
    
    return sponsorService.createResponse({
      success: true,
      message: `List "${listName || targetListId}" deleted successfully`
    }, true);
  } catch (error: any) {
    return sponsorService.createErrorResponse(`Failed to delete list: ${error.message}`);
  }
} 