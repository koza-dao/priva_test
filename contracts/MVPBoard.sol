// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./MVPVerifier.sol";

/**
 * @title MVPBoard
 * @dev Main smart contract for the ZKP-enabled job application platform
 * @notice This contract manages the entire job application flow while preserving privacy
 * @author MVP Project Team
 */
 
contract MVPBoard is MVPVerifier {
    /**
     * @dev Emitted when a new job posting is published
     * @param jobCommitment The cryptographic commitment representing the job posting
     * @notice Only the commitment is stored on-chain, preserving the privacy of job details
     */
    event JobPublished(uint256 jobCommitment);
    
    /**
     * @dev Emitted when a new resume is submitted to the platform
     * @param resumeCommitment The cryptographic commitment representing the resume
     * @notice Only the commitment is stored on-chain, preserving the privacy of resume details
     */
    event ResumeSubmitted(uint256 resumeCommitment);
    
    /**
     * @dev Emitted when a candidate applies to a job
     * @param applicationCommitment The cryptographic commitment representing the application
     * @param matchScore The calculated match score between the job and resume
     * @notice The match score is public, but the specific matching criteria remain private
     */
    event ApplicationCreated(uint256 applicationCommitment, uint256 matchScore);
    
    /**
     * @dev Emitted when both employer and candidate approve an application
     * @param approvalCommitment The cryptographic commitment representing mutual approval
     * @notice This event signals that both parties have consented to share information
     */
    event ApprovalDone(uint256 approvalCommitment);

    /**
     * @dev Publishes a new job posting to the platform
     * @param proof The zero-knowledge proof verifying the job posting's validity
     * @param pubInputs Array of public inputs for the ZKP verification [jobCommitment]
     * @return true if the operation was successful
     * @notice The actual job details remain private, only the commitment is published
     */
    function publishJob(bytes calldata proof, uint256[] calldata pubInputs) external {
        require(verify(proof, pubInputs), "Invalid ZK proof");
        emit JobPublished(pubInputs[0]);
    }

    /**
     * @dev Submits a new resume to the platform
     * @param proof The zero-knowledge proof verifying the resume's validity
     * @param pubInputs Array of public inputs for the ZKP verification [0, resumeCommitment]
     * @return true if the operation was successful
     * @notice The actual resume details remain private, only the commitment is published
     */
    function submitResume(bytes calldata proof, uint256[] calldata pubInputs) external {
        require(verify(proof, pubInputs), "Invalid ZK proof");
        emit ResumeSubmitted(pubInputs[1]);
    }

    /**
     * @dev Creates a new application linking a resume to a job posting
     * @param proof The zero-knowledge proof verifying the application's validity
     * @param pubInputs Array of public inputs [0, 1, applicationCommitment, matchScore]
     * @return true if the operation was successful
     * @notice This function also outputs the calculated match score while keeping
     *         the specific matching criteria private
     */
    function apply(bytes calldata proof, uint256[] calldata pubInputs) external {
        require(verify(proof, pubInputs), "Invalid ZK proof");
        emit ApplicationCreated(pubInputs[2], pubInputs[3]);
    }

    /**
     * @dev Records mutual approval from both employer and candidate
     * @param proof The zero-knowledge proof verifying both parties' consent
     * @param pubInputs Array of public inputs [0, 1, 2, 3, approvalCommitment]
     * @return true if the operation was successful
     * @notice This is the final step that enables information sharing between parties
     */
    function approve(bytes calldata proof, uint256[] calldata pubInputs) external {
        require(verify(proof, pubInputs), "Invalid ZK proof");
        emit ApprovalDone(pubInputs[4]);
    }
}