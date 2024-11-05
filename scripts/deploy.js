const { ethers, run } = require("hardhat");

async function main() {
    // WeaveMint
    const WeaveMintContract = await hre.ethers.getContractFactory("WeaveMint");
    console.log("Deploying WeaveMint Contract...");
    const weaveMint = await WeaveMintContract.deploy(
        {
            gasPrice: 33000000000,
        }
    );
    await weaveMint.waitForDeployment();
    const weaveMintAddress = await weaveMint.getAddress();
    console.log("WeaveMint Contract Address:", weaveMintAddress);
    console.log("----------------------------------------------------------");

    // Verify WeaveMint
    console.log("Verifying WeaveMint...");
    await run("verify:verify", {
        address: weaveMintAddress,
        constructorArguments: [],
    });
    console.log("----------------------------------------------------------");

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

// yarn hardhat run scripts/deploy.js --network weavevmAlpha
// yarn hardhat verify --network weavevmAlpha ADDRESS