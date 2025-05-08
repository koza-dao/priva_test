import { aztec } from "@aztec/noir";
use aztec::hash::pedersen_hash;

/**
 * @struct Application
 * @description Represents a job application linking a candidate's resume to a job posting
 * @field jobCommitment - The hash commitment of the job posting being applied to
 * @field resumeCommitment - The hash commitment of the candidate's resume
 * @field applicantSecret - A secret field known only to the applicant for this specific application
 * @field applicationCommitment - The expected commitment for this application (for verification)
 * @dev This structure preserves privacy by only referencing commitments rather than 
 *      actual job or resume data
 */
struct Application {
    jobCommitment: Field,
    resumeCommitment: Field,
    applicantSecret: Field,
    applicationCommitment: Field,
}

/**
 * @function hashApplication
 * @description Creates a cryptographic commitment of a job application using Pedersen hash
 * @param app - The Application instance containing job and resume commitments
 * @return - A single field value representing the commitment to this application
 * @dev This commitment binds a specific resume to a specific job posting while preserving
 *      the privacy of both. The applicant's secret prevents correlation of applications
 *      across different job postings.
 */
fn hashApplication(app: Application) -> Field {
    let mut input: [Field; 3] = [0; 3];
    input[0] = app.jobCommitment;
    input[1] = app.resumeCommitment;
    input[2] = app.applicantSecret;
    pedersen_hash(input)
}

/**
 * @function apply
 * @description Verifies the validity of an application commitment
 * @param app - The Application instance to verify
 * @dev This function ensures that the application commitment correctly references
 *      the job posting, preventing fraudulent applications. It throws an assertion error
 *      if verification fails.
 */
fn apply(app: Application) {
    let calc = hashApplication(app);
    assert(calc == app.applicationCommitment, "Invalid application commitment");
}

#[aztec::private]
fn create_application(
    jobCommitment: Field, 
    resumeCommitment: Field, 
    applicantSecret: Field,
    matchScore: Field
) -> Field {
    let app = Application { 
        jobCommitment, 
        resumeCommitment, 
        applicantSecret,
        applicationCommitment: Field::default() // Will be calculated
    };
    
    let commitment = hashApplication(app);
    aztec::emit("ApplicationCreated", commitment, matchScore);
    commitment
}