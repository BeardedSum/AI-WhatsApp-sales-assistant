import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Users,
  Bot,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../components/common/Card';
import { Badge, getStatusBadge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { useDashboardStats } from '../hooks/useDashboard';
import { format } from 'date-fns';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, trend, color }) => {
  return (
    <Card hover>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-text-secondary mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-text-primary">{value}</h3>
          {trend && (
            <p className="text-xs text-success mt-1 flex items-center gap-1">
              <TrendingUp size={12} />
              {trend}
            </p>
          )}
        </div>
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
          <Icon className="text-white" size={24} />
        </div>
      </div>
    </Card>
  );
};

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !data?.success) {
    return (
      <Card>
        <div className="text-center py-8">
          <AlertTriangle className="text-error mx-auto mb-4" size={48} />
          <p className="text-text-primary font-medium">Failed to load dashboard</p>
          <p className="text-text-secondary text-sm mt-2">Please try again later</p>
        </div>
      </Card>
    );
  }

  const stats = data.data;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">Dashboard</h1>
        <p className="text-text-secondary">
          Overview of your AI assistant performance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Conversations"
          value={stats.total_conversations}
          icon={MessageSquare}
          color="bg-primary"
        />
        <StatCard
          title="Active Now"
          value={stats.active_conversations}
          icon={Users}
          color="bg-success"
        />
        <StatCard
          title="AI Handled"
          value={`${stats.ai_handled_percentage.toFixed(0)}%`}
          icon={Bot}
          color="bg-blue-500"
        />
        <StatCard
          title="Avg Response Time"
          value={`${(stats.average_response_time_ms / 1000).toFixed(1)}s`}
          icon={Clock}
          color="bg-warning"
        />
      </div>

      {/* AI Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI vs Human Handling */}
        <Card>
          <CardHeader title="AI vs Human Handling" />
          <CardBody>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-text-secondary flex items-center gap-2">
                    <Bot size={16} />
                    AI Handled
                  </span>
                  <span className="text-sm font-medium text-text-primary">
                    {stats.ai_handled_percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-bg-tertiary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-500"
                    style={{ width: `${stats.ai_handled_percentage}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-text-secondary flex items-center gap-2">
                    <Users size={16} />
                    Human Handled
                  </span>
                  <span className="text-sm font-medium text-text-primary">
                    {stats.human_handled_percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-bg-tertiary rounded-full h-2">
                  <div
                    className="bg-warning h-2 rounded-full transition-all duration-500"
                    style={{ width: `${stats.human_handled_percentage}%` }}
                  />
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Conversation Status */}
        <Card>
          <CardHeader title="Conversation Status" />
          <CardBody>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-success-50 rounded-md">
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-success" size={20} />
                  <span className="text-sm font-medium text-text-primary">Resolved</span>
                </div>
                <span className="text-lg font-bold text-text-primary">
                  {stats.resolved_conversations}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-warning-50 rounded-md">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="text-warning" size={20} />
                  <span className="text-sm font-medium text-text-primary">Escalated</span>
                </div>
                <span className="text-lg font-bold text-text-primary">
                  {stats.escalated_conversations}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-primary-50 rounded-md">
                <div className="flex items-center gap-2">
                  <MessageSquare className="text-primary" size={20} />
                  <span className="text-sm font-medium text-text-primary">Active</span>
                </div>
                <span className="text-lg font-bold text-text-primary">
                  {stats.active_conversations}
                </span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Recent Conversations */}
      <Card>
        <CardHeader
          title="Recent Conversations"
          subtitle={`${stats.total_messages_today} messages today`}
          action={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/conversations')}
            >
              View All
            </Button>
          }
        />
        <CardBody className="overflow-x-auto">
          {stats.recent_conversations.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="text-text-tertiary mx-auto mb-3" size={48} />
              <p className="text-text-secondary">No conversations yet</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">
                    Customer
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">
                    Handler
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">
                    Last Message
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_conversations.map((conversation) => (
                  <tr
                    key={conversation.id}
                    className="border-b border-border hover:bg-bg-secondary transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-sm font-medium text-text-primary">
                          {conversation.customer?.name || 'Unknown'}
                        </p>
                        <p className="text-xs text-text-secondary">
                          {conversation.customer?.whatsapp_number}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(conversation.status)}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={conversation.is_human_handled ? 'warning' : 'primary'}>
                        {conversation.is_human_handled ? 'Human' : 'AI'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-text-secondary">
                        {format(new Date(conversation.last_message_at), 'MMM d, h:mm a')}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/conversations?id=${conversation.id}`)}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>
    </div>
  );
};
