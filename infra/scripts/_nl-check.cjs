const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  const rows = await prisma.newsletterSubscriber.findMany({ orderBy: { createdAt: 'desc' }, take: 5 });
  console.log(JSON.stringify(rows.map(r => ({
    id: r.id, email: r.email, status: r.status,
    confirmToken: r.confirmToken, unsubscribeToken: r.unsubscribeToken,
  })), null, 2));
  await prisma.$disconnect();
})().catch(e => { console.error(e); process.exit(1); });
