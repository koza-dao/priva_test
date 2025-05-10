# PRIVA - Anonymous & Verifiable Web3 Work Identity Platform

## 🌐 Overview
PRIVA is a zk-powered, privacy-first hiring platform for Web3 developers who want to prove their real contributions and professional reputation without revealing personal identity. By combining Zero-Knowledge Proofs (ZKPs), Decentralized Identifiers (DIDs), and verifiable on-chain activity, PRIVA creates trustful yet anonymous bridges between developers and hiring organizations.

## 🚩 Problem
Web3 developers increasingly avoid job applications due to forced identity exposure and unverifiable employer credibility. According to ConsenSys 2023 Developer Report:

- **62% of Web3 developers** hesitate to apply for jobs that require revealing their real identity.
- **70% of CVs** include misleading or unverifiable information.
- **86% of candidates** research a company via employee reviews before applying.

Current job platforms (e.g., LinkedIn, AngelList) fail to ensure privacy and on-chain credibility.

## 🔍 Solution
PRIVA empowers developers to:

- Prove credentials via zkJWT, zkEmail, or zkCertificates without exposing personal data
- Aggregate on-chain developer signals (testnet activity, DAOs, GitHub commits)
- Receive and give **anonymous company feedback** using privacy-preserving zkProofs

### For Employers:
- Validate applicant skills through verifiable credentials and on-chain proofs
- Access pseudonymous but reputation-backed talent pool
- Reduce hiring time via instant credential verification

## 🔧 Tech Stack
- **Smart Contracts**: Noir zkProofs + Aztec compatibility (zkEmail, zkJWT circuits)
- **Frontend**: NextJS + TailwindCSS
- **Wallet Auth**: Ethereum (EOA), zkLogin & World compatible

## frontend repo - https://github.com/koza-dao/frontend

## 🧪 Key Features
- 🔐 **Anonymous Application**: Prove reputation, hide identity  
- ✅ **Verifiable Credentials**: On-chain proof of skill, off-chain zkCerts  
- 💬 **Anonymous Company Reviews**: zk-proof of employment + anonymous feedback  
- ⛓ **Testnet Indexing**: Developer's on-chain activity fetcher  

## 📊 Impact Metrics
- **30% faster hiring** (via DID & VC pilot programs in EU)  
- **46% less bias** when using anonymous applications (NBER)  
- **+30% engagement** from passive candidates when anonymity is preserved (GoGig)  

## 📚 Future Roadmap
Our long-term vision is to evolve PRIVA beyond hiring, into a decentralized professional network for developers — enabling authentic, privacy-respecting collaboration, reputation building, and opportunity discovery.

- [ ] **Modular zkResume Builder**: Allow users to compose zero-knowledge based resumes with verifiable modules.
- [ ] **Reputation Layer**: On-chain developer scoring system based on activity, endorsements, and feedback.
- [ ] **DAO/Org Network Layer**: Enabling devs to explore and join DAOs, guilds or collectives based on privacy-preserving reputation.
- [ ] **zkSocial Graph**: A cryptographic layer to map meaningful, verifiable connections between users without disclosing identities.
- [ ] **Private Messaging**: End-to-end encrypted messaging with zk identity verification.
- [ ] **Public Credential Explorer**: Developers can optionally publish verifiable skills/experience sets for community recognition.

## 📄 License
MIT License

## ✍️ Contributors
- Tugay Sönmez - Research
- Ebubekir Rüzgar - Frontend
- Emre Gülünk, Fatmanur Özçetin - Contract
- Ömer Aksu - Design

## 📎 References
- ConsenSys Web3 Developer Survey 2023  
- NBER Anonymous Hiring Study  
- Dock.io VC Tech Blog  
- Select Software Reviews (Hiring with VCs)  
- ETHGlobal zkCV hackathon submissions  



---

*PRIVA is built during NoirHack 2025 to demonstrate how privacy and verifiability can co-exist in Web3 hiring.*
