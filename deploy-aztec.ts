/**
 * @file deploy-aztec.ts
 * @description Simplified deployment script for the ZKP job platform on Aztec Network v0.86.0
 */

// Import the createPXEClient and waitForPXE functions from @aztec/aztec.js
import { createPXEClient, waitForPXE } from '@aztec/aztec.js';

// Import the getDeployedTestAccountsWallets function from @aztec/accounts/testing
import { getDeployedTestAccountsWallets } from '@aztec/accounts/testing';

// Import the fs and path modules
import * as fs from 'fs';
import * as path from 'path';

// Define the path to the contract artifact and where to save the address
const CONTRACT_JSON_PATH = './target/mvp_project-MVPBoard.json';
const SAVE_ADDRESS_TO = 'aztec-contract-address.json';

async function main() {
  try {
    console.log('Initializing deployment...');
    
    // Create a PXE client that connects to the local sandbox or a remote node
    const pxe = createPXEClient(process.env.AZTEC_NODE_URL || 'http://localhost:8080');
    
    // Wait for the PXE to be ready
    console.log('Waiting for PXE...');
    await waitForPXE(pxe);
    console.log('PXE is ready');
    
    // Get the test wallets
    console.log('Getting test accounts...');
    const wallets = await getDeployedTestAccountsWallets(pxe);
    
    // Use the first wallet as the deployer
    const deployer = wallets[0];
    console.log(`Using wallet at address: ${deployer.getAddress().toString()}`);
    
    // Load the contract artifact
    console.log('Loading contract artifact...');
    const artifact = JSON.parse(fs.readFileSync(CONTRACT_JSON_PATH, 'utf-8'));
    
    // Deploy the contract
    console.log('Deploying contract...');
    const tx = await deployer.deploy(artifact).send();
    const receipt = await tx.wait();
    
    // Get the contract address from the receipt
    const contractAddress = receipt.contractAddress.toString();
    console.log(`Contract deployed to: ${contractAddress}`);
    
    // Save the contract address to a file
    const deployData = {
      address: contractAddress,
      network: process.env.AZTEC_NODE_URL ? 'testnet' : 'sandbox',
      timestamp: new Date().toISOString()
    };
    
    fs.writeFileSync(
      SAVE_ADDRESS_TO,
      JSON.stringify(deployData, null, 2)
    );
    
    console.log(`Deployment information saved to ${SAVE_ADDRESS_TO}`);
    
  } catch (error) {
    console.error('Deployment failed:', error);
    process.exit(1);
  }
}

// Run the deployment script
main().catch(console.error); 