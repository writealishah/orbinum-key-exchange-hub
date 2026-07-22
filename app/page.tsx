'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/Navbar';
import { StatsBar } from '@/components/StatsBar';
import { SwapCard } from '@/components/SwapCard';
import { InstructionsCard } from '@/components/InstructionsCard';
import { ActivityFeed } from '@/components/ActivityFeed';
import { getPoolStats, getRecentActivity, PoolStats, ActivityItem } from '@/actions/keySwap';
import { Shield, ExternalLink, Terminal } from 'lucide-react';

export default function HomePage() {
  const [address, setAddress] = useState<string | null>(null);
  const [stats, setStats] = useState<PoolStats>({
    totalKeysSubmitted: 0,
    activeAvailableKeys: 0,
    totalSwapsCompleted: 0,
  });
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [poolStats, recentActivity] = await Promise.all([
        getPoolStats(),
        getRecentActivity(),
      ]);
      setStats(poolStats);
      setActivity(recentActivity);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 15000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  return (
    <div className="min-h-screen flex flex-col justify-between pixel-grid relative selection:bg-cyan-500/30 selection:text-cyan-200">
      <div className="scanline-overlay" />

      <div>
        {/* Navigation Bar */}
        <Navbar address={address} onAddressChange={setAddress} />

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-16 space-y-10 relative z-10">
          {/* Header Banner */}
          <div className="text-center space-y-4 max-w-3xl mx-auto pt-4 font-mono">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-black border-2 border-cyan-500/40 text-cyan-400 text-xs font-bold pixel-shadow-cyan">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>ORBINUM_TESTNET // FAIR_KEY_POOL_v2.0</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white uppercase font-mono">
              Selective Disclosure <br className="hidden sm:inline" />
              <span className="text-cyan-400 border-b-4 border-cyan-400">KEY EXCHANGE HUB</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed max-w-xl mx-auto font-sans">
              Swap ZK Disclosure Keys effortlessly with fellow testnet participants. Deposit 1 key to receive 1 community key for weekly quest completion.
            </p>
          </div>

          {/* Top Stats Counter */}
          <StatsBar stats={stats} isLoading={isLoadingStats} />

          {/* Center Swap Console */}
          <SwapCard address={address} onSwapCompleted={fetchDashboardData} />

          {/* Live Activity Timeline */}
          <ActivityFeed items={activity} />

          {/* Step-by-step Documentation */}
          <InstructionsCard />
        </main>
      </div>

      {/* Footer */}
      <footer className="w-full border-t-2 border-white/10 bg-[#07080c] py-6 px-4 sm:px-6 font-mono text-xs text-gray-500 relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-400">[ORBINUM_KEY_EXCHANGE]</span>
            <span>•</span>
            <span>TESTNET_COMMUNITY_HUB</span>
          </div>

          <div className="flex items-center gap-5 text-[11px]">
            <a
              href="https://app.orbinum.network/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cyan-400 transition-colors flex items-center gap-1"
            >
              <span>HUB_QUESTS</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://faucet.orbinum.network"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cyan-400 transition-colors flex items-center gap-1"
            >
              <span>FAUCET</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://explorer.testnet.orbinum.network"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cyan-400 transition-colors flex items-center gap-1"
            >
              <span>EXPLORER</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://discord.gg/orbinum"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cyan-400 transition-colors flex items-center gap-1"
            >
              <span>DISCORD</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
