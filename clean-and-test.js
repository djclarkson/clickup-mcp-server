#!/usr/bin/env node

/**
 * Clean test for dependency validation
 */

import axios from 'axios';

const API_KEY = 'pk_60741432_FFER7MJVE0PASA53I2KKVNJVLF2UM1U5';
const LIST_ID = '901809019170'; // TestSpace

const client = axios.create({
  baseURL: 'https://api.clickup.com/api/v2',
  headers: {
    'Authorization': API_KEY,
    'Content-Type': 'application/json'
  }
});

async function cleanAndTest() {
  console.log('🧹 Creating fresh test tasks...\n');
  
  try {
    // Create two new tasks
    console.log('Creating Task A...');
    const taskA = await client.post(`/list/${LIST_ID}/task`, {
      name: '🅰️ Test Task A',
      description: 'Task for dependency testing'
    });
    console.log('Task A created:', taskA.data.id);
    
    console.log('Creating Task B...');
    const taskB = await client.post(`/list/${LIST_ID}/task`, {
      name: '🅱️ Test Task B',
      description: 'Task for dependency testing'
    });
    console.log('Task B created:', taskB.data.id);
    
    // Test 1: Normal dependency (A depends on B)
    console.log('\n📌 Test 1: Creating normal dependency (A depends on B)');
    try {
      await client.post(`/task/${taskA.data.id}/link/${taskB.data.id}`, {});
      console.log('✅ Normal dependency created successfully');
    } catch (error) {
      console.log('❌ Failed to create normal dependency:', error.response?.data);
    }
    
    // Test 2: Self-dependency
    console.log('\n📌 Test 2: Attempting self-dependency');
    try {
      await client.post(`/task/${taskA.data.id}/link/${taskA.data.id}`, {});
      console.log('❌ ERROR: Self-dependency was allowed!');
    } catch (error) {
      console.log('✅ Self-dependency prevented by API:', error.response?.data);
    }
    
    // Test 3: Circular dependency
    console.log('\n📌 Test 3: Attempting circular dependency (B depends on A)');
    try {
      await client.post(`/task/${taskB.data.id}/link/${taskA.data.id}`, {});
      console.log('❌ ERROR: Circular dependency was allowed!');
    } catch (error) {
      console.log('✅ Circular dependency prevented by API:', error.response?.data);
    }
    
    // Check the final state
    console.log('\n📌 Final state:');
    const finalTaskA = await client.get(`/task/${taskA.data.id}`);
    console.log('Task A dependencies:', finalTaskA.data.dependencies);
    
    const finalTaskB = await client.get(`/task/${taskB.data.id}`);
    console.log('Task B dependencies:', finalTaskB.data.dependencies);
    
    // Clean up
    console.log('\n🧹 Cleaning up test tasks...');
    await client.delete(`/task/${taskA.data.id}`);
    await client.delete(`/task/${taskB.data.id}`);
    console.log('✅ Test tasks deleted');
    
  } catch (error) {
    console.error('Test error:', error.response?.data || error.message);
  }
}

cleanAndTest();