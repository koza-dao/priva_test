/**
 * @file matcher.nr
 * @description Implements the skills matching algorithm
 */

/**
 * @function compute_match
 * @description Calculates a match score between job requirements and candidate skills
 * @param job_req - Job requirements (as a bitfield)
 * @param skills - Candidate skills (as a bitfield)
 * @param experience - Years of experience
 * @return - A numerical score representing the match quality
 */
 #[public]
pub fn compute_match(job_req: Field, skills: Field, experience: Field) -> Field {
    ((job_req as u64 & skills as u64) as Field) + (experience / 10)
} 