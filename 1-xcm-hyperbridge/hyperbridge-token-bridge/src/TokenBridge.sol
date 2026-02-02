// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ITokenGateway, TeleportParams} from "@hyperbridge/core/apps/TokenGateway.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title TokenBridge
 * @author Polkadot Codecamp Participant
 * @notice A cross-chain token bridge using Hyperbridge SDK
 * @dev Enables ERC20 token transfers between different chains in the Polkadot ecosystem
 */
contract TokenBridge {
    using SafeERC20 for IERC20;
    
    // ============ State Variables ============
    
    /// @notice The Hyperbridge TokenGateway contract
    ITokenGateway public immutable tokenGateway;
    
    /// @notice The fee token used for paying relayer fees
    address public immutable feeToken;
    
    /// @notice Contract owner
    address public owner;
    
    /// @notice Mapping of supported tokens (symbol => address)
    mapping(string => address) public supportedTokens;
    
    /// @notice Mapping of supported tokens (symbol => assetId)
    mapping(string => bytes32) public tokenAssetIds;
    
    /// @notice Array of supported token symbols
    string[] public tokenSymbols;
    
    /// @notice Default timeout for cross-chain requests (in seconds)
    uint64 public defaultTimeout;
    
    // ============ Events ============
    
    event TokenBridgeInitiated(
        address indexed sender,
        address indexed token,
        uint256 amount,
        bytes destChain,
        address recipient
    );
    
    event TokenRegistered(
        string symbol,
        address tokenAddress,
        bytes32 assetId
    );
    
    event TokenDeregistered(string symbol);
    
    event TimeoutUpdated(uint64 oldTimeout, uint64 newTimeout);
    
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    
    // ============ Errors ============
    
    error TokenNotSupported();
    error InsufficientBalance();
    error InsufficientAllowance();
    error ZeroAmount();
    error ZeroAddress();
    error OnlyOwner();
    error TokenAlreadyRegistered();
    error InvalidTimeout();
    
    // ============ Modifiers ============
    
    modifier onlyOwner() {
        if (msg.sender != owner) revert OnlyOwner();
        _;
    }
    
    // ============ Constructor ============
    
    /**
     * @notice Initialize the TokenBridge contract
     * @param _tokenGateway Address of the Hyperbridge TokenGateway contract
     * @param _feeToken Address of the token used for paying relayer fees
     */
    constructor(address _tokenGateway, address _feeToken) {
        if (_tokenGateway == address(0)) revert ZeroAddress();
        if (_feeToken == address(0)) revert ZeroAddress();
        
        tokenGateway = ITokenGateway(_tokenGateway);
        feeToken = _feeToken;
        owner = msg.sender;
        defaultTimeout = 3600; // 1 hour default timeout
    }
    
    // ============ External Functions ============
    
    /**
     * @notice Bridge tokens to another chain
     * @param token The token address to bridge
     * @param symbol The token symbol (must be registered)
     * @param amount The amount to bridge
     * @param recipient The recipient address on the destination chain
     * @param destChain The destination chain identifier (state machine)
     */
    function bridgeTokens(
        address token,
        string calldata symbol,
        uint256 amount,
        address recipient,
        bytes calldata destChain
    ) external payable {
        // Validations
        if (amount == 0) revert ZeroAmount();
        if (recipient == address(0)) revert ZeroAddress();
        if (supportedTokens[symbol] == address(0)) revert TokenNotSupported();
        if (supportedTokens[symbol] != token) revert TokenNotSupported();
        
        bytes32 assetId = tokenAssetIds[symbol];
        
        // Check user has sufficient balance
        uint256 userBalance = IERC20(token).balanceOf(msg.sender);
        if (userBalance < amount) revert InsufficientBalance();
        
        // Check user has given sufficient allowance
        uint256 userAllowance = IERC20(token).allowance(msg.sender, address(this));
        if (userAllowance < amount) revert InsufficientAllowance();
        
        // Transfer tokens from user to this contract
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        
        // Approve the gateway to spend tokens
        IERC20(token).forceApprove(address(tokenGateway), amount);
        
        // Approve fee token for the gateway (max approval for efficiency)
        IERC20(feeToken).forceApprove(address(tokenGateway), type(uint256).max);
        
        // Prepare teleport parameters
        TeleportParams memory teleportParams = TeleportParams({
            amount: amount,
            relayerFee: 0, // Let the gateway calculate
            assetId: assetId,
            redeem: true, // Redeem ERC20 on destination
            to: bytes32(uint256(uint160(recipient))), // Convert address to bytes32
            dest: destChain,
            timeout: defaultTimeout,
            nativeCost: msg.value,
            data: "" // No additional data
        });
        
        // Initiate the cross-chain transfer via TokenGateway
        tokenGateway.teleport{value: msg.value}(teleportParams);
        
        emit TokenBridgeInitiated(msg.sender, token, amount, destChain, recipient);
    }
    
    /**
     * @notice Bridge tokens with custom timeout
     * @param token The token address to bridge
     * @param symbol The token symbol (must be registered)
     * @param amount The amount to bridge
     * @param recipient The recipient address on the destination chain
     * @param destChain The destination chain identifier
     * @param timeout Custom timeout in seconds
     */
    function bridgeTokensWithTimeout(
        address token,
        string calldata symbol,
        uint256 amount,
        address recipient,
        bytes calldata destChain,
        uint64 timeout
    ) external payable {
        // Validations
        if (amount == 0) revert ZeroAmount();
        if (recipient == address(0)) revert ZeroAddress();
        if (timeout == 0) revert InvalidTimeout();
        if (supportedTokens[symbol] == address(0)) revert TokenNotSupported();
        if (supportedTokens[symbol] != token) revert TokenNotSupported();
        
        bytes32 assetId = tokenAssetIds[symbol];
        
        // Transfer tokens from user to this contract
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        
        // Approve the gateway to spend tokens
        IERC20(token).forceApprove(address(tokenGateway), amount);
        IERC20(feeToken).forceApprove(address(tokenGateway), type(uint256).max);
        
        // Prepare teleport parameters with custom timeout
        TeleportParams memory teleportParams = TeleportParams({
            amount: amount,
            relayerFee: 0,
            assetId: assetId,
            redeem: true,
            to: bytes32(uint256(uint160(recipient))),
            dest: destChain,
            timeout: timeout,
            nativeCost: msg.value,
            data: ""
        });
        
        tokenGateway.teleport{value: msg.value}(teleportParams);
        
        emit TokenBridgeInitiated(msg.sender, token, amount, destChain, recipient);
    }
    
    // ============ Admin Functions ============
    
    /**
     * @notice Register a new token for bridging
     * @param symbol The token symbol
     * @param tokenAddress The token contract address
     * @param assetId The Hyperbridge asset ID for this token
     */
    function registerToken(
        string calldata symbol,
        address tokenAddress,
        bytes32 assetId
    ) external onlyOwner {
        if (tokenAddress == address(0)) revert ZeroAddress();
        if (supportedTokens[symbol] != address(0)) revert TokenAlreadyRegistered();
        
        supportedTokens[symbol] = tokenAddress;
        tokenAssetIds[symbol] = assetId;
        tokenSymbols.push(symbol);
        
        emit TokenRegistered(symbol, tokenAddress, assetId);
    }
    
    /**
     * @notice Remove a token from supported list
     * @param symbol The token symbol to remove
     */
    function deregisterToken(string calldata symbol) external onlyOwner {
        if (supportedTokens[symbol] == address(0)) revert TokenNotSupported();
        
        delete supportedTokens[symbol];
        delete tokenAssetIds[symbol];
        
        // Remove from array (swap and pop)
        for (uint256 i = 0; i < tokenSymbols.length; i++) {
            if (keccak256(bytes(tokenSymbols[i])) == keccak256(bytes(symbol))) {
                tokenSymbols[i] = tokenSymbols[tokenSymbols.length - 1];
                tokenSymbols.pop();
                break;
            }
        }
        
        emit TokenDeregistered(symbol);
    }
    
    /**
     * @notice Update the default timeout
     * @param newTimeout New timeout value in seconds
     */
    function setDefaultTimeout(uint64 newTimeout) external onlyOwner {
        if (newTimeout == 0) revert InvalidTimeout();
        
        uint64 oldTimeout = defaultTimeout;
        defaultTimeout = newTimeout;
        
        emit TimeoutUpdated(oldTimeout, newTimeout);
    }
    
    /**
     * @notice Transfer ownership of the contract
     * @param newOwner Address of the new owner
     */
    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert ZeroAddress();
        
        address oldOwner = owner;
        owner = newOwner;
        
        emit OwnershipTransferred(oldOwner, newOwner);
    }
    
    /**
     * @notice Recover stuck tokens (emergency function)
     * @param token Token address to recover
     * @param to Recipient address
     * @param amount Amount to recover
     */
    function recoverTokens(
        address token,
        address to,
        uint256 amount
    ) external onlyOwner {
        if (to == address(0)) revert ZeroAddress();
        IERC20(token).safeTransfer(to, amount);
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Get all supported token symbols
     * @return Array of supported token symbols
     */
    function getSupportedTokens() external view returns (string[] memory) {
        return tokenSymbols;
    }
    
    /**
     * @notice Check if a token is supported
     * @param symbol Token symbol to check
     * @return True if the token is supported
     */
    function isTokenSupported(string calldata symbol) external view returns (bool) {
        return supportedTokens[symbol] != address(0);
    }
    
    /**
     * @notice Get token info by symbol
     * @param symbol Token symbol
     * @return tokenAddress The token contract address
     * @return assetId The Hyperbridge asset ID
     */
    function getTokenInfo(string calldata symbol) 
        external 
        view 
        returns (address tokenAddress, bytes32 assetId) 
    {
        tokenAddress = supportedTokens[symbol];
        assetId = tokenAssetIds[symbol];
    }
    
    /**
     * @notice Get TokenGateway instance for a destination
     * @param destination The destination chain
     * @return The TokenGateway address on the destination
     */
    function getDestinationGateway(bytes calldata destination) 
        external 
        view 
        returns (address) 
    {
        return tokenGateway.instance(destination);
    }
}
