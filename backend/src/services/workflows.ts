// backend/src/services/workflows.ts
import fetch from 'node-fetch';
import { ParseWorkflowResponse } from '../interfaces/workflow.js';
import { z } from 'zod';

// Zod Schemas for validation
const NodeTypeEnum = z.enum(['trigger', 'action', 'filter', 'llmAgent']);

const NodeSchema = z.object({
  id: z.string().min(1),
  type: NodeTypeEnum,
  label: z.string().min(1),
  config: z.record(z.any()),
});

const EdgeSchema = z.object({
  source: z.string().min(1),
  target: z.string().min(1),
  label: z.string().optional(),
});

const WorkflowDataSchema = z.object({
  nodes: z.array(NodeSchema),
  edges: z.array(EdgeSchema),
});

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // ms

const SYSTEM_PROMPT = `You are a workflow parsing assistant. Your task is to convert natural language workflow descriptions into structured JSON format.
The output should be a valid JSON object with two arrays: 'nodes' and 'edges'.

Node types can be: 'trigger', 'action', 'filter', or 'llmAgent'.
Each node must have: id (string), type (one of the allowed types), label (string), and config (object).
Each edge must have: source (string), target (string), and optional label (string).

Example output format:
{
  "nodes": [
    {
      "id": "node-1",
      "type": "trigger",
      "label": "New Lead Trigger",
      "config": {
        "source": "LinkedIn",
        "event": "newConnection"
      }
    }
  ],
  "edges": [
    {
      "source": "node-1",
      "target": "node-2",
      "label": "onNewConnection"
    }
  ]
}`;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const parseWorkflow = async (prompt: string): Promise<ParseWorkflowResponse> => {
  const key = process.env.DEEPSEEK_API_KEY!;
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {
      console.log(`▶️ DeepSeek fetch attempt #${attempt + 1} with key: ${key}`);
      const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: prompt },
          ],
          temperature: 0.3,
          max_tokens: 1000,
        }),
      });

      const text = await res.text();
      if (!res.ok) throw new Error(`DeepSeek ${res.status}: ${text}`);

      const payload = JSON.parse(text);
      let content = payload.choices?.[0]?.message?.content;
      if (!content) throw new Error('Empty response from DeepSeek');

      // Strip markdown fences (``` and ```json)
      let cleaned = content.trim();
      cleaned = cleaned.replace(/```json/g, '');
      cleaned = cleaned.replace(/```/g, '');

      const parsedJson = JSON.parse(cleaned);

      // Validate with Zod
      const validationResult = WorkflowDataSchema.safeParse(parsedJson);
      if (!validationResult.success) {
        // Log detailed Zod error for server-side debugging
        console.error('Zod validation failed:', validationResult.error.flatten());
        throw new Error(
          `Invalid workflow structure: ${validationResult.error.issues.map((i) => i.path.join('.') + ': ' + i.message).join(', ')}`
        );
      }

      const validatedData = validationResult.data;

      return { success: true, data: { nodes: validatedData.nodes, edges: validatedData.edges } };
    } catch (err: any) {
      attempt++;
      if (attempt >= MAX_RETRIES) {
        return {
          success: false,
          error: {
            message: err.message || 'Failed to parse workflow',
            code: 'PARSE_ERROR',
          },
        };
      }
      await sleep(RETRY_DELAY * attempt);
    }
  }

  return {
    success: false,
    error: { message: 'Max retries exceeded', code: 'MAX_RETRIES_EXCEEDED' },
  };
};
