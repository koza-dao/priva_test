/**
 * ZKP-Enabled Web3 Job Application Platform for Aztec Network
 * Frontend Integration Library
 * 
 * This library provides methods to interact with the Aztec Network implementation
 * of the ZKP job platform.
 */

// Import Aztec SDK
import { 
  createAztecSdk, 
  AztecSdk, 
  Fr, 
  Note, 
  AccountWallet 
} from '@aztec/sdk';
import { MVPBoard, JobPostNote, ResumeNote, ApplicationNote, ApprovalNote } from './contracts/MVPBoard';

class ZKPJobPlatformAztec {
  constructor(config) {
    this.provider = config.provider;
    this.privateKey = config.privateKey;
    this.mvpBoardAddress = config.mvpBoardAddress;
    this.sdk = null;
    this.wallet = null;
    this.mvpBoard = null;
  }

  /**
   * Initialize the Aztec SDK, wallet and contract
   */
  async initialize() {
    // Create and start the SDK
    this.sdk = await createAztecSdk({
      serverUrl: 'https://api.aztec.network/aztec-connect-testnet/falafel', // Use testnet
      pollInterval: 1000,
      memoryDb: true,
      debug: 'bb:*',
    });
    await this.sdk.run();
    console.log('Aztec SDK initialized');

    // Set up wallet
    if (this.privateKey) {
      this.wallet = await this.sdk.createWalletFromPK(Fr.fromString(this.privateKey));
    } else {
      this.wallet = await this.sdk.createWallet();
      console.log('New wallet created. Private key:', this.wallet.getPrivateKey().toString());
    }
    console.log('Wallet address:', this.wallet.getAddress().toString());

    // Connect to contract
    if (this.mvpBoardAddress) {
      this.mvpBoard = await this.sdk.getContract(this.mvpBoardAddress);
    } else {
      console.warn('No contract address provided. Use deployContract() to deploy a new instance.');
    }
  }

  /**
   * Deploy a new MVPBoard contract
   */
  async deployContract() {
    if (!this.sdk || !this.wallet) {
      throw new Error('SDK and wallet must be initialized before deploying');
    }
    
    console.log('Deploying MVPBoard contract...');
    const deployTx = await MVPBoard.deploy(this.sdk).send();
    await deployTx.wait();
    
    this.mvpBoard = deployTx.contract;
    this.mvpBoardAddress = this.mvpBoard.address.toString();
    
    console.log('MVPBoard contract deployed at:', this.mvpBoardAddress);
    return this.mvpBoardAddress;
  }

  /**
   * Convert string to Field array (for input to Aztec)
   */
  stringToFieldArray(str, length = 32) {
    const result = new Array(length).fill(Fr.ZERO);
    for (let i = 0; i < Math.min(str.length, length); i++) {
      result[i] = new Fr(str.charCodeAt(i));
    }
    return result;
  }

  /**
   * Convert Field array to string (for display)
   */
  fieldArrayToString(fieldArray) {
    return fieldArray
      .map(field => String.fromCharCode(parseInt(field.toString())))
      .join('')
      .replace(/\0/g, '');
  }

  /************************
   * JOB POSTING METHODS *
   ************************/
  
  /**
   * Create a job post structure for Aztec
   */
  createJobPost(title, company, location, requirements, salary, minLevel, secret) {
    return new JobPostNote(
      this.stringToFieldArray(title),
      this.stringToFieldArray(company),
      this.stringToFieldArray(location),
      requirements.map(req => this.stringToFieldArray(req)).concat(
        Array(10 - requirements.length).fill(Array(32).fill(Fr.ZERO))
      ).slice(0, 10),
      new Fr(salary),
      new Fr(minLevel),
      new Fr(secret)
    );
  }

  /**
   * Publish a job on Aztec
   */
  async publishJob(title, company, location, requirements, salary, minLevel, secret) {
    if (!this.mvpBoard) {
      throw new Error('Contract not initialized');
    }

    // Create job post note
    const jobPost = this.createJobPost(title, company, location, requirements, salary, minLevel, secret);
    
    // Call contract method
    const tx = await this.mvpBoard.methods
      .publishJob(jobPost)
      .send()
      .wait();
    
    // Extract job commitment from logs
    const event = tx.events.find(e => e.name === 'JobPublished');
    const jobCommitment = event.args[0];
    
    console.log('Job published successfully');
    return {
      txHash: tx.hash,
      jobCommitment: jobCommitment.toString()
    };
  }

  /***********************
   * RESUME/CV METHODS *
   ***********************/
  
  /**
   * Create a resume structure for Aztec
   */
  createResume(name, skills, experienceYears, secret) {
    return new ResumeNote(
      this.stringToFieldArray(name),
      skills.map(skill => this.stringToFieldArray(skill)).concat(
        Array(10 - skills.length).fill(Array(32).fill(Fr.ZERO))
      ).slice(0, 10),
      new Fr(experienceYears),
      new Fr(secret)
    );
  }

  /**
   * Submit a resume on Aztec
   */
  async submitResume(name, skills, experienceYears, secret) {
    if (!this.mvpBoard) {
      throw new Error('Contract not initialized');
    }

    // Create resume note
    const resume = this.createResume(name, skills, experienceYears, secret);
    
    // Call contract method
    const tx = await this.mvpBoard.methods
      .submitResume(resume)
      .send()
      .wait();
    
    // Extract resume commitment from logs
    const event = tx.events.find(e => e.name === 'ResumeSubmitted');
    const resumeCommitment = event.args[0];
    
    console.log('Resume submitted successfully');
    return {
      txHash: tx.hash,
      resumeCommitment: resumeCommitment.toString()
    };
  }

