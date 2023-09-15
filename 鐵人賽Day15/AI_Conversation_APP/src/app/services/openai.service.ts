import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ChatMessageModel, ChatRequestModel, ChatResponseModel, ChatRole, WhisperResponseModel } from '../models/chatgpt.model';
import { tap } from 'rxjs';
import { encode } from 'gpt-tokenizer';

const SYSTEMPROMPT = '1.從現在開始你是英文口說導師，所有對話都使用英文。\
2.你的能力是和學生進行生活一對一會話練習，若學生有不會的單子或句子可以使用中文解釋。\
3.學生的程度大約落在多益（400-600）分，請你依照這個等級進行問話。\
4.進行會話練習時，儘可能的導正學生語法上的錯誤。\
5.你要適時地開啟新的日常話題。';

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

  constructor(private http: HttpClient) { }

  public chatAPI(contentData: string) {
    //添加使用者訊息
    this.addChatMessage('user', contentData);
    return this.http.post<ChatResponseModel>('https://api.openai.com/v1/chat/completions', this.getConversationRequestData(), { headers: this.headers }).pipe(
      //加入GPT回覆訊息
      tap(chatAPIResult => this.addChatMessage('assistant', chatAPIResult.choices[0].message.content))
    );
  }

  public whisperAPI(base64Data: string) {
    return this.http.post<WhisperResponseModel>('https://api.openai.com/v1/audio/transcriptions', this.getWhisperFormData(base64Data), { headers: this.headers });
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

  private getConversationRequestData(): ChatRequestModel {
    return {
      model: 'gpt-4',
      messages: this.tokenizerCalcuation(), //Token計算
      temperature: 0.7,
      top_p: 1
    }
  }

  private addChatMessage(roleData: ChatRole, contentData: string) {
    this.chatMessages.push({
      role: roleData,
      content: contentData
    });
  }

  private tokenizerCalcuation(): ChatMessageModel[] {
    //最大大小取決於你選用的模型
    const MAX_TOKENS = 8192;
    let totalTokenizer = 0;
    let newChatMessage: ChatMessageModel[] = [];
    const systemPromptToken = encode(SYSTEMPROMPT).length;
    totalTokenizer += systemPromptToken;

    for (let i = this.chatMessages.length - 1; i >= 1; i--) {
      const conversationPromptToken = encode(this.chatMessages[i].content).length;
      if (totalTokenizer + conversationPromptToken > MAX_TOKENS) {
        //如果下一個message超過Token限制，就結束添加
        break;
      } else {
        totalTokenizer += conversationPromptToken;
        newChatMessage.unshift(this.chatMessages[i]);
      }
    }
    //保存第0筆資料
    newChatMessage.unshift(this.chatMessages[0]);
    console.log(newChatMessage);
    console.log(`Token: ${totalTokenizer}`);
    return newChatMessage;
  }
}
