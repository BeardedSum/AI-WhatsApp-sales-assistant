import React from 'react';
import { MessageSquare, Search } from 'lucide-react';
import { format } from 'date-fns';
import { Card } from '../common/Card';
import { Badge, getStatusBadge } from '../common/Badge';
import { Input } from '../common/Input';
import type { Conversation } from '../../types';

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  isLoading?: boolean;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedId,
  onSelect,
  isLoading,
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredConversations = conversations.filter((conv) => {
    const query = searchQuery.toLowerCase();
    return (
      conv.customer?.name?.toLowerCase().includes(query) ||
      conv.customer?.whatsapp_number?.includes(query)
    );
  });

  if (isLoading) {
    return (
      <Card className="h-full">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-text-secondary text-sm">Loading...</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col" padding="none">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-text-primary mb-3">
          Conversations
        </h2>
        <Input
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<Search size={18} />}
          fullWidth
        />
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {filteredConversations.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="text-text-tertiary mx-auto mb-3" size={48} />
            <p className="text-text-secondary">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredConversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => onSelect(conversation.id)}
                className={`w-full text-left p-4 hover:bg-bg-secondary transition-colors ${
                  selectedId === conversation.id ? 'bg-primary-50 border-l-4 border-primary' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-text-primary truncate">
                      {conversation.customer?.name || 'Unknown'}
                    </h3>
                    <p className="text-xs text-text-secondary truncate">
                      {conversation.customer?.whatsapp_number}
                    </p>
                  </div>
                  <div className="flex-shrink-0 ml-2">
                    {getStatusBadge(conversation.status)}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <Badge
                    variant={conversation.is_human_handled ? 'warning' : 'primary'}
                    size="sm"
                  >
                    {conversation.is_human_handled ? 'Human' : 'AI'}
                  </Badge>
                  <span className="text-text-tertiary">
                    {format(new Date(conversation.last_message_at), 'MMM d, h:mm a')}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};
