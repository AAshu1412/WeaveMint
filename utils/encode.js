import {
    SchemaEncoder,
} from "@ethereum-attestation-service/eas-sdk";

export const userAttest = async (data) => {
    try {
        if (!data) {
            throw new Error("Invalid input parameters");
        }

        // Initialize SchemaEncoder with the schema string
        const schemaEncoder = new SchemaEncoder(
            "string memory name, string memory image, string[] memory traits, string[] memory values"
        );
        const encodedData = schemaEncoder.encodeData([
            { name: "name", value: data.name, type: "string" },
            { name: "image", value: data.image, type: "string" },
            { name: "traits", value: data.traits, type: "string[]" },
            { name: "values", value: data.values, type: "string[]" },
        ]);

        return encodedData;
    } catch (error) {
        console.error("Unable to run OnChain Attest: ", error);
        throw error;
    }
};