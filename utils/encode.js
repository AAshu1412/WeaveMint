
import { ethers } from "ethers";

// const sampleData = {
//     name: "WeaveMint Test",
//     image: "https://arweave.net/UwlQKt4Hh86pIA8g_3GX70uj6I1FOLsADNONpeH9jUk"
// };
const sampleData = {
    name: "Profile Picture",
    image: "https://arweave.net/UwlQKt4Hh86pIA8g_3GX70uj6I1FOLsADNONpeH9jUk",
    traits: ["Style", "Look"],
    values: ["Cool", "Relaxed"]
};
// const sampleData = {
//     name: "Test",
//     image: "https://test/1",
//     traits: ["trait1", "trait2"],
//     values: ["value1", "value2"]
// };

export const encodeData = async (data) => {
    const abiCoder = new ethers.AbiCoder();
    const encodedData = abiCoder.encode(
        ["string", "string", "string[]", "string[]"],
        [data.name, data.image, data.traits, data.values]
    );

    // console.log("Encoded Data:", encodedData); // Encoded data is a single hex string
    return encodedData;
};

// Function to decode the encoded data
const decodeData = (encodedData) => {
    const abiCoder = new ethers.AbiCoder();
    const decodedData = abiCoder.decode(
        ["string", "string", "string[]", "string[]"],
        encodedData
    );

    // console.log("Decoded Data:", {
    //     name: decodedData[0],
    //     image: decodedData[1],
    //     traits: decodedData[2],
    //     values: decodedData[3]
    // });
    return decodedData;
};

// export const encodeData = async (data) => {
//     try {
//         if (!data) {
//             throw new Error("Invalid input parameters");
//         }

//         // Initialize SchemaEncoder with the schema string
//         const schemaEncoder = new SchemaEncoder(
//             "string name, string image, string[] traits, string[] values"
//         );
//         const encodedData = schemaEncoder.encodeData([
//             { name: "name", value: data.name, type: "string" },
//             { name: "image", value: data.image, type: "string" },
//             { name: "traits", value: data.traits, type: "string[]" },
//             { name: "values", value: data.values, type: "string[]" },
//         ]);
//         console.log("Encoded Data:", encodedData);
//         return encodedData;
//     } catch (error) {
//         console.error("Unable to encode:", error);
//         throw error;
//     }
// };

// Async function to handle encoding and decoding
const runEncodingDecoding = async () => {
    try {
        // Await encoded data result
        const encoded = await encodeData(sampleData);
        decodeData(encoded);
    } catch (error) {
        console.error("Error in encoding/decoding:", error);
    }
};

// Run the encoding and decoding process
runEncodingDecoding();