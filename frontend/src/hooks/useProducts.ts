/**
 * Custom hook for managing products with React Query
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import type { ProductFilters, CreateProductRequest, UpdateProductRequest } from '../types';

const PRODUCTS_KEY = 'products';
const PRODUCT_DETAIL_KEY = 'product-detail';

export const useProducts = (filters?: ProductFilters) => {
  return useQuery({
    queryKey: [PRODUCTS_KEY, filters],
    queryFn: () => api.getProducts(filters),
    staleTime: 30000, // Products don't change as frequently
  });
};

export const useProductDetail = (productId: string | null) => {
  return useQuery({
    queryKey: [PRODUCT_DETAIL_KEY, productId],
    queryFn: () => api.getProductById(productId!),
    enabled: !!productId,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductRequest) => api.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductRequest }) =>
      api.updateProduct(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY] });
      queryClient.invalidateQueries({ queryKey: [PRODUCT_DETAIL_KEY, variables.id] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY] });
    },
  });
};
