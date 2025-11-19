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

### ✅ Phase 3: AI Intelligence with LiteLLM (COMPLETED)

**What's Built:**
- LiteLLM AI orchestrator with function calling
- 6 AI tools (products, FAQs, documents, escalation, followup)
- Multi-model support (Gemini Flash/Pro, Claude, GPT-4)
- Intelligent conversation handling with history
- Confidence scoring and automatic escalation
- Database-powered context gathering
- AIInteraction logging for analytics

**AI Capabilities:**
- Product lookups from database
- FAQ matching
- Document search (Phase 5)
- Conversation escalation to humans
- Follow-up scheduling
- Nigerian English support
- Per-business AI tone (friendly/formal/custom)

See [adk/README.md](adk/README.md) for setup and [PHASE3_COMPLETION.md](PHASE3_COMPLETION.md) for details.

### ✅ Phase 4: Frontend Dashboard & Backend API (COMPLETED)

**What's Built:**

**Frontend:**
- React 18.3 + TypeScript + Vite PWA
- TailwindCSS with custom design system
- Complete dashboard with analytics
- Conversation management (list, detail, takeover, messaging)
- Product CRUD interface
- FAQ CRUD interface
- Business settings page
- JWT authentication
- Real-time polling (5-second intervals)
- ~6,000 lines of production-ready code

**Backend API:**
- 6 new controllers (auth, dashboard, conversations, products, faqs, business)
- 18 REST API endpoints
- JWT authentication middleware
- Complete integration with frontend
- Business-scoped data isolation
- TypeScript type-safe implementation

**Tech Stack:**
- Frontend: React 18, Vite 6, TailwindCSS 3.4, TanStack Query, Zustand, React Router 7
- Backend: Express controllers with TypeORM, JWT tokens
- State: Server state (TanStack Query) + Client state (Zustand)
- PWA: Service worker with offline support

See [PHASE4_COMPLETE.md](PHASE4_COMPLETE.md) and [BACKEND_API_REQUIREMENTS.md](BACKEND_API_REQUIREMENTS.md) for details.

### ✅ Phase 5: Google File Search (COMPLETED)

**What's Built:**
- Document upload and management
- AI document search integration via `search_business_documents` tool
- Knowledge base management with Google Drive (optional)
- Document CRUD API endpoints
- Metadata-only mode with graceful fallback
- Document usage tracking (times_searched)

**Features:**
- Document entity for tracking uploaded files
- Google Drive service with automatic fallback
- 5 API endpoints: list, upload, search, update, delete
- AI can search business knowledge base
- Works without Google Drive credentials

See [PHASE5_AND_6_COMPLETION.md](PHASE5_AND_6_COMPLETION.md) for detailed documentation.

### ✅ Phase 6: Advanced Features (COMPLETED)

**What's Built:**
- BullMQ queue system with Redis (with setTimeout fallback)
- Automated follow-up message execution
- Broadcast messaging to customers
- Advanced analytics with chart data
- Queue monitoring and statistics
- Target audience selection (all/active/custom)

**Features:**
- Broadcast entity for campaign management
- Queue service for async job processing
- 5 broadcast API endpoints
- Scheduled broadcasts with delay
- Progress tracking (sent/failed counts)
- Advanced analytics endpoint with time series data
- Graceful degradation without Redis

See [PHASE5_AND_6_COMPLETION.md](PHASE5_AND_6_COMPLETION.md) for detailed documentation.

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

## 📈 Progress Summary

1. ✅ **Phase 1 Complete** - Backend foundation with 8 entities
2. ✅ **Phase 2 Complete** - Twilio WhatsApp integration
3. ✅ **Phase 3 Complete** - AI Intelligence with LiteLLM
4. ✅ **Phase 4 Complete** - Frontend Dashboard + Backend API
5. ✅ **Phase 5 Complete** - Document Search & Knowledge Base
6. ✅ **Phase 6 Complete** - Advanced Features (BullMQ, Broadcasts, Analytics)
7. 🔄 **Phase 7 Next** - Testing & Deployment

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

**6 Phases Complete!** 🚀🎉

The system is now fully functional with:
- Complete backend API (26 endpoints)
- AI-powered WhatsApp responses with document search
- Professional dashboard UI
- Real-time conversation management
- Product & FAQ management
- Document management and AI search
- Broadcast messaging to customers
- Automated follow-up execution
- Advanced analytics with charts
- BullMQ queue system

**Progress**: 6/7 Phases (86%)
**Next**: Phase 7 - Testing & Deployment

See implementation guides and completion docs for details.
