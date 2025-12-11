import React from 'react';
import { Message, AgentType, ToolCallDetails } from '../types';
import { AGENT_CONFIGS } from '../constants';
import { User, FileText, Search, Database, CheckCircle, Shield } from 'lucide-react';

interface Props {
  message: Message;
}

const MessageBubble: React.FC<Props> = ({ message }) => {
  const isUser = message.role === 'user';
  const agentConfig = message.agent ? AGENT_CONFIGS[message.agent] : AGENT_CONFIGS[AgentType.NAVIGATOR];

  // Helper to render tool usage visualization
  const renderToolCall = (tool: ToolCallDetails) => {
    let icon = <CheckCircle size={16} />;
    let label = "System Action";
    let details = "";

    if (tool.name === 'generate_document') {
      icon = <FileText size={16} className="text-blue-600" />;
      label = "Generated Secure Document";
      details = `${tool.args.docType} (${tool.args.contentSummary})`;
    } else if (tool.name === 'google_search') {
      icon = <Search size={16} className="text-amber-600" />;
      label = "External Verification";
      details = `Query: "${tool.args.query}"`;
    } else if (tool.name === 'check_database') {
      icon = <Database size={16} className="text-emerald-600" />;
      label = "Database Query";
      details = `Checking: ${tool.args.entity}`;
    }

    return (
      <div key={tool.name + Math.random()} className="mt-3 flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-md shadow-sm">
        <div className="mt-0.5">{icon}</div>
        <div className="text-sm">
          <p className="font-semibold text-slate-800">{label}</p>
          <p className="text-slate-500 text-xs">{details}</p>
        </div>
      </div>
    );
  };

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] ${isUser ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-md ${isUser ? 'bg-slate-700 text-white' : agentConfig.color + ' text-white'}`}>
          {isUser ? <User size={20} /> : <Shield size={20} />} 
        </div>

        {/* Bubble Content */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          
          {/* Agent Name Badge (Bot only) */}
          {!isUser && (
            <span className={`mb-1 text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${agentConfig.bgColor} ${agentConfig.textColor} border ${agentConfig.borderColor}`}>
              {agentConfig.name}
            </span>
          )}

          <div className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed whitespace-pre-wrap
            ${isUser 
              ? 'bg-slate-800 text-white rounded-tr-none' 
              : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none'
            }`}>
            {message.content}
            
            {/* Tool Calls Rendering */}
            {!isUser && message.toolCalls && message.toolCalls.length > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-100 w-full">
                <p className="text-xs font-semibold text-slate-400 mb-2 uppercase">Execution Mandates:</p>
                <div className="flex flex-col gap-2">
                  {message.toolCalls.map(renderToolCall)}
                </div>
              </div>
            )}
          </div>
          
          <span className="text-xs text-slate-400 mt-1 px-1">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;