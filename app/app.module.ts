import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { GridModule } from '@progress/kendo-angular-grid';
import { HttpModule } from '@angular/http';

import { AppComponent }   from './app.component';

@NgModule({
  imports:      [ BrowserModule, GridModule, HttpModule ],
  declarations: [ AppComponent ],
  bootstrap:    [ AppComponent ]
})

export class AppModule { }
