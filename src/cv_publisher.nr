use std::hash::pedersen_hash;

/**
 * @struct Resume
 * @description Represents a candidate's resume in the ZKP-enabled job application system
 * @field name - String representation of candidate's name (32 fields for characters)
 * @field skills - Array of 10 skills, each represented as 32-character strings
 * @field experienceYears - Total years of professional experience
 * @dev This structure abstracts the personal information while still providing
 *      essential data for job matching algorithms
 */
struct Resume {
    name: [Field; 32],
    skills: [[Field; 32]; 10],
    experienceYears: Field,
}

/**
 * @function hashResume
 * @description Creates a cryptographic commitment of a resume using Pedersen hash
 * @param resume - The Resume instance containing all candidate details
 * @param secret - A secret field known only to the candidate to ensure privacy
 * @return - A single field value representing the commitment to this resume
 * @dev This function flattens the resume structure into an array suitable for
 *      hashing. The candidate's secret ensures that even identical resumes
 *      would produce different commitments, preserving privacy and preventing
 *      correlation attacks
 */
fn hashResume(resume: Resume, secret: Field) -> Field {
    let mut input: [Field; 354] = [0; 354];
    input[0] = secret;
    for i in 0..32 {
        input[i + 1] = resume.name[i];
    }
    for i in 0..10 {
        for j in 0..32 {
            input[33 + i*32 + j] = resume.skills[i][j];
        }
    }
    input[353] = resume.experienceYears;
    pedersen_hash(input)
}