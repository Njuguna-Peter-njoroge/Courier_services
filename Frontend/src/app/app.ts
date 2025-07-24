import { Component } from '@angular/core';
import { Router, RouterOutlet, NavigationStart } from '@angular/router';
import {Navbar} from './component/Shared/navbar/navbar';
import {Footer} from './component/Shared/footer/footer';
import {Login} from './component/auth/login/login';
import {Register} from './component/auth/register/register';
import {EmailVerification} from './component/auth/email-verification/email-verification';
import { LoaderComponent } from './component/Shared/loader/loader';
import { LoaderService } from './services/loader.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Footer, Login, Register, EmailVerification, LoaderComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'Frontend';
  loading = false;
  loadingMessage = 'Loading, please wait...';

  constructor(private router: Router, private loaderService: LoaderService) {
    this.loaderService.loading$.subscribe(({show, message}) => {
      this.loading = show;
      this.loadingMessage = message;
    });

    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.loaderService.show();
        setTimeout(() => {
          this.loaderService.hide();
        }, 3000);
      }
    });
  }
}
