/**
 * Contact Info domain entity — singleton public profile (matches frontend IContactInfo).
 * No ownerId on the Prisma model.
 */

export type ContactInfoEntity = {
  id: string;
  singletonKey: string;
  name: string;
  handle: string;
  titleFr: string;
  titleEn: string;
  subtitleFr: string;
  subtitleEn: string;
  email: string;
  phone: string;
  whatsappLink: string;
  location: string;
  website: string;
  repository: string;
  github: string;
  linkedin: string;
  facebook: string;
  photoUrl: string | null;
  yearsExperience: number | null;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type UpsertContactInfoInput = {
  singletonKey?: string;
  name: string;
  handle: string;
  titleFr: string;
  titleEn: string;
  subtitleFr: string;
  subtitleEn: string;
  email: string;
  phone: string;
  whatsappLink: string;
  location: string;
  website: string;
  repository: string;
  github: string;
  linkedin: string;
  facebook: string;
  photoUrl?: string | null;
  yearsExperience?: number | null;
  tags?: string[];
};

export type UpdateContactInfoInput = Partial<{
  name: string;
  handle: string;
  titleFr: string;
  titleEn: string;
  subtitleFr: string;
  subtitleEn: string;
  email: string;
  phone: string;
  whatsappLink: string;
  location: string;
  website: string;
  repository: string;
  github: string;
  linkedin: string;
  facebook: string;
  photoUrl: string | null;
  yearsExperience: number | null;
  tags: string[];
  deletedAt: Date | null;
}>;
