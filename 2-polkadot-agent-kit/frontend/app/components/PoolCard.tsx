"use client";

import React from "react";
import { PoolInfo } from "../types";

interface PoolCardProps {
    pool: PoolInfo;
    onJoin?: (poolId: number) => void;
}

const PoolCard: React.FC<PoolCardProps> = ({ pool, onJoin }) => {
    const getStateColor = (state: PoolInfo["state"]) => {
        switch (state) {
            case "Open":
                return "bg-green-100 text-green-700";
            case "Blocked":
                return "bg-yellow-100 text-yellow-700";
            case "Destroying":
                return "bg-red-100 text-red-700";
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition">
            <div className="flex items-start justify-between mb-3">
                <div>
                    <span className="text-xs text-gray-400">Pool #{pool.poolId}</span>
                    <h3 className="font-bold text-gray-800">{pool.name}</h3>
                </div>
                <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStateColor(
                        pool.state
                    )}`}
                >
                    {pool.state}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                <div className="bg-gray-50 rounded-lg p-2">
                    <span className="text-gray-500 text-xs">Members</span>
                    <div className="font-semibold text-gray-800">{pool.memberCount}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                    <span className="text-gray-500 text-xs">Commission</span>
                    <div className="font-semibold text-gray-800">{pool.commission}%</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2 col-span-2">
                    <span className="text-gray-500 text-xs">Total Staked</span>
                    <div className="font-semibold text-gray-800">{pool.balance} DOT</div>
                </div>
            </div>

            {pool.state === "Open" && onJoin && (
                <button
                    onClick={() => onJoin(pool.poolId)}
                    className="w-full py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-medium hover:opacity-90 transition"
                >
                    Join Pool
                </button>
            )}
        </div>
    );
};

interface PoolListProps {
    pools: PoolInfo[];
    onJoinPool?: (poolId: number) => void;
    isLoading?: boolean;
}

export const PoolList: React.FC<PoolListProps> = ({
    pools,
    onJoinPool,
    isLoading,
}) => {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="bg-white border border-gray-200 rounded-xl p-4 animate-pulse"
                    >
                        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
                        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
                        <div className="grid grid-cols-2 gap-3">
                            <div className="h-12 bg-gray-200 rounded" />
                            <div className="h-12 bg-gray-200 rounded" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (pools.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                No pools available. Check back later.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pools.map((pool) => (
                <PoolCard key={pool.poolId} pool={pool} onJoin={onJoinPool} />
            ))}
        </div>
    );
};

export default PoolCard;
