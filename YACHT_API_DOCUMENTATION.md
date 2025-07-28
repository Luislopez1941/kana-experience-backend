# Yacht API Documentation

## Overview
This API provides endpoints for managing yacht types and yachts in the Kana Experience system.

## Base URL
```
http://localhost:3000
```

## Yacht Types API

### Get All Yacht Types
```http
GET /yacht-types
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Motor Yacht",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### Get Yacht Type by ID
```http
GET /yacht-types/:id
```

**Response:**
```json
{
  "id": 1,
  "name": "Motor Yacht",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Create Yacht Type
```http
POST /yacht-types
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Motor Yacht"
}
```

**Response:**
```json
{
  "id": 1,
  "name": "Motor Yacht",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Update Yacht Type
```http
PATCH /yacht-types/:id
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Updated Motor Yacht"
}
```

**Response:**
```json
{
  "id": 1,
  "name": "Updated Motor Yacht",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Delete Yacht Type
```http
DELETE /yacht-types/:id
```

**Response:** 204 No Content

## Yachts API

### Get All Yachts
```http
GET /yachts
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Ocean Paradise",
    "capacity": 6,
    "length": "25 metros",
    "location": "Puerto Banús",
    "imageUrl": "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400",
    "description": "Luxury yacht with modern amenities",
    "features": "Jacuzzi, Bar, GPS, WiFi",
    "pricePerDay": 1000,
    "constructionYear": 2025,
    "yachtTypeId": 1,
    "yachtType": {
      "id": 1,
      "name": "Motor Yacht",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### Get Yacht by ID
```http
GET /yachts/:id
```

**Response:**
```json
{
  "id": 1,
  "name": "Ocean Paradise",
  "capacity": 6,
  "length": "25 metros",
  "location": "Puerto Banús",
  "imageUrl": "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400",
  "description": "Luxury yacht with modern amenities",
  "features": "Jacuzzi, Bar, GPS, WiFi",
  "pricePerDay": 1000,
  "constructionYear": 2025,
  "yachtTypeId": 1,
  "yachtType": {
    "id": 1,
    "name": "Motor Yacht",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Create Yacht
```http
POST /yachts
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Ocean Paradise",
  "capacity": 6,
  "length": "25 metros",
  "location": "Puerto Banús",
  "imageUrl": "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400",
  "description": "Luxury yacht with modern amenities and stunning ocean views",
  "features": "Jacuzzi, Bar, GPS, WiFi, Air Conditioning",
  "pricePerDay": 1000,
  "constructionYear": 2025,
  "yachtTypeId": 1
}
```

**Response:**
```json
{
  "id": 1,
  "name": "Ocean Paradise",
  "capacity": 6,
  "length": "25 metros",
  "location": "Puerto Banús",
  "imageUrl": "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400",
  "description": "Luxury yacht with modern amenities and stunning ocean views",
  "features": "Jacuzzi, Bar, GPS, WiFi, Air Conditioning",
  "pricePerDay": 1000,
  "constructionYear": 2025,
  "yachtTypeId": 1,
  "yachtType": {
    "id": 1,
    "name": "Motor Yacht",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Update Yacht
```http
PATCH /yachts/:id
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Updated Ocean Paradise",
  "pricePerDay": 1200
}
```

**Response:**
```json
{
  "id": 1,
  "name": "Updated Ocean Paradise",
  "capacity": 6,
  "length": "25 metros",
  "location": "Puerto Banús",
  "imageUrl": "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400",
  "description": "Luxury yacht with modern amenities and stunning ocean views",
  "features": "Jacuzzi, Bar, GPS, WiFi, Air Conditioning",
  "pricePerDay": 1200,
  "constructionYear": 2025,
  "yachtTypeId": 1,
  "yachtType": {
    "id": 1,
    "name": "Motor Yacht",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Delete Yacht
```http
DELETE /yachts/:id
```

**Response:** 204 No Content

## Error Responses

### Validation Error (400)
```json
{
  "statusCode": 400,
  "message": [
    "name should not be empty",
    "capacity must be a positive number"
  ],
  "error": "Bad Request"
}
```

### Not Found Error (404)
```json
{
  "statusCode": 404,
  "message": "Yacht with ID 999 not found",
  "error": "Not Found"
}
```

### Conflict Error (409)
```json
{
  "statusCode": 409,
  "message": "Yacht type with this name already exists",
  "error": "Conflict"
}
```

## Database Schema

### YachtType Table
```sql
CREATE TABLE YachtType (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Yacht Table
```sql
CREATE TABLE Yacht (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  capacity INT NOT NULL,
  length VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  imageUrl TEXT,
  description TEXT NOT NULL,
  features TEXT,
  pricePerDay DECIMAL(10,2) NOT NULL,
  constructionYear INT NOT NULL,
  yachtTypeId INT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (yachtTypeId) REFERENCES YachtType(id)
);
```

## Usage Examples

### Frontend Integration

#### Get Yacht Types for Select Dropdown
```javascript
const response = await fetch('/yacht-types');
const yachtTypes = await response.json();
// Use yachtTypes for select dropdown in yacht form
```

#### Create New Yacht
```javascript
const yachtData = {
  name: "Ocean Paradise",
  capacity: 6,
  length: "25 metros",
  location: "Puerto Banús",
  imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400",
  description: "Luxury yacht with modern amenities",
  features: "Jacuzzi, Bar, GPS, WiFi",
  pricePerDay: 1000,
  constructionYear: 2025,
  yachtTypeId: 1
};

const response = await fetch('/yachts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(yachtData)
});

const newYacht = await response.json();
```

#### Get All Yachts with Types
```javascript
const response = await fetch('/yachts');
const yachts = await response.json();
// Each yacht includes its yachtType information
``` 