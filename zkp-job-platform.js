/**
 * ZKP-Enabled Web3 Job Application Platform
 * Frontend Integration Library
 * 
 * This library provides methods to interact with both Noir ZKP circuits and Ethereum smart contracts.
 */

// Import necessary libraries
const ethers = require('ethers');
const noirjs = require('@noir-lang/noir_js');
const { BarretenbergBackend } = require('@noir-lang/backend_barretenberg');
const { Noir } = require('@noir-lang/noir_js');

class ZKPJobPlatform {
  constructor(config) {
    this.provider = config.provider || new ethers.providers.Web3Provider(window.ethereum);
    this.signer = config.signer || this.provider.getSigner();
    this.mvpBoardAddress = config.mvpBoardAddress;
    this.mvpBoardABI = config.mvpBoardABI;
    this.circuitPaths = config.circuitPaths || {
      main: './circuits/main.json',
      jobPublisher: './circuits/job_publisher.json',
      cvPublisher: './circuits/cv_publisher.json',
      apply: './circuits/apply.json',
      match: './circuits/match.json',
      approve: './circuits/approve.json',
    };
    
    // Initialize contract instance
    this.mvpBoardContract = new ethers.Contract(
      this.mvpBoardAddress,
      this.mvpBoardABI,
      this.signer
    );
    
    // Initialize circuit instances
    this.circuits = {};
  }

  /**
   * Initialize the Noir circuits
   */
  async initCircuits() {
    const backend = new BarretenbergBackend(this.circuitPaths.main);
    
    for (const [name, path] of Object.entries(this.circuitPaths)) {
      try {
        const artifact = await fetch(path).then(res => res.json());
        this.circuits[name] = new Noir(artifact, backend);
        console.log(`Circuit ${name} loaded successfully`);
      } catch (error) {
        console.error(`Failed to load circuit ${name}:`, error);
      }
    }
  }

  /**
   * Convert field array to string (for display purposes)
   */
  fieldArrayToString(fieldArray) {
    return fieldArray
      .map(field => String.fromCharCode(Number(field)))
      .join('')
      .replace(/\0/g, '');
  }

  /**
   * Convert string to field array (for input to circuits)
   */
  stringToFieldArray(str, length = 32) {
    const result = new Array(length).fill(0);
    for (let i = 0; i < Math.min(str.length, length); i++) {
      result[i] = str.charCodeAt(i);
    }
    return result;
  }

  /************************
   * JOB POSTING METHODS *
   ************************/
  
  /**
   * Create a job post structure
   */
  createJobPost(title, company, location, requirements, salary, minLevel) {
    return {
      title: this.stringToFieldArray(title),
      company: this.stringToFieldArray(company),
      location: this.stringToFieldArray(location),
      requirements: requirements.map(req => this.stringToFieldArray(req)).concat(
        Array(10 - requirements.length).fill(Array(32).fill(0))
      ).slice(0, 10),
      salary: BigInt(salary),
      minLevel: BigInt(minLevel)
    };
  }

  /**
   * Generate a job commitment proof
   */
  async generateJobProof(jobPost, jobSecret) {
    if (!this.circuits.jobPublisher) {
      throw new Error('Job publisher circuit not initialized');
    }

    const input = {
      job: jobPost,
      secret: BigInt(jobSecret)
    };

    try {
      const { proof, publicInputs } = await this.circuits.jobPublisher.generateProof(input);
      return { 
        proof, 
        publicInputs,
        jobCommitment: publicInputs[0]
      };
    } catch (error) {
      console.error('Failed to generate job proof:', error);
      throw error;
    }
  }

  /**
   * Publish a job on the blockchain
   */
  async publishJob(proof, publicInputs) {
    try {
      const tx = await this.mvpBoardContract.publishJob(proof, publicInputs);
      const receipt = await tx.wait();
      console.log('Job published successfully:', receipt);
      
      // Get the job commitment from the event
      const event = receipt.events.find(e => e.event === 'JobPublished');
      const jobCommitment = event.args.jobCommitment;
      
      return {
        txHash: receipt.transactionHash,
        jobCommitment
      };
    } catch (error) {
      console.error('Failed to publish job:', error);
      throw error;
    }
  }

  /***********************
   * RESUME/CV METHODS *
   ***********************/
  
  /**
   * Create a resume structure
   */
  createResume(name, skills, experienceYears) {
    return {
      name: this.stringToFieldArray(name),
      skills: skills.map(skill => this.stringToFieldArray(skill)).concat(
        Array(10 - skills.length).fill(Array(32).fill(0))
      ).slice(0, 10),
      experienceYears: BigInt(experienceYears)
    };
  }

