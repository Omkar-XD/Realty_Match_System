# RealtyMatch API Documentation

## Base URL
```
Production: https://api.realtymatch.com
Development: http://localhost:5000
```

## Authentication

All API endpoints (except login) require JWT authentication.

### Headers
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

---

## API Endpoints

### 1. Authentication

#### POST /api/auth/login
Login to get JWT token.

**Request:**
```json
{
  "email": "user@realtymatch.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "User Name",
      "email": "user@realtymatch.com",
      "phone": "9876543210",
      "role": "staff"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful"
}
```

**Errors:**
- 401: Invalid credentials
- 400: Validation error

---

### 2. Users

#### GET /api/users
Get all users (Admin & Staff).

**Headers:** Requires authentication

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "User Name",
      "email": "user@realtymatch.com",
      "phone": "9876543210",
      "role": "staff",
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    }
  ]
}
```

#### GET /api/users/:id
Get user by ID.

**Headers:** Requires authentication

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "User Name",
    "email": "user@realtymatch.com",
    "phone": "9876543210",
    "role": "staff",
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-01T00:00:00Z"
  }
}
```

#### POST /api/users
Create new user (Admin only).

**Headers:** Requires authentication + Admin role

**Request:**
```json
{
  "name": "New User",
  "email": "newuser@realtymatch.com",
  "phone": "9876543210",
  "role": "staff",
  "password": "securepassword"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "New User",
    "email": "newuser@realtymatch.com",
    "phone": "9876543210",
    "role": "staff",
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-01T00:00:00Z"
  },
  "message": "User created successfully"
}
```

#### PUT /api/users/:id
Update user (Admin only).

**Headers:** Requires authentication + Admin role

**Request:**
```json
{
  "name": "Updated Name",
  "phone": "9999999999"
}
```

#### DELETE /api/users/:id
Delete user (Admin only).

**Headers:** Requires authentication + Admin role

---

### 3. Enquiries

#### GET /api/enquiries
Get all enquiries.

**Query Parameters:**
- `status` (optional): Filter by status (active, closed, won, lost)

**Headers:** Requires authentication

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "buyer_name": "Buyer Name",
      "buyer_phone": "9123456789",
      "buyer_email": "buyer@email.com",
      "transaction_type": "Buy",
      "property_type": "Residential",
      "property_sub_type": "Flat/Apartment",
      "budget_min": 5000000,
      "budget_max": 7000000,
      "location_preferences": ["Baner", "Hinjewadi"],
      "bhk_preferences": [2, 3],
      "area_min": 1000,
      "area_max": 1500,
      "requirements": [],
      "notes": "Looking for ready-to-move property",
      "status": "active",
      "added_by": "user-uuid",
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    }
  ]
}
```

#### GET /api/enquiries/:id
Get enquiry by ID.

#### POST /api/enquiries
Create new enquiry.

**Request:**
```json
{
  "buyer_name": "Buyer Name",
  "buyer_phone": "9123456789",
  "buyer_email": "buyer@email.com",
  "transaction_type": "Buy",
  "property_type": "Residential",
  "property_sub_type": "Flat/Apartment",
  "budget_min": 5000000,
  "budget_max": 7000000,
  "location_preferences": ["Baner", "Hinjewadi"],
  "bhk_preferences": [2, 3],
  "area_min": 1000,
  "area_max": 1500,
  "notes": "Looking for ready-to-move property"
}
```

#### PUT /api/enquiries/:id
Update enquiry.

#### DELETE /api/enquiries/:id
Delete enquiry.

#### POST /api/enquiries/:id/requirements
Add requirement to enquiry.

**Request:**
```json
{
  "property_type": "Residential",
  "property_sub_type": "Villa",
  "budget_min": 10000000,
  "budget_max": 15000000,
  "location_preferences": ["Kharadi"],
  "bhk_preferences": [3, 4],
  "area_min": 2000,
  "area_max": 3000
}
```

#### DELETE /api/enquiries/:id/requirements/:requirementId
Remove requirement from enquiry.

---

### 4. Properties

#### GET /api/properties
Get all properties.

**Query Parameters:**
- `status` (optional): Filter by status (available, sold, rented, unavailable)

**Headers:** Requires authentication

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "property_id": "PROP0001",
      "owner_name": "Owner Name",
      "owner_phone": "9234567890",
      "owner_email": "owner@email.com",
      "transaction_type": "Buy",
      "property_type": "Residential",
      "property_sub_type": "Flat/Apartment",
      "price": 6500000,
      "location": "Baner, Pune",
      "area": 1200,
      "bhk": 2,
      "bathrooms": 2,
      "furnishing": "Semi Furnished",
      "parking": "Covered",
      "floor_number": 5,
      "total_floors": 12,
      "age_of_property": 3,
      "facing": "East",
      "amenities": ["Swimming Pool", "Gym", "Garden"],
      "images": [],
      "description": "Spacious 2 BHK in prime location",
      "status": "available",
      "added_by": "user-uuid",
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    }
  ]
}
```

