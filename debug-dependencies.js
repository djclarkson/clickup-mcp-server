#!/usr/bin/env node

/**
 * Debug script to check ClickUp API dependency responses
 */

import axios from 'axios';

const API_KEY = 'pk_60741432_FFER7MJVE0PASA53I2KKVNJVLF2UM1U5';
const TEAM_ID = '9003065917';

const client = axios.create({
  baseURL: 'https://api.clickup.com/api/v2',
  headers: {
    'Authorization': API_KEY,
    'Content-Type': 'application/json'
  }
});

async function checkTaskDependencies() {
  console.log('🔍 Checking task dependencies via ClickUp API...\n');

  const taskIds = {
    backend: '86etyf169',
    database: '86etyf16e',
    frontend: '86etyf16d',
    tests: '86etyf18g',
    deploy: '86etyf18b'
  };

  try {
    // Get task details with dependencies
    console.log('📌 Getting Backend task details:');
    const backendTask = await client.get(`/task/${taskIds.backend}`);
    console.log('Dependencies field:', backendTask.data.dependencies);
    
    // Try to get dependencies using v2 API
    console.log('\n📌 Checking if dependency endpoint exists:');
    try {
      const deps = await client.get(`/task/${taskIds.backend}/dependency`);
      console.log('Dependency endpoint response:', deps.data);
    } catch (error) {
      console.log('Dependency endpoint error:', error.response?.status, error.response?.data || error.message);
    }

    // Check task for dependency of field
    console.log('\n📌 Checking dependency_of field:');
    if (backendTask.data.dependency_of) {
      console.log('dependency_of:', backendTask.data.dependency_of);
    } else {
      console.log('No dependency_of field found');
    }

    // List all tasks to see dependency structure
    console.log('\n📌 Listing all tasks in TestSpace:');
    const listTasks = await client.get(`/list/901809019170/task`);
    const tasksWithDeps = listTasks.data.tasks.filter(t => 
      t.dependencies?.length > 0 || t.dependency_of?.length > 0
    );
    
    console.log(`Found ${tasksWithDeps.length} tasks with dependencies:`);
    tasksWithDeps.forEach(task => {
      console.log(`- ${task.name}:`);
      if (task.dependencies?.length > 0) {
        console.log(`  Dependencies: ${JSON.stringify(task.dependencies)}`);
      }
      if (task.dependency_of?.length > 0) {
        console.log(`  Dependency of: ${JSON.stringify(task.dependency_of)}`);
      }
    });

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

checkTaskDependencies();