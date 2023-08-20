import { PrismaClient } from '@prisma/client';
import { discData } from '../../src/assets/disc-data-fr';

/**
 *  This script is used to initialize the Question table with data from discData.
 */

const prisma = new PrismaClient();

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
