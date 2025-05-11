import React, { useState, useMemo } from "react";
import { useWorkflows } from "@/hooks/useWorkflows"; // Assuming hooks are in this path
import { Workflow } from "@/hooks/useWorkflows"; // Import the Workflow type

// Import shadcn/ui components (assuming they are added to the project)
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton"; // For loading state
import { AlertCircle } from "lucide-react"; // Icon for errors

// Helper to format dates (example)
const formatDate = (dateString: string): string => {
  try {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(dateString));
  } catch (e) {
    return "Invalid Date";
  }
};

const WorkflowDashboard: React.FC = () => {
  const { data: workflows, isLoading, error } = useWorkflows();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredWorkflows = useMemo(() => {
    if (!workflows) return [];
    if (!searchTerm) return workflows;
    return workflows.filter((workflow) =>
      workflow.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [workflows, searchTerm]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Placeholder action handlers
  const handleView = (id: string) => console.log("View workflow:", id);
  const handleEdit = (id: string) => console.log("Edit workflow:", id);
  const handleDelete = (id: string) => console.log("Delete workflow:", id);

  return (
    <div className="p-4 md:p-6 space-y-4">
      <h1 className="text-2xl font-semibold text-gray-800">My Workflows</h1>

      {/* Search Input */}
      <div className="max-w-sm">
        <Input
          type="text"
          placeholder="Search workflows by name..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full"
        />
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded-md flex items-center space-x-2">
          <AlertCircle className="h-5 w-5" />
          <span>Error fetching workflows: {error.message}</span>
        </div>
      )}

      {/* Data Table */}
      {!isLoading && !error && workflows && (
        <div className="border rounded-lg overflow-hidden shadow-sm bg-white">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="w-[40%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Workflow Name
                </TableHead>
                <TableHead className="w-[30%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Modified
                </TableHead>
                <TableHead className="w-[30%] px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-200">
              {filteredWorkflows.length > 0 ? (
                filteredWorkflows.map((workflow: Workflow) => (
                  <TableRow key={workflow._id} className="hover:bg-gray-50">
                    <TableCell className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-800">
                      {workflow.name}
                    </TableCell>
                    <TableCell className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(workflow.updatedAt)}
                    </TableCell>
                    <TableCell className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleView(workflow._id)}
                        className="px-2 py-1 h-auto text-xs"
                      >
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(workflow._id)}
                        className="px-2 py-1 h-auto text-xs"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(workflow._id)}
                        className="px-2 py-1 h-auto text-xs"
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="px-4 py-6 text-center text-sm text-gray-500"
                  >
                    {searchTerm
                      ? "No workflows match your search."
                      : "No workflows created yet."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
      {!isLoading && !error && !workflows?.length && (
        <div className="text-center py-10 text-gray-500">
          No workflows found. Create your first one!
          {/* Optionally add a "Create New Workflow" button here */}
        </div>
      )}
    </div>
  );
};

export default WorkflowDashboard;
