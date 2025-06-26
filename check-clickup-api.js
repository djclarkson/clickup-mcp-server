#!/usr/bin/env node

/**
 * Check how ClickUp API actually handles dependencies
 */

import axios from 'axios';

const API_KEY = 'pk_60741432_FFER7MJVE0PASA53I2KKVNJVLF2UM1U5';

const client = axios.create({
  baseURL: 'https://api.clickup.com/api/v2',
  headers: {
    'Authorization': API_KEY,
    'Content-Type': 'application/json'
  }
});

async function testDependencyMethods() {
  const taskId = '86etyf169'; // Backend task
  const dependsOn = '86etyf16e'; // Database task
  
  console.log('🔍 Testing ClickUp dependency methods...\n');
  
  // Method 1: Update task with dependencies array
  console.log('📌 Method 1: Update task with dependencies array');
  try {
    // First get current task
    const task = await client.get(`/task/${taskId}`);
    console.log('Current dependencies:', task.data.dependencies);
    
    // Try to update by modifying the task
    const updateData = {
      dependencies_add: [{
        task_id: '86etyf16d' // Frontend task
      }]
    };
    
    const result = await client.put(`/task/${taskId}`, updateData);
    console.log('Update result:', result.data.dependencies);
  } catch (error) {
    console.log('Error:', error.response?.data || error.message);
  }
  
  // Method 2: Check if there's a link endpoint
  console.log('\n📌 Method 2: Checking link endpoint');
  try {
    const linkData = {
      depends_on: dependsOn
    };
    const result = await client.post(`/task/${taskId}/link/${dependsOn}`, linkData);
    console.log('Link result:', result.data);
  } catch (error) {
    console.log('Error:', error.response?.status, error.response?.data || error.message);
  }
  
  // Method 3: Check task relationship endpoints
  console.log('\n📌 Method 3: Checking relationship endpoints');
  try {
    const result = await client.get(`/task/${taskId}/field`);
    console.log('Task fields:', result.data);
  } catch (error) {
    console.log('Error:', error.response?.status, error.response?.data || error.message);
  }
}

testDependencyMethods();