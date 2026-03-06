import { Component } from '@angular/core';
import { RouterModule,ActivatedRoute  } from '@angular/router';
import { environment } from '../../../../../environments/environment';
@Component({
  selector: 'app-signin-form',
  imports: [RouterModule],
  templateUrl: './signin-form.component.html',
  styles: ``
})
export class SigninFormComponent {
  errorMessage: string = '';

  constructor(private route: ActivatedRoute) {}
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      console.log('Params signin:', params['error']); 
      if (params['error']) {
        switch (params['error']) {
          case 'not_devoteam':
            this.errorMessage = 'Accès réservé aux emails Devoteam.';
            break;
          case 'not_found':
            this.errorMessage = 'Votre compte n\'existe pas dans le système.';
            break;
          case 'inactive':
            this.errorMessage = 'Accès impossible : votre compte est inactif. Veuillez contacter votre administrateur RH !';
            break;
          default:
            this.errorMessage = 'Erreur de connexion, réessayez.';
        }
      }
    });
  }
  loginWithGoogle() {
    window.location.href = `${environment.apiUrl}/auth/google`;
  }
}