import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Select } from '../components/common/Input';
import { ConversationList } from '../components/conversations/ConversationList';
import { ConversationDetail } from '../components/conversations/ConversationDetail';
import { useConversations, useConversationDetail } from '../hooks/useConversations';
import type { ConversationStatus } from '../types';

export const Conversations: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedId, setSelectedId] = useState<string | null>(
    searchParams.get('id')
  );
  const [statusFilter, setStatusFilter] = useState<ConversationStatus | ''>('');

  const { data: conversationsData, isLoading: conversationsLoading } =
    useConversations({
      status: statusFilter || undefined,
    });

  const { data: conversationDetailData } = useConversationDetail(selectedId);

  // Update selected conversation from URL
  useEffect(() => {
    const idFromUrl = searchParams.get('id');
    if (idFromUrl) {
      setSelectedId(idFromUrl);
    }
  }, [searchParams]);

  const handleSelectConversation = (id: string) => {
    setSelectedId(id);
    setSearchParams({ id });
  };

  const conversations = conversationsData?.success
    ? conversationsData.data.conversations
    : [];

  const selectedConversation = conversationDetailData?.success
    ? conversationDetailData.data.conversation
    : null;

  const messages = conversationDetailData?.success
    ? conversationDetailData.data.messages
    : [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-1">
            Conversations
          </h1>
          <p className="text-text-secondary">
            Manage customer conversations and take over from AI when needed
          </p>
        </div>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ConversationStatus | '')}
          options={[
            { value: '', label: 'All Status' },
            { value: 'active', label: 'Active' },
            { value: 'escalated', label: 'Escalated' },
            { value: 'resolved', label: 'Resolved' },
          ]}
        />
      </div>

      {/* Conversations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-240px)]">
        {/* Conversation List */}
        <div className="lg:col-span-1 h-full">
          <ConversationList
            conversations={conversations}
            selectedId={selectedId}
            onSelect={handleSelectConversation}
            isLoading={conversationsLoading}
          />
        </div>

        {/* Conversation Detail */}
        <div className="lg:col-span-2 h-full">
          {selectedConversation ? (
            <ConversationDetail
              conversation={selectedConversation}
              messages={messages}
            />
          ) : (
            <div className="h-full flex items-center justify-center bg-bg-primary border border-border rounded-lg">
              <div className="text-center">
                <p className="text-text-secondary">
                  Select a conversation to view details
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
