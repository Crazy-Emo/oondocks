import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { Terminal } from "./components/Terminal";

export default function App() {
  return (
    <div className="min-h-screen bg-[#1E1E1E] text-[#D4D4D4] font-mono">
      <Authenticated>
        <div className="flex flex-col h-screen">
          <header className="flex justify-between items-center p-4 border-b border-gray-700 bg-[#252526]">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="ml-4 text-sm text-gray-300">emergent-shell</span>
            </div>
            <SignOutButton />
          </header>
          <main className="flex-1 overflow-hidden">
            <Terminal />
          </main>
        </div>
      </Authenticated>
      
      <Unauthenticated>
        <div className="min-h-screen flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-[#569CD6] mb-2">emergent-shell</h1>
              <p className="text-gray-400">AI-powered code generation terminal</p>
            </div>
            <SignInForm />
          </div>
        </div>
      </Unauthenticated>
      
      <Toaster theme="dark" />
    </div>
  );
}
