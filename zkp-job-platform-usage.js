/**
 * ZKP-Enabled Web3 Job Application Platform
 * Usage Example
 */

// Import the library
const { ZKPJobPlatform, initializeZKPPlatform, MVPBoardABI } = require('./zkp-job-platform.js');

// DOM Elements
let platform;
let currentAccount;
let jobCommitment;
let resumeCommitment;
let applicationCommitment;
let jobPost;
let resume;
let application;

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize UI elements
  const connectButton = document.getElementById('connect-wallet');
  const jobForm = document.getElementById('job-form');
  const resumeForm = document.getElementById('resume-form');
  const applyForm = document.getElementById('apply-form');
  const approveForm = document.getElementById('approve-form');
  const statusDiv = document.getElementById('status');
  
  // Connect wallet button
  connectButton.addEventListener('click', async () => {
    try {
      platform = await initializeZKPPlatform();
      currentAccount = await platform.signer.getAddress();
      statusDiv.innerHTML = `Connected: ${currentAccount}`;
      connectButton.disabled = true;
      
      // Start listening for events
      setupEventListeners();
    } catch (error) {
      statusDiv.innerHTML = `Error: ${error.message}`;
    }
  });
  
  // Job Form Submission
  jobForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    statusDiv.innerHTML = 'Creating job posting, please wait...';
    
    try {
      const title = document.getElementById('job-title').value;
      const company = document.getElementById('job-company').value;
      const location = document.getElementById('job-location').value;
      const requirementsText = document.getElementById('job-requirements').value;
      const requirements = requirementsText.split(',').map(item => item.trim());
      const salary = document.getElementById('job-salary').value;
      const minLevel = document.getElementById('job-min-level').value;
      const secret = document.getElementById('job-secret').value;
      
      // Execute complete job publishing workflow
      const result = await platform.workflowPublishJob(
        title, company, location, requirements, salary, minLevel, secret
      );
      
      // Store job post data locally (would normally be encrypted and stored securely)
      jobPost = platform.createJobPost(title, company, location, requirements, salary, minLevel);
      jobCommitment = result.jobCommitment;
      
      statusDiv.innerHTML = `Job posted successfully! Commitment: ${jobCommitment}`;
      document.getElementById('job-commitment-display').innerText = jobCommitment;
    } catch (error) {
      statusDiv.innerHTML = `Error posting job: ${error.message}`;
    }
  });
  
  // Resume Form Submission
  resumeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    statusDiv.innerHTML = 'Creating resume, please wait...';
    
    try {
      const name = document.getElementById('resume-name').value;
      const skillsText = document.getElementById('resume-skills').value;
      const skills = skillsText.split(',').map(item => item.trim());
      const experienceYears = document.getElementById('resume-experience').value;
      const secret = document.getElementById('resume-secret').value;
      
      // Execute complete resume submission workflow
      const result = await platform.workflowSubmitResume(
        name, skills, experienceYears, secret
      );
      
      // Store resume data locally (would normally be encrypted and stored securely)
      resume = platform.createResume(name, skills, experienceYears);
      resumeCommitment = result.resumeCommitment;
      
      statusDiv.innerHTML = `Resume submitted successfully! Commitment: ${resumeCommitment}`;
      document.getElementById('resume-commitment-display').innerText = resumeCommitment;
    } catch (error) {
      statusDiv.innerHTML = `Error submitting resume: ${error.message}`;
    }
  });
  
  // Apply Form Submission
  applyForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    statusDiv.innerHTML = 'Creating application, please wait...';
    
    try {
      const jobCommitmentValue = document.getElementById('apply-job-commitment').value || jobCommitment;
      const resumeCommitmentValue = document.getElementById('apply-resume-commitment').value || resumeCommitment;
      const secret = document.getElementById('apply-secret').value;
      
      // Check if we have the job and resume data
      if (!jobPost || !resume) {
        throw new Error('Missing job or resume data. Please create them first or load from storage.');
      }
      
      // Execute complete application workflow
      const result = await platform.workflowApplyToJob(
        jobPost, resume, jobCommitmentValue, resumeCommitmentValue, secret
      );
      
      // Store application data locally
      application = platform.createApplication(jobCommitmentValue, resumeCommitmentValue, secret);
      applicationCommitment = result.applicationCommitment;
      
      statusDiv.innerHTML = `Application submitted successfully! Commitment: ${applicationCommitment}, Match Score: ${result.matchScore}`;
      document.getElementById('application-commitment-display').innerText = applicationCommitment;
      document.getElementById('match-score-display').innerText = result.matchScore;
    } catch (error) {
      statusDiv.innerHTML = `Error applying to job: ${error.message}`;
    }
  });
  
  // Approve Form Submission
  approveForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    statusDiv.innerHTML = 'Creating approval, please wait...';
    
    try {
      const applicationCommitmentValue = document.getElementById('approve-application-commitment').value || applicationCommitment;
      const employerSecret = document.getElementById('approve-employer-secret').value;
      const applicantSecret = document.getElementById('approve-applicant-secret').value;
      
      // Check if we have the job, resume, and application data
      if (!jobPost || !resume || !application) {
        throw new Error('Missing job, resume, or application data. Please create them first or load from storage.');
      }
      
      // Execute complete approval workflow
      const result = await platform.workflowApprove(
        jobPost, resume, application, applicationCommitmentValue, employerSecret, applicantSecret
      );
      
      statusDiv.innerHTML = `Approval submitted successfully! Commitment: ${result.approvalCommitment}`;
      document.getElementById('approval-commitment-display').innerText = result.approvalCommitment;
      
      // At this point, both parties would exchange contact information off-chain
      document.getElementById('contact-info-section').style.display = 'block';
    } catch (error) {
      statusDiv.innerHTML = `Error approving application: ${error.message}`;
    }
  });
});

