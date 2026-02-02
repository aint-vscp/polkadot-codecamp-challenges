// Polkadot Agent Kit Types
// Type definitions for the staking agent

export interface PoolInfo {
    poolId: number;
    name: string;
    state: 'Open' | 'Blocked' | 'Destroying';
    memberCount: number;
    points: string;
    balance: string;
    commission: number;
}

export interface StakingPosition {
    poolId: number;
    bonded: string;
    unbonding: string;
    claimableRewards: string;
}

export interface AgentMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    toolCalls?: ToolCallResult[];
}

export interface ToolCallResult {
    tool: string;
    input: Record<string, unknown>;
    output: string;
    success: boolean;
}

export interface StakingAction {
    type: 'join_pool' | 'bond_extra' | 'unbond' | 'withdraw_unbonded' | 'claim_rewards' | 'get_pool_info';
    params: Record<string, unknown>;
}

// Chain configuration
export const SUPPORTED_CHAINS = [
    { id: 'polkadot', name: 'Polkadot', symbol: 'DOT' },
    { id: 'kusama', name: 'Kusama', symbol: 'KSM' },
    { id: 'westend', name: 'Westend', symbol: 'WND' },
] as const;

export type SupportedChain = typeof SUPPORTED_CHAINS[number]['id'];
