import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class InitFormDto {
  @ApiProperty({
    description: 'The form name',
    example: 'super_test',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  constructor({ name }: { name: string }) {
    this.name = name;
  }
}

export type FormNames = 'disc_form';
