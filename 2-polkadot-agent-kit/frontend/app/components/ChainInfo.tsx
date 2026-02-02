"use client";

import React from "react";
import { useChain } from "@luno-kit/react";

/**
 * ChainInfo component displays the current connected blockchain
 * Uses LunoKit's useChain hook to fetch chain data
 */
const ChainInfo: React.FC = () => {
    const { chain, chainId } = useChain();

    if (!chain) {
        return (
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4">
                <div className="text-center">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-1">
                        <span className="text-gray-400 font-bold">?</span>
                    </div>
                    <p className="text-gray-500 text-sm">No chain connected</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-lg">
            <h3 className="font-bold text-gray-800 mb-3">
                Connected Chain
            </h3>
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-4 border border-indigo-100">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                            {chain.name[0]}
                        </span>
                    </div>
                    <div>
                        <div className="font-bold text-gray-800 text-lg">
                            {chain.name}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
                                {chain.nativeCurrency?.symbol || "TOKEN"}
                            </span>
                            {chainId && (
                                <span className="text-gray-400 text-xs">
                                    ID: {chainId}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChainInfo;
