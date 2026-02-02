// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {TokenBridge} from "../src/TokenBridge.sol";
import {ITokenGateway, TeleportParams, TokenGatewayParams} from "@hyperbridge/core/apps/TokenGateway.sol";


/**
 * @title MockERC20
 * @notice Simple ERC20 mock for testing
 */
contract MockERC20 {
    string public name;
    string public symbol;
    uint8 public decimals = 18;
    uint256 public totalSupply;
    
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    
    constructor(string memory _name, string memory _symbol) {
        name = _name;
        symbol = _symbol;
    }
    
    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
        totalSupply += amount;
    }
    
    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        return true;
    }
    
    function transfer(address to, uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        return true;
    }
    
    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(balanceOf[from] >= amount, "Insufficient balance");
        require(allowance[from][msg.sender] >= amount, "Insufficient allowance");
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        allowance[from][msg.sender] -= amount;
        return true;
    }
}

/**
 * @title MockTokenGateway
 * @notice Mock TokenGateway for testing
 */
contract MockTokenGateway is ITokenGateway {
    TeleportParams internal _lastTeleportParams;
    uint256 public teleportCallCount;
    
    function params() external pure returns (TokenGatewayParams memory) {
        return TokenGatewayParams({
            host: address(0),
            dispatcher: address(0)
        });
    }
    
    function erc20(bytes32) external pure returns (address) {
        return address(0);
    }
    
    function erc6160(bytes32) external pure returns (address) {
        return address(0);
    }
    
    function instance(bytes calldata) external pure returns (address) {
        return address(0x1234);
    }
    
    function teleport(TeleportParams calldata teleportParams) external payable {
        _lastTeleportParams = teleportParams;
        teleportCallCount++;
    }
    
    function getLastAmount() external view returns (uint256) {
        return _lastTeleportParams.amount;
    }
    
    function getLastNativeCost() external view returns (uint256) {
        return _lastTeleportParams.nativeCost;
    }
}

/**
 * @title TokenBridgeTest
 * @notice Unit tests for the TokenBridge contract
 */
