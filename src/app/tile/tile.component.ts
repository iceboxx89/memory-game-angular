import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';

@Component({
  selector: 'app-tile',
  templateUrl: './tile.component.html',
  styleUrls: ['./tile.component.scss'],
  animations: [
    trigger('flipCard', [
      state('start', style({ transform: 'rotateY(-180deg)' })),
      state('end', style({  })),
      transition('start => end', [ animate('0.2s') ]),
      transition('end => start', [ animate('0.2s') ])
    ])
  ]
})
export class TileComponent implements OnInit {

  public canShowPicture = false;
  public inPlay = true;
  @Input() imageUrl: string;
  @Output() pictureShown: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  showPicture() {
    this.canShowPicture = true;
    this.pictureShown.emit(this.imageUrl);
  }

  matched() {
    this.inPlay = false;
    this.canShowPicture = false;
  }

}
