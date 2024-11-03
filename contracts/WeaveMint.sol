// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @custom:security-contact mujahidshaik2002@gmail.com
contract WeaveMint is ERC721, ERC721Pausable, Ownable {
    uint256 private _nextTokenId;

    constructor(
        address initialOwner
    ) ERC721("WeaveMint", "WMT") Ownable(initialOwner) {}

    function _baseURI() internal pure override returns (string memory) {
        return "update this ASAP";
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function safeMint(address to) public onlyOwner {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
    }

    // The following functions are overrides required by Solidity.

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721, ERC721Pausable) returns (address) {
        return super._update(to, tokenId, auth);
    }
}
