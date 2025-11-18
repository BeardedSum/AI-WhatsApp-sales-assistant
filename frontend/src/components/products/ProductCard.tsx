import React from 'react';
import { Edit, Trash2, Package } from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import type { Product } from '../../types';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onEdit,
  onDelete,
}) => {
  const formatPrice = (price: string, currency: string) => {
    const priceNum = parseFloat(price);
    if (currency === 'NGN') {
      return `₦${priceNum.toLocaleString()}`;
    }
    return `${currency} ${priceNum.toLocaleString()}`;
  };

  return (
    <Card hover className="h-full flex flex-col">
      {/* Image */}
      <div className="w-full h-48 bg-bg-tertiary rounded-md mb-3 flex items-center justify-center overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement!.innerHTML = `
                <div class="flex items-center justify-center w-full h-full">
                  <svg class="w-16 h-16 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              `;
            }}
          />
        ) : (
          <Package className="text-text-tertiary" size={48} />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-text-primary line-clamp-2 flex-1">
            {product.name}
          </h3>
          <Badge variant={product.is_active ? 'success' : 'default'} size="sm">
            {product.is_active ? 'Active' : 'Inactive'}
          </Badge>
        </div>

        {product.description && (
          <p className="text-sm text-text-secondary line-clamp-2 mb-3">
            {product.description}
          </p>
        )}

        <div className="mt-auto space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">Price:</span>
            <span className="font-semibold text-primary text-lg">
              {formatPrice(product.price, product.currency)}
            </span>
          </div>

          {product.category && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">Category:</span>
              <Badge size="sm">{product.category}</Badge>
            </div>
          )}

          {product.stock_quantity !== null && product.stock_quantity !== undefined && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">Stock:</span>
              <span
                className={`font-medium ${
                  product.stock_quantity === 0
                    ? 'text-error'
                    : product.stock_quantity < 10
                    ? 'text-warning'
                    : 'text-success'
                }`}
              >
                {product.stock_quantity} units
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-4 pt-4 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<Edit size={16} />}
          onClick={() => onEdit(product)}
          className="flex-1"
        >
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<Trash2 size={16} />}
          onClick={() => onDelete(product)}
          className="flex-1 text-error hover:bg-error-50"
        >
          Delete
        </Button>
      </div>
    </Card>
  );
};
