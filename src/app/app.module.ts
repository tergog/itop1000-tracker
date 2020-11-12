import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { ElectronService } from 'ngx-electron';
import { ScreenshotService } from '../services/screenshot.service';

import { AppComponent } from './app.component';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule
  ],
  providers: [
    ElectronService,
    ScreenshotService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
