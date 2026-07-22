'use client';

import React from 'react';
import { Terminal, Send, ArrowLeftRight, CheckSquare } from 'lucide-react';

export function InstructionsCard() {
  const steps = [
    {
      num: 'STEP_01',
      icon: Send,
      title: 'Generate Disclosure Key',
      description: 'Perform a Private Transfer on Orbinum Hub to receive your ZK Disclosure Key.',
      accent: 'text-violet-400 border-violet-500/40 bg-violet-950/30',
    },
    {
      num: 'STEP_02',
      icon: ArrowLeftRight,
      title: 'Swap on Console',
      description: 'Paste your key into the console above and execute swap to deposit key and claim community key.',
      accent: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/30',
    },
    {
      num: 'STEP_03',
      icon: CheckSquare,
      title: 'Submit Quest on Hub',
      description: 'Copy the community key and paste in Community ➔ Quests ➔ On-Chain ➔ Weekly Selective Disclosure.',
      accent: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/30',
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto mt-12">
      <div className="bg-[#0b0d14] border-2 border-white/10 p-6 sm:p-8 pixel-shadow-box">
        <div className="flex items-center gap-2 mb-6 font-mono text-xs text-gray-300 font-bold border-b border-white/10 pb-3">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span>[PROTOCOL_DOCUMENTATION // 3-STEP GUIDE]</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step) => {
            const IconComponent = step.icon;
            return (
              <div
                key={step.num}
                className="p-5 bg-black/60 border-2 border-white/10 hover:border-white/20 transition-all font-mono"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 border ${step.accent}`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-gray-500">{step.num}</span>
                </div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">{step.title}</h4>
                <p className="text-[11px] text-gray-400 leading-relaxed font-sans">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
