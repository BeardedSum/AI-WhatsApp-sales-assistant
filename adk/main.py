"""
AI Orchestrator for WhatsApp Assistant
Uses LiteLLM for multi-model support with function calling
"""
import os
import json
import sys
import argparse
from typing import Dict, Any, List
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '../backend/.env'))

# Import tools
from tools import TOOLS_METADATA, TOOL_FUNCTIONS
from database import db

# Import LiteLLM
try:
    from litellm import completion
except ImportError:
    print("❌ LiteLLM not installed. Run: pip install litellm")
    sys.exit(1)


class AIOrchestrator:
    """
    AI Orchestrator for processing customer messages
    Uses LiteLLM with function calling for intelligent responses
    """

    def __init__(self):
        """Initialize orchestrator"""
        self.model = os.getenv('AI_MODEL', 'gemini/gemini-2.0-flash-exp')
        self.api_key = os.getenv('GEMINI_API_KEY') or os.getenv('ANTHROPIC_API_KEY')
        self.confidence_threshold = float(os.getenv('AI_CONFIDENCE_THRESHOLD', '0.85'))

    def process_message(
        self,
        customer_message: str,
        conversation_id: str,
        business_id: str,
        customer_id: str
    ) -> Dict[str, Any]:
        """
        Process customer message and generate AI response

        Args:
            customer_message: The customer's message
            conversation_id: UUID of the conversation
            business_id: UUID of the business
            customer_id: UUID of the customer

        Returns:
            Dict with response and metadata
        """
        try:
            start_time = datetime.now()

            # Get context
            business = db.get_business(business_id)
            conversation_history = db.get_conversation_messages(conversation_id, limit=5)

            if not business:
                return self._error_response("Business not found")

            # Build system prompt
            system_prompt = self._build_system_prompt(business)

            # Build conversation history for AI
            messages = [{"role": "system", "content": system_prompt}]

            # Add recent conversation history
            for msg in conversation_history:
                role = "user" if msg['sender_type'] == 'customer' else "assistant"
                messages.append({
                    "role": role,
                    "content": msg['content']
                })

            # Add current message
            messages.append({
                "role": "user",
                "content": customer_message
            })

            # Initial AI call with tools
            print(f"🤖 Calling {self.model} with function calling...")

            response = completion(
                model=self.model,
                messages=messages,
                tools=TOOLS_METADATA,
                tool_choice="auto",
                temperature=0.7,
                max_tokens=500
            )

            # Handle tool calls
            tools_used = []
            tool_results = []

            if response.choices[0].message.tool_calls:
                print(f"🔧 AI wants to use {len(response.choices[0].message.tool_calls)} tool(s)")

                for tool_call in response.choices[0].message.tool_calls:
                    function_name = tool_call.function.name
                    function_args = json.loads(tool_call.function.arguments)

                    print(f"   - {function_name}({function_args})")

                    # Execute tool
                    if function_name in TOOL_FUNCTIONS:
                        tool_function = TOOL_FUNCTIONS[function_name]
                        tool_result = tool_function(**function_args)
                        tool_results.append({
                            "tool_call_id": tool_call.id,
                            "role": "tool",
                            "name": function_name,
                            "content": json.dumps(tool_result)
                        })
                        tools_used.append(function_name)

                # Add tool results to conversation
                messages.append(response.choices[0].message)
                messages.extend(tool_results)

                # Get final response with tool results
                print("🤖 Getting final response with tool results...")
                final_response = completion(
                    model=self.model,
                    messages=messages,
                    temperature=0.7,
                    max_tokens=500
                )

                ai_response = final_response.choices[0].message.content

            else:
                # No tools needed, use direct response
                ai_response = response.choices[0].message.content

            # Calculate confidence score
            confidence_score = self._calculate_confidence(
                ai_response,
                tools_used,
                customer_message
            )

            # Calculate processing time
            processing_time = int((datetime.now() - start_time).total_seconds() * 1000)

            print(f"✅ AI response generated (confidence: {confidence_score:.2f})")

            return {
                "success": True,
                "response": ai_response,
                "confidence": confidence_score,
                "tools_used": tools_used,
                "processing_time_ms": processing_time,
                "model_used": self.model,
                "should_escalate": confidence_score < self.confidence_threshold
            }

        except Exception as e:
            print(f"❌ Error in AI orchestrator: {e}")
            return self._error_response(str(e))

    def _build_system_prompt(self, business: Dict[str, Any]) -> str:
        """Build system prompt based on business context"""
        tone = business.get('ai_tone', 'friendly')
        custom_instructions = business.get('ai_custom_instructions', '')

        prompt = f"""You are a helpful AI assistant for {business['name']}.

Business Information:
- Name: {business['name']}
- Location: {business.get('location', 'Nigeria')}

Your Communication Style:
- Tone: {tone.title()}
- Use Nigerian English appropriately (e.g., "How far?", "I dey for you")
- Be warm, friendly, and helpful
- Keep responses concise (2-3 sentences unless detail is needed)

Your Capabilities:
1. Search products using lookup_products tool
2. Answer FAQs using lookup_faqs tool
3. Search documents using search_business_documents tool
4. Escalate complex issues using escalate_conversation tool
5. Schedule follow-ups using schedule_followup tool

Important Guidelines:
- If you don't have information, say so honestly
- For orders, ask for: name, address, phone, items
- Never make up prices or product availability
- If unsure or customer needs human help, escalate
- Be professional but personable

{custom_instructions}

Today's Date: {datetime.now().strftime('%Y-%m-%d')}
"""
        return prompt

    def _calculate_confidence(
        self,
        response: str,
        tools_used: List[str],
        customer_message: str
    ) -> float:
        """
        Calculate confidence score for the AI response

        Args:
            response: The AI's response
            tools_used: List of tools that were used
            customer_message: Original customer message

        Returns:
            Confidence score between 0 and 1
        """
        confidence = 0.5  # Base confidence

        # Increase confidence if tools were used successfully
        if tools_used:
            confidence += 0.2

        # Check for uncertainty phrases
        uncertainty_phrases = [
            "i'm not sure",
            "i don't know",
            "i cannot",
            "i can't",
            "let me connect you",
            "speak with our team"
        ]

        response_lower = response.lower()
        if any(phrase in response_lower for phrase in uncertainty_phrases):
            confidence -= 0.3

        # Increase confidence for specific information
        if any(word in response_lower for word in ['ngn', 'naira', '₦', 'price']):
            confidence += 0.1

        # Ensure confidence is between 0 and 1
        confidence = max(0.0, min(1.0, confidence))

        return confidence

    def _error_response(self, error: str) -> Dict[str, Any]:
        """Generate error response"""
        return {
            "success": False,
            "response": "I apologize, but I'm having trouble processing your message right now. Let me connect you with our team.",
            "confidence": 0.0,
            "tools_used": [],
            "processing_time_ms": 0,
            "model_used": self.model,
            "should_escalate": True,
            "error": error
        }


def main():
    """Main entry point for CLI"""
    parser = argparse.ArgumentParser(description='AI Orchestrator CLI')
    parser.add_argument('--action', required=True, help='Action to perform')
    parser.add_argument('--data', required=True, help='JSON data for action')

    args = parser.parse_args()
    data = json.loads(args.data)

    orchestrator = AIOrchestrator()

    if args.action == 'process_message':
        result = orchestrator.process_message(
            customer_message=data['customer_message'],
            conversation_id=data['conversation_id'],
            business_id=data['business_id'],
            customer_id=data['customer_id']
        )
        print(json.dumps(result))
    else:
        print(json.dumps({"error": "Unknown action"}))
        sys.exit(1)


if __name__ == '__main__':
    main()
