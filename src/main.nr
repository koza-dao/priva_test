/**
 * @file main.nr
 * @description Main circuit implementation for the ZKP-enabled job application platform on Aztec
 * @dev This file integrates all components of the system and defines the main proving circuit
 */

// Import Aztec and all modular components of the system
import { aztec } from "@aztec/noir";
import "job_publisher.nr";
import "cv_publisher.nr";
import "apply.nr";
import "match.nr";
import "approve.nr";

/**
 * @module MVPBoard
 * @description Main contract module for the ZKP job platform on Aztec Network
 */
contract MVPBoard {
    /**
     * @function publishJob
     * @description Public entry point for publishing a job posting
     * @dev This function is marked private in Aztec context, meaning the data is encrypted
     */
    #[aztec::private]
    fn publishJob(
        job: JobPost, 
        secret: Field
    ) -> Field {
        publish_job(job, secret)
    }

    /**
     * @function submitResume
     * @description Public entry point for submitting a resume/CV
     * @dev This function is marked private in Aztec context, meaning the data is encrypted
     */
    #[aztec::private]
    fn submitResume(
        resume: Resume, 
        secret: Field
    ) -> Field {
        submit_resume(resume, secret)
    }

    /**
     * @function apply
     * @description Public entry point for applying to a job
     * @dev This function combines multiple steps: application creation and match score calculation
     */
    #[aztec::private]
    fn apply(
        job: JobPost,
        resume: Resume,
        jobCommitment: Field,
        resumeCommitment: Field,
        applicantSecret: Field
    ) -> (Field, Field) {
        // Verify job commitment matches the actual job data
        let calcJob = hashJob(job, applicantSecret); // In real impl, this would use jobSecret
        assert(calcJob == jobCommitment, "Invalid job commitment");

        // Verify resume commitment matches the actual resume data
        let calcResume = hashResume(resume, applicantSecret); // In real impl, this would use resumeSecret
        assert(calcResume == resumeCommitment, "Invalid resume commitment");

        // Compute match score
        let matchScore = compute_match_score(job, resume);
        
        // Create application
        let applicationCommitment = create_application(jobCommitment, resumeCommitment, applicantSecret, matchScore);
        
        (applicationCommitment, matchScore)
    }

    /**
     * @function approve
     * @description Public entry point for mutual approval
     * @dev This function verifies the application and creates an approval commitment
     */
    #[aztec::private]
    fn approve(
        applicationCommitment: Field,
        employerSecret: Field,
        applicantSecret: Field
    ) -> Field {
        create_approval(applicationCommitment, employerSecret, applicantSecret)
    }
}

// Legacy main function for backward compatibility
#[aztec::private]
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
    let app = Application { 
        jobCommitment, 
        resumeCommitment, 
        applicantSecret,
        applicationCommitment 
    };
    let calcApp = hashApplication(app);
    assert(calcApp == applicationCommitment);

    // Compute and output the match score between job and resume
    matchScore = computeMatch(job, resume);

    // Verify approval commitment represents mutual consent
    let approval = Approval { 
        applicationCommitment, 
        employerSecret, 
        applicantSecret,
        approvalCommitment 
    };
    let calcApproval = hashApproval(approval);
    assert(calcApproval == approvalCommitment);
}