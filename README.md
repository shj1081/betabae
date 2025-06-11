# Betabae

## Team Members
- [mjayJeong](github.com/mjayJeong) - Frontend Developer
  - second account: [zaiJeong](github.com/zaiJeong)
- [shj1081](github.com/shj1081) - Backend Developer
- [racheliee](github.com/racheliee) - Backend Developer
- [ibyeol21](github.com/ibyeol21)

## Tech Stacks

- Frontend: React Native (TypeScript)
- Backend: NestJS (TypeScript)
- Database: MySQL (Prisma ORM)
- Infrastructure: Redis, S3/MinIO, Docker, Docker Compose

## Project Structure

```
betabae/
├── .github/                  # GitHub configuration files
│
├── app/
│   └── backend/              # NestJS backend application
│       ├── src/              # Source code
│       │   ├── dto/          # Data Transfer Objects
│       │   ├── enums/        # Enumeration definitions
│       │   ├── filters/      # Exception filters
│       │   ├── infra/        # Infrastructure services
│       │   ├── middleware/   # Application middleware
│       │   ├── modules/      # Feature modules
│       │   ├── app.module.ts # Main application module
│       │   └── main.ts       # Application entry point
│       └── test/             # End-to-end tests
│
├── infra-dev/                # Local development infrastructure
│   ├── docker-compose.yaml   # Docker Compose configuration
│   └── redis.conf            # Redis configuration
│
└── Makefile                  # Convenience commands
```

## Prerequisites

- Docker and Docker Compose
- Node.js
- Yarn

## Local Development Environment Setup

1. Clone

```bash
git clone https://github.com/shj1081/betabae-be
cd betabae
```

2. Start Docker containers for MySQL, Redis and MinIO

```bash
make up
```

3. Install backend dependencies

```bash
make install
```

4. Prisma setup

```bash
make prisma-generate
make prisma-migrate
```

5. Start development server

```bash
make dev

# or to manually run the backend server
cd backend
yarn start:dev
```

## Make Commands for Development

### Docker Infrastructure Commands

- `make up`: Start Docker containers
- `make down`: Stop Docker containers
- `make down-v`: Stop Docker containers and remove volumes
- `make reset`: Restart Docker containers (remove volumes and restart)

### Backend Development

- `make install`: Install backend dependencies
- `make dev`: Run local development server (watch mode)
- `make build`: Build backend

### Prisma Commands

- `make prisma-generate`: Generate Prisma client
- `make prisma-migrate`: Run database migrations

### Utility Commands

- `make clean`: Clean up project (remove Docker volumes, build files, node_modules)
- `fast-setup`: Setup local environment in oneshot command (for first run)

## Running the frontend
To run the frontend, you need to set up the React Native environment. Run the following commands in the `app/frontend` directory:
```bash
cd ui
npm install
npm run start # then choose the platform (iOS/Android/Web) to run the app)
```

```[!NOTE]
The frontend runs on port 8081 for the web version, and the mobile versions will run on their respective ports (e.g., Metro Bundler for React Native).
```

