/**
 * @file deploy.js
 * @description Deployment script for the ZKP-enabled job application platform contracts
 * @dev Uses Hardhat to deploy the MVPBoard contract to the specified network
 */

/**
 * @function main
 * @description Main deployment function that handles contract deployment
 * @dev Deploys the MVPBoard contract which inherits from MVPVerifier
 */
async function main() {
  // Get the deployer account from the connected provider
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Load the MVPBoard contract factory using the compiled artifacts
  const MVPBoard = await ethers.getContractFactory("MVPBoard");
  
  // Deploy the contract without any constructor arguments
  const board = await MVPBoard.deploy();
  
  // Wait for the deployment transaction to be mined
  await board.deployed();

  // Log the deployed contract address for future reference
  console.log("MVPBoard deployed to:", board.address);
}

// Execute the deployment function and handle any errors
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});