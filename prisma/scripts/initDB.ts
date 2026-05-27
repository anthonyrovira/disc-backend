import 'dotenv/config';
import { discQuestions } from '../.seed-sources/disc-data';

import { PrismaClient } from '../../generated/prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: process.env.DATABASE_URL }),
});

async function main() {
  await prisma.$executeRawUnsafe('DELETE FROM Answer');
  await prisma.$executeRawUnsafe('DELETE FROM FormQuestion');
  await prisma.$executeRawUnsafe('DELETE FROM Form');
  await prisma.$executeRawUnsafe('DELETE FROM Option');
  await prisma.$executeRawUnsafe('DELETE FROM Question');
  await prisma.$executeRawUnsafe('DELETE FROM User');
  console.log('Tables cleared');

  for (const question of discQuestions) {
    const newQuestion = await prisma.question.create({
      data: {
        content: question.question,
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
