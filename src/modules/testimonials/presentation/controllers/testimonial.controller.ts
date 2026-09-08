import type { Request, Response } from 'express';

import { SYSTEM_ROLES } from '@/shared/constants/app.constants';
import { asyncHandler, response } from '@/shared/utils/http/responses/helpers';

import type { ApproveTestimonialCommand } from '../../application/commands/approve-testimonial.command';
import type { CreateTestimonialCommand } from '../../application/commands/create-testimonial.command';
import type { DeleteTestimonialCommand } from '../../application/commands/delete-testimonial.command';
import type { RejectTestimonialCommand } from '../../application/commands/reject-testimonial.command';
import type { SubmitPublicTestimonialCommand } from '../../application/commands/submit-public-testimonial.command';
import type { UpdateTestimonialCommand } from '../../application/commands/update-testimonial.command';
import type { GetTestimonialQuery } from '../../application/queries/get-testimonial.query';
import type { ListTestimonialsQuery } from '../../application/queries/list-testimonials.query';
import type { TestimonialRbacPort } from '../../application/services/rbac.port';
import type { TestimonialStatus } from '../../domain/entities/testimonial.entity';
import { TestimonialSerializer } from '../serializers/testimonial.serializer';

type AuthRequest = Request & { user?: { id: string } };

export type TestimonialControllerDeps = {
  createTestimonial: CreateTestimonialCommand;
  submitPublicTestimonial: SubmitPublicTestimonialCommand;
  updateTestimonial: UpdateTestimonialCommand;
  deleteTestimonial: DeleteTestimonialCommand;
  approveTestimonial: ApproveTestimonialCommand;
  rejectTestimonial: RejectTestimonialCommand;
  getTestimonial: GetTestimonialQuery;
  listTestimonials: ListTestimonialsQuery;
  rbac: TestimonialRbacPort;
};

export function createTestimonialController(deps: TestimonialControllerDeps) {
  const isAdmin = async (userId: string): Promise<boolean> =>
    deps.rbac.hasAnyRole(userId, [SYSTEM_ROLES.ADMIN, SYSTEM_ROLES.SUPER_ADMIN]);

  const list = asyncHandler(async (req: AuthRequest, res: Response) => {
    const admin = req.user?.id ? await isAdmin(req.user.id) : false;
    const result = await deps.listTestimonials.execute({
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
      publicOnly: !admin,
      status:
        admin && req.query.status ? (String(req.query.status) as TestimonialStatus) : undefined,
      isPublished:
        admin && req.query.isPublished !== undefined
          ? String(req.query.isPublished) === 'true'
          : undefined,
      projectId: req.query.projectId ? String(req.query.projectId) : undefined,
    });
    return response.ok(
      req,
      res,
      TestimonialSerializer.list(result, { includeEmail: admin }),
      'Testimonials retrieved',
    );
  });

  const getById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const admin = await isAdmin(req.user!.id);
    const item = await deps.getTestimonial.execute({
      id: req.params.testimonialId,
      publicOnly: !admin,
    });
    return response.ok(
      req,
      res,
      TestimonialSerializer.one(item, { includeEmail: admin }),
      'Testimonial retrieved',
    );
  });

  const create = asyncHandler(async (req: AuthRequest, res: Response) => {
    const item = await deps.createTestimonial.execute({
      ...req.body,
      actorId: req.user!.id,
      ownerId: req.user!.id,
      source: 'admin',
    });
    return response.created(
      req,
      res,
      TestimonialSerializer.one(item, { includeEmail: true }),
      'Testimonial created',
    );
  });

  const submitPublic = asyncHandler(async (req: Request, res: Response) => {
    const item = await deps.submitPublicTestimonial.execute(req.body);
    return response.created(
      req,
      res,
      TestimonialSerializer.one(item),
      'Feedback submitted for review',
    );
  });

  const update = asyncHandler(async (req: AuthRequest, res: Response) => {
    const admin = await isAdmin(req.user!.id);
    const item = await deps.updateTestimonial.execute({
      id: req.params.testimonialId,
      actorId: req.user!.id,
      isAdmin: admin,
      ...req.body,
    });
    return response.ok(
      req,
      res,
      TestimonialSerializer.one(item, { includeEmail: true }),
      'Testimonial updated',
    );
  });

  const remove = asyncHandler(async (req: AuthRequest, res: Response) => {
    const admin = await isAdmin(req.user!.id);
    await deps.deleteTestimonial.execute({
      id: req.params.testimonialId,
      actorId: req.user!.id,
      isAdmin: admin,
    });
    return response.ok(req, res, null, 'Testimonial deleted');
  });

  const approve = asyncHandler(async (req: AuthRequest, res: Response) => {
    const item = await deps.approveTestimonial.execute({
      id: req.params.testimonialId,
      actorId: req.user!.id,
    });
    return response.ok(
      req,
      res,
      TestimonialSerializer.one(item, { includeEmail: true }),
      'Testimonial approved',
    );
  });

  const reject = asyncHandler(async (req: AuthRequest, res: Response) => {
    const item = await deps.rejectTestimonial.execute({
      id: req.params.testimonialId,
      actorId: req.user!.id,
    });
    return response.ok(
      req,
      res,
      TestimonialSerializer.one(item, { includeEmail: true }),
      'Testimonial rejected',
    );
  });

  return { list, getById, create, submitPublic, update, remove, approve, reject };
}

export type TestimonialController = ReturnType<typeof createTestimonialController>;
