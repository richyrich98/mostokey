// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./VideoRightsToken.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title RightsFactory
 * @dev Factory contract that deploys VideoRightsToken contracts and handles sales
 */
contract RightsFactory is ReentrancyGuard {
    struct TokenInfo {
        address tokenAddress;
        address creator;
        uint256 pricePerToken;
        uint256 totalSupply;
        uint256 soldTokens;
        string videoUrl;
        bool active;
    }
    
    mapping(address => TokenInfo) public tokens;
    mapping(address => uint256) public creatorEarnings;
    address[] public allTokens;
    
    event TokenCreated(
        address indexed tokenAddress,
        address indexed creator,
        string name,
        string symbol,
        uint256 totalSupply,
        uint256 pricePerToken,
        string videoUrl
    );
    
    event TokensPurchased(
        address indexed buyer,
        address indexed tokenAddress,
        uint256 amount,
        uint256 totalCost
    );
    
    event CreatorWithdraw(address indexed creator, uint256 amount);
    
    /**
     * @dev Creates a new video rights token
     */
    function createToken(
        string memory name,
        string memory symbol,
        uint256 totalSupply,
        uint256 pricePerToken,
        string memory videoUrl,
        string memory metadataURI
    ) external returns (address) {
        require(totalSupply > 0, "Total supply must be greater than 0");
        require(pricePerToken > 0, "Price per token must be greater than 0");
        require(bytes(videoUrl).length > 0, "Video URL cannot be empty");
        
        // Deploy new token contract
        VideoRightsToken token = new VideoRightsToken(
            name,
            symbol,
            totalSupply,
            videoUrl,
            metadataURI,
            msg.sender
        );
        
        address tokenAddress = address(token);
        
        // Store token information
        tokens[tokenAddress] = TokenInfo({
            tokenAddress: tokenAddress,
            creator: msg.sender,
            pricePerToken: pricePerToken,
            totalSupply: totalSupply,
            soldTokens: 0,
            videoUrl: videoUrl,
            active: true
        });
        
        allTokens.push(tokenAddress);
        
        emit TokenCreated(
            tokenAddress,
            msg.sender,
            name,
            symbol,
            totalSupply,
            pricePerToken,
            videoUrl
        );
        
        return tokenAddress;
    }
    
    /**
     * @dev Purchase tokens with native currency (MATIC/ETH)
     */
    function purchaseTokens(address tokenAddress, uint256 amount) 
        external 
        payable 
        nonReentrant 
    {
        TokenInfo storage tokenInfo = tokens[tokenAddress];
        require(tokenInfo.active, "Token not found or inactive");
        require(amount > 0, "Amount must be greater than 0");
        
        uint256 availableTokens = tokenInfo.totalSupply - tokenInfo.soldTokens;
        require(amount <= availableTokens, "Not enough tokens available");
        
        uint256 totalCost = amount * tokenInfo.pricePerToken;
        require(msg.value >= totalCost, "Insufficient payment");
        
        // Update sold tokens
        tokenInfo.soldTokens += amount;
        
        // Add to creator earnings
        creatorEarnings[tokenInfo.creator] += totalCost;
        
        // Transfer tokens to buyer
        VideoRightsToken token = VideoRightsToken(tokenAddress);
        require(token.transfer(msg.sender, amount), "Token transfer failed");
        
        // Refund excess payment
        if (msg.value > totalCost) {
            payable(msg.sender).transfer(msg.value - totalCost);
        }
        
        emit TokensPurchased(msg.sender, tokenAddress, amount, totalCost);
    }
    
    /**
     * @dev Allows creators to withdraw their earnings
     */
    function withdrawEarnings() external nonReentrant {
        uint256 earnings = creatorEarnings[msg.sender];
        require(earnings > 0, "No earnings to withdraw");
        
        creatorEarnings[msg.sender] = 0;
        payable(msg.sender).transfer(earnings);
        
        emit CreatorWithdraw(msg.sender, earnings);
    }
    
    /**
     * @dev Get token information
     */
    function getTokenInfo(address tokenAddress) 
        external 
        view 
        returns (TokenInfo memory) 
    {
        return tokens[tokenAddress];
    }
    
    /**
     * @dev Get all token addresses
     */
    function getAllTokens() external view returns (address[] memory) {
        return allTokens;
    }
    
    /**
     * @dev Get creator's current earnings
     */
    function getCreatorEarnings(address creator) external view returns (uint256) {
        return creatorEarnings[creator];
    }
    
    /**
     * @dev Get tokens created by a specific creator
     */
    function getTokensByCreator(address creator) 
        external 
        view 
        returns (address[] memory) 
    {
        uint256 count = 0;
        
        // First, count the tokens
        for (uint256 i = 0; i < allTokens.length; i++) {
            if (tokens[allTokens[i]].creator == creator) {
                count++;
            }
        }
        
        // Create array and populate it
        address[] memory creatorTokens = new address[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < allTokens.length; i++) {
            if (tokens[allTokens[i]].creator == creator) {
                creatorTokens[index] = allTokens[i];
                index++;
            }
        }
        
        return creatorTokens;
    }
}