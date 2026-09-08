import type { AuditPort } from '@/shared/infrastructure/audit';

import {
  TestimonialForbiddenError,
  TestimonialNotFoundError,
} from '../../domain/errors/testimonial.errors';
import type { TestimonialRepositoryPort } from '../../domain/repositories/testimonial.repository';
import type { DeleteTestimonialDto } from '../dto/testimonial.dto';
import type { ProjectTestimonialLinkPort } from '../services/project-testimonial-link.port';
import { syncProjectTestimonialMirror } from '../services/sync-project-testimonial';

export type DeleteTestimonialCommandDeps = {
  testimonialRepository: TestimonialRepositoryPort;
  projectLink?: ProjectTestimonialLinkPort;
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

    const updated = await this.deps.testimonialRepository.update(input.id, {
      deletedAt: new Date(),
    });
    await syncProjectTestimonialMirror(this.deps.projectLink, existing, updated);

    await this.deps.audit?.record({
      actorId: input.actorId,
      action: 'testimonial.delete',
      resource: 'testimonial',
      resourceId: input.id,
    });
  }
}
