/**
 * SPDX-FileCopyrightText: © 2025 Talib Kareem <taazkareem@icloud.com>
 * SPDX-License-Identifier: MIT
 *
 * ClickUp Task Service - Module Exports
 * 
 * Exports all task-related functionality:
 * - Core task operations (CRUD)
 * - Task searching and filtering
 * - Task comments
 * - File attachments
 * - Task tags
 * - Custom fields
 */

// Export the main TaskService class
export { TaskService } from './task-service.js';

// Export all component services
export { TaskServiceCore } from './task-core.js';
export { TaskServiceSearch } from './task-search.js';
export { TaskServiceAttachments } from './task-attachments.js';
export { TaskServiceComments } from './task-comments.js';
export { TaskServiceDependencies } from './task-dependencies.js';
export { TaskServiceTags } from './task-tags.js';
export { TaskServiceCustomFields } from './task-custom-fields.js';

// Export types and interfaces from all modules
export * from './task-core.js';
export * from './task-search.js';
export * from './task-attachments.js';
export * from './task-comments.js';
export * from './task-dependencies.js';
export * from './task-tags.js';
export * from './task-custom-fields.js';

// Re-export TaskService as the default export
export { TaskService as default } from './task-service.js'; 