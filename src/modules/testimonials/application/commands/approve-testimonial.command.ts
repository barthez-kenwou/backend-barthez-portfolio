import type { AuditPort } from '@/shared/infrastructure/audit';

import type { TestimonialEntity } from '../../domain/entities/testimonial.entity';
import { TestimonialNotFoundError } from '../../domain/errors/testimonial.errors';
import type { TestimonialRepositoryPort } from '../../domain/repositories/testimonial.repository';
import type { ModerateTestimonialDto } from '../dto/testimonial.dto';
import type { ProjectTestimonialLinkPort } from '../services/project-testimonial-link.port';
import { syncProjectTestimonialMirror } from '../services/sync-project-testimonial';

export type ApproveTestimonialCommandDeps = {
  testimonialRepository: TestimonialRepositoryPort;
  projectLink?: ProjectTestimonialLinkPort;
  audit?: AuditPort;
};

export class ApproveTestimonialCommand {
  constructor(private readonly deps: ApproveTestimonialCommandDeps) {}

  async execute(input: ModerateTestimonialDto): Promise<TestimonialEntity> {
    const existing = await this.deps.testimonialRepository.findById(input.id);
    if (!existing) {
      throw new TestimonialNotFoundError();
    }

    const updated = await this.deps.testimonialRepository.update(input.id, {
      status: 'approved',
      isPublished: true,
    });

    await syncProjectTestimonialMirror(this.deps.projectLink, existing, updated);

    await this.deps.audit?.record({
      actorId: input.actorId,
      action: 'testimonial.approve',
      resource: 'testimonial',
      resourceId: input.id,
    });

    return updated;
  }
}
