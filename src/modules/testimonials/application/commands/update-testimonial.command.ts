import type { AuditPort } from '@/shared/infrastructure/audit';

import type {
  TestimonialEntity,
  UpdateTestimonialInput,
} from '../../domain/entities/testimonial.entity';
import {
  TestimonialForbiddenError,
  TestimonialNotFoundError,
} from '../../domain/errors/testimonial.errors';
import type { TestimonialRepositoryPort } from '../../domain/repositories/testimonial.repository';
import type { UpdateTestimonialDto } from '../dto/testimonial.dto';

export type UpdateTestimonialCommandDeps = {
  testimonialRepository: TestimonialRepositoryPort;
  audit?: AuditPort;
};

export class UpdateTestimonialCommand {
  constructor(private readonly deps: UpdateTestimonialCommandDeps) {}

  async execute(input: UpdateTestimonialDto): Promise<TestimonialEntity> {
    const existing = await this.deps.testimonialRepository.findById(input.id);
    if (!existing) {
      throw new TestimonialNotFoundError();
    }

    if (!input.isAdmin && existing.ownerId !== input.actorId) {
      throw new TestimonialForbiddenError();
    }

    const { id: _id, actorId: _actorId, isAdmin: _isAdmin, ...patch } = input;
    const data: UpdateTestimonialInput = { ...patch };

    const updated = await this.deps.testimonialRepository.update(input.id, data);

    await this.deps.audit?.record({
      actorId: input.actorId,
      action: 'testimonial.update',
      resource: 'testimonial',
      resourceId: input.id,
    });

    return updated;
  }
}
