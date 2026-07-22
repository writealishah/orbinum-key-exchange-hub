'use client';

import React from 'react';
import { KeyRound, RefreshCcw, Activity, Layers } from 'lucide-react';
import { PoolStats } from '@/actions/keySwap';

interface StatsBarProps {
  stats: PoolStats;
  isLoading?: boolean;
}

export function StatsBar({ stats, isLoading }: StatsBarProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-4xl mx-auto">
      {/* Stat 1: Available Keys */}
      <div className="p-4 sm:p-5 bg-[#0e1017] border-2 border-violet-500/30 pixel-shadow-violet transition-all duration-200 hover:translate-x-[-2px] hover:translate-y-[-2px]">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-violet-400">
            [01] KEYS_IN_POOL
          </span>
          <KeyRound className="w-4 h-4 text-violet-400" />
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          {isLoading ? (
            <div className="h-8 w-16 bg-white/10 animate-pulse" />
          ) : (
            <span className="text-3xl font-bold font-mono text-white tracking-tight">
              {stats.activeAvailableKeys}
            </span>
          )}
          <span className="text-[10px] font-mono text-violet-300/70 border border-violet-500/20 px-2 py-0.5 bg-violet-950/30">
            READY TO CLAIM
          </span>
        </div>
      </div>

      {/* Stat 2: Swaps Completed */}
      <div className="p-4 sm:p-5 bg-[#0e1017] border-2 border-cyan-500/30 pixel-shadow-cyan transition-all duration-200 hover:translate-x-[-2px] hover:translate-y-[-2px]">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-cyan-400">
            [02] TOTAL_SWAPS
          </span>
          <RefreshCcw className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          {isLoading ? (
            <div className="h-8 w-16 bg-white/10 animate-pulse" />
          ) : (
            <span className="text-3xl font-bold font-mono text-white tracking-tight">
              {stats.totalSwapsCompleted}
            </span>
          )}
          <span className="text-[10px] font-mono text-cyan-300/70 border border-cyan-500/20 px-2 py-0.5 bg-cyan-950/30">
            FAIR EXCHANGES
          </span>
        </div>
      </div>

      {/* Stat 3: Community Health */}
      <div className="p-4 sm:p-5 bg-[#0e1017] border-2 border-emerald-500/30 pixel-shadow-box transition-all duration-200 hover:translate-x-[-2px] hover:translate-y-[-2px]">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400">
            [03] NODE_STATUS
          </span>
          <Activity className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-emerald-400 rounded-none animate-ping" />
            <span className="text-sm font-mono font-bold text-white uppercase">SYNCED & READY</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-300/70 border border-emerald-500/20 px-2 py-0.5 bg-emerald-950/30">
            100% OPERATIONAL
          </span>
        </div>
      </div>
    </div>
  );
}
