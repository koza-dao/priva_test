/**
 * @file job_publisher.nr
 * @description Functions for publishing job postings
 */

/**
 * @function publish_job
 * @description Creates a simple hash for job posting
 * @param title - Job title
 * @param company - Company name
 * @param requirements - Job requirements
 * @return - A hash representing the job posting
 */
 #[public]
pub fn publish_job(title: Field, company: Field, requirements: Field) -> Field { 
    title + company + requirements 
} 