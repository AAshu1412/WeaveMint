// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/// @title ERC721WeaveVMStorage - A contract to encode, decode, and upload JSON metadata for NFTs to Arweave.
/// @notice This contract provides functions to create JSON metadata for NFTs, upload it to an Arweave-compatible service, and retrieve it.
/// @custom:security-contact mujahidshaik2002@gmail.com
contract ERC721WeaveVMStorage {
    /// @notice Custom error triggered when uploading JSON to Arweave fails.
    error ERC721WeaveVMStorage__UnableToUpload();

    /// @notice Custom error triggered when retrieving metadata from Arweave fails.
    error ERC721WeaveVMStorage__UnableToViewMetadata();

    /// @notice Custom error triggered if the `traits` and `values` arrays have mismatched lengths.
    error ERC721WeaveVMStorage__ArrayLengthsNotMatched();

    /// @notice Uploads the JSON metadata to an Arweave-compatible service.
    /// @param dataInBytes Encoded bytes containing name, image, traits, and values.
    /// @return The Arweave URL of the uploaded JSON metadata.
    /// @dev Uses `staticcall` to simulate the upload action and check for errors. Uses `abi.decode` to decode `dataInBytes`.
    function uploadToArweave(
        bytes memory dataInBytes
    ) public view returns (string memory) {
        (
            string memory name,
            string memory image,
            string[] memory traits,
            string[] memory values
        ) = abi.decode(dataInBytes, (string, string, string[], string[]));

        // Revert if traits and values array lengths do not match
        if (traits.length != values.length)
            revert ERC721WeaveVMStorage__ArrayLengthsNotMatched();

        // Construct the JSON metadata string
        string memory json = string.concat(
            '{"name": "',
            name,
            '", "image": "',
            image,
            '", "attributes": ['
        );

        // Add each trait and value as a JSON attribute
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

        // Finalize the JSON structure
        json = string.concat(json, "]}");

        // Simulate a static call to upload JSON to an Arweave-compatible service
        (bool success, bytes memory result) = address(0x17).staticcall(
            abi.encodePacked(json)
        );
        if (!success) revert ERC721WeaveVMStorage__UnableToUpload();

        return abi.decode(result, (string));
    }

    /// @notice Retrieves the JSON metadata from Arweave using the transaction hash.
    /// @param trxHash The transaction hash for the metadata upload.
    /// @return The JSON metadata as a string.
    /// @dev This function uses `staticcall` to call a service that retrieves metadata based on a transaction hash.
    function viewMetadata(
        string memory trxHash
    ) public view returns (string memory) {
        // Convert the transaction hash to bytes
        bytes memory data = abi.encodePacked(trxHash);

        (bool success, bytes memory result) = address(0x18).staticcall(data);
        if (!success) revert ERC721WeaveVMStorage__UnableToViewMetadata();

        return abi.decode(result, (string));
    }

    /// @notice Generates a JSON metadata string directly from provided inputs.
    /// @param name The name of the NFT.
    /// @param image The image URL for the NFT.
    /// @param traits Array of trait names for the NFT attributes.
    /// @param values Array of values corresponding to each trait.
    /// @return json The JSON metadata string and `encodedData` as bytes.
    /// @dev The `jsonCreation` function is useful for testing metadata creation and encoding.
    function jsonCreation(
        string memory name,
        string memory image,
        string[] memory traits,
        string[] memory values
    ) public pure returns (string memory json, bytes memory encodedData) {
        // Revert if traits and values array lengths do not match
        if (traits.length != values.length)
            revert ERC721WeaveVMStorage__ArrayLengthsNotMatched();

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

    /// @notice Decodes encoded metadata back to a JSON string format.
    /// @param encodedData Encoded bytes of name, image, traits, and values.
    /// @return json The decoded JSON metadata as a string.
    /// @dev The function is similar to `uploadToArweave` but focuses solely on JSON creation.
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
            revert ERC721WeaveVMStorage__ArrayLengthsNotMatched();

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

            // Add a comma if not the last element
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
}
