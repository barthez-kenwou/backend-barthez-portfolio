import type { CvAggregate } from '../../application/queries/get-cv.query';

/**
 * Maps the CV Prisma aggregate to the public API response shape.
 */
export const CvSerializer = {
  one(cv: CvAggregate) {
    return {
      contactInfo: cv.contactInfo
        ? {
            id: cv.contactInfo.id,
            singletonKey: cv.contactInfo.singletonKey,
            name: cv.contactInfo.name,
            handle: cv.contactInfo.handle,
            titleFr: cv.contactInfo.titleFr,
            titleEn: cv.contactInfo.titleEn,
            subtitleFr: cv.contactInfo.subtitleFr,
            subtitleEn: cv.contactInfo.subtitleEn,
            email: cv.contactInfo.email,
            phone: cv.contactInfo.phone,
            whatsappLink: cv.contactInfo.whatsappLink,
            location: cv.contactInfo.location,
            website: cv.contactInfo.website,
            repository: cv.contactInfo.repository,
            github: cv.contactInfo.github,
            linkedin: cv.contactInfo.linkedin,
            facebook: cv.contactInfo.facebook,
            photoUrl: cv.contactInfo.photoUrl,
            yearsExperience: cv.contactInfo.yearsExperience,
            tags: cv.contactInfo.tags,
            createdAt: cv.contactInfo.createdAt,
            updatedAt: cv.contactInfo.updatedAt,
          }
        : null,
      experiences: cv.experiences.map((item) => ({
        id: item.id,
        titleFr: item.titleFr,
        titleEn: item.titleEn,
        companyFr: item.companyFr,
        companyEn: item.companyEn,
        period: item.period,
        descriptionFr: item.descriptionFr,
        descriptionEn: item.descriptionEn,
        sortOrder: item.sortOrder,
      })),
      education: cv.education.map((item) => ({
        id: item.id,
        degreeFr: item.degreeFr,
        degreeEn: item.degreeEn,
        school: item.school,
        period: item.period,
        link: item.link,
        sortOrder: item.sortOrder,
      })),
      skills: cv.skills.map((item) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        level: item.level,
        icon: item.icon,
        sortOrder: item.sortOrder,
      })),
      featuredProjects: cv.featuredProjects.map((item) => {
        const confidential = item.confidential;
        return {
          id: item.id,
          titleFr: item.titleFr,
          titleEn: item.titleEn,
          descriptionFr: item.descriptionFr,
          descriptionEn: item.descriptionEn,
          preview: item.preview,
          images: item.images,
          category: item.category,
          status: item.status,
          techStack: item.techStack,
          github: confidential ? null : item.github,
          demo: confidential ? null : item.demo,
          confidential: item.confidential,
          isFeatured: item.isFeatured,
          isPublished: item.isPublished,
          sortOrder: item.sortOrder,
        };
      }),
      certifications: cv.certifications.map((item) => ({
        id: item.id,
        name: item.name,
        issuer: item.issuer,
        year: item.year,
        link: item.link,
        sortOrder: item.sortOrder,
      })),
      languages: cv.languages.map((item) => ({
        id: item.id,
        language: item.language,
        proficiencyFr: item.proficiencyFr,
        proficiencyEn: item.proficiencyEn,
        sortOrder: item.sortOrder,
      })),
      references: cv.references.map((item) => ({
        id: item.id,
        name: item.name,
        roleFr: item.roleFr,
        roleEn: item.roleEn,
        company: item.company,
        email: item.email,
        phone: item.phone,
        sortOrder: item.sortOrder,
      })),
    };
  },
};
