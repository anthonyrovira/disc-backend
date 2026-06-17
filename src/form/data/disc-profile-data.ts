export type DiscDim = 'D' | 'I' | 'S' | 'C';

export interface StrengthPitfallEntry {
  title: string;
  text: string;
}

export interface DiscProfileEntry {
  title: string;
  shortLabel: string;
  description: string;
  tags: string[];
  strengths: StrengthPitfallEntry[];
  pitfalls: StrengthPitfallEntry[];
  howToCommunicateWithMe: string[];
}

export interface SynergyEntry {
  concordance: string;
  discordance: string;
  communicationGuide: string[];
}

export const ALL_DIMS: DiscDim[] = ['D', 'I', 'S', 'C'];

export const DIMENSION_LABELS: Record<DiscDim, string> = {
  D: 'Dominant',
  I: 'Influent',
  S: 'Stable',
  C: 'Conforme',
};

export const BLENDED_TITLES: Record<string, string> = {
  DI: 'Le pionnier',
  DC: 'Le stratège',
  DS: 'Le réalisateur persévérant',
  ID: 'Le leader charismatique',
  IC: "L'analyseur créatif",
  IS: 'Le médiateur',
  CD: 'Le bâtisseur',
  CI: "L'innovateur précis",
  CS: 'Le gardien des processus',
  SD: 'Le pilier solide',
  SI: 'Le rassembleur',
  SC: "L'exécuteur méthodique",
};

