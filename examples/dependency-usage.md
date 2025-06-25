# Task Dependencies Usage Examples

This document provides examples of how to use the task dependency features in the ClickUp MCP Server.

## Basic Dependency Operations

### 1. Creating a Task with Dependencies

```typescript
// Create a task that depends on other tasks
const newTask = await mcp.invoke("create_task", {
  name: "🚀 Deploy to Production",
  listName: "Release Tasks",
  description: "Deploy the application to production environment",
  priority: 1,
  dependencies: {
    waiting_on: ["task123", "task456", "task789"] // IDs of tasks this depends on
  }
});
```

### 2. Adding Dependencies to Existing Tasks

```typescript
// Add a single dependency
const result = await mcp.invoke("add_task_dependency", {
  taskId: "backend-task-id",
  dependsOnTaskId: "database-task-id",
  dependencyType: "waiting_on" // optional, defaults to "waiting_on"
});

// Using task names instead of IDs
const result = await mcp.invoke("add_task_dependency", {
  taskName: "Backend API Implementation",
  listName: "Development", // recommended for faster lookup
  dependsOnTaskName: "Database Schema Design",
  dependsOnListName: "Development"
});
```

### 3. Retrieving Task Dependencies

```typescript
// Get dependencies for a task
const dependencies = await mcp.invoke("get_task_dependencies", {
  taskId: "task123",
  includeSubtasks: true // optional, includes subtask dependencies
});

// Response structure:
{
  "task": {
    "id": "task123",
    "name": "Deploy to Production"
  },
  "dependencies": {
    "waiting_on": [
      {
        "task_id": "task456",
        "task_name": "Run Tests",
        "status": "complete",
        "list": { "id": "list1", "name": "QA" }
      },
      {
        "task_id": "task789",
        "task_name": "Code Review",
        "status": "in_progress",
        "list": { "id": "list2", "name": "Development" }
      }
    ],
    "blocking": [] // Tasks that this task is blocking
  }
}
```

### 4. Getting Task Details with Dependencies

```typescript
// Get task with dependency information included
const task = await mcp.invoke("get_task", {
  taskId: "task123",
  includeDependencies: true // defaults to true
});

// The response will include a dependency_details field:
{
  "id": "task123",
  "name": "Deploy to Production",
  // ... other task fields ...
  "dependencies": ["task456", "task789"], // Just IDs
  "dependency_details": { // Full details
    "waiting_on": [
      {
        "task_id": "task456",
        "task_name": "Run Tests",
        "status": "complete",
        "list": { "id": "list1", "name": "QA" }
      }
    ],
    "blocking": []
  }
}
```

### 5. Removing Dependencies

```typescript
// Remove a dependency
const result = await mcp.invoke("remove_task_dependency", {
  taskId: "backend-task-id",
  dependencyTaskId: "database-task-id"
});
```

## Bulk Operations

### 6. Adding Multiple Dependencies at Once

```typescript
// Set up complex dependency chains efficiently
const result = await mcp.invoke("add_bulk_dependencies", {
  dependencies: [
    {
      taskId: "phase2-start",
      dependsOn: ["phase1-task1", "phase1-task2", "phase1-task3"]
    },
    {
      taskId: "phase3-start",
      dependsOn: ["phase2-start", "phase2-qa"]
    },
    {
      taskId: "deployment",
      dependsOn: ["phase3-start", "security-review", "performance-test"]
    }
  ],
  options: {
    continueOnError: true, // Continue if some dependencies fail
    retryCount: 2 // Retry failed operations
  }
});

// Response includes details about successes and failures:
{
  "successful": [
    { "taskId": "phase2-start", "dependsOn": "phase1-task1", "success": true },
    // ... more successful operations
  ],
  "failed": [
    { 
      "taskId": "deployment", 
      "dependsOn": "security-review", 
      "error": "Task not found" 
    }
  ],
  "summary": {
    "total": 8,
    "success": 7,
    "failed": 1
  }
}
```

## Advanced Scenarios

### 7. Project Phase Dependencies

```typescript
// Example: Setting up a multi-phase project
const phases = {
  planning: ["research", "requirements", "design"],
  development: ["backend", "frontend", "database"],
  testing: ["unit-tests", "integration-tests", "user-testing"],
  deployment: ["staging", "production"]
};

// Create dependencies between phases
await mcp.invoke("add_bulk_dependencies", {
  dependencies: [
    // Development depends on all planning tasks
    ...phases.development.map(devTask => ({
      taskId: devTask,
      dependsOn: phases.planning
    })),
    // Testing depends on development
    ...phases.testing.map(testTask => ({
      taskId: testTask,
      dependsOn: phases.development
    })),
    // Deployment depends on testing
    ...phases.deployment.map(deployTask => ({
      taskId: deployTask,
      dependsOn: phases.testing
    }))
  ]
});
```

### 8. Conditional Task Creation with Dependencies

```typescript
// Create a deployment task only after prerequisites are met
async function createDeploymentTask(environment: string, prerequisites: string[]) {
  // First, verify all prerequisites exist and are complete
  const prereqStatuses = await Promise.all(
    prerequisites.map(taskId => 
      mcp.invoke("get_task", { taskId, includeDependencies: false })
    )
  );
  
  const incompletePrereqs = prereqStatuses.filter(
    task => task.status.status !== 'complete'
  );
  
  if (incompletePrereqs.length > 0) {
    throw new Error(
      `Cannot create deployment task. Incomplete prerequisites: ${
        incompletePrereqs.map(t => t.name).join(', ')
      }`
    );
  }
  
  // Create the deployment task with dependencies
  return await mcp.invoke("create_task", {
    name: `🚀 Deploy to ${environment}`,
    listName: "Deployments",
    priority: 1,
    dependencies: {
      waiting_on: prerequisites
    }
  });
}
```

## Error Handling

### 9. Handling Circular Dependencies

```typescript
try {
  // This will fail - circular dependency
  await mcp.invoke("add_task_dependency", {
    taskId: "taskA",
    dependsOnTaskId: "taskB"
  });
  
  await mcp.invoke("add_task_dependency", {
    taskId: "taskB",
    dependsOnTaskId: "taskA" // Error: Circular dependency
  });
} catch (error) {
  console.error("Circular dependency detected:", error.message);
}
```

### 10. Handling Non-existent Tasks

```typescript
try {
  await mcp.invoke("add_task_dependency", {
    taskName: "Backend API",
    listName: "Development",
    dependsOnTaskName: "Non-existent Task",
    dependsOnListName: "Development"
  });
} catch (error) {
  // Error: Task "Non-existent Task" not found in list "Development"
  console.error("Task not found:", error.message);
}
```

## Best Practices

1. **Always use task IDs when available** - They're more reliable than names
2. **Provide list names with task names** - Improves performance and reduces ambiguity
3. **Check for circular dependencies** - The API prevents them, but plan accordingly
4. **Use bulk operations for complex setups** - More efficient than individual calls
5. **Monitor task completion** - Dependencies affect when tasks can be started
6. **Include dependencies in get_task calls** - Get a complete picture of task relationships

## Workflow Integration

Dependencies work seamlessly with ClickUp's native features:
- Tasks with unmet dependencies show as blocked in the UI
- Completing a task automatically unblocks dependent tasks
- Gantt charts visualize dependency chains
- Critical path analysis becomes possible with proper dependencies