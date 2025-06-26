#!/usr/bin/env node

/**
 * Final test script for ClickUp MCP Server Dependency Features
 * 
 * This script tests all dependency-related functionality using the TestSpace list.
 * Make sure to build the project first: npm run build
 */

import { clickUpServices } from './build/services/shared.js';
import { 
  handleAddTaskDependency,
  handleRemoveTaskDependency,
  handleGetTaskDependencies,
  handleAddBulkDependencies,
  handleCreateTask,
  handleGetTask
} from './build/tools/task/index.js';

const testListId = '901809019170'; // TestSpace list ID

// Test task IDs from the created tasks
const taskIds = {
  backend: '86etyf169',
  database: '86etyf16e',
  frontend: '86etyf16d',
  tests: '86etyf18g',
  deploy: '86etyf18b'
};

// Helper to parse response
function parseResponse(response) {
  if (response && response.content && response.content[0] && response.content[0].text) {
    try {
      return JSON.parse(response.content[0].text);
    } catch (e) {
      return response.content[0].text;
    }
  }
  return response;
}

async function runTests() {
  console.log('🧪 Starting ClickUp Dependency Tests...\n');

  try {
    // First, clean up any existing dependencies
    console.log('🧹 Cleaning up existing dependencies...');
    try {
      await handleRemoveTaskDependency({
        taskId: taskIds.backend,
        dependencyTaskId: taskIds.database
      });
    } catch (e) {} // Ignore errors
    
    try {
      await handleRemoveTaskDependency({
        taskId: taskIds.database,
        dependencyTaskId: taskIds.backend
      });
    } catch (e) {} // Ignore errors

    // Test 1: Add single dependency
    console.log('\n📌 Test 1: Adding single dependency (Backend depends on Database)');
    const dep1 = await handleAddTaskDependency({
      taskId: taskIds.backend,
      dependsOnTaskId: taskIds.database,
      dependencyType: 'waiting_on'
    });
    const dep1Data = parseResponse(dep1);
    console.log('✅ Result:', typeof dep1Data === 'object' ? JSON.stringify(dep1Data, null, 2) : dep1Data);

    // Test 2: Get task dependencies
    console.log('\n📌 Test 2: Getting dependencies for Backend API Development');
    const deps = await handleGetTaskDependencies({
      taskId: taskIds.backend
    });
    const depsData = parseResponse(deps);
    console.log('✅ Dependencies:', JSON.stringify(depsData, null, 2));

    // Test 3: Test self-dependency prevention
    console.log('\n📌 Test 3: Testing self-dependency prevention');
    const selfDep = await handleAddTaskDependency({
      taskId: taskIds.database,
      dependsOnTaskId: taskIds.database
    });
    const selfDepData = parseResponse(selfDep);
    
    if (selfDepData.error || (selfDepData.content && selfDepData.content[0].text.includes('error'))) {
      console.log('✅ Success: Self-dependency prevented!');
      console.log('   Error message:', selfDepData.error || 'Self-dependency error');
    } else {
      console.log('❌ Failed: Self-dependency was allowed!');
    }

    // Test 4: Test circular dependency prevention
    console.log('\n📌 Test 4: Testing circular dependency prevention');
    const circularDep = await handleAddTaskDependency({
      taskId: taskIds.database,
      dependsOnTaskId: taskIds.backend
    });
    const circularData = parseResponse(circularDep);
    
    if (circularData.error || (circularData.content && circularData.content[0].text.includes('error'))) {
      console.log('✅ Success: Circular dependency prevented!');
      console.log('   Error message:', circularData.error || 'Circular dependency error');
    } else {
      console.log('❌ Failed: Circular dependency was allowed!');
    }

    // Test 5: Remove dependency
    console.log('\n📌 Test 5: Removing a dependency');
    const removeDep = await handleRemoveTaskDependency({
      taskId: taskIds.backend,
      dependencyTaskId: taskIds.database
    });
    console.log('✅ Result:', parseResponse(removeDep));

    // Test 6: Bulk dependency operations
    console.log('\n📌 Test 6: Adding bulk dependencies');
    const bulkDeps = await handleAddBulkDependencies({
      dependencies: [
        {
          taskId: taskIds.tests,
          dependsOn: [taskIds.backend, taskIds.frontend]
        },
        {
          taskId: taskIds.deploy,
          dependsOn: [taskIds.tests]
        }
      ],
      options: {
        continueOnError: true
      }
    });
    console.log('✅ Bulk result:', JSON.stringify(parseResponse(bulkDeps), null, 2));

    // Test 7: Create task with dependencies
    console.log('\n📌 Test 7: Creating new task with dependencies');
    const newTask = await handleCreateTask({
      name: '📊 Performance Testing ' + Date.now(),
      listId: testListId,
      description: 'Run performance tests before deployment',
      priority: 2,
      dependencies: {
        waiting_on: [taskIds.tests]
      }
    });
    const taskData = parseResponse(newTask);
    console.log('✅ Created task:', taskData.name);
    if (taskData.dependencies && taskData.dependencies.length > 0) {
      console.log('   Dependencies created:', taskData.dependencies.length);
    }

    // Test 8: Get task with dependency details
    console.log('\n📌 Test 8: Getting task with dependency details');
    const taskWithDeps = await handleGetTask({
      taskId: taskIds.deploy,
      includeDependencies: true
    });
    const taskDetails = parseResponse(taskWithDeps);
    console.log('✅ Task:', taskDetails.name);
    if (taskDetails.dependency_details) {
      console.log('   Dependency Details:', JSON.stringify(taskDetails.dependency_details, null, 2));
    }

    console.log('\n✨ All tests completed!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the tests
runTests().catch(console.error);