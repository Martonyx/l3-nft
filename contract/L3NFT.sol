// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract L3TicketNFT is ERC721, Ownable {
    using Strings for uint256;

    struct NFT {
        bool soulBound;
        address owner;
    }

    mapping(uint256 => NFT) private nfts;
    mapping(address => uint256) private ticketCounts;
    mapping(address => bool) private minters;
    address[] private mintersArray;

    uint256 private currentTokenId;
    string private baseTokenURI;
    uint256 private mintingFee;

    event NFTMinted(address indexed owner, uint256 indexed tokenId);
    event NFTBurned(address indexed owner, uint256 indexed tokenId);

    constructor(string memory _baseTokenURI, uint256 _price) ERC721("L3TicketNFT", "L3TNFT") {
        baseTokenURI = _baseTokenURI;
        mintingFee = _price;
    }

    function mintNFT(uint256 _ticketCount) payable external {
        require(_ticketCount > 0, "No tickets purchased");

        uint256 totalPrice = mintingFee * _ticketCount;
        require(msg.value >= totalPrice, "Insufficient funds");

        currentTokenId++;

        for (uint256 i = 0; i < _ticketCount; i++) {
            _safeMint(msg.sender, currentTokenId + i);

            NFT memory newNFT = NFT({
                soulBound: true,
                owner: msg.sender
            });

            nfts[currentTokenId + i] = newNFT;
            ticketCounts[msg.sender]++;
        }

        emit NFTMinted(msg.sender, currentTokenId);
        currentTokenId += _ticketCount;

        if (!minters[msg.sender]) {
            minters[msg.sender] = true;
            mintersArray.push(msg.sender);
        }
    }

    function getTicketCount(address _user) external view returns (uint256) {
        return ticketCounts[_user];
    }

    function setMintingFee(uint256 _fee) external onlyOwner {
        mintingFee = _fee;
    }

    function isSoulBound(uint256 _tokenId) external view returns (bool) {
        return _exists(_tokenId) && nfts[_tokenId].soulBound;
    }

    function setBaseTokenURI(string memory _baseTokenURI) external onlyOwner {
        baseTokenURI = _baseTokenURI;
    }

    function tokenURI(uint256 _tokenId) public view virtual override returns (string memory) {
        require(_exists(_tokenId), "NFT does not exist");

        return baseTokenURI;
    }

    function burn(uint256 _tokenId) external {
        require(_exists(_tokenId), "NFT does not exist");
        require(ownerOf(_tokenId) == msg.sender, "Only the owner can burn the NFT");
        _burn(_tokenId);
        delete nfts[_tokenId];

        emit NFTBurned(msg.sender, _tokenId);
    }

    function transferFrom(
        address _from,
        address _to,
        uint256 _tokenId
    ) public virtual override {
        require(nfts[_tokenId].soulBound == false, "NFT is soul-bound and cannot be transferred");
        super.transferFrom(_from, _to, _tokenId);
    }

    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "Contract has no balance");
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    function getPrice() external view returns (uint256) {
        return mintingFee;
    }

    function getMinters() external view returns (address[] memory) {
        return mintersArray;
    }

    function getMostRecentNFTTokenId(address _user) external view returns (uint256) {
        uint256 userTicketCount = ticketCounts[_user];
        require(userTicketCount > 0, "User has no NFTs");

        for (uint256 i = currentTokenId; i > 0; i--) {
            if (nfts[i].owner == _user) {
                return i;
            }
        }

        revert("No recent NFT found for the user");
    }
}
