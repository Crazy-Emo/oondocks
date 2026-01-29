import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api } from "./_generated/api";

export const list = query({
  args: { projectId: v.optional(v.id("projects")) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    
    let query = ctx.db.query("commands").withIndex("by_user", (q) => q.eq("userId", userId));
    
    if (args.projectId) {
      query = ctx.db.query("commands").withIndex("by_project", (q) => q.eq("projectId", args.projectId));
    }
    
    return await query.order("desc").take(50);
  },
});

export const execute = mutation({
  args: {
    command: v.string(),
    projectId: v.optional(v.id("projects")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    // Store the command
    const commandId = await ctx.db.insert("commands", {
      command: args.command,
      output: "Processing...",
      projectId: args.projectId,
      userId,
      timestamp: Date.now(),
    });
    
    // Schedule processing
    await ctx.scheduler.runAfter(0, api.commands.processCommand, {
      commandId,
      command: args.command,
      projectId: args.projectId,
    });
    
    return commandId;
  },
});

export const processCommand = action({
  args: {
    commandId: v.id("commands"),
    command: v.string(),
    projectId: v.optional(v.id("projects")),
  },
  handler: async (ctx, args) => {
    let output = "";
    
    try {
      // Parse command
      const parts = args.command.trim().split(" ");
      const cmd = parts[0];
      const cmdArgs = parts.slice(1);
      
      switch (cmd) {
        case "create":
          if (cmdArgs.length < 2) {
            output = "Usage: create <type> <name> [language]";
            break;
          }
          const type = cmdArgs[0] as "app" | "website" | "component";
          const name = cmdArgs[1];
          const language = cmdArgs[2] || "javascript";
          
          if (!["app", "website", "component"].includes(type)) {
            output = "Error: Type must be 'app', 'website', or 'component'";
            break;
          }
          
          const projectId = await ctx.runMutation(api.projects.create, {
            name,
            type,
            language,
            code: generateBoilerplate(type, language),
          });
          
          output = `✓ Created ${type} project '${name}' with ID: ${projectId}`;
          break;
          
        case "generate":
          if (cmdArgs.length < 1) {
            output = "Usage: generate <description>";
            break;
          }
          const description = cmdArgs.join(" ");
          output = await generateCode(description);
          break;
          
        case "help":
          output = `Available commands:
• create <type> <name> [language] - Create a new project
• generate <description> - Generate code from description
• list - List all projects
• edit <project-id> - Edit a project
• preview <project-id> - Preview a project
• help - Show this help message`;
          break;
          
        case "list":
          const projects = await ctx.runQuery(api.projects.list);
          if (projects.length === 0) {
            output = "No projects found. Use 'create' to start a new project.";
          } else {
            output = "Your projects:\n" + projects.map(p => 
              `• ${p.name} (${p.type}) - ${p.language} - ID: ${p._id}`
            ).join("\n");
          }
          break;
          
        default:
          output = `Unknown command: ${cmd}. Type 'help' for available commands.`;
      }
    } catch (error) {
      output = `Error: ${error instanceof Error ? error.message : "Unknown error"}`;
    }
    
    // Update command with output
    await ctx.runMutation(api.commands.updateOutput, {
      commandId: args.commandId,
      output,
    });
  },
});

export const updateOutput = mutation({
  args: {
    commandId: v.id("commands"),
    output: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.commandId, { output: args.output });
  },
});

function generateBoilerplate(type: string, language: string): string {
  if (type === "app" && language === "javascript") {
    return `// React App Boilerplate
import React, { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="app">
      <h1>My App</h1>
      <button onClick={() => setCount(count + 1)}>
        Count: {count}
      </button>
    </div>
  );
}

export default App;`;
  }
  
  if (type === "website" && language === "html") {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Website</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .container { max-width: 800px; margin: 0 auto; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Welcome to My Website</h1>
        <p>This is a basic website template.</p>
    </div>
</body>
</html>`;
  }
  
  return `// ${type} in ${language}
console.log("Hello, world!");`;
}

async function generateCode(description: string): Promise<string> {
  // This would integrate with AI in a real implementation
  return `// Generated code for: ${description}
// This is a placeholder - integrate with AI service for real code generation
function generatedFunction() {
  // Implementation based on: ${description}
  console.log("Generated code placeholder");
}`;
}
