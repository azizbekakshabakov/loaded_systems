import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing/app-routing.module';
import { AppComponent } from './app.component';
import { TasksComponent } from './tasks/tasks.component';
import { TaskDetailComponent } from './task-detail/task-detail.component';
import { MessagesComponent } from './messages/messages.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { HTTP_INTERCEPTORS, HttpClientModule, provideHttpClient, withFetch } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatDividerModule} from '@angular/material/divider';
import {MatListModule} from '@angular/material/list';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatGridListModule} from '@angular/material/grid-list';
import { AuthInterceptor } from './services/auth-interceptor/AuthInterceptor';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { LoggingInterceptor } from './services/log-interceptor/AuthInterceptor';
import {MatToolbarModule} from '@angular/material/toolbar';
import {Component, isDevMode} from '@angular/core';
import {MatSelectModule} from '@angular/material/select';
import { AddAutoComponent } from './components/add-auto/add-auto.component';
import { RentsComponent } from './components/rents/rents.component';
import { SetBalanceComponent } from './components/set-balance/set-balance.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { GraphQLModule } from './graphql.module';
import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache } from '@apollo/client/core';
import { inject } from '@angular/core';
import extractFiles from 'extract-files/extractFiles.mjs';
import isExtractableFile from 'extract-files/isExtractableFile.mjs';

@NgModule({
  declarations: [
    AppComponent,
    TasksComponent,
    TaskDetailComponent,
    MessagesComponent,
    DashboardComponent,
    LoginComponent,
    RegisterComponent,
    AddAutoComponent,
    RentsComponent,
    SetBalanceComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatButtonToggleModule, MatDividerModule, MatListModule, MatCheckboxModule, MatGridListModule, MatToolbarModule,
    MatSelectModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    })
  ],
  providers: [
    provideClientHydration(),
    // provideHttpClient(withFetch()),
    provideAnimationsAsync(),
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoggingInterceptor,
      multi: true
    },
    provideApollo(() => {
      const httpLink = inject(HttpLink);

      return {
        link: httpLink.create({
          uri: 'http://localhost:3000/graphql',
          extractFiles: body => extractFiles(body, isExtractableFile)
        }),
        cache: new InMemoryCache(),
      };
    }),
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
