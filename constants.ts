import { AgentType, AgentConfig } from './types';
import { FunctionDeclaration, Type } from '@google/genai';

// --- UI Configuration ---

export const AGENT_CONFIGS: Record<AgentType, AgentConfig> = {
  [AgentType.NAVIGATOR]: {
    id: AgentType.NAVIGATOR,
    name: 'Hospital System Navigator',
    role: 'Intent Validator & Traffic Controller',
    color: 'bg-slate-800',
    bgColor: 'bg-slate-50',
    textColor: 'text-slate-800',
    borderColor: 'border-slate-800',
    iconName: 'Compass'
  },
  [AgentType.MEDICAL_RECORDS]: {
    id: AgentType.MEDICAL_RECORDS,
    name: 'Medical Records Agent',
    role: 'Security & Confidentiality Mandate',
    color: 'bg-red-600',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
    iconName: 'ShieldAlert'
  },
  [AgentType.PATIENT_INFO]: {
    id: AgentType.PATIENT_INFO,
    name: 'Patient Info Agent',
    role: 'Documentation & Updates Mandate',
    color: 'bg-blue-600',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    iconName: 'UserCog'
  },
  [AgentType.APPOINTMENTS]: {
    id: AgentType.APPOINTMENTS,
    name: 'Appointment Scheduler',
    role: 'Logistics Confirmation Mandate',
    color: 'bg-emerald-600',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-200',
    iconName: 'CalendarClock'
  },
  [AgentType.BILLING]: {
    id: AgentType.BILLING,
    name: 'Billing & Insurance Agent',
    role: 'Transparency & Finance Mandate',
    color: 'bg-amber-600',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200',
    iconName: 'Receipt'
  }
};

// --- Navigator Tools (Function Declarations) ---

export const NAVIGATOR_TOOLS: FunctionDeclaration[] = [
  {
    name: 'delegate_to_medical_records',
    description: 'Delegate requests involving medical records, test results, diagnoses, or treatment history. STRICT Security Mandate.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: { type: Type.STRING, description: 'The full context of the user request regarding records.' }
      },
      required: ['query']
    }
  },
  {
    name: 'delegate_to_billing_insurance',
    description: 'Delegate requests involving invoices, insurance benefits, payment options, or financial aid. Transparency Mandate.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: { type: Type.STRING, description: 'The full context of the user request regarding finance.' }
      },
      required: ['query']
    }
  },
  {
    name: 'delegate_to_patient_info',
    description: 'Delegate requests involving registration, personal details updates, or forms. Documentation Mandate.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: { type: Type.STRING, description: 'The full context of the user request regarding admin info.' }
      },
      required: ['query']
    }
  },
  {
    name: 'delegate_to_scheduler',
    description: 'Delegate requests involving scheduling, rescheduling, or cancelling appointments. Logistics Mandate.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: { type: Type.STRING, description: 'The full context of the user request regarding appointments.' }
      },
      required: ['query']
    }
  }
];

// --- Sub-Agent Tools (Mock Execution Tools) ---

export const SUB_AGENT_TOOLS: FunctionDeclaration[] = [
  {
    name: 'generate_document',
    description: 'Generates a secure, structured document (PDF/DOCX) for records or forms.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        docType: { type: Type.STRING, description: 'Type of document (e.g., medical_record, registration_form)' },
        contentSummary: { type: Type.STRING, description: 'Brief summary of content included' }
      },
      required: ['docType', 'contentSummary']
    }
  },
  {
    name: 'check_database',
    description: 'Queries the internal hospital database for specific availability or status.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        entity: { type: Type.STRING, description: 'Entity to check (e.g., Dr. Smith, Invoice #123)' }
      },
      required: ['entity']
    }
  },
  {
    name: 'google_search',
    description: 'Search for general insurance policies or external information.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: { type: Type.STRING }
      },
      required: ['query']
    }
  }
];


// --- System Prompts ---

export const NAVIGATOR_SYSTEM_INSTRUCTION = `
You are the **Hospital System Navigator**, a high-security Medical AI Delegation Hub.
Your role is NOT to answer questions directly. Your role is **strictly to validate intent** and **delegate** to the correct specialist agent using the provided tools.

**Protocol:**
1. Analyze the user's intent carefully.
2. If the user asks a general greeting, you may respond briefly as the Navigator, but guide them to state their business.
3. For ANY medical, administrative, financial, or scheduling request, you MUST call the appropriate 'delegate_to_*' tool.
4. Pass the FULL context of the user's request to the tool.

**Delegation Logic:**
- **Medical Records**: Test results, diagnosis, treatment history.
- **Billing**: Invoices, insurance, costs.
- **Patient Info**: Registration, address change, forms.
- **Scheduler**: Booking, cancelling, times.
`;

export const SUB_AGENT_PROMPTS: Record<string, string> = {
  [AgentType.MEDICAL_RECORDS]: `
    You are the **Medical Records Agent**.
    **Mandate**: Process requests for medical records with highest priority on **Security & Confidentiality**.
    **Instructions**:
    - Verify the request details (simulated).
    - You MUST use the 'generate_document' tool to provide records in a structured format (PDF/DOCX) to ensure data integrity.
    - Never output raw sensitive text without "generating" a secure doc wrapper.
  `,
  [AgentType.BILLING]: `
    You are the **Billing & Insurance Agent**.
    **Mandate**: Provide **Transparency & Financial Aid** info.
    **Instructions**:
    - Explain invoices clearly.
    - Use 'google_search' if you need general insurance policy info.
    - Mention payment plans if relevant.
    - Always be clear about costs.
  `,
  [AgentType.PATIENT_INFO]: `
    You are the **Patient Information Agent**.
    **Mandate**: Ensure **Documentation Accuracy & Updates**.
    **Instructions**:
    - Confirm updates to personal details.
    - If a form is needed (e.g., registration), you MUST use 'generate_document'.
    - Ensure all admin data is precise.
  `,
  [AgentType.APPOINTMENTS]: `
    You are the **Appointment Scheduler**.
    **Mandate**: **Logistics Confirmation**.
    **Instructions**:
    - Use 'check_database' to verify doctor availability (simulated).
    - Your final output MUST be a clear status: Confirmed, Cancelled, or Pending Info.
    - If details are missing, ask for them specifically.
  `
};
