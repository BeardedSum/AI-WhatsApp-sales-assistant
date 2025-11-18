"""
ADK Tool Definitions
Functions that agents can call to interact with the system
"""
import os
import json
from typing import Dict, List, Any
from database import db
from datetime import datetime, timedelta


def search_business_documents(
    query: str,
    business_id: str
) -> Dict[str, Any]:
    """
    Search the business's knowledge base in Google Drive for relevant information.

    This tool would integrate with Google File Search API in Phase 5.
    For Phase 3, we return a placeholder response.

    Args:
        query: Natural language search query (e.g., "blue dress price")
        business_id: UUID of the business

    Returns:
        Dict with documents found and their content snippets
    """
    # Get business
    business = db.get_business(business_id)

    if not business:
        return {
            "success": False,
            "message": "Business not found",
            "documents": []
        }

    # Check if knowledge base is configured
    if not business.get('knowledge_base_google_drive_folder_id'):
        return {
            "success": False,
            "message": "No knowledge base configured. Document search available in Phase 5.",
            "documents": []
        }

    # Placeholder for Phase 5 Google Drive integration
    return {
        "success": False,
        "message": "Document search will be implemented in Phase 5",
        "documents": []
    }


def lookup_products(
    search_term: str,
    business_id: str
) -> Dict[str, Any]:
    """
    Search for products in the business catalog.

    Args:
        search_term: Product name, category, or description keyword
        business_id: UUID of the business

    Returns:
        Dict with matching products and their details
    """
    try:
        products = db.search_products(business_id, search_term, limit=5)

        if not products:
            return {
                "success": False,
                "message": f"No products found matching '{search_term}'",
                "products": []
            }

        # Format products for AI consumption
        formatted_products = []
        for p in products:
            product_info = {
                "name": p['name'],
                "description": p['description'] or "No description",
                "price": f"{p['currency']} {float(p['price']):,.2f}",
                "in_stock": p['stock_quantity'] > 0,
                "stock_status": p['stock_status']
            }

            # Add optional fields if present
            if p.get('sizes'):
                product_info['available_sizes'] = p['sizes']
            if p.get('colors'):
                product_info['available_colors'] = p['colors']
            if p.get('category'):
                product_info['category'] = p['category']

            formatted_products.append(product_info)

        return {
            "success": True,
            "products": formatted_products,
            "count": len(formatted_products),
            "message": f"Found {len(formatted_products)} product(s)"
        }

    except Exception as e:
        return {
            "success": False,
            "message": f"Error searching products: {str(e)}",
            "products": []
        }


def lookup_faqs(
    question: str,
    business_id: str
) -> Dict[str, Any]:
    """
    Find relevant FAQs for the customer's question.

    Args:
        question: Customer's question
        business_id: UUID of the business

    Returns:
        Dict with matching FAQs
    """
    try:
        faqs = db.search_faqs(business_id, question, limit=3)

        if not faqs:
            return {
                "success": False,
                "message": "No FAQs found",
                "faqs": []
            }

        # Format FAQs
        formatted_faqs = [
            {
                "question": faq['question'],
                "answer": faq['answer'],
                "category": faq.get('category', 'General')
            }
            for faq in faqs
        ]

        return {
            "success": True,
            "faqs": formatted_faqs,
            "count": len(formatted_faqs),
            "message": f"Found {len(formatted_faqs)} relevant FAQ(s)"
        }

    except Exception as e:
        return {
            "success": False,
            "message": f"Error searching FAQs: {str(e)}",
            "faqs": []
        }


def send_whatsapp_message(
    to: str,
    message: str
) -> Dict[str, Any]:
    """
    Send a WhatsApp message to a customer.

    Note: This is called through Node.js service, not directly from Python.
    This function is here for tool definition purposes.

    Args:
        to: Customer's WhatsApp number (without 'whatsapp:' prefix)
        message: Message content to send

    Returns:
        Dict with message ID and delivery status
    """
    # This will be handled by Node.js WhatsAppService
    return {
        "success": True,
        "message": "Message will be sent by Node.js service",
        "note": "Actual sending happens in Node.js layer"
    }


