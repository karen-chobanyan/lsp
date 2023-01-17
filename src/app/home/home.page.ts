import {Component, OnInit} from '@angular/core';
import {RecordingData, VoiceRecorder} from "capacitor-voice-recorder";
import {Directory, FileInfo, Filesystem, ReaddirResult} from "@capacitor/filesystem";
import {getStorage, ref, uploadString} from "@firebase/storage";
import {initializeApp} from "firebase/app";

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  recording = false;
  buttonText = "Start"
  private storedFiles: FileInfo[] = [];
  private storage;

  constructor() {
    const firebaseConfig = {

    };

    const app = initializeApp(firebaseConfig);
    this.storage = getStorage(app);
  }

  ngOnInit() {
    VoiceRecorder.requestAudioRecordingPermission().then();
    this.loadFiles();
  }

  recordButtonClicked() {
    this.recording = !this.recording;
    if (this.recording) {
      this.buttonText = "Stop";
      this.startRecording();
    } else {
      this.buttonText = "Start"
      this.stopRecording();
    }
    console.log("Record")
  }

  private startRecording() {
    console.log("Start");
    VoiceRecorder.startRecording().then(result => {
      console.log(result);
    });
  }

  private stopRecording() {
    console.log("Stop");
    VoiceRecorder.stopRecording().then((result: RecordingData) => {
      console.log(result.value.recordDataBase64);
      const recordedData = result.value.recordDataBase64;
      const fileName = new Date().getTime() + '.wav';
      uploadString(ref(this.storage, new Date().toLocaleDateString("en-US", {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) + '/' + new Date().getTime() + ".wav"), 'data:audio/aac;base64,' + recordedData, 'data_url').then(res => {
        console.log(res)
      })
      const audioRef = new Audio(`data:audio/aac;base64, ${recordedData}`);
      audioRef.oncanplaythrough = () => audioRef.play();
    })
  }

  private loadFiles() {
    Filesystem.readdir({
      path: '',
      directory: Directory.Data
    }).then((result: ReaddirResult) => {
      this.storedFiles = result.files;
    })
  }
}
