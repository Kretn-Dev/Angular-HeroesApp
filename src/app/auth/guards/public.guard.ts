import { Injectable } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ActivatedRouteSnapshot, Route, Router, RouterStateSnapshot, UrlSegment } from '@angular/router';
import { Observable, map, tap } from 'rxjs';

@Injectable({providedIn: 'root'})
export class PublicGuard {
  constructor(private authService: AuthService, private router: Router) { }

  private VerifEstadoAuth(): boolean | Observable<boolean>{
    return this.authService.verifAutenticacion()
      .pipe(
        tap(isAuthenticated => {
          if(!isAuthenticated) {
            this.router.navigate(['./']);
          }
        }),
        map(isAuthenticated => !isAuthenticated)
      )
  }

  canMatch(route: Route, segments: UrlSegment[]): boolean | Observable<boolean>{


    return this.VerifEstadoAuth();
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> {

    return this.VerifEstadoAuth();
  }
}
