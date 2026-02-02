/**
 * Hyperbridge Token Bridge - Frontend Application
 * Enables cross-chain token transfers via Hyperbridge SDK
 */

// Contract Configuration
const CONFIG = {
    // TokenBridge contract addresses per network
    contracts: {
        'sepolia': {
            TokenBridge: '0x0000000000000000000000000000000000000000', // Update after deployment
            TokenGateway: '0x0000000000000000000000000000000000000000'
        },
        'paseo': {
            TokenBridge: '0x0000000000000000000000000000000000000000', // Update after deployment
            TokenGateway: '0x0000000000000000000000000000000000000000'
        }
    },
    // Network configurations
    networks: {
        'sepolia': {
            chainId: 11155111,
            chainIdHex: '0xaa36a7',
            name: 'Sepolia',
            rpcUrl: 'https://sepolia.infura.io/v3/YOUR_KEY',
            explorer: 'https://sepolia.etherscan.io',
            destBytes: ethers.toUtf8Bytes('SEPOLIA')
        },
        'paseo': {
            chainId: 420420417,
            chainIdHex: '0x1910a461',
            name: 'Paseo',
            rpcUrl: 'https://testnet-paseo-rpc.polkadot.io',
            explorer: 'https://paseo.subscan.io',
            destBytes: ethers.toUtf8Bytes('PASEO')
        },
        'bsc-testnet': {
            chainId: 97,
            chainIdHex: '0x61',
            name: 'BSC Testnet',
            rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545',
            explorer: 'https://testnet.bscscan.com',
            destBytes: ethers.toUtf8Bytes('BSC_TESTNET')
        },
        'optimism-sepolia': {
            chainId: 11155420,
            chainIdHex: '0xaa37dc',
            name: 'Optimism Sepolia',
            rpcUrl: 'https://sepolia.optimism.io',
            explorer: 'https://sepolia-optimism.etherscan.io',
            destBytes: ethers.toUtf8Bytes('OP_SEPOLIA')
        }
    },
    // Sample tokens (update with real addresses)
    tokens: {
        'USDC': {
            'sepolia': '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
            'paseo': '0x0000000000000000000000000000000000000000',
            decimals: 6,
            assetId: '0x0000000000000000000000000000000000000000000000000000000000000001'
        },
        'DAI': {
            'sepolia': '0x68194a729C2450ad26072b3D33ADaCbcef39D574',
            'paseo': '0x0000000000000000000000000000000000000000',
            decimals: 18,
            assetId: '0x0000000000000000000000000000000000000000000000000000000000000002'
        },
        'WETH': {
            'sepolia': '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14',
            'paseo': '0x0000000000000000000000000000000000000000',
            decimals: 18,
            assetId: '0x0000000000000000000000000000000000000000000000000000000000000003'
        }
    }
};

// TokenBridge ABI (minimal for bridgeTokens function)
const TOKEN_BRIDGE_ABI = [
    "function bridgeTokens(address token, string calldata symbol, uint256 amount, address recipient, bytes calldata destChain) external payable",
    "function getSupportedTokens() external view returns (string[] memory)",
    "function isTokenSupported(string calldata symbol) external view returns (bool)",
    "function getTokenInfo(string calldata symbol) external view returns (address tokenAddress, bytes32 assetId)",
    "event TokenBridgeInitiated(address indexed sender, address indexed token, uint256 amount, bytes destChain, address recipient)"
];

// ERC20 ABI (minimal)
const ERC20_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)"
];

// Application State
const state = {
    provider: null,
    signer: null,
    userAddress: null,
    currentChainId: null,
    tokenBalance: null
};

// DOM Elements
const elements = {
    connectWallet: document.getElementById('connectWallet'),
    walletText: document.getElementById('walletText'),
    sourceChain: document.getElementById('sourceChain'),
    destChain: document.getElementById('destChain'),
    swapChains: document.getElementById('swapChains'),
    tokenSelect: document.getElementById('tokenSelect'),
    tokenAmount: document.getElementById('tokenAmount'),
    tokenBalance: document.getElementById('tokenBalance'),
    maxBtn: document.getElementById('maxBtn'),
    recipientAddress: document.getElementById('recipientAddress'),
    selfBtn: document.getElementById('selfBtn'),
    estimatedFee: document.getElementById('estimatedFee'),
    bridgeBtn: document.getElementById('bridgeBtn'),
    bridgeBtnText: document.getElementById('bridgeBtnText'),
    spinner: document.getElementById('spinner'),
    statusCard: document.getElementById('statusCard'),
    statusBadge: document.getElementById('statusBadge'),
    step1: document.getElementById('step1'),
    step1Desc: document.getElementById('step1Desc'),
    step2: document.getElementById('step2'),
    step2Desc: document.getElementById('step2Desc'),
    step3: document.getElementById('step3'),
    step3Desc: document.getElementById('step3Desc'),
    txLink: document.getElementById('txLink')
};

/**
 * Initialize the application
 */
