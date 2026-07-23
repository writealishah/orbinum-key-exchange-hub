'use client';

import React, { useState, useEffect } from 'react';
import { User, Check, Edit3, HelpCircle, ShieldCheck, Trash2 } from 'lucide-react';

interface AddressInputProps {
  address: string | null;
  onAddressChange: (address: string | null) => void;
}

export function AddressInput({ address, onAddressChange }: AddressInputProps) {
  const [inputAddr, setInputAddr] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  // Load address from localStorage on initial render
  useEffect(() => {
    const saved = localStorage.getItem('orbinum_evm_address');
    if (saved && /^0x[a-fA-F0-9]{40}$/.test(saved)) {
      onAddressChange(saved.toLowerCase());
      setInputAddr(saved.toLowerCase());
    } else {
      setIsEditing(true);
    }
  }, [onAddressChange]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputAddr.trim().toLowerCase();
    if (!clean || !/^0x[a-f0-9]{40}$/.test(clean)) {
      setError('Invalid EVM address. Must start with 0x and be 42 characters long.');
      return;
    }
    setError(null);
    localStorage.setItem('orbinum_evm_address', clean);
    onAddressChange(clean);
    setIsEditing(false);
  };

  const handleClear = () => {
    localStorage.removeItem('orbinum_evm_address');
    onAddressChange(null);
    setInputAddr('');
    setIsEditing(true);
  };

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="relative font-mono">
      {/* Saved Active Address Pill */}
      {address && !isEditing ? (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-black border-2 border-cyan-500/40 text-cyan-300 text-xs pixel-shadow-cyan">
            <span className="w-2 h-2 bg-emerald-400 animate-ping" />
            <span className="text-[10px] text-gray-400 font-bold hidden sm:inline">[EVM]:</span>
            <span className="font-bold">{truncateAddress(address)}</span>
            <button
              onClick={() => setIsEditing(true)}
              className="ml-1 text-gray-400 hover:text-white transition-colors"
              title="Edit EVM Address"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleClear}
              className="text-gray-500 hover:text-rose-400 transition-colors"
              title="Clear Saved Address"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Info Button */}
          <button
            onClick={() => setShowTooltip(!showTooltip)}
            className="p-1.5 bg-black border border-white/20 text-gray-400 hover:text-cyan-300 transition-colors"
            title="Why EVM Address is needed?"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* Address Input Form */
        <form onSubmit={handleSave} className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              value={inputAddr}
              onChange={(e) => {
                setInputAddr(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Paste EVM Address (0x123...)"
              className="w-48 sm:w-64 px-3 py-1.5 bg-black border-2 border-white/20 text-cyan-300 text-xs font-mono placeholder:text-gray-600 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <button
            type="submit"
            className="px-3 py-1.5 bg-cyan-400 hover:bg-cyan-300 text-black font-mono font-bold text-xs border-2 border-black pixel-shadow-cyan transition-all"
          >
            SAVE
          </button>

          {/* Info Tooltip Button */}
          <button
            type="button"
            onClick={() => setShowTooltip(!showTooltip)}
            className="p-1.5 bg-black border border-white/20 text-gray-400 hover:text-cyan-300 transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </form>
      )}

      {/* Error Popup */}
      {error && (
        <div className="absolute top-10 right-0 z-50 p-2.5 bg-rose-950 border border-rose-500 text-rose-200 text-[11px] font-mono shadow-xl max-w-xs">
          {error}
        </div>
      )}

      {/* Explanation Tooltip Drawer */}
      {showTooltip && (
        <div className="absolute top-12 right-0 z-50 w-72 sm:w-80 p-4 bg-[#0c0e17] border-2 border-cyan-500/50 text-white font-mono text-xs shadow-2xl animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
            <span className="font-bold text-cyan-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              WHY EVM ADDRESS IS NEEDED:
            </span>
            <button onClick={() => setShowTooltip(false)} className="text-gray-400 hover:text-white">
              ✕
            </button>
          </div>
          <ul className="space-y-2 text-[11px] text-gray-300 leading-relaxed font-sans">
            <li>
              • <strong className="text-white">Fair Exchange (1-for-1):</strong> Links your deposit to your wallet string.
            </li>
            <li>
              • <strong className="text-white">No Self-Swaps:</strong> Ensures you never receive a key you deposited.
            </li>
            <li>
              • <strong className="text-white">Rate Limit Enforcement:</strong> Restricts to 3 swaps per wallet per day.
            </li>
            <li>
              • <strong className="text-emerald-400">100% Safe:</strong> No wallet signature or transaction gas required.
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
