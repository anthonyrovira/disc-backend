import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({
    description: 'The unique identifier of the user',
    example: 'f8e8d1e0-7e6e-11ea-bc55-0242ac130003',
  })
  id: string;

  @ApiPropertyOptional({
    description: 'The name of the user',
    example: 'JohnDoe51',
  })
  username?: string;

  @ApiProperty({
    description: 'The email address of the user',
    example: 'johndoe@example.com',
  })
  email: string;

  @ApiPropertyOptional({
    description: 'The date when the user was created',
    example: '2023-07-01T10:00:00Z',
    nullable: true,
  })
  created_at?: Date;

  constructor(id: string, email: string, username?: string, created_at?: Date) {
    this.id = id;
    this.email = email;
    this.username = username;
    this.created_at = created_at;
  }
}
