import { Injectable } from '@angular/core';
import {Camera, CameraResultType, CameraSource, Photo} from '@capacitor/camera';
import {Filesystem, Directory} from '@capacitor/filesystem';
import {Storage} from '@capacitor/storage'
import { CapturedPhoto } from '../interfaces/captured-photo';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {

  capturedPhotos: CapturedPhoto[] =[]
  private PHOTO_STORAGE: string = 'photos'

  constructor() { }

  public async addNewToGallary(){
   const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100
    })

    const savedPhoto = await this.savePhoto(capturedPhoto)
    return savedPhoto
  }

  private async savePhoto(photo: Photo){
    const base64 = await this.read64Base(photo)

    const fileName = new Date().getTime() + '.jpeg'

    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64,
      directory: Directory.Data
    })

    return {
      filepath: fileName,
      webviewPath: photo.webPath
    }
  }

  private async read64Base(photo: Photo){
    const response = await fetch(photo.webPath)
    const blob = await response.blob()

    return await this.convertBlobToBase64(blob) as string    
  }

  convertBlobToBase64 = (blob:Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = reject
    reader.onload = () => {
      resolve(reader.result)
    }

    reader.readAsDataURL(blob)
  })
  

  async loadSaved(){

    const photoList = await Storage.get({key: this.PHOTO_STORAGE})
    this.capturedPhotos = JSON.parse(photoList.value) || []    

    for(let photo of this.capturedPhotos){
      const readFile = await Filesystem.readFile({
        path: photo.filepath,
        directory: Directory.Data
      })

     //photo.webviewPath = `data:image/jpeg;base:64,${readFile.data}`
    }
  }
}
