export interface ChatRoomSQLiteModel {
  chatroomid: number;
  name: string;
  selecting: boolean;
  timestamp: Date;
}

export interface ChatHistorySQLiteModel {
  chathistoryid: number;
  chatroomid: number;
  role: string;
  content: string;
  timestamp: Date;
}
