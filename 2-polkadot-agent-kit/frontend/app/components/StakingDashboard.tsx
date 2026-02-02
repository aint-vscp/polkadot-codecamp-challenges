"use client";

import React from "react";
import { StakingPosition } from "../types";

interface StakingDashboardProps {
    position: StakingPosition | null;
    onClaimRewards?: () => void;
    onUnbond?: () => void;
    onWithdraw?: () => void;
    isLoading?: boolean;
}

const StakingDashboard: React.FC<StakingDashboardProps> = ({
    position,
    onClaimRewards,
    onUnbond,
    onWithdraw,
    isLoading,
}) => {
    if (isLoading) {
        return (
            <div className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
                <div className="grid grid-cols-3 gap-4">
                    <div className="h-20 bg-gray-200 rounded" />
                    <div className="h-20 bg-gray-200 rounded" />
                    <div className="h-20 bg-gray-200 rounded" />
                </div>
            </div>
        );
    }

    if (!position) {
        return (
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-100 rounded-xl p-6">
                <div className="text-center">
                    <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-pink-500 font-bold text-2xl">?</span>
                    </div>
                    <h3 className="font-bold text-gray-800 mb-2">No Active Stake</h3>
                    <p className="text-gray-600 text-sm">
                        You haven&apos;t joined any staking pool yet. Use the chat to join a pool
                        and start earning rewards!
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800">
                    Your Staking Position
                </h2>
                <span className="text-sm text-gray-500">Pool #{position.poolId}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Bonded Amount */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4">
                    <span className="text-green-600 text-sm font-medium">Bonded</span>
                    <div className="text-2xl font-bold text-gray-800 mt-1">
                        {position.bonded}
                    </div>
                    <span className="text-gray-500 text-xs">DOT</span>
                </div>

                {/* Unbonding Amount */}
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4">
                    <span className="text-orange-600 text-sm font-medium">Unbonding</span>
                    <div className="text-2xl font-bold text-gray-800 mt-1">
                        {position.unbonding}
                    </div>
                    <span className="text-gray-500 text-xs">DOT</span>
                </div>

                {/* Claimable Rewards */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4">
                    <span className="text-pink-600 text-sm font-medium">Rewards</span>
                    <div className="text-2xl font-bold text-gray-800 mt-1">
                        {position.claimableRewards}
                    </div>
                    <span className="text-gray-500 text-xs">DOT</span>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
                {parseFloat(position.claimableRewards) > 0 && onClaimRewards && (
                    <button
                        onClick={onClaimRewards}
                        className="flex-1 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-medium hover:opacity-90 transition"
                    >
                        Claim Rewards
                    </button>
                )}

                {parseFloat(position.bonded) > 0 && onUnbond && (
                    <button
                        onClick={onUnbond}
                        className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
                    >
                        Unbond
                    </button>
                )}

                {parseFloat(position.unbonding) > 0 && onWithdraw && (
                    <button
                        onClick={onWithdraw}
                        className="flex-1 py-2 bg-orange-100 text-orange-700 rounded-lg font-medium hover:bg-orange-200 transition"
                    >
                        Withdraw
                    </button>
                )}
            </div>
        </div>
    );
};

export default StakingDashboard;
