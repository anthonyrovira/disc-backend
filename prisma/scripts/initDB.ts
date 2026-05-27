import { discData } from '@/assets/disc-data-fr';
import { PrismaClient } from '../../generated/prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

/**
 *  This script is used to initialize the Question table with data from discData.
 */

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: process.env.DATABASE_URL }),
});

async function main() {
  for (const question of discData) {
    const newQuestion = await prisma.question.create({
      data: {
        content: question.question,
      },
    });

    for (const option of question.options) {
      await prisma.option.create({
        data: {
          value: option.value,
          content: option.content,
          questionId: newQuestion.id,
        },
      });
    }
  }
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
