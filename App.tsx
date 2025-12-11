import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import { ProcessingState, AgentType } from './types';

const App: React.FC = () => {
  const [processingState, setProcessingState] = useState<ProcessingState>({
    status: 'idle',
    activeAgent: AgentType.NAVIGATOR,
    log: []
  });

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans">
      <Sidebar processingState={processingState} />
      <ChatInterface 
        processingState={processingState} 
        setProcessingState={setProcessingState} 
      />
    </div>
  );
};

export default App;