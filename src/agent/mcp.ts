import { site } from './site.ts'

export type McpToolDefinition = {
  name: string
  description: string
  inputSchema: {
    type: 'object'
    properties: Record<string, { type: string; description: string; enum?: string[] }>
    required?: string[]
  }
}

export const mcpProtocolVersion = '2025-06-18'

export const mcpTools: McpToolDefinition[] = [
  {
    name: 'list_prompts',
    description:
      'List IELTS Writing practice prompts (Task 1 or Task 2) with their slug, task type, difficulty and estimated minutes. Use this before get_prompt so you can pass a valid slug.',
    inputSchema: {
      type: 'object',
      properties: {
        task: { type: 'string', description: 'Filter by task type.', enum: ['task2', 'academic_task1', 'general_task1'] },
        limit: { type: 'number', description: 'Maximum number of prompts to return (1-50, default 10).' },
      },
    },
  },
  {
    name: 'get_prompt',
    description:
      'Get one IELTS Writing prompt by slug: full task text, the writing hint, difficulty and suggested time. The slug comes from list_prompts.',
    inputSchema: {
      type: 'object',
      properties: {
        slug: { type: 'string', description: 'Prompt slug, for example "urban-parks".' },
      },
      required: ['slug'],
    },
  },
  {
    name: 'list_writing_frameworks',
    description:
      'List the essay frameworks and study guides available in the learning library, with their slug, task type and short description.',
    inputSchema: {
      type: 'object',
      properties: {
        task: { type: 'string', description: 'Filter by task type.', enum: ['task2', 'academic_task1', 'general_task1', 'all'] },
      },
    },
  },
  {
    name: 'get_learning_template',
    description:
      'Get the full text of one learning library entry (essay framework, sample answer or vocabulary card) by slug.',
    inputSchema: {
      type: 'object',
      properties: {
        slug: { type: 'string', description: 'Library entry slug, for example "opinion-framework".' },
      },
      required: ['slug'],
    },
  },
]

export function buildMcpManifest(origin: string) {
  return {
    name: 'ielts-writing-studio',
    title: site.name,
    description:
      'IELTS Writing practice prompts, essay frameworks and study guides for AI agents. Read-only tools over the public API of IELTS Writing Studio.',
    version: '1.0.0',
    websiteUrl: site.url,
    repository: site.repository,
    transports: [{ type: 'streamable-http', url: `${origin}/api/mcp` }],
    capabilities: { tools: { listChanged: false } },
    tools: mcpTools.map(tool => ({ name: tool.name, description: tool.description, inputSchema: tool.inputSchema })),
  }
}
