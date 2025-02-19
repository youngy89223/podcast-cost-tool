import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import Papa from 'papaparse';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  @ViewChild('moderatorSelect', { static: false }) moderatorSelect: ElementRef | any;
  @ViewChild('recordingStudioSelect', { static: false }) recordingStudioSelect: ElementRef | any;
  @ViewChild('postMixSelect', { static: false }) postMixSelect: ElementRef | any;
  @ViewChild('sideRecordingCombinationSelect', { static: false }) sideRecordingCombinationSelect: ElementRef | any;
  @ViewChild('sideRecordingCombinationFM', { static: false }) sideRecordingCombinationFM: ElementRef | any;
  @ViewChild('sideRecordingCombinationM', { static: false }) sideRecordingCombinationM: ElementRef | any;
  @ViewChild('outboundInterviewWriterSelect', { static: false }) outboundInterviewWriterSelect: ElementRef | any;
  @ViewChild('outboundInterviewWriterCount', { static: false }) outboundInterviewWriterCount: ElementRef | any;
  @ViewChild('photographySelect', { static: false }) photographySelect: ElementRef | any;
  title = 'podcast-cost-calc';
  readyStart: boolean = false;
  csvContent: any[] = [];
  moderatorArray: any[] = [];
  recordingStudioArray: any[] = [];
  postMixArray: any[] = [];
  sideRecordingCombinationArray: any[] = [];
  outboundInterviewWriterArray: any[] = [];
  photographyArray: any[] = [];
  showGenderCount: boolean = false;
  showOutboundInterviewCount: boolean = false;
  nowDateTime: string = '';
  startCalc: boolean = false;
  resultCost: number = 0;

  ngOnInit() {
    setTimeout(() => {
      this.readyStart = true;
    }, 3000);
    if (window.localStorage.getItem('moderatorArray')) {
      this.moderatorArray = JSON.parse(window.localStorage.getItem('moderatorArray')!);
      this.recordingStudioArray = JSON.parse(window.localStorage.getItem('recordingStudioArray')!);
      this.postMixArray = JSON.parse(window.localStorage.getItem('postMixArray')!);
      this.sideRecordingCombinationArray = JSON.parse(window.localStorage.getItem('sideRecordingCombinationArray')!);
      this.outboundInterviewWriterArray = JSON.parse(window.localStorage.getItem('outboundInterviewWriterArray')!);
      this.photographyArray = JSON.parse(window.localStorage.getItem('photographyArray')!);
    }
  }

  // 檔案選擇事件
  onFileSelected(event: any): void {
    window.localStorage.clear();
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    // 讀取檔案為二進位 (ArrayBuffer)
    reader.onload = (e) => {
      const arrayBuffer = reader.result as ArrayBuffer;

      // 嘗試用 `TextDecoder` 解析不同編碼
      const text = this.decodeANSI(arrayBuffer, "big5"); // 或 "windows-1252", "GB18030"

      this.parseCSV(text);
    };

    reader.readAsArrayBuffer(file); // 讀取二進位數據
  }

  // 解析 CSV 內容
  parseCSV(csvText: string): void {
    Papa.parse(csvText, {
      header: false,
      skipEmptyLines: true,
      complete: (result) => {
        result.data.forEach((data: any, index) => {
          if (index > 0) {
            if (data[0] === 'A') {
              this.moderatorArray.push({ code: data[1], name: data[2], cost: data[3] });
            } else if (data[0] === 'B') {
              this.recordingStudioArray.push({ code: data[1], name: data[2], cost: data[3] });
            } else if (data[0] === 'C') {
              this.postMixArray.push({ code: data[1], name: data[2], cost: data[3] });
            } else if (data[0] === 'D') {
              this.sideRecordingCombinationArray.push({ code: data[1], name: data[2], gender: { FeMale: { cost: data[3].split('-')[0].split(':')[1] }, Male: { cost: data[3].split('-')[1].split(':')[1] }} });
            } else if (data[0] === 'E') {
              this.outboundInterviewWriterArray.push({ code: data[1], name: data[2], cost: data[3] });
            } else if (data[0] === 'F') {
              this.photographyArray.push({ code: data[1], name: data[2], cost: data[3] });
            }
          }
        });
        window.localStorage.setItem('moderatorArray', JSON.stringify(this.moderatorArray));
        window.localStorage.setItem('recordingStudioArray', JSON.stringify(this.recordingStudioArray));
        window.localStorage.setItem('postMixArray', JSON.stringify(this.postMixArray));
        window.localStorage.setItem('sideRecordingCombinationArray', JSON.stringify(this.sideRecordingCombinationArray));
        window.localStorage.setItem('outboundInterviewWriterArray', JSON.stringify(this.outboundInterviewWriterArray));
        window.localStorage.setItem('photographyArray', JSON.stringify(this.photographyArray));
      }
    });
  }

  // **手動解碼 ANSI / Big5 / GB18030 編碼**
  decodeANSI(arrayBuffer: ArrayBuffer, encoding: string): string {
    const decoder = new TextDecoder(encoding);
    return decoder.decode(arrayBuffer);
  }

  sideRecordingCombinationChange(value: string) {
    if (value !== '0') {
      this.showGenderCount = true;
    } else {
      this.showGenderCount = false;
    }
  }

  outboundInterviewWriterChange(value: string) {
    if (value !== '0') {
      this.showOutboundInterviewCount = true;
    } else {
      this.showOutboundInterviewCount = false;
    }
  }

  calcResult() {
    this.startCalc = true;
    this.resultCost = 0;
    this.resultCost += Number(this.moderatorSelect.nativeElement.value) + Number(this.recordingStudioSelect.nativeElement.value) + Number(this.postMixSelect.nativeElement.value) + Number(this.photographySelect.nativeElement.value);
    if (this.sideRecordingCombinationSelect.nativeElement.value !== '0') {
      this.sideRecordingCombinationArray.forEach((data) => {
        if (data.code === this.sideRecordingCombinationSelect.nativeElement.value) {
          this.resultCost += Number(data.gender.FeMale.cost) * this.sideRecordingCombinationFM.nativeElement.value;
          this.resultCost += Number(data.gender.Male.cost) * this.sideRecordingCombinationM.nativeElement.value;
        }
      });
    }
    if (this.outboundInterviewWriterSelect.nativeElement.value !== '0') {
      this.resultCost += Number(this.outboundInterviewWriterSelect.nativeElement.value) * this.outboundInterviewWriterCount.nativeElement.value;
    }
    this.nowDateTime = new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString();
    const toastTrigger = document.getElementById('liveToastBtn');
    const toastLiveExample = document.getElementById('liveToast');

    if (toastTrigger) {
      const toastBootstrap = new (window as any).bootstrap.Toast(toastLiveExample);
      setTimeout(() => {
        this.startCalc = false;
        toastBootstrap.show();
      }, 2000);
    }
  }
}
