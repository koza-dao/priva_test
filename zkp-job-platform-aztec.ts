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

interface ZKPJobPlatformConfig {
  provider?: any;
  privateKey?: string;
  mvpBoardAddress?: string;
}

interface EventCallbacks {
  onJobPublished?: (jobCommitment: string) => void;
  onResumeSubmitted?: (resumeCommitment: string) => void;
  onApplicationCreated?: (applicationCommitment: string, matchScore: number) => void;
  onApprovalCreated?: (approvalCommitment: string) => void;
}

class ZKPJobPlatformAztec {
  private provider?: any;
  private privateKey?: string;
  private mvpBoardAddress?: string;
  private sdk: AztecSdk | null = null;
  private wallet: AccountWallet | null = null;
  private mvpBoard: any | null = null;
  private eventSubscriptions: any[] = [];

  constructor(config: ZKPJobPlatformConfig) {
    this.provider = config.provider;
    this.privateKey = config.privateKey;
    this.mvpBoardAddress = config.mvpBoardAddress;
  }

  /**
   * Initialize the Aztec SDK, wallet and contract
   */
  async initialize(): Promise<void> {
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
  async deployContract(): Promise<string> {
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
  stringToFieldArray(str: string, length: number = 32): Fr[] {
    const result = new Array(length).fill(Fr.ZERO);
    for (let i = 0; i < Math.min(str.length, length); i++) {
      result[i] = new Fr(str.charCodeAt(i));
    }
    return result;
  }

  /**
   * Convert Field array to string (for display)
   */
  fieldArrayToString(fieldArray: Fr[]): string {
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
  createJobPost(
    title: string, 
    company: string, 
    location: string, 
    requirements: string[], 
    salary: number, 
    minLevel: number, 
    secret: string
  ): JobPostNote {
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
  async publishJob(
    title: string, 
    company: string, 
    location: string, 
    requirements: string[], 
    salary: number, 
    minLevel: number, 
    secret: string
  ): Promise<{txHash: string, jobCommitment: string}> {
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
    const event = tx.events.find((e: any) => e.name === 'JobPublished');
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
  createResume(
    name: string, 
    skills: string[], 
    experienceYears: number, 
    secret: string
  ): ResumeNote {
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
  async submitResume(
    name: string, 
    skills: string[], 
    experienceYears: number, 
    secret: string
  ): Promise<{txHash: string, resumeCommitment: string}> {
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
    const event = tx.events.find((e: any) => e.name === 'ResumeSubmitted');
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
    job: JobPostNote | any, // JobPostNote or job details object
    resume: ResumeNote | any, // ResumeNote or resume details object
    jobCommitment: string,
    resumeCommitment: string,
    applicantSecret: string
  ): Promise<{txHash: string, applicationCommitment: string, matchScore: number}> {
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
    const event = tx.events.find((e: any) => e.name === 'ApplicationCreated');
    const applicationCommitment = event.args[0];
    const matchScore = parseInt(event.args[1].toString());
    
    console.log('Application submitted successfully');
    console.log('Match score:', matchScore);
    return {
      txHash: tx.hash,
      applicationCommitment: applicationCommitment.toString(),
      matchScore
    };
  }

  /**
   * Approve application (mutual agreement)
   */
  async approve(
    applicationCommitment: string, 
    employerSecret: string, 
    applicantSecret: string
  ): Promise<{txHash: string, approvalCommitment: string}> {
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
    const event = tx.events.find((e: any) => e.name === 'ApprovalCreated');
    const approvalCommitment = event.args[0];
    
    console.log('Approval created successfully');
    return {
      txHash: tx.hash,
      approvalCommitment: approvalCommitment.toString()
    };
  }

  /**
   * Subscribe to contract events
   */
  subscribeToEvents(callbacks: EventCallbacks): void {
    if (!this.sdk || !this.mvpBoard) {
      throw new Error('SDK and contract must be initialized before subscribing to events');
    }

    if (callbacks.onJobPublished) {
      const jobSub = this.mvpBoard.events
        .JobPublished
        .subscribe((event: any) => {
          const jobCommitment = event.args[0].toString();
          callbacks.onJobPublished?.(jobCommitment);
        });
      this.eventSubscriptions.push(jobSub);
    }

    if (callbacks.onResumeSubmitted) {
      const resumeSub = this.mvpBoard.events
        .ResumeSubmitted
        .subscribe((event: any) => {
          const resumeCommitment = event.args[0].toString();
          callbacks.onResumeSubmitted?.(resumeCommitment);
        });
      this.eventSubscriptions.push(resumeSub);
    }

    if (callbacks.onApplicationCreated) {
      const appSub = this.mvpBoard.events
        .ApplicationCreated
        .subscribe((event: any) => {
          const applicationCommitment = event.args[0].toString();
          const matchScore = parseInt(event.args[1].toString());
          callbacks.onApplicationCreated?.(applicationCommitment, matchScore);
        });
      this.eventSubscriptions.push(appSub);
    }

    if (callbacks.onApprovalCreated) {
      const approvalSub = this.mvpBoard.events
        .ApprovalCreated
        .subscribe((event: any) => {
          const approvalCommitment = event.args[0].toString();
          callbacks.onApprovalCreated?.(approvalCommitment);
        });
      this.eventSubscriptions.push(approvalSub);
    }
  }

  /**
   * Unsubscribe from all events
   */
  unsubscribeFromEvents(): void {
    for (const subscription of this.eventSubscriptions) {
      subscription.unsubscribe();
    }
    
    this.eventSubscriptions = [];
    console.log('Unsubscribed from all events');
  }
}

async function initializeZKPPlatformAztec(config: ZKPJobPlatformConfig): Promise<ZKPJobPlatformAztec> {
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
  initializeZKPPlatformAztec,
  ZKPJobPlatformConfig,
  EventCallbacks
}; 