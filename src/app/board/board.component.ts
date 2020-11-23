import { Component, OnInit, ViewChildren } from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';
import { Timer, pad } from 'interval-timer';
import { HttpClient } from '@angular/common/http';
import { TileComponent } from './../tile/tile.component';

interface ImagesData {
  url: string;
  tileText: string;
}

interface ApiResponse {
  message: any[];
  status: string;
}

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
  animations: [
    trigger('startGame', [
      state('start', style({
        backgroundColor: '#7f8fa6'
      })),
      state('end', style({
        backgroundColor: '#7f8c8d'
      })),
      transition('end => start', [
        animate('0.5s')
      ])
    ])
  ]
})
export class BoardComponent implements OnInit {

  public gameState = 'end';
  public gameTimer = '';
  private intervalTimer: any;
  private numRows = 3;
  private numColumns = this.numRows + 1;
  private imagesNeeded = (this.numRows * this.numColumns) / 2;
  public images: ImagesData[] = [];
  public imagesMatched = 0;
  public winnerAnnounce = false;

  constructor(private http: HttpClient) { }

  @ViewChildren(TileComponent) tiles: TileComponent[];

  ngOnInit() {
  }

  initBoard() {
    const _url = `https://dog.ceo/api/breeds/image/random/${this.imagesNeeded}`;
    this.http.get(_url).subscribe(
      (result: ApiResponse) => {
        let tempArray: number[] = [];
        for (let row = 0; row < this.numRows; row++) {
          for (let col = 0; col < this.numColumns; col++) {
            // find the indexes
            const imageToUse = this.getImageToUse(
              tempArray, Math.floor(Math.random() * this.imagesNeeded)
            );
            console.log(`row: ${row} column: ${col}: ${imageToUse}`);
            tempArray.push(imageToUse);
          }
        }
        tempArray.forEach( (idx) => {
          this.images.push({ url: result.message[idx], tileText: 'Pick Me!!'});
        });
        // setup the timer...
        this.intervalTimer = new Timer({
          startTime: 0,
          endTime: null,
          updateFrequency: 1000
        });
        this.intervalTimer.on('update', () => {
          const seconds = pad('00', this.intervalTimer.getTime.seconds, true);
          const minutes = pad('00', this.intervalTimer.getTime.minutes, true);
          const hours = pad('00', this.intervalTimer.getTime.hours, true);
          this.gameTimer = `${hours}:${minutes}:${seconds}`;
        });
        this.intervalTimer.start();
      },
      (message) => {
        console.warn(message);
      }
    );
  }

  getImageToUse(source: any[], imagePref: number) {
    const items = source.filter((old: number) => { return old === imagePref });
    if (items.length < 2) {
      return imagePref;
    } else {
      return this.getImageToUse(source, Math.floor(Math.random() * this.imagesNeeded));
    }
  }

  startGame() {
    this.initBoard();
    setTimeout( () => {
      this.gameState = 'start';
    }, 300);
  }

  checkMatches(url: string) {
    const selectedTiles = this.tiles.filter( tile => tile.canShowPicture );
    if (selectedTiles.length === 2) {
      const matchedTiles = selectedTiles.filter( tile => tile.imageUrl === url );
      if (matchedTiles.length !== 2) {
        setTimeout(
          () => {
            selectedTiles.forEach( tile => tile.canShowPicture = !tile.canShowPicture );
          }, 1000
        );
      } else {
        matchedTiles.forEach(tile => {
          setTimeout(
            () => {
              tile.matched();
            }, 500
          );
        });
        this.imagesMatched++;
        setTimeout(() => { this.checkGameOver(); }, 600);
      }
    }
  }

  checkGameOver() {
    if (this.imagesMatched === this.imagesNeeded) {
      this.intervalTimer.stop();
      this.winnerAnnounce = true;
    }
  }

  resetGame() {
    location.reload();
  }

}
