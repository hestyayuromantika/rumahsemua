import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Message, AgentType, ProcessingState } from '../types';
import MessageBubble from './MessageBubble';
import { processUserMessage } from '../services/geminiService';
import { AGENT_CONFIGS } from '../constants';

interface Props {
  processingState: ProcessingState;
  setProcessingState: React.Dispatch<React.SetStateAction<ProcessingState>>;
}

const ChatInterface: React.FC<Props> = ({ processingState, setProcessingState }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'system',
      content: "Welcome to the Hospital System Navigator. I am the central delegation hub. Please state your request regarding Medical Records, Appointments, Billing, or Patient Information.",
      timestamp: Date.now(),
      agent: AgentType.NAVIGATOR
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, processingState.log]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    
    // Start Processing
    setProcessingState(prev => ({
      ...prev,
      status: 'analyzing',
      activeAgent: AgentType.NAVIGATOR,
      log: [...prev.log, `Processing user input: "${userMsg.content.substring(0, 30)}..."`]
    }));

    try {
      const result = await processUserMessage(userMsg.content, (status, agent) => {
        setProcessingState(prev => ({
          status: 'delegating',
          activeAgent: agent,
          log: [...prev.log, status]
        }));
      });

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: result.response,
        agent: result.agent,
        timestamp: Date.now(),
        toolCalls: result.toolCalls
      };

      setMessages(prev => [...prev, botMsg]);
      setProcessingState(prev => ({ ...prev, status: 'idle', activeAgent: AgentType.NAVIGATOR }));

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'system',
        content: "An error occurred while connecting to the Medical Hub. Please ensure your API Key is valid.",
        timestamp: Date.now(),
        agent: AgentType.NAVIGATOR
      }]);
      setProcessingState(prev => ({ ...prev, status: 'idle' }));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const currentAgentConfig = AGENT_CONFIGS[processingState.activeAgent];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 relative">
      
      {/* Mobile Header (Only visible on small screens) */}
      <div className="lg:hidden p-4 bg-slate-900 text-white flex items-center justify-between shadow-md z-10">
         <span className="font-bold">Hospital Navigator</span>
         <span className={`text-xs px-2 py-1 rounded bg-slate-800 border ${currentAgentConfig.borderColor} ${currentAgentConfig.textColor === 'text-white' ? 'text-white' : 'text-slate-200'}`}>
            {processingState.status === 'idle' ? 'Standby' : currentAgentConfig.name}
         </span>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide">
        <div className="max-w-4xl mx-auto">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          
          {/* Typing/Processing Indicator */}
          {processingState.status !== 'idle' && (
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentAgentConfig.color} text-white animate-pulse`}>
                 <Loader2 size={20} className="animate-spin" />
              </div>
              <div className="text-sm text-slate-500 italic">
                {processingState.log[processingState.log.length - 1]}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-6 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto relative">
          <div className="absolute -top-10 left-0 flex gap-2">
            {/* Context Pills (Visual suggestions) */}
            {['My invoice is confusing', 'I need my blood test results', 'Book an appointment'].map(suggestion => (
               <button 
                  key={suggestion}
                  onClick={() => setInputValue(suggestion)}
                  className="hidden md:block text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full hover:bg-slate-200 transition-colors"
                >
                  {suggestion}
               </button>
            ))}
          </div>

          <div className="relative flex items-end gap-2 bg-slate-50 border border-slate-300 rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 transition-all p-2">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe your request (e.g., 'I need to update my address' or 'Reschedule my appointment')..."
              className="w-full bg-transparent border-none focus:ring-0 resize-none max-h-32 min-h-[50px] py-3 px-2 text-slate-700 placeholder-slate-400"
              rows={1}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || processingState.status !== 'idle'}
              className={`p-3 rounded-lg flex-shrink-0 transition-all ${
                inputValue.trim() && processingState.status === 'idle'
                  ? 'bg-slate-900 text-white hover:bg-slate-800' 
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Send size={20} />
            </button>
          </div>
          <p className="text-center text-[10px] text-slate-400 mt-2">
            Protected by Medical AI Delegation Protocol. All inputs are routed to specialized agents.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;