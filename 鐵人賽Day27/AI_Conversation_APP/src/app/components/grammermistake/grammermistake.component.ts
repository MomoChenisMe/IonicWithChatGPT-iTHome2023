import { IonicModule } from '@ionic/angular';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, finalize, switchMap, take } from 'rxjs';
import { ChatMessageModel, GrammerDataModel } from 'src/app/models/chatgpt.model';
import { StatusService } from 'src/app/services/status.service';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { OpenaiService } from 'src/app/services/openai.service';

@Component({
  selector: 'app-grammermistake',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule
  ],
  templateUrl: './grammermistake.component.html',
  styleUrls: ['./grammermistake.component.scss'],
  animations: [
    trigger('fadeInOut', [
      state('void', style({ opacity: 0 })),
      transition('void <=> *', animate(400)),
    ]),
  ]
})
export class GrammermistakeComponent {
  //是否正在執行API
  isGettingExplane = false;
  //解釋文本
  mistakExplaneText = '';

  constructor(private statusService: StatusService,
    private openaiService: OpenaiService) { }

  get grammerStatus$(): Observable<GrammerDataModel> {
    return this.statusService.grammerStatus$;
  }

  onIonModalDidPresent(event: Event) {
    if (this.mistakExplaneText === '') {
      this.isGettingExplane = true;
      this.statusService.grammerStatus$.pipe(
        take(1),
        switchMap(grammerStatusResult => this.openaiService.chatStreamAPI(this.getMistakeChatMessageData(grammerStatusResult.mistakeSentence))),
        finalize(() => {
          this.isGettingExplane = false;
        })
      ).subscribe(result => this.mistakExplaneText += result.choices[0].delta?.content ? result.choices[0].delta?.content : '');
    }
  }

  private getMistakeChatMessageData(contentData: string): ChatMessageModel[] {
    return [
      {
        role: 'system',
        content: '你是英文文法老師，請用繁體中文詳細解釋為什麼這句英文有錯誤。'
      },
      {
        role: 'user',
        content: contentData
      }
    ];
  }
}
