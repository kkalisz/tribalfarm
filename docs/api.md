# Tribal Farm API Documentation

## Authentication

The API uses session-based authentication. After successful login, a session cookie is set that must be included in subsequent requests to protected endpoints.

### Register User
**POST** `/api/register`

Creates a new user account.

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "id": "uuid",
  "username": "string",
  "email": "string",
  "createdAt": "datetime",
  "updatedAt": "datetime",
  "lastLoginAt": "datetime | null"
}
```

**Error Responses:**
- `409 Conflict` - Username or email already exists
- `400 Bad Request` - Invalid request body

### Login
**POST** `/api/login`

Authenticates a user and creates a session.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "id": "uuid",
  "username": "string",
  "email": "string",
  "createdAt": "datetime",
  "updatedAt": "datetime",
  "lastLoginAt": "datetime | null"
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid credentials
- `400 Bad Request` - Invalid request body

### Logout
**GET** `/api/logout`

Ends the current user session.

**Response:**
- `200 OK` - Session successfully ended

## Protected Endpoints

All protected endpoints require a valid session cookie obtained through login.

### Get User Profile
**GET** `/api/user/profile`

Returns the current user's profile information.

**Response:**
```json
{
  "id": "uuid",
  "username": "string",
  "email": "string",
  "createdAt": "datetime",
  "updatedAt": "datetime",
  "lastLoginAt": "datetime | null"
}
```

**Error Responses:**
- `401 Unauthorized` - Not authenticated
- `404 Not Found` - User not found

## Authentication Mechanisms

### Session Cookie
- Name: `USER_SESSION`
- Secure: Yes
- HttpOnly: Yes
- SameSite: Lax
- Max Age: 7 days

The session cookie is encrypted and signed for security. It must be included in all requests to protected endpoints.

## Error Handling

All error responses follow this format:
```json
{
  "message": "string"
}
```

Common error status codes:
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required or failed
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource already exists
- `500 Internal Server Error` - Server error