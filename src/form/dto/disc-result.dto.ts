import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

type DiscDim = 'D' | 'I' | 'S' | 'C';

export class StrengthPitfallDto {
  @ApiProperty({ description: 'Titre de la force ou de l\'axe d\'amélioration', example: 'Décisif(ve)' })
  title: string;

  @ApiProperty({ description: 'Description détaillée', example: 'Vous prenez des décisions rapidement et assumez pleinement vos choix.' })
  text: string;
}

export class DiscProfileDataDto {
  @ApiProperty({ description: 'Designation commerciale/psychologique du profil', example: 'Le Réalisateur Persévérant' })
  title: string;

  @ApiProperty({ description: 'Description narrative globale et comportementale', example: 'Vous combinez force d\'action et constance...' })
  description: string;

  @ApiProperty({ description: 'Mots-clés ou étiquettes du profil', type: [String], isArray: true, example: ['Pragmatique', 'Fiable'] })
  tags: string[];

  @ApiProperty({ description: 'Forces majeures du profil', type: [StrengthPitfallDto], isArray: true })
  strengths: StrengthPitfallDto[];

  @ApiProperty({ description: 'Pièges ou axes d\'amélioration du profil', type: [StrengthPitfallDto], isArray: true })
  pitfalls: StrengthPitfallDto[];

  @ApiProperty({ description: 'Conseils pour l\'entourage : comment travailler avec l\'utilisateur', type: [String], isArray: true })
  howToCommunicateWithMe: string[];
}

export class DiscSynergyDto {
  @ApiProperty({ description: 'La dimension cible de la synergie', example: 'I' })
  targetDimension: DiscDim;

  @ApiProperty({ description: 'Nom de la dimension cible', example: 'Influence' })
  targetLabel: string;

  @ApiProperty({ description: 'Points de concordance naturelle', example: 'Vous partagez un rythme rapide...' })
  concordance: string;

  @ApiProperty({ description: 'Points de friction ou de discordance potentiels', example: 'Vous cherchez des résultats concrets...' })
  discordance: string;

  @ApiProperty({ description: 'Guide de communication pratique en quelques points', type: [String], isArray: true })
  communicationGuide: string[];
}

export class AnswerDetailDto {
  @ApiProperty({ description: 'The question id', example: 'uuid-1' })
  questionId: string;

  @ApiProperty({ description: 'The question content', example: "Concernant votre poignée de main :" })
  questionContent: string;

  @ApiPropertyOptional({ description: 'The question category', example: 'Communication & Expression' })
  category?: string;

  @ApiProperty({ description: 'The selected option value', example: '01_A' })
  optionValue: string;

  @ApiProperty({ description: 'The selected option content', example: 'Elle est ferme et plutôt appuyée.' })
  optionContent: string;

  @ApiProperty({ description: 'The DISC dimension', example: 'D' })
  dimension: DiscDim;
}

export class DiscScoresDto {
  @ApiProperty({ description: 'Dominance score', example: 7 })
  D: number;

  @ApiProperty({ description: 'Influence score', example: 5 })
  I: number;

  @ApiProperty({ description: 'Steadiness score', example: 3 })
  S: number;

  @ApiProperty({ description: 'Conscientiousness score', example: 3 })
  C: number;
}

export class CategoryScoreDto {
  @ApiProperty({ description: 'Category name', example: 'Travail & Décisions' })
  category: string;

  @ApiProperty({ description: 'Scores per dimension for this category' })
  scores: DiscScoresDto;

  @ApiProperty({ description: 'Dominant DISC dimension', example: 'D' })
  dominant: DiscDim;

  @ApiProperty({ description: 'Total answers in this category', example: 5 })
  total: number;
}

export class DiscResultDto {
  @ApiProperty({ description: 'Scores per dimension' })
  scores: DiscScoresDto;

  @ApiProperty({ description: 'Primary DISC dimension', example: 'D' })
  primary: DiscDim;

  @ApiProperty({ description: 'Secondary DISC dimension', example: 'I', nullable: true })
  secondary: DiscDim | null;

  @ApiProperty({ description: 'Profil DISC enrichi (données textuelles, forces, axes d\'amélioration, communication)', type: DiscProfileDataDto })
  profile: DiscProfileDataDto;

  @ApiProperty({ description: 'Synergies avec les autres dimensions DISC', type: [DiscSynergyDto], isArray: true })
  synergies: DiscSynergyDto[];

  @ApiProperty({ description: 'Total number of answers', example: 18 })
  total: number;

  @ApiProperty({ description: 'List of answers with dimension details', type: [AnswerDetailDto], isArray: true })
  answers: AnswerDetailDto[];

  @ApiProperty({ description: 'Scores broken down by question category', type: [CategoryScoreDto], isArray: true })
  categoryScores: CategoryScoreDto[];
}
