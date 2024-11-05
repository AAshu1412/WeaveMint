// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721Pausable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ERC721WeaveVMStorage} from "./ERC721WeaveVMStorage.sol";

/// @title WeaveMint - An ERC721 NFT contract with Pausable, Ownable, and custom storage for metadata on Arweave.
/// @notice This contract extends OpenZeppelin's ERC721, adds metadata storage using Arweave, and includes pause functionality.
/// @custom:security-contact mujahidshaik2002@gmail.com
contract WeaveMint is ERC721, ERC721Pausable, Ownable, ERC721WeaveVMStorage {
    /// @notice Tracks the current token ID for minting new tokens.
    uint256 private s_tokenId;

    /// @notice Maps each token ID to its corresponding Arweave hash.
    mapping(uint256 => string) private s_hashById;

    /// @notice Custom error thrown when a zero address is provided.
    error WeaveMint__ZeroAddress();

    /// @notice Custom error thrown when provided zero data bytes.
    error WeaveMint__ZeroBytesData();

    /// @dev Constructor initializes the contract.
    constructor() ERC721("WeaveMint", "WMT") Ownable(msg.sender) {}

    /// @notice Mints a new NFT to the specified address and uploads metadata to Arweave.
    /// @param to The address that will receive the minted NFT.
    /// @param data The metadata bytes to be uploaded to Arweave.
    /// @dev Calls `uploadToArweave` to store metadata and then mints the token.
    function mintNft(address to, bytes memory data) public {
        if (to == address(0)) revert WeaveMint__ZeroAddress();
        if (data.length == 0) revert WeaveMint__ZeroBytesData();

        // Upload metadata to Arweave and store the hash
        string memory hash = uploadToArweave(data);
        uint256 tokenId = s_tokenId;

        // Map token ID to its metadata hash
        s_hashById[tokenId] = hash;

        // Increment token ID for the next mint
        unchecked {
            s_tokenId++;
        }

        // Mint the NFT safely to the specified address
        _safeMint(to, tokenId);
    }

    /// @notice Burns multiple tokens by their IDs, only callable by the contract owner.
    /// @param tokenIds An array of token IDs to burn.
    /// @dev Uses `onlyOwner` modifier to restrict access and removes stored metadata on burn.
    function burnByOwner(uint256[] memory tokenIds) public onlyOwner {
        for (uint256 i = 0; i < tokenIds.length; ) {
            _requireOwned(tokenIds[i]); // Ensure the token is owned by the caller
            _burn(tokenIds[i]); // Burn the token
            delete s_hashById[tokenIds[i]]; // Remove metadata

            unchecked {
                ++i;
            }
        }
    }

    /// @notice Pauses all token transfers.
    /// @dev Only callable by the contract owner.
    function pause() public onlyOwner {
        _pause();
    }

    /// @notice Unpauses all token transfers.
    /// @dev Only callable by the contract owner.
    function unpause() public onlyOwner {
        _unpause();
    }

    /// @notice Provides the base URI for constructing metadata URLs.
    /// @return The base URI as a string.
    /// @dev Overridden from ERC721, typically used for constructing token URIs.
    function _baseURI() internal pure override returns (string memory) {
        return "https://arweave.net/";
    }

    /// @notice Retrieves the metadata JSON for a given token ID.
    /// @param tokenId The ID of the token whose metadata is being requested.
    /// @return The metadata JSON as a string.
    /// @dev Uses `_requireOwned` to check ownership before calling `viewMetadata` on stored hash.
    function getTokenData(uint256 tokenId) public view returns (string memory) {
        _requireOwned(tokenId);
        string memory hash = s_hashById[tokenId];
        string memory data = viewMetadata(hash);
        return data;
    }

    /// @notice Returns the URI for a token’s metadata based on its ID.
    /// @param tokenId The ID of the token.
    /// @return The URI string pointing to the metadata location on Arweave.
    /// @dev Constructs the token URI by concatenating base URI and the Arweave hash.
    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        _requireOwned(tokenId); // Ensure the token is owned by the caller
        string memory hash = s_hashById[tokenId];
        return string.concat(_baseURI(), hash); // Construct full URI
    }

    /// @notice Internal function that overrides the `_update` function from ERC721 and ERC721Pausable.
    /// @param to The new owner address for the token.
    /// @param tokenId The ID of the token to be transferred.
    /// @param auth The address with authorization for the update.
    /// @return The updated address after the transfer.
    /// @dev Overrides the `_update` function to handle conflicts between ERC721 and ERC721Pausable.
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721, ERC721Pausable) returns (address) {
        return super._update(to, tokenId, auth);
    }
}
