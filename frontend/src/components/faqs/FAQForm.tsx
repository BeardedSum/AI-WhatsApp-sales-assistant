import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input, TextArea, Select } from '../common/Input';
import { Button } from '../common/Button';
import type { FAQ, CreateFAQRequest } from '../../types';

interface FAQFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateFAQRequest) => Promise<void>;
  faq?: FAQ | null;
  isLoading?: boolean;
}

export const FAQForm: React.FC<FAQFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  faq,
  isLoading,
}) => {
  const [formData, setFormData] = useState<CreateFAQRequest>({
    question: '',
    answer: '',
    category: '',
    priority: 1,
    is_active: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate form when editing
  useEffect(() => {
    if (faq) {
      setFormData({
        question: faq.question,
        answer: faq.answer,
        category: faq.category || '',
        priority: faq.priority,
        is_active: faq.is_active,
      });
    } else {
      // Reset form when adding new FAQ
      setFormData({
        question: '',
        answer: '',
        category: '',
        priority: 1,
        is_active: true,
      });
    }
    setErrors({});
  }, [faq, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.question.trim()) {
      newErrors.question = 'Question is required';
    }

    if (!formData.answer.trim()) {
      newErrors.answer = 'Answer is required';
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
      title={faq ? 'Edit FAQ' : 'Add New FAQ'}
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
            {faq ? 'Update FAQ' : 'Add FAQ'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Question"
          value={formData.question}
          onChange={(e) => setFormData({ ...formData, question: e.target.value })}
          error={errors.question}
          placeholder="e.g., What are your delivery times?"
          fullWidth
          required
        />

        <TextArea
          label="Answer"
          value={formData.answer}
          onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
          error={errors.answer}
          placeholder="Provide a detailed answer..."
          fullWidth
          required
          className="min-h-[120px]"
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder="e.g., Shipping"
            helperText="Optional categorization"
            fullWidth
          />

          <Select
            label="Priority"
            value={formData.priority?.toString() || '1'}
            onChange={(e) =>
              setFormData({ ...formData, priority: parseInt(e.target.value) })
            }
            options={[
              { value: '1', label: '1 - Lowest' },
              { value: '2', label: '2 - Low' },
              { value: '3', label: '3 - Medium' },
              { value: '4', label: '4 - High' },
              { value: '5', label: '5 - Highest' },
            ]}
            fullWidth
            helperText="Higher priority FAQs are used first"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_active"
            checked={formData.is_active}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            className="w-4 h-4 text-primary border-border rounded focus:ring-primary-500"
          />
          <label htmlFor="is_active" className="text-sm text-text-primary">
            FAQ is active and available to AI
          </label>
        </div>
      </form>
    </Modal>
  );
};
