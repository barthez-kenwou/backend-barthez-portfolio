import type { NewsletterStats } from '../../domain/entities/newsletter.entity';
import type {
  NewsletterCampaignStatus,
  NewsletterCampaignType,
  NewsletterLocale,
  NewsletterStatus,
} from '../../domain/entities/newsletter.entity';
import { NewsletterSubscriberNotFoundError } from '../../domain/errors/newsletter.errors';
import type {
  NewsletterCampaignRepositoryPort,
  NewsletterSubscriberRepositoryPort,
} from '../../domain/repositories/newsletter.repository';
import type { ListNewsletterSubscribersDto } from '../dto/newsletter.dto';

export class GetNewsletterSubscriberQuery {
  constructor(
    private readonly deps: { subscriberRepository: NewsletterSubscriberRepositoryPort },
  ) {}

  async execute(id: string) {
    const row = await this.deps.subscriberRepository.findById(id);
    if (!row) throw new NewsletterSubscriberNotFoundError();
    return row;
  }
}

export class ListNewsletterSubscribersQuery {
  constructor(
    private readonly deps: { subscriberRepository: NewsletterSubscriberRepositoryPort },
  ) {}

  async execute(input: ListNewsletterSubscribersDto) {
    return this.deps.subscriberRepository.list({
      page: input.page,
      limit: input.limit,
      status: input.status as NewsletterStatus | undefined,
      locale: input.locale as NewsletterLocale | undefined,
      q: input.q,
    });
  }
}

export class GetNewsletterStatsQuery {
  constructor(
    private readonly deps: { subscriberRepository: NewsletterSubscriberRepositoryPort },
  ) {}

  async execute(): Promise<NewsletterStats> {
    return this.deps.subscriberRepository.stats();
  }
}

export class ListNewsletterCampaignsQuery {
  constructor(private readonly deps: { campaignRepository: NewsletterCampaignRepositoryPort }) {}

  async execute(input: { page: number; limit: number; type?: string; status?: string }) {
    return this.deps.campaignRepository.list({
      page: input.page,
      limit: input.limit,
      type: input.type as NewsletterCampaignType | undefined,
      status: input.status as NewsletterCampaignStatus | undefined,
    });
  }
}
