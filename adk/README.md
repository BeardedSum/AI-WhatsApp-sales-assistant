# AI Orchestrator (ADK) - Phase 3

AI intelligence layer using LiteLLM with function calling for intelligent WhatsApp responses.

## Overview

This Python module provides AI-powered conversation handling with:
- **Function calling** for tool usage (products, FAQs, documents)
- **Multi-model support** via LiteLLM (Gemini, Claude, GPT-4, etc.)
- **Confidence scoring** for intelligent escalation
- **Database integration** for context and history

## Architecture

```
Customer Message → Node.js Webhook → Python AI Orchestrator
                                           ↓
                                    [LiteLLM with Tools]
                                           ↓
                                    ┌──────┴──────┐
                                    │   lookup    │
                                    │  - products │
                                    │  - FAQs     │
                                    │  - docs     │
                                    └──────┬──────┘
                                           ↓
                                    AI Response + Confidence
                                           ↓
                                    Node.js → WhatsApp
```

## Files

- `main.py` - AI orchestrator with LiteLLM function calling
- `tools.py` - 6 tool definitions (products, FAQs, escalation, etc.)
- `database.py` - PostgreSQL helper for tool data access
- `requirements.txt` - Python dependencies

## Installation

### 1. Create Python Virtual Environment

```bash
cd adk
python3 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate

# On Windows:
venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

**Dependencies:**
- `litellm` - Unified LLM interface with function calling
- `google-generativeai` - Gemini API
- `anthropic` - Claude API (optional)
- `psycopg2-binary` - PostgreSQL driver
- `python-dotenv` - Environment variables

### 3. Configure Environment

The ADK reads from `../backend/.env`:

```env
# AI Model Configuration
AI_MODEL=gemini/gemini-2.0-flash-exp
GEMINI_API_KEY=your_gemini_api_key_here

# Or use Claude
AI_MODEL=claude-3-5-sonnet-20241022
ANTHROPIC_API_KEY=your_anthropic_key_here

# Database (already configured from Phase 1)
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=whatsapp_ai

# AI Settings
AI_CONFIDENCE_THRESHOLD=0.85
```

### 4. Get API Keys

#### Option A: Google Gemini (Recommended for cost)
1. Go to https://makersuite.google.com/app/apikey
2. Create API key
3. Add to `.env`: `GEMINI_API_KEY=your_key`

#### Option B: Anthropic Claude (Best quality)
1. Go to https://console.anthropic.com
2. Create API key
3. Add to `.env`: `ANTHROPIC_API_KEY=your_key`

## Usage

### Test Directly

```bash
python main.py \
  --action process_message \
  --data '{
    "customer_message": "Do you have blue shirts?",
    "conversation_id": "conv-123",
    "business_id": "biz-456",
    "customer_id": "cust-789"
  }'
```

### Via Node.js (Production)

The Node.js backend automatically calls Python:

```typescript
import { aiOrchestratorService } from './services/ai-orchestrator.service';

const result = await aiOrchestratorService.processMessage({
  customerMessage: "Do you have blue shirts?",
  conversationId: conversationId,
  businessId: businessId,
  customerId: customerId
});

