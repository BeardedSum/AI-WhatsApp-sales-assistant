import React, { useState } from 'react';
import { Plus, Search, HelpCircle, Edit, Trash2, TrendingUp } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Card, CardHeader, CardBody } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { ConfirmModal } from '../components/common/Modal';
import { FAQForm } from '../components/faqs/FAQForm';
import {
  useFAQs,
  useCreateFAQ,
  useUpdateFAQ,
  useDeleteFAQ,
} from '../hooks/useFAQs';
import type { FAQ } from '../types';

export const FAQs: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
  const [deletingFAQ, setDeletingFAQ] = useState<FAQ | null>(null);

  const { data: faqsData, isLoading } = useFAQs();
  const createMutation = useCreateFAQ();
  const updateMutation = useUpdateFAQ();
  const deleteMutation = useDeleteFAQ();

  const faqs = faqsData?.success ? faqsData.data.faqs : [];

  const filteredFAQs = faqs.filter((faq) =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort by priority (highest first) and then by times_asked
  const sortedFAQs = [...filteredFAQs].sort((a, b) => {
    if (a.priority !== b.priority) {
      return b.priority - a.priority;
    }
    return b.times_asked - a.times_asked;
  });

  const handleAddFAQ = () => {
    setEditingFAQ(null);
    setIsFormOpen(true);
  };

  const handleEditFAQ = (faq: FAQ) => {
    setEditingFAQ(faq);
    setIsFormOpen(true);
  };

  const handleDeleteFAQ = (faq: FAQ) => {
    setDeletingFAQ(faq);
  };

  const handleFormSubmit = async (data: any) => {
    if (editingFAQ) {
      await updateMutation.mutateAsync({
        id: editingFAQ.id,
        data,
      });
    } else {
      await createMutation.mutateAsync(data);
    }
    setIsFormOpen(false);
    setEditingFAQ(null);
  };

  const confirmDelete = async () => {
    if (deletingFAQ) {
      await deleteMutation.mutateAsync(deletingFAQ.id);
      setDeletingFAQ(null);
    }
  };

  const getPriorityBadge = (priority: number) => {
    if (priority >= 4) return <Badge variant="error" size="sm">High Priority</Badge>;
    if (priority >= 3) return <Badge variant="warning" size="sm">Medium Priority</Badge>;
    return <Badge variant="default" size="sm">Low Priority</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading FAQs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-1">FAQs</h1>
          <p className="text-text-secondary">
            Manage frequently asked questions for quick AI responses
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus size={20} />}
          onClick={handleAddFAQ}
        >
          Add FAQ
        </Button>
      </div>

      {/* Search */}
      <Card>
        <Input
          placeholder="Search FAQs by question, answer, or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<Search size={18} />}
          fullWidth
        />
      </Card>

      {/* FAQs List */}
      {sortedFAQs.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <HelpCircle className="text-text-tertiary mx-auto mb-4" size={64} />
            <h3 className="text-lg font-medium text-text-primary mb-2">
              {searchQuery ? 'No FAQs found' : 'No FAQs yet'}
            </h3>
            <p className="text-text-secondary mb-6">
              {searchQuery
                ? 'Try a different search term'
                : 'Add your first FAQ to help customers get quick answers'}
            </p>
            {!searchQuery && (
              <Button
                variant="primary"
                leftIcon={<Plus size={20} />}
                onClick={handleAddFAQ}
              >
                Add FAQ
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedFAQs.map((faq) => (
            <Card key={faq.id} hover>
              <CardHeader
                title={faq.question}
                action={
                  <div className="flex items-center gap-2">
                    {getPriorityBadge(faq.priority)}
                    <Badge variant={faq.is_active ? 'success' : 'default'} size="sm">
                      {faq.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                }
              />
              <CardBody>
                <p className="text-text-secondary mb-4">{faq.answer}</p>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    {faq.category && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-text-tertiary">Category:</span>
                        <Badge size="sm">{faq.category}</Badge>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-text-secondary">
                      <TrendingUp size={14} />
                      <span>Asked {faq.times_asked} times</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<Edit size={16} />}
                      onClick={() => handleEditFAQ(faq)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<Trash2 size={16} />}
                      onClick={() => handleDeleteFAQ(faq)}
                      className="text-error hover:bg-error-50"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* FAQ Form Modal */}
      <FAQForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingFAQ(null);
        }}
        onSubmit={handleFormSubmit}
        faq={editingFAQ}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingFAQ}
        onClose={() => setDeletingFAQ(null)}
        onConfirm={confirmDelete}
        title="Delete FAQ"
        message={`Are you sure you want to delete this FAQ? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="error"
        loading={deleteMutation.isPending}
      />
    </div>
  );
};
