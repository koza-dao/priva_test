# ZKP Job Platform - Aztec Network Implementation

This project implements a Zero-Knowledge Proof (ZKP) enabled job application platform on the Aztec Network. It allows for private job postings, private resume submissions, confidential job applications, and secure mutual approvals, all leveraging the privacy capabilities of zero-knowledge proofs.

## Features

- **Private Job Postings**: Employers can post jobs with requirements and qualifications that are kept confidential
- **Private Resume Submissions**: Job seekers can submit their credentials without revealing them publicly
- **Zero-Knowledge Job Applications**: Apply for jobs while keeping your information private
- **Match Score Calculation**: Applications compute a match score using zero-knowledge proofs
- **Mutual Approval**: Both employers and applicants can approve matches securely

## Project Structure

- `contracts/` - Aztec contracts, specifically the MVPBoard contract
- `src/` - Noir circuits for the zero-knowledge proofs
- `zkp-job-platform-aztec.ts` - TypeScript integration library for the frontend
- `deploy-aztec.ts` - Deployment script for the Aztec contract
- `index.html` - Simple demo frontend for testing

## Prerequisites

- Node.js 16 or higher
- npm or yarn
- Familiarity with Typescript and Aztec Network

## Setup Instructions

1. Clone this repository:
   ```
   git clone https://github.com/yourusername/zkp-job-platform-aztec.git
   cd zkp-job-platform-aztec
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file (based on `.env.example`) and add your private key (if you have one):
   ```
   PRIVATE_KEY=your_private_key_here
   AZTEC_SERVER_URL=https://api.aztec.network/aztec-connect-testnet/falafel
   ```

4. Deploy the contract to Aztec testnet:
   ```
   npm run deploy
   ```

5. Open the demo frontend:
   ```
   npx serve .
   ```
   Then open http://localhost:5000 in your browser.

## Using the Platform

### For Employers

1. Post a job with details and a secret code
2. Receive a job commitment hash that can be shared
3. Review and approve applications

### For Job Seekers

1. Submit your resume with skills and a secret code
2. Receive a resume commitment hash
3. Apply to jobs using the job commitment and your resume commitment
4. If approved, you'll get an approval commitment

## Development

### Building the Project

```
npm run build
```

### Running Tests

```
npm test
```

## How it Works

The platform uses zero-knowledge proofs built with Noir and deployed to Aztec Network. Here's the basic flow:

1. Employers create job posts, which generate a commitment hash
2. Job seekers create resume entries, also generating a commitment hash
3. When applying, the system calculates a match score in zero-knowledge
4. Both parties can approve matches without revealing private information

## License

This project is licensed under the MIT License - see the LICENSE file for details.
