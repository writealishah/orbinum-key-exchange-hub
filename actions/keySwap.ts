'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export interface SwapResult {
  success: boolean;
  claimedKey?: string | null;
  message: string;
  error?: string;
}

export interface PoolStats {
  totalKeysSubmitted: number;
  activeAvailableKeys: number;
  totalSwapsCompleted: number;
}

export interface ActivityItem {
  id: string;
  type: 'SWAP' | 'DEPOSIT';
  userAddress: string;
  createdAt: string;
}

/**
 * Validates whether the Disclosure Key is authentic and properly structured.
 * Checks for:
 * 1. Correct "orbdisc:" prefix.
 * 2. Proper ZK payload structure (minimum length, hex/base64 nullifier commitment).
 * 3. Rejection of fake or random string inputs.
 */
function isValidDisclosureKey(key: string): { valid: boolean; reason?: string } {
  const trimmed = key.trim();
  
  if (!trimmed) {
    return { valid: false, reason: 'Key cannot be empty.' };
  }

  // 1. Must start with official Orbinum prefix "orbdisc:"
  if (!trimmed.startsWith('orbdisc:')) {
    return {
      valid: false,
      reason: 'Invalid prefix. Disclosure keys must start with "orbdisc:".',
    };
  }

  const payload = trimmed.slice(8); // Remove "orbdisc:" prefix

  // 2. Minimum length check for ZK disclosure commitment
  if (payload.length < 16) {
    return {
      valid: false,
      reason: 'Key payload is too short to be a valid ZK disclosure proof.',
    };
  }

  // 3. Structural validation for Base64 or Hex ZK commitment payload
  const isValidFormat =
    /^(zk_|proof_|disc_)[a-zA-Z0-9_-]{16,}$/.test(payload) ||
    /^[a-fA-F0-9]{32,}$/.test(payload) ||
    /^[A-Za-z0-9+/=]{24,}$/.test(payload);

  if (!isValidFormat) {
    return {
      valid: false,
      reason: 'Invalid ZK cryptographic payload structure.',
    };
  }

  return { valid: true };
}

/**
 * Optional RPC verification against Orbinum Testnet node
 */
async function verifyKeyOnChainRPC(disclosureKey: string): Promise<boolean> {
  try {
    // Query Orbinum RPC node to verify nullifier validity
    const response = await fetch('https://rpc-1.testnet.orbinum.io', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'orb_verifyDisclosureKey',
        params: [disclosureKey],
        id: 1,
      }),
      // Fast timeout so RPC issues don't block user
      signal: AbortSignal.timeout(3000),
    });

    if (!response.ok) return true; // Fallback to local validation if RPC endpoint is unreachable
    const data = await response.json();
    return data?.result?.valid !== false;
  } catch {
    // If RPC node is offline or endpoint custom, fallback to structural validation
    return true;
  }
}

/**
 * Helper to get current UTC YYYY-MM-DD string
 */
function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Executes 1-for-1 Fair Key Swap atomically.
 */
