# SGH CleanBage Backend API Documentation

This document provides detailed information about all available endpoints in the SGH CleanBag backend API.

## Authentication Endpoints

### POST /api/auth/register
Register a new user.
- **Access**: Public
- **Request Body**: User registration details
- **Response**: User object with token

### POST /api/auth/login
Login user and get authentication token.
- **Access**: Public
- **Request Body**: Email and password
- **Response**: User object with token

### GET /api/auth/logout
Logout user and invalidate token.
- **Access**: Protected (requires authentication)
- **Response**: Success message

## User Endpoints

### GET /api/users/profile
Get the profile of the currently logged-in user.
- **Access**: Protected (requires authentication)
- **Response**: User profile object

### PUT /api/users/profile
Update the profile of the currently logged-in user.
- **Access**: Protected (requires authentication)
- **Request Body**: Updated user profile details
- **Response**: Updated user profile object

### GET /api/users
Get all users (admin only).
- **Access**: Protected (requires admin authentication)
- **Response**: Array of user objects

### GET /api/users/:id
Get user by ID (admin only).
- **Access**: Protected (requires admin authentication)
- **Response**: User object

### PUT /api/users/:id
Update user by ID (admin only).
- **Access**: Protected (requires admin authentication)
- **Request Body**: Updated user details
- **Response**: Updated user object

### DELETE /api/users/:id
Delete user by ID (admin only).
- **Access**: Protected (requires admin authentication)
- **Response**: Success message

## Collection Endpoints

### POST /api/collections
Create a new collection request.
- **Access**: Protected (requires authentication)
- **Request Body**: Collection details
- **Response**: Created collection object

### GET /api/collections
Get all collections.
- **Access**: Protected (requires authentication)
- **Response**: Array of collection objects

### GET /api/collections/nearby
Get nearby collections based on location.
- **Access**: Protected (requires authentication)
- **Response**: Array of nearby collection objects

### GET /api/collections/:id
Get collection by ID.
- **Access**: Protected (requires authentication)
- **Response**: Collection object

### PUT /api/collections/:id
Update collection details.
- **Access**: Protected (requires authentication)
- **Request Body**: Updated collection details
- **Response**: Updated collection object

### DELETE /api/collections/:id
Delete collection (admin only).
- **Access**: Protected (requires admin authentication)
- **Response**: Success message

### PUT /api/collections/:id/assign
Assign a collector to a collection (admin only).
- **Access**: Protected (requires admin authentication)
- **Request Body**: Collector assignment details
- **Response**: Updated collection object

## Report Endpoints

### POST /api/reports
Create a new report (garbage collector only).
- **Access**: Protected (requires garbage collector authentication)
- **Request Body**: Report details
- **Response**: Created report object

### GET /api/reports
Get all reports.
- **Access**: Protected (requires authentication)
- **Response**: Array of report objects

### GET /api/reports/collector
Get reports for the logged-in collector.
- **Access**: Protected (requires garbage collector authentication)
- **Response**: Array of collector's report objects

### GET /api/reports/:id
Get report by ID.
- **Access**: Protected (requires authentication)
- **Response**: Report object

### PUT /api/reports/:id
Update report (admin only).
- **Access**: Protected (requires admin authentication)
- **Request Body**: Updated report details
- **Response**: Updated report object

### DELETE /api/reports/:id
Delete report (admin only).
- **Access**: Protected (requires admin authentication)
- **Response**: Success message

## Route Endpoints

### POST /api/routes
Create a new route (admin only).
- **Access**: Protected (requires admin authentication)
- **Request Body**: Route details
- **Response**: Created route object

### GET /api/routes
Get all routes.
- **Access**: Protected (requires authentication)
- **Response**: Array of route objects

### GET /api/routes/collector
Get routes for the logged-in collector.
- **Access**: Protected (requires garbage collector authentication)
- **Response**: Array of collector's route objects

### GET /api/routes/:id
Get route by ID.
- **Access**: Protected (requires authentication)
- **Response**: Route object

### PUT /api/routes/:id
Update route details.
- **Access**: Protected (requires authentication)
- **Request Body**: Updated route details
- **Response**: Updated route object

### DELETE /api/routes/:id
Delete route (admin only).
- **Access**: Protected (requires admin authentication)
- **Response**: Success message

## Schedule Endpoints

### POST /api/schedules
Create a new schedule (admin only).
- **Access**: Protected (requires admin authentication)
- **Request Body**: Schedule details
- **Response**: Created schedule object

### GET /api/schedules
Get all schedules.
- **Access**: Protected (requires authentication)
- **Response**: Array of schedule objects

### GET /api/schedules/collector
Get schedules for the logged-in collector.
- **Access**: Protected (requires garbage collector authentication)
- **Response**: Array of collector's schedule objects

### GET /api/schedules/:id
Get schedule by ID.
- **Access**: Protected (requires authentication)
- **Response**: Schedule object

### PUT /api/schedules/:id
Update schedule details.
- **Access**: Protected (requires authentication)
- **Request Body**: Updated schedule details
- **Response**: Updated schedule object

### DELETE /api/schedules/:id
Delete schedule (admin only).
- **Access**: Protected (requires admin authentication)
- **Response**: Success message

## Authentication

All protected endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Role-Based Access Control

The API implements role-based access control with the following roles:
- **Admin**: Full access to all endpoints
- **Garbage Collector**: Access to collection and report management
- **Resident**: Access to create collection requests and view their own data

## Error Responses

All endpoints may return the following error responses:
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

Each error response includes a message explaining the error. 