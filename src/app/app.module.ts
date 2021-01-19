import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ElectronService } from 'ngx-electron';

import { ScreenshotService } from './shared/services/screenshot.service';
import { UsersService } from './shared/services/users.service';
import { WorkDataService } from './shared/services/work-data.service';

import { AppComponent } from './app.component';
import { LoginComponent } from './auth/login/login.component';
import { InnerPageModule } from './inner-page/inner-page.module';
import { TokenInterceptor } from './shared/interceptors/token.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,
    InnerPageModule,
    NoopAnimationsModule,
  ],
  providers: [
    ElectronService,
    ScreenshotService,
    UsersService,
    WorkDataService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
