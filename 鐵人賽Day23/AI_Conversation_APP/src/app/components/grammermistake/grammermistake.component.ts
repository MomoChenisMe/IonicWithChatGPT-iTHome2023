import { IonicModule } from '@ionic/angular';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { GrammerDataModel } from 'src/app/models/chatgpt.model';
import { StatusService } from 'src/app/services/status.service';
import { trigger, state, style, transition, animate } from '@angular/animations';

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
  constructor(private statusService: StatusService) { }

  get grammerStatus$(): Observable<GrammerDataModel> {
    return this.statusService.grammerStatus$;
  }
}
