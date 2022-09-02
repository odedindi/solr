# Solr

_Klassenlager 2022 project_

- [Can be seen live here](solr.vercel.app)

## Preface

We want to create both a visual dictionary as well as a 3D model of our solar system.

Along side the fun of dealing with our solar system, this project aims to be a playground especially for [GSAP](https://greensock.com) as well as [Three.js](https://threejs.org) and if we will have enough time and reach it also [Theatre.js](https://www.theatrejs.com/).
In the background of it thought, is the use of the Panter stack and implamantation of frontend concepts from my training program such as:

- coding techniques:
  - KISS, DRY, SOLID and Occam’s Razor principles
  - Design patterns in frontend development
  - Functional Programming
  - Component Design
  - Code quality
  - Best practices
  - Project structure - file structure, naming conventions
- Practical:
  - TypeScript
  - React (Next.js)
  - State Management
  - Consuming a (graphql) API
  - Building functional components
  - Routing
  - Responsivity
- Tooling
  - GIT
  - formatters (prettier), linters (eslint), scaffolding (plop)
  - CI/CD basics (set up of the project pipelines)
- Soft skills
  - Solve mid complex problems independently

#### I value the care and effort to improve in case of any comment by the reader feel free to contact me at odi@panter.ch

# Getting started

## Setup

This is a [nextjs](https://nextjs.org/) project with

- graph api

  - [micro](https://github.com/vercel/micro)
  - [apollo-server](https://www.apollographql.com/docs/apollo-server/)
  - [nexus](https://nexusjs.org/) to define graphql resolvers and schema

- animation
  - [GSAP](https://greensock.com)
  - [Three.js](https://threejs.org)
  - [Theatre.js](https://www.theatrejs.com/)
- styling
  - [emotion](https://emotion.sh/docs/introduction)
  - [mantine](https://mantine.dev/)

### getting started and important scripts

- run `yarn dev` to run it locally on [localhost:3000](http://localhost:3000)
- run `plop` to use the project scaffolding
- run `yarn check:types` to check types
- run `yarn check:lint` to check linting
- run `yarn check:all` to check both types, linting and formatting
- run `generate:types` to transpile and generate hooks and types for queries

## Contributing

- If you'd like to contribute, by all means fork the repository and use a feature branch.
- Pull requests are warmly welcome.
- There are few known bugs and some unintentional behaviors.

## Licensing

The code in this project is licensed under MIT [license](https://git.panter.ch/panter/klassenlager22/solr/-/blob/main/LICENSE).
