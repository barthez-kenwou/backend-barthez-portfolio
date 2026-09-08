import { NewsletterSubscriberNotFoundError } from '../../domain/errors/newsletter.errors';
import type { NewsletterSubscriberRepositoryPort } from '../../domain/repositories/newsletter.repository';

export type DeleteNewsletterSubscriberCommandDeps = {
  subscriberRepository: NewsletterSubscriberRepositoryPort;
};

export class DeleteNewsletterSubscriberCommand {
  constructor(private readonly deps: DeleteNewsletterSubscriberCommandDeps) {}

  async execute(input: { id: string }): Promise<void> {
    const existing = await this.deps.subscriberRepository.findById(input.id);
    if (!existing) throw new NewsletterSubscriberNotFoundError();

    await this.deps.subscriberRepository.update(input.id, {
      deletedAt: new Date(),
      status: 'unsubscribed',
      unsubscribedAt: existing.unsubscribedAt ?? new Date(),
      confirmToken: null,
      confirmTokenExpiresAt: null,
    });
  }
}
