/**
 * Custom hook for managing conversations with React Query
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import type { ConversationFilters, SendMessageRequest, TakeoverConversationRequest } from '../types';

const CONVERSATIONS_KEY = 'conversations';
const CONVERSATION_DETAIL_KEY = 'conversation-detail';

export const useConversations = (filters?: ConversationFilters) => {
  return useQuery({
    queryKey: [CONVERSATIONS_KEY, filters],
    queryFn: () => api.getConversations(filters),
    refetchInterval: 5000, // Polling every 5 seconds
    staleTime: 3000, // Consider data stale after 3 seconds
  });
};

export const useConversationDetail = (conversationId: string | null) => {
  return useQuery({
    queryKey: [CONVERSATION_DETAIL_KEY, conversationId],
    queryFn: () => api.getConversationById(conversationId!),
    enabled: !!conversationId,
    refetchInterval: 3000, // Poll more frequently for active conversation
  });
};

export const useTakeoverConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: TakeoverConversationRequest }) =>
      api.takeoverConversation(id, data),
    onSuccess: (_, variables) => {
      // Invalidate and refetch conversations
      queryClient.invalidateQueries({ queryKey: [CONVERSATIONS_KEY] });
      queryClient.invalidateQueries({ queryKey: [CONVERSATION_DETAIL_KEY, variables.id] });
    },
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SendMessageRequest }) =>
      api.sendMessageToConversation(id, data),
    onSuccess: (_, variables) => {
      // Invalidate conversation detail to show new message
      queryClient.invalidateQueries({ queryKey: [CONVERSATION_DETAIL_KEY, variables.id] });
    },
  });
};

export const useResolveConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.resolveConversation(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [CONVERSATIONS_KEY] });
      queryClient.invalidateQueries({ queryKey: [CONVERSATION_DETAIL_KEY, id] });
    },
  });
};