  /**
   * Generate a resume commitment proof
   */
  async generateResumeProof(resume, resumeSecret) {
    if (!this.circuits.cvPublisher) {
      throw new Error('CV publisher circuit not initialized');
    }

    const input = {
      resume: resume,
      secret: BigInt(resumeSecret)
    };

    try {
      const { proof, publicInputs } = await this.circuits.cvPublisher.generateProof(input);
      return { 
        proof, 
        publicInputs,
        resumeCommitment: publicInputs[0]
      };
    } catch (error) {
      console.error('Failed to generate resume proof:', error);
      throw error;
    }
  }

  /**
   * Submit a resume on the blockchain
   */
  async submitResume(proof, publicInputs) {
    try {
      const tx = await this.mvpBoardContract.submitResume(proof, publicInputs);
      const receipt = await tx.wait();
      console.log('Resume submitted successfully:', receipt);
      
      // Get the resume commitment from the event
      const event = receipt.events.find(e => e.event === 'ResumeSubmitted');
      const resumeCommitment = event.args.resumeCommitment;
      
      return {
        txHash: receipt.transactionHash,
        resumeCommitment
      };
    } catch (error) {
      console.error('Failed to submit resume:', error);
      throw error;
    }
  }

  /*************************
   * APPLICATION METHODS *
   *************************/
  
  /**
   * Create an application structure
   */
  createApplication(jobCommitment, resumeCommitment, applicantSecret) {
    return {
      jobCommitment: BigInt(jobCommitment),
      resumeCommitment: BigInt(resumeCommitment),
      applicantSecret: BigInt(applicantSecret)
    };
  }
  
  /**
   * Generate an application proof with match score
   */
  async generateApplicationProof(job, resume, application) {
    if (!this.circuits.main) {
      throw new Error('Main circuit not initialized');
    }

    const input = {
      job: job,
      jobSecret: application.applicantSecret, // In the real implementation, this would be the employer's secret
      jobCommitment: application.jobCommitment,
      resume: resume,
      resumeSecret: application.applicantSecret, // In the real implementation, this would be the candidate's secret
      resumeCommitment: application.resumeCommitment,
      applicantSecret: application.applicantSecret,
      applicationCommitment: BigInt(0), // This will be computed by the circuit
      employerSecret: BigInt(0), // Not needed for application
      approvalCommitment: BigInt(0), // Not needed for application
      matchScore: BigInt(0) // Will be computed by the circuit
    };

    try {
      const { proof, publicInputs } = await this.circuits.main.generateProof(input);
      return { 
        proof, 
        publicInputs,
        applicationCommitment: publicInputs[2],
        matchScore: publicInputs[3]
      };
    } catch (error) {
      console.error('Failed to generate application proof:', error);
      throw error;
    }
  }

  /**
   * Submit an application on the blockchain
   */
  async apply(proof, publicInputs) {
    try {
      const tx = await this.mvpBoardContract.apply(proof, publicInputs);
      const receipt = await tx.wait();
      console.log('Application submitted successfully:', receipt);
      
      // Get the application commitment and match score from the event
      const event = receipt.events.find(e => e.event === 'ApplicationCreated');
      const applicationCommitment = event.args.applicationCommitment;
      const matchScore = event.args.matchScore;
      
      return {
        txHash: receipt.transactionHash,
        applicationCommitment,
        matchScore
      };
    } catch (error) {
      console.error('Failed to submit application:', error);
      throw error;
    }
  }

  /*********************
   * APPROVAL METHODS *
   *********************/
  
  /**
   * Create an approval structure
   */
  createApproval(applicationCommitment, employerSecret, applicantSecret) {
    return {
      applicationCommitment: BigInt(applicationCommitment),
      employerSecret: BigInt(employerSecret),
      applicantSecret: BigInt(applicantSecret)
    };
  }
  
  /**
   * Generate an approval proof
   */
  async generateApprovalProof(job, resume, application, approval) {
    if (!this.circuits.main) {
      throw new Error('Main circuit not initialized');
    }

    const input = {
      job: job,
      jobSecret: application.applicantSecret, // The employer's secret
      jobCommitment: application.jobCommitment,
      resume: resume,
      resumeSecret: application.applicantSecret, // The candidate's secret
      resumeCommitment: application.resumeCommitment,
      applicantSecret: approval.applicantSecret,
      applicationCommitment: approval.applicationCommitment,
      employerSecret: approval.employerSecret,
      approvalCommitment: BigInt(0), // Will be computed by the circuit
      matchScore: BigInt(0) // Will be recomputed by the circuit
    };

    try {
      const { proof, publicInputs } = await this.circuits.main.generateProof(input);
      return { 
        proof, 
        publicInputs,
        approvalCommitment: publicInputs[4]
      };
    } catch (error) {
      console.error('Failed to generate approval proof:', error);
      throw error;
    }
  }

