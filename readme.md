# Qualet - API

> There are some changes I'll be making to this repo, make sure you pull updated changes using `git pull`. then add your changes before pushing.

# Setup

- ## Clone the repo

```js
    git clone https://github.com/Benrobo/qualet-api.git
```

- ## Install all dependencies

```js
    // if npm is default package manager
    npm install

    // if yarn is default package manager
    yarn add
```

- ## Create a .env file. Paste and update the created .env file to the variables found in `.env.development`

```js

    DATABASE_URL="postgresql://postgres:1234@localhost:5432/qualet?schema=public&connect_timeout=1000"

    JWT_SECRET="some-secret"

    MAX_API_REQUEST_COUNT = 500

```

## This starter kit uses `Prisma ORM` for managing `Postgresql Database`. So it compulsory you have postgresql installed, if not follow the link below on setting up postgresql and prisma orm on your pc

- [Postgresql Setup](https://www.postgresqltutorial.com/postgresql-getting-started/install-postgresql/)

-  [Prisma Setup](https://www.prisma.io/docs/getting-started/setup-prisma/start-from-scratch/relational-databases-typescript-postgres)


- ## Update the `schema.prisma` file with your own custom models and run the npm script commands
    
```diff
    npm run prisma-migrate
```
### This would do two things :
- It creates a new SQL migration file for this migration

- It runs the SQL migration file against the database

### This repo is open for contribution.
