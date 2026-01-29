import { useState } from "react";

interface CodeBlockProps {
  content: string;
  language?: string;
}

export function CodeBlock({ content, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  // Simple syntax highlighting for common patterns
  const highlightSyntax = (text: string) => {
    return text
      .replace(/\/\/.*$/gm, '<span class="text-green-400">$&</span>') // Comments
      .replace(/\b(function|const|let|var|if|else|for|while|return|import|export|class|extends)\b/g, '<span class="text-[#569CD6]">$1</span>') // Keywords
      .replace(/"([^"]*)"/g, '<span class="text-[#CE9178]">"$1"</span>') // Strings
      .replace(/\b(\d+)\b/g, '<span class="text-[#B5CEA8]">$1</span>') // Numbers
      .replace(/\b(true|false|null|undefined)\b/g, '<span class="text-[#569CD6]">$1</span>'); // Literals
  };

  const isCode = content.includes("function") || content.includes("const") || content.includes("//") || content.includes("<");

  if (!isCode) {
    return (
      <div className="text-gray-300 whitespace-pre-wrap font-mono text-sm">
        {content}
      </div>
    );
  }

  return (
    <div className="relative group">
      <div className="bg-[#2D2D30] rounded-lg border border-gray-600 overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 bg-[#3C3C3C] border-b border-gray-600">
          <span className="text-xs text-gray-400">{language || "code"}</span>
          <button
            onClick={handleCopy}
            className="text-xs text-gray-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-gray-600"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <div className="p-3 overflow-x-auto">
          <pre className="text-sm">
            <code 
              dangerouslySetInnerHTML={{ 
                __html: highlightSyntax(content) 
              }}
            />
          </pre>
        </div>
      </div>
    </div>
  );
}
