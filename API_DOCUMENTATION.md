# Kana Experience Backend API Documentation

## Base URL
```
http://localhost:3000
```

## Authentication
Currently, the API doesn't require authentication. This will be implemented in future versions.

## Endpoints

### Users

#### Create User
```http
POST /user
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "middleName": "Michael",
  "secondLastName": "Smith",
  "phoneNumber": "+1234567890",
  "profileImage": "https://example.com/image.jpg",
  "role": "USER",
  "parentId": 1
}
```

**Response (201):**
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
  "role": "USER",
  "parentId": 1,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "parent": null,
  "subUsers": []
}
```

#### Get All Users
```http
GET /user
```

**Response (200):**
```json
[
  {
    "id": 1,
    "email": "superadmin@kana-experience.com",
    "firstName": "Super",
    "lastName": "Admin",
    "role": "SUPER_ADMIN",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### Get User by ID
```http
GET /user/:id
```

**Response (200):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "USER",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

#### Update User
```http
PATCH /user/:id
```

**Request Body:**
```json
{
  "firstName": "Jane",
  "phoneNumber": "+0987654321"
}
```

**Response (200):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "firstName": "Jane",
  "lastName": "Doe",
  "phoneNumber": "+0987654321",
  "role": "USER",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

#### Delete User
```http
DELETE /user/:id
```

**Response (204):** No content

## Data Models

### User
```typescript
{
  id: number;
  email: string;
  password: string; // Not returned in responses
  firstName: string;
  middleName?: string;
  lastName: string;
  secondLastName?: string;
  phoneNumber?: string;
  profileImage?: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'USER';
  parentId?: number;
  parent?: User;
  subUsers?: User[];
  createdAt: Date;
}
```

### Role Enum
- `SUPER_ADMIN`: Full system access
- `ADMIN`: Administrative access
- `USER`: Regular user access

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": ["email must be an email", "password must be longer than or equal to 6 characters"],
  "error": "Bad Request"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "User with ID 999 not found",
  "error": "Not Found"
}
```

### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "User with this email already exists",
  "error": "Conflict"
}
```

## Validation Rules

### Create User DTO
- `email`: Must be a valid email address
- `password`: Minimum 6 characters
- `firstName`: Required string
- `lastName`: Required string
- `middleName`: Optional string
- `secondLastName`: Optional string
- `phoneNumber`: Optional string
- `profileImage`: Optional string
- `role`: Optional enum (SUPER_ADMIN, ADMIN, USER)
- `parentId`: Optional number

### Update User DTO
All fields are optional and follow the same validation rules as Create User DTO.

## Examples

### cURL Examples

#### Create a new user
```bash
curl -X POST http://localhost:3000/user \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "securepassword123",
    "firstName": "John",
    "lastName": "Doe",
    "role": "USER"
  }'
```

#### Get all users
```bash
curl -X GET http://localhost:3000/user
```

#### Get user by ID
```bash
curl -X GET http://localhost:3000/user/1
```

#### Update user
```bash
curl -X PATCH http://localhost:3000/user/1 \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "phoneNumber": "+1234567890"
  }'
```

#### Delete user
```bash
curl -X DELETE http://localhost:3000/user/1
```

## Notes

- Passwords are automatically hashed using bcrypt before storage
- Email addresses must be unique across the system
- The API automatically removes password fields from responses
- All timestamps are in ISO 8601 format
- The API supports CORS for cross-origin requests 