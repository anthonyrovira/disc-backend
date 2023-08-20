import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class InitFormDto {
  @ApiProperty({
    description: 'The user id',
    example: 'xxxxxx-xxxx-xxxx-xxxx-xxxxxxxx',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'The form name',
    example: 'super_test',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  constructor({ userId, name }: { userId: string; name: string }) {
    this.userId = userId;
    this.name = name;
  }
}

export type FormNames = 'disc_form';
