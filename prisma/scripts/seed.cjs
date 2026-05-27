const Database = require('better-sqlite3');
const path = require('path');
const crypto = require('crypto');

const dbPath = process.env.DATABASE_URL?.replace('file:', '') || './prisma/dev.db';
const db = new Database(path.resolve(__dirname, '..', 'dev.db'));

const dimensionMap = {
  '01_A': 'D', '01_B': 'I', '01_C': 'S', '01_D': 'C',
  '02_A': 'D', '02_B': 'S', '02_C': 'I', '02_D': 'C',
  '03_A': 'D', '03_B': 'C', '03_C': 'I', '03_D': 'S',
  '04_A': 'D', '04_B': 'I', '04_C': 'C', '04_D': 'S',
  '05_A': 'D', '05_B': 'S', '05_C': 'I', '05_D': 'C',
  '06_A': 'D', '06_B': 'I', '06_C': 'S', '06_D': 'C',
  '07_A': 'D', '07_B': 'I', '07_C': 'C', '07_D': 'S',
  '08_A': 'D', '08_B': 'S', '08_C': 'C', '08_D': 'I',
  '09_A': 'I', '09_B': 'D', '09_C': 'C', '09_D': 'S',
  '10_A': 'C', '10_B': 'S', '10_C': 'I', '10_D': 'D',
  '11_A': 'C', '11_B': 'S', '11_C': 'D', '11_D': 'I',
  '12_A': 'I', '12_B': 'D', '12_C': 'S', '12_D': 'C',
  '13_A': 'C', '13_B': 'D', '13_C': 'S', '13_D': 'I',
  '14_A': 'D', '14_B': 'I', '14_C': 'C', '14_D': 'S',
  '15_A': 'D', '15_B': 'I', '15_C': 'C', '15_D': 'S',
  '16_A': 'D', '16_B': 'I', '16_C': 'C', '16_D': 'S',
  '17_A': 'D', '17_B': 'S', '17_C': 'C', '17_D': 'I',
  '18_A': 'D', '18_B': 'S', '18_C': 'C', '18_D': 'I',
};

const questionUuids = Array.from({ length: 18 }, () => crypto.randomUUID());

const questions = [
  { id: questionUuids[0], content: "Concernant votre poignée de main :" },
  { id: questionUuids[1], content: "Dans votre quotidien, vous aimez :" },
  { id: questionUuids[2], content: "Quand vous vous exprimez, vous parlez plutôt :" },
  { id: questionUuids[3], content: "C'est samedi, qu'avez-vous prévu :" },
  { id: questionUuids[4], content: "Quand vous échangez avec les autres :" },
  { id: questionUuids[5], content: "Concernant le regard :" },
  { id: questionUuids[6], content: "Quelles sont les qualités que vous aimez :" },
  { id: questionUuids[7], content: "Vos principales peurs :" },
  { id: questionUuids[8], content: "Dans une réunion, vous êtes celui qui :" },
  { id: questionUuids[9], content: "Au travail, vous êtes :" },
  { id: questionUuids[10], content: "Parmi les métiers suivants, lequel choisiriez-vous :" },
  { id: questionUuids[11], content: "Concernant votre mode de réflexion :" },
  { id: questionUuids[12], content: "Au niveau de votre espace personnel :" },
  { id: questionUuids[13], content: "La structure de vos emails :" },
  { id: questionUuids[14], content: "Quand vous donnez votre opinion lors d'une conversation :" },
  { id: questionUuids[15], content: "Votre gestion du temps :" },
  { id: questionUuids[16], content: "Lorsque vous travailez en équipe :" },
  { id: questionUuids[17], content: "Dans une situation stressante :" },
];

