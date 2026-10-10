import type { ContactResponseStats } from '../../domain/entities/contact-response.entity';
import type { ContactResponseRepositoryPort } from '../../domain/repositories/contact-response.repository';

export type GetContactResponseStatsQueryDeps = {
  contactResponseRepository: ContactResponseRepositoryPort;
};

/**
 * Aggregated inbox KPIs for the admin Contact Responses UI.
 */
export class GetContactResponseStatsQuery {
  constructor(private readonly deps: GetContactResponseStatsQueryDeps) {}

  async execute(): Promise<ContactResponseStats> {
    return this.deps.contactResponseRepository.stats();
  }
}
