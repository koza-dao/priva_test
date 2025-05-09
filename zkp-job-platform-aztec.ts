/**
 * ZKP-Enabled Web3 Job Application Platform for Aztec Network v0.86.0
 * Frontend Integration Library
 * 
 * This library provides methods to interact with the Aztec Network implementation
 * of the ZKP job platform.
 */

// Import Aztec SDK
import { 
  createAztecSdk,
  waitForSandbox,
  getSandboxAccountsWallets,
  AccountWallet,
  AztecAddress,
  Contract,
  TxHash,
  Fr
} from '@aztec/aztec.js';
import { createPXEClient } from '@aztec/aztec.js/pxe';
import { ContractArtifact } from '@aztec/foundation/abi';
import { ethers } from 'ethers';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load contract artifact
const CONTRACT_JSON_PATH = './target/mvp_project-MVPBoard.json';

interface ZKPJobPlatformConfig {
  pxeUrl?: string;
  privateKey?: string;
  contractAddress?: string;
}

interface EventCallbacks {
  onJobPublished?: (jobHash: string) => void;
  onResumeSubmitted?: (resumeHash: string) => void;
  onMatchComputed?: (jobId: string, resumeId: string, score: number) => void;
}

class ZKPJobPlatformAztec {
  private pxeUrl: string;
  private privateKey?: string;
  private contractAddress?: string;
  private wallet: AccountWallet | null = null;
  private contract: Contract | null = null;
  private contractArtifact: ContractArtifact;
  private eventSubscriptions: any[] = [];

  constructor(config: ZKPJobPlatformConfig) {
    this.pxeUrl = config.pxeUrl || 'http://localhost:8080';
    this.privateKey = config.privateKey;
    this.contractAddress = config.contractAddress;
    
    // Load contract artifact
    try {
      this.contractArtifact = JSON.parse(
        fs.readFileSync(CONTRACT_JSON_PATH, 'utf-8')
      );
    } catch (error) {
      console.error('Failed to load contract artifact:', error);
      throw new Error('Contract artifact not found. Make sure to compile the contract first.');
    }
  }

  /**
   * Initialize the Aztec SDK, wallet and contract
   */
  async initialize(): Promise<void> {
    // Create Aztec SDK
    const pxe = createPXEClient(this.pxeUrl);
    const { aztecNode } = await createAztecSdk({ pxe });
    
    // Set up wallet
    if (this.privateKey) {
      // Use provided private key
      const provider = new ethers.providers.JsonRpcProvider();
      const ethSigner = new ethers.Wallet(this.privateKey, provider);
      // @ts-ignore
      this.wallet = await pxe.createSchnorrAccount(ethSigner);
    } else {
      // Use sandbox account
      const accounts = await getSandboxAccountsWallets(aztecNode);
      this.wallet = accounts[0];
    }
    
    console.log('Using account:', await this.wallet.getAddress().toString());

    // Connect to contract if address is provided
    if (this.contractAddress) {
      this.contract = await pxe.getContractInstance(
        this.contractArtifact,
        AztecAddress.fromString(this.contractAddress)
      );
    }
  }

  /**
   * Deploy a new MVPBoard contract
   */
  async deployContract(): Promise<string> {
    if (!this.wallet) {
      throw new Error('Wallet not initialized. Call initialize() first');
    }
    
    console.log('Deploying MVPBoard contract...');
    
    // Deploy the contract
    const deployed = await this.wallet.deploy(this.contractArtifact).send().wait();
    
    // Store contract reference
    this.contractAddress = deployed.contractAddress.toString();
    this.contract = deployed.contract;
    
    console.log('Contract deployed at:', this.contractAddress);
    return this.contractAddress;
  }

  /**
   * Publish a job posting
   */
  async publishJob(
    title: number,
    company: number,
    requirements: number
  ): Promise<{ txHash: string, jobHash: string }> {
    if (!this.contract || !this.wallet) {
      throw new Error('Contract not initialized');
    }

    // Call publish_job function
    const tx = await this.contract.methods.publish_job(
      title,
      company,
      requirements
    ).send().wait();
    
    // Get result from transaction receipt
    const result = tx.returnValues[0].toString();
    
    return {
      txHash: tx.txHash.toString(),
      jobHash: result
    };
  }

  /**
   * Submit a resume
   */
  async submitResume(
    name: number,
    skills: number,
    experience: number
  ): Promise<{ txHash: string, resumeHash: string }> {
    if (!this.contract || !this.wallet) {
      throw new Error('Contract not initialized');
    }

    // Call submit_resume function
    const tx = await this.contract.methods.submit_resume(
      name,
      skills,
      experience
    ).send().wait();
    
    // Get result from transaction receipt
    const result = tx.returnValues[0].toString();
    
    return {
      txHash: tx.txHash.toString(),
      resumeHash: result
    };
  }

  /**
   * Compute match score between job and resume
   */
  async computeMatch(
    jobRequirements: number,
    candidateSkills: number,
    experience: number
  ): Promise<{ txHash: string, matchScore: number }> {
    if (!this.contract || !this.wallet) {
      throw new Error('Contract not initialized');
    }

    // Call compute_match function
    const tx = await this.contract.methods.compute_match(
      jobRequirements,
      candidateSkills,
      experience
    ).send().wait();
    
    // Get result from transaction receipt
    const result = Number(tx.returnValues[0].toString());
    
    return {
      txHash: tx.txHash.toString(),
      matchScore: result
    };
  }

  /**
   * Subscribe to contract events
   */
  async subscribeToEvents(callbacks: EventCallbacks): Promise<void> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }
    
    // TODO: Implement event subscriptions for v0.86.0
    console.log('Event subscriptions not yet implemented for v0.86.0');
  }

  /**
   * Unsubscribe from all events
   */
  unsubscribeFromEvents(): void {
    this.eventSubscriptions.forEach(subscription => {
      if (subscription.unsubscribe) {
        subscription.unsubscribe();
      }
    });
    this.eventSubscriptions = [];
  }
}

/**
 * Initialize a new ZKP Job Platform for Aztec
 */
async function initializeZKPPlatformAztec(config: ZKPJobPlatformConfig = {}): Promise<ZKPJobPlatformAztec> {
  const platform = new ZKPJobPlatformAztec(config);
  await platform.initialize();
  return platform;
}

export { ZKPJobPlatformAztec, initializeZKPPlatformAztec }; 