const options = [
  { value: '01_A', content: "Elle est ferme et plutôt appuyée.", questionId: questionUuids[0] },
  { value: '01_B', content: "Elle est rapide et plutôt chaleureuse.", questionId: questionUuids[0] },
  { value: '01_C', content: "Elle est moyennement forte.", questionId: questionUuids[0] },
  { value: '01_D', content: "Elle est discrète et vous n'aimez pas forcément serrer la main.", questionId: questionUuids[0] },
  { value: '02_A', content: "Relever les challenges et être tourné vers l'action.", questionId: questionUuids[1] },
  { value: '02_B', content: "Être compréhensif et ne pas rentrer dans le conflit.", questionId: questionUuids[1] },
  { value: '02_C', content: "Divertir et prendre plaisir avec les gens.", questionId: questionUuids[1] },
  { value: '02_D', content: "Être prudent, réfléchi et ne pas donner votre confiance facilement.", questionId: questionUuids[1] },
  { value: '03_A', content: "Fort car il est important de se faire entendre et d'impacter.", questionId: questionUuids[2] },
  { value: '03_B', content: "Avec un très faible volume et lentement, vous aimez être discret.", questionId: questionUuids[2] },
  { value: '03_C', content: "Avec de grandes variations vocales et un rythme très rapide.", questionId: questionUuids[2] },
  { value: '03_D', content: "Avec un volume modéré et de manière calme, voir monocorde.", questionId: questionUuids[2] },
  { value: '04_A', content: "Partir à l'aventure sans me préoccuper des autres.", questionId: questionUuids[3] },
  { value: '04_B', content: "Organiser un barbecue avec des amis.", questionId: questionUuids[3] },
  { value: '04_C', content: "Ranger et mettre de l'ordre dans mes affaires.", questionId: questionUuids[3] },
  { value: '04_D', content: "Aider une association locale et prendre mon temps.", questionId: questionUuids[3] },
  { value: '05_A', content: "Vous parlez plus que vous n'écoutez et avez tendance à couper la parole et être affirmatif dans vos propos.", questionId: questionUuids[4] },
  { value: '05_B', content: "Vous avez une grande capacité d'écoute, ce qui est pour vous un signe de respect.", questionId: questionUuids[4] },
  { value: '05_C', content: "Vous adorez prendre part à une conversation. Discuter est essentiel pour vous, quel que soit le contenu.", questionId: questionUuids[4] },
  { value: '05_D', content: "Votre préférence va aux emails. Vous parlez peu et n'exprimez pas forcément vos sentiments.", questionId: questionUuids[4] },
  { value: '06_A', content: "Vous regardez dans les yeux de manière soutenue en cherchant à évaluer votre interlocuteur.", questionId: questionUuids[5] },
  { value: '06_B', content: "Vous avez un regard amical et chaleureux et cherchez à éveiller l'intérêt.", questionId: questionUuids[5] },
  { value: '06_C', content: "Vous n'aimez pas qu'on vous regarde de manière fixe, vous détournez facilement le regard.", questionId: questionUuids[5] },
  { value: '06_D', content: "Vos contacts visuels sont rares, voire inexistants. Vous évitez le regard des autres.", questionId: questionUuids[5] },
  { value: '07_A', content: "Allez de l'avant, faire preuve de détermination, affronter les challenges.", questionId: questionUuids[6] },
  { value: '07_B', content: "Le sens de l'humour, la répartie, l'optimisme et l'enthousiasme.", questionId: questionUuids[6] },
  { value: '07_C', content: "Les règles, les procédures, la précision et la recherche de l'excellence.", questionId: questionUuids[6] },
  { value: '07_D', content: "Faire preuve d'empathie, être ouvert aux autres et comprendre leurs sentiments.", questionId: questionUuids[6] },
  { value: '08_A', content: "Que l'on tire avantage de vous.", questionId: questionUuids[7] },
  { value: '08_B', content: "Faire face à des changements soudains, à l'instabilité permanente.", questionId: questionUuids[7] },
  { value: '08_C', content: "Être critiqué pour votre travail, l'absence de qualité et de précision.", questionId: questionUuids[7] },
  { value: '08_D', content: "L'ignorance des autres, être délaissé.", questionId: questionUuids[7] },
  { value: '09_A', content: "Propose de nouvelles idées et est toujours de bonne humeur.", questionId: questionUuids[8] },
  { value: '09_B', content: "Aime décider et imposer ses idées pour avancer.", questionId: questionUuids[8] },
  { value: '09_C', content: "Se conforme aux règles, procédures et suit scrupuleusement l'agenda de la réunion.", questionId: questionUuids[8] },
  { value: '09_D', content: "S'attache à la cohésion du groupe et aux sentiments des autres.", questionId: questionUuids[8] },
  { value: '10_A', content: "Formel, rationnel, structuré et concret.", questionId: questionUuids[9] },
  { value: '10_B', content: "Attentionné, pratique et altruiste.", questionId: questionUuids[9] },
  { value: '10_C', content: "Interactif, social et amical.", questionId: questionUuids[9] },
  { value: '10_D', content: "Efficace, rapide, structuré et occupé.", questionId: questionUuids[9] },
  { value: '11_A', content: "Avocat, comptable, informaticien pour la précision et l'analyse.", questionId: questionUuids[10] },
  { value: '11_B', content: "Thérapeute, infirmier ou coach, pour le don de soi et l'écoute.", questionId: questionUuids[10] },
  { value: '11_C', content: "Sportif, entrepreneur, cadre dirigeant pour les challenges et la compétition.", questionId: questionUuids[10] },
  { value: '11_D', content: "Cadre commercial, publiciste, journaliste pour le relationnel et les interactions.", questionId: questionUuids[10] },
  { value: '12_A', content: "Vous réfléchissez à voix haute et n'hésitez pas à exprimer vos ressentis.", questionId: questionUuids[11] },
  { value: '12_B', content: "Vous allez rapidement à l'essentiel et décidez vite avec un minimum d'informations.", questionId: questionUuids[11] },
  { value: '12_C', content: "Votre réflexion est lente et profonde.", questionId: questionUuids[11] },
  { value: '12_D', content: "Vous aimez analyser les choses et rentrer dans les détails, ce qui peut vous paralyser dans votre prise de décision.", questionId: questionUuids[11] },
  { value: '13_A', content: "Même avec vos proches, vous gardez votre distance.", questionId: questionUuids[12] },
  { value: '13_B', content: "Vous occupez l'espace et n'hésitez pas à rentrer dans l'espace privé de votre interlocuteur.", questionId: questionUuids[12] },
  { value: '13_C', content: "Vous restez à distance et prenez uniquement vos aises quand une relation profonde vous lie à votre interlocuteur.", questionId: questionUuids[12] },
  { value: '13_D', content: "Vous êtes très rapidement tactile et familier avec votre interlocuteur, voire trop.", questionId: questionUuids[12] },
  { value: '14_A', content: "Au maximum 3 lignes, sans forcément de salutations. Ils sont courts et vont à l'essentiel.", questionId: questionUuids[13] },
  { value: '14_B', content: "Vous aimez personnaliser vos emails, y ajouter des anecdotes ou des expressions de sympathie.", questionId: questionUuids[13] },
  { value: '14_C', content: "Ils sont formels et structurés, respectant un certain formalisme.", questionId: questionUuids[13] },
  { value: '14_D', content: "Ils sont longs, détaillés et inclusifs, vous prenez le temps de vous exprimer et d'exprimer vos sentiments.", questionId: questionUuids[13] },
  { value: '15_A', content: "Vous n'hésitez pas à donner votre opinion directement et sans filtres.", questionId: questionUuids[14] },
  { value: '15_B', content: "Vous êtes très spontané, voire trop de temps en temps.", questionId: questionUuids[14] },
  { value: '15_C', content: "Vous prenez le temps avant de répondre et vous exprimez plus en termes de données et de faits qu'en opinion générale.", questionId: questionUuids[14] },
  { value: '15_D', content: "Vous vérifiez que les personnes comprennent vos propos et faites attention à ne pas les froisser.", questionId: questionUuids[14] },
  { value: '16_A', content: "Vous préférez tout faire vous-même et pensez que c'est plus rapide et efficace.", questionId: questionUuids[15] },
  { value: '16_B', content: "Vous avez tendance à procrastiner et à repousser les tâches.", questionId: questionUuids[15] },
  { value: '16_C', content: "Vous suivez un agenda minutieux et planifiez chaque étape de votre journée.", questionId: questionUuids[15] },
  { value: '16_D', content: "Vous êtes très disponible pour les autres et avez du mal à dire non. Votre emploi du temps est flexible.", questionId: questionUuids[15] },
  { value: '17_A', content: "Vous préférez être le leader et prendre les décisions importantes.", questionId: questionUuids[16] },
  { value: '17_B', content: "Vous aimez soutenir les autres membres de l'équipe et les aider à atteindre leurs objectifs.", questionId: questionUuids[16] },
  { value: '17_C', content: "Vous êtes attentif au respect des règles et des procédures dans le travail d'équipe.", questionId: questionUuids[16] },
  { value: '17_D', content: "Vous vous efforcez de maintenir une bonne ambiance et de favoriser la collaboration entre les membres de l'équipe.", questionId: questionUuids[16] },
  { value: '18_A', content: "Vous gardez votre sang-froid et cherchez des solutions pratiques pour résoudre le problème.", questionId: questionUuids[17] },
  { value: '18_B', content: "Vous faites preuve de compassion envers les autres et cherchez à les soutenir émotionnellement.", questionId: questionUuids[17] },
  { value: '18_C', content: "Vous suivez les procédures établies et vous concentrez sur la réalisation des tâches nécessaires.", questionId: questionUuids[17] },
  { value: '18_D', content: "Vous cherchez à créer un environnement détendu et positif pour atténuer le stress.", questionId: questionUuids[17] },
];

try {
  const insertQuestion = db.prepare('INSERT INTO Question (id, content) VALUES (?, ?)');
  const insertOption = db.prepare('INSERT INTO Option (value, content, dimension, questionId) VALUES (?, ?, ?, ?)');

  const transaction = db.transaction(() => {
    for (const q of questions) {
      insertQuestion.run(q.id, q.content);
    }
    for (const o of options) {
      insertOption.run(o.value, o.content, dimensionMap[o.value], o.questionId);
    }
  });

  transaction();
  console.log('Database seeded successfully with %d questions and %d options', questions.length, options.length);
} catch (err) {
  console.error('Seed failed:', err.message);
  process.exit(1);
} finally {
  db.close();
}
