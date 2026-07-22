'use client';

import React from 'react';
import { Terminal, RefreshCcw, KeyRound } from 'lucide-react';
import { ActivityItem } from '@/actions/keySwap';

interface ActivityFeedProps {
  items: ActivityItem[];
}

export function ActivityFeed({ items }: ActivityFeedProps) {
  if (!items || items.length === 0) return null;

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatTimeAgo = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffSec < 60) return 'JUST_NOW';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}M_AGO`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}H_AGO`;
    return `${Math.floor(diffSec / 86400)}D_AGO`;
  };

  return (
    <div className="w-full max-w-xl mx-auto mt-10">
      <div className="bg-[#0b0d14] border-2 border-white/10 p-5 font-mono">
        <div className="flex items-center gap-2 mb-4 text-xs font-bold text-gray-300 border-b border-white/10 pb-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span>[LIVE_TRANSACTION_FEED]</span>
        </div>

        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-2.5 bg-black border border-white/10 text-[11px]"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 ${
                    item.type === 'SWAP' ? 'bg-cyan-400' : 'bg-violet-400'
                  }`}
                />
                <span className="text-gray-300 font-mono">{truncateAddress(item.userAddress)}</span>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 border ${
                    item.type === 'SWAP'
                      ? 'bg-cyan-950 text-cyan-300 border-cyan-500/40'
                      : 'bg-violet-950 text-violet-300 border-violet-500/40'
                  }`}
                >
                  {item.type === 'SWAP' ? 'SWAP_EXECUTED' : 'KEY_DEPOSITED'}
                </span>
                <span className="text-[10px] text-gray-500 font-mono">{formatTimeAgo(item.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
