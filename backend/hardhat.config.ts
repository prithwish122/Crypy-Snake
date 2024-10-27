// import { HardhatUserConfig } from "hardhat/config";
// import "@nomicfoundation/hardhat-toolbox";

// const config: HardhatUserConfig = {
//   solidity: "0.8.24",
// };

// export default config;



import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
// import "@nomiclabs/hardhat-etherscan";
import * as dotenv from "dotenv";
import { vars } from "hardhat/config";
// import "@nomiclabs/hardhat-etherscan";

const ETHERSCAN_API_KEY = vars.get("ETHERSCAN_API_KEY");
dotenv.config();
// { path: __dirname + "/../.env" }
const ACCOUNT_PRIVATE_KEY = process.env.ACCOUNT_PRIVATE_KEY || "";
console.log("PrivateKey set:", !!ACCOUNT_PRIVATE_KEY);

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  sourcify: {
    enabled: true
  },
  paths: {
    artifacts: "./src",
  },
  networks: {
    // opencampus: {
    //   url: `https://rpc.open-campus-codex.gelato.digital/`,
    //   accounts: [ACCOUNT_PRIVATE_KEY],
    // },
    aiaTestnet: {
      url: "https://aia-dataseed1-testnet.aiachain.org",
      accounts: process.env.ACCOUNT_PRIVATE_KEY !== undefined ? [process.env.ACCOUNT_PRIVATE_KEY] : [],
      chainId: 1320,
      // gasPrice: 60000000000,
    },
  },
  etherscan: {
    apiKey: {
      opencampus: "xxx",
    },
    // customChains: [
    //   {
    //     network: "opencampus",
    //     chainId: 656476,
    //     urls: {
    //       apiURL: "https://rpc.open-campus-codex.gelato.digital/api",
    //       browserURL: "https://rpc.open-campus-codex.gelato.digital/",
    //     },
    //   },
    // ],
  },
};

export default config;