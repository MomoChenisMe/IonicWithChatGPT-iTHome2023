import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConversationDataModel } from '../models/chatgpt.model';

@Injectable({
  providedIn: 'root'
})
export class SpeechService {
  private headers = new HttpHeaders({
    'Ocp-Apim-Subscription-Key': '{你的Speech Service語音服務金鑰}',
    'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
    'Content-Type': 'application/ssml+xml',
    'User-Agent': 'AIConversationAPP'
  });

  constructor(private http: HttpClient) { }

  public textToSpeech(data: ConversationDataModel) {
    return this.http.post('https://<你的服務所在地區>.tts.speech.microsoft.com/cognitiveservices/v1', this.conversationConvertToSSML(data), {
      headers: this.headers,
      responseType: 'blob'
    });
  }

  private conversationConvertToSSML(response: ConversationDataModel): string {
    //取得GPT的對話內容
    let text = response.gptResponseText;
    //添加每個要強調的句子或單字
    response.gptResponseEmphasisTexts.forEach((emphasisText, index) => {
      //如果未定義，則默認為moderate
      const emphasisLevel = response.gptResponseEmphasisStyles[index] || "moderate";
      //使用正則表達式替換所有匹配的文字
      const regex = new RegExp(emphasisText, 'g');
      text = text.replace(regex, `<emphasis level="${emphasisLevel}">${emphasisText}</emphasis>`);
    });
    //返回完整的SSML語法，其中包括語言、語氣和語氣強度等
    return `
    <speak xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" version="1.0" xml:lang="en-US">\n
      <voice name="en-US-GuyNeural">\n
        <mstts:express-as style="${response.gptResponseTextStyle}" styledegree="${response.gptResponseTextStyleDegree}">\n  ${text}\n</mstts:express-as>\n
      </voice>\n
    </speak>`;
  }
}
