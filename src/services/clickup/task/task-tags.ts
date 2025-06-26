/**
 * SPDX-FileCopyrightText: © 2025 Talib Kareem <taazkareem@icloud.com>
 * SPDX-License-Identifier: MIT
 *
 * ClickUp Task Service - Tags Module
 * 
 * Handles tag operations for ClickUp tasks, including:
 * - Adding tags to a task
 * - Removing tags from a task
 */

import { TaskServiceDependencies } from './task-dependencies.js';
import { ClickUpTag } from '../types.js';

/**
 * Tags functionality for the TaskService
 */
export class TaskServiceTags extends TaskServiceDependencies {
  /**
   * Add a tag to a task
   * 
   * @param taskId ID of the task
   * @param tagName Name of the tag to add
   * @returns Success response
   */
  async addTagToTask(taskId: string, tagName: string): Promise<boolean> {
    this.logOperation('addTagToTask', { taskId, tagName });
    
    try {
      const payload = {
        tag_name: tagName,
      };
      
      await this.client.post(
        `/task/${taskId}/tag/${encodeURIComponent(tagName)}`,
        payload
      );
      
      return true;
    } catch (error) {
      throw this.handleError(error, `Failed to add tag "${tagName}" to task`);
    }
  }

  /**
   * Remove a tag from a task
   * 
   * @param taskId ID of the task
   * @param tagName Name of the tag to remove
   * @returns Success response
   */
  async removeTagFromTask(taskId: string, tagName: string): Promise<boolean> {
    this.logOperation('removeTagFromTask', { taskId, tagName });
    
    try {
      await this.client.delete(
        `/task/${taskId}/tag/${encodeURIComponent(tagName)}`
      );
      
      return true;
    } catch (error) {
      throw this.handleError(error, `Failed to remove tag "${tagName}" from task`);
    }
  }

  /**
   * Get all tags for a task
   * 
   * @param taskId ID of the task
   * @returns Array of task tags
   */
  async getTaskTags(taskId: string): Promise<ClickUpTag[]> {
    this.logOperation('getTaskTags', { taskId });
    
    try {
      // We need to fetch the full task to get its tags
      const task = await this.getTask(taskId);
      return task.tags || [];
    } catch (error) {
      throw this.handleError(error, 'Failed to get task tags');
    }
  }

  /**
   * Update all tags for a task (replaces existing tags)
   * 
   * @param taskId ID of the task
   * @param tagNames Array of tag names to set
   * @returns Success response
   */
  async updateTaskTags(taskId: string, tagNames: string[]): Promise<boolean> {
    this.logOperation('updateTaskTags', { taskId, tagNames });
    
    try {
      // First get existing tags
      const existingTags = await this.getTaskTags(taskId);
      const existingTagNames = existingTags.map(tag => tag.name);
      
      // Remove tags that shouldn't be there
      for (const tagName of existingTagNames) {
        if (!tagNames.includes(tagName)) {
          await this.removeTagFromTask(taskId, tagName);
        }
      }
      
      // Add new tags
      for (const tagName of tagNames) {
        if (!existingTagNames.includes(tagName)) {
          await this.addTagToTask(taskId, tagName);
        }
      }
      
      return true;
    } catch (error) {
      throw this.handleError(error, 'Failed to update task tags');
    }
  }
} 