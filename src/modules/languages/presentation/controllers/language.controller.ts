import type { Request, Response } from 'express';

import { SYSTEM_ROLES } from '@/shared/constants/app.constants';
import { asyncHandler, response } from '@/shared/utils/http/responses/helpers';

import type { CreateLanguageCommand } from '../../application/commands/create-language.command';
import type { DeleteLanguageCommand } from '../../application/commands/delete-language.command';
import type { UpdateLanguageCommand } from '../../application/commands/update-language.command';
import type { GetLanguageQuery } from '../../application/queries/get-language.query';
import type { ListLanguagesQuery } from '../../application/queries/list-languages.query';
import type { LanguageRbacPort } from '../../application/services/rbac.port';
import { LanguageSerializer } from '../serializers/language.serializer';

type AuthenticatedRequest = Request & {
  user?: { id: string };
};

export type LanguageControllerDeps = {
  createLanguage: CreateLanguageCommand;
  updateLanguage: UpdateLanguageCommand;
  deleteLanguage: DeleteLanguageCommand;
  getLanguage: GetLanguageQuery;
  listLanguages: ListLanguagesQuery;
  rbac: LanguageRbacPort;
};

/**
 * Thin Express handlers — HTTP concerns only; business rules live in commands/queries.
 */
export function createLanguageController(deps: LanguageControllerDeps) {
  const isAdmin = async (userId: string): Promise<boolean> =>
    deps.rbac.hasAnyRole(userId, [SYSTEM_ROLES.ADMIN, SYSTEM_ROLES.SUPER_ADMIN]);

  const list = asyncHandler(async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const result = await deps.listLanguages.execute({ page, limit });
    return response.ok(req, res, LanguageSerializer.list(result), 'Languages retrieved');
  });

  const getById = asyncHandler(async (req: Request, res: Response) => {
    const item = await deps.getLanguage.execute({ id: req.params.languageId });
    return response.ok(req, res, LanguageSerializer.one(item), 'Language retrieved');
  });

  const create = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const item = await deps.createLanguage.execute({
      language: req.body.language,
      proficiencyFr: req.body.proficiencyFr,
      proficiencyEn: req.body.proficiencyEn,
      sortOrder: req.body.sortOrder,
      ownerId: req.user!.id,
    });
    return response.created(req, res, LanguageSerializer.one(item), 'Language created');
  });

  const update = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const admin = await isAdmin(req.user!.id);
    const item = await deps.updateLanguage.execute({
      id: req.params.languageId,
      actorId: req.user!.id,
      isAdmin: admin,
      language: req.body.language,
      proficiencyFr: req.body.proficiencyFr,
      proficiencyEn: req.body.proficiencyEn,
      sortOrder: req.body.sortOrder,
    });
    return response.ok(req, res, LanguageSerializer.one(item), 'Language updated');
  });

  const remove = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const admin = await isAdmin(req.user!.id);
    await deps.deleteLanguage.execute({
      id: req.params.languageId,
      actorId: req.user!.id,
      isAdmin: admin,
    });
    return response.ok(req, res, null, 'Language deleted');
  });

  return { list, getById, create, update, remove };
}

export type LanguageController = ReturnType<typeof createLanguageController>;
