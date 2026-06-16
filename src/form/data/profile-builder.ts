import {
  type DiscDim,
  type StrengthPitfallEntry,
  ALL_DIMS,
  DIMENSION_LABELS,
  BLENDED_TITLES,
  SINGLE_PROFILES,
  SYNERGIES,
} from './disc-profile-data';

export interface ProfileData {
  title: string;
  description: string;
  tags: string[];
  strengths: StrengthPitfallEntry[];
  pitfalls: StrengthPitfallEntry[];
  howToCommunicateWithMe: string[];
}

export interface SynergyData {
  targetDimension: DiscDim;
  targetLabel: string;
  concordance: string;
  discordance: string;
  communicationGuide: string[];
}

function buildBlendedDescription(primary: DiscDim, secondary: DiscDim): string {
  const p = SINGLE_PROFILES[primary];
  const s = SINGLE_PROFILES[secondary];
  return `Vous combinez les traits du ${p.shortLabel.toLowerCase()} (profil principal) et du ${s.shortLabel.toLowerCase()} (profil secondaire). ${p.description} Parallèlement, ${s.description.charAt(0).toLowerCase()}${s.description.slice(1)}`;
}

function mergeFirst<T>(primary: T[], secondary: T[]): T[] {
  return [...primary, ...secondary];
}

export function buildProfileData(
  primary: DiscDim,
  secondary: DiscDim | null,
  gap: number,
): ProfileData {
  const isBlended = secondary !== null && gap < 4;

  if (!isBlended) {
    const single = SINGLE_PROFILES[primary];
    return {
      title: single.title,
      description: single.description,
      tags: single.tags,
      strengths: single.strengths,
      pitfalls: single.pitfalls,
      howToCommunicateWithMe: single.howToCommunicateWithMe,
    };
  }

  const profileKey = `${primary}${secondary}`;
  const blendedTitle =
    BLENDED_TITLES[profileKey] ??
    `${DIMENSION_LABELS[primary]} + ${DIMENSION_LABELS[secondary]}`;
  const primaryProfile = SINGLE_PROFILES[primary];
  const secondaryProfile = SINGLE_PROFILES[secondary];

  return {
    title: blendedTitle,
    description: buildBlendedDescription(primary, secondary),
    tags: mergeFirst(primaryProfile.tags, secondaryProfile.tags),
    strengths: mergeFirst(primaryProfile.strengths, secondaryProfile.strengths),
    pitfalls: mergeFirst(primaryProfile.pitfalls, secondaryProfile.pitfalls),
    howToCommunicateWithMe: mergeFirst(
      primaryProfile.howToCommunicateWithMe,
      secondaryProfile.howToCommunicateWithMe,
    ),
  };
}

export function buildSynergies(primary: DiscDim): SynergyData[] {
  const targets = ALL_DIMS.filter((d) => d !== primary);
  return targets.map((target) => {
    const entry = SYNERGIES[primary][target]!;
    return {
      targetDimension: target,
      targetLabel: DIMENSION_LABELS[target],
      concordance: entry.concordance,
      discordance: entry.discordance,
      communicationGuide: entry.communicationGuide,
    };
  });
}
