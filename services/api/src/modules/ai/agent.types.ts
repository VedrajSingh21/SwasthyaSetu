export interface AgentContext {
  patientId: string;
  language?: string;
  currentPage?: string;
  currentJourneyId?: string;
}

export interface AgentTool<TInput = any, TOutput = any> {
  name: string;
  description: string;
  inputSchema: Record<string, any>; // JSON schema
  readOnly: boolean;
  execute: (context: AgentContext, input: TInput) => Promise<TOutput>;
}

export class ToolRegistry {
  private tools: Map<string, AgentTool> = new Map();

  register(tool: AgentTool) {
    this.tools.set(tool.name, tool);
  }

  getTool(name: string): AgentTool | undefined {
    return this.tools.get(name);
  }

  getAllTools(): AgentTool[] {
    return Array.from(this.tools.values());
  }
}
