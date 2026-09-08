import type { TestimonialEntity } from '../../domain/entities/testimonial.entity';
import type { TestimonialRepositoryPort } from '../../domain/repositories/testimonial.repository';
import type { SubmitPublicTestimonialDto } from '../dto/testimonial.dto';

export type SubmitPublicTestimonialCommandDeps = {
  testimonialRepository: TestimonialRepositoryPort;
};

/**
 * Unauthenticated public feedback form → pending moderation.
 */
export class SubmitPublicTestimonialCommand {
  constructor(private readonly deps: SubmitPublicTestimonialCommandDeps) {}

  async execute(input: SubmitPublicTestimonialDto): Promise<TestimonialEntity> {
    return this.deps.testimonialRepository.create({
      rating: input.rating,
      textFr: input.textFr.trim(),
      textEn: input.textEn.trim(),
      nameFr: input.nameFr.trim(),
      nameEn: input.nameEn.trim(),
      roleFr: input.roleFr.trim(),
      roleEn: input.roleEn.trim(),
      company: input.company?.trim() || null,
      email: input.email?.trim() || null,
      isPublished: false,
      status: 'pending',
      source: 'public_form',
      sortOrder: 0,
      ownerId: null,
    });
  }
}
