import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { CodeBlock } from "./CodeBlock";
import { Id } from "../../convex/_generated/dataModel";

export function Terminal() {
  const [input, setInput] = useState("");
  const [currentProject, setCurrentProject] = useState<Id<"projects"> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const commands = useQuery(api.commands.list, { projectId: currentProject || undefined }) || [];
  const executeCommand = useMutation(api.commands.execute);
  const projects = useQuery(api.projects.list) || [];
  
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [commands]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const command = input.trim();
    setInput("");
    setIsLoading(true);

    try {
      await executeCommand({
        command,
        projectId: currentProject || undefined,
      });
    } catch (error) {
      console.error("Command execution failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowUp" && commands.length > 0) {
      e.preventDefault();
      const lastCommand = commands[0]?.command;
      if (lastCommand) setInput(lastCommand);
    }
  };

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-64 bg-[#252526] border-r border-gray-700 p-4">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Projects</h3>
        <div className="space-y-1">
          <button
            onClick={() => setCurrentProject(null)}
            className={`w-full text-left px-2 py-1 rounded text-sm transition-colors ${
              !currentProject ? "bg-[#569CD6] text-white" : "text-gray-400 hover:text-white hover:bg-gray-700"
            }`}
          >
            Global Terminal
          </button>
          {projects.map((project) => (
            <button
              key={project._id}
              onClick={() => setCurrentProject(project._id)}
              className={`w-full text-left px-2 py-1 rounded text-sm transition-colors ${
                currentProject === project._id ? "bg-[#569CD6] text-white" : "text-gray-400 hover:text-white hover:bg-gray-700"
              }`}
            >
              <div className="truncate">{project.name}</div>
              <div className="text-xs opacity-70">{project.type}</div>
            </button>
          ))}
        </div>
        
        <div className="mt-6">
          <h4 className="text-xs font-semibold text-gray-400 mb-2">Quick Commands</h4>
          <div className="space-y-1 text-xs text-gray-500">
            <div>create app myapp</div>
            <div>generate button</div>
            <div>list</div>
            <div>help</div>
          </div>
        </div>
      </div>

      {/* Terminal */}
      <div className="flex-1 flex flex-col">
        <div 
          ref={terminalRef}
          className="flex-1 overflow-y-auto p-4 space-y-4"
        >
          {/* Welcome message */}
          {commands.length === 0 && (
            <div className="text-gray-400 text-sm">
              <div className="mb-2">Welcome to emergent-shell v1.0.0</div>
              <div className="mb-4">Type 'help' to see available commands.</div>
            </div>
          )}

          {/* Command history */}
          {commands.map((cmd) => (
            <div key={cmd._id} className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[#569CD6]">$</span>
                <span className="text-white">{cmd.command}</span>
                <span className="text-xs text-gray-500">
                  {new Date(cmd.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div className="ml-4">
                {cmd.output === "Processing..." ? (
                  <div className="flex items-center gap-2 text-yellow-400">
                    <div className="animate-spin w-3 h-3 border border-yellow-400 border-t-transparent rounded-full"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  <CodeBlock content={cmd.output} />
                )}
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex items-center gap-2">
              <span className="text-[#569CD6]">$</span>
              <span className="text-white">{input}</span>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-gray-700 p-4">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <span className="text-[#569CD6]">$</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter command..."
              className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500"
              disabled={isLoading}
              autoFocus
            />
            {isLoading && (
              <div className="animate-spin w-4 h-4 border border-gray-400 border-t-transparent rounded-full"></div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
