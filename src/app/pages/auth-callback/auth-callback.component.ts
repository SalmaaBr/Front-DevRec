import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [], 
  template: `
    <div class="flex items-center justify-center h-screen">
      <p class="text-gray-500">Connexion en cours...</p>
    </div>
  `,
})
export class AuthCallbackComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      console.log(' Auth callback params:', params);
      const token = params['token'] ? decodeURIComponent(params['token']) : null;
      const error = params['error'];
      console.log('Error value exact:', error);

      if (error) {
        let errorCode = 'unauthorized';
      
        if (error === 'inactive' || error.toLowerCase().includes('autoris') || 
          error.toLowerCase().includes('inactif')) {
        errorCode = 'inactive';
      } else if (error === 'not_found' || error.toLowerCase().includes('trouvé')) {
        errorCode = 'not_found';
      } else if (error === 'not_devoteam' || error.toLowerCase().includes('devoteam')) {
        errorCode = 'not_devoteam';
      }

      this.router.navigate(['/signin'], {
        queryParams: { error: errorCode }
      });
      return;
    }

    if (token) {
      this.authService.saveToken(token);
      const role = this.authService.getRole();
      switch (role) {
        case 'ADMIN_RH':
        case 'TALENT_ACQUISITION':
          this.router.navigate(['/']);
          break;
        case 'CONSULTANT':
          this.router.navigate(['/']);
          break;
        default:
          this.router.navigate(['/signin']);
      }
    } else {
      this.router.navigate(['/signin']);
    }
  });
}
}