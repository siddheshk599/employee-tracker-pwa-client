import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { tap } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { secureStorage } from '../../shared/storage';

@Injectable({
  providedIn: 'root'
})
export class InterceptorService implements HttpInterceptor {

  constructor(
    private injector: Injector
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): any {

    let loggedIn = secureStorage.getItem('loggedIn');
    let authReq = req;
    const authService = this.injector.get(AuthService);

    if (loggedIn === "true") {
      const token = secureStorage.getItem('jwtToken');
      authReq = req.clone({ headers: req.headers.set('Authorization', 'bearer ' + token)});
    }

    return next.handle(authReq);
  }
}

@Injectable({
  providedIn: 'root'
})
export class UnauthorizedInterceptor implements HttpInterceptor {
  constructor(
    private injector: Injector
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): any {
    const authService = this.injector.get(AuthService);

    const token = secureStorage.getItem('jwtToken');
    const authReq = req.clone({ headers: req.headers.set('Authorization', 'bearer ' + token) });

    return next.handle(req).pipe(
      tap((event: HttpEvent<any>) => {
        // Do nothing.
      }, (error) => {
        if (error instanceof HttpErrorResponse) {
          if (error.status === 401 && token) {
            authService.checkJwtToken();
            authService.logOut();
          }
        }
      })
    );
  }
}
