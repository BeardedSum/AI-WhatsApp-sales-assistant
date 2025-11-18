# Backend API Endpoints Required for Frontend

This document outlines the API endpoints that need to be implemented in the backend to support the Phase 4 frontend dashboard.

## Status: TO BE IMPLEMENTED

Most of these endpoints need to be created in the backend (`backend/src/`) to support the frontend functionality.

---

## Authentication Endpoints

### POST /api/auth/login
**Purpose:** Authenticate business owner and return JWT tokens

**Request Body:**
```json
{
  "phone_number": "+234...",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt_access_token",
    "refreshToken": "jwt_refresh_token",
    "business": {
      "id": "uuid",
      "name": "Business Name",
      "phone_number": "+234...",
      "ai_tone": "friendly",
      "ai_confidence_threshold": 0.85,
      ...
    }
  }
}
```

### POST /api/auth/refresh
**Purpose:** Refresh access token using refresh token

**Request Body:**
```json
{
  "refreshToken": "jwt_refresh_token"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "new_jwt_access_token"
  }
}
```

### GET /api/auth/me
**Purpose:** Get current authenticated business

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "data": {
    "business": { ... }
  }
}
```

---

## Dashboard Endpoints

### GET /api/dashboard/stats
**Purpose:** Get dashboard analytics and statistics

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "data": {
    "total_conversations": 150,
    "active_conversations": 12,
    "escalated_conversations": 3,
    "resolved_conversations": 135,
    "ai_handled_percentage": 87.5,
    "human_handled_percentage": 12.5,
    "average_response_time_ms": 1200,
    "total_messages_today": 450,
    "total_customers": 85,
    "recent_conversations": [
      {
        "id": "uuid",
        "status": "active",
        "is_human_handled": false,
        "last_message_at": "2025-11-18T10:30:00Z",
        "customer": {
          "id": "uuid",
          "name": "John Doe",
          "whatsapp_number": "+234..."
        }
      }
    ]
  }
}
```

---

## Conversation Endpoints

### GET /api/conversations
**Purpose:** List all conversations with filters

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `status` (optional): active | escalated | resolved
- `is_human_handled` (optional): boolean
- `search` (optional): string
- `page` (optional): number
- `limit` (optional): number

**Response:**
```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "id": "uuid",
        "business_id": "uuid",
        "customer_id": "uuid",
        "status": "active",
        "is_human_handled": false,
        "started_at": "2025-11-18T09:00:00Z",
        "last_message_at": "2025-11-18T10:30:00Z",
        "customer": {
          "id": "uuid",
          "name": "John Doe",
          "whatsapp_number": "+234..."
        },
        "message_count": 12
      }
    ],
    "total": 150,
    "page": 1,
    "limit": 20
  }
}
```

### GET /api/conversations/:id
**Purpose:** Get conversation details with full message history

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "data": {
    "conversation": {
      "id": "uuid",
      "status": "active",
      "is_human_handled": false,
      "customer": {
        "id": "uuid",
        "name": "John Doe",
        "whatsapp_number": "+234..."
      },
      ...
    },
    "messages": [
      {
        "id": "uuid",
        "conversation_id": "uuid",
        "sender_type": "customer",
        "content": "Hello, do you have blue shirts?",
        "message_type": "text",
        "created_at": "2025-11-18T09:00:00Z"
      },
      {
        "id": "uuid",
        "conversation_id": "uuid",
        "sender_type": "ai",
        "content": "Yes! We have blue shirts in various sizes...",
        "message_type": "text",
        "created_at": "2025-11-18T09:00:15Z"
      }
    ]
  }
}
```

### PATCH /api/conversations/:id/takeover
**Purpose:** Take over conversation from AI (escalate to human)

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "reason": "Customer needs complex assistance"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "conversation": { ... }
  }
}
```

### POST /api/conversations/:id/messages
**Purpose:** Send message as human agent

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "content": "Hello, I'm here to help you personally",
  "message_type": "text",
  "media_url": null
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": { ... }
  }
}
```

### PATCH /api/conversations/:id/resolve
**Purpose:** Mark conversation as resolved

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "data": {
    "conversation": { ... }
  }
}
```

---

## Product Endpoints

### GET /api/products
**Purpose:** List all products

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `category` (optional): string
- `is_active` (optional): boolean
- `search` (optional): string
- `min_price` (optional): number
- `max_price` (optional): number

**Response:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "uuid",
        "business_id": "uuid",
        "name": "Blue Cotton Shirt",
        "description": "Comfortable cotton shirt",
        "price": "5000.00",
        "currency": "NGN",
        "category": "Clothing",
        "stock_quantity": 25,
        "image_url": "https://...",
        "is_active": true,
        "created_at": "2025-11-01T00:00:00Z",
        "updated_at": "2025-11-01T00:00:00Z"
      }
    ],
    "total": 50
  }
}
```

### GET /api/products/:id
**Purpose:** Get single product details

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Blue Cotton Shirt",
    ...
  }
}
```

