/**
 * Example of how to use the MVPBoard contract
 */

// NOTE: Before using this example, you'll need to:
// 1. Install the Aztec SDK packages:
//    npm install @aztec/aztec.js @aztec/foundation
// 2. Deploy your contract using Aztec CLI or SDK

// Import Aztec SDK
import { createAztecSdk, waitForPendingTx, getSandboxAccountsWallets } from '@aztec/aztec.js';
import { AztecAddress } from '@aztec/foundation/fields';

// Import our contract
import { loadMVPBoardContract } from './MVPBoard';

async function main() {
  console.log('Initializing Aztec SDK...');
  
  // Initialize the SDK (connect to a sandbox node for development)
  const { aztecNode } = await createAztecSdk({
    sandboxMode: true,
  });
  
  // Get a test account
  const accounts = await getSandboxAccountsWallets(aztecNode);
  const wallet = accounts[0];
  
  // The address of your deployed contract
  // Replace with your actual contract address after deployment
  const contractAddress = AztecAddress.fromString('0x1234567890123456789012345678901234567890');
  
  console.log('Loading MVPBoard contract...');
  const mvpBoard = await loadMVPBoardContract(contractAddress);
  
  console.log('Publishing a job...');
  // Create a transaction to call publish_job
  const receipt = await wallet.createTx([
    mvpBoard.methods.publish_job(123, 456, 789)
  ]).send().wait();
  
  console.log('Transaction hash:', receipt.txHash.toString());
  console.log('Job published successfully!');
}

// Run the example
main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
}); 