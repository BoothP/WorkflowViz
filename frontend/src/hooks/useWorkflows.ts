import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryKey,
} from "@tanstack/react-query";
import type { Node as RFNode, Edge as RFEdge } from "reactflow";

// --- Types (Mirroring backend/interfaces, adapt as needed for frontend) ---
// Use different names for your local types if they are different from React Flow's internal types
// Or ensure your local types are compatible and use the RFNode/RFEdge directly if possible.

export type LocalNodeType = "trigger" | "action" | "filter" | "llmAgent";

// If your Node structure is different from React Flow's, define it here
export interface LocalNode {
  id: string;
  type: LocalNodeType; // Using your local type
  label: string;
  config: Record<string, any>;
  position?: { x: number; y: number };
  width?: number | null;
  height?: number | null;
}

// If your Edge structure is different, define it here
export interface LocalEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface Workflow {
  _id: string;
  name: string;
  nodes: RFNode[]; // Using React Flow's Node type for what's stored/fetched
  edges: RFEdge[]; // Using React Flow's Edge type
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

// Input types for mutations
export interface CreateWorkflowData {
  name: string;
  nodes: RFNode[]; // Expecting React Flow compatible nodes
  edges: RFEdge[]; // Expecting React Flow compatible edges
}

export interface UpdateWorkflowData {
  name?: string;
  nodes?: RFNode[];
  edges?: RFEdge[];
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
  headers.append("Accept", "application/json");
  if (token) {
    headers.append("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include", // Important for cookies
  });

  if (!response.ok) {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error ${response.status}`);
    } else {
      const text = await response.text();
      console.error("Non-JSON response:", text);
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }
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
export const useWorkflow = (id: string | undefined | null) => {
  const queryKey: QueryKey = ["workflow", id];
  return useQuery<Workflow, Error>({
    queryKey,
    queryFn: () => apiCall<Workflow>(`${API_BASE_URL}/${id}`),
    enabled: !!id && !!getAuthToken(),
  });
};

/**
 * Provides a mutation function to create a new workflow.
 */
export const useCreateWorkflow = () => {
  const queryClient = useQueryClient();
  return useMutation<Workflow, Error, CreateWorkflowData>({
    mutationFn: (newWorkflowData) =>
      apiCall<Workflow>(API_BASE_URL, {
        method: "POST",
        body: JSON.stringify(newWorkflowData),
      }),
    onSuccess: (returnedWorkflow) => {
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
      queryClient.setQueryData(
        ["workflow", returnedWorkflow._id],
        returnedWorkflow
      );
    },
  });
};

/**
 * Provides a mutation function to update an existing workflow.
 */
export const useUpdateWorkflow = () => {
  const queryClient = useQueryClient();
  return useMutation<Workflow, Error, { id: string; data: UpdateWorkflowData }>(
    {
      mutationFn: ({ id, data }) =>
        apiCall<Workflow>(`${API_BASE_URL}/${id}`, {
          method: "PUT",
          body: JSON.stringify(data),
        }),
      onSuccess: (returnedWorkflow, variables) => {
        queryClient.invalidateQueries({ queryKey: ["workflows"] });
        queryClient.invalidateQueries({ queryKey: ["workflow", variables.id] });
        queryClient.setQueryData(["workflow", variables.id], returnedWorkflow);
      },
    }
  );
};

/**
 * Provides a mutation function to delete a workflow.
 */
export const useDeleteWorkflow = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (workflowId) =>
      apiCall<void>(`${API_BASE_URL}/${workflowId}`, {
        method: "DELETE",
      }),
    onSuccess: (_data, workflowId) => {
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
      queryClient.removeQueries({ queryKey: ["workflow", workflowId] });
    },
  });
};
