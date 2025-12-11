import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { 
  NAVIGATOR_SYSTEM_INSTRUCTION, 
  NAVIGATOR_TOOLS, 
  SUB_AGENT_PROMPTS, 
  SUB_AGENT_TOOLS,
  AGENT_CONFIGS
} from '../constants';
import { AgentType, ToolCallDetails } from '../types';

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// We simulate a session state here for the demo, but in a real app this would be more robust
interface DelegationResult {
  response: string;
  agent: AgentType;
  toolCalls: ToolCallDetails[];
}

/**
 * Main function to handle the conversation flow.
 * 1. Navigator analyzes input.
 * 2. Navigator either responds (greeting) or delegates (Tool Call).
 * 3. If delegated, the specific Sub-Agent is invoked with the payload.
 */
export async function processUserMessage(
  userMessage: string,
  onStatusUpdate: (status: string, agent: AgentType) => void
): Promise<DelegationResult> {

  // --- Step 1: Navigator Analysis ---
  onStatusUpdate("Validating intent & ensuring protocol...", AgentType.NAVIGATOR);
  
  // Navigator Model
  const navigatorModel = 'gemini-2.5-flash'; 
  
  const navResponse: GenerateContentResponse = await ai.models.generateContent({
    model: navigatorModel,
    contents: [{ role: 'user', parts: [{ text: userMessage }] }],
    config: {
      systemInstruction: NAVIGATOR_SYSTEM_INSTRUCTION,
      tools: [{ functionDeclarations: NAVIGATOR_TOOLS }],
      temperature: 0.1, // Low temp for strict routing
    }
  });

  const candidates = navResponse.candidates;
  const firstPart = candidates?.[0]?.content?.parts?.[0];

  // Check if Navigator wants to call a function (Delegate)
  const functionCall = firstPart?.functionCall;

  if (functionCall) {
    const fnName = functionCall.name;
    const fnArgs = functionCall.args as any;
    const query = fnArgs.query;

    let targetAgent: AgentType = AgentType.NAVIGATOR;

    // Map function name to Agent
    if (fnName === 'delegate_to_medical_records') targetAgent = AgentType.MEDICAL_RECORDS;
    if (fnName === 'delegate_to_billing_insurance') targetAgent = AgentType.BILLING;
    if (fnName === 'delegate_to_patient_info') targetAgent = AgentType.PATIENT_INFO;
    if (fnName === 'delegate_to_scheduler') targetAgent = AgentType.APPOINTMENTS;

    // --- Step 2: Delegation Execution (Sub-Agent) ---
    onStatusUpdate(`Delegating to ${AGENT_CONFIGS[targetAgent].name}...`, targetAgent);

    // Short delay to simulate handoff
    await new Promise(r => setTimeout(r, 800));

    onStatusUpdate(`Executing mandate...`, targetAgent);

    // Call the Sub-Agent Model
    const subAgentResponse: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: `User Query: "${query}".\nContext: The user has been routed to you via the Hospital Navigator.` }] }],
      config: {
        systemInstruction: SUB_AGENT_PROMPTS[targetAgent],
        tools: [{ functionDeclarations: SUB_AGENT_TOOLS }],
        temperature: 0.3, 
      }
    });

    const subPart = subAgentResponse.candidates?.[0]?.content?.parts?.[0];
    const subFunctionCalls = subAgentResponse.candidates?.[0]?.content?.parts
      ?.filter(p => p.functionCall)
      .map(p => ({
        name: p.functionCall!.name,
        args: p.functionCall!.args as Record<string, any>
      })) || [];
    
    // Construct final text response (handling if the model just called a tool or spoke text)
    let finalText = "";
    if (subPart?.text) {
      finalText = subPart.text;
    } else if (subFunctionCalls.length > 0) {
      // If the model ONLY called a tool (e.g. generate_document), we add a system acknowledgement
      finalText = "I have initiated the required system action based on your request.";
    } else {
      finalText = "Request processed successfully.";
    }

    return {
      response: finalText,
      agent: targetAgent,
      toolCalls: subFunctionCalls
    };

  } else {
    // Navigator responded directly (likely a greeting or error)
    return {
      response: firstPart?.text || "System Error: No response generated.",
      agent: AgentType.NAVIGATOR,
      toolCalls: []
    };
  }
}