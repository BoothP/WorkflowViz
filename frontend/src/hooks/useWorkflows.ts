import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryKey,
} from "@tanstack/react-query";
import { useState } from "react";
import { Node, Edge } from "reactflow";

// --- Types (Mirroring backend/interfaces, adapt as needed for frontend) ---
// Ideally, these would be shared or generated types

export type NodeType = "trigger" | "action" | "filter" | "llmAgent";

export interface Node {
  id: string;
  type: NodeType;
  label: string;
  config: Record<string, any>;
  // Frontend might add position, width, height from React Flow
  position?: { x: number; y: number };
  width?: number | null;
  height?: number | null;
}

export interface Edge {
  id: string; // React Flow uses id for edges too
  source: string;
  target: string;
  label?: string;
}

export interface Workflow {
  _id: string;
  name: string;
  nodes: Node[];
  edges: Edge[];
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

// Input types for mutations
export interface CreateWorkflowData {
  name: string;
  nodes: Node[];
  edges: Edge[];
}

export interface UpdateWorkflowData {
  name?: string;
  nodes?: Node[];
  edges?: Edge[];
}

// --- Placeholder for Auth Token ---
// Replace with your actual auth state/context logic
const getAuthToken = (): string | null => {
  return localStorage.getItem("authToken");
};

// --- API Configuration ---
const API_BASE_URL = "/api/workflows"; // Adjust if your API prefix is different

// --- API Fetch Helper ---
// Basic helper to handle fetch, auth, and errors
const apiCall = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});
  headers.append("Content-Type", "application/json");
  if (token) {
    headers.append("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: "Failed to parse error response" }));
    throw new Error(errorData.message || `HTTP error ${response.status}`);
  }

  // Handle potential empty body for status codes like 200 on DELETE or 204
  if (
    response.status === 204 ||
    response.headers.get("Content-Length") === "0"
  ) {
    return undefined as T;
  }

  return (await response.json()) as T;
};

// --- React Query Hooks ---

/**
 * Fetches a list of workflows for the authenticated user.
 */
export const useWorkflows = () => {
  const queryKey: QueryKey = ["workflows"];
  return useQuery<Workflow[], Error>({
    queryKey,
    queryFn: () => apiCall<Workflow[]>(API_BASE_URL),
    enabled: !!getAuthToken(), // Only run if token potentially exists
  });
};

/**
 * Fetches a single workflow by its ID.
 * @param id The ID of the workflow to fetch.
 */
export const useWorkflow = (id: string) => {
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchWorkflow = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/${id}`);
      if (!response.ok) throw new Error("Failed to fetch workflow");
      const data = await response.json();
      setWorkflow(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  return { workflow, loading, error, fetchWorkflow };
};

/**
 * Provides a mutation function to create a new workflow.
 */
export const useCreateWorkflow = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createWorkflow = async (
    workflow: Omit<Workflow, "_id" | "ownerId" | "createdAt" | "updatedAt">
  ) => {
    try {
      setLoading(true);
      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(workflow),
      });
      if (!response.ok) throw new Error("Failed to create workflow");
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createWorkflow, loading, error };
};

/**
 * Provides a mutation function to update an existing workflow.
 */
export const useUpdateWorkflow = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateWorkflow = async (
    id: string,
    workflow: Partial<
      Omit<Workflow, "_id" | "ownerId" | "createdAt" | "updatedAt">
    >
  ) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(workflow),
      });
      if (!response.ok) throw new Error("Failed to update workflow");
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updateWorkflow, loading, error };
};

/**
 * Provides a mutation function to delete a workflow.
 */
export const useDeleteWorkflow = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) =>
      apiCall<void>(`${API_BASE_URL}/${id}`, {
        method: "DELETE",
      }),
    onSuccess: (data, id) => {
      // data is void here
      // Invalidate the list query
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
      // Remove the specific workflow from the cache
      queryClient.removeQueries({ queryKey: ["workflow", id] });
    },
  });
};
