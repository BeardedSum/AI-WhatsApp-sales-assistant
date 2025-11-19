"""
Database helper for ADK tools
Provides access to PostgreSQL database from Python
"""
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '../backend/.env'))


class Database:
    """Database connection and query helper"""

    def __init__(self):
        """Initialize database connection"""
        self.connection = None
        self.connect()

    def connect(self):
        """Establish database connection"""
        try:
            self.connection = psycopg2.connect(
                host=os.getenv('DB_HOST', 'localhost'),
                port=os.getenv('DB_PORT', '5432'),
                user=os.getenv('DB_USERNAME', 'postgres'),
                password=os.getenv('DB_PASSWORD', 'postgres'),
                database=os.getenv('DB_NAME', 'whatsapp_ai'),
                cursor_factory=RealDictCursor
            )
            print("✅ Database connected successfully")
        except Exception as e:
            print(f"❌ Database connection error: {e}")
            raise

    def close(self):
        """Close database connection"""
        if self.connection:
            self.connection.close()

    def execute_query(self, query: str, params: tuple = None) -> List[Dict[str, Any]]:
        """
        Execute a SELECT query and return results as list of dicts

        Args:
            query: SQL query string
            params: Query parameters tuple

        Returns:
            List of dictionaries with query results
        """
        try:
            with self.connection.cursor() as cursor:
                cursor.execute(query, params)
                results = cursor.fetchall()
                return [dict(row) for row in results]
        except Exception as e:
            print(f"❌ Query execution error: {e}")
            return []

    def get_business(self, business_id: str) -> Optional[Dict[str, Any]]:
        """Get business by ID"""
        query = """
            SELECT * FROM businesses
            WHERE id = %s AND is_active = true
        """
        results = self.execute_query(query, (business_id,))
        return results[0] if results else None

    def search_products(
        self,
        business_id: str,
        search_term: str,
        limit: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Search products by name, description, category, or tags

        Args:
            business_id: Business UUID
            search_term: Search keyword
            limit: Maximum results

        Returns:
            List of matching products
        """
        query = """
            SELECT
                id, name, description, category, price, currency,
                stock_quantity, stock_status, image_urls, sizes, colors, tags
            FROM products
            WHERE business_id = %s
            AND is_active = true
            AND (
                LOWER(name) LIKE LOWER(%s)
                OR LOWER(description) LIKE LOWER(%s)
                OR LOWER(category) LIKE LOWER(%s)
                OR %s = ANY(tags)
            )
            ORDER BY times_inquired DESC, name ASC
            LIMIT %s
        """
        search_pattern = f"%{search_term}%"
        results = self.execute_query(
            query,
            (business_id, search_pattern, search_pattern, search_pattern, search_term.lower(), limit)
        )

        # Increment times_inquired counter
        if results:
            product_ids = [p['id'] for p in results]
            self.increment_product_inquiries(product_ids)

        return results

    def increment_product_inquiries(self, product_ids: List[str]):
        """Increment times_inquired counter for products"""
        try:
            with self.connection.cursor() as cursor:
                query = """
                    UPDATE products
                    SET times_inquired = times_inquired + 1
                    WHERE id = ANY(%s)
                """
                cursor.execute(query, (product_ids,))
                self.connection.commit()
        except Exception as e:
            print(f"❌ Error incrementing product inquiries: {e}")
            self.connection.rollback()

    def search_faqs(
        self,
        business_id: str,
        question: str,
        limit: int = 3
    ) -> List[Dict[str, Any]]:
        """
        Search FAQs by question text or keywords

        Args:
            business_id: Business UUID
            question: Customer question
            limit: Maximum results

        Returns:
            List of matching FAQs
        """
        query = """
            SELECT
                id, question, answer, category, keywords, times_asked
            FROM faqs
            WHERE business_id = %s
            AND is_active = true
            AND (
                LOWER(question) LIKE LOWER(%s)
                OR LOWER(answer) LIKE LOWER(%s)
                OR %s = ANY(keywords)
            )
            ORDER BY priority DESC, times_asked DESC
            LIMIT %s
        """
        search_pattern = f"%{question}%"
        results = self.execute_query(
            query,
            (business_id, search_pattern, search_pattern, question.lower(), limit)
        )

        # Increment times_asked counter
        if results:
            faq_ids = [f['id'] for f in results]
            self.increment_faq_usage(faq_ids)

        return results

    def increment_faq_usage(self, faq_ids: List[str]):
        """Increment times_asked counter for FAQs"""
        try:
            with self.connection.cursor() as cursor:
                query = """
                    UPDATE faqs
                    SET times_asked = times_asked + 1
                    WHERE id = ANY(%s)
                """
                cursor.execute(query, (faq_ids,))
                self.connection.commit()
        except Exception as e:
            print(f"❌ Error incrementing FAQ usage: {e}")
            self.connection.rollback()

    def get_conversation(self, conversation_id: str) -> Optional[Dict[str, Any]]:
        """Get conversation details"""
        query = """
            SELECT * FROM conversations WHERE id = %s
        """
        results = self.execute_query(query, (conversation_id,))
        return results[0] if results else None

    def get_conversation_messages(
        self,
        conversation_id: str,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Get last N messages from conversation

        Args:
            conversation_id: Conversation UUID
            limit: Number of messages to retrieve

        Returns:
            List of messages (oldest first)
        """
        query = """
            SELECT
                sender_type, content, message_type,
                ai_confidence_score, created_at
            FROM messages
            WHERE conversation_id = %s
            ORDER BY created_at DESC
            LIMIT %s
        """
        results = self.execute_query(query, (conversation_id, limit))
        return list(reversed(results))  # Oldest first

    def get_customer(self, customer_id: str) -> Optional[Dict[str, Any]]:
        """Get customer details"""
        query = """
            SELECT * FROM customers WHERE id = %s
        """
        results = self.execute_query(query, (customer_id,))
        return results[0] if results else None


# Global database instance
db = Database()

    def search_documents(self, business_id: str, query: str, limit: int = 5):
        """Search documents by name or description"""
        search_query = """
            SELECT
                id, name, description, file_type,
                google_drive_file_id, google_drive_url, created_at
            FROM documents
            WHERE business_id = %s
            AND is_active = true
            AND (
                LOWER(name) LIKE LOWER(%s)
                OR LOWER(COALESCE(description, '')) LIKE LOWER(%s)
            )
            ORDER BY created_at DESC
            LIMIT %s
        """
        search_pattern = f"%{query}%"
        results = self.execute_query(
            search_query,
            (business_id, search_pattern, search_pattern, limit)
        )
        return results

