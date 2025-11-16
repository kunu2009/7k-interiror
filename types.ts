
export interface ShoppingItem {
  name: string;
  description: string;
  url: string;
}

export interface ChatMessage {
  sender: 'user' | 'ai';
  text?: string;
  items?: ShoppingItem[];
}
