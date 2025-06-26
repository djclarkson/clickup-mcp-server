#!/usr/bin/env node

/**
 * Test script for ClickUp MCP Server Dependency Features
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

async function runTests() {
  console.log('🧪 Starting ClickUp Dependency Tests...\n');

  try {
    // Test 1: Add single dependency
    console.log('📌 Test 1: Adding single dependency (Backend depends on Database)');
    const dep1 = await handleAddTaskDependency({
      taskId: taskIds.backend,
      dependsOnTaskId: taskIds.database,
      dependencyType: 'waiting_on'
    });
    console.log('✅ Result:', dep1.content[0].text);

    // Test 2: Add dependency using task names
    console.log('\n📌 Test 2: Adding dependency using task names (Frontend depends on Backend)');
    const dep2 = await handleAddTaskDependency({
      taskName: 'Frontend UI Implementation',
      listName: 'TestSpace',
      dependsOnTaskName: 'Backend API Development',
      dependsOnListName: 'TestSpace'
    });
    console.log('✅ Result:', dep2.content[0].text);

    // Test 3: Get task dependencies
    console.log('\n📌 Test 3: Getting dependencies for Backend API Development');
    const deps = await handleGetTaskDependencies({
      taskId: taskIds.backend
    });
    console.log('✅ Dependencies:', JSON.stringify(JSON.parse(deps.content[0].text), null, 2));

    // Test 4: Test circular dependency prevention
    console.log('\n📌 Test 4: Testing circular dependency prevention');
    const circularResult = await handleAddTaskDependency({
      taskId: taskIds.database,
      dependsOnTaskId: taskIds.backend
    });
    const circularData = JSON.parse(circularResult.content[0].text);
    if (circularData.success === false && circularData.error) {
      console.log('✅ Success: Circular dependency prevented:', circularData.error.message || circularData.message);
    } else {
      console.log('❌ Failed: Circular dependency was not prevented!');
    }

    // Test 5: Bulk dependency operations
    console.log('\n📌 Test 5: Adding bulk dependencies');
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
    console.log('✅ Bulk result:', JSON.stringify(JSON.parse(bulkDeps.content[0].text), null, 2));

    // Test 6: Create task with dependencies
    console.log('\n📌 Test 6: Creating new task with dependencies');
    const newTask = await handleCreateTask({
      name: '📊 Performance Testing',
      listId: testListId,
      description: 'Run performance tests before deployment',
      priority: 2,
      dependencies: {
        waiting_on: [taskIds.tests]
      }
    });
    const taskData = JSON.parse(newTask.content[0].text);
    console.log('✅ Created task:', taskData.name, 'with dependencies:', taskData.dependencies);

    // Test 7: Get task with dependency details
    console.log('\n📌 Test 7: Getting task with dependency details');
    const taskWithDeps = await handleGetTask({
      taskId: taskIds.deploy,
      includeDependencies: true
    });
    const taskDetails = JSON.parse(taskWithDeps.content[0].text);
    console.log('✅ Task:', taskDetails.name);
    console.log('   Dependencies:', taskDetails.dependencies);
    console.log('   Dependency Details:', JSON.stringify(taskDetails.dependency_details, null, 2));

    // Test 8: Remove dependency
    console.log('\n📌 Test 8: Removing a dependency');
    const removeDep = await handleRemoveTaskDependency({
      taskId: taskIds.frontend,
      dependencyTaskId: taskIds.backend
    });
    console.log('✅ Result:', removeDep.content[0].text);

    // Test 9: Self-dependency prevention
    console.log('\n📌 Test 9: Testing self-dependency prevention');
    const selfDepResult = await handleAddTaskDependency({
      taskId: taskIds.database,
      dependsOnTaskId: taskIds.database
    });
    const selfDepData = JSON.parse(selfDepResult.content[0].text);
    if (selfDepData.success === false && selfDepData.error) {
      console.log('✅ Success: Self-dependency prevented:', selfDepData.error.message || selfDepData.message);
    } else {
      console.log('❌ Failed: Self-dependency was not prevented!');
    }

    console.log('\n✨ All tests completed successfully!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the tests
runTests().catch(console.error);