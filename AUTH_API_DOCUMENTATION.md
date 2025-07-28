# Kana Experience Backend - Authentication API Documentation

## Base URL
```
http://localhost:3000
```

## Authentication Endpoints

### 1. Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": {
      "id": 3,
      "name": "USER",
      "description": "Regular user with basic permissions"
    }
  }
}
```

### 2. Register
```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "firstName": "Jane",
  "lastName": "Smith",
  "middleName": "Marie",
  "secondLastName": "Johnson",
  "phoneNumber": "+1234567890",
  "profileImage": "https://example.com/image.jpg",
  "roleId": 3,
  "parentId": 1
}
```

**Response (201):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 4,
    "email": "newuser@example.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "role": {
      "id": 3,
      "name": "USER",
      "description": "Regular user with basic permissions"
    }
  }
}
```

### 3. Get Profile (Protected Route)
```http
GET /auth/profile
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "middleName": "Michael",
  "secondLastName": "Smith",
  "phoneNumber": "+1234567890",
  "profileImage": "https://example.com/image.jpg",
  "role": {
    "id": 3,
    "name": "USER",
    "description": "Regular user with basic permissions",
    "permissions": ["profile.read", "profile.update"]
  },
  "parent": null,
  "subUsers": [],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## Protected Routes

### Users API (All routes require authentication)
```http
GET /user          # Get all users
GET /user/:id      # Get user by ID
POST /user         # Create new user
PATCH /user/:id    # Update user
DELETE /user/:id   # Delete user
```

**Headers required:**
```
Authorization: Bearer <access_token>
```

## Error Responses

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

### 409 Conflict (Email already exists)
```json
{
  "statusCode": 409,
  "message": "User with this email already exists",
  "error": "Conflict"
}
```

### 400 Bad Request (Validation errors)
```json
{
  "statusCode": 400,
  "message": [
    "email must be an email",
    "password must be longer than or equal to 6 characters"
  ],
  "error": "Bad Request"
}
```

## JWT Token

### Token Structure
The JWT token contains the following payload:
```json
{
  "email": "user@example.com",
  "sub": 1,
  "role": {
    "id": 3,
    "name": "USER"
  },
  "iat": 1640995200,
  "exp": 1641600000
}
```

### Token Expiration
- Default expiration: 7 days
- Configurable via `JWT_EXPIRES_IN` environment variable

## Examples

### cURL Examples

#### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@kana-experience.com",
    "password": "User123!"
  }'
```

#### Register
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "password123",
    "firstName": "Jane",
    "lastName": "Smith",
    "roleId": 3
  }'
```

#### Get Profile (with token)
```bash
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### Create User (protected route)
```bash
curl -X POST http://localhost:3000/user \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User",
    "roleId": 3
  }'
```

## Default Users for Testing

Use these credentials to test the authentication:

### Super Admin
- **Email**: `superadmin@kana-experience.com`
- **Password**: `SuperAdmin123!`
- **Role**: SUPER_ADMIN

### Admin
- **Email**: `admin@kana-experience.com`
- **Password**: `Admin123!`
- **Role**: ADMIN

### Regular User
- **Email**: `user@kana-experience.com`
- **Password**: `User123!`
- **Role**: USER

## Security Features

- **Password Hashing**: All passwords are hashed using bcrypt
- **JWT Tokens**: Secure token-based authentication
- **Input Validation**: All inputs are validated using class-validator
- **Protected Routes**: User management routes require authentication
- **Role-based Access**: Different permissions based on user roles

## Environment Variables

Make sure to set these in your `.env` file:
```env
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
``` 