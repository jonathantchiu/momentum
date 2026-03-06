# Personal Health OS

A self-hosted personal health platform that aggregates nutrition, sleep, fitness, mood, hydration, and supplements into one dashboard.

## Quick Start

```bash
# Start infrastructure
docker compose up -d

# Install dependencies
npm install

# Run database migrations
cd server && npx prisma migrate dev

# Start development servers
npm run dev
```

## Stack

- **Frontend:** React + Vite + TailwindCSS + TanStack Query
- **Backend:** Node.js + Express + Prisma + PostgreSQL
- **Auth:** JWT access tokens + HTTP-only refresh token cookies

## Development

```bash
npm run dev      # Start client + server
npm test         # Run server tests
npm run lint     # Lint all files
```
