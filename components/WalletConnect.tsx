'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Wallet, CheckCircle2, AlertTriangle, ChevronDown, LogOut, RefreshCw } from 'lucide-react';

const ORBINUM_CHAIN_ID = '0xa8c'; // 2700 in hex (2700 = 0xA8C)
const ORBINUM_CHAIN_ID_DECIMAL = 2700;

const ORBINUM_NETWORK_PARAMS = {
  chainId: ORBINUM_CHAIN_ID,
  chainName: 'Orbinum Testnet',
  nativeCurrency: {
    name: 'Orbinum',
    symbol: 'ORB',
    decimals: 18,
  },
  rpcUrls: ['https://rpc-1.testnet.orbinum.io', 'https://rpc-2.testnet.orbinum.io'],
  blockExplorerUrls: ['https://explorer.testnet.orbinum.network'],
};

interface WalletConnectProps {
  address: string | null;
  onAddressChange: (address: string | null) => void;
}

export function WalletConnect({ address, onAddressChange }: WalletConnectProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [chainId, setChainId] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkNetwork = useCallback(async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const currentChainId = await (window as any).ethereum.request({ method: 'eth_chainId' });
        setChainId(currentChainId);
      } catch (err) {
        console.error('Failed to get chainId:', err);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      const ethereum = (window as any).ethereum;

      // Auto reconnect if accounts already connected
      ethereum.request({ method: 'eth_accounts' }).then((accounts: string[]) => {
        if (accounts && accounts.length > 0) {
          onAddressChange(accounts[0].toLowerCase());
        }
      });

      checkNetwork();

      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          onAddressChange(accounts[0].toLowerCase());
        } else {
          onAddressChange(null);
        }
      };

      const handleChainChanged = (newChainId: string) => {
        setChainId(newChainId);
      };

      ethereum.on('accountsChanged', handleAccountsChanged);
      ethereum.on('chainChanged', handleChainChanged);

      return () => {
        if (ethereum.removeListener) {
          ethereum.removeListener('accountsChanged', handleAccountsChanged);
          ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, [onAddressChange, checkNetwork]);

  const connectWallet = async () => {
    setError(null);
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      setError('MetaMask is not installed. Please install MetaMask to continue.');
      return;
    }

    try {
      setIsConnecting(true);
      const accounts = await (window as any).ethereum.request({
        method: 'eth_requestAccounts',
      });
      if (accounts && accounts.length > 0) {
        onAddressChange(accounts[0].toLowerCase());
        await checkNetwork();
      }
    } catch (err: any) {
      console.error('Wallet connection error:', err);
      setError(err?.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const switchToOrbinum = async () => {
    if (typeof window === 'undefined' || !(window as any).ethereum) return;
    try {
      await (window as any).ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: ORBINUM_CHAIN_ID }],
      });
    } catch (switchError: any) {
      // Chain not added error code 4902
      if (switchError.code === 4902) {
        try {
          await (window as any).ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [ORBINUM_NETWORK_PARAMS],
          });
        } catch (addError) {
          console.error('Failed to add Orbinum Network:', addError);
        }
      }
    }
  };

  const disconnectWallet = () => {
    onAddressChange(null);
    setShowDropdown(false);
  };

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const isWrongNetwork = address && chainId && chainId.toLowerCase() !== ORBINUM_CHAIN_ID;

  return (
    <div className="relative flex items-center gap-3">
      {/* Network Badge */}
      {address && (
        <button
          onClick={switchToOrbinum}
          className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border backdrop-blur-md transition-all ${
            isWrongNetwork
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
          }`}
          title="Click to switch to Orbinum Testnet"
        >
          <span className={`w-2 h-2 rounded-full ${isWrongNetwork ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
          <span>{isWrongNetwork ? 'Wrong Network (Switch)' : 'Orbinum Testnet'}</span>
        </button>
      )}

      {/* Main Connect / Account Button */}
      {!address ? (
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className="relative group overflow-hidden px-5 py-2.5 rounded-full font-medium text-sm text-white bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 active:scale-[0.98] transition-all shadow-glow-violet disabled:opacity-50"
        >
          <div className="flex items-center gap-2">
            {isConnecting ? (
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Wallet className="w-4 h-4" />
            )}
            <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
          </div>
        </button>
      ) : (
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-surface-light hover:bg-white/10 border border-surface-border text-white text-sm font-medium transition-all"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse-subtle" />
            <span className="font-mono text-xs tracking-wide">{truncateAddress(address)}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-56 p-2 rounded-2xl bg-surface border border-surface-border shadow-2xl backdrop-blur-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2 border-b border-white/5">
                <p className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider">Connected Wallet</p>
                <p className="font-mono text-xs text-white truncate mt-0.5">{address}</p>
              </div>

              {isWrongNetwork && (
                <button
                  onClick={switchToOrbinum}
                  className="w-full text-left px-3 py-2 mt-1 rounded-xl text-xs font-medium text-amber-300 hover:bg-amber-500/10 flex items-center gap-2 transition-all"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Switch to Orbinum Testnet</span>
                </button>
              )}

              <button
                onClick={disconnectWallet}
                className="w-full text-left px-3 py-2 mt-1 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 transition-all"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span>Disconnect</span>
              </button>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="absolute top-12 right-0 bg-rose-950/90 border border-rose-500/30 text-rose-200 text-xs px-3 py-2 rounded-xl backdrop-blur-md shadow-xl z-50 max-w-xs">
          {error}
        </div>
      )}
    </div>
  );
}
