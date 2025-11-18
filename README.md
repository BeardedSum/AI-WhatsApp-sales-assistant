# AI WhatsApp Sales & Support Assistant

A production-ready Progressive Web App (PWA) for automating WhatsApp customer support using AI. Built to help small businesses in Nigeria never miss a sale while sleeping, cooking, or driving.

## 🎯 Project Goal

Help small businesses (food vendors, fashion retailers, real estate agents) automate WhatsApp customer support with AI-powered responses, product lookups, and intelligent escalation.

## 📋 Development Progress

### ✅ Phase 1: Backend Foundation (COMPLETED)

**What's Built:**
- Node.js + TypeScript + Express server
- TypeORM with PostgreSQL integration
- 8 database entities with proper relationships
- Security middleware (Helmet, CORS, Rate Limiting)
- Environment configuration
- Build system with hot reload

**Tech Stack:**
- Backend: Node.js 20+, Express, TypeScript, TypeORM, PostgreSQL
- Security: Helmet, CORS, express-rate-limit

**Database Entities:**
1. **Business** - Business profiles and AI settings
2. **Customer** - Customer information and tags
3. **Conversation** - Conversation threads and status
4. **Message** - Individual messages with AI confidence scores
5. **Product** - Product catalog with inventory
6. **FAQ** - Frequently asked questions
7. **AIInteraction** - AI processing logs for analytics
8. **FollowUpQueue** - Scheduled follow-up messages

See [backend/README.md](backend/README.md) for detailed setup instructions.

### ✅ Phase 2: WhatsApp Integration (COMPLETED)

**What's Built:**
- Twilio WhatsApp Business API integration
- Webhook controller with < 15s response time
- Message sending (text + media)
- Webhook signature verification
- Async message processing
- Database service for automatic record creation
- Temporary keyword-based responses

**Features:**
- Receives WhatsApp messages via Twilio webhook
- Automatically creates business/customer/conversation records
- Sends AI responses (placeholder - enhanced in Phase 3)
- Saves all messages to database
- Detects and stores media messages
- Error handling with customer notifications

See [PHASE2_COMPLETION.md](PHASE2_COMPLETION.md) for detailed documentation.

### 🔄 Phase 3: Google ADK Integration (NEXT)

**Planned:**
- Intent classification agent
- Parallel context gathering
- Response generation with Gemini/Claude
- Confidence scoring
- Escalation handling

### 🔄 Phase 4: Frontend Dashboard

**Planned:**
- React 18 + TypeScript + Vite
- TailwindCSS styling
- Conversation management
- Product/FAQ management
- Real-time updates
- PWA capabilities

### 🔄 Phase 5: Google File Search

**Planned:**
- Document upload and indexing
- AI document search integration
- Knowledge base management

### 🔄 Phase 6: Advanced Features

**Planned:**
- BullMQ job queue
- Scheduled follow-ups
- Broadcast messaging
- Analytics dashboard
- Settings management

### 🔄 Phase 7: Testing & Deployment

**Planned:**
- Unit and integration tests
- Railway/Render backend deployment
- Vercel frontend deployment
- Production environment setup

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 14+
- npm or yarn

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run dev
```

Server runs on http://localhost:3000

See [backend/README.md](backend/README.md) for detailed instructions.

## 📁 Project Structure

```
AI-WhatsApp-sales-assistant/
├── backend/              # Node.js + TypeScript backend
│   ├── src/
│   │   ├── config/      # Database & app configuration
│   │   ├── entities/    # TypeORM entities (8 models)
│   │   ├── controllers/ # Route controllers
│   │   ├── services/    # Business logic
│   │   ├── routes/      # API routes
│   │   └── server.ts    # Express entry point
│   ├── .env.example
│   └── README.md
├── frontend/            # React + TypeScript PWA (Phase 4)
├── adk/                 # Google ADK agents (Phase 3)
├── Roadmap.rtf         # Detailed roadmap
├── Comprehensive blueprints.rtf  # Architecture guide
└── Google adk implementation.rtf # ADK guide
```

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express
- **Language**: TypeScript
- **ORM**: TypeORM
- **Database**: PostgreSQL
- **Validation**: TypeORM decorators

### Frontend (Phase 4)
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **State**: React Query + Zustand
- **PWA**: Vite PWA plugin

### AI & Integration
- **AI Orchestration**: Google ADK
- **Models**: Gemini 2.5 Flash/Pro, Claude via LiteLLM
- **WhatsApp**: Twilio WhatsApp Business API
- **Document Search**: Google File Search API
- **Queue**: BullMQ with Redis

## 📝 Environment Variables

### Backend (.env)

```env
# Server
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=whatsapp_ai

# Twilio (Phase 2)
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_WHATSAPP_NUMBER=+14155238886

# Google Cloud (Phase 5)
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json

# AI APIs (Phase 3)
GEMINI_API_KEY=your_key
ANTHROPIC_API_KEY=your_key
```

## 🎨 Design System

Reference: `DESIGN_SYSTEM.json` (from blueprints)

**Colors:**
- Primary: Emerald Green (#10B981)
- Success: Green (#22C55E)
- Warning: Amber (#F59E0B)
- Error: Red (#EF4444)
- Background: White (#FFFFFF)
- Text: Slate (#1E293B)

## 📊 Database Schema

### Relationships
- Business → hasMany → [Customers, Products, FAQs, Conversations]
- Customer → hasMany → [Conversations, FollowUps]
- Conversation → hasMany → [Messages, AIInteractions]
- Customer ↔ Business (many-to-one)

### Key Features
- UUID primary keys
- Proper indexes for performance
- Cascade deletes
- JSONB for flexible metadata
- Timestamps on all entities

## 🔒 Security

- Helmet.js for security headers
- CORS configured for frontend
- Rate limiting (100 req/15min)
- Environment variable protection
- Twilio webhook signature verification (Phase 2)
- JWT authentication (Phase 4)

## 📈 Next Steps

1. ✅ **Phase 1 Complete** - Backend foundation is ready
2. 🔄 **Phase 2 Next** - Implement Twilio WhatsApp integration
3. Follow the comprehensive guides in project root

## 🤝 Contributing

This is a focused project following a specific implementation plan. Phase-by-phase development.

## 📄 License

ISC

## 👤 Author

BeardedSum

## 🙏 Acknowledgments

- Built with guidance from comprehensive implementation guides
- Designed for Nigerian small businesses
- Focus on practical, production-ready solutions

---

**Ready for Phase 2!** 🚀

See implementation guides for detailed next steps.
