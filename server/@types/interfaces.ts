export interface ChatItem {
  id: string;
  name: string;
}

export interface ChatItems extends Array<ChatItem> { }

export interface ChatDetails {
  id: string,
  name: string,
  correctAt: number,
  totalMessages: number,
  messages: Message[]
}

export interface Message {
  id: number;
  messageText: string;
  timestamp: number;
}
