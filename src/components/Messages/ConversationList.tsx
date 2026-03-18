import React from 'react';
import ConversationItem from './ConversationItem';
import { Conversation } from '../../data/messages';

interface ConversationListProps {
  conversations: Conversation[];
  onSelect: (id: string) => void;
}

export default function ConversationList({ conversations, onSelect }: ConversationListProps) {
  return (
    <div className="flex flex-col">
      {conversations.map((conv) => (
        <ConversationItem 
          key={conv.id} 
          conversation={conv} 
          onClick={() => onSelect(conv.id)} 
        />
      ))}
    </div>
  );
}
