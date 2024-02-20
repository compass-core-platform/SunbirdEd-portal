import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EcmlHandlerComponentComponent } from './components';

const routes: Routes = [
  {
    path: '', component: EcmlHandlerComponentComponent
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MobilePlayerRoutingModule { }