  /*************************
   * APPLICATION METHODS *
   *************************/
  
  /**
   * Apply to a job on Aztec
   */
  async applyToJob(
    job, // JobPostNote or job details object
    resume, // ResumeNote or resume details object
    jobCommitment,
    resumeCommitment,
    applicantSecret
  ) {
    if (!this.mvpBoard) {
      throw new Error('Contract not initialized');
    }

    // Convert to JobPostNote if needed
    let jobNote = job;
    if (!(job instanceof JobPostNote)) {
      jobNote = this.createJobPost(
        job.title,
        job.company,
        job.location,
        job.requirements,
        job.salary,
        job.minLevel,
        applicantSecret // This would normally be jobSecret
      );
    }

    // Convert to ResumeNote if needed
    let resumeNote = resume;
    if (!(resume instanceof ResumeNote)) {
      resumeNote = this.createResume(
        resume.name,
        resume.skills,
        resume.experienceYears,
        applicantSecret // This would normally be resumeSecret
      );
    }

    // Format arguments
    const frJobCommitment = new Fr(jobCommitment);
    const frResumeCommitment = new Fr(resumeCommitment);
    const frApplicantSecret = new Fr(applicantSecret);
    
    // Call contract method
    const tx = await this.mvpBoard.methods
      .apply(jobNote, resumeNote, frJobCommitment, frResumeCommitment, frApplicantSecret)
      .send()
      .wait();
    
    // Extract application commitment and match score from logs
    const event = tx.events.find(e => e.name === 'ApplicationCreated');
    const applicationCommitment = event.args[0];
    const matchScore = event.args[1];
    
    console.log('Application submitted successfully');
    return {
      txHash: tx.hash,
      applicationCommitment: applicationCommitment.toString(),
      matchScore: matchScore.toString()
    };
  }

  /*********************
   * APPROVAL METHODS *
   *********************/
  
  /**
   * Approve an application on Aztec
   */
  async approve(applicationCommitment, employerSecret, applicantSecret) {
    if (!this.mvpBoard) {
      throw new Error('Contract not initialized');
    }

    // Format arguments
    const frApplicationCommitment = new Fr(applicationCommitment);
    const frEmployerSecret = new Fr(employerSecret);
    const frApplicantSecret = new Fr(applicantSecret);
    
    // Call contract method
    const tx = await this.mvpBoard.methods
      .approve(frApplicationCommitment, frEmployerSecret, frApplicantSecret)
      .send()
      .wait();
    
    // Extract approval commitment from logs
    const event = tx.events.find(e => e.name === 'ApprovalDone');
    const approvalCommitment = event.args[0];
    
    console.log('Approval submitted successfully');
    return {
      txHash: tx.hash,
      approvalCommitment: approvalCommitment.toString()
    };
  }

  /*******************
   * HELPER METHODS *
   *******************/
  
  /**
   * Subscribe to contract events
   */
  subscribeToEvents(callbacks) {
    if (!this.mvpBoard) {
      throw new Error('Contract not initialized');
    }
    
    // JobPublished events
    if (callbacks.onJobPublished) {
      this.mvpBoard.events.JobPublished.subscribe(event => {
        callbacks.onJobPublished({
          jobCommitment: event.args[0].toString(),
          txHash: event.txHash
        });
      });
    }
    
    // ResumeSubmitted events
    if (callbacks.onResumeSubmitted) {
      this.mvpBoard.events.ResumeSubmitted.subscribe(event => {
        callbacks.onResumeSubmitted({
          resumeCommitment: event.args[0].toString(),
          txHash: event.txHash
        });
      });
    }
    
    // ApplicationCreated events
    if (callbacks.onApplicationCreated) {
      this.mvpBoard.events.ApplicationCreated.subscribe(event => {
        callbacks.onApplicationCreated({
          applicationCommitment: event.args[0].toString(),
          matchScore: event.args[1].toString(),
          txHash: event.txHash
        });
      });
    }
    
    // ApprovalDone events
    if (callbacks.onApprovalDone) {
      this.mvpBoard.events.ApprovalDone.subscribe(event => {
        callbacks.onApprovalDone({
          approvalCommitment: event.args[0].toString(),
          txHash: event.txHash
        });
      });
    }
    
    console.log('Subscribed to contract events');
  }
  
  /**
   * Unsubscribe from all contract events
   */
  unsubscribeFromEvents() {
    if (!this.mvpBoard) {
      return;
    }
    
    this.mvpBoard.events.JobPublished.unsubscribeAll();
    this.mvpBoard.events.ResumeSubmitted.unsubscribeAll();
    this.mvpBoard.events.ApplicationCreated.unsubscribeAll();
    this.mvpBoard.events.ApprovalDone.unsubscribeAll();
    
    console.log('Unsubscribed from all contract events');
  }
}

// Example usage
async function initializeZKPPlatformAztec(config) {
  try {
    const platform = new ZKPJobPlatformAztec(config);
    await platform.initialize();
    
    if (!config.mvpBoardAddress) {
      await platform.deployContract();
    }
    
    return platform;
  } catch (error) {
    console.error('Error initializing Aztec platform:', error);
    throw error;
  }
}

// Export the class and initialization function
export {
  ZKPJobPlatformAztec,
  initializeZKPPlatformAztec
}; 