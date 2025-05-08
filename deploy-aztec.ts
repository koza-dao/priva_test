/**
 * @file deploy-aztec.ts
 * @description Deployment script for the ZKP job platform on Aztec Network
 */
import { ZKPJobPlatformAztec, initializeZKPPlatformAztec } from './zkp-job-platform-aztec';
import fs from 'fs';
import path from 'path';

// Configuration
const PRIVATE_KEY = process.env.PRIVATE_KEY || '';
const SAVE_ADDRESS_TO = 'aztec-contract-address.json';

async function main() {
  try {
    console.log('Initializing ZKP Job Platform for Aztec...');
    
    // Initialize the platform with private key if available
    const platform = await initializeZKPPlatformAztec({
      privateKey: PRIVATE_KEY
    });
    
    // Deploy the contract
    console.log('Deploying the MVPBoard contract...');
    const contractAddress = await platform.deployContract();
    console.log('Contract deployed successfully at:', contractAddress);
    
    // Save the contract address to a file
    const addressData = {
      address: contractAddress,
      network: 'aztec-testnet',
      deploymentTime: new Date().toISOString()
    };
    
    fs.writeFileSync(
      path.resolve(__dirname, SAVE_ADDRESS_TO),
      JSON.stringify(addressData, null, 2)
    );
    
    console.log(`Contract address saved to ${SAVE_ADDRESS_TO}`);
    console.log('Deployment completed successfully');
    
    // Exit the process
    process.exit(0);
  } catch (error) {
    console.error('Error during deployment:', error);
    process.exit(1);
  }
}

// Run the main function
main(); 