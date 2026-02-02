import { PoolInfo, StakingPosition } from "./types";

/**
 * Staking Agent - Handles AI-powered staking operations
 * This is a mock implementation for demonstration purposes.
 * In production, this would integrate with the actual Polkadot Agent Kit.
 */

// Mock pool data for demonstration
export const MOCK_POOLS: PoolInfo[] = [
    {
        poolId: 1,
        name: "Polkadot Foundation Pool",
        state: "Open",
        memberCount: 1250,
        points: "5000000",
        balance: "1,234,567",
        commission: 3,
    },
    {
        poolId: 2,
        name: "Parity Technologies",
        state: "Open",
        memberCount: 890,
        points: "3500000",
        balance: "987,654",
        commission: 5,
    },
    {
        poolId: 3,
        name: "Web3 Foundation",
        state: "Open",
        memberCount: 567,
        points: "2000000",
        balance: "654,321",
        commission: 2,
    },
    {
        poolId: 4,
        name: "Community Pool Alpha",
        state: "Blocked",
        memberCount: 234,
        points: "1000000",
        balance: "321,000",
        commission: 10,
    },
    {
        poolId: 5,
        name: "Kusama Bridge Pool",
        state: "Open",
        memberCount: 445,
        points: "1800000",
        balance: "456,789",
        commission: 4,
    },
];

// Mock user position
export const MOCK_POSITION: StakingPosition = {
    poolId: 1,
    bonded: "150.00",
    unbonding: "0.00",
    claimableRewards: "2.45",
};

/**
 * Parse user intent from natural language
 */
