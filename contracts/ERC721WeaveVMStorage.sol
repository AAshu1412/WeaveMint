// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/// @custom:security-contact mujahidshaik2002@gmail.com
contract ERC721WeaveVMStorage {
    function uploadToArweave(
        bytes memory dataInBytes
    ) public view returns (string memory) {
        (
            string memory name,
            string memory image,
            string[] memory traits,
            string[] memory values
        ) = abi.decode(dataInBytes, (string, string, string[], string[]));

        require(
            traits.length == values.length,
            "Traits and values length mismatch"
        );

        // Start JSON string with the name and image
        string memory json = string.concat(
            '{"name": "',
            name,
            '", "image": "',
            image,
            '", "attributes": ['
        );

        // Add each trait and value as JSON attributes
        for (uint256 i = 0; i < traits.length; i++) {
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
        }

        // Close the JSON structure
        json = string.concat(json, "]}");

        // Placeholder call Upload JSON to Arweave
        (bool success, bytes memory result) = address(0x17).staticcall(
            abi.encodePacked(json)
        );
        if (!success) revert();

        return abi.decode(result, (string));

        // For testing purposes, return JSON directly
        // return json;
    }

    // Test function to create JSON with direct inputs
    function testJsonCreation(
        string memory name,
        string memory image,
        string[] memory traits,
        string[] memory values
    ) public pure returns (string memory, bytes memory) {
        require(
            traits.length == values.length,
            "Traits and values length mismatch"
        );

        // Start JSON string with the name and image
        string memory json = string.concat(
            '{"name": "',
            name,
            '", "image": "',
            image,
            '", "attributes": ['
        );

        // Add each trait and value as JSON attributes
        for (uint256 i = 0; i < traits.length; i++) {
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
        }

        // Close the JSON structure
        json = string.concat(json, "]}");

        return (json, abi.encode(name, image, traits, values));
    }
}
