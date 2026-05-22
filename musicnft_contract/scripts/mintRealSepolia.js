import hardhat from "hardhat";
import { readFileSync } from "fs";

const { ethers } = hardhat;

async function main() {
  let contractAddress;

  try {
    const deploymentInfo = JSON.parse(
      readFileSync("deployment-sepolia.json", "utf-8")
    );

    contractAddress = deploymentInfo.contractAddress;

    console.log("Found deployment info:");
    console.log("Contract Address:", contractAddress);
    console.log("Network:", deploymentInfo.network);
  } catch (error) {
    console.error("Không tìm thấy file deployment-sepolia.json");
    console.error("Hãy deploy contract trước.");
    process.exit(1);
  }

  const [deployer] = await ethers.getSigners();

  console.log("\n=== Mint Real Music NFT ===");
  console.log("Minter:", deployer.address);
  console.log("Recipient:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Balance:", ethers.formatEther(balance), "ETH");

  const MusicNFT = await ethers.getContractFactory("MusicNFT");
  const nft = MusicNFT.attach(contractAddress);

  const realTokenURI = "ipfs://QmQXYEHKVCdUKF3s1M3r3x9HwegL3gnWdaxjM5wQy5CoXB";

  console.log("\nMinting with tokenURI:");
  console.log(realTokenURI);

  const mintPrice = await nft.mintPrice();
  console.log("Mint Price:", ethers.formatEther(mintPrice), "ETH");
  console.log("Owner mint is free, so no ETH value is sent.");

  const mintTx = await nft.mintMusic(
    deployer.address,
    realTokenURI,
    deployer.address,
    500
  );

  console.log("\nTransaction hash:", mintTx.hash);
  console.log("Waiting for confirmation...");

  const receipt = await mintTx.wait();

  console.log("\nTransaction confirmed!");
  console.log("Block:", receipt.blockNumber);
  console.log("Gas used:", receipt.gasUsed.toString());

  const parsedLogs = receipt.logs
    .map((log) => {
      try {
        return nft.interface.parseLog(log);
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  const mintEvent = parsedLogs.find((event) => event.name === "MusicMinted");

  if (!mintEvent) {
    console.log("Không tìm thấy event MusicMinted, nhưng transaction đã confirm.");
    return;
  }

  const tokenId = mintEvent.args.tokenId;
  const owner = await nft.ownerOf(tokenId);
  const tokenURI = await nft.tokenURI(tokenId);

  console.log("\n=== Real NFT Minted Successfully ===");
  console.log("Token ID:", tokenId.toString());
  console.log("Owner:", owner);
  console.log("Token URI:", tokenURI);

  console.log("\nExplorer Links:");
  console.log("Contract:", `https://sepolia.etherscan.io/address/${contractAddress}`);
  console.log("Transaction:", `https://sepolia.etherscan.io/tx/${mintTx.hash}`);
  console.log("Metadata Gateway:", "https://gateway.pinata.cloud/ipfs/QmQXYEHKVCdUKF3s1M3r3x9HwegL3gnWdaxjM5wQy5CoXB");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});