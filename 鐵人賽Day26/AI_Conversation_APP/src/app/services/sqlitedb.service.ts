import { Injectable } from '@angular/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { BehaviorSubject } from 'rxjs';
import { ChatRoomSQLiteModel, ChatHistorySQLiteModel } from '../models/sqlite.model';
import { ChatRole } from '../models/chatgpt.model';

//定義DB名稱
const DB_NAME = 'aiconversationdb'

//定義聊天室資料表結構
const chatRoomSchema = `
  CREATE TABLE IF NOT EXISTS chatroomdb (
    chatroomid INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    selecting INTEGER DEFAULT 0,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`;

//定義歷史對話資料表結構
const chatHistorySchema = `
  CREATE TABLE IF NOT EXISTS chathistorydb (
    chathistoryid INTEGER PRIMARY KEY AUTOINCREMENT,
    chatroomid INTEGER NOT NULL,
    role TEXT NOT NULL,
    content TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(chatroomid) REFERENCES chatroomdb(chatroomid)
  );
`;

@Injectable({
  providedIn: 'root'
})
export class SqlitedbService {
  //SQLite連線
  private sqlite: SQLiteConnection = new SQLiteConnection(CapacitorSQLite);
  //數據庫連接物件
  private db!: SQLiteDBConnection;
  //聊天室清單的觀察者
  private chatSubject$: BehaviorSubject<ChatRoomSQLiteModel[]> = new BehaviorSubject<ChatRoomSQLiteModel[]>([]);
  //歷史對話的觀察者
  private chatHistorySubject$: BehaviorSubject<ChatHistorySQLiteModel[]> = new BehaviorSubject<ChatHistorySQLiteModel[]>([]);

  get chat$() {
    return this.chatSubject$.asObservable();
  }

  get chatHistory$() {
    return this.chatHistorySubject$.asObservable();
  }

  constructor() { }

  public async initializePlugin() {
    try {
      //創建和打開資料庫連接
      this.db = await this.sqlite.createConnection(DB_NAME, false, 'no-encryption', 1, false);
      await this.db.open();

      //執行數據表建立
      await this.db.execute(chatRoomSchema);
      await this.db.execute(chatHistorySchema);

      //確保至少存在一個聊天室
      await this.ensureAtLeastOneChatRoom();

      //讀取聊天室和歷史對話資料
      await this.loadChatRoomData();
      await this.loadChatHistoryData();
    } catch (error) {
      console.error("Error initializing plugin:", error);
    }
  }

  public async addChatHistory(roleData: ChatRole, contentData: string) {
    try {
      console.log(`新增聊天資料：${roleData}, ${contentData}`);
      //查詢當前選中的聊天室ID
      const chatIdQuery = 'SELECT chatroomid FROM chatroomdb WHERE selecting = 1';
      const chatIdResult = await this.db.query(chatIdQuery);

      if (!chatIdResult.values || chatIdResult.values.length === 0) {
        console.error('No selecting chat found');
        return;
      }

      const chatRoomId = chatIdResult.values[0].chatroomid;

      //新增對話內容
      const query = 'INSERT INTO chathistorydb (chatroomid, role, content) VALUES (?, ?, ?)';
      const values = [chatRoomId, roleData, contentData];
      const result = await this.db.query(query, values);

      await this.loadChatHistoryData();
      console.log('新增完成');
      return result;
    } catch (error) {
      console.error("Error adding chat history:", error);
      return;
    }
  }

  private async ensureAtLeastOneChatRoom() {
    try {
      //確定聊天室資料表中是否至少有一筆資料
      const chatCount = await this.db.query('SELECT COUNT(*) as count FROM chatroomdb');
      //若沒有任何聊天室資料，則建立一個初始的聊天室
      if (chatCount.values && chatCount.values[0].count === 0) {
        await this.addInitialChatRoom();
      }
    } catch (error) {
      console.error("Error ensuring at least one chat room:", error);
    }
  }

  private async addInitialChatRoom() {
    try {
      //建立一個初始的聊天室資料
      const query = 'INSERT INTO chatroomdb (name, selecting) VALUES (?, ?)';
      const values = ['英文口說聊天室', 1];
      await this.db.query(query, values);
    } catch (error) {
      console.error("Error adding initial chat room:", error);
    }
  }

  private async loadChatRoomData() {
    try {
      //讀取所有聊天室清單資料
      const chatData = await this.db.query('SELECT * FROM chatroomdb ORDER BY timestamp');
      this.chatSubject$.next(chatData.values || []);

    } catch (error) {
      console.error("Error loading chat data:", error);
    }
  }

  private async loadChatHistoryData() {
    try {
      //只讀取當前選中的聊天室的歷史對話資料
      const chatHistoryData = await this.db.query('SELECT * FROM chathistorydb JOIN chatroomdb ON chathistorydb.chatroomid = chatroomdb.chatroomid WHERE chatroomdb.selecting = 1 ORDER BY chathistorydb.timestamp');
      this.chatHistorySubject$.next(chatHistoryData.values || []);
    } catch (error) {
      console.error("Error loading chat history data:", error);
    }
  }
}
