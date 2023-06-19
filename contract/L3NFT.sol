// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract L3SoulBoundNFT is ERC721, Ownable {

    struct NFT {
        bool soulBound;
        address owner;
        uint256 tokenId;
    }

    mapping(address => bool) public hasMinted;
    mapping(uint256 => NFT) public nfts;
    uint256 private currentTokenId;
    string private baseTokenURI;
    uint256 public mintingFee;

    constructor(string memory _baseTokenURI, uint256 _price) ERC721("L3SoulBoundNFT", "L3SBNFT") {
        baseTokenURI = _baseTokenURI;
        mintingFee = _price;
    }

    function mintNFT() payable external {
        require(!hasMinted[msg.sender], "You have already minted an NFT");
        require(msg.value >= mintingFee, "insufficient funds");

        currentTokenId++;
        _safeMint(msg.sender, currentTokenId);

        NFT memory newNFT = NFT({
            soulBound: true,
            owner: msg.sender,
            tokenId: currentTokenId
        });
        

        nfts[currentTokenId] = newNFT;


        hasMinted[msg.sender] = true;
    }

    function setMintingFee(uint256 _fee) external onlyOwner {
        mintingFee = _fee;
    }

    function isSoulBound(uint256 _tokenId) external view returns (bool) {
        require(_exists(_tokenId), "NFT does not exist");
        return nfts[_tokenId].soulBound;
    }

    function getAllMinters() external view returns (address[] memory) {
        address[] memory minters = new address[](currentTokenId);
        uint256 count = 0;
        for (uint256 i = 1; i <= currentTokenId; i++) {
            if (ownerOf(i) != address(0)) {
                minters[count] = ownerOf(i);
                count++;
            }
        }
        return minters;
    }

    function setBaseTokenURI(string memory _baseTokenURI) external onlyOwner {
        baseTokenURI = _baseTokenURI;
    }

    function tokenURI(uint256 _tokenId) public view virtual override returns (string memory) {
        require(_exists(_tokenId), "NFT does not exist");

        string memory tokenIdString = Strings.toString(_tokenId);
        string memory json = string(
            abi.encodePacked(
                '{"image": "',
                baseTokenURI,
                '", "tokenId": "', tokenIdString, 
                '",}'
            )
        );

        return json;

    }

    function burn(uint256 _tokenId) external {
        require(_exists(_tokenId), "NFT does not exist");
        require(ownerOf(_tokenId) == msg.sender, "Only the owner can burn the NFT");
        _burn(_tokenId);
        delete nfts[_tokenId];
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

    function price () view external returns (uint256) {
        return mintingFee;
    }

}
