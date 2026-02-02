// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {Script, console} from "forge-std/Script.sol";
import {TokenBridge} from "../src/TokenBridge.sol";

/**
 * @title TokenBridgeScript
 * @notice Deployment script for TokenBridge contract
 * @dev Run with: forge script script/TokenBridge.s.sol:TokenBridgeScript --rpc-url <RPC_URL> --broadcast
 */
contract TokenBridgeScript is Script {
    // ============ Testnet Addresses ============
    // These addresses need to be updated based on the deployment network
    
    // Paseo Testnet TokenGateway (update with actual deployed address)
    address constant PASEO_TOKEN_GATEWAY = 0x0000000000000000000000000000000000000000;
    
    // Sepolia TokenGateway (update with actual deployed address)
    address constant SEPOLIA_TOKEN_GATEWAY = 0x0000000000000000000000000000000000000000;
    
    // Fee token addresses (typically a stablecoin or wrapped native token)
    address constant PASEO_FEE_TOKEN = 0x0000000000000000000000000000000000000000;
    address constant SEPOLIA_FEE_TOKEN = 0x0000000000000000000000000000000000000000;
    
    function setUp() public {}
    
    function run() public {
        // Get deployer private key from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);
        
        // Determine which network we're deploying to
        uint256 chainId = block.chainid;
        
        address tokenGateway;
        address feeToken;
        
        if (chainId == 420420417) {
            // Polkadot Hub TestNet / Paseo
            console.log("Deploying to Polkadot Hub TestNet...");
            tokenGateway = PASEO_TOKEN_GATEWAY;
            feeToken = PASEO_FEE_TOKEN;
        } else if (chainId == 11155111) {
            // Sepolia
            console.log("Deploying to Sepolia...");
            tokenGateway = SEPOLIA_TOKEN_GATEWAY;
            feeToken = SEPOLIA_FEE_TOKEN;
        } else {
            // Local or unknown network - use placeholder addresses
            console.log("Deploying to local/unknown network...");
            // For local testing, you can deploy mock contracts
            tokenGateway = address(0x1234567890123456789012345678901234567890);
            feeToken = address(0x0987654321098765432109876543210987654321);
        }
        
        console.log("Chain ID:", chainId);
        console.log("TokenGateway:", tokenGateway);
        console.log("FeeToken:", feeToken);
        
        // Deploy TokenBridge
        TokenBridge bridge = new TokenBridge(tokenGateway, feeToken);
        
        console.log("");
        console.log("========================================");
        console.log("TokenBridge deployed successfully!");
        console.log("Contract address:", address(bridge));
        console.log("Owner:", bridge.owner());
        console.log("Default timeout:", bridge.defaultTimeout(), "seconds");
        console.log("========================================");
        
        vm.stopBroadcast();
    }
}

/**
 * @title RegisterTokensScript
 * @notice Script to register tokens on the TokenBridge
 */
contract RegisterTokensScript is Script {
    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address bridgeAddress = vm.envAddress("TOKEN_BRIDGE_ADDRESS");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // TokenBridge bridge = TokenBridge(bridgeAddress);
        
        // Example token registration
        // Update these with actual token addresses and asset IDs
        
        // Register USDC
        // TokenBridge(bridgeAddress).registerToken(
        //     "USDC",
        //     0x..., // USDC token address
        //     bytes32(0x...) // Hyperbridge asset ID for USDC
        // );
        
        // Register DAI
        // TokenBridge(bridgeAddress).registerToken(
        //     "DAI",
        //     0x...,
        //     bytes32(0x...)
        // );
        
        console.log("Tokens registered successfully!");
        
        vm.stopBroadcast();
    }
}
