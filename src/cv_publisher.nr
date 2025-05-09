/**
 * @file cv_publisher.nr
 * @description Functions for submitting resumes
 */

/**
 * @function submit_resume
 * @description Creates a simple hash for resume
 * @param name - Candidate name
 * @param skills - Candidate skills
 * @param experience - Years of experience
 * @return - A hash representing the resume
 */
 #[public]
pub fn submit_resume(name: Field, skills: Field, experience: Field) -> Field { 
    name + skills + experience 
} 