### POST /api/products
**Purpose:** Create new product

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "name": "Blue Cotton Shirt",
  "description": "Comfortable cotton shirt",
  "price": "5000.00",
  "currency": "NGN",
  "category": "Clothing",
  "stock_quantity": 25,
  "image_url": "https://...",
  "is_active": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Blue Cotton Shirt",
    ...
  }
}
```

### PATCH /api/products/:id
**Purpose:** Update existing product

**Headers:** `Authorization: Bearer {token}`

**Request Body:** (partial update)
```json
{
  "price": "4500.00",
  "stock_quantity": 20
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Blue Cotton Shirt",
    ...
  }
}
```

### DELETE /api/products/:id
**Purpose:** Delete product

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

---

## FAQ Endpoints

### GET /api/faqs
**Purpose:** List all FAQs

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `category` (optional): string
- `is_active` (optional): boolean
- `search` (optional): string

**Response:**
```json
{
  "success": true,
  "data": {
    "faqs": [
      {
        "id": "uuid",
        "business_id": "uuid",
        "question": "What are your delivery times?",
        "answer": "We deliver within 2-3 business days in Lagos",
        "category": "Shipping",
        "priority": 4,
        "times_asked": 45,
        "is_active": true,
        "created_at": "2025-11-01T00:00:00Z",
        "updated_at": "2025-11-01T00:00:00Z"
      }
    ],
    "total": 20
  }
}
```

### GET /api/faqs/:id
**Purpose:** Get single FAQ details

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "question": "What are your delivery times?",
    ...
  }
}
```

### POST /api/faqs
**Purpose:** Create new FAQ

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "question": "What are your delivery times?",
  "answer": "We deliver within 2-3 business days in Lagos",
  "category": "Shipping",
  "priority": 4,
  "is_active": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "question": "What are your delivery times?",
    ...
  }
}
```

### PATCH /api/faqs/:id
**Purpose:** Update existing FAQ

**Headers:** `Authorization: Bearer {token}`

**Request Body:** (partial update)
```json
{
  "answer": "We now deliver within 1-2 business days in Lagos",
  "priority": 5
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "question": "What are your delivery times?",
    ...
  }
}
```

### DELETE /api/faqs/:id
**Purpose:** Delete FAQ

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "message": "FAQ deleted successfully"
}
```

---

## Business Settings Endpoints

### PATCH /api/business/settings
**Purpose:** Update business settings

**Headers:** `Authorization: Bearer {token}`

**Request Body:** (partial update)
```json
{
  "name": "Updated Business Name",
  "location": "Lagos, Nigeria",
  "ai_tone": "formal",
  "ai_custom_instructions": "Always be professional...",
  "ai_confidence_threshold": 0.9
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Updated Business Name",
    ...
  }
}
```

---

## Analytics Endpoints (Optional)

### GET /api/analytics/ai-interactions
**Purpose:** Get AI interaction analytics

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `start_date` (optional): ISO date
- `end_date` (optional): ISO date

**Response:**
```json
{
  "success": true,
  "data": {
    "total_interactions": 1500,
    "average_confidence": 0.88,
    "escalation_rate": 0.12,
    "interactions_by_hour": [...],
    "tools_usage": {
      "lookup_products": 450,
      "lookup_faqs": 320,
      ...
    }
  }
}
```

---

## Implementation Notes

1. **Authentication**: Use JWT for token-based auth. Store hashed passwords.
2. **Authorization**: All endpoints (except login) require valid JWT token.
3. **Business Isolation**: Ensure all queries filter by business_id from JWT token.
4. **Validation**: Validate all inputs using class-validator or Zod.
5. **Error Handling**: Return consistent error format:
   ```json
   {
     "success": false,
     "error": {
       "message": "Error description",
       "code": "ERROR_CODE",
       "details": {}
     }
   }
   ```
6. **Pagination**: Implement cursor or offset-based pagination for lists.
7. **Real-time**: Consider WebSocket/SSE for real-time conversation updates (Phase 6).

---

## Priority Implementation Order

### Phase 4A (Critical - Dashboard to work):
1. POST /api/auth/login
2. GET /api/dashboard/stats
3. GET /api/conversations
4. GET /api/conversations/:id

### Phase 4B (High - Full CRUD):
5. GET /api/products
6. POST /api/products
7. PATCH /api/products/:id
8. DELETE /api/products/:id
9. GET /api/faqs
10. POST /api/faqs
11. PATCH /api/faqs/:id
12. DELETE /api/faqs/:id

### Phase 4C (Medium - Management):
13. PATCH /api/conversations/:id/takeover
14. POST /api/conversations/:id/messages
15. PATCH /api/conversations/:id/resolve
16. PATCH /api/business/settings
17. POST /api/auth/refresh
18. GET /api/auth/me

---

**Next Steps:** Implement these endpoints in `backend/src/controllers/` and `backend/src/routes/`
