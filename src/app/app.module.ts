import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

import { ElectronService } from 'ngx-electron';
import { ScreenshotService } from './services/screenshot.service';
import { UsersService } from './services/users.service';

import { AppComponent } from './app.component';
import { LoginComponent } from './auth/login/login.component';
import { InnerPageModule } from './inner-page/inner-page.module';




@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,
    InnerPageModule
  ],
  providers: [
    ElectronService,
    ScreenshotService,
    UsersService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
