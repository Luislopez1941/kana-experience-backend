# Kana Experience Backend - Setup Guide

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- Yarn package manager

## Installation

1. Clone the repository
2. Install dependencies:
```bash
yarn install
```

3. Create a `.env` file in the root directory with the following content:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/kana_experience_db?schema=public"

# Application
PORT=3000
NODE_ENV=development

# JWT (for future auth implementation)
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
```

4. Generate Prisma client:
```bash
yarn db:generate
```

5. Push the database schema:
```bash
yarn db:push
```

6. Run the seed to create initial users:
```bash
yarn db:seed
```

## Default Users Created by Seed

The seed script creates three default users:

- **Super Admin**: `superadmin@kana-experience.com` / `SuperAdmin123!`
- **Admin**: `admin@kana-experience.com` / `Admin123!`
- **Regular User**: `user@kana-experience.com` / `User123!`

## Available Scripts

- `yarn start:dev` - Start development server with hot reload
- `yarn build` - Build the application
- `yarn start:prod` - Start production server
- `yarn db:generate` - Generate Prisma client
- `yarn db:push` - Push database schema changes
- `yarn db:migrate` - Run database migrations
- `yarn db:seed` - Run database seed

## API Endpoints

### Users

- `POST /user` - Create a new user
- `GET /user` - Get all users
- `GET /user/:id` - Get user by ID
- `PATCH /user/:id` - Update user
- `DELETE /user/:id` - Delete user

### Example User Creation

```bash
curl -X POST http://localhost:3000/user \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "role": "USER"
  }'
```

## Database Schema

The application uses PostgreSQL with the following main entities:

- **User**: Users with roles (SUPER_ADMIN, ADMIN, USER)
- **Relationships**: Users can have parent-child relationships

## Development

The application is built with:
- NestJS framework
- Prisma ORM
- PostgreSQL database
- TypeScript
- Class-validator for input validation
- bcryptjs for password hashing 