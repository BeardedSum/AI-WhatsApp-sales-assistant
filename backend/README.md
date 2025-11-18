# WhatsApp AI Assistant - Backend

Backend API for the AI-powered WhatsApp Sales & Support Assistant.

## Phase 1: Backend Foundation ✅ COMPLETED

### What's Implemented

- ✅ Node.js + TypeScript + Express server
- ✅ TypeORM with PostgreSQL
- ✅ 8 Database entities (Business, Customer, Conversation, Message, Product, FAQ, AIInteraction, FollowUpQueue)
- ✅ Database configuration with connection pooling
- ✅ Security middleware (Helmet, CORS, Rate Limiting)
- ✅ Environment configuration
- ✅ Build system and development scripts

### Tech Stack

- **Runtime**: Node.js 20+
- **Language**: TypeScript
- **Framework**: Express
- **ORM**: TypeORM
- **Database**: PostgreSQL
- **Security**: Helmet, CORS, express-rate-limit

## Prerequisites

Before running the backend, ensure you have:

1. **Node.js** (v20 or higher)
   ```bash
   node --version
   ```

2. **PostgreSQL** (v14 or higher)
   ```bash
   psql --version
   ```

3. **npm** or **yarn**
   ```bash
   npm --version
   ```

## Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up PostgreSQL Database

#### Option A: Using PostgreSQL locally

```bash
# Access PostgreSQL
sudo -u postgres psql

# Create database
CREATE DATABASE whatsapp_ai;

# Create user (optional)
CREATE USER whatsapp_user WITH PASSWORD 'your_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE whatsapp_ai TO whatsapp_user;

# Exit
\q
```

#### Option B: Using Docker

```bash
docker run --name whatsapp-postgres \
  -e POSTGRES_DB=whatsapp_ai \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -d postgres:14
```

### 3. Configure Environment Variables

Copy the example env file:

```bash
cp .env.example .env
```

Edit `.env` with your database credentials:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=whatsapp_ai

# Server Configuration
NODE_ENV=development
PORT=3000
```

## Running the Server

### Development Mode (with hot reload)

```bash
npm run dev
```

The server will start on `http://localhost:3000`

### Production Build

```bash
# Build TypeScript
npm run build

# Run production server
npm start
```

## Testing the Server

### Check Health Endpoint

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-18T22:30:00.000Z",
  "uptime": 5.123
}
```

### Check API Root

```bash
curl http://localhost:3000/api
```

Expected response:
```json
{
  "message": "WhatsApp AI Assistant API",
  "version": "1.0.0",
  "endpoints": {
    "health": "/health",
    "webhook": "/api/webhook/whatsapp"
  }
}
```

## Database Schema

The following entities are created automatically when the server starts (in development mode):

### Business
- Stores business information
- Fields: name, phone_number, email, location, AI settings

### Customer
- Stores customer information
- Fields: whatsapp_number, name, email, tags

### Conversation
- Tracks conversation threads
- Fields: status, handled_by, escalation info

### Message
- Individual messages in conversations
- Fields: content, sender_type, AI confidence

### Product
- Business product catalog
- Fields: name, price, stock, images

### FAQ
- Frequently asked questions
- Fields: question, answer, category

### AIInteraction
- Logs AI processing for analytics
- Fields: intent, confidence, tools used

### FollowUpQueue
- Scheduled follow-up messages
- Fields: message_template, scheduled_for, status

## Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   │   └── database.ts   # Database connection
│   ├── controllers/      # Route controllers (Phase 2)
│   ├── entities/         # TypeORM entities
│   │   ├── Business.ts
│   │   ├── Customer.ts
│   │   ├── Conversation.ts
│   │   ├── Message.ts
│   │   ├── Product.ts
│   │   ├── FAQ.ts
│   │   ├── AIInteraction.ts
│   │   └── FollowUpQueue.ts
│   ├── middleware/       # Custom middleware (Phase 2)
│   ├── routes/           # API routes (Phase 2)
│   ├── services/         # Business logic (Phase 2+)
│   ├── types/            # TypeScript types
│   ├── utils/            # Helper functions
│   └── server.ts         # Express server entry point
├── .env                  # Environment variables (create from .env.example)
├── .env.example          # Example environment variables
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Run production server
- `npm run migration:generate` - Generate database migration
- `npm run migration:run` - Run pending migrations
- `npm run migration:revert` - Revert last migration

## Troubleshooting

### Database Connection Error

If you see `Error connecting to database`, check:

1. PostgreSQL is running:
   ```bash
   sudo service postgresql status
   # or for Docker:
   docker ps | grep postgres
   ```

2. Database credentials in `.env` are correct

3. Database `whatsapp_ai` exists:
   ```bash
   psql -U postgres -l | grep whatsapp_ai
   ```

### Port Already in Use

If port 3000 is already in use:

1. Change `PORT` in `.env` to another port (e.g., 3001)
2. Or kill the process using port 3000:
   ```bash
   lsof -ti:3000 | xargs kill -9
   ```

## Next Steps: Phase 2

Phase 1 ✅ is complete! Ready for Phase 2: WhatsApp Integration

Phase 2 will add:
- Twilio WhatsApp webhook integration
- Message receiving and sending
- Webhook signature verification
- Async message processing

See the main project README for Phase 2 implementation guide.

## License

ISC

## Author

BeardedSum
