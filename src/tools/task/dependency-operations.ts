/**
 * SPDX-FileCopyrightText: © 2025 Talib Kareem <taazkareem@icloud.com>
 * SPDX-License-Identifier: MIT
 *
 * Task dependency tool definitions for ClickUp MCP server
 */

import { z } from 'zod';

/**
 * Tool definition for adding a task dependency
 */
export const addTaskDependencyTool = {
  name: 'add_task_dependency',
  description: `Creates a blocking/waiting relationship between two tasks. Use taskId + dependsOnTaskId (preferred) or taskName + dependsOnTaskName. WARNING: Using taskName without listName may match multiple tasks.`,
  inputSchema: z.object({
    // Task that will be blocked
    taskId: z.string().optional().describe('ID of the task that will be blocked (preferred). Works with both regular task IDs (9 characters) and custom IDs with uppercase prefixes (like \'DEV-1234\').'),
    taskName: z.string().optional().describe('Name of the task that will be blocked. When using this parameter, it\'s recommended to also provide listName.'),
    listName: z.string().optional().describe('Name of the list containing the task. Helps find the right task when using taskName.'),
    
    // Task that will be blocking (dependency)
    dependsOnTaskId: z.string().optional().describe('ID of the task that will be blocking (the dependency). Works with both regular task IDs and custom IDs.'),
    dependsOnTaskName: z.string().optional().describe('Name of the task that will be blocking. When using this parameter, it\'s recommended to also provide dependsOnListName.'),
    dependsOnListName: z.string().optional().describe('Name of the list containing the dependency task. Helps find the right task when using dependsOnTaskName.'),
    
    // Type of dependency
    dependencyType: z.enum(['waiting_on', 'blocking']).optional().describe('Type of dependency relationship. Default is \'waiting_on\'.'),
  }).strict()
};

/**
 * Tool definition for removing a task dependency
 */
export const removeTaskDependencyTool = {
  name: 'remove_task_dependency',
  description: `Removes an existing dependency relationship between tasks. Use taskId + dependencyTaskId (preferred) or taskName + dependencyTaskName. WARNING: Using taskName without listName may match multiple tasks.`,
  inputSchema: z.object({
    // Task that has the dependency
    taskId: z.string().optional().describe('ID of the task that has the dependency (preferred). Works with both regular task IDs and custom IDs.'),
    taskName: z.string().optional().describe('Name of the task that has the dependency. When using this parameter, it\'s recommended to also provide listName.'),
    listName: z.string().optional().describe('Name of the list containing the task. Helps find the right task when using taskName.'),
    
    // Dependency to remove
    dependencyTaskId: z.string().optional().describe('ID of the dependency task to remove. Works with both regular task IDs and custom IDs.'),
    dependencyTaskName: z.string().optional().describe('Name of the dependency task to remove. When using this parameter, it\'s recommended to also provide dependencyListName.'),
    dependencyListName: z.string().optional().describe('Name of the list containing the dependency task. Helps find the right task when using dependencyTaskName.'),
  }).strict()
};

/**
 * Tool definition for getting task dependencies
 */
export const getTaskDependenciesTool = {
  name: 'get_task_dependencies',
  description: `Retrieves all dependencies for a specific task. Use taskId (preferred) or taskName + optional listName. Returns both waiting_on and blocking dependencies with task details.`,
  inputSchema: z.object({
    taskId: z.string().optional().describe('ID of the task to get dependencies for (preferred). Works with both regular task IDs and custom IDs.'),
    taskName: z.string().optional().describe('Name of the task to get dependencies for. When using this parameter, it\'s recommended to also provide listName.'),
    listName: z.string().optional().describe('Name of the list containing the task. Helps find the right task when using taskName.'),
    includeSubtasks: z.boolean().optional().describe('Whether to include dependencies of subtasks. Default is false.'),
  }).strict()
};

/**
 * Tool definition for adding bulk dependencies
 */
export const addBulkDependenciesTool = {
  name: 'add_bulk_dependencies',
  description: `Adds multiple dependencies in a single operation. Efficient for setting up complex dependency chains between multiple tasks.`,
  inputSchema: z.object({
    dependencies: z.array(z.object({
      taskId: z.string().describe('ID of the task that will have dependencies added'),
      dependsOn: z.array(z.string()).describe('Array of task IDs that this task will depend on')
    })).describe('Array of dependency configurations. Each item specifies a task and the tasks it should depend on.'),
    options: z.object({
      continueOnError: z.boolean().optional().describe('Whether to continue processing if a dependency fails to be created. Default is false.'),
      retryCount: z.number().optional().describe('Number of retry attempts for failed operations. Default is 0.')
    }).optional().describe('Optional processing settings for the bulk operation')
  }).strict()
};