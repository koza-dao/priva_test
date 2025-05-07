/**
 * @file main.nr
 * @description Main circuit implementation for the ZKP-enabled job application platform
 * @dev This file integrates all components of the system and defines the main proving circuit
 */

// Import all modular components of the system
import "job_publisher.nr";
import "cv_publisher.nr";
import "apply.nr";
import "match.nr";
import "approve.nr";

/**
 * @function main
 * @description The main zero-knowledge proof circuit that verifies the entire job application flow
 * 
 * @param job - The complete job posting data
 * @param jobSecret - Employer's secret for the job posting
 * @param jobCommitment - Public commitment to the job posting (output of hashJob)
 * 
 * @param resume - The complete resume/CV data
 * @param resumeSecret - Candidate's secret for the resume
 * @param resumeCommitment - Public commitment to the resume (output of hashResume)
 * 
 * @param applicantSecret - Candidate's secret for this specific application
 * @param applicationCommitment - Public commitment to the application (output of hashApplication)
 * 
 * @param employerSecret - Employer's secret for the approval process
 * @param approvalCommitment - Public commitment to the approval (output of hashApproval)
 * 
 * @param matchScore - Public output representing the computed match score between job and resume
 * 
 * @dev This circuit performs several key verifications:
 *      1. Confirms that job and resume commitments match their purported data
 *      2. Verifies that the application correctly links a specific job and resume
 *      3. Computes and outputs a match score based on skills alignment
 *      4. Validates the mutual approval process
 *      All of this is done while preserving privacy of both parties until mutual consent
 */
fn main(
    job: JobPost, jobSecret: Field, jobCommitment: pub Field,
    resume: Resume, resumeSecret: Field, resumeCommitment: pub Field,
    applicantSecret: Field, applicationCommitment: pub Field,
    employerSecret: Field, approvalCommitment: pub Field,
    matchScore: pub Field
) {
    // Verify job commitment matches the actual job data
    let calcJob = hashJob(job, jobSecret);
    assert(calcJob == jobCommitment);

    // Verify resume commitment matches the actual resume data
    let calcResume = hashResume(resume, resumeSecret);
    assert(calcResume == resumeCommitment);

    // Verify application commitment correctly links job and resume
    let app = Application { jobCommitment, resumeCommitment, applicantSecret };
    let calcApp = hashApplication(app);
    assert(calcApp == applicationCommitment);

    // Compute and output the match score between job and resume
    matchScore = computeMatch(job, resume);

    // Verify approval commitment represents mutual consent
    let approval = Approval { applicationCommitment, employerSecret, applicantSecret };
    let calcApproval = hashApproval(approval);
    assert(calcApproval == approvalCommitment);
}