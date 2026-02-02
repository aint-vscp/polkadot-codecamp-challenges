"use client";

import React from "react";
import { ConnectButton } from "@luno-kit/ui";

/**
 * WalletConnect component using LunoKit's built-in ConnectButton
 * This integrates with the Polkadot/Substrate wallet ecosystem
 */
const WalletConnect: React.FC = () => {
    return <ConnectButton />;
};

export default WalletConnect;