  /**
   * Submit an approval on the blockchain
   */
  async approve(proof, publicInputs) {
    try {
      const tx = await this.mvpBoardContract.approve(proof, publicInputs);
      const receipt = await tx.wait();
      console.log('Approval submitted successfully:', receipt);
      
      // Get the approval commitment from the event
      const event = receipt.events.find(e => e.event === 'ApprovalDone');
      const approvalCommitment = event.args.approvalCommitment;
      
      return {
        txHash: receipt.transactionHash,
        approvalCommitment
      };
    } catch (error) {
      console.error('Failed to submit approval:', error);
      throw error;
    }
  }

  /*******************
   * HELPER METHODS *
   *******************/
  
  /**
   * Listen for new job postings
   */
  listenForJobs(callback) {
    this.mvpBoardContract.on('JobPublished', (jobCommitment, event) => {
      callback({
        jobCommitment: jobCommitment.toString(),
        transactionHash: event.transactionHash
      });
    });
  }
  
  /**
   * Listen for new resume submissions
   */
  listenForResumes(callback) {
    this.mvpBoardContract.on('ResumeSubmitted', (resumeCommitment, event) => {
      callback({
        resumeCommitment: resumeCommitment.toString(),
        transactionHash: event.transactionHash
      });
    });
  }
  
  /**
   * Listen for new applications
   */
  listenForApplications(callback) {
    this.mvpBoardContract.on('ApplicationCreated', (applicationCommitment, matchScore, event) => {
      callback({
        applicationCommitment: applicationCommitment.toString(),
        matchScore: matchScore.toString(),
        transactionHash: event.transactionHash
      });
    });
  }
  
  /**
   * Listen for new approvals
   */
  listenForApprovals(callback) {
    this.mvpBoardContract.on('ApprovalDone', (approvalCommitment, event) => {
      callback({
        approvalCommitment: approvalCommitment.toString(),
        transactionHash: event.transactionHash
      });
    });
  }
  
  /**
   * Stop listening to all events
   */
  stopListening() {
    this.mvpBoardContract.removeAllListeners();
  }
  
  /**
   * Complete workflow example for job posting
   */
  async workflowPublishJob(title, company, location, requirements, salary, minLevel, secret) {
    const jobPost = this.createJobPost(title, company, location, requirements, salary, minLevel);
    const { proof, publicInputs } = await this.generateJobProof(jobPost, secret);
    return await this.publishJob(proof, publicInputs);
  }
  
  /**
   * Complete workflow example for resume submission
   */
  async workflowSubmitResume(name, skills, experienceYears, secret) {
    const resume = this.createResume(name, skills, experienceYears);
    const { proof, publicInputs } = await this.generateResumeProof(resume, secret);
    return await this.submitResume(proof, publicInputs);
  }
  
  /**
   * Complete workflow example for job application
   */
  async workflowApplyToJob(job, resume, jobCommitment, resumeCommitment, applicantSecret) {
    const application = this.createApplication(jobCommitment, resumeCommitment, applicantSecret);
    const { proof, publicInputs } = await this.generateApplicationProof(job, resume, application);
    return await this.apply(proof, publicInputs);
  }
  
  /**
   * Complete workflow example for approval
   */
  async workflowApprove(job, resume, application, applicationCommitment, employerSecret, applicantSecret) {
    const approval = this.createApproval(applicationCommitment, employerSecret, applicantSecret);
    const { proof, publicInputs } = await this.generateApprovalProof(job, resume, application, approval);
    return await this.approve(proof, publicInputs);
  }
}

// Sample ABI for MVPBoard contract
const MVPBoardABI = [
  "event JobPublished(uint256 jobCommitment)",
  "event ResumeSubmitted(uint256 resumeCommitment)",
  "event ApplicationCreated(uint256 applicationCommitment, uint256 matchScore)",
  "event ApprovalDone(uint256 approvalCommitment)",
  "function publishJob(bytes calldata proof, uint256[] calldata pubInputs) external",
  "function submitResume(bytes calldata proof, uint256[] calldata pubInputs) external",
  "function apply(bytes calldata proof, uint256[] calldata pubInputs) external",
  "function approve(bytes calldata proof, uint256[] calldata pubInputs) external"
];

// Usage example
async function initializeZKPPlatform() {
  // Check if MetaMask is installed
  if (typeof window.ethereum !== 'undefined') {
    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const platformConfig = {
        provider,
        mvpBoardAddress: 'YOUR_CONTRACT_ADDRESS', // Replace with actual contract address
        mvpBoardABI: MVPBoardABI
      };
      
      const platform = new ZKPJobPlatform(platformConfig);
      await platform.initCircuits();
      
      return platform;
    } catch (error) {
      console.error('Error initializing ZKP platform:', error);
    }
  } else {
    console.error('MetaMask is not installed');
  }
}

// Export the class and initialization function
module.exports = {
  ZKPJobPlatform,
  initializeZKPPlatform,
  MVPBoardABI
}; 