// Setup blockchain event listeners
function setupEventListeners() {
  const eventsDiv = document.getElementById('events');
  
  // Listen for job postings
  platform.listenForJobs((job) => {
    const jobElement = document.createElement('div');
    jobElement.className = 'event-item';
    jobElement.innerHTML = `<strong>New Job Posted:</strong> Commitment: ${job.jobCommitment}`;
    eventsDiv.appendChild(jobElement);
  });
  
  // Listen for resume submissions
  platform.listenForResumes((resume) => {
    const resumeElement = document.createElement('div');
    resumeElement.className = 'event-item';
    resumeElement.innerHTML = `<strong>New Resume Submitted:</strong> Commitment: ${resume.resumeCommitment}`;
    eventsDiv.appendChild(resumeElement);
  });
  
  // Listen for applications
  platform.listenForApplications((application) => {
    const applicationElement = document.createElement('div');
    applicationElement.className = 'event-item';
    applicationElement.innerHTML = `<strong>New Application:</strong> Commitment: ${application.applicationCommitment}, Match Score: ${application.matchScore}`;
    eventsDiv.appendChild(applicationElement);
  });
  
  // Listen for approvals
  platform.listenForApprovals((approval) => {
    const approvalElement = document.createElement('div');
    approvalElement.className = 'event-item';
    approvalElement.innerHTML = `<strong>New Approval:</strong> Commitment: ${approval.approvalCommitment}`;
    eventsDiv.appendChild(approvalElement);
  });
}

// Helper function to save objects to local storage
function saveToLocalStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Helper function to load objects from local storage
function loadFromLocalStorage(key) {
  const value = localStorage.getItem(key);
  return value ? JSON.parse(value) : null;
}

// Helper function to display humanized match score
function displayMatchScore(score) {
  const numScore = Number(score);
  if (numScore >= 8) return 'Excellent Match';
  if (numScore >= 6) return 'Good Match';
  if (numScore >= 4) return 'Fair Match';
  return 'Poor Match';
} 