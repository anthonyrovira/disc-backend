import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UserDto {
  @ApiProperty({
    description: 'The unique identifier of the user',
    example: 'f8e8d1e0-7e6e-11ea-bc55-0242ac130003',
  })
  id: string;

  @ApiPropertyOptional({
    description: 'The first name of the user',
    example: 'John',
  })
  firstName?: string;

  @ApiPropertyOptional({
    description: 'The last name of the user',
    example: 'Doe',
  })
  lastName?: string;

  @ApiPropertyOptional({
    description: 'The birth date of the user',
    example: '1990-05-15T00:00:00.000Z',
  })
  birthDate?: Date;

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

  constructor({
    id,
    email,
    firstName,
    lastName,
    birthDate,
    created_at,
  }: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    birthDate?: Date;
    created_at?: Date;
  }) {
    this.id = id;
    this.email = email;
    this.firstName = firstName;
    this.lastName = lastName;
    this.birthDate = birthDate;
    this.created_at = created_at;
  }
}

export class UpdateProfileDto {
  @ApiPropertyOptional({
    description: "Le prénom de l'utilisateur",
    example: 'John',
  })
  @IsOptional()
  @IsString({ message: 'Le prénom doit être une chaîne de caractères' })
  @MinLength(1, { message: 'Le prénom ne peut pas être vide' })
  @MaxLength(100, { message: 'Le prénom ne peut pas dépasser 100 caractères' })
  firstName?: string;

  @ApiPropertyOptional({
    description: "Le nom de l'utilisateur",
    example: 'Doe',
  })
  @IsOptional()
  @IsString({ message: 'Le nom doit être une chaîne de caractères' })
  @MinLength(1, { message: 'Le nom ne peut pas être vide' })
  @MaxLength(100, { message: 'Le nom ne peut pas dépasser 100 caractères' })
  lastName?: string;

  @ApiPropertyOptional({
    description: "L'adresse email de l'utilisateur",
    example: 'johndoe@example.com',
  })
  @IsOptional()
  @IsEmail({}, { message: "Format d'email invalide" })
  email?: string;

  @ApiPropertyOptional({
    description: 'La date de naissance (format ISO 8601)',
    example: '1990-05-15',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Format de date invalide, utilisez le format ISO 8601 (ex: 1990-05-15)' })
  birthDate?: string;
}
