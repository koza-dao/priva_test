/**
 * ZKP Job Platform - Aztec Frontend Application
 * 
 * This file serves as a bridge between the HTML UI and the TypeScript Aztec integration library.
 * In a production environment, you would use a proper build system like Webpack to bundle this.
 */

import { initializeZKPPlatformAztec, ZKPJobPlatformConfig } from './zkp-job-platform-aztec.ts';

// Global variables
let platform = null;
let jobCommitment = null;
let resumeCommitment = null;
let applicationCommitment = null;

// Initialize the platform
async function connectToAztec(privateKey, contractAddress) {
    try {
        const config = {
            privateKey: privateKey || undefined,
            mvpBoardAddress: contractAddress || undefined
        };
        
        platform = await initializeZKPPlatformAztec(config);
        
        return {
            success: true,
            wallet: platform.wallet.getAddress().toString(),
            contractAddress: platform.mvpBoardAddress
        };
    } catch (error) {
        console.error('Error connecting to Aztec:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Post a job
async function publishJob(title, company, location, requirements, salary, minLevel, secret) {
    try {
        const result = await platform.publishJob(
            title,
            company,
            location,
            requirements.split(',').map(req => req.trim()),
            parseInt(salary),
            parseInt(minLevel),
            secret
        );
        
        jobCommitment = result.jobCommitment;
        return {
            success: true,
            jobCommitment: result.jobCommitment,
            txHash: result.txHash
        };
    } catch (error) {
        console.error('Error publishing job:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Submit a resume
async function submitResume(name, skills, experienceYears, secret) {
    try {
        const result = await platform.submitResume(
            name,
            skills.split(',').map(skill => skill.trim()),
            parseInt(experienceYears),
            secret
        );
        
        resumeCommitment = result.resumeCommitment;
        return {
            success: true,
            resumeCommitment: result.resumeCommitment,
            txHash: result.txHash
        };
    } catch (error) {
        console.error('Error submitting resume:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Apply to a job
async function applyToJob(jobCommitmentValue, resumeCommitmentValue, applicantSecret) {
    try {
        // We need to pass mock objects for job and resume since we don't have the actual data
        // In a real application, you'd need to store these or fetch them
        const mockJob = {
            title: "Mock Job",
            company: "Mock Company",
            location: "Mock Location",
            requirements: ["Requirement1", "Requirement2"],
            salary: 100000,
            minLevel: 3
        };
        
        const mockResume = {
            name: "Mock Name",
            skills: ["Skill1", "Skill2"],
            experienceYears: 5
        };
        
        const result = await platform.applyToJob(
            mockJob,
            mockResume,
            jobCommitmentValue,
            resumeCommitmentValue,
            applicantSecret
        );
        
        applicationCommitment = result.applicationCommitment;
        return {
            success: true,
            applicationCommitment: result.applicationCommitment,
            matchScore: result.matchScore,
            txHash: result.txHash
        };
    } catch (error) {
        console.error('Error applying to job:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Approve an application
async function approveApplication(applicationCommitmentValue, employerSecret, applicantSecret) {
    try {
        const result = await platform.approve(
            applicationCommitmentValue,
            employerSecret,
            applicantSecret
        );
        
        return {
            success: true,
            approvalCommitment: result.approvalCommitment,
            txHash: result.txHash
        };
    } catch (error) {
        console.error('Error approving application:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Subscribe to events
function subscribeToEvents() {
    if (!platform) return;
    
    platform.subscribeToEvents({
        onJobPublished: (jobCommitment) => {
            console.log('New job published:', jobCommitment);
        },
        onResumeSubmitted: (resumeCommitment) => {
            console.log('New resume submitted:', resumeCommitment);
        },
        onApplicationCreated: (applicationCommitment, matchScore) => {
            console.log('New application created:', applicationCommitment, 'Match score:', matchScore);
        },
        onApprovalCreated: (approvalCommitment) => {
            console.log('New approval created:', approvalCommitment);
        }
    });
}

// Unsubscribe from events
function unsubscribeFromEvents() {
    if (!platform) return;
    platform.unsubscribeFromEvents();
}

// Export functions for use in HTML
window.zkpPlatform = {
    connectToAztec,
    publishJob,
    submitResume,
    applyToJob,
    approveApplication,
    subscribeToEvents,
    unsubscribeFromEvents
}; 