export const SINGLE_PROFILES: Record<DiscDim, DiscProfileEntry> = {
  D: {
    title: 'Le Capitaine',
    shortLabel: 'Dominant',
    description:
      'Vous êtes direct(e), ferme et orienté(e) vers les résultats. Vous aimez les défis et prenez les choses en main avec confiance.',
    tags: ['Décision', 'Challenges', 'Résultats', 'Leadership'],
    strengths: [
      {
        title: 'Décisif(ve)',
        text: 'Vous prenez des décisions rapidement et assumez pleinement vos choix, même en situation de pression.',
      },
      {
        title: 'Efficace',
        text: "Vous allez à l'essentiel et optimisez les ressources pour atteindre vos objectifs dans les délais impartis.",
      },
      {
        title: 'Résout les problèmes',
        text: 'Vous ne fuyez pas les difficultés : vous les attaquez de front avec une approche pragmatique et orientée solution.',
      },
      {
        title: 'Prend des initiatives',
        text: "Vous n'attendez pas qu'on vous dise quoi faire. Vous proposez, vous agissez et vous entraînez les autres avec vous.",
      },
    ],
    pitfalls: [
      {
        title: 'Impatience',
        text: 'Vous supportez mal les hésitations et les lenteurs, ce qui peut couper la parole ou brusquer vos interlocuteurs.',
      },
      {
        title: 'Néglige les détails',
        text: "Focalisé(e) sur la vision globale et le résultat, vous pouvez sous-estimer l'importance des étapes intermédiaires et des aspects opérationnels.",
      },
      {
        title: 'Trop direct(e)',
        text: "Votre franchise, bien qu'appréciable, peut être perçue comme de la brusquerie ou du manque d'empathie par les profils plus sensibles.",
      },
    ],
    howToCommunicateWithMe: [
      'Soyez directs et précis : Ne perdez pas de temps, allez droit au but.',
      'Respectez son autorité : Reconnaissez ses compétences et sa capacité à décider.',
      "Proposez des solutions, pas des problèmes : Il valorise l'efficacité et l'action.",
    ],
  },
  I: {
    title: 'Le Motivateur',
    shortLabel: 'Influent',
    description:
      'Vous êtes extraverti(e), enthousiaste et orienté(e) vers les autres. Vous inspirez votre entourage et prospérez dans un environnement collaboratif.',
    tags: ['Communication', 'Réseau', 'Optimisme', 'Collaboration'],
    strengths: [
      {
        title: 'Persuasif(ve)',
        text: 'Vous savez embarquer les autres dans vos projets grâce à votre éloquence et votre capacité à créer une vision partagée.',
      },
      {
        title: 'Optimiste',
        text: "Votre énergie positive et votre confiance en l'avenir sont contagieuses et motivent naturellement votre entourage.",
      },
      {
        title: 'Bon(ne) communicateur(trice)',
        text: "Vous exprimez clairement vos idées et savez adapter votre discours à votre auditoire pour capter l'attention.",
      },
      {
        title: 'Crée des relations',
        text: 'Vous construisez facilement un réseau solide et entretenez des relations authentiques basées sur la confiance et la sympathie.',
      },
    ],
    pitfalls: [
      {
        title: 'Impulsivité',
        text: 'Vous avez tendance à parler ou agir sans toujours mesurer les conséquences, ce qui peut vous exposer à des situations délicates.',
      },
      {
        title: "Trop d'engagement",
        text: 'Votre enthousiasme vous pousse à accepter trop de projets à la fois, au risque de vous disperser et de ne pas tenir toutes vos promesses.',
      },
      {
        title: "N'aime pas la routine",
        text: 'Les tâches répétitives et le travail en solitaire vous démobilisent rapidement, ce qui peut affecter votre productivité sur le long terme.',
      },
    ],
    howToCommunicateWithMe: [
      'Soyez enthousiastes et dynamiques : Partagez sa vision positive et son énergie.',
      "Reconnaissez ses succès : Il a besoin de reconnaissance et d'encouragements.",
      "Créez un environnement collaboratif : Il s'épanouit dans l'échange et la convivialité.",
    ],
  },
  S: {
    title: 'Le Supporter',
    shortLabel: 'Stable',
    description:
      "Vous êtes calme, loyal(e) et tourné(e) vers l'équipe. Vous valorisez la stabilité et créez l'harmonie au sein des groupes.",
    tags: ['Support', 'Écoute', 'Organisation', 'Fiabilité'],
    strengths: [
      {
        title: 'Patient(e)',
        text: "Vous savez prendre le temps nécessaire pour accomplir les choses correctement, sans céder à la pression ou à l'urgence.",
      },
      {
        title: 'Fiable',
        text: 'On peut compter sur vous en toutes circonstances. Vous tenez vos engagements et respectez vos délais avec constance.',
      },
      {
        title: 'Bon(ne) auditeur(trice)',
        text: 'Vous écoutez attentivement les autres, ce qui vous permet de comprendre leurs besoins et de désamorcer les tensions.',
      },
      {
        title: "Esprit d'équipe",
        text: 'Vous placez le collectif au-dessus de votre ego et travaillez volontiers à la réussite commune dans un climat harmonieux.',
      },
    ],
    pitfalls: [
      {
        title: 'Résiste au changement',
        text: 'Les changements trop brutaux ou fréquents vous déstabilisent. Vous avez besoin de temps pour accepter et intégrer de nouvelles méthodes.',
      },
      {
        title: 'Évite les conflits',
        text: "Par crainte de froisser les autres, vous pouvez éviter les confrontations nécessaires, laissant des problèmes non résolus s'installer.",
      },
      {
        title: 'Indécision',
        text: 'Votre désir de prendre la bonne décision et de ménager tout le monde peut vous paralyser et vous empêcher de trancher.',
      },
    ],
    howToCommunicateWithMe: [
      'Soyez fiables et constants : La confiance se gagne par la régularité.',
      "Respectez son rythme : Il a besoin de stabilité et n'aime pas les changements brusques.",
      "Montrez-vous à l'écoute : Il valorise les relations harmonieuses et la bienveillance.",
    ],
  },
  C: {
    title: "L'Analyste",
    shortLabel: 'Conforme',
    description:
      'Vous êtes analytique, précis(e) et méthodique. Vous recherchez la qualité et la précision dans tout ce que vous faites.',
    tags: ['Précision', 'Rigueur', 'Processus', 'Analyse'],
    strengths: [
      {
        title: 'Attentif(ve) aux détails',
        text: "Rien ne vous échappe. Vous repérez les incohérences, les erreurs et les axes d'amélioration là où les autres ne voient que du satisfaisant.",
      },
      {
        title: 'Logique',
        text: 'Vous analysez les situations avec rigueur et raison, en vous appuyant sur des faits et des données plutôt que sur des intuitions.',
      },
      {
        title: 'Exigeant(e)',
        text: 'Vous ne vous contentez pas du minimum syndical. Vous poussez chacun à donner le meilleur de lui-même pour atteindre un haut niveau de qualité.',
      },
      {
        title: 'Organisé(e)',
        text: "Vous planifiez, structurez et anticipez. Rien n'est laissé au hasard, ce qui garantit une exécution fluide et sans surprise.",
      },
    ],
    pitfalls: [
      {
        title: 'Trop critique',
        text: 'Votre exigence naturelle peut vous faire paraître négatif(ve) ou difficile à satisfaire, même quand le travail est déjà de bonne qualité.',
      },
      {
        title: 'Trop analyse',
        text: "Vous pouvez tomber dans une paralysie analytique, à vouloir tout comprendre et tout vérifier avant de passer à l'action.",
      },
      {
        title: 'Perfectionniste',
        text: 'La recherche de la perfection peut vous ralentir et vous empêcher de livrer un travail pourtant suffisamment bon dans les délais impartis.',
      },
    ],
    howToCommunicateWithMe: [
      'Soyez précis et documentés : Il apprécie les faits, les données et les sources.',
      'Respectez les procédures : Ne contournez pas les processus établis.',
      'Donnez-lui du temps pour analyser : Il a besoin de recul avant de prendre une décision.',
    ],
  },
};

