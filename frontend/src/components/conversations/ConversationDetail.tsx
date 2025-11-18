import React, { useState, useEffect, useRef } from 'react';
import { Send, UserCog, CheckCircle } from 'lucide-react';
import { Card, CardHeader } from '../common/Card';
import { Button } from '../common/Button';
import { Badge, getStatusBadge } from '../common/Badge';
import { TextArea } from '../common/Input';
import { MessageBubble } from './MessageBubble';
import { useTakeoverConversation, useSendMessage, useResolveConversation } from '../../hooks/useConversations';
import type { Conversation, Message } from '../../types';

interface ConversationDetailProps {
  conversation: Conversation;
  messages: Message[];
}

export const ConversationDetail: React.FC<ConversationDetailProps> = ({
  conversation,
  messages,
}) => {
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const takeoverMutation = useTakeoverConversation();
  const sendMessageMutation = useSendMessage();
  const resolveMutation = useResolveConversation();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleTakeover = async () => {
    try {
      await takeoverMutation.mutateAsync({
        id: conversation.id,
        data: { reason: 'Manual takeover from dashboard' },
      });
    } catch (error) {
      console.error('Failed to takeover conversation:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    try {
      await sendMessageMutation.mutateAsync({
        id: conversation.id,
        data: {
          content: messageText,
          message_type: 'text',
        },
      });
      setMessageText('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleResolve = async () => {
    try {
      await resolveMutation.mutateAsync(conversation.id);
    } catch (error) {
      console.error('Failed to resolve conversation:', error);
    }
  };

  return (
    <Card className="h-full flex flex-col" padding="none">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <CardHeader
          title={conversation.customer?.name || 'Unknown Customer'}
          subtitle={conversation.customer?.whatsapp_number}
          action={
            <div className="flex items-center gap-2">
              {getStatusBadge(conversation.status)}
              <Badge variant={conversation.is_human_handled ? 'warning' : 'primary'}>
                {conversation.is_human_handled ? 'Human Handled' : 'AI Handled'}
              </Badge>
            </div>
          }
          className="mb-0"
        />

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          {!conversation.is_human_handled && conversation.status !== 'resolved' && (
            <Button
              variant="warning"
              size="sm"
              leftIcon={<UserCog size={16} />}
              onClick={handleTakeover}
              loading={takeoverMutation.isPending}
            >
              Take Over
            </Button>
          )}
          {conversation.status !== 'resolved' && (
            <Button
              variant="success"
              size="sm"
              leftIcon={<CheckCircle size={16} />}
              onClick={handleResolve}
              loading={resolveMutation.isPending}
            >
              Resolve
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-secondary">No messages yet</p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      {conversation.is_human_handled && conversation.status !== 'resolved' && (
        <form onSubmit={handleSendMessage} className="p-4 border-t border-border">
          <div className="flex gap-2">
            <TextArea
              placeholder="Type your message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              fullWidth
              className="resize-none min-h-[60px]"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            />
            <Button
              type="submit"
              variant="primary"
              leftIcon={<Send size={18} />}
              loading={sendMessageMutation.isPending}
              disabled={!messageText.trim()}
            >
              Send
            </Button>
          </div>
          <p className="text-xs text-text-tertiary mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </form>
      )}

      {conversation.status === 'resolved' && (
        <div className="p-4 border-t border-border bg-success-50">
          <p className="text-sm text-success-600 text-center">
            This conversation has been resolved
          </p>
        </div>
      )}
    </Card>
  );
};
