import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

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

  public textToSpeech(text: string) {
    const textData = `<speak xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" version="1.0" xml:lang="en-US">
      <voice name="en-US-GuyNeural">
        ${text}
      </voice>
    </speak>`;
    return this.http.post('https://<你的服務所在地區>.tts.speech.microsoft.com/cognitiveservices/v1', textData, {
      headers: this.headers,
      responseType: 'blob'
    });
  }
}
