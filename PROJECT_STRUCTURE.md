# ZKP-Enabled Web3 Job Application Platform: Project Structure

## 📁 Project Structure Overview

```
zkp-job-platform/
├── src/                          # Noir Zero-Knowledge circuits
│   ├── main.nr                   # Main circuit connecting all components
│   ├── job_publisher.nr          # Job posting commitment generation
│   ├── cv_publisher.nr           # Resume commitment generation
│   ├── apply.nr                  # Application commitment logic
│   ├── match.nr                  # Job-resume matching algorithm
│   └── approve.nr                # Mutual approval process
│
├── contracts/                    # Ethereum smart contracts
│   ├── MVPVerifier.sol           # ZKP verification contract
│   └── MVPBoard.sol              # Main platform contract
│
├── scripts/                      # Deployment and testing scripts
│   └── deploy.js                 # Contract deployment script
│
├── nargo.toml                    # Noir project configuration
└── README.md                     # Project documentation
```

## 🔍 File Purposes

### Noir Zero-Knowledge Circuits (src/)

1. **main.nr**
   - Central circuit that integrates all components
   - Validates the entire job application flow in a single proof
   - Connects job posts, resumes, applications, and approvals

2. **job_publisher.nr**
   - Defines the `JobPost` structure with fields for title, company, location, etc.
   - Implements `hashJob()` function that creates a commitment to a job posting
   - Enables employers to publish jobs without revealing sensitive details

3. **cv_publisher.nr**
   - Defines the `Resume` structure with fields for name, skills, experience
   - Implements `hashResume()` function that creates a commitment to a resume
   - Allows candidates to submit credentials while preserving privacy

4. **apply.nr**
   - Defines the `Application` structure linking job and resume commitments
   - Implements `hashApplication()` to create a secure application commitment
   - Establishes a verifiable connection between candidates and job postings

5. **match.nr**
   - Implements the matching algorithm between job requirements and candidate skills
   - Computes a numerical score based on skill overlap
   - Ensures fair evaluation while keeping actual skills private

6. **approve.nr**
   - Defines the `Approval` structure for mutual consent
   - Implements `hashApproval()` to create a secure approval commitment
   - Enables identity revelation only when both parties consent

### Ethereum Smart Contracts (contracts/)

1. **MVPVerifier.sol**
   - ZKP verification interface
   - In production, would contain the compiled verification logic from Noir circuits
   - Currently a placeholder for demonstration purposes

2. **MVPBoard.sol**
   - Main platform contract that handles all on-chain interactions
   - Exposes functions for publishing jobs, submitting resumes, applications, and approvals
   - Emits events to track system activity while preserving privacy
   - Each function verifies the associated zero-knowledge proof

### Deployment and Testing (scripts/)

1. **deploy.js**
   - Handles deployment of smart contracts to Ethereum networks
   - Sets up the MVPBoard contract with the embedded verifier

## 🔄 System Workflow

The system operates through the following sequence:

1. **Job Publishing**
   - Employer creates a job posting with requirements and details
   - `job_publisher.nr` creates a commitment to this job
   - `MVPBoard.publishJob()` verifies the proof and publishes the commitment on-chain

2. **Resume Submission**
   - Candidate creates a resume with skills and experience
   - `cv_publisher.nr` creates a commitment to this resume
   - `MVPBoard.submitResume()` verifies the proof and submits the commitment on-chain

3. **Application Process**
   - Candidate applies to a job by creating a link between their resume and a job posting
   - `apply.nr` creates a commitment to this application
   - `main.nr` computes a match score using the algorithm in `match.nr`
   - `MVPBoard.apply()` verifies the proof, publishes the application commitment and match score

4. **Mutual Approval**
   - If both parties wish to proceed, they create an approval with their secrets
   - `approve.nr` creates a commitment to this approval
   - `MVPBoard.approve()` verifies the proof and records the mutual consent
   - After this step, parties can securely share their contact information off-chain

