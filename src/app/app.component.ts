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

  @ViewChild('addSingleCloumName', { static: false }) addSingleCloumName: ElementRef | any;
  @ViewChild('addSingleCloumCost', { static: false }) addSingleCloumCost: ElementRef | any;
  @ViewChild('addSingleCloumFeMaleCost', { static: false }) addSingleCloumFeMaleCost: ElementRef | any;
  @ViewChild('addSingleCloumMaleCost', { static: false }) addSingleCloumMaleCost: ElementRef | any;

  title = 'podcast-cost-calc';
  slideText: boolean = false;
  hasInitData: boolean = false;
  readyStart: boolean = false;
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
  refreshingSheet: boolean = false;
  importingSheet: boolean = false;
  sheetName: string = '';
  error1: string = '';
  singleAddRowEditing: boolean = false;

  ngOnInit() {
    window.localStorage.removeItem('moderatorArrayV2');
    window.localStorage.removeItem('recordingStudioArrayV2');
    window.localStorage.removeItem('postMixArrayV2');
    window.localStorage.removeItem('sideRecordingCombinationArrayV2');
    window.localStorage.removeItem('outboundInterviewWriterArrayV2');
    window.localStorage.removeItem('photographyArrayV2');

    setTimeout(() => {
      this.readyStart = true;
    }, 2000);
    if (window.localStorage.getItem('moderatorArrayV3')) {
      this.hasInitData = true;
      setTimeout(() => {
        this.slideText = true;
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]') as any
        const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new (window as any).bootstrap.Tooltip(tooltipTriggerEl));
      }, 2500);
      this.moderatorArray = JSON.parse(window.localStorage.getItem('moderatorArrayV3')!);
      this.recordingStudioArray = JSON.parse(window.localStorage.getItem('recordingStudioArrayV3')!);
      this.postMixArray = JSON.parse(window.localStorage.getItem('postMixArrayV3')!);
      this.sideRecordingCombinationArray = JSON.parse(window.localStorage.getItem('sideRecordingCombinationArrayV3')!);
      this.outboundInterviewWriterArray = JSON.parse(window.localStorage.getItem('outboundInterviewWriterArrayV3')!);
      this.photographyArray = JSON.parse(window.localStorage.getItem('photographyArrayV3')!);
      this.sheetName = window.localStorage.getItem('sheetName')!;
    } else {
      this.hasInitData = false;
    }
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
        if (data.name === this.sideRecordingCombinationSelect.nativeElement.value) {
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

  async getSheetNames(sheetId: string) {
    this.error1 = '';
    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?key=AIzaSyDZ21ZBtNKXcwMQ-KlGOH1DtntDYmewXS0`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP 錯誤: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      this.sheetName = data.properties.title;
      window.localStorage.setItem('sheetName',data.properties.title);
    } catch (error) {
      this.error1 = '查無此表單 (請檢查表單ID是否正確)';
    }
  }

  importSheet(sheetId: string) {
    this.importingSheet = true;
    this.getSheetDataFromGoogle(sheetId);
  }

  async getSheetDataFromGoogle(sheetId: string) {
    window.localStorage.setItem('sheetId', sheetId);
    const moderatorUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/主持人!A1:B1000?key=AIzaSyCI1zwNGbbeULiKXx4uqckyvBs2bhVnQP4`;
    const moderatorRes = await fetch(moderatorUrl);
    const moderatorData = await moderatorRes.json();
    moderatorData.values.forEach((data: any, index: number) => {
      if (index > 0) {
        this.moderatorArray.push({ name: data[0], cost: data[1] });
      }
    });
    window.localStorage.setItem('moderatorArrayV3', JSON.stringify(this.moderatorArray));

    const recordingStudioUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/錄音室!A1:B1000?key=AIzaSyCI1zwNGbbeULiKXx4uqckyvBs2bhVnQP4`;
    const recordingStudioRes = await fetch(recordingStudioUrl);
    const recordingStudioData = await recordingStudioRes.json();
    recordingStudioData.values.forEach((data: any, index: number) => {
      if (index > 0) {
        this.recordingStudioArray.push({ name: data[0], cost: data[1] });
      }
    });
    window.localStorage.setItem('recordingStudioArrayV3', JSON.stringify(this.recordingStudioArray));

    const postMixArrayUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/後製混音!A1:B1000?key=AIzaSyCI1zwNGbbeULiKXx4uqckyvBs2bhVnQP4`;
    const postMixArrayRes = await fetch(postMixArrayUrl);
    const postMixArrayData = await postMixArrayRes.json();
    postMixArrayData.values.forEach((data: any, index: number) => {
      if (index > 0) {
        this.postMixArray.push({ name: data[0], cost: data[1] });
      }
    });
    window.localStorage.setItem('postMixArrayV3', JSON.stringify(this.postMixArray));

    const sideRecordingCombinationUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/梳化!A1:C1000?key=AIzaSyCI1zwNGbbeULiKXx4uqckyvBs2bhVnQP4`;
    const sideRecordingCombinationRes = await fetch(sideRecordingCombinationUrl);
    const sideRecordingCombinationData = await sideRecordingCombinationRes.json();
    sideRecordingCombinationData.values.forEach((data: any, index: number) => {
      if (index > 0) {
        if (data[0]) {
          if (data[1] === 'FM') {
            this.sideRecordingCombinationArray.push({ name: data[0], gender: { FeMale: { cost: data[2] } } });
          } else if (data[1] === 'M') {
            this.sideRecordingCombinationArray.push({ name: data[0], gender: { Male: { cost: data[2] } } });
          }
        } else {
          if (data[1] === 'FM') {
            this.sideRecordingCombinationArray[this.sideRecordingCombinationArray.length - 1].gender.FeMale =  { cost: data[2] };
          } else if (data[1] === 'M') {
            this.sideRecordingCombinationArray[this.sideRecordingCombinationArray.length - 1].gender.Male = { cost: data[2] };
          }
        }
      }
    });
    window.localStorage.setItem('sideRecordingCombinationArrayV3', JSON.stringify(this.sideRecordingCombinationArray));

    const outboundInterviewWriterUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/訪綱寫手!A1:B1000?key=AIzaSyCI1zwNGbbeULiKXx4uqckyvBs2bhVnQP4`;
    const outboundInterviewWriterRes = await fetch(outboundInterviewWriterUrl);
    const outboundInterviewWriterData = await outboundInterviewWriterRes.json();
    outboundInterviewWriterData.values.forEach((data: any, index: number) => {
      if (index > 0) {
        this.outboundInterviewWriterArray.push({ name: data[0], cost: data[1] });
      }
    });
    window.localStorage.setItem('outboundInterviewWriterArrayV3', JSON.stringify(this.outboundInterviewWriterArray));

    const photographyUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/平面攝影!A1:B1000?key=AIzaSyCI1zwNGbbeULiKXx4uqckyvBs2bhVnQP4`;
    const photographyRes = await fetch(photographyUrl);
    const photographyData = await photographyRes.json();
    photographyData.values.forEach((data: any, index: number) => {
      if (index > 0) {
        this.photographyArray.push({ name: data[0], cost: data[1] });
      }
    });
    window.localStorage.setItem('photographyArrayV3', JSON.stringify(this.photographyArray));
    this.hasInitData = true;
    this.refreshingSheet = false;
    this.importingSheet = false;
    setTimeout(() => {
      this.slideText = true;
      const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]') as any
      const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new (window as any).bootstrap.Tooltip(tooltipTriggerEl));
    }, 500);
  }

  refreshSheet() {
    this.refreshingSheet = true;
    this.moderatorArray = [];
    this.recordingStudioArray = [];
    this.postMixArray = [];
    this.sideRecordingCombinationArray = [];
    this.outboundInterviewWriterArray = [];
    this.photographyArray = [];
    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => {
      const tooltip = (window as any).bootstrap.Tooltip.getInstance(el);
      if (tooltip) {
          tooltip.dispose();
      }
    });
    this.getSheetDataFromGoogle(window.localStorage.getItem('sheetId')!);
  }

  importNew() {
    this.moderatorArray = [];
    this.recordingStudioArray = [];
    this.postMixArray = [];
    this.sideRecordingCombinationArray = [];
    this.outboundInterviewWriterArray = [];
    this.photographyArray = [];
    this.sheetName = '';
    this.hasInitData = false;
    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => {
      const tooltip = (window as any).bootstrap.Tooltip.getInstance(el);
      if (tooltip) {
          tooltip.dispose();
      }
    });
  }

  checkEditStatus(type: string, i: number) {
    if (type === 'moderator') {
      this.moderatorArray.forEach((data: any, index) => {
        if (index !== i) {
          data.edit = '';
        }
      });
    } else if (type === 'recordingStudio') {
      this.recordingStudioArray.forEach((data: any, index) => {
        if (index !== i) {
          data.edit = '';
        }
      });
    } else if (type === 'postMix') {
      this.postMixArray.forEach((data: any, index) => {
        if (index !== i) {
          data.edit = '';
        }
      });
    } else if (type === 'sideRecordingCombination') {
      this.sideRecordingCombinationArray.forEach((data: any, index) => {
        if (index !== i) {
          data.edit = '';
          data.gender.FeMale.edit = '';
          data.gender.Male.edit = '';
        }
      });
    } else if (type === 'outboundInterviewWriter') {
      this.outboundInterviewWriterArray.forEach((data: any, index) => {
        if (index !== i) {
          data.edit = '';
        }
      });
    } else if (type === 'photography') {
      this.photographyArray.forEach((data: any, index) => {
        if (index !== i) {
          data.edit = '';
        }
      });
    }
  }

  async updateSheet() {
    const API_URL = 'https://script.google.com/macros/s/AKfycbwmk1w8viUXBVqggSD7tTpWahs__YEnYdwHVbXgfoeJjvXQS_z2_RZGdsUUh3xeZ7HU/exec'
    const response = await fetch(API_URL, {
      method: "POST", // Apps Script 可支援 GET 或 POST
    });

    const data = await response.text();
    console.log("API 回應:", data);
  }

  clearEditing() {
    this.singleAddRowEditing = false;
    this.moderatorArray.forEach((data: any) => {
      data.edit = '';
      if (data.singleAddRowEdit) {
        data.singleAddRowEdit = false;
        this.moderatorArray = this.moderatorArray.slice(0, -1);
      }
    });
    this.recordingStudioArray.forEach((data: any) => {
      data.edit = '';
      if (data.singleAddRowEdit) {
        data.singleAddRowEdit = false;
        this.recordingStudioArray = this.recordingStudioArray.slice(0, -1);
      }
    });
    this.postMixArray.forEach((data: any) => {
        data.edit = '';
        if (data.singleAddRowEdit) {
          data.singleAddRowEdit = false;
          this.postMixArray = this.postMixArray.slice(0, -1);
        }
    });
    this.sideRecordingCombinationArray.forEach((data: any) => {
      data.edit = '';
      data.gender.FeMale.edit = '';
      data.gender.Male.edit = '';
      if (data.singleAddRowEdit) {
        data.singleAddRowEdit = false;
        this.sideRecordingCombinationArray = this.sideRecordingCombinationArray.slice(0, -1);
      }
    });
    this.outboundInterviewWriterArray.forEach((data: any) => {
      data.edit = '';
      if (data.singleAddRowEdit) {
        data.singleAddRowEdit = false;
        this.outboundInterviewWriterArray = this.outboundInterviewWriterArray.slice(0, -1);
      }
    });
    this.photographyArray.forEach((data: any) => {
      data.edit = '';
      if (data.singleAddRowEdit) {
        data.singleAddRowEdit = false;
        this.photographyArray = this.photographyArray.slice(0, -1);
      }
    });
  }

  saveSingleCloum(type: string, data: any, position: string, value: any) {
    if (data.name !== value && position.substring(0, 1) === 'A') {
      data.name = value;
    } else {
      if (data.cost !== value) {
        data.cost = value;
      }
    }

    if (type === 'moderator') {
      window.localStorage.setItem('moderatorArrayV3', JSON.stringify(this.moderatorArray));
    } else if (type === 'recordingStudio') {
      window.localStorage.setItem('recordingStudioArrayV3', JSON.stringify(this.recordingStudioArray));
    } else if (type === 'postMix') {
      window.localStorage.setItem('postMixArrayV3', JSON.stringify(this.postMixArray));
    } else if (type === 'sideRecordingCombination') {
      window.localStorage.setItem('sideRecordingCombinationArrayV3', JSON.stringify(this.sideRecordingCombinationArray));
    } else if (type === 'outboundInterviewWriter') {
      window.localStorage.setItem('outboundInterviewWriterArrayV3', JSON.stringify(this.outboundInterviewWriterArray));
    } else if (type === 'photography') {
      window.localStorage.setItem('photographyArrayV3', JSON.stringify(this.photographyArray));
    }
  }

  addRow(type: string) {
    this.singleAddRowEditing = true;
    if (type === 'moderator') {
      this.moderatorArray.push({ name: '', cost: '', singleAddRowEdit: true });
    } else if (type === 'recordingStudio') {
      this.recordingStudioArray.push({ name: '', cost: '', singleAddRowEdit: true });
    } else if (type === 'postMix') {
      this.postMixArray.push({ name: '', cost: '', singleAddRowEdit: true });
    } else if (type === 'sideRecordingCombination') {
      this.sideRecordingCombinationArray.push({ name: '', gender: { FeMale: { cost: '' }, Male: { cost: '' } }, singleAddRowEdit: true });
    } else if (type === 'outboundInterviewWriter') {
      this.outboundInterviewWriterArray.push({ name: '', cost: '', singleAddRowEdit: true });
    } else if (type === 'photography') {
      this.photographyArray.push({ name: '', cost: '', singleAddRowEdit: true });
    }
  }

  cancelAddRow(type: string) {
    this.singleAddRowEditing = false;
    if (type === 'moderator') {
      this.moderatorArray = this.moderatorArray.slice(0, -1);
    } else if (type === 'recordingStudio') {
      this.recordingStudioArray = this.recordingStudioArray.slice(0, -1);
    } else if (type === 'postMix') {
      this.postMixArray = this.postMixArray.slice(0, -1);
    } else if (type === 'sideRecordingCombination') {
      this.sideRecordingCombinationArray = this.sideRecordingCombinationArray.slice(0, -1);
    } else if (type === 'outboundInterviewWriter') {
      this.outboundInterviewWriterArray = this.outboundInterviewWriterArray.slice(0, -1);
    } else if (type === 'photography') {
      this.photographyArray = this.photographyArray.slice(0, -1);
    }

  }

  confirmAddRow(type: string) {
    if (type === 'moderator') {
      this.moderatorArray[this.moderatorArray.length - 1].name = this.addSingleCloumName.nativeElement.value;
      this.moderatorArray[this.moderatorArray.length - 1].cost = this.addSingleCloumCost.nativeElement.value;
      this.moderatorArray[this.moderatorArray.length - 1].singleAddRowEdit = false;
      window.localStorage.setItem('moderatorArrayV3', JSON.stringify(this.moderatorArray));
    } else if (type === 'recordingStudio') {
      this.recordingStudioArray[this.recordingStudioArray.length - 1].name = this.addSingleCloumName.nativeElement.value;
      this.recordingStudioArray[this.recordingStudioArray.length - 1].cost = this.addSingleCloumCost.nativeElement.value;
      this.recordingStudioArray[this.recordingStudioArray.length - 1].singleAddRowEdit = false;
      window.localStorage.setItem('recordingStudioArrayV3', JSON.stringify(this.recordingStudioArray));
    } else if (type === 'postMix') {
      this.postMixArray[this.postMixArray.length - 1].name = this.addSingleCloumName.nativeElement.value;
      this.postMixArray[this.postMixArray.length - 1].cost = this.addSingleCloumCost.nativeElement.value;
      this.postMixArray[this.postMixArray.length - 1].singleAddRowEdit = false;
      window.localStorage.setItem('postMixArrayV3', JSON.stringify(this.postMixArray));
    } else if (type === 'sideRecordingCombination') {
      this.sideRecordingCombinationArray[this.sideRecordingCombinationArray.length - 1].name = this.addSingleCloumName.nativeElement.value;
      this.sideRecordingCombinationArray[this.sideRecordingCombinationArray.length - 1].gender.FeMale.cost = this.addSingleCloumFeMaleCost.nativeElement.value;
      this.sideRecordingCombinationArray[this.sideRecordingCombinationArray.length - 1].gender.Male.cost = this.addSingleCloumMaleCost.nativeElement.value;
      this.sideRecordingCombinationArray[this.sideRecordingCombinationArray.length - 1].singleAddRowEdit = false;
      window.localStorage.setItem('sideRecordingCombinationArrayV3', JSON.stringify(this.sideRecordingCombinationArray));
    } else if (type === 'outboundInterviewWriter') {
      this.outboundInterviewWriterArray[this.outboundInterviewWriterArray.length - 1].name = this.addSingleCloumName.nativeElement.value;
      this.outboundInterviewWriterArray[this.outboundInterviewWriterArray.length - 1].cost = this.addSingleCloumCost.nativeElement.value;
      this.outboundInterviewWriterArray[this.outboundInterviewWriterArray.length - 1].singleAddRowEdit = false;
      window.localStorage.setItem('outboundInterviewWriterArrayV3', JSON.stringify(this.outboundInterviewWriterArray));
    } else if (type === 'photography') {
      this.photographyArray[this.photographyArray.length - 1].name = this.addSingleCloumName.nativeElement.value;
      this.photographyArray[this.photographyArray.length - 1].cost = this.addSingleCloumCost.nativeElement.value;
      this.photographyArray[this.photographyArray.length - 1].singleAddRowEdit = false;
      window.localStorage.setItem('photographyArrayV3', JSON.stringify(this.photographyArray));
    }
    this.singleAddRowEditing = false;
  }

  deleteRow() {

  }
}
