import React, { useState } from "react";
import ReactFlow from "reactflow";
import "reactflow/dist/style.css";

function App() {
  const [workflowDescription, setWorkflowDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Handle workflow description submission
    console.log("Workflow description:", workflowDescription);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">WorkflowViz</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Input Form */}
        <div className="px-4 py-6 sm:px-0">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="workflow" className="sr-only">
                Describe your workflow
              </label>
              <input
                type="text"
                id="workflow"
                name="workflow"
                value={workflowDescription}
                onChange={(e) => setWorkflowDescription(e.target.value)}
                placeholder="Describe your workflow in plain language..."
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </form>
        </div>

        {/* Workflow Canvas */}
        <div className="px-4 py-6 sm:px-0">
          <div className="h-96 rounded-lg border-2 border-dashed border-gray-200">
            <ReactFlow />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
