/**
 * SPDX-FileCopyrightText: © 2025 Talib Kareem <taazkareem@icloud.com>
 * SPDX-License-Identifier: MIT
 *
 * Task dependency management tools for ClickUp MCP server
 */

import { 
  AddTaskDependencyParams,
  RemoveTaskDependencyParams,
  GetTaskDependenciesParams,
  TaskDependency,
  TaskDependenciesResponse
} from '../../services/clickup/task/task-dependencies.js';
import { Logger } from '../../logger.js';

const logger = new Logger('TaskDependencyHandlers');
import { clickUpServices } from '../../services/shared.js';

const { task: taskService } = clickUpServices;

/**
 * Handler for adding a task dependency
 */
export async function handleAddTaskDependency(params: AddTaskDependencyParams): Promise<any> {
  try {
    logger.info('Adding task dependency', { params });
    
    // Validate parameters
    if (!params.taskId && !params.taskName) {
      throw new Error('Either taskId or taskName must be provided');
    }
    
    if (!params.dependsOnTaskId && !params.dependsOnTaskName) {
      throw new Error('Either dependsOnTaskId or dependsOnTaskName must be provided');
    }
    
    if (params.taskName && !params.listName) {
      logger.warn('Using taskName without listName may result in ambiguous matches');
    }
    
    if (params.dependsOnTaskName && !params.dependsOnListName) {
      logger.warn('Using dependsOnTaskName without dependsOnListName may result in ambiguous matches');
    }
    
    // Call the service method
    const result = await taskService.addTaskDependency(params);
    
    if (!result.success) {
      throw result.error || new Error('Failed to add task dependency');
    }
    
    logger.info('Task dependency added successfully', { 
      dependency: result.data 
    });
    
    return {
      success: true,
      dependency: result.data,
      message: 'Task dependency created successfully'
    };
  } catch (error: any) {
    logger.error('Failed to add task dependency', { error: error.message, params });
    throw {
      error: `Failed to add task dependency: ${error.message}`,
      params: JSON.stringify(params)
    };
  }
}

/**
 * Handler for removing a task dependency
 */
export async function handleRemoveTaskDependency(params: RemoveTaskDependencyParams): Promise<any> {
  try {
    logger.info('Removing task dependency', { params });
    
    // Validate parameters
    if (!params.taskId && !params.taskName) {
      throw new Error('Either taskId or taskName must be provided');
    }
    
    if (!params.dependencyTaskId && !params.dependencyTaskName) {
      throw new Error('Either dependencyTaskId or dependencyTaskName must be provided');
    }
    
    if (params.taskName && !params.listName) {
      logger.warn('Using taskName without listName may result in ambiguous matches');
    }
    
    if (params.dependencyTaskName && !params.dependencyListName) {
      logger.warn('Using dependencyTaskName without dependencyListName may result in ambiguous matches');
    }
    
    // Call the service method
    const result = await taskService.removeTaskDependency(params);
    
    if (!result.success) {
      throw result.error || new Error('Failed to remove task dependency');
    }
    
    logger.info('Task dependency removed successfully');
    
    return {
      success: true,
      message: 'Task dependency removed successfully'
    };
  } catch (error: any) {
    logger.error('Failed to remove task dependency', { error: error.message, params });
    throw {
      error: `Failed to remove task dependency: ${error.message}`,
      params: JSON.stringify(params)
    };
  }
}

/**
 * Handler for getting task dependencies
 */
export async function handleGetTaskDependencies(params: GetTaskDependenciesParams): Promise<TaskDependenciesResponse> {
  try {
    logger.info('Getting task dependencies', { params });
    
    // Validate parameters
    if (!params.taskId && !params.taskName) {
      throw new Error('Either taskId or taskName must be provided');
    }
    
    if (params.taskName && !params.listName) {
      logger.warn('Using taskName without listName may result in ambiguous matches');
    }
    
    // Call the service method
    const result = await taskService.getTaskDependencies(params);
    
    if (!result.success) {
      throw result.error || new Error('Failed to get task dependencies');
    }
    
    logger.info('Task dependencies retrieved successfully', { 
      taskId: result.data?.task.id,
      dependencyCount: (result.data?.dependencies.waiting_on.length || 0) + 
                      (result.data?.dependencies.blocking.length || 0)
    });
    
    return result.data!;
  } catch (error: any) {
    logger.error('Failed to get task dependencies', { error: error.message, params });
    throw {
      error: `Failed to get task dependencies: ${error.message}`,
      params: JSON.stringify(params)
    };
  }
}