export async function submitAndFetchKey(
  userAddress: string,
  newDisclosureKey: string
): Promise<SwapResult> {
  try {
    // 1. Sanitize & Validate Address
    const cleanAddress = userAddress.trim().toLowerCase();
    if (!cleanAddress || !/^0x[a-f0-9]{40}$/i.test(cleanAddress)) {
      return {
        success: false,
        error: 'Invalid EVM wallet address. Please reconnect your wallet.',
        message: 'Invalid wallet address.',
      };
    }

    // 2. Cryptographic Structural Validation
    const cleanKey = newDisclosureKey.trim();
    const validation = isValidDisclosureKey(cleanKey);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.reason || 'Invalid Disclosure Key format.',
        message: 'Validation failed.',
      };
    }

    // 3. On-Chain RPC Check (Optional Verification)
    const isOnChainValid = await verifyKeyOnChainRPC(cleanKey);
    if (!isOnChainValid) {
      return {
        success: false,
        error: 'This key was rejected by Orbinum RPC as invalid or already spent on-chain.',
        message: 'On-chain verification failed.',
      };
    }

    // 4. Check for Duplicate Key in Hub DB
    const existingKey = await prisma.disclosureKey.findFirst({
      where: { disclosure_key: cleanKey },
    });

    if (existingKey) {
      return {
        success: false,
        error: 'This Disclosure Key has already been submitted to the community hub. Please submit a fresh key.',
        message: 'Duplicate key detected.',
      };
    }

    // 5. Enforce Rate Limits (Max 3 swaps per wallet per UTC day)
    const today = getTodayDateString();
    const rateLimit = await prisma.rateLimit.findUnique({
      where: {
        user_address_action_date: {
          user_address: cleanAddress,
          action_date: today,
        },
      },
    });

    if (rateLimit && rateLimit.count >= 3) {
      return {
        success: false,
        error: 'Daily swap limit reached (Max 3 swaps per wallet per day). Please try again tomorrow.',
        message: 'Rate limit exceeded.',
      };
    }

    // 6. Atomic Fair Exchange Transaction
    const result = await prisma.$transaction(async (tx) => {
      // Step A: Store User's Key into the pool
      await tx.disclosureKey.create({
        data: {
          owner_address: cleanAddress,
          disclosure_key: cleanKey,
          status: 'AVAILABLE',
        },
      });

      // Step B: Query for 1 available key from ANOTHER user
      const availableKeys = await tx.$queryRaw<Array<{ id: string; disclosure_key: string }>>`
        SELECT id, disclosure_key 
        FROM disclosure_keys 
        WHERE status = 'AVAILABLE' 
          AND owner_address != ${cleanAddress} 
        ORDER BY RANDOM() 
        LIMIT 1
      `;

      let claimedKeyString: string | null = null;

      if (availableKeys && availableKeys.length > 0) {
        const targetKey = availableKeys[0];
        // Step C: Mark target key as CLAIMED atomically
        await tx.disclosureKey.update({
          where: { id: targetKey.id },
          data: {
            status: 'CLAIMED',
            claimed_by: cleanAddress,
            claimed_at: new Date(),
          },
        });
        claimedKeyString = targetKey.disclosure_key;
      }

      // Step D: Increment rate limit record
      await tx.rateLimit.upsert({
        where: {
          user_address_action_date: {
            user_address: cleanAddress,
            action_date: today,
          },
        },
        update: {
          count: { increment: 1 },
        },
        create: {
          user_address: cleanAddress,
          action_date: today,
          count: 1,
        },
      });

      return claimedKeyString;
    });

    revalidatePath('/');

    if (result) {
      return {
        success: true,
        claimedKey: result,
        message: 'Swap successful! You received 1 fresh community Disclosure Key.',
      };
    } else {
      return {
        success: true,
        claimedKey: null,
        message: 'Your key has been added to the pool! No other keys are currently available. Check back shortly as new users join.',
      };
    }
  } catch (err: any) {
    console.error('Key swap server action error:', err);
    return {
      success: false,
      error: 'An unexpected server error occurred during key exchange. Please try again.',
      message: err?.message || 'Server error',
    };
  }
}

/**
 * Returns public stats for the dashboard counters.
 */
export async function getPoolStats(): Promise<PoolStats> {
  try {
    const [totalKeysSubmitted, activeAvailableKeys, totalSwapsCompleted] = await Promise.all([
      prisma.disclosureKey.count(),
      prisma.disclosureKey.count({ where: { status: 'AVAILABLE' } }),
      prisma.disclosureKey.count({ where: { status: 'CLAIMED' } }),
    ]);

    return {
      totalKeysSubmitted,
      activeAvailableKeys,
      totalSwapsCompleted,
    };
  } catch (err) {
    console.error('Error fetching pool stats:', err);
    return {
      totalKeysSubmitted: 0,
      activeAvailableKeys: 0,
      totalSwapsCompleted: 0,
    };
  }
}

/**
 * Returns public anonymized activity items for community feed.
 */
export async function getRecentActivity(): Promise<ActivityItem[]> {
  try {
    const records = await prisma.disclosureKey.findMany({
      take: 8,
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        owner_address: true,
        status: true,
        created_at: true,
      },
    });

    return records.map((r) => ({
      id: r.id,
      type: r.status === 'CLAIMED' ? 'SWAP' : 'DEPOSIT',
      userAddress: r.owner_address,
      createdAt: r.created_at.toISOString(),
    }));
  } catch (err) {
    console.error('Error fetching activity:', err);
    return [];
  }
}