export const SYNERGIES: Record<
  DiscDim,
  Partial<Record<DiscDim, SynergyEntry>>
> = {
  D: {
    I: {
      concordance:
        'Vous partagez un rythme rapide et une vision macro des projets. Ensemble, vous pouvez lancer des idées novatrices à grande vitesse.',
      discordance:
        "L'Influent cherche la reconnaissance et l'adhésion émotionnelle, tandis que vous vous focalisez uniquement sur le résultat factuel. Sa dispersion peut vous agacer.",
      communicationGuide: [
        "Prenez le temps d'échanger de manière informelle avant d'attaquer l'ordre du jour.",
        "Valorisez publiquement leur créativité et leur impact sur l'équipe.",
        'Aidez-les à structurer leurs idées sans brider leur enthousiasme.',
      ],
    },
    S: {
      concordance:
        "Vous vous retrouvez sur le terrain du pragmatisme, du sérieux et de la recherche d'efficacité opérationnelle.",
      discordance:
        'Votre besoin de rapidité entre régulièrement en collision avec leur rythme de réflexion plus lent, profond et axé sur le consensus.',
      communicationGuide: [
        'Ne forcez pas une prise de décision immédiate, laissez-leur un temps de réflexion.',
        "Explicitez l'impact des changements sur l'humain et les processus existants.",
        "Adoptez une posture d'écoute active sans leur couper la parole.",
      ],
    },
    C: {
      concordance:
        "Vous partagez une recherche commune d'efficacité et de pragmatisme. Tous deux valorisez les résultats tangibles et le sérieux.",
      discordance:
        'Le Conformant exige des données exhaustives et une analyse des risques poussée, ce que vous percevez parfois comme de la lenteur administrative.',
      communicationGuide: [
        'Arrivez en réunion avec des dossiers documentés, précis et chiffrés.',
        "Détaillez le 'comment' et pas seulement le 'quoi'.",
        "Respectez les règles et les standards de qualité qu'ils s'efforcent de garantir.",
      ],
    },
  },
  I: {
    D: {
      concordance:
        'Vous partagez une énergie communicative et un goût pour les défis. Ensemble, vous pouvez entraîner une équipe avec dynamisme et conviction.',
      discordance:
        "Le Dominant veut des résultats concrets et immédiats, alors que vous cherchez d'abord l'adhésion et l'enthousiasme du groupe.",
      communicationGuide: [
        'Préparez des arguments solides et factuels, pas seulement émotionnels.',
        'Montrez comment vos idées servent directement les objectifs de résultats.',
        'Acceptez les échanges directs sans les prendre personnellement.',
      ],
    },
    S: {
      concordance:
        "Tous deux êtes orientés vers les relations humaines, ce qui crée une base de confiance mutuelle et d'écoute dans l'équipe.",
      discordance:
        "Votre besoin de changement et d'actions variées peut déstabiliser la personne Stable qui recherche la routine et la prévisibilité.",
      communicationGuide: [
        'Rassurez-les sur la constance de votre engagement avant de proposer du changement.',
        'Impliquez-les dans vos projets en leur confiant un rôle structurant.',
        "Évitez les décisions impulsives : donnez-leur du temps pour s'adapter.",
      ],
    },
    C: {
      concordance:
        'Vous vous complétez : votre vision large et créative peut être enrichie par leur rigueur analytique pour produire des résultats solides.',
      discordance:
        'Votre approche intuitive et rapide heurte leur besoin de méthode et de précision. Ils peuvent vous trouver trop brouillon(ne).',
      communicationGuide: [
        'Prenez le temps de structurer vos idées avant de les présenter.',
        'Soutenez vos propositions avec des données ou des références.',
        "Reconnaissez l'importance de leur travail de vérification et de précision.",
      ],
    },
  },
  S: {
    D: {
      concordance:
        'Votre fiabilité et votre constance offrent au Dominant une base solide sur laquelle construire ses projets ambitieux.',
      discordance:
        'Le rythme rapide du Dominant et son goût pour les défis permanents peuvent vous mettre sous pression et vous déstabiliser.',
      communicationGuide: [
        'Exprimez clairement vos besoins de délais réalistes et de stabilité.',
        'Préparez des arguments structurés pour défendre vos positions.',
        "N'hésitez pas à demander des éclaircissements lorsque le rythme s'accélère.",
      ],
    },
    I: {
      concordance:
        "Vous partagez une véritable orientation vers les autres et le collectif. L'Influent apporte l'énergie quand vous apportez la stabilité.",
      discordance:
        "Leur besoin constant de changement et de nouveauté peut épuiser votre besoin de routine et d'harmonie stable.",
      communicationGuide: [
        "Appréciez leur enthousiasme tout en rappelant l'importance des processus.",
        'Demandez-leur de structurer leurs idées avant de les concrétiser.',
        "Créez des rituels d'équipe qui allient leurs envies de nouveauté à votre besoin de cadre.",
      ],
    },
    C: {
      concordance:
        'Vous formez un duo méthodique et fiable. Tous deux valorisez la qualité, la précision et le travail bien fait.',
      discordance:
        "Votre désir d'harmonie et d'évitement des conflits peut entrer en tension avec leur tendance à la critique et à l'exigence absolue.",
      communicationGuide: [
        'Ne prenez pas leurs critiques comme des attaques personnelles, mais comme une recherche de qualité.',
        'Appuyez-vous sur leur rigueur pour renforcer vos dossiers et propositions.',
        'Maintenez une communication ouverte pour éviter les non-dits.',
      ],
    },
  },
  C: {
    D: {
      concordance:
        "Vous partagez un engagement fort pour l'efficacité et l'obtention de résultats de qualité. Votre rigueur est un atout pour cadrer leur énergie.",
      discordance:
        "Le Dominant veut aller vite et peut contourner les processus que vous jugez essentiels. Son impatience face à votre besoin d'analyse crée des tensions.",
      communicationGuide: [
        'Synthétisez vos analyses en points clés actionnables.',
        "Montrez comment votre rigueur sert directement l'atteinte des objectifs.",
        'Acceptez que certaines décisions soient prises avec une information partielle.',
      ],
    },
    I: {
      concordance:
        'Votre complémentarité est forte : leur créativité et votre méthode peuvent produire des résultats innovants et solides.',
      discordance:
        "Leur approche désorganisée et leur besoin de reconnaissance vous semblent contraires à la rigueur et à l'humilité que vous valorisez.",
      communicationGuide: [
        'Reconnaissez publiquement leurs contributions créatives.',
        'Proposez-leur des cadres souples plutôt que des règles rigides.',
        'Apprenez à apprécier leur spontanéité sans y voir un manque de sérieux.',
      ],
    },
    S: {
      concordance:
        'Vous partagez un amour des processus, de la fiabilité et de la constance. Votre collaboration est stable et prévisible.',
      discordance:
        "Votre tendance à la critique et à l'exigence peut blesser la personne Stable qui cherche avant tout l'harmonie et la bienveillance.",
      communicationGuide: [
        'Adoucissez vos critiques en les formulant de manière constructive.',
        'Soulignez régulièrement ce qui fonctionne bien, pas seulement ce qui doit être amélioré.',
        "Impliquez-les dans la conception des processus pour qu'ils se sentent valorisés.",
      ],
    },
  },
};
