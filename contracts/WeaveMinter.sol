// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721Pausable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title WeaveMinter - An ERC721 NFT contract with Pausable, Ownable, and custom storage for metadata on Arweave.
/// @notice This contract extends OpenZeppelin's ERC721 with custom metadata storage on Arweave, along with pause functionality.
/// @custom:security-contact mujahidshaik2002@gmail.com
contract WeaveMinter is ERC721, ERC721Pausable, Ownable {
    // ----------- Custom Errors -----------
    error WeaveMinter__ZeroAddress();
    error WeaveMinter__ZeroBytesData();
    error WeaveMinter__UnableToUpload();
    error WeaveMinter__UnableToViewMetadata();
    error WeaveMinter__ArrayLengthsNotMatched();

    // ----------- State Variables -----------
    /// @notice Tracks the current token ID for minting new tokens.
    uint256 private s_tokenId;

    /// @notice Maps each token ID to its corresponding Arweave hash.
    mapping(uint256 => string) private s_hashById;

    // ----------- Constructor -----------

    /// @dev Initializes the contract with an initial mint for the owner.
    constructor() ERC721("WeaveMinter", "WMT") Ownable(msg.sender) {}

    // --------------- STATE UPDATE FUNCTIONS ---------------

    /// @notice Mints a new NFT to the specified address and uploads metadata to Arweave.
    /// @param to The address that will receive the minted NFT.
    /// @param dataInBytes The metadata bytes to be uploaded to Arweave.
    /// @dev Calls `uploadToArweave` to store metadata and then mints the token.
    function mintNft(address to, bytes memory dataInBytes) public {
        if (to == address(0)) revert WeaveMinter__ZeroAddress();
        if (dataInBytes.length == 0) revert WeaveMinter__ZeroBytesData();

        string memory json = decodeDataToJson(dataInBytes);

        // Simulate a static call to upload JSON to an Arweave-compatible service
        (bool success, bytes memory result) = address(0x17).staticcall(
            abi.encodePacked(json)
        );
        if (!success) revert WeaveMinter__UnableToUpload();

        uint256 tokenId = s_tokenId;
        string memory hash = string(result);

        // Map token ID to its metadata hash
        s_hashById[tokenId] = hash;

        // Mint the NFT safely to the specified address
        _safeMint(to, tokenId);

        // Increment token ID for the next mint
        unchecked {
            s_tokenId++;
        }
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

    // --------------- VIEW FUNCTIONS ---------------

    /// @notice Retrieves the metadata JSON for a given token ID.
    /// @param tokenId The ID of the token whose metadata is being requested.
    /// @return The metadata JSON as a string.
    /// @dev Uses `_requireOwned` to check ownership before calling `viewMetadata` on stored hash.
    function getTokenData(uint256 tokenId) public view returns (string memory) {
        _requireOwned(tokenId);
        string memory hash = s_hashById[tokenId];
        return viewMetadata(hash);
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

    /// @notice Retrieves the JSON metadata from Arweave using the transaction hash.
    /// @param trxHash The transaction hash for the metadata upload.
    /// @return The JSON metadata as a string.
    /// @dev This function uses `staticcall` to call a service that retrieves metadata based on a transaction hash.
    function viewMetadata(
        string memory trxHash
    ) public view returns (string memory) {
        bytes memory data = abi.encodePacked(trxHash);
        (bool success, bytes memory result) = address(0x18).staticcall(data);
        if (!success) revert WeaveMinter__UnableToViewMetadata();
        return abi.decode(result, (string));
    }

    // --------------- HELPER FUNCTIONS ---------------

    /// @notice Generates a JSON metadata string directly from provided inputs.
    /// @param name The name of the NFT.
    /// @param image The image URL for the NFT.
    /// @param traits Array of trait names for the NFT attributes.
    /// @param values Array of values corresponding to each trait.
    /// @return json The JSON metadata string and encodedData as bytes.
    /// @dev The jsonCreation function is useful for testing metadata creation and encoding.
    function jsonCreation(
        string memory name,
        string memory image,
        string[] memory traits,
        string[] memory values
    ) public pure returns (string memory json, bytes memory encodedData) {
        // Revert if traits and values array lengths do not match
        if (traits.length != values.length)
            revert WeaveMinter__ArrayLengthsNotMatched();

        // Start JSON string with the name and image fields
        json = string.concat(
            '{"name": "',
            name,
            '", "image": "',
            image,
            '", "attributes": ['
        );

        // Add each trait and value as JSON attributes
        for (uint256 i = 0; i < traits.length; ) {
            json = string.concat(
                json,
                '{"trait_type": "',
                traits[i],
                '", "value": "',
                values[i],
                '"}'
            );

            // Add a comma if not the last element
            if (i < traits.length - 1) {
                json = string.concat(json, ",");
            }
            unchecked {
                ++i;
            }
        }

        // Close the JSON structure
        json = string.concat(json, "]}");

        // Encode the inputs into bytes for external use or verification
        encodedData = abi.encode(name, image, traits, values);
    }

    /// @notice Decodes encoded metadata bytes back to a JSON string format.
    /// @param encodedData Encoded bytes of name, image, traits, and values.
    /// @return json The decoded JSON metadata as a string.
    function decodeDataToJson(
        bytes memory encodedData
    ) public pure returns (string memory json) {
        (
            string memory name,
            string memory image,
            string[] memory traits,
            string[] memory values
        ) = abi.decode(encodedData, (string, string, string[], string[]));

        // Revert if traits and values array lengths do not match
        if (traits.length != values.length)
            revert WeaveMinter__ArrayLengthsNotMatched();

        // Start building JSON metadata
        json = string.concat(
            '{"name": "',
            name,
            '", "image": "',
            image,
            '", "attributes": ['
        );

        // Add each trait and value as attributes
        for (uint256 i = 0; i < traits.length; ) {
            json = string.concat(
                json,
                '{"trait_type": "',
                traits[i],
                '", "value": "',
                values[i],
                '"}'
            );

            if (i < traits.length - 1) {
                json = string.concat(json, ",");
            }

            unchecked {
                ++i;
            }
        }

        // Close JSON string
        json = string.concat(json, "]}");
    }

    function getHashForTokenId(
        uint256 tokenId
    ) public view returns (string memory) {
        return s_hashById[tokenId];
    }

    function currentTokenId() public view returns (uint256) {
        return s_tokenId;
    }

    // --------------- INTERNAL FUNCTIONS ---------------

    /// @notice Provides the base URI for constructing metadata URLs.
    /// @return The base URI as a string.
    /// @dev Overridden from ERC721, typically used for constructing token URIs.
    function _baseURI() internal pure override returns (string memory) {
        return "https://arweave.net/";
    }

    /// @notice Internal function that overrides `_update` from ERC721 and ERC721Pausable to manage ownership.
    /// @param to The new owner address for the token.
    /// @param tokenId The ID of the token to be transferred.
    /// @param auth The address with authorization for the update.
    /// @return The updated address after the transfer.
    /// @dev Overrides `_update` to handle conflicts between ERC721 and ERC721Pausable.
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721, ERC721Pausable) returns (address) {
        return super._update(to, tokenId, auth);
    }
}
