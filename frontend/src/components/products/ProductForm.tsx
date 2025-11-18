import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input, TextArea, Select } from '../common/Input';
import { Button } from '../common/Button';
import type { Product, CreateProductRequest } from '../../types';

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProductRequest) => Promise<void>;
  product?: Product | null;
  isLoading?: boolean;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  product,
  isLoading,
}) => {
  const [formData, setFormData] = useState<CreateProductRequest>({
    name: '',
    description: '',
    price: '',
    currency: 'NGN',
    category: '',
    stock_quantity: 0,
    image_url: '',
    is_active: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate form when editing
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price,
        currency: product.currency,
        category: product.category || '',
        stock_quantity: product.stock_quantity || 0,
        image_url: product.image_url || '',
        is_active: product.is_active,
      });
    } else {
      // Reset form when adding new product
      setFormData({
        name: '',
        description: '',
        price: '',
        currency: 'NGN',
        category: '',
        stock_quantity: 0,
        image_url: '',
        is_active: true,
      });
    }
    setErrors({});
  }, [product, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={product ? 'Edit Product' : 'Add New Product'}
      size="lg"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={isLoading}
          >
            {product ? 'Update Product' : 'Add Product'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Product Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={errors.name}
          placeholder="e.g., Blue Cotton Shirt"
          fullWidth
          required
        />

        <TextArea
          label="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Product description..."
          fullWidth
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            error={errors.price}
            placeholder="0.00"
            fullWidth
            required
          />

          <Select
            label="Currency"
            value={formData.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            options={[
              { value: 'NGN', label: 'NGN (₦)' },
              { value: 'USD', label: 'USD ($)' },
              { value: 'GBP', label: 'GBP (£)' },
              { value: 'EUR', label: 'EUR (€)' },
            ]}
            fullWidth
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder="e.g., Clothing"
            fullWidth
          />

          <Input
            label="Stock Quantity"
            type="number"
            value={formData.stock_quantity || 0}
            onChange={(e) =>
              setFormData({ ...formData, stock_quantity: parseInt(e.target.value) || 0 })
            }
            placeholder="0"
            fullWidth
          />
        </div>

        <Input
          label="Image URL"
          type="url"
          value={formData.image_url}
          onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
          placeholder="https://..."
          helperText="Enter the URL of the product image"
          fullWidth
        />

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_active"
            checked={formData.is_active}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            className="w-4 h-4 text-primary border-border rounded focus:ring-primary-500"
          />
          <label htmlFor="is_active" className="text-sm text-text-primary">
            Product is active and available for sale
          </label>
        </div>
      </form>
    </Modal>
  );
};
