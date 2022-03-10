export declare var cv:any;
import { Component, ElementRef, AfterViewChecked, ViewChild } from '@angular/core';
import { PhotoService } from '../photo-service/photo.service';
import { CapturedPhoto } from '../interfaces/captured-photo';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements AfterViewChecked{
  photo: CapturedPhoto;
  viewInited: boolean = false
  imagemString: SafeResourceUrl = ''
  imagemCartoon: SafeResourceUrl = ''
  @ViewChild('imagem', {read: ElementRef}) imagem:ElementRef
  @ViewChild('canvas', {read: ElementRef}) canvas:ElementRef
  @ViewChild('ion-img') ionImg
  private tryThreeTimes: number = 0
  requisitando: boolean = false
   
  constructor(private photoService: PhotoService, private sanitizer:DomSanitizer) {
    
  }

  ngAfterViewChecked(){
    if(this.photo){
      this.cartoonize(this.photo)
    }
  }
  
  
  async addPhotoToGallary(){
    this.photo =  await this.photoService.addNewToGallary()
    this.imagemString = this.sanitizer.bypassSecurityTrustResourceUrl(this.photo.webviewPath)   
    this.requisitando = true 
  }

  cartoonize(photo: CapturedPhoto){
    let imgElement: HTMLImageElement = this.imagem.nativeElement

    try{
      let img = cv.imread(imgElement);
      let gray = new cv.Mat();
      cv.cvtColor(img, gray, cv.COLOR_RGBA2GRAY, 0);
      cv.medianBlur(gray, gray, 1)
      console.log(gray)

      let edges = new cv.Mat();
      cv.adaptiveThreshold(gray, edges, 200, cv.ADAPTIVE_THRESH_MEAN_C, cv.THRESH_BINARY, 9, 9)

      let color = new cv.Mat();
      cv.cvtColor(img, img, cv.COLOR_RGBA2RGB, 0);
      cv.bilateralFilter(img, color, 9, 250, 250);

      let cartoon = new cv.Mat();
      cv.bitwise_and(color, color, cartoon, edges)
      console.log(cartoon.convertTo)

      let canvas: HTMLCanvasElement = this.canvas.nativeElement;
      cv.imshow(canvas, cartoon)
    



      this.imagemCartoon = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(new Blob([img.data], { type: 'image/png' } )))
      img.delete();
      this.requisitando = false
    }
    catch(error){
      if(this.tryThreeTimes <= 3){
        console.log('tentando de novo...')
        setTimeout(() => this.cartoonize(this.photo), 500)
        this.tryThreeTimes++
      }
      else{
        this.tryThreeTimes = 0
        this.requisitando = false
      }
    }
  }



}
