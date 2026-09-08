import type {
  CreateTestimonialInput,
  TestimonialEntity,
  TestimonialListFilters,
  TestimonialListResult,
  UpdateTestimonialInput,
} from '../entities/testimonial.entity';

export interface TestimonialRepositoryPort {
  create(data: CreateTestimonialInput): Promise<TestimonialEntity>;
  findById(id: string): Promise<TestimonialEntity | null>;
  list(filters: TestimonialListFilters): Promise<TestimonialListResult>;
  update(id: string, data: UpdateTestimonialInput): Promise<TestimonialEntity>;
}
