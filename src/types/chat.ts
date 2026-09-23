export type Message = {
  role: 'user' | 'assistant';
  text: string;
};

export type Chat = {
  id: string;
  title: string;
  messages: Message[];
  pinned: boolean;
  createdAt: number;
  updatedAt: number;
};

export const MAX_CHATS = 50;
export const MAX_PINNED_CHATS = 10;