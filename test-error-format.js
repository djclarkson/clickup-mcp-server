#!/usr/bin/env node

import { 
  handleAddTaskDependency
} from './build/tools/task/index.js';

async function testErrorFormat() {
  console.log('Testing error response format...\n');
  
  // Test self-dependency
  console.log('Testing self-dependency:');
  const result = await handleAddTaskDependency({
    taskId: '86etyf169',
    dependsOnTaskId: '86etyf169'
  });
  
  console.log('Raw result:', result);
  console.log('\nContent:', result.content);
  console.log('\nParsed content:', JSON.parse(result.content[0].text));
}

testErrorFormat().catch(console.error);