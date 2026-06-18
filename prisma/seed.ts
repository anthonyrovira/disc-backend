import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import { discQuestions } from './.seed-sources/disc-data';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.$executeRawUnsafe('DELETE FROM "FormOrganization"');
  await prisma.$executeRawUnsafe('DELETE FROM "Invitation"');
  await prisma.$executeRawUnsafe('DELETE FROM "OrganizationMembership"');
  await prisma.$executeRawUnsafe('DELETE FROM "Organization"');
  await prisma.$executeRawUnsafe('DELETE FROM "Answer"');
  await prisma.$executeRawUnsafe('DELETE FROM "FormQuestion"');
  await prisma.$executeRawUnsafe('DELETE FROM "Form"');
  await prisma.$executeRawUnsafe('DELETE FROM "RefreshToken"');
  await prisma.$executeRawUnsafe('DELETE FROM "Option"');
  await prisma.$executeRawUnsafe('DELETE FROM "Question"');
  await prisma.$executeRawUnsafe('DELETE FROM "User"');
  console.log('Tables cleared');

  for (const question of discQuestions) {
    const newQuestion = await prisma.question.create({
      data: {
        content: question.question,
        category: question.category,
      },
    });

    for (const option of question.options) {
      const dim = option.value.split('_')[1] as 'D' | 'I' | 'S' | 'C';
      await prisma.option.create({
        data: {
          value: option.value,
          content: option.content,
          dimension: dim,
          questionId: newQuestion.id,
        },
      });
    }
  }

  console.log(
    `Seeded ${discQuestions.length} questions with ${discQuestions.reduce(
      (s, q) => s + q.options.length,
      0,
    )} options`,
  );
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
