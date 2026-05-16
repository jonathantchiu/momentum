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
- **External APIs:** USDA FoodData Central for nutritional data

## API Endpoints

### Auth
- `POST /auth/register` — Create account
- `POST /auth/login` — Sign in
- `POST /auth/refresh` — Refresh access token
- `POST /auth/logout` — Sign out
- `GET /auth/me` — Get current user

### Nutrition
- `POST /nutrition/recipes` — Create recipe
- `GET /nutrition/recipes` — List recipes (search with `?search=`)
- `GET /nutrition/recipes/:id` — Get recipe detail
- `PUT /nutrition/recipes/:id` — Update recipe
- `DELETE /nutrition/recipes/:id` — Delete recipe
- `GET /nutrition/meal-plans` — Get current week plan
- `POST /nutrition/meal-plans/items` — Add item to meal plan
- `PUT /nutrition/meal-plans/items/:id` — Move item
- `DELETE /nutrition/meal-plans/items/:id` — Remove item
- `GET /nutrition/pantry` — List pantry items
- `POST /nutrition/pantry` — Add pantry item
- `PUT /nutrition/pantry/:id` — Update pantry item
- `DELETE /nutrition/pantry/:id` — Delete pantry item
- `GET /nutrition/shopping-list` — Generate shopping list
- `GET /nutrition/targets` — Get macro targets
- `PUT /nutrition/targets` — Update macro targets
- `GET /nutrition/usda/search?q=` — Search USDA foods
- `GET /nutrition/usda/:fdcId` — Get USDA nutrients

## Development

```bash
npm run dev      # Start client + server
npm test         # Run server tests
npm run lint     # Lint all files
```