export function parseUserIntent(message: string): {
    action: string;
    params: Record<string, string | number>;
} {
    const lowerMessage = message.toLowerCase();

    // Join pool
    if (lowerMessage.includes("join") && lowerMessage.includes("pool")) {
        const poolMatch = message.match(/pool\s*#?\s*(\d+)/i);
        const amountMatch = message.match(/(\d+(?:\.\d+)?)\s*(?:dot|tokens?)?/i);
        return {
            action: "join_pool",
            params: {
                poolId: poolMatch ? parseInt(poolMatch[1]) : 1,
                amount: amountMatch ? parseFloat(amountMatch[1]) : 10,
            },
        };
    }

    // Bond extra
    if (lowerMessage.includes("bond") && (lowerMessage.includes("extra") || lowerMessage.includes("more"))) {
        const amountMatch = message.match(/(\d+(?:\.\d+)?)\s*(?:dot|tokens?)?/i);
        return {
            action: "bond_extra",
            params: {
                amount: amountMatch ? parseFloat(amountMatch[1]) : 10,
            },
        };
    }

    // Unbond
    if (lowerMessage.includes("unbond") || lowerMessage.includes("unstake")) {
        const amountMatch = message.match(/(\d+(?:\.\d+)?)\s*(?:dot|tokens?)?/i);
        return {
            action: "unbond",
            params: {
                amount: amountMatch ? parseFloat(amountMatch[1]) : 10,
            },
        };
    }

    // Withdraw
    if (lowerMessage.includes("withdraw")) {
        return {
            action: "withdraw_unbonded",
            params: {},
        };
    }

    // Claim rewards
    if (lowerMessage.includes("claim") || lowerMessage.includes("reward")) {
        return {
            action: "claim_rewards",
            params: {},
        };
    }

    // Get pool info
    if (lowerMessage.includes("pool") && (lowerMessage.includes("info") || lowerMessage.includes("status") || lowerMessage.includes("show") || lowerMessage.includes("list") || lowerMessage.includes("available"))) {
        const poolMatch = message.match(/pool\s*#?\s*(\d+)/i);
        return {
            action: "get_pool_info",
            params: poolMatch ? { poolId: parseInt(poolMatch[1]) } : {},
        };
    }

    // Check balance/position
    if (lowerMessage.includes("balance") || lowerMessage.includes("position") || lowerMessage.includes("stake") || lowerMessage.includes("my")) {
        return {
            action: "get_position",
            params: {},
        };
    }

    // Default - help
    return {
        action: "help",
        params: {},
    };
}

/**
 * Generate response based on parsed action
 */
export function generateAgentResponse(
    action: string,
    params: Record<string, string | number>,
    hasWallet: boolean
): string {
    if (!hasWallet) {
        return "Please connect your wallet first to interact with staking pools.";
    }

    switch (action) {
        case "join_pool": {
            const pool = MOCK_POOLS.find((p) => p.poolId === params.poolId);
            if (!pool) {
                return `Pool #${params.poolId} not found. Available pools are: ${MOCK_POOLS.map((p) => `#${p.poolId}`).join(", ")}`;
            }
            if (pool.state !== "Open") {
                return `Pool #${pool.poolId} (${pool.name}) is currently ${pool.state} and not accepting new members.`;
            }
            return `Great choice! I'll help you join ${pool.name} (Pool #${pool.poolId}) with ${params.amount} DOT.

Pool Details:
- Commission: ${pool.commission}%
- Members: ${pool.memberCount}
- Total Staked: ${pool.balance} DOT

To complete this transaction, please confirm in your wallet when prompted.

Note: This is a demo. In production, this would trigger the actual transaction.`;
        }

        case "bond_extra":
            return `I'll add ${params.amount} DOT to your existing stake.

Current Position:
- Bonded: 150.00 DOT
- After bonding: ${150 + Number(params.amount)} DOT

Please confirm the transaction in your wallet.

Note: This is a demo. In production, this would trigger the actual transaction.`;

        case "unbond":
            return `I'll unbond ${params.amount} DOT from your stake.

Important: Unbonding takes approximately 28 days on Polkadot. During this period, you won't earn rewards on unbonding tokens.

Current Position:
- Bonded: 150.00 DOT
- After unbonding: ${150 - Number(params.amount)} DOT

Please confirm the transaction in your wallet.

Note: This is a demo. In production, this would trigger the actual transaction.`;

        case "withdraw_unbonded":
            return `Checking for unbonded tokens...

You currently have 0 DOT available to withdraw. Your tokens may still be in the unbonding period.

Unbonding period on Polkadot is approximately 28 days.`;

        case "claim_rewards":
            return `I'll claim your pending rewards.

Claimable Rewards: 2.45 DOT

Rewards will be sent to your connected wallet address.

Please confirm the transaction in your wallet.

Note: This is a demo. In production, this would trigger the actual transaction.`;

        case "get_pool_info": {
            if (params.poolId) {
                const pool = MOCK_POOLS.find((p) => p.poolId === params.poolId);
                if (!pool) {
                    return `Pool #${params.poolId} not found.`;
                }
                return `${pool.name} (Pool #${pool.poolId})

Status: ${pool.state}
Members: ${pool.memberCount}
Commission: ${pool.commission}%
Total Staked: ${pool.balance} DOT

${pool.state === "Open" ? "This pool is accepting new members. Would you like to join?" : "This pool is not currently accepting new members."}`;
            }

            // List all pools
            let response = "Available Staking Pools:\n\n";
            MOCK_POOLS.forEach((pool) => {
                response += `Pool #${pool.poolId}: ${pool.name}\n`;
                response += `  - Members: ${pool.memberCount}, Commission: ${pool.commission}%, Status: ${pool.state}\n\n`;
            });
            response += "Would you like to join any of these pools? Just say 'Join pool #X with Y DOT'.";
            return response;
        }

        case "get_position":
            return `Your Staking Position:

Pool: #${MOCK_POSITION.poolId} (Polkadot Foundation Pool)
Bonded: ${MOCK_POSITION.bonded} DOT
Unbonding: ${MOCK_POSITION.unbonding} DOT
Claimable Rewards: ${MOCK_POSITION.claimableRewards} DOT

You can:
- Bond more tokens to increase rewards
- Claim rewards to receive your earnings
- Unbond to start withdrawing tokens`;

        case "help":
        default:
            return `I can help you with the following staking operations:

1. Join a pool - "Join pool #1 with 50 DOT"
2. Bond extra - "Bond 20 more DOT"
3. Unbond tokens - "Unbond 10 DOT"
4. Withdraw - "Withdraw my unbonded tokens"
5. Claim rewards - "Claim my staking rewards"
6. View pools - "Show available pools"
7. Check position - "What is my staking position?"

What would you like to do?`;
    }
}

/**
 * Process a user message through the staking agent
 */
export async function processAgentMessage(
    message: string,
    hasWallet: boolean
): Promise<string> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const { action, params } = parseUserIntent(message);
    return generateAgentResponse(action, params, hasWallet);
}
