import React from 'react';
import { Bot, User, UserCog } from 'lucide-react';
import { format } from 'date-fns';
import type { Message, MessageSenderType } from '../../types';

interface MessageBubbleProps {
  message: Message;
}

const getSenderConfig = (senderType: MessageSenderType) => {
  switch (senderType) {
    case 'customer':
      return {
        align: 'left',
        bgColor: 'bg-bg-tertiary',
        textColor: 'text-text-primary',
        icon: User,
        iconBg: 'bg-text-tertiary',
        label: 'Customer',
      };
    case 'ai':
      return {
        align: 'right',
        bgColor: 'bg-primary-100',
        textColor: 'text-text-primary',
        icon: Bot,
        iconBg: 'bg-primary',
        label: 'AI Assistant',
      };
    case 'human':
      return {
        align: 'right',
        bgColor: 'bg-warning-100',
        textColor: 'text-text-primary',
        icon: UserCog,
        iconBg: 'bg-warning',
        label: 'Support Agent',
      };
  }
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const config = getSenderConfig(message.sender_type);
  const Icon = config.icon;

  return (
    <div className={`flex ${config.align === 'right' ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex gap-3 max-w-[70%] ${config.align === 'right' ? 'flex-row-reverse' : ''}`}>
        {/* Avatar */}
        <div className={`w-8 h-8 ${config.iconBg} rounded-full flex items-center justify-center flex-shrink-0`}>
          <Icon className="text-white" size={16} />
        </div>

        {/* Message Content */}
        <div>
          <div className={`${config.bgColor} ${config.textColor} rounded-lg px-4 py-2.5 shadow-sm`}>
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {message.content}
            </p>
            {message.media_url && (
              <div className="mt-2">
                {message.message_type === 'image' ? (
                  <img
                    src={message.media_url}
                    alt="Message attachment"
                    className="rounded-md max-w-full"
                  />
                ) : (
                  <a
                    href={message.media_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline text-sm"
                  >
                    View attachment
                  </a>
                )}
              </div>
            )}
          </div>
          <div className={`flex items-center gap-2 mt-1 text-xs text-text-tertiary ${config.align === 'right' ? 'justify-end' : ''}`}>
            <span>{config.label}</span>
            <span>•</span>
            <span>{format(new Date(message.created_at), 'h:mm a')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
