import { Question } from 'src/core/dtos';

export const discData: Question[] = [
  {
    id: 1,
    question: 'Concernant votre poignée de main :',
    options: [
      {
        id: 'a',
        content: 'Elle est ferme et plutôt appuyée.',
        question_id: 1,
      },
      {
        id: 'b',
        content: 'Elle est rapide et plutôt chaleureuse.',
        question_id: 1,
      },
      {
        id: 'c',
        content: 'Elle est moyennement forte.',
        question_id: 1,
      },
      {
        id: 'd',
        content:
          "Elle est discrète et vous n'aimez pas forcément serrer la main.",
        question_id: 1,
      },
    ],
  },
  {
    id: 2,
    question: 'Dans votre quotidien, vous aimez :',
    options: [
      {
        id: 'a',
        content: "Relever les challenges et être tourné vers l'action.",
        question_id: 2,
      },
      {
        id: 'b',
        content: 'Être compréhensif et ne pas rentrer dans le conflit.',
        question_id: 2,
      },
      {
        id: 'c',
        content: 'Divertir et prendre plaisir avec les gens.',
        question_id: 2,
      },
      {
        id: 'd',
        content:
          'Être prudent, réfléchi et ne pas donner votre confiance facilement.',
        question_id: 2,
      },
    ],
  },
  {
    id: 3,
    question: 'Quand vous vous exprimez, vous parlez plutôt :',
    options: [
      {
        id: 'a',
        content:
          "Fort car il est important de se faire entendre et d'impacter.",
        question_id: 3,
      },
      {
        id: 'b',
        content:
          'Avec un très faible volume et lentement, vous aimez être discret.',
        question_id: 3,
      },
      {
        id: 'c',
        content: 'Avec de grandes variations vocales et un rythme très rapide.',
        question_id: 3,
      },
      {
        id: 'd',
        content: 'Avec un volume modéré et de manière calme, voir monocorde.',
        question_id: 3,
      },
    ],
  },
  {
    id: 4,
    question: "C'est samedi, qu'avez-vous prévu :",
    options: [
      {
        id: 'a',
        content: "Partir à l'aventure sans me préoccuper des autres.",
        question_id: 4,
      },
      {
        id: 'b',
        content: 'Organiser un barbecue avec des amis.',
        question_id: 4,
      },
      {
        id: 'c',
        content: "Ranger et mettre de l'ordre dans mes affaires.",
        question_id: 4,
      },
      {
        id: 'd',
        content: 'Aider une association locale et prendre mon temps.',
        question_id: 4,
      },
    ],
  },
  {
    id: 5,
    question: 'Quand vous échangez avec les autres :',
    options: [
      {
        id: 'a',
        content:
          "Vous parlez plus que vous n'écoutez et avez tendance à couper la parole et être affirmatif dans vos propos.",
        question_id: 5,
      },
      {
        id: 'b',
        content:
          "Vous avez une grande capacité d'écoute, ce qui est pour vous un signe de respect.",
        question_id: 5,
      },
      {
        id: 'c',
        content:
          'Vous adorez prendre part à une conversation. Discuter est essentiel pour vous, quel que soit le contenu.',
        question_id: 5,
      },
      {
        id: 'd',
        content:
          "Votre préférence va aux emails. Vous parlez peu et n'exprimez pas forcément vos sentiments.",
        question_id: 5,
      },
    ],
  },
  {
    id: 6,
    question: 'Concernant le regard :',
    options: [
      {
        id: 'a',
        content:
          'Vous regardez dans les yeux de manière soutenue en cherchant à évaluer votre interlocuteur.',
        question_id: 6,
      },
      {
        id: 'b',
        content:
          "Vous avez un regard amical et chaleureux et cherchez à éveiller l'intérêt.",
        question_id: 6,
      },
      {
        id: 'c',
        content:
          "Vous n'aimez pas qu'on vous regarde de manière fixe, vous détournez facilement le regard.",
        question_id: 6,
      },
      {
        id: 'd',
        content:
          'Vos contacts visuels sont rares, voire inexistants. Vous évitez le regard des autres.',
        question_id: 6,
      },
    ],
  },
  {
    id: 7,
    question: 'Quelles sont les qualités que vous aimez :',
    options: [
      {
        id: 'a',
        content:
          "Allez de l'avant, faire preuve de détermination, affronter les challenges.",

        question_id: 7,
      },
      {
        id: 'b',
        content:
          "Le sens de l'humour, la répartie, l'optimisme et l'enthousiasme.",

        question_id: 7,
      },
      {
        id: 'c',
        content:
          "Les règles, les procédures, la précision et la recherche de l'excellence.",

        question_id: 7,
      },
      {
        id: 'd',
        content:
          "Faire preuve d'empathie, être ouvert aux autres et comprendre leurs sentiments.",

        question_id: 7,
      },
    ],
  },
  {
    id: 8,
    question: 'Vos principales peurs :',
    options: [
      {
        id: 'a',
        content: "Que l'on tire avantage de vous.",
        question_id: 8,
      },
      {
        id: 'b',
        content:
          "Faire face à des changements soudains, à l'instabilité permanente.",
        question_id: 8,
      },
      {
        id: 'c',
        content:
          "Être critiqué pour votre travail, l'absence de qualité et de précision.",
        question_id: 8,
      },
      {
        id: 'd',
        content: "L'ignorance des autres, être délaissé.",
        question_id: 8,
      },
    ],
  },
  {
    id: 9,
    question: 'Dans une réunion, vous êtes celui qui :',
    options: [
      {
        id: 'a',
        content: 'Propose de nouvelles idées et est toujours de bonne humeur.',

        question_id: 9,
      },
      {
        id: 'b',
        content: 'Aime décider et imposer ses idées pour avancer.',

        question_id: 9,
      },
      {
        id: 'c',
        content:
          "Se conforme aux règles, procédures et suit scrupuleusement l'agenda de la réunion.",

        question_id: 9,
      },
      {
        id: 'd',
        content:
          "S'attache à la cohésion du groupe et aux sentiments des autres.",

        question_id: 9,
      },
    ],
  },
  {
    id: 10,
    question: 'Au travail, vous êtes :',
    options: [
      {
        id: 'a',
        content: 'Formel, rationnel, structuré et concret.',

        question_id: 10,
      },
      {
        id: 'b',
        content: 'Attentionné, pratique et altruiste.',

        question_id: 10,
      },
      {
        id: 'c',
        content: 'Interactif, social et amical.',

        question_id: 10,
      },
      {
        id: 'd',
        content: 'Efficace, rapide, structuré et occupé.',

        question_id: 10,
      },
    ],
  },
  {
    id: 11,
    question: 'Parmi les métiers suivants, lequel choisiriez-vous :',
    options: [
      {
        id: 'a',
        content:
          "Avocat, comptable, informaticien pour la précision et l'analyse.",

        question_id: 11,
      },
      {
        id: 'b',
        content:
          "Thérapeute, infirmier ou coach, pour le don de soi et l'écoute.",

        question_id: 11,
      },
      {
        id: 'c',
        content:
          'Sportif, entrepreneur, cadre dirigeant pour les challenges et la compétition.',

        question_id: 11,
      },
      {
        id: 'd',
        content:
          'Cadre commercial, publiciste, journaliste pour le relationnel et les interactions.',

        question_id: 11,
      },
    ],
  },
  {
    id: 12,
    question: 'Concernant votre mode de réflexion :',
    options: [
      {
        id: 'a',
        content:
          "Vous réfléchissez à voix haute et n'hésitez pas à exprimer vos ressentis.",

        question_id: 12,
      },
      {
        id: 'b',
        content:
          "Vous allez rapidement à l'essentiel et décidez vite avec un minimum d'informations.",

        question_id: 12,
      },
      {
        id: 'c',
        content: 'Votre réflexion est lente et profonde.',

        question_id: 12,
      },
      {
        id: 'd',
        content:
          'Vous aimez analyser les choses et rentrer dans les détails, ce qui peut vous paralyser dans votre prise de décision.',

        question_id: 12,
      },
    ],
  },
  {
    id: 13,
    question: 'Au niveau de votre espace personnel :',
    options: [
      {
        id: 'a',
        content: 'Même avec vos proches, vous gardez votre distance.',

        question_id: 13,
      },
      {
        id: 'b',
        content:
          "Vous occupez l'espace et n'hésitez pas à rentrer dans l'espace privé de votre interlocuteur.",

        question_id: 13,
      },
      {
        id: 'c',
        content:
          'Vous restez à distance et prenez uniquement vos aises quand une relation profonde vous lie à votre interlocuteur.',

        question_id: 13,
      },
      {
        id: 'd',
        content:
          'Vous êtes très rapidement tactile et familier avec votre interlocuteur, voire trop.',

        question_id: 13,
      },
    ],
  },
  {
    id: 14,
    question: 'La structure de vos emails :',
    options: [
      {
        id: 'a',
        content:
          "Au maximum 3 lignes, sans forcément de salutations. Ils sont courts et vont à l'essentiel.",

        question_id: 14,
      },
      {
        id: 'b',
        content:
          'Vous aimez personnaliser vos emails, y ajouter des anecdotes ou des expressions de sympathie.',

        question_id: 14,
      },
      {
        id: 'c',
        content:
          'Ils sont formels et structurés, respectant un certain formalisme.',

        question_id: 14,
      },
      {
        id: 'd',
        content:
          "Ils sont longs, détaillés et inclusifs, vous prenez le temps de vous exprimer et d'exprimer vos sentiments.",

        question_id: 14,
      },
    ],
  },
  {
    id: 15,
    question: "Quand vous donnez votre opinion lors d'une conversation :",
    options: [
      {
        id: 'a',
        content:
          "Vous n'hésitez pas à donner votre opinion directement et sans filtres.",

        question_id: 15,
      },
      {
        id: 'b',
        content: 'Vous êtes très spontané, voire trop de temps en temps.',

        question_id: 15,
      },
      {
        id: 'c',
        content:
          "Vous prenez le temps avant de répondre et vous exprimez plus en termes de données et de faits qu'en opinion générale.",

        question_id: 15,
      },
      {
        id: 'd',
        content:
          'Vous vérifiez que les personnes comprennent vos propos et faites attention à ne pas les froisser.',

        question_id: 15,
      },
    ],
  },
  {
    id: 16,
    question: 'Votre gestion du temps :',
    options: [
      {
        id: 'a',
        content:
          "Vous préférez tout faire vous-même et pensez que c'est plus rapide et efficace.",

        question_id: 16,
      },
      {
        id: 'b',
        content: 'Vous avez tendance à procrastiner et à repousser les tâches.',

        question_id: 16,
      },
      {
        id: 'c',
        content:
          'Vous suivez un agenda minutieux et planifiez chaque étape de votre journée.',

        question_id: 16,
      },
      {
        id: 'd',
        content:
          'Vous êtes très disponible pour les autres et avez du mal à dire non. Votre emploi du temps est flexible.',

        question_id: 16,
      },
    ],
  },
  {
    id: 17,
    question: 'Lorsque vous travaillez en équipe :',
    options: [
      {
        id: 'a',
        content:
          'Vous préférez être le leader et prendre les décisions importantes.',

        question_id: 17,
      },
      {
        id: 'b',
        content:
          "Vous aimez soutenir les autres membres de l'équipe et les aider à atteindre leurs objectifs.",

        question_id: 17,
      },
      {
        id: 'c',
        content:
          "Vous êtes attentif au respect des règles et des procédures dans le travail d'équipe.",

        question_id: 17,
      },
      {
        id: 'd',
        content:
          "Vous vous efforcez de maintenir une bonne ambiance et de favoriser la collaboration entre les membres de l'équipe.",

        question_id: 17,
      },
    ],
  },
  {
    id: 18,
    question: 'Dans une situation stressante :',
    options: [
      {
        id: 'a',
        content:
          'Vous gardez votre sang-froid et cherchez des solutions pratiques pour résoudre le problème.',

        question_id: 18,
      },
      {
        id: 'b',
        content:
          'Vous faites preuve de compassion envers les autres et cherchez à les soutenir émotionnellement.',

        question_id: 18,
      },
      {
        id: 'c',
        content:
          'Vous suivez les procédures établies et vous concentrez sur la réalisation des tâches nécessaires.',

        question_id: 18,
      },
      {
        id: 'd',
        content:
          'Vous cherchez à créer un environnement détendu et positif pour atténuer le stress.',

        question_id: 18,
      },
    ],
  },
];
