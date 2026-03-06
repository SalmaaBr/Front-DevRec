import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private router: Router) {}

  // Sauvegarde le token après callback Google
  saveToken(token: string): void {
    localStorage.setItem('access_token', token);
  }

  // Récupère le token
  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  // Décode le payload du JWT sans librairie
  getUser(): any {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch {
      return null;
    }
  }

  // Vérifie si connecté
  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // Vérifie expiration
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  // Récupère le rôle
  getRole(): string | null {
    const user = this.getUser();
    return user?.role ?? null;
  }

  // Logout
  logout(): void {
    localStorage.removeItem('access_token');
    this.router.navigate(['/signin']);
  }
}