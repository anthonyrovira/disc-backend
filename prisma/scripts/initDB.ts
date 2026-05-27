import { discData } from '@/assets/disc-data-fr';

type DiscDimension = 'D' | 'I' | 'S' | 'C';

const dimensionMap: Record<string, DiscDimension> = {
  '01_A': 'D',
  '01_B': 'I',
  '01_C': 'S',
  '01_D': 'C',
  '02_A': 'D',
  '02_B': 'S',
  '02_C': 'I',
  '02_D': 'C',
  '03_A': 'D',
  '03_B': 'C',
  '03_C': 'I',
  '03_D': 'S',
  '04_A': 'D',
  '04_B': 'I',
  '04_C': 'C',
  '04_D': 'S',
  '05_A': 'D',
  '05_B': 'S',
  '05_C': 'I',
  '05_D': 'C',
  '06_A': 'D',
  '06_B': 'I',
  '06_C': 'S',
  '06_D': 'C',
  '07_A': 'D',
  '07_B': 'I',
  '07_C': 'C',
  '07_D': 'S',
  '08_A': 'D',
  '08_B': 'S',
  '08_C': 'C',
  '08_D': 'I',
  '09_A': 'I',
  '09_B': 'D',
  '09_C': 'C',
  '09_D': 'S',
  '10_A': 'C',
  '10_B': 'S',
  '10_C': 'I',
  '10_D': 'D',
  '11_A': 'C',
  '11_B': 'S',
  '11_C': 'D',
  '11_D': 'I',
  '12_A': 'I',
  '12_B': 'D',
  '12_C': 'S',
  '12_D': 'C',
  '13_A': 'C',
  '13_B': 'D',
  '13_C': 'S',
  '13_D': 'I',
  '14_A': 'D',
  '14_B': 'I',
  '14_C': 'C',
  '14_D': 'S',
  '15_A': 'D',
  '15_B': 'I',
  '15_C': 'C',
  '15_D': 'S',
  '16_A': 'D',
  '16_B': 'I',
  '16_C': 'C',
  '16_D': 'S',
  '17_A': 'D',
  '17_B': 'S',
  '17_C': 'C',
  '17_D': 'I',
  '18_A': 'D',
  '18_B': 'S',
  '18_C': 'C',
  '18_D': 'I',
};

import { PrismaClient } from '../../generated/prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

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
          dimension: dimensionMap[option.value],
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
