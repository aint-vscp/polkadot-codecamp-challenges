"use client";

import { useState, useCallback } from "react";
import { useConnect, ConnectionStatus } from "@luno-kit/react";
import WalletConnect from "./components/WalletConnect";
import ChatInterface from "./components/ChatInterface";
import StakingDashboard from "./components/StakingDashboard";
import { PoolList } from "./components/PoolCard";
import AccountsDisplay from "./components/AccountsDisplay";
import ChainInfo from "./components/ChainInfo";
import { processAgentMessage, MOCK_POOLS, MOCK_POSITION } from "./agent";

type Tab = "chat" | "pools" | "dashboard";

export default function Home() {
  const { status } = useConnect();
  const isConnected = status === ConnectionStatus.Connected;
  const [activeTab, setActiveTab] = useState<Tab>("chat");

  const handleSendMessage = useCallback(
    async (message: string): Promise<string> => {
      return processAgentMessage(message, isConnected);
    },
    [isConnected]
  );

  const tabs = [
    { id: "chat" as Tab, label: "AI Agent" },
    { id: "pools" as Tab, label: "Pools" },
    { id: "dashboard" as Tab, label: "Dashboard" },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                Polkadot Staking Agent
              </h1>
              <p className="text-xs text-gray-500">
                AI-powered Nomination Pools
              </p>
            </div>
          </div>
          <WalletConnect />
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-3">
            Stake Smarter with AI Assistance
          </h2>
          <p className="text-lg text-pink-100 max-w-2xl mx-auto">
            Use natural language to manage your Polkadot staking. Join pools,
            claim rewards, and monitor your position - all through conversation.
          </p>
          <div className="flex justify-center gap-4 mt-6">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
              <span className="text-sm">Total Staked</span>
              <div className="text-2xl font-bold">4.6M DOT</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
              <span className="text-sm">Active Pools</span>
              <div className="text-2xl font-bold">{MOCK_POOLS.length}</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
              <span className="text-sm">Avg APY</span>
              <div className="text-2xl font-bold">14.5%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-2xl p-1 shadow-lg inline-flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-xl font-medium transition ${activeTab === tab.id
                  ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Tab */}
        {activeTab === "chat" && (
          <div className="max-w-2xl mx-auto">
            <ChatInterface
              isConnected={isConnected}
              onSendMessage={handleSendMessage}
            />
          </div>
        )}

        {/* Pools Tab */}
        {activeTab === "pools" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Nomination Pools
              </h2>
              <div className="text-sm text-gray-500">
                {MOCK_POOLS.filter((p) => p.state === "Open").length} open pools
              </div>
            </div>
            <PoolList
              pools={MOCK_POOLS}
              onJoinPool={(poolId) => {
                setActiveTab("chat");
              }}
            />
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div className="max-w-4xl mx-auto">
            {/* Accounts and Chain Info Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <ChainInfo />
              <AccountsDisplay />
            </div>

            {/* Staking Position */}
            <div className="max-w-2xl mx-auto">
              <StakingDashboard
                position={isConnected ? MOCK_POSITION : null}
                onClaimRewards={() => setActiveTab("chat")}
                onUnbond={() => setActiveTab("chat")}
                onWithdraw={() => setActiveTab("chat")}
              />

              {/* Recent Activity */}
              <div className="mt-6 bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
                <h3 className="font-bold text-gray-800 mb-4">
                  Recent Activity
                </h3>
                {isConnected ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-xs">
                          R
                        </span>
                        <div>
                          <div className="font-medium text-gray-800">
                            Rewards Claimed
                          </div>
                          <div className="text-xs text-gray-500">2 days ago</div>
                        </div>
                      </div>
                      <span className="text-green-600 font-medium">+1.25 DOT</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">
                          B
                        </span>
                        <div>
                          <div className="font-medium text-gray-800">
                            Bonded Extra
                          </div>
                          <div className="text-xs text-gray-500">5 days ago</div>
                        </div>
                      </div>
                      <span className="text-blue-600 font-medium">+50 DOT</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-xs">
                          J
                        </span>
                        <div>
                          <div className="font-medium text-gray-800">
                            Joined Pool #1
                          </div>
                          <div className="text-xs text-gray-500">2 weeks ago</div>
                        </div>
                      </div>
                      <span className="text-purple-600 font-medium">100 DOT</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    Connect your wallet to see activity
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 mt-16">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
            <div>
              <h3 className="font-bold text-gray-800 mb-3">About</h3>
              <p className="text-gray-600">
                AI-powered staking agent for Polkadot nomination pools. Built
                with Polkadot Agent Kit and LunoKit.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-800 mb-3">Features</h3>
              <ul className="text-gray-600 space-y-1">
                <li>Natural language staking</li>
                <li>Pool discovery and analysis</li>
                <li>Rewards tracking</li>
                <li>Multi-chain support</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-gray-800 mb-3">Resources</h3>
              <ul className="space-y-1">
                <li>
                  <a
                    href="https://polkadot.network/staking/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-pink-500 hover:text-pink-600"
                  >
                    Polkadot Staking
                  </a>
                </li>
                <li>
                  <a
                    href="https://wiki.polkadot.network/docs/learn-nomination-pools"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-pink-500 hover:text-pink-600"
                  >
                    Nomination Pools Wiki
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-100 mt-8 pt-6 text-center text-gray-500">
            Polkadot Codecamp Challenge 2 - Polkadot Agent Kit
          </div>
        </div>
      </footer>
    </main>
  );
}
