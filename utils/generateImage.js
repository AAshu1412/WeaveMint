const { LivepeerCore } = require("@livepeer/ai/core");
const { generateTextToImage } = require("@livepeer/ai/funcs/generateTextToImage");

const livepeer = new LivepeerCore({
    httpBearer: process.env.LIVEPEER_API_TOKEN,
});

async function generateImage(prompt) {
    const res = await generateTextToImage(livepeer, {
        modelId: "SG161222/RealVisXL_V4.0_Lightning",
        prompt,
    });

    console.log(res);

    if (!res.ok) {
        console.error("Unable to generate image");
        return;
    }

    // Cast the response value to the expected type
    const responseValue = res.value?.imageResponse;

    const images = responseValue?.images;

    if (images && images.length > 0) {
        const imageUrl = images[0].url;
        return imageUrl;
    } else {
        throw new Error("No images returned from the API.");
    }
}

module.exports = { generateImage };
