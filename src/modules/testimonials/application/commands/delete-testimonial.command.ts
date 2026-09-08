import type { AuditPort } from '@/shared/infrastructure/audit';

import {
  TestimonialForbiddenError,
  TestimonialNotFoundError,
} from '../../domain/errors/testimonial.errors';
import type { TestimonialRepositoryPort } from '../../domain/repositories/testimonial.repository';
import type { DeleteTestimonialDto } from '../dto/testimonial.dto';

export type DeleteTestimonialCommandDeps = {
  testimonialRepository: TestimonialRepositoryPort;
  audit?: AuditPort;
};

export class DeleteTestimonialCommand {
  constructor(private readonly deps: DeleteTestimonialCommandDeps) {}

  async execute(input: DeleteTestimonialDto): Promise<void> {
    const existing = await this.deps.testimonialRepository.findById(input.id);
    if (!existing) {
      throw new TestimonialNotFoundError();
    }

    if (!input.isAdmin && existing.ownerId !== input.actorId) {
      throw new TestimonialForbiddenError();
    }

    await this.deps.testimonialRepository.update(input.id, { deletedAt: new Date() });
    await this.deps.audit?.record({
      actorId: input.actorId,
      action: 'testimonial.delete',
      resource: 'testimonial',
      resourceId: input.id,
    });
  }
}
