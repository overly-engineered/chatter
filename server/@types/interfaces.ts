export interface ChatItem {
  id: string;
  name: string;
}

export interface ChatItems extends Array<ChatItem> { }

export interface ChatDetails {
  id: string,
  name: string,
  totalMessages: number
}

export interface Message {
  messageText: string,
  timestamp: number,
  user: string,
  color: string
}

export interface MessageItems extends Array<Message> { }

export interface SocketParams {
  chatId: string,
  userName: string,
  userColor: string
}
