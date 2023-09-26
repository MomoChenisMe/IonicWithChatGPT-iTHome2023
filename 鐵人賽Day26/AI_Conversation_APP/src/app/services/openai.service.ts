import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ChatMessageModel, ChatRequestModel, ChatResponseModel, ChatRole, ConversationDataModel, GrammerCheckDataModel, GrammerDataModel, WhisperResponseModel } from '../models/chatgpt.model';
import { Observable, map, switchMap, take, tap } from 'rxjs';
import { encode } from 'gpt-tokenizer';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { ChatHistorySQLiteModel } from '../models/sqlite.model';
import { SqlitedbService } from './sqlitedb.service';

// const SYSTEMPROMPT =
//   '1.從現在開始你是英文口說導師，所有對話都使用英文。\
// 2.你的工作是和學生進行一對一生活會話練習並適時地開啟新的話題。\
// 3.請使用多益400-600分的程度進行對話。\
// 4.對話時包含並解釋語法上的錯誤，解釋完後請延續話題。。\
// 5.輸出的回應只能使用SSML格式。不必包含speak和voice元素。\
// 6.根據你的推論添加與語境相對應的語氣(style)和語調(styledegree)。語氣可使用:cheerful、friendly、excited、hopeful。語調接受範圍為0.01 到 2。如範例:\
// ```\
// <mstts:express-as style="excited" styledegree="1.6">\
//   Wow, That is awesome!\
// </mstts:express-as>\
// ```\
// 7.根據你的推論適當添加強調(emphasis)元素。強調可使用:reduced、none、moderate、strong。';

const SYSTEMPROMPT = '1.你是英文老師，所有對話都使用英文。\n2.進行生活會話練習並適時的延續或開啟新的話題。\n3.請使用多益400-600分的程度進行對話。';

@Injectable({
  providedIn: 'root'
})
export class OpenaiService {
  //建立Http header
  private headers = new HttpHeaders({
    'Authorization': 'Bearer {你的Token}'
  });

  private chatMessages: ChatMessageModel[] = [
    {
      role: 'system',
      content: SYSTEMPROMPT
    },
  ];

  //中斷信號
  private ctrl = new AbortController();

  constructor(private http: HttpClient,
    private sqlitedbService: SqlitedbService) { }

  public chatAPI(contentData: string) {
    return this.sqlitedbService.chatHistory$.pipe(
      take(1),
      map(chatHistoryResult => this.tokenizerCalcuation(contentData, chatHistoryResult)),
      map(chatMessageResult => this.getConversationRequestData(chatMessageResult)),
      switchMap(conversationRequestResult => this.http.post<ChatResponseModel>('https://api.openai.com/v1/chat/completions', conversationRequestResult, { headers: this.headers })),
      map(chatAPIResult => JSON.parse(chatAPIResult.choices[0].message.function_call?.arguments!) as ConversationDataModel),
      tap(conversationDataResult => {
        console.log('儲存資料');
        this.sqlitedbService.addChatHistory('user', contentData);
        this.sqlitedbService.addChatHistory('assistant', conversationDataResult.gptResponseText);
      })
    );
  }

  public checkGrammerHasMistake(contentData: string) {
    return this.http.post<ChatResponseModel>('https://api.openai.com/v1/chat/completions', this.getGrammerCheckRequestData(contentData), { headers: this.headers }).pipe(
      map(chatAPIResult => {
        //取得function_call.arguments的字串並轉成物件
        const grammerCheckData = JSON.parse(chatAPIResult.choices[0].message.function_call?.arguments!) as GrammerCheckDataModel;
        return {
          hasGrammerMistake: grammerCheckData.hasGrammerMistake,
          mistakeSentence: contentData
        } as GrammerDataModel;
      }),
    );
  }

  public whisperAPI(base64Data: string) {
    return this.http.post<WhisperResponseModel>('https://api.openai.com/v1/audio/transcriptions', this.getWhisperFormData(base64Data), { headers: this.headers });
  }