console.log(result.response);      // AI response
console.log(result.confidence);    // 0.0 - 1.0
console.log(result.toolsUsed);     // ['lookup_products']
console.log(result.shouldEscalate); // false
```

## Tools Available

### 1. lookup_products
Search business product catalog by name, category, or keywords.

**Example:**
- Customer: "Do you have blue shirts?"
- AI uses: `lookup_products("blue shirt", business_id)`
- Returns: Products with prices, stock, sizes, colors

### 2. lookup_faqs
Find relevant FAQs for customer questions.

**Example:**
- Customer: "What's your delivery time?"
- AI uses: `lookup_faqs("delivery time", business_id)`
- Returns: Matching FAQ answers

### 3. search_business_documents
Search uploaded documents in Google Drive (Phase 5).

**Status:** Placeholder - implemented in Phase 5

### 4. escalate_conversation
Escalate to human when AI can't handle request.

**Triggered when:**
- Confidence < 0.85
- Customer asks for human
- Complex negotiation

### 5. schedule_followup
Schedule future message to customer.

**Example:**
- AI schedules: "Check back in 24 hours if no response"

## Confidence Scoring

The AI calculates confidence based on:

| Factor | Impact |
|--------|--------|
| Base confidence | 0.5 |
| Tools used successfully | +0.2 |
| Uncertainty phrases ("I'm not sure") | -0.3 |
| Specific info (prices, dates) | +0.1 |

**Escalation Threshold:** 0.85 (configurable)

## Model Selection

### Gemini 2.0 Flash (Default)
- **Cost:** $0.00001875 / 1K tokens
- **Speed:** ~500ms response
- **Best for:** Most conversations

### Gemini 2.0 Pro
- **Cost:** $0.001875 / 1K tokens (100x more)
- **Speed:** ~1-2s response
- **Best for:** Complex reasoning

### Claude 3.5 Sonnet
- **Cost:** $3 / 1M tokens input
- **Speed:** ~1-2s response
- **Best for:** Highest quality responses

**Change model in `.env`:**
```env
AI_MODEL=gemini/gemini-2.0-flash-exp          # Fast & cheap
AI_MODEL=gemini/gemini-2.0-pro-exp            # Smart
AI_MODEL=claude-3-5-sonnet-20241022           # Best quality
```

## System Prompt

The AI is configured per business with:

```python
system_prompt = f"""
You are a helpful AI assistant for {business_name}.

Communication Style:
- Tone: {ai_tone}  # friendly/formal/custom
- Use Nigerian English appropriately
- Be warm and helpful
- Keep responses concise (2-3 sentences)

Your Capabilities:
1. Search products using lookup_products
2. Answer FAQs using lookup_faqs
3. Escalate using escalate_conversation
4. Schedule follow-ups

Guidelines:
- Never make up prices or availability
- If unsure, escalate to human
- For orders, collect: name, address, phone, items
"""
```

## Conversation History

The AI receives the last 5 messages for context:

```python
messages = [
  {"role": "system", "content": system_prompt},
  {"role": "user", "content": "Hi"},
  {"role": "assistant", "content": "Hello! How can I help?"},
  {"role": "user", "content": "Do you have blue shirts?"}
]
```

## Error Handling

```python
try:
    result = await processMessage(...)
except Exception as e:
    # Returns safe fallback
    return {
        "response": "Let me connect you with our team",
        "confidence": 0.0,
        "shouldEscalate": True
    }
```

## Logging

The AI logs to PostgreSQL `ai_interactions` table:

- Customer message
- AI response
- Confidence score
- Tools used
- Processing time
- Model used
- Escalation status

**View analytics:**
```sql
SELECT
    AVG(confidence_score) as avg_confidence,
    COUNT(*) as total_interactions,
    SUM(CASE WHEN was_escalated THEN 1 ELSE 0 END) as escalations
FROM ai_interactions
WHERE created_at > NOW() - INTERVAL '24 hours';
```

## Troubleshooting

### Python not found
```bash
# Check Python version
python3 --version  # Should be 3.9+

# Set path in .env
PYTHON_PATH=/usr/bin/python3
```

### LiteLLM errors
```bash
# Reinstall LiteLLM
pip uninstall litellm
pip install litellm --upgrade
```

### Database connection errors
```bash
# Check PostgreSQL is running
psql -U postgres -d whatsapp_ai -c "SELECT 1"

# Verify credentials in .env
```

### Import errors
```bash
# Ensure virtual environment is activated
source venv/bin/activate

# Reinstall all dependencies
pip install -r requirements.txt
```

## Performance

**Typical Response Times:**
- Database query: 50-100ms
- Gemini Flash: 300-800ms
- Gemini Pro: 1-2s
- Claude: 1-2s
- **Total:** 500ms - 2.5s

**Cost per Message:**
- Gemini Flash: ~$0.00001 (1,000 tokens)
- Gemini Pro: ~$0.001 (1,000 tokens)
- Claude: ~$0.003 (1,000 tokens)

**Recommended:** Start with Gemini Flash, upgrade to Pro/Claude for VIP customers.

## Next Steps

### Phase 4: Frontend Dashboard
- View AI interactions
- Manually take over conversations
- Adjust AI tone per business

### Phase 5: Document Search
- Implement `search_business_documents`
- Google Drive integration
- File indexing

### Phase 6: Advanced Features
- Broadcast messaging
- Scheduled follow-ups
- Analytics dashboard

---

**Phase 3 Status:** ✅ Complete

AI intelligence is now powering all WhatsApp conversations with function calling and intelligent escalation!
