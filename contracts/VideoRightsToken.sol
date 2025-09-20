// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title VideoRightsToken
 * @dev Minimal ERC20 token representing fractional video rights
 */
contract VideoRightsToken is ERC20 {
    string public videoUrl;
    string public metadataURI;
    address public creator;
    uint256 public immutable totalSupplyFixed;
    
    event TokensCreated(address indexed creator, string videoUrl, uint256 totalSupply);
    
    constructor(
        string memory name,
        string memory symbol,
        uint256 totalSupply,
        string memory _videoUrl,
        string memory _metadataURI,
        address _creator
    ) ERC20(name, symbol) {
        videoUrl = _videoUrl;
        metadataURI = _metadataURI;
        creator = _creator;
        totalSupplyFixed = totalSupply;
        
        // Mint all tokens to the factory contract initially
        _mint(msg.sender, totalSupply);
        
        emit TokensCreated(_creator, _videoUrl, totalSupply);
    }
    
    /**
     * @dev Returns token metadata including video URL and creator signature
     */
    function getMetadata() external view returns (
        string memory _videoUrl,
        string memory _metadataURI,
        address _creator,
        uint256 _totalSupply
    ) {
        return (videoUrl, metadataURI, creator, totalSupplyFixed);
    }
}