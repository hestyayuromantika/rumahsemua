import React from 'react';
import { AgentConfig, AgentType, ProcessingState } from '../types';
import { AGENT_CONFIGS } from '../constants';
import { Activity, ShieldCheck, Lock, Network, Server } from 'lucide-react';

interface Props {
  processingState: ProcessingState;
}

const Sidebar: React.FC<Props> = ({ processingState }) => {
  return (
    <div className="hidden lg:flex w-80 flex-col bg-slate-900 text-slate-300 h-full border-r border-slate-700">
      
      {/* Header */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white">
             <Network size={20} />
          </div>
          <h1 className="font-bold text-white text-lg leading-tight">Hospital System<br/>Navigator</h1>
        </div>
        <p className="text-xs text-slate-500">Secure Delegation Hub v2.1</p>
      </div>

      {/* Active System Monitor */}
      <div className="p-6 flex-1 overflow-y-auto">
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">System Status</h2>
        
        {/* Main Status Card */}
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 mb-6 relative overflow-hidden">
          {processingState.status !== 'idle' && (
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 animate-pulse"></div>
          )}
         
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-white">Protocol Status</span>
            <span className={`text-xs px-2 py-0.5 rounded ${processingState.status === 'idle' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
              {processingState.status === 'idle' ? 'STANDBY' : 'ACTIVE'}
            </span>
          </div>
          <div className="text-xs text-slate-400 font-mono">
            {processingState.log.length > 0 ? processingState.log[processingState.log.length - 1] : "System ready for input..."}
          </div>
        </div>

        {/* Agent Grid */}
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Active Nodes</h2>
        <div className="space-y-3">
          {Object.values(AGENT_CONFIGS).map((agent: AgentConfig) => {
             const isActive = processingState.activeAgent === agent.id && processingState.status !== 'idle' && processingState.status !== 'complete';
             const isIdle = processingState.status === 'idle';
             // Navigator is always "online"
             const isOnline = agent.id === AgentType.NAVIGATOR || isActive;

             return (
              <div key={agent.id} 
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-300
                  ${isActive 
                    ? 'bg-slate-800 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)]' 
                    : 'bg-transparent border-slate-800 opacity-60'
                  }
                `}
              >
                <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-slate-600'} ${isActive ? 'animate-pulse' : ''}`}></div>
                <div>
                  <div className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-slate-400'}`}>{agent.name}</div>
                  <div className="text-[10px] text-slate-500 truncate w-40">{agent.role}</div>
                </div>
              </div>
             );
          })}
        </div>
      </div>

      {/* Footer / Mandate Info */}
      <div className="p-6 border-t border-slate-800 bg-slate-900/50">
        <div className="flex items-start gap-3">
           <ShieldCheck size={24} className="text-emerald-500 shrink-0" />
           <div>
             <h3 className="text-sm font-bold text-white">Output Mandate Enforced</h3>
             <p className="text-xs text-slate-500 mt-1">All data traffic is validated against HIPPA-compliant protocols before delegation.</p>
           </div>
        </div>
      </div>

    </div>
  );
};

export default Sidebar;