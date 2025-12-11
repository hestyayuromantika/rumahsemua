export enum AgentType {
  NAVIGATOR = 'NAVIGATOR',
  MEDICAL_RECORDS = 'MEDICAL_RECORDS',
  PATIENT_INFO = 'PATIENT_INFO',
  APPOINTMENTS = 'APPOINTMENTS',
  BILLING = 'BILLING'
}

export interface Message {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  agent?: AgentType; // The agent who generated this message
  timestamp: number;
  toolCalls?: ToolCallDetails[];
  isThinking?: boolean;
}

export interface ToolCallDetails {
  name: string;
  args: Record<string, any>;
  result?: string;
}

export interface AgentConfig {
  id: AgentType;
  name: string;
  role: string;
  color: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  iconName: string;
}

export interface ProcessingState {
  status: 'idle' | 'analyzing' | 'delegating' | 'executing' | 'complete';
  activeAgent: AgentType;
  log: string[];
}