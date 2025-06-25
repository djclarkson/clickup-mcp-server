/**
 * SPDX-FileCopyrightText: © 2025 Talib Kareem <taazkareem@icloud.com>
 * SPDX-License-Identifier: MIT
 *
 * ClickUp Task Service - Dependencies Module
 * 
 * Handles task dependency operations in ClickUp, including:
 * - Creating and removing task dependencies
 * - Retrieving dependency information
 * - Managing blocking/waiting relationships
 */

import { BaseClickUpService, ErrorCode, ClickUpServiceError, ServiceResponse } from '../base.js';
import { ClickUpTask } from '../types.js';
import { TaskServiceComments } from './task-comments.js';

/**
 * Types of task dependencies in ClickUp
 */
export type DependencyType = 'waiting_on' | 'blocking';

/**
 * Dependency relationship between two tasks
 */
export interface TaskDependency {
  task_id: string;
  depends_on: string;
  dependency_of: string;
  date_created: string;
  userid: string;
  workspace_id: string;
  type: number; // 0 = waiting_on, 1 = blocking
}

/**
 * Enhanced task dependency information
 */
export interface TaskDependencyInfo {
  task_id: string;
  task_name: string;
  status: string;
  list: {
    id: string;
    name: string;
  };
}

/**
 * Complete dependency response for a task
 */
export interface TaskDependenciesResponse {
  task: {
    id: string;
    name: string;
  };
  dependencies: {
    waiting_on: TaskDependencyInfo[];
    blocking: TaskDependencyInfo[];
  };
}

/**
 * Parameters for adding a task dependency
 */
export interface AddTaskDependencyParams {
  // Task that will be blocked
  taskId?: string;
  taskName?: string;
  listName?: string;
  
  // Task that will be blocking (dependency)
  dependsOnTaskId?: string;
  dependsOnTaskName?: string;
  dependsOnListName?: string;
  
  // Type of dependency
  dependencyType?: DependencyType;
}

/**
 * Parameters for removing a task dependency
 */
export interface RemoveTaskDependencyParams {
  // Task that has the dependency
  taskId?: string;
  taskName?: string;
  listName?: string;
  
  // Dependency to remove
  dependencyTaskId?: string;
  dependencyTaskName?: string;
  dependencyListName?: string;
}

/**
 * Parameters for getting task dependencies
 */
export interface GetTaskDependenciesParams {
  taskId?: string;
  taskName?: string;
  listName?: string;
  includeSubtasks?: boolean;
}

/**
 * Task Dependencies Service class
 */
export class TaskServiceDependencies extends TaskServiceComments {
  /**
   * Add a dependency between two tasks
   * @param params Dependency parameters
   * @returns ServiceResponse with the created dependency
   */
  async addTaskDependency(params: AddTaskDependencyParams): Promise<ServiceResponse<TaskDependency>> {
    try {
      this.logOperation('addTaskDependency', { params });
      
      // Resolve task IDs
      const taskId = await this.resolveTaskId(params.taskId, params.taskName, params.listName);
      const dependsOnTaskId = await this.resolveTaskId(
        params.dependsOnTaskId, 
        params.dependsOnTaskName, 
        params.dependsOnListName
      );
      
      if (!taskId) {
        throw new ClickUpServiceError(
          'Unable to resolve task ID from provided parameters',
          ErrorCode.NOT_FOUND
        );
      }
      
      if (!dependsOnTaskId) {
        throw new ClickUpServiceError(
          'Unable to resolve dependency task ID from provided parameters',
          ErrorCode.NOT_FOUND
        );
      }
      
      // Check for circular dependencies
      await this.checkCircularDependency(taskId, dependsOnTaskId);
      
      // Create the dependency
      const dependencyType = params.dependencyType || 'waiting_on';
      const endpoint = `/task/${taskId}/dependency`;
      
      const response = await this.client.post<TaskDependency>(endpoint, {
        depends_on: dependsOnTaskId,
        dependency_type: dependencyType === 'waiting_on' ? 0 : 1
      });
      
      this.logOperation('addTaskDependency', { 
        success: true, 
        taskId, 
        dependsOnTaskId,
        type: dependencyType 
      });
      
      return {
        data: response.data,
        success: true
      };
    } catch (error) {
      const serviceError = this.handleError(error, 'Failed to add task dependency');
      this.logOperation('addTaskDependency', { 
        error: serviceError.message,
        params 
      });
      return {
        data: null,
        success: false,
        error: serviceError
      };
    }
  }
  