#### GET /api/properties/:id
Get property by ID.

#### POST /api/properties
Create new property.

**Request:**
```json
{
  "owner_name": "Owner Name",
  "owner_phone": "9234567890",
  "owner_email": "owner@email.com",
  "transaction_type": "Buy",
  "property_type": "Residential",
  "property_sub_type": "Flat/Apartment",
  "price": 6500000,
  "location": "Baner, Pune",
  "area": 1200,
  "bhk": 2,
  "bathrooms": 2,
  "furnishing": "Semi Furnished",
  "parking": "Covered",
  "floor_number": 5,
  "total_floors": 12,
  "age_of_property": 3,
  "facing": "East",
  "amenities": ["Swimming Pool", "Gym"],
  "description": "Spacious 2 BHK in prime location"
}
```

**Response (201 Created):**
Property object with generated `property_id` (e.g., PROP0001)

#### PUT /api/properties/:id
Update property.

#### DELETE /api/properties/:id
Delete property.

#### POST /api/properties/:id/check-matches
Find matching enquiries for a property.

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "property": {
        // Enquiry object
      },
      "matchScore": 85,
      "matchedCriteria": [
        "Transaction Type",
        "Property Type",
        "Budget Range",
        "Location",
        "BHK",
        "Area"
      ]
    }
  ]
}
```

---

### 5. Statistics

#### GET /api/stats/dashboard
Get dashboard statistics.

**Headers:** Requires authentication

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalEnquiries": 50,
    "activeEnquiries": 30,
    "closedEnquiries": 15,
    "wonEnquiries": 10,
    "lostEnquiries": 5,
    "totalProperties": 75,
    "availableProperties": 50,
    "soldProperties": 20,
    "rentedProperties": 5,
    "totalUsers": 10,
    "adminCount": 2,
    "staffCount": 8,
    "recentEnquiries": [],
    "recentProperties": [],
    "conversionRate": 66.67,
    "averageMatchScore": 0
  }
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

### HTTP Status Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Validation error or invalid input
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

---

## Rate Limiting

- General API: 100 requests per 15 minutes
- Login endpoint: 5 requests per 15 minutes

When rate limit is exceeded, API returns 429 status with message:
```json
{
  "success": false,
  "error": "Too many requests, please try again later"
}
```

---

## Data Validation

### Transaction Types
- `Buy`
- `Rent`
- `Lease`

### Property Types
- `Residential`
- `Commercial`
- `Agricultural`
- `Industrial`

### Residential Sub-types
- `Flat/Apartment`
- `Villa`
- `Plot/Land`
- `Penthouse`
- `Studio`

### Commercial Sub-types
- `Office Space`
- `Shop/Showroom`
- `Warehouse`
- `Building`

### Furnishing Types
- `Fully Furnished`
- `Semi Furnished`
- `Unfurnished`

### Parking Types
- `None`
- `Open`
- `Covered`
- `Both`

### Facing Directions
- `North`
- `South`
- `East`
- `West`
- `North-East`
- `North-West`
- `South-East`
- `South-West`

### Status Values

**Enquiry Status:**
- `active`
- `closed`
- `won`
- `lost`

**Property Status:**
- `available`
- `sold`
- `rented`
- `unavailable`

### User Roles
- `admin`: Full system access
- `staff`: Limited access (cannot manage users)

---

## Matching Algorithm

The matching system scores properties against enquiries based on:

1. **Transaction Type** (20 points) - Must match
2. **Property Type** (15 points)
3. **Property Sub-Type** (10 points)
4. **Budget Range** (20 points + 5 bonus for sweet spot)
5. **Location** (15 points)
6. **BHK** (15 points)
7. **Area Range** (10 points + 5 bonus for sweet spot)

**Maximum Score:** 115 points

Matches are returned sorted by score (highest first).