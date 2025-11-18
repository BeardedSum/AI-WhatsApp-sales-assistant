import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Phone, Lock } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Card } from '../components/common/Card';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading, error } = useAuthStore();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Basic validation
    if (!phone || !password) {
      setFormError('Please enter both phone number and password');
      return;
    }

    try {
      await login(phone, password);
      navigate('/');
    } catch (err) {
      setFormError(error || 'Failed to login. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center p-4">
      <Card className="w-full max-w-md" padding="none">
        {/* Header */}
        <div className="bg-primary text-white px-8 py-6 rounded-t-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
              <MessageSquare className="text-primary" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">AI Assistant</h1>
              <p className="text-primary-100 text-sm">WhatsApp Business Dashboard</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="px-8 py-6">
          <h2 className="text-xl font-semibold text-text-primary mb-2">Welcome back</h2>
          <p className="text-text-secondary mb-6">
            Sign in to manage your AI-powered WhatsApp assistant
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Phone Number */}
            <Input
              type="tel"
              label="Phone Number"
              placeholder="+234..."
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              leftIcon={<Phone size={18} />}
              fullWidth
              disabled={isLoading}
            />

            {/* Password */}
            <Input
              type="password"
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock size={18} />}
              fullWidth
              disabled={isLoading}
            />

            {/* Error Message */}
            {formError && (
              <div className="bg-error-50 border border-error-500 text-error-600 px-4 py-3 rounded-md text-sm">
                {formError}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isLoading}
              className="w-full"
            >
              Sign In
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-center text-sm text-text-secondary">
              Don't have an account?{' '}
              <a href="#" className="text-primary hover:text-primary-600 font-medium">
                Contact support
              </a>
            </p>
          </div>
        </div>
      </Card>

      {/* Footer Info */}
      <div className="absolute bottom-4 text-center text-white text-sm">
        <p>
          Powered by AI • Built for Nigerian Businesses
        </p>
      </div>
    </div>
  );
};