contract TokenBridgeTest is Test {
    TokenBridge public bridge;
    MockTokenGateway public mockGateway;
    MockERC20 public testToken;
    MockERC20 public feeToken;
    
    address public owner;
    address public user1;
    address public user2;
    
    bytes32 public constant TEST_ASSET_ID = bytes32(uint256(1));
    bytes public constant DEST_CHAIN = "SEPOLIA";
    
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
    
    function setUp() public {
        owner = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        
        // Deploy mocks
        mockGateway = new MockTokenGateway();
        testToken = new MockERC20("Test Token", "TEST");
        feeToken = new MockERC20("Fee Token", "FEE");
        
        // Deploy TokenBridge
        bridge = new TokenBridge(address(mockGateway), address(feeToken));
        
        // Mint tokens to users
        testToken.mint(user1, 1000 ether);
        testToken.mint(user2, 1000 ether);
        feeToken.mint(address(bridge), 1000 ether);
    }
    
    // ============ Constructor Tests ============
    
    function test_Constructor_SetsCorrectValues() public view {
        assertEq(address(bridge.tokenGateway()), address(mockGateway));
        assertEq(bridge.feeToken(), address(feeToken));
        assertEq(bridge.owner(), owner);
        assertEq(bridge.defaultTimeout(), 3600);
    }
    
    function test_Constructor_RevertsOnZeroGateway() public {
        vm.expectRevert(TokenBridge.ZeroAddress.selector);
        new TokenBridge(address(0), address(feeToken));
    }
    
    function test_Constructor_RevertsOnZeroFeeToken() public {
        vm.expectRevert(TokenBridge.ZeroAddress.selector);
        new TokenBridge(address(mockGateway), address(0));
    }
    
    // ============ Token Registration Tests ============
    
    function test_RegisterToken_Success() public {
        bridge.registerToken("TEST", address(testToken), TEST_ASSET_ID);
        
        assertEq(bridge.supportedTokens("TEST"), address(testToken));
        assertEq(bridge.tokenAssetIds("TEST"), TEST_ASSET_ID);
        assertTrue(bridge.isTokenSupported("TEST"));
    }
    
    function test_RegisterToken_EmitsEvent() public {
        vm.expectEmit(true, true, true, true);
        emit TokenRegistered("TEST", address(testToken), TEST_ASSET_ID);
        
        bridge.registerToken("TEST", address(testToken), TEST_ASSET_ID);
    }
    
    function test_RegisterToken_RevertsOnNonOwner() public {
        vm.prank(user1);
        vm.expectRevert(TokenBridge.OnlyOwner.selector);
        bridge.registerToken("TEST", address(testToken), TEST_ASSET_ID);
    }
    
    function test_RegisterToken_RevertsOnZeroAddress() public {
        vm.expectRevert(TokenBridge.ZeroAddress.selector);
        bridge.registerToken("TEST", address(0), TEST_ASSET_ID);
    }
    
    function test_RegisterToken_RevertsOnDuplicate() public {
        bridge.registerToken("TEST", address(testToken), TEST_ASSET_ID);
        
        vm.expectRevert(TokenBridge.TokenAlreadyRegistered.selector);
        bridge.registerToken("TEST", address(testToken), TEST_ASSET_ID);
    }
    
    // ============ Deregister Token Tests ============
    
    function test_DeregisterToken_Success() public {
        bridge.registerToken("TEST", address(testToken), TEST_ASSET_ID);
        bridge.deregisterToken("TEST");
        
        assertEq(bridge.supportedTokens("TEST"), address(0));
        assertFalse(bridge.isTokenSupported("TEST"));
    }
    
    function test_DeregisterToken_RevertsOnNonOwner() public {
        bridge.registerToken("TEST", address(testToken), TEST_ASSET_ID);
        
        vm.prank(user1);
        vm.expectRevert(TokenBridge.OnlyOwner.selector);
        bridge.deregisterToken("TEST");
    }
    
    function test_DeregisterToken_RevertsOnUnknownToken() public {
        vm.expectRevert(TokenBridge.TokenNotSupported.selector);
        bridge.deregisterToken("UNKNOWN");
    }
    
    // ============ Bridge Tokens Tests ============
    
    function test_BridgeTokens_Success() public {
        // Register token
        bridge.registerToken("TEST", address(testToken), TEST_ASSET_ID);
        
        // Approve tokens
        vm.startPrank(user1);
        testToken.approve(address(bridge), 100 ether);
        
        // Bridge tokens
        bridge.bridgeTokens(
            address(testToken),
            "TEST",
            100 ether,
            user2,
            DEST_CHAIN
        );
        vm.stopPrank();
        
        // Verify teleport was called
        assertEq(mockGateway.teleportCallCount(), 1);
        assertEq(mockGateway.getLastAmount(), 100 ether);
    }
    
    function test_BridgeTokens_EmitsEvent() public {
        bridge.registerToken("TEST", address(testToken), TEST_ASSET_ID);
        
        vm.startPrank(user1);
        testToken.approve(address(bridge), 100 ether);
        
        vm.expectEmit(true, true, true, true);
        emit TokenBridgeInitiated(user1, address(testToken), 100 ether, DEST_CHAIN, user2);
        
        bridge.bridgeTokens(
            address(testToken),
            "TEST",
            100 ether,
            user2,
            DEST_CHAIN
        );
        vm.stopPrank();
    }
    
    function test_BridgeTokens_WithNativeValue() public {
        bridge.registerToken("TEST", address(testToken), TEST_ASSET_ID);
        
        vm.deal(user1, 1 ether);
        
        vm.startPrank(user1);
        testToken.approve(address(bridge), 100 ether);
        
        bridge.bridgeTokens{value: 0.1 ether}(
            address(testToken),
            "TEST",
            100 ether,
            user2,
            DEST_CHAIN
        );
        vm.stopPrank();
        
        assertEq(mockGateway.getLastNativeCost(), 0.1 ether);
    }
    
    function test_BridgeTokens_RevertsOnZeroAmount() public {
        bridge.registerToken("TEST", address(testToken), TEST_ASSET_ID);
        
        vm.prank(user1);
        vm.expectRevert(TokenBridge.ZeroAmount.selector);
        bridge.bridgeTokens(
            address(testToken),
            "TEST",
            0,
            user2,
            DEST_CHAIN
        );
    }
    
    function test_BridgeTokens_RevertsOnZeroRecipient() public {
        bridge.registerToken("TEST", address(testToken), TEST_ASSET_ID);
        
        vm.prank(user1);
        vm.expectRevert(TokenBridge.ZeroAddress.selector);
        bridge.bridgeTokens(
            address(testToken),
            "TEST",
            100 ether,
            address(0),
            DEST_CHAIN
        );
    }
    
    function test_BridgeTokens_RevertsOnUnsupportedToken() public {
        vm.prank(user1);
        vm.expectRevert(TokenBridge.TokenNotSupported.selector);
        bridge.bridgeTokens(
            address(testToken),
            "UNKNOWN",
            100 ether,
            user2,
            DEST_CHAIN
        );
    }
    
    function test_BridgeTokens_RevertsOnInsufficientBalance() public {
        bridge.registerToken("TEST", address(testToken), TEST_ASSET_ID);
        
        address poorUser = makeAddr("poorUser");
        
        vm.startPrank(poorUser);
        testToken.approve(address(bridge), 100 ether);
        
        vm.expectRevert(TokenBridge.InsufficientBalance.selector);
        bridge.bridgeTokens(
            address(testToken),
            "TEST",
            100 ether,
            user2,
            DEST_CHAIN
        );
        vm.stopPrank();
    }
    
    function test_BridgeTokens_RevertsOnInsufficientAllowance() public {
        bridge.registerToken("TEST", address(testToken), TEST_ASSET_ID);
        
        vm.prank(user1);
        vm.expectRevert(TokenBridge.InsufficientAllowance.selector);
        bridge.bridgeTokens(
            address(testToken),
            "TEST",
            100 ether,
            user2,
            DEST_CHAIN
        );
    }
    
    // ============ Admin Functions Tests ============
    
    function test_SetDefaultTimeout_Success() public {
        bridge.setDefaultTimeout(7200);
        assertEq(bridge.defaultTimeout(), 7200);
    }
    
    function test_SetDefaultTimeout_RevertsOnZero() public {
        vm.expectRevert(TokenBridge.InvalidTimeout.selector);
        bridge.setDefaultTimeout(0);
    }
    
    function test_TransferOwnership_Success() public {
        bridge.transferOwnership(user1);
        assertEq(bridge.owner(), user1);
    }
    
    function test_TransferOwnership_RevertsOnZeroAddress() public {
        vm.expectRevert(TokenBridge.ZeroAddress.selector);
        bridge.transferOwnership(address(0));
    }
    
    // ============ View Functions Tests ============
    
    function test_GetSupportedTokens() public {
        bridge.registerToken("TEST1", address(testToken), TEST_ASSET_ID);
        bridge.registerToken("TEST2", address(feeToken), bytes32(uint256(2)));
        
        string[] memory tokens = bridge.getSupportedTokens();
        assertEq(tokens.length, 2);
    }
    
    function test_GetTokenInfo() public {
        bridge.registerToken("TEST", address(testToken), TEST_ASSET_ID);
        
        (address tokenAddress, bytes32 assetId) = bridge.getTokenInfo("TEST");
        assertEq(tokenAddress, address(testToken));
        assertEq(assetId, TEST_ASSET_ID);
    }
    
    function test_GetDestinationGateway() public view {
        address gateway = bridge.getDestinationGateway(DEST_CHAIN);
        assertEq(gateway, address(0x1234));
    }
}