## 🛠️ Development Workflow

1. **Circuit Development**
   - Develop and test Noir circuits in the `src/` directory
   - Compile circuits: `nargo compile --acir target/mvp.acir`

2. **Verifier Generation**
   - Generate Solidity verifier: `nargo target/solidity-verifier target/mvp.acir --out contracts/MVPVerifier.sol`

3. **Smart Contract Deployment**
   - Deploy contracts: `npx hardhat run scripts/deploy.js --network <network>`

4. **Integration**
   - Frontend applications can interact with the deployed MVPBoard contract
   - Backend services can generate proofs for users using the compiled circuits

## 🔐 Privacy and Security Features

- **Zero-Knowledge Proofs**: All validations are done using ZKPs, revealing minimal information
- **Commitment-Based Privacy**: Only hash commitments are stored on-chain, not actual data
- **Secret Binding**: Employer and candidate secrets prevent correlation attacks
- **Selective Disclosure**: Personal information is shared only after mutual consent
- **Score Transparency**: Match scores are public while actual skills remain private

## 📊 Data Flow Diagram

```
┌────────────┐     ┌─────────────┐      ┌───────────────┐      ┌────────────┐
│  Employer  │     │  Candidate  │      │ ZKP Circuits  │      │ Blockchain │
└─────┬──────┘     └──────┬──────┘      └───────┬───────┘      └──────┬─────┘
      │                   │                     │                     │
      │ Create Job        │                     │                     │
      ├───────────────────┼─────────────┬──────▶                     │
      │                   │             │       │                     │
      │                   │             │       │  Generate Proof     │
      │                   │             │       ├────────────────────▶
      │                   │             │       │                     │
      │                   │             │       │                     │ Verify &
      │                   │             │       │                     │ Store
      │                   │             │       │                     ◄───┐
      │                   │             │       │                     │   │
      │                   │ Create CV   │       │                     │
      │                   ├─────────────┼───────▶                     │
      │                   │             │       │                     │
      │                   │             │       │  Generate Proof     │
      │                   │             │       ├────────────────────▶
      │                   │             │       │                     │
      │                   │             │       │                     │ Verify &
      │                   │             │       │                     │ Store
      │                   │             │       │                     ◄───┐
      │                   │             │       │                     │   │
      │                   │ Apply to Job│       │                     │
      │                   ├─────────────┼───────▶                     │
      │                   │             │       │                     │
      │                   │             │       │  Generate Proof     │
      │                   │             │       │  with Match Score   │
      │                   │             │       ├────────────────────▶
      │                   │             │       │                     │
      │                   │             │       │                     │ Verify &
      │                   │             │       │                     │ Store
      │                   │             │       │                     ◄───┐
      │ Review Application│             │       │                     │   │
      ◄───────────────────┼─────────────┼───────┼─────────────────────┘   │
      │                   │             │       │                     │
      │ Approve           │ Approve     │       │                     │
      ├───────────────────┼─────────────┼───────▶                     │
      │                   │             │       │                     │
      │                   │             │       │  Generate Proof     │
      │                   │             │       ├────────────────────▶
      │                   │             │       │                     │
      │                   │             │       │                     │ Verify &
      │                   │             │       │                     │ Store
      │                   │             │       │                     ◄───┐
      │                   │             │       │                     │   │
      │                   │             │       │                     │
      ▼                   ▼             ▼       ▼                     ▼
```

## 💡 Example Usage Scenario

1. A blockchain company wants to hire a ZK developer without revealing company details
2. A developer wants to apply without disclosing personal information or current employer
3. The employer publishes a job with encrypted details on the platform
4. The developer submits their anonymous resume with verified credentials
5. The matching algorithm computes a private match score
6. Both parties can see the score without revealing actual details
7. If they both approve, they can securely exchange contact information

---

This project demonstrates how zero-knowledge proofs can enable privacy-preserving workflows in job application platforms, addressing the need for credential verification without compromising personal data. 