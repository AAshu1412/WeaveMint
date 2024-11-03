// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import {ERC721WeaveVMStorage} from "./ERC721WeaveVMStorage.sol";

/// @custom:security-contact mujahidshaik2002@gmail.com
contract WeaveMint is ERC721, ERC721Pausable, Ownable, ERC721WeaveVMStorage {
    uint256 private s_tokenId;

    mapping(uint256 => string) private s_hashById;
    mapping(uint256 => bytes) private s_dataById;

    constructor() ERC721("WeaveMint", "WMT") Ownable(_msgSender()) {}

    function _baseURI() internal pure override returns (string memory) {
        return "update this ASAP";
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function safeMint(bytes memory data, address to) public {
        string memory hash = uploadToArweave(data);
        uint256 tokenId = s_tokenId;
        s_hashById[tokenId] = hash;
        s_dataById[tokenId] = data;
        s_tokenId++;
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
