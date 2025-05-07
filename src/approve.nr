use std::hash::pedersen_hash;

/**
 * @struct Approval
 * @description Represents a mutual agreement between employer and candidate
 * @field applicationCommitment - The hash commitment of the original application
 * @field employerSecret - A secret field known only to the employer for this approval
 * @field applicantSecret - A secret field known only to the applicant for this approval
 * @dev This structure represents the final stage of the job application process where
 *      both parties agree to proceed, enabling the sharing of actual contact information
 */
struct Approval {
    applicationCommitment: Field,
    employerSecret: Field,
    applicantSecret: Field,
}

/**
 * @function hashApproval
 * @description Creates a cryptographic commitment of an approval using Pedersen hash
 * @param a - The Approval instance containing application reference and both parties' secrets
 * @return - A single field value representing the commitment to this approval
 * @dev This commitment binds both the employer and candidate to a specific application
 *      while preserving privacy. The inclusion of both secrets ensures that the approval
 *      is mutual and consensual.
 */
fn hashApproval(a: Approval) -> Field {
    let mut input: [Field; 3] = [0; 3];
    input[0] = a.applicationCommitment;
    input[1] = a.employerSecret;
    input[2] = a.applicantSecret;
    pedersen_hash(input)
}

/**
 * @function approve
 * @description Verifies the validity of an approval commitment
 * @param a - The Approval instance to verify
 * @dev This function ensures that the approval commitment correctly references
 *      the application, preventing fraudulent approvals. It throws an assertion error
 *      if verification fails.
 */
fn approve(a: Approval) {
    let calc = hashApproval(a);
    assert(calc == a.applicationCommitment, "Invalid approval commitment");
}