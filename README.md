# TODOs

- [x] Créer la base de données (sqlite)
  - [x] Table Auth
  - [x] Table User
  - [x] Table Question
  - [x] Table Option
  - [x] Table Answer
  - [x] Table Form
  - [x] Créer un script d'initialisation de la DB (fichier `initDB.ts` et `pnpm init:db` pour le déclencher)
- [ ] Création des API
  - [x] Auth
    - [x] POST - signup
    - [x] POST - signin
  - [x] User
    - [x] GET - getUserByAccessToken
  - [x] Question
    - [x] GET - getAllQuestions
    - [x] GET - getQuestionById
  - [x] Answer
    - [x] POST - submitAnswer
  - [x] Form
    - [x] POST - initForm
  - [ ] Result
    - [ ] GET ou POST - getResult
- [ ] Appliquer les pricinpes de clean architecture
- [ ] Implémenter l'algorithmie pour compute le résultat final (DISC majoritaire ou système par points ?)
- [ ] Commencer le frontend (React ? Next ? Astro ?)

---

# D.I.S.C Personality Test

The DISC test is a method for analyzing the personality of candidates and employees in a company. It assesses their behavior, emotions, and adaptability to different environments and situations. The evaluation is based on four main aspects: Decision-making, Influence, Serenity, and Conformity.

The goal of this test is to provide a foundation for recruitment and selection processes, enabling a more thorough evaluation of individual performances. It helps improve internal communication, reduce conflicts, recognize employee skills, decrease turnover rates, and identify the talents that align with the company's objectives.

By utilizing the DISC test, certains companies can effectively recruit candidates whose personalities are well-suited to their needs, thus creating a cohesive and complementary work team.

## Technologies Used

- NestJS: Framework for developing the backend API using Node.js

## Clone Procedure

1. Make sure you have [Node.js](https://nodejs.org) installed on your machine.
2. Clone the project from the GitHub repository:

```shell
git clone [paste_repository_url_here]
```

## Installation

```bash
$ pnpm install
```

## Running the app

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Test

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Contribution

Contributions are welcome! If you'd like to contribute to this project, please follow these steps:

- Fork this repository and clone your fork to your machine.
- Create a new branch for your feature or bug fix: `git checkout -b my-branch`
- Make your changes and commit them: `git commit -m "My modification"`
- Push your changes to your fork: `git push origin my-branch`
- Open a pull request from your fork to this repository. Please provide a minimal description of the benefit of your PR.
- Wait for code review and approval before your contribution is merged.

## Stay in touch

For any questions or suggestions, feel free to contact me on Twitter: [@AnthonyRoviraJS](https://twitter.com/AnthonyRoviraJS)

## License

Projet is [MIT licensed](licence).
