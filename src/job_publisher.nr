use std::hash::pedersen_hash;

/**
 * @struct JobPost
 * @description Represents a job posting in the ZKP-enabled job board system.
 * @field title - String representation of job title (32 fields for characters)
 * @field company - String representation of company name (32 fields for characters)
 * @field location - String representation of job location (32 fields for characters)
 * @field requirements - Array of 10 skills/requirements, each as 32-character strings
 * @field salary - Numerical representation of the offered salary
 * @field minLevel - Minimum experience level required for the position
 */
struct JobPost {
    title: [Field; 32],
    company: [Field; 32],
    location: [Field; 32],
    requirements: [[Field; 32]; 10],
    salary: Field,
    minLevel: Field,
}

/**
 * @function hashJob
 * @description Creates a cryptographic commitment of a job posting using Pedersen hash
 * @param job - The JobPost instance containing all job details
 * @param secret - A secret field known only to the employer to ensure privacy
 * @return - A single field value representing the commitment to this job posting
 * @dev This function transforms the job data structure into a flat array suitable for 
 *      hashing while preserving the job's content. The employer's secret is included
 *      to prevent others from recreating the same commitment with identical job data.
 */
fn hashJob(job: JobPost, secret: Field) -> Field {
    let mut input: [Field; 676] = [0; 676];
    input[0] = secret;
    for i in 0..32 {
        input[i + 1] = job.title[i];
        input[i + 33] = job.company[i];
        input[i + 65] = job.location[i];
    }
    for i in 0..10 {
        for j in 0..32 {
            input[97 + i*32 + j] = job.requirements[i][j];
        }
    }
    input[674] = job.salary;
    input[675] = job.minLevel;
    pedersen_hash(input)
}