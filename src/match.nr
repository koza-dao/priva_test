/**
 * @file match.nr
 * @description Implements the skills matching algorithm between job postings and resumes
 */
import { aztec } from "@aztec/noir";

/**
 * @struct JobPost
 * @description Simplified job posting structure used only for matching calculations
 * @field requirements - Array of 10 required skills, each as 32-character strings
 * @dev This is a reduced version of the full JobPost struct, containing only the fields
 *      necessary for the matching algorithm
 */
struct JobPost { requirements: [[Field; 32]; 10] }

/**
 * @struct Resume
 * @description Simplified resume structure used only for matching calculations
 * @field skills - Array of 10 candidate skills, each as 32-character strings
 * @dev This is a reduced version of the full Resume struct, containing only the fields
 *      necessary for the matching algorithm
 */
struct Resume { skills: [[Field; 32]; 10] }

/**
 * @function computeMatch
 * @description Calculates a matching score between a job posting and a resume
 * @param job - The JobPost instance containing required skills
 * @param resume - The Resume instance containing candidate skills
 * @return - A numerical score representing how well the candidate matches the job
 * @dev The algorithm counts the number of exact matches between job requirements and
 *      candidate skills. Each matching skill adds 1 point to the score. The maximum
 *      possible score is 10 (if all skills match). This function operates in a privacy-
 *      preserving manner as part of a zero-knowledge proof.
 */
fn computeMatch(job: JobPost, resume: Resume) -> Field {
    let mut score: Field = 0;
    for i in 0..10 {
        for j in 0..10 {
            if job.requirements[i] == resume.skills[j] {
                score = score + 1;
            }
        }
    }
    score
}

#[aztec::private]
fn compute_match_score(job: JobPost, resume: Resume) -> Field {
    let score = computeMatch(job, resume);
    aztec::emit("MatchScoreComputed", score);
    score
}