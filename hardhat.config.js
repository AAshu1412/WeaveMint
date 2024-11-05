require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */

module.exports = {
  solidity: "0.8.27",

  networks: {
    weavevmAlpha: {
      url: "https://testnet-rpc.wvm.dev",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 9496,
      timeout: 10000,
      confirmations: 2,
    },
  },
  etherscan: {
    apiKey: {
      weavevmAlpha: "mujahid002",
    },
    customChains: [
      {
        network: "weavevmAlpha",
        chainId: 9496,
        urls: {
          apiURL: "https://explorer.wvm.dev/api",
          browserURL: "https://explorer.wvm.dev",
        },
      },
    ],
  },
  sourcify: {
    enabled: true,
  },
  settings: {
    optimizer: {
      enabled: true,
      runs: 10000,
    },
  },
};