#!/usr/bin/env node

import { clickUpServices } from './build/services/shared.js';

const taskService = clickUpServices.task;

async function testCircularDependencyCheck() {
  console.log('🔍 Testing circular dependency prevention...\n');
  
  const taskIds = {
    backend: '86etyf169',
    database: '86etyf16e'
  };
  
  try {
    // Check existing dependencies
    console.log('📌 Checking existing dependencies:');
    const backendDeps = await taskService.getTaskDependencies({ taskId: taskIds.backend });
    console.log('Backend dependencies:', JSON.stringify(backendDeps, null, 2));
    
    const databaseDeps = await taskService.getTaskDependencies({ taskId: taskIds.database });
    console.log('\nDatabase dependencies:', JSON.stringify(databaseDeps, null, 2));
    
    // Try to create a circular dependency
    console.log('\n📌 Attempting to create circular dependency (Database depends on Backend):');
    try {
      const result = await taskService.addTaskDependency({
        taskId: taskIds.database,
        dependsOnTaskId: taskIds.backend
      });
      console.log('❌ ERROR: Circular dependency was allowed!', result);
    } catch (error) {
      console.log('✅ Success: Circular dependency prevented!');
      console.log('Error:', error.message);
    }
    
    // Try to create a self-dependency
    console.log('\n📌 Attempting to create self-dependency:');
    try {
      const result = await taskService.addTaskDependency({
        taskId: taskIds.backend,
        dependsOnTaskId: taskIds.backend
      });
      console.log('❌ ERROR: Self-dependency was allowed!', result);
    } catch (error) {
      console.log('✅ Success: Self-dependency prevented!');
      console.log('Error:', error.message);
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testCircularDependencyCheck();