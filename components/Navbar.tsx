'use client';

import React from 'react';
import { AddressInput } from './AddressInput';
import { Terminal } from 'lucide-react';

interface NavbarProps {
  address: string | null;
  onAddressChange: (address: string | null) => void;
}

export function Navbar({ address, onAddressChange }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#07080c]/90 backdrop-blur-xl">
      {/* Top Cyber System Ticker */}
      <div className="hidden sm:flex items-center justify-between px-6 py-1 bg-surface-dark border-b border-white/5 text-[10px] font-mono text-gray-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" />
            [SYS_STATUS: ONLINE]
          </span>
          <span>ORBINUM_CHAIN_ID: 2700</span>
          <span>ZK_ENGINE: ACTIVE</span>
        </div>
        <div className="flex items-center gap-3 text-gray-500">
          <span>FAIR_EXCHANGE: 1-FOR-1</span>
          <span>RPC: RPC-1.TESTNET</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 bg-black border-2 border-cyan-500/40 text-cyan-400 pixel-shadow-cyan font-mono font-bold text-sm">
            <Terminal className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base sm:text-lg tracking-tight text-white font-mono">
                ORBINUM <span className="text-cyan-400">KEY_SWAP</span>
              </h1>
              <span className="px-1.5 py-0.5 text-[9px] font-mono uppercase font-bold tracking-widest bg-violet-950/80 text-violet-300 border border-violet-500/30">
                v2.0
              </span>
            </div>
            <p className="text-[10px] font-mono text-gray-400 hidden sm:block">
              ZK Selective Disclosure Key Exchange Console
            </p>
          </div>
        </div>

        {/* Right Section: Address Input */}
        <AddressInput address={address} onAddressChange={onAddressChange} />
      </div>
    </header>
  );
}
