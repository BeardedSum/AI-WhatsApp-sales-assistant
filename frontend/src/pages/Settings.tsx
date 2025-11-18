import React, { useState, useEffect } from 'react';
import { Save, Building2, Bot } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input, TextArea, Select } from '../components/common/Input';
import { useAuthStore } from '../stores/authStore';
import { api } from '../services/api';
import type { UpdateBusinessSettingsRequest } from '../types';

export const Settings: React.FC = () => {
  const { business } = useAuthStore();
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState<UpdateBusinessSettingsRequest>({
    name: '',
    location: '',
    ai_tone: 'friendly',
    ai_custom_instructions: '',
    ai_confidence_threshold: 0.85,
  });

  // Initialize form with business data
  useEffect(() => {
    if (business) {
      setFormData({
        name: business.name,
        location: business.location || '',
        ai_tone: business.ai_tone,
        ai_custom_instructions: business.ai_custom_instructions || '',
        ai_confidence_threshold: business.ai_confidence_threshold,
      });
    }
  }, [business]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const response = await api.updateBusinessSettings(formData);

      if (response.success) {
        setSuccessMessage('Settings saved successfully!');
        // Update business in auth store
        useAuthStore.getState().setAuth(
          localStorage.getItem('token')!,
          localStorage.getItem('refreshToken')!,
          response.data
        );

        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage('Failed to save settings');
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to save settings'
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (!business) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-text-secondary">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary mb-1">Settings</h1>
        <p className="text-text-secondary">
          Configure your business and AI assistant settings
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Business Information */}
        <Card>
          <CardHeader
            title="Business Information"
            subtitle="Basic information about your business"
            action={<Building2 className="text-text-tertiary" size={24} />}
          />
          <CardBody className="space-y-4">
            <Input
              label="Business Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Your Business Name"
              fullWidth
              required
            />

            <Input
              label="Location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., Lagos, Nigeria"
              fullWidth
            />

            <Input
              label="WhatsApp Number"
              value={business.phone_number}
              disabled
              helperText="WhatsApp number cannot be changed from dashboard"
              fullWidth
            />
          </CardBody>
        </Card>

        {/* AI Configuration */}
        <Card>
          <CardHeader
            title="AI Assistant Configuration"
            subtitle="Configure how your AI assistant responds to customers"
            action={<Bot className="text-text-tertiary" size={24} />}
          />
          <CardBody className="space-y-4">
            <Select
              label="AI Tone"
              value={formData.ai_tone}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  ai_tone: e.target.value as 'friendly' | 'formal' | 'custom',
                })
              }
              options={[
                { value: 'friendly', label: 'Friendly - Casual and warm' },
                { value: 'formal', label: 'Formal - Professional and polite' },
                { value: 'custom', label: 'Custom - Use custom instructions' },
              ]}
              fullWidth
              helperText="Choose the communication style for your AI assistant"
            />

            <TextArea
              label="Custom AI Instructions"
              value={formData.ai_custom_instructions}
              onChange={(e) =>
                setFormData({ ...formData, ai_custom_instructions: e.target.value })
              }
              placeholder="e.g., Always greet customers with 'How far?', use Nigerian English..."
              helperText="Provide specific instructions for how the AI should communicate (optional)"
              fullWidth
              className="min-h-[120px]"
            />

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Confidence Threshold
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={formData.ai_confidence_threshold}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      ai_confidence_threshold: parseFloat(e.target.value),
                    })
                  }
                  className="flex-1 h-2 bg-bg-tertiary rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-lg font-semibold text-primary min-w-[60px]">
                  {((formData.ai_confidence_threshold || 0.85) * 100).toFixed(0)}%
                </span>
              </div>
              <p className="mt-1.5 text-sm text-text-secondary">
                Conversations with AI confidence below this threshold will be escalated to
                human agents
              </p>
            </div>

            {/* Confidence Explanation */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">
                How Confidence Works
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>
                  • <strong>High (85-100%):</strong> AI is very confident in its response
                </li>
                <li>
                  • <strong>Medium (50-84%):</strong> AI has some uncertainty
                </li>
                <li>
                  • <strong>Low (0-49%):</strong> AI suggests human escalation
                </li>
              </ul>
            </div>
          </CardBody>
        </Card>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="bg-success-50 border border-success-500 text-success-600 px-4 py-3 rounded-md">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="bg-error-50 border border-error-500 text-error-600 px-4 py-3 rounded-md">
            {errorMessage}
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            leftIcon={<Save size={20} />}
            loading={isSaving}
          >
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
};
