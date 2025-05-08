/**
 * @file deploy-aztec.ts
 * @description Deployment script for the ZKP job platform on Aztec Network
 */
import { createAztecSdk, Fr } from '@aztec/sdk';
import { MVPBoard } from './contracts/MVPBoard';
import fs from 'fs';
import path from 'path';

// Configuration
const PRIVATE_KEY = process.env.PRIVATE_KEY || '';
const SAVE_ADDRESS_TO = 'aztec-contract-address.json';

async function main() {
  try {
    console.log('Initializing Aztec SDK...');
    
    // Initialize Aztec SDK
    const sdk = await createAztecSdk({
      serverUrl: 'https://api.aztec.network/aztec-connect-testnet/falafel', // Use testnet
      pollInterval: 1000,
      memoryDb: true,
      debug: 'bb:*',
    });
    
    await sdk.run();
    console.log('Aztec SDK initialized');

    // Set up wallet
    let wallet;
    if (PRIVATE_KEY) {
      console.log('Using provided private key');
      wallet = await sdk.createWalletFromPK(Fr.fromString(PRIVATE_KEY));
    } else {
      console.log('Creating new wallet');
      wallet = await sdk.createWallet();
      console.log('New wallet created. Private key:', wallet.getPrivateKey().toString());
      console.log('IMPORTANT: Save this private key securely for future use');
    }
    
    console.log('Wallet address:', wallet.getAddress().toString());

    // Deploy the MVPBoard contract
    console.log('Deploying MVPBoard contract...');
    const deployTx = await MVPBoard.deploy(sdk).send();
    console.log('Waiting for deployment transaction to be confirmed...');
    await deployTx.wait();
    
    const contractAddress = deployTx.contract.address.toString();
    console.log('MVPBoard contract deployed successfully at:', contractAddress);

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