async function init() {
    setupEventListeners();
    checkWalletConnection();
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    elements.connectWallet.addEventListener('click', handleConnectWallet);
    elements.swapChains.addEventListener('click', handleSwapChains);
    elements.tokenSelect.addEventListener('change', handleTokenChange);
    elements.tokenAmount.addEventListener('input', validateForm);
    elements.maxBtn.addEventListener('click', handleMaxAmount);
    elements.recipientAddress.addEventListener('input', validateForm);
    elements.selfBtn.addEventListener('click', handleSelfAddress);
    elements.bridgeBtn.addEventListener('click', handleBridge);
    elements.sourceChain.addEventListener('change', handleSourceChainChange);

    // Listen for account changes
    if (window.ethereum) {
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);
    }
}

/**
 * Check if wallet is already connected
 */
async function checkWalletConnection() {
    if (window.ethereum) {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                await connectWallet();
            }
        } catch (error) {
            console.error('Error checking wallet connection:', error);
        }
    }
}

/**
 * Connect to MetaMask wallet
 */
async function connectWallet() {
    if (!window.ethereum) {
        alert('Please install MetaMask to use this application.');
        return;
    }

    try {
        state.provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await state.provider.send('eth_requestAccounts', []);
        state.signer = await state.provider.getSigner();
        state.userAddress = accounts[0];
        
        const network = await state.provider.getNetwork();
        state.currentChainId = Number(network.chainId);

        updateWalletUI();
        validateForm();
    } catch (error) {
        console.error('Error connecting wallet:', error);
        alert('Failed to connect wallet. Please try again.');
    }
}

/**
 * Handle connect wallet button click
 */
async function handleConnectWallet() {
    if (state.userAddress) {
        // Already connected - could implement disconnect
        return;
    }
    await connectWallet();
}

/**
 * Update wallet connection UI
 */
function updateWalletUI() {
    if (state.userAddress) {
        const shortAddress = `${state.userAddress.slice(0, 6)}...${state.userAddress.slice(-4)}`;
        elements.walletText.textContent = shortAddress;
        elements.connectWallet.classList.add('connected');
        elements.bridgeBtnText.textContent = 'Bridge Tokens';
    } else {
        elements.walletText.textContent = 'Connect Wallet';
        elements.connectWallet.classList.remove('connected');
        elements.bridgeBtnText.textContent = 'Connect Wallet to Bridge';
    }
}

/**
 * Handle account changes
 */
function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        state.userAddress = null;
        state.signer = null;
    } else {
        state.userAddress = accounts[0];
    }
    updateWalletUI();
    validateForm();
}

/**
 * Handle chain changes
 */
function handleChainChanged(chainId) {
    state.currentChainId = Number(chainId);
    window.location.reload();
}

/**
 * Swap source and destination chains
 */
function handleSwapChains() {
    const source = elements.sourceChain.value;
    const dest = elements.destChain.value;
    elements.sourceChain.value = dest;
    elements.destChain.value = source;
    handleSourceChainChange();
}

/**
 * Handle source chain change
 */
async function handleSourceChainChange() {
    await handleTokenChange();
}

/**
 * Handle token selection change
 */
async function handleTokenChange() {
    const symbol = elements.tokenSelect.value;
    const sourceChain = elements.sourceChain.value;

    if (!symbol || !state.userAddress) {
        elements.tokenBalance.textContent = 'Balance: --';
        return;
    }

    try {
        const tokenConfig = CONFIG.tokens[symbol];
        if (!tokenConfig || !tokenConfig[sourceChain]) {
            elements.tokenBalance.textContent = 'Balance: N/A';
            return;
        }

        const tokenAddress = tokenConfig[sourceChain];
        const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, state.provider);
        const balance = await tokenContract.balanceOf(state.userAddress);
        const decimals = tokenConfig.decimals;
        
        state.tokenBalance = balance;
        const formattedBalance = ethers.formatUnits(balance, decimals);
        elements.tokenBalance.textContent = `Balance: ${parseFloat(formattedBalance).toFixed(4)} ${symbol}`;
    } catch (error) {
        console.error('Error fetching token balance:', error);
        elements.tokenBalance.textContent = 'Balance: Error';
    }

    validateForm();
}

/**
 * Set max amount
 */
function handleMaxAmount() {
    if (!state.tokenBalance) return;
    
    const symbol = elements.tokenSelect.value;
    const tokenConfig = CONFIG.tokens[symbol];
    if (!tokenConfig) return;

    const formattedBalance = ethers.formatUnits(state.tokenBalance, tokenConfig.decimals);
    elements.tokenAmount.value = formattedBalance;
    validateForm();
}

/**
 * Set recipient to user's own address
 */
function handleSelfAddress() {
    if (state.userAddress) {
        elements.recipientAddress.value = state.userAddress;
        validateForm();
    }
}

/**
 * Validate form and update bridge button state
 */
function validateForm() {
    const symbol = elements.tokenSelect.value;
    const amount = elements.tokenAmount.value;
    const recipient = elements.recipientAddress.value;
    
    let isValid = true;
    let buttonText = 'Bridge Tokens';

    if (!state.userAddress) {
        isValid = false;
        buttonText = 'Connect Wallet to Bridge';
    } else if (!symbol) {
        isValid = false;
        buttonText = 'Select a Token';
    } else if (!amount || parseFloat(amount) <= 0) {
        isValid = false;
        buttonText = 'Enter an Amount';
    } else if (!recipient || !ethers.isAddress(recipient)) {
        isValid = false;
        buttonText = 'Enter Valid Recipient';
    } else if (elements.sourceChain.value === elements.destChain.value) {
        isValid = false;
        buttonText = 'Select Different Chains';
    }

    elements.bridgeBtn.disabled = !isValid;
    elements.bridgeBtnText.textContent = buttonText;

    // Update fee estimate
    if (isValid) {
        elements.estimatedFee.textContent = '~0.001 ETH';
    } else {
        elements.estimatedFee.textContent = '--';
    }
}

/**
 * Handle bridge transaction
 */
async function handleBridge() {
    if (!state.userAddress || !state.signer) {
        alert('Please connect your wallet first.');
        return;
    }

    const symbol = elements.tokenSelect.value;
    const amount = elements.tokenAmount.value;
    const recipient = elements.recipientAddress.value;
    const sourceChain = elements.sourceChain.value;
    const destChain = elements.destChain.value;

    const tokenConfig = CONFIG.tokens[symbol];
    const networkConfig = CONFIG.networks[destChain];
    const contractConfig = CONFIG.contracts[sourceChain];

    if (!tokenConfig || !networkConfig || !contractConfig) {
        alert('Invalid configuration. Please check network and token settings.');
        return;
    }

    const tokenAddress = tokenConfig[sourceChain];
    const bridgeAddress = contractConfig.TokenBridge;
    const amountWei = ethers.parseUnits(amount, tokenConfig.decimals);

    // Show status card
    elements.statusCard.style.display = 'block';
    elements.bridgeBtn.disabled = true;
    elements.spinner.style.display = 'block';
    elements.bridgeBtnText.textContent = 'Processing...';

    try {
        // Step 1: Approve tokens
        updateStatus(1, 'pending', 'Approving tokens...');

        const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, state.signer);
        const currentAllowance = await tokenContract.allowance(state.userAddress, bridgeAddress);

        if (currentAllowance < amountWei) {
            const approveTx = await tokenContract.approve(bridgeAddress, amountWei);
            updateStatus(1, 'pending', 'Waiting for approval confirmation...');
            await approveTx.wait();
        }

        updateStatus(1, 'success', 'Tokens approved');

        // Step 2: Bridge tokens
        updateStatus(2, 'pending', 'Initiating bridge transaction...');

        const bridgeContract = new ethers.Contract(bridgeAddress, TOKEN_BRIDGE_ABI, state.signer);
        
        const bridgeTx = await bridgeContract.bridgeTokens(
            tokenAddress,
            symbol,
            amountWei,
            recipient,
            networkConfig.destBytes,
            { value: ethers.parseEther('0.001') } // Fee estimate
        );

        updateStatus(2, 'pending', 'Waiting for confirmation...');
        const receipt = await bridgeTx.wait();

        updateStatus(2, 'success', `Tx: ${receipt.hash.slice(0, 10)}...`);

        // Step 3: Complete
        updateStatus(3, 'success', 'Bridge initiated successfully!');
        elements.statusBadge.textContent = 'Success';
        elements.statusBadge.classList.add('success');

        // Show explorer link
        const explorerUrl = `${CONFIG.networks[sourceChain].explorer}/tx/${receipt.hash}`;
        elements.txLink.href = explorerUrl;
        elements.txLink.style.display = 'block';

    } catch (error) {
        console.error('Bridge error:', error);
        
        let errorMessage = 'Transaction failed';
        if (error.code === 'ACTION_REJECTED') {
            errorMessage = 'Transaction rejected by user';
        } else if (error.message) {
            errorMessage = error.message.slice(0, 50) + '...';
        }

        elements.statusBadge.textContent = 'Failed';
        elements.statusBadge.classList.add('error');
        updateStatus(1, 'error', errorMessage);

    } finally {
        elements.spinner.style.display = 'none';
        elements.bridgeBtnText.textContent = 'Bridge Tokens';
        elements.bridgeBtn.disabled = false;
    }
}

/**
 * Update status step UI
 */
function updateStatus(step, status, description) {
    const stepElement = document.getElementById(`step${step}`);
    const descElement = document.getElementById(`step${step}Desc`);
    const iconElement = stepElement.querySelector('.step-icon');

    // Remove all status classes
    iconElement.classList.remove('pending', 'success', 'error');
    
    // Add new status class
    iconElement.classList.add(status);
    
    // Update description
    descElement.textContent = description;
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', init);
