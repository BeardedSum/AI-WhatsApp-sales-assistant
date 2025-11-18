/**
 * Custom hook for managing FAQs with React Query
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import type { FAQFilters, CreateFAQRequest, UpdateFAQRequest } from '../types';

const FAQS_KEY = 'faqs';
const FAQ_DETAIL_KEY = 'faq-detail';

export const useFAQs = (filters?: FAQFilters) => {
  return useQuery({
    queryKey: [FAQS_KEY, filters],
    queryFn: () => api.getFAQs(filters),
    staleTime: 30000, // FAQs don't change as frequently
  });
};

export const useFAQDetail = (faqId: string | null) => {
  return useQuery({
    queryKey: [FAQ_DETAIL_KEY, faqId],
    queryFn: () => api.getFAQById(faqId!),
    enabled: !!faqId,
  });
};

export const useCreateFAQ = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFAQRequest) => api.createFAQ(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FAQS_KEY] });
    },
  });
};

export const useUpdateFAQ = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFAQRequest }) =>
      api.updateFAQ(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [FAQS_KEY] });
      queryClient.invalidateQueries({ queryKey: [FAQ_DETAIL_KEY, variables.id] });
    },
  });
};

export const useDeleteFAQ = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.deleteFAQ(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FAQS_KEY] });
    },
  });
};
