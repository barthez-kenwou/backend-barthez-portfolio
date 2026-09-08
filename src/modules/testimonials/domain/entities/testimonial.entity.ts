/**
 * Testimonial domain entity — matches frontend ITestimonial + moderation fields.
 */

export type TestimonialStatus = 'pending' | 'approved' | 'rejected';
export type TestimonialSource = 'admin' | 'public_form';

export type TestimonialEntity = {
  id: string;
  rating: number;
  textFr: string;
  textEn: string;
  nameFr: string;
  nameEn: string;
  roleFr: string;
  roleEn: string;
  company: string | null;
  email: string | null;
  isPublished: boolean;
  status: TestimonialStatus;
  source: TestimonialSource;
  sortOrder: number;
  projectId: string | null;
  ownerId: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type CreateTestimonialInput = {
  rating: number;
  textFr: string;
  textEn: string;
  nameFr: string;
  nameEn: string;
  roleFr: string;
  roleEn: string;
  company?: string | null;
  email?: string | null;
  isPublished?: boolean;
  status?: TestimonialStatus;
  source?: TestimonialSource;
  sortOrder?: number;
  projectId?: string | null;
  ownerId?: string | null;
};

export type UpdateTestimonialInput = Partial<{
  rating: number;
  textFr: string;
  textEn: string;
  nameFr: string;
  nameEn: string;
  roleFr: string;
  roleEn: string;
  company: string | null;
  email: string | null;
  isPublished: boolean;
  status: TestimonialStatus;
  source: TestimonialSource;
  sortOrder: number;
  projectId: string | null;
  deletedAt: Date | null;
}>;

export type TestimonialListFilters = {
  page: number;
  limit: number;
  /** When true, only public-safe testimonials. */
  publicOnly?: boolean;
  status?: TestimonialStatus;
  isPublished?: boolean;
  projectId?: string;
};

export type TestimonialListResult = {
  items: TestimonialEntity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
