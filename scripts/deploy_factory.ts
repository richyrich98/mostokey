import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("Deploying RightsFactory contract...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  // Deploy RightsFactory
  const RightsFactory = await ethers.getContractFactory("RightsFactory");
  const rightsFactory = await RightsFactory.deploy();
  
  await rightsFactory.waitForDeployment();
  const factoryAddress = await rightsFactory.getAddress();
  
  console.log("RightsFactory deployed to:", factoryAddress);

  // Save deployment information
  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId.toString(),
    factoryAddress: factoryAddress,
    deployerAddress: deployer.address,
    deploymentTime: new Date().toISOString(),
  };

  const deploymentPath = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentPath)) {
    fs.mkdirSync(deploymentPath, { recursive: true });
  }

  fs.writeFileSync(
    path.join(deploymentPath, `${deploymentInfo.network}-deployment.json`),
    JSON.stringify(deploymentInfo, null, 2)
  );

  // Generate ABI files for frontend
  const frontendAbiPath = path.join(__dirname, "../frontend/src/lib/abi");
  if (!fs.existsSync(frontendAbiPath)) {
    fs.mkdirSync(frontendAbiPath, { recursive: true });
  }

  // Copy factory ABI
  const factoryArtifact = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, "../artifacts/contracts/RightsFactory.sol/RightsFactory.json"),
      "utf8"
    )
  );

  fs.writeFileSync(
    path.join(frontendAbiPath, "RightsFactory.json"),
    JSON.stringify(factoryArtifact.abi, null, 2)
  );

  // Copy token ABI
  const tokenArtifact = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, "../artifacts/contracts/VideoRightsToken.sol/VideoRightsToken.json"),
      "utf8"
    )
  );

  fs.writeFileSync(
    path.join(frontendAbiPath, "VideoRightsToken.json"),
    JSON.stringify(tokenArtifact.abi, null, 2)
  );

  console.log("\n=== DEPLOYMENT COMPLETE ===");
  console.log("Factory Address:", factoryAddress);
  console.log("Network:", deploymentInfo.network);
  console.log("Chain ID:", deploymentInfo.chainId);
  console.log("\nUpdate your frontend/src/lib/config.js with this factory address!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });