import { AztecAddress, CompleteAddress, FieldLike } from '@aztec/foundation/fields';
import { ContractArtifact, ContractBase } from '@aztec/foundation/contracts';

/**
 * TypeScript interface for the MVPBoard contract
 */
export class MVPBoardContract extends ContractBase {
  /**
   * Creates a new MVPBoardContract instance
   * @param contractAddress - The address of the deployed contract
   * @param artifact - The contract artifact (JSON)
   */
  constructor(contractAddress: AztecAddress | CompleteAddress, artifact: ContractArtifact) {
    super(contractAddress, artifact);
  }

  /**
   * Publishes a job
   * @param title - Job title
   * @param company - Company name
   * @param requirements - Job requirements
   * @returns A hash representing the job posting
   */
  async publishJob(title: FieldLike, company: FieldLike, requirements: FieldLike): Promise<bigint> {
    const result = await this.methods.publish_job(title, company, requirements);
    return result.toString();
  }
}

/**
 * Helper function to load the MVPBoard contract
 * @param contractAddress - The address of the deployed contract
 * @returns A MVPBoardContract instance
 */
export async function loadMVPBoardContract(contractAddress: AztecAddress | CompleteAddress): Promise<MVPBoardContract> {
  // Load the artifact from the JSON file
  const artifact = require('../target/mvp_project-MVPBoard.json');
  return new MVPBoardContract(contractAddress, artifact);
} 