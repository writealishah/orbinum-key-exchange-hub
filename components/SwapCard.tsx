'use client';

import React, { useState } from 'react';
import { Terminal, ArrowRight, Copy, Check, ExternalLink, AlertTriangle, ShieldCheck, RefreshCw, Lock } from 'lucide-react';
import { submitAndFetchKey, SwapResult } from '@/actions/keySwap';

interface SwapCardProps {
  address: string | null;
  onSwapCompleted: () => void;
}

export function SwapCard({ address, onSwapCompleted }: SwapCardProps) {
  const [inputKey, setInputKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [swapResult, setSwapResult] = useState<SwapResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const trimmedKey = inputKey.trim();
  const isValidFormat =
    trimmedKey.length > 0 &&
    (trimmedKey.startsWith('orbdisc:') ||
      trimmedKey.includes('disclosure') ||
      trimmedKey.length > 20);

  const handleSwap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) {
      setErrorMsg('Wallet not connected. Connect MetaMask to continue.');
      return;
    }
    if (!trimmedKey) {
      setErrorMsg('Key field cannot be empty.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSwapResult(null);

    try {
      const res = await submitAndFetchKey(address, trimmedKey);
      if (res.success) {
        setSwapResult(res);
        setInputKey('');
        onSwapCompleted();
      } else {
        setErrorMsg(res.error || res.message || 'Swap operation failed.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Console Frame */}
      <div className="bg-[#0b0d14] border-2 border-cyan-500/40 pixel-shadow-cyan p-6 sm:p-8">
        {/* Terminal Header */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10 font-mono">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-rose-500 inline-block" />
              <span className="w-3 h-3 bg-amber-500 inline-block" />
              <span className="w-3 h-3 bg-emerald-500 inline-block" />
            </div>
            <span className="text-xs text-gray-400 font-bold ml-2">[CONSOLE_SWAP_ENGINE]</span>
          </div>
          <span className="text-[10px] text-cyan-400 border border-cyan-500/30 px-2 py-0.5 bg-cyan-950/40">
            ATOMIC_LOCK: ON
          </span>
        </div>

        {/* Console Subheader */}
        <div className="mb-6 bg-black/60 border border-white/10 p-3.5 font-mono text-xs text-gray-300">
          <p className="text-cyan-400 font-bold mb-1">&gt; 1-FOR-1 FAIR EXCHANGE PROTOCOL</p>
          <p className="text-[11px] text-gray-400 leading-relaxed">
            Deposit 1 valid ZK Disclosure Key (<code className="text-violet-300">orbdisc:...</code>) to retrieve 1 community key. Self-swaps strictly disabled.
          </p>
        </div>

        {/* Form Input */}
        <form onSubmit={handleSwap} className="space-y-5">
          <div>
            <div className="flex items-center justify-between mb-2 font-mono text-xs">
              <label htmlFor="disclosure-key-input" className="text-gray-300 uppercase font-bold flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                INPUT_DISCLOSURE_KEY:
              </label>
              {trimmedKey && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 border ${
                    isValidFormat
                      ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40'
                      : 'bg-rose-950/60 text-rose-400 border-rose-500/40'
                  }`}
                >
                  {isValidFormat ? '[✓ VALID FORMAT]' : '[! MUST START WITH orbdisc:]'}
                </span>
              )}
            </div>

            <div className="relative">
              <textarea
                id="disclosure-key-input"
                rows={3}
                value={inputKey}
                onChange={(e) => {
                  setInputKey(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder="> orbdisc:zk_proof_alpha_12345..."
                className="w-full px-4 py-3 bg-black border-2 border-white/20 text-cyan-300 font-mono text-xs placeholder:text-gray-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 resize-none"
              />
              {trimmedKey && (
                <button
                  type="button"
                  onClick={() => setInputKey('')}
                  className="absolute top-2.5 right-2.5 text-[10px] font-mono text-gray-400 hover:text-white bg-white/10 px-2 py-0.5 border border-white/20"
                >
                  CLEAR
                </button>
              )}
            </div>
          </div>

          {/* Error Message Display */}
          {errorMsg && (
            <div className="flex items-start gap-2 p-3 bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs font-mono">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit Tactile Action Button */}
          <button
            type="submit"
            disabled={!address || !isValidFormat || isLoading}
            className="w-full py-4 px-6 font-mono font-bold text-sm text-black bg-cyan-400 hover:bg-cyan-300 active:translate-y-1 transition-all border-2 border-black pixel-shadow-cyan disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-cyan-400"
          >
            <div className="flex items-center justify-center gap-2">
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-black" />
                  <span>[EXECUTING ATOMIC SWAP...]</span>
                </>
              ) : !address ? (
                <span>[CONNECT WALLET TO SWAP]</span>
              ) : (
                <>
                  <span>[EXECUTE KEY SWAP]</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </div>
          </button>
        </form>

        {/* Output Console Box */}
        {swapResult && (
          <div className="mt-6 p-5 bg-black border-2 border-violet-500/40 text-white font-mono text-xs animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-emerald-400 font-bold mb-3 border-b border-white/10 pb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>&gt; {swapResult.message}</span>
            </div>

            {swapResult.claimedKey ? (
              <div className="space-y-4 mt-2">
                <p className="text-gray-400 text-[11px]">&gt; RETRIEVED_COMMUNITY_KEY:</p>

                <div className="p-3 bg-[#080a10] border border-cyan-500/40 text-cyan-300 text-xs break-all select-all font-mono">
                  {swapResult.claimedKey}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={() => handleCopy(swapResult.claimedKey!)}
                    className={`w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-4 py-2.5 font-mono font-bold text-xs border transition-all ${
                      copied
                        ? 'bg-emerald-500 text-black border-emerald-400'
                        : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>[COPIED TO CLIPBOARD!]</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>[📋 COPY KEY]</span>
                      </>
                    )}
                  </button>

                  <a
                    href="https://app.orbinum.network/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-violet-950/80 hover:bg-violet-900 border border-violet-500/40 text-violet-300 font-mono text-xs font-bold transition-all"
                  >
                    <span>[SUBMIT ON HUB ↗]</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ) : (
              <p className="text-gray-400 text-[11px] leading-relaxed">
                &gt; Key successfully deposited into community pool. As soon as another member deposits a key, you will be able to retrieve a fresh key.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
