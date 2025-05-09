/**
 * @file main.nr
 * @description Main contract implementation for the ZKP-enabled job application platform
 */

use dep::std;

// Basic structures for jobs and resumes
struct JobPost {
    title: Field, 
    company: Field, 
    requirements: Field
}

struct Resume {
    name: Field, 
    skills: Field, 
    experience: Field
}

contract MVPBoard {
    // Function for publishing a job posting
    pub fn publish_job(title: Field, company: Field, requirements: Field) -> pub Field { 
        // Create job hash
        let job_hash = title + company + requirements;
        
        // Return job hash
        job_hash
    }
    
    // Function for submitting a resume
    pub fn submit_resume(name: Field, skills: Field, experience: Field) -> pub Field { 
        // Create resume hash
        let resume_hash = name + skills + experience;
        
        // Return resume hash
        resume_hash
    }
    
    // Function for computing a match score
    pub fn compute_match(job_req: Field, skills: Field, experience: Field) -> pub Field {
        // Calculate match score
        let match_score = ((job_req as u64 & skills as u64) as Field) + (experience / 10);
        
        // Return match score
        match_score
    }
}

#[test]
fn test_publish_job() {
    let title = 1;
    let company = 2;
    let requirements = 3;
    
    let hash = MVPBoard::publish_job(title, company, requirements);
    assert(hash == 6);
}

#[test]
fn test_submit_resume() {
    let name = 10;
    let skills = 20;
    let experience = 30;
    
    let hash = MVPBoard::submit_resume(name, skills, experience);
    assert(hash == 60);
}

#[test]
fn test_matching() {
    let job_req = 7; // Binary: 111
    let skills = 6;  // Binary: 110
    let experience = 20;
    
    let score = MVPBoard::compute_match(job_req, skills, experience);
    assert(score == 8); // (6 & 7) + (20/10) = 6 + 2 = 8
}
