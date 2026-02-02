"use client";

import React, { useState, useRef, useEffect } from "react";
import { AgentMessage } from "../types";

interface ChatInterfaceProps {
    isConnected: boolean;
    onSendMessage: (message: string) => Promise<string>;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
    isConnected,
    onSendMessage,
}) => {
    const [messages, setMessages] = useState<AgentMessage[]>([
        {
            id: "welcome",
            role: "assistant",
            content: `Welcome to the Polkadot Staking Agent! I can help you with:

- Join a staking pool - Stake your tokens in a nomination pool
- Bond extra tokens - Add more tokens to your existing stake
- Unbond tokens - Start unbonding tokens from your stake
- Withdraw unbonded - Withdraw tokens that have finished unbonding
- Claim rewards - Claim your staking rewards
- Get pool info - View details about any staking pool

Just tell me what you'd like to do!`,
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading || !isConnected) return;

        const userMessage: AgentMessage = {
            id: Date.now().toString(),
            role: "user",
            content: input.trim(),
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await onSendMessage(input.trim());

            const assistantMessage: AgentMessage = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: response,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            const errorMessage: AgentMessage = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : "Unknown error"}`,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const suggestedPrompts = [
        "Show me available staking pools",
        "Join pool #1 with 10 DOT",
        "Check my staking rewards",
        "What is the status of pool #5?",
    ];

    return (
        <div className="flex flex-col h-[600px] bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-pink-500 to-purple-500 px-6 py-4">
                <h2 className="text-white font-bold text-lg flex items-center gap-2">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold">AI</span>
                    </div>
                    Staking Agent
                </h2>
                <p className="text-pink-100 text-sm">
                    AI-powered nomination pool management
                </p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.role === "user" ? "justify-end" : "justify-start"
                            }`}
                    >
                        <div
                            className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.role === "user"
                                ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white"
                                : "bg-gray-100 text-gray-800"
                                }`}
                        >
                            <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                            <div
                                className={`text-xs mt-1 ${message.role === "user" ? "text-pink-200" : "text-gray-400"
                                    }`}
                            >
                                {message.timestamp.toLocaleTimeString()}
                            </div>
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-100 rounded-2xl px-4 py-3">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" />
                                <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce delay-100" />
                                <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce delay-200" />
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Suggested Prompts */}
            {messages.length === 1 && (
                <div className="px-4 pb-2">
                    <div className="flex flex-wrap gap-2">
                        {suggestedPrompts.map((prompt, index) => (
                            <button
                                key={index}
                                onClick={() => setInput(prompt)}
                                className="text-xs bg-pink-50 text-pink-600 px-3 py-1.5 rounded-full hover:bg-pink-100 transition"
                            >
                                {prompt}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-gray-100">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={
                            isConnected
                                ? "Ask about staking, pools, or rewards..."
                                : "Connect your wallet to chat"
                        }
                        disabled={!isConnected || isLoading}
                        className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                    />
                    <button
                        type="submit"
                        disabled={!isConnected || isLoading || !input.trim()}
                        className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Send
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChatInterface;