def escalate_conversation(
    conversation_id: str,
    reason: str,
    holding_message: str
) -> Dict[str, Any]:
    """
    Escalate conversation to business owner.

    Args:
        conversation_id: UUID of the conversation
        reason: Why escalation is needed
        holding_message: Message to send to customer while waiting

    Returns:
        Dict with escalation status
    """
    try:
        # Get conversation details
        conversation = db.get_conversation(conversation_id)

        if not conversation:
            return {
                "success": False,
                "message": "Conversation not found"
            }

        # Update conversation status in database
        with db.connection.cursor() as cursor:
            query = """
                UPDATE conversations
                SET status = 'escalated',
                    handled_by = 'human',
                    escalation_reason = %s,
                    escalated_at = %s
                WHERE id = %s
            """
            cursor.execute(query, (reason, datetime.utcnow(), conversation_id))
            db.connection.commit()

        return {
            "success": True,
            "conversation_id": conversation_id,
            "status": "escalated",
            "reason": reason,
            "holding_message": holding_message,
            "message": "Conversation escalated successfully"
        }

    except Exception as e:
        return {
            "success": False,
            "message": f"Error escalating conversation: {str(e)}"
        }


def schedule_followup(
    customer_id: str,
    message_template: str,
    hours_delay: int
) -> Dict[str, Any]:
    """
    Schedule a follow-up message to customer.

    Args:
        customer_id: UUID of the customer
        message_template: Message to send later
        hours_delay: Hours to wait before sending (24, 48, 72)

    Returns:
        Dict with scheduled follow-up ID
    """
    try:
        scheduled_time = datetime.utcnow() + timedelta(hours=hours_delay)

        # Insert into follow_up_queue
        with db.connection.cursor() as cursor:
            query = """
                INSERT INTO follow_up_queue
                (customer_id, message_template, scheduled_for, status)
                VALUES (%s, %s, %s, 'pending')
                RETURNING id
            """
            cursor.execute(query, (customer_id, message_template, scheduled_time))
            followup_id = cursor.fetchone()['id']
            db.connection.commit()

        return {
            "success": True,
            "followup_id": str(followup_id),
            "scheduled_for": scheduled_time.isoformat(),
            "message": f"Follow-up scheduled for {hours_delay} hours from now"
        }

    except Exception as e:
        return {
            "success": False,
            "message": f"Error scheduling follow-up: {str(e)}"
        }


# Tool metadata for LiteLLM function calling
TOOLS_METADATA = [
    {
        "type": "function",
        "function": {
            "name": "search_business_documents",
            "description": "Search the business's knowledge base in Google Drive for relevant information about products, services, or policies",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Natural language search query (e.g., 'blue dress price', 'delivery policy')"
                    },
                    "business_id": {
                        "type": "string",
                        "description": "UUID of the business"
                    }
                },
                "required": ["query", "business_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "lookup_products",
            "description": "Search for products in the business catalog by name, category, or description keywords",
            "parameters": {
                "type": "object",
                "properties": {
                    "search_term": {
                        "type": "string",
                        "description": "Product name, category, or keyword to search for"
                    },
                    "business_id": {
                        "type": "string",
                        "description": "UUID of the business"
                    }
                },
                "required": ["search_term", "business_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "lookup_faqs",
            "description": "Find relevant FAQs to answer the customer's question about policies, delivery, payments, etc.",
            "parameters": {
                "type": "object",
                "properties": {
                    "question": {
                        "type": "string",
                        "description": "Customer's question"
                    },
                    "business_id": {
                        "type": "string",
                        "description": "UUID of the business"
                    }
                },
                "required": ["question", "business_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "escalate_conversation",
            "description": "Escalate the conversation to a human agent when the AI cannot handle the request",
            "parameters": {
                "type": "object",
                "properties": {
                    "conversation_id": {
                        "type": "string",
                        "description": "UUID of the conversation"
                    },
                    "reason": {
                        "type": "string",
                        "description": "Brief explanation of why escalation is needed"
                    },
                    "holding_message": {
                        "type": "string",
                        "description": "Polite message to send to customer while waiting for human agent"
                    }
                },
                "required": ["conversation_id", "reason", "holding_message"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "schedule_followup",
            "description": "Schedule a follow-up message to be sent to the customer after a specified delay",
            "parameters": {
                "type": "object",
                "properties": {
                    "customer_id": {
                        "type": "string",
                        "description": "UUID of the customer"
                    },
                    "message_template": {
                        "type": "string",
                        "description": "Message to send later"
                    },
                    "hours_delay": {
                        "type": "integer",
                        "description": "Hours to wait before sending (24, 48, or 72)",
                        "enum": [24, 48, 72]
                    }
                },
                "required": ["customer_id", "message_template", "hours_delay"]
            }
        }
    }
]


# Function dispatcher for tool calls
TOOL_FUNCTIONS = {
    "search_business_documents": search_business_documents,
    "lookup_products": lookup_products,
    "lookup_faqs": lookup_faqs,
    "send_whatsapp_message": send_whatsapp_message,
    "escalate_conversation": escalate_conversation,
    "schedule_followup": schedule_followup
}