  public chatStreamAPI(chatData: ChatMessageModel[]) {
    return new Observable<ChatResponseModel>(observer => {
      fetchEventSource('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: this.getFetchHeader(),
        body: JSON.stringify(this.getFetchBody(chatData)),
        signal: this.ctrl.signal,
        //接收訊息事件
        onmessage(msg) {
          //如果訊息不是[DONE]則將訊息發送給觀察者
          if (msg.data !== '[DONE]') {
            observer.next(JSON.parse(msg.data));
          }
        },
        //結束事件
        onclose() {
          console.log('%c Open AI API Close', 'color: red');
          observer.complete();
        },
        //錯誤處理事件
        onerror(err) {
          observer.error(new Error(err));
        }
      });
    });
  }

  private getFetchHeader() {
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer {你的Token}'
    };
  }

  private getFetchBody(chatMessage: ChatMessageModel[]) {
    return {
      model: 'gpt-4',
      messages: chatMessage,
      temperature: 0.7,
      top_p: 1,
      stream: true
    };
  }

  private getWhisperFormData(base64Data: string) {
    //將Base64字串轉為Blob
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'audio/m4a' });
    //建立FormData
    const formData = new FormData();
    formData.append('file', blob, 'audio.m4a');
    formData.append('model', 'whisper-1');
    formData.append('language', 'en');
    return formData;
  }

  private getConversationRequestData(chatMessageData: ChatMessageModel[]): ChatRequestModel {
    return {
      model: 'gpt-3.5-turbo',
      messages: chatMessageData,
      temperature: 0.7,
      top_p: 1,
      functions: [
        {
          name: 'getEnglishTurtorConverstaionData',
          description: '',
          parameters: {
            type: 'object',
            properties: {
              gptResponseText: {
                type: 'string',
                description: '回覆的對話內容，請記得適時的延續或開啟新的話題。'
              },
              gptResponseTextStyle: {
                type: 'string',
                description: '根據回覆的對話內容相對應的語氣。可用:cheerful、friendly、excited'
              },
              gptResponseTextStyleDegree: {
                type: 'string',
                description: '對應gptResponseTextStyle語氣的強度。範圍在0.01到2。'
              },
              gptResponseEmphasisTexts: {
                type: 'array',
                description: '根據回覆的對話內容找出需要強調的句子或單字。',
                items: {
                  type: 'string',
                  description: ''
                }
              },
              gptResponseEmphasisStyles: {
                type: 'array',
                description: '對應gptResponseEmphasisTexts陣列的強調語氣。可用:reduced、none、moderate、strong',
                items: {
                  type: 'string',
                  description: ''
                }
              }
            },
            required: [
              'gptResponseText',
              'gptResponseTextStyle',
              'gptResponseTextStyleDegree',
              'gptResponseEmphasisTexts',
              'gptResponseEmphasisStyles'
            ]
          }
        }
      ],
      function_call: {
        name: 'getEnglishTurtorConverstaionData'
      }
    }
  }

  private getGrammerCheckRequestData(contentData: string): ChatRequestModel {
    return {
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: '請檢查是否有文法或使用上的任何錯誤。'
        },
        {
          role: 'user',
          content: contentData
        }
      ],
      temperature: 0.7,
      top_p: 1,
      functions: [
        {
          name: 'grammerChecker',
          description: '',
          parameters: {
            type: 'object',
            properties: {
              hasGrammerMistake: {
                type: 'boolean',
                description: ''
              }
            },
            required: [
              'hasGrammerMistake'
            ]
          }
        }
      ],
      function_call: {
        name: 'grammerChecker'
      }
    }
  }

  private addChatMessage(roleData: ChatRole, contentData: string) {
    this.chatMessages.push({
      role: roleData,
      content: contentData
    });
  }

  private tokenizerCalcuation(newContent: string, chatHistorySQLiteData: ChatHistorySQLiteModel[]): ChatMessageModel[] {
    //最大大小取決於你選用的模型
    const MAX_TOKENS = 8192;
    let totalTokenizer = 0;
    let newChatMessage: ChatMessageModel[] = [];
    //系統訊息Token數量計算
    const systemPromptToken = encode(SYSTEMPROMPT).length;
    totalTokenizer += systemPromptToken;
    //新的使用者對話Token數量計算
    const newContentToken = encode(newContent).length;
    totalTokenizer += newContentToken;

    for (let i = chatHistorySQLiteData.length - 1; i >= 0; i--) {
      const conversationPromptToken = encode(chatHistorySQLiteData[i].content).length;
      if (totalTokenizer + conversationPromptToken > MAX_TOKENS) {
        //如果下一個message超過Token限制，就結束添加
        break;
      } else {
        totalTokenizer += conversationPromptToken;
        newChatMessage.unshift({
          role: chatHistorySQLiteData[i].role as ChatRole,
          content: chatHistorySQLiteData[i].content
        });
      }
    }
    //添加系統訊息在第0筆
    newChatMessage.unshift({
      role: 'system',
      content: SYSTEMPROMPT
    });
    //添加使用者對話在最後一筆
    newChatMessage.push({
      role: 'user',
      content: newContent
    });
    console.log(newChatMessage);
    console.log(`Token: ${totalTokenizer}`);
    return newChatMessage;
  }
}
