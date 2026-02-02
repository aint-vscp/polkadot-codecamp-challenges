"use client";

import React from "react";
import { useAccounts } from "@luno-kit/react";

/**
 * AccountsDisplay component shows all connected wallet accounts
 * Uses LunoKit's useAccounts hook to fetch account data
 */
const AccountsDisplay: React.FC = () => {
    const { accounts } = useAccounts();

    if (accounts.length === 0) {
        return (
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-6">
                <div className="text-center">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-gray-400 font-bold">?</span>
                    </div>
                    <h3 className="font-bold text-gray-800 mb-1">No Accounts</h3>
                    <p className="text-gray-500 text-sm">
                        Connect your wallet to see accounts
                    </p>
                </div>
            </div>
        );
    }

    const truncateAddress = (address: string) => {
        if (address.length <= 16) return address;
        return `${address.slice(0, 8)}...${address.slice(-8)}`;
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
            <h3 className="font-bold text-gray-800 mb-4">
                Connected Accounts ({accounts.length})
            </h3>
            <div className="space-y-3">
                {accounts.map((account, index) => (
                    <div
                        key={account.address || index}
                        className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-100"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                                    {(account.name || "A")[0].toUpperCase()}
                                </div>
                                <div>
                                    <div className="font-medium text-gray-800">
                                        {account.name || `Account ${index + 1}`}
                                    </div>
                                    <div className="text-xs text-gray-500 font-mono">
                                        {truncateAddress(account.address)}
                                    </div>
                                </div>
                            </div>
                            {account.type && (
                                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                                    {account.type}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AccountsDisplay;
