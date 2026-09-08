import type {
  CreateTestimonialInput,
  TestimonialSource,
  TestimonialStatus,
  UpdateTestimonialInput,
} from '../../domain/entities/testimonial.entity';

export type CreateTestimonialDto = CreateTestimonialInput & {
  actorId?: string;
};

export type SubmitPublicTestimonialDto = {
  rating: number;
  textFr: string;
  textEn: string;
  nameFr: string;
  nameEn: string;
  roleFr: string;
  roleEn: string;
  company?: string | null;
  email?: string | null;
  /** Optional published project the visitor is speaking about. */
  projectId?: string | null;
};

export type UpdateTestimonialDto = UpdateTestimonialInput & {
  id: string;
  actorId: string;
  isAdmin: boolean;
};

export type DeleteTestimonialDto = {
  id: string;
  actorId: string;
  isAdmin: boolean;
};

export type ModerateTestimonialDto = {
  id: string;
  actorId: string;
};

export type GetTestimonialDto = {
  id: string;
  publicOnly?: boolean;
};

export type ListTestimonialsDto = {
  page: number;
  limit: number;
  publicOnly?: boolean;
  status?: TestimonialStatus;
  isPublished?: boolean;
  source?: TestimonialSource;
  projectId?: string;
};
