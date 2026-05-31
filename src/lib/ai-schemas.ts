import { z } from "zod";

/**
 * Zod schemas for validating AI outputs
 * All AI-generated content must pass validation before database storage
 */

// Requirement schema
export const requirementSchema = z.object({
  title: z.string().min(1).max(500),
  content: z.string().min(1).max(10000),
  type: z.enum(["functional", "non-functional"]).default("functional"),
  priority: z.enum(["must-have", "should-have", "nice-to-have"]).default("should-have"),
});

export const requirementsArraySchema = z.array(requirementSchema).max(50); // Max 50 requirements

// User Story schema
export const userStorySchema = z.object({
  title: z.string().min(1).max(500),
  content: z.string().min(1).max(5000),
  acceptanceCriteria: z.union([z.string(), z.array(z.string())]).optional(),
  priority: z.enum(["must-have", "should-have", "nice-to-have"]).default("should-have"),
  storyPoints: z.number().int().min(1).max(100).optional(),
});

export const userStoriesArraySchema = z.array(userStorySchema).max(50);

// Workflow schema
export const workflowSchema = z.object({
  title: z.string().min(1).max(500),
  content: z.object({
    steps: z.array(z.string().min(1).max(1000)).max(50),
  }).or(z.string()),
  diagram: z.string().optional(),
});

export const workflowsArraySchema = z.array(workflowSchema).max(20);

// Architecture schema
export const architectureSchema = z.object({
  content: z.string().min(1).max(20000),
  highLevel: z.string().max(10000).optional(),
  lowLevel: z.string().max(10000).optional(),
  functionalDecomposition: z.string().max(10000).optional(),
  diagram: z.string().optional(), // Mermaid diagram
});

// Tech Stack schema
export const techStackItemSchema = z.object({
  name: z.string(),
  category: z.enum(["frontend", "backend", "database", "devops", "other"]),
  description: z.string().optional(),
});

export const techStackSchema = z.object({
  frontend: z.union([z.string(), z.array(z.union([z.string(), techStackItemSchema]))]).optional(),
  backend: z.union([z.string(), z.array(z.union([z.string(), techStackItemSchema]))]).optional(),
  database: z.union([z.string(), z.array(z.union([z.string(), techStackItemSchema]))]).optional(),
  devops: z.union([z.string(), z.array(z.union([z.string(), techStackItemSchema]))]).optional(),
  other: z.union([z.string(), z.array(z.union([z.string(), techStackItemSchema]))]).optional(),
  rationale: z.string().optional(),
});

// Database schema section
export const databaseFieldSchema = z.object({
  name: z.string(),
  type: z.string(),
  constraints: z.string().optional(),
  description: z.string().optional(),
});

export const databaseTableSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  fields: z.array(databaseFieldSchema),
  indexes: z.array(z.string()).optional(),
  relationships: z.array(z.object({
    table: z.string(),
    type: z.enum(["one-to-one", "one-to-many", "many-to-many"]),
    foreignKey: z.string(),
  })).optional(),
});

export const databaseSectionSchema = z.object({
  erDiagram: z.string(),
  tables: z.array(databaseTableSchema).max(100),
});

// API endpoint schema
export const apiEndpointSchema = z.object({
  method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]),
  path: z.string(),
  description: z.string(),
  authentication: z.string().optional(),
  requestBody: z.record(z.string(), z.any()).optional(),
  responseSuccess: z.record(z.string(), z.any()).optional(),
  responseError: z.record(z.string(), z.any()).optional(),
});

export const apiSectionSchema = z.object({
  endpoints: z.array(apiEndpointSchema).max(100),
  sequenceDiagrams: z.array(z.object({
    name: z.string(),
    diagram: z.string(),
  })).optional(),
});

// Question schema for generation flow
export const questionSchema = z.object({
  id: z.string().min(1).max(100).regex(/^[a-z0-9_]+$/),
  text: z.string().min(1).max(500),
  type: z.enum(["single", "multiple"]),
  options: z.array(z.string().min(1).max(200)).min(2).max(10),
});

export const questionsArraySchema = z.array(questionSchema).max(10);

// Task schema
export const taskSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().max(5000).optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).default("TODO"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  assignee: z.string().optional(),
  dueDate: z.string().datetime().optional(),
});

// Persona schema
export const personaSchema = z.object({
  name: z.string().min(1).max(200),
  role: z.string().min(1).max(200),
  goals: z.union([z.string(), z.array(z.string())]),
  frustrations: z.union([z.string(), z.array(z.string())]).optional(),
  bio: z.string().max(2000).optional(),
});

// Business Rule schema
export const businessRuleSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().min(1).max(5000),
  condition: z.string().max(2000).optional(),
  action: z.string().max(2000).optional(),
});

/**
 * Sanitize and validate AI output
 * Returns { success: true, data } or { success: false, error }
 */
export function validateAIOutput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    const errorMessage = result.error.issues
      .map((e: z.ZodIssue) => `${e.path.join(".")}: ${e.message}`)
      .join("; ");
    return { success: false, error: errorMessage };
  }
}