  /**
   * Remove a dependency between two tasks
   * @param params Dependency parameters
   * @returns ServiceResponse indicating success
   */
  async removeTaskDependency(params: RemoveTaskDependencyParams): Promise<ServiceResponse<void>> {
    try {
      this.logOperation('removeTaskDependency', { params });
      
      // Resolve task IDs
      const taskId = await this.resolveTaskId(params.taskId, params.taskName, params.listName);
      const dependencyTaskId = await this.resolveTaskId(
        params.dependencyTaskId, 
        params.dependencyTaskName, 
        params.dependencyListName
      );
      
      if (!taskId) {
        throw new ClickUpServiceError(
          'Unable to resolve task ID from provided parameters',
          ErrorCode.NOT_FOUND
        );
      }
      
      if (!dependencyTaskId) {
        throw new ClickUpServiceError(
          'Unable to resolve dependency task ID from provided parameters',
          ErrorCode.NOT_FOUND
        );
      }
      
      // Remove the dependency
      const endpoint = `/task/${taskId}/dependency`;
      const queryParams = new URLSearchParams({
        depends_on: dependencyTaskId
      });
      
      await this.client.delete(`${endpoint}?${queryParams}`);
      
      this.logOperation('removeTaskDependency', { 
        success: true, 
        taskId, 
        dependencyTaskId 
      });
      
      return {
        data: null,
        success: true
      };
    } catch (error) {
      const serviceError = this.handleError(error, 'Failed to remove task dependency');
      this.logOperation('removeTaskDependency', { 
        error: serviceError.message,
        params 
      });
      return {
        data: null,
        success: false,
        error: serviceError
      };
    }
  }
  
  /**
   * Get all dependencies for a task
   * @param params Task parameters
   * @returns ServiceResponse with task dependencies
   */
  async getTaskDependencies(params: GetTaskDependenciesParams): Promise<ServiceResponse<TaskDependenciesResponse>> {
    try {
      this.logOperation('getTaskDependencies', { params });
      
      // Resolve task ID
      const taskId = await this.resolveTaskId(params.taskId, params.taskName, params.listName);
      
      if (!taskId) {
        throw new ClickUpServiceError(
          'Unable to resolve task ID from provided parameters',
          ErrorCode.NOT_FOUND
        );
      }
      
      // Get the task with dependencies
      const task = await this.getTask(taskId);
      
      if (!task) {
        throw new ClickUpServiceError(
          'Failed to retrieve task information',
          ErrorCode.NOT_FOUND
        );
      }
      
      // Process dependencies
      const dependencies: TaskDependenciesResponse = {
        task: {
          id: task.id,
          name: task.name
        },
        dependencies: {
          waiting_on: [],
          blocking: []
        }
      };
      
      // Get detailed information for each dependency
      if (task.dependencies && task.dependencies.length > 0) {
        for (const depId of task.dependencies) {
          const depTask = await this.getTask(depId);
          if (depTask) {
            const depInfo: TaskDependencyInfo = {
              task_id: depTask.id,
              task_name: depTask.name,
              status: depTask.status.status,
              list: {
                id: depTask.list.id,
                name: depTask.list.name
              }
            };
            dependencies.dependencies.waiting_on.push(depInfo);
          }
        }
      }
      
      // Include subtask dependencies if requested
      if (params.includeSubtasks && task.subtasks) {
        for (const subtask of task.subtasks) {
          if (subtask.dependencies && subtask.dependencies.length > 0) {
            const subtaskDeps = await this.getTaskDependencies({
              taskId: subtask.id,
              includeSubtasks: false
            });
            
            if (subtaskDeps.success && subtaskDeps.data) {
              dependencies.dependencies.waiting_on.push(
                ...subtaskDeps.data.dependencies.waiting_on
              );
              dependencies.dependencies.blocking.push(
                ...subtaskDeps.data.dependencies.blocking
              );
            }
          }
        }
      }
      
      this.logOperation('getTaskDependencies', { 
        success: true, 
        taskId,
        dependencyCount: dependencies.dependencies.waiting_on.length + 
                        dependencies.dependencies.blocking.length
      });
      
      return {
        data: dependencies,
        success: true
      };
    } catch (error) {
      const serviceError = this.handleError(error, 'Failed to get task dependencies');
      this.logOperation('getTaskDependencies', { 
        error: serviceError.message,
        params 
      });
      return {
        data: null,
        success: false,
        error: serviceError
      };
    }
  }
  
  /**
   * Check for circular dependencies
   * @param taskId Task that would be blocked
   * @param dependsOnTaskId Task that would be blocking
   * @throws ClickUpServiceError if circular dependency detected
   */
  private async checkCircularDependency(taskId: string, dependsOnTaskId: string): Promise<void> {
    // Simple check: prevent self-dependency
    if (taskId === dependsOnTaskId) {
      throw new ClickUpServiceError(
        'Cannot create self-dependency',
        ErrorCode.VALIDATION
      );
    }
    
    // Check if dependsOnTaskId already depends on taskId
    const depsResponse = await this.getTaskDependencies({ taskId: dependsOnTaskId });
    
    if (depsResponse.success && depsResponse.data) {
      const waitingOnIds = depsResponse.data.dependencies.waiting_on.map(d => d.task_id);
      if (waitingOnIds.includes(taskId)) {
        throw new ClickUpServiceError(
          'Circular dependency detected: Target task already depends on source task',
          ErrorCode.VALIDATION
        );
      }
    }
  }
  
  /**
   * Resolve a task ID from various parameter combinations
   * @param taskId Direct task ID
   * @param taskName Task name to look up
   * @param listName List name for context
   * @returns Resolved task ID or null
   */
  private async resolveTaskId(
    taskId?: string, 
    taskName?: string, 
    listName?: string
  ): Promise<string | null> {
    if (taskId) {
      return taskId;
    }
    
    if (taskName) {
      const searchParams: any = { taskName };
      if (listName) {
        searchParams.listName = listName;
      }
      
      const result = await this.findTaskByName(taskName, listName);
      return result ? result.id : null;
    }
    
    return null;
  }
}