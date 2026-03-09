import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../shared/services/auth.service';
import { environment } from '../../../environments/environment';
import { FormsModule } from '@angular/forms';
import { TableComponent } from '../../shared/components/ui/table/table.component';
import { TableHeaderComponent } from '../../shared/components/ui/table/table-header.component';
import { TableBodyComponent } from '../../shared/components/ui/table/table-body.component';
import { TableRowComponent } from '../../shared/components/ui/table/table-row.component';
import { TableCellComponent } from '../../shared/components/ui/table/table-cell.component';
import { ModalComponent } from '../../shared/components/ui/modal/modal.component';
import { ButtonComponent } from '../../shared/components/ui/button/button.component';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
  role: string;
  isActivated: boolean;
  createdAt: string;
  lastLogin: string;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, TableComponent, TableHeaderComponent, TableBodyComponent, TableRowComponent, TableCellComponent, ModalComponent, ButtonComponent],
  templateUrl: './users.component.html',
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  loading = true;
  roles = ['ADMIN_RH', 'TALENT_ACQUISITION', 'CONSULTANT'];
  editingUserId: number | null = null;
  editingRole = '';
  selectedUser: User | null = null;
  currentUserRole: string | null = null;

  searchQuery = '';
  filterRole = '';
  filterStatus = '';

  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({ Authorization: `Bearer ${token ?? ''}` });
  }

  ngOnInit(): void {
    this.currentUserRole = this.authService.getRole();
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.http
      .get<User[]>(`${environment.apiUrl}/users`, { headers: this.getHeaders() })
      .subscribe({
        next: (users) => {
          this.users = users;
          this.applyFilters();
          this.loading = false;
        },
        error: (err) => {
          console.error('Erreur chargement users:', err);
          this.loading = false;
        },
      });
  }

  get paginatedUsers(): User[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredUsers.slice(start, start + this.itemsPerPage);
  }

  get pages(): number[] {
    this.totalPages = Math.ceil(this.filteredUsers.length / this.itemsPerPage);
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  goToPage(page: number): void {
  if (page >= 1 && page <= this.totalPages) {
    this.currentPage = page;
  }
}

applySort(): void {
  if (!this.sortColumn) return;
  
  this.filteredUsers.sort((a, b) => {
    const valA = a[this.sortColumn as keyof User] ?? '';
    const valB = b[this.sortColumn as keyof User] ?? '';
    const cmp = String(valA).localeCompare(String(valB));
    return this.sortDirection === 'asc' ? cmp : -cmp;
  });

  this.currentPage = 1;
}


  applyFilters(): void {
    this.filteredUsers = this.users.filter(u => {
      const matchSearch = !this.searchQuery ||
        `${u.firstName} ${u.lastName} ${u.email}`
          .toLowerCase()
          .includes(this.searchQuery.toLowerCase());
      const matchRole = !this.filterRole || u.role === this.filterRole;
      const matchStatus = !this.filterStatus ||
        (this.filterStatus === 'actif' ? u.isActivated : !u.isActivated);
      return matchSearch && matchRole && matchStatus;
    });
    this.applySort();
    this.currentPage = 1;
  }

  startEdit(user: User): void {
    this.editingUserId = user.id;
    this.editingRole = user.role;
  }

  saveRole(user: User): void {
    this.http
      .patch(
        `${environment.apiUrl}/users/${user.id}/role`,
        { role: this.editingRole },
        { headers: this.getHeaders() },
      )
      .subscribe({
        next: () => {
          user.role = this.editingRole;
          this.editingUserId = null;
        },
        error: (err) => console.error('Erreur updateRole:', err),
      });
  }

  cancelEdit(): void {
    this.editingUserId = null;
  }

  toggleActivation(user: User): void {
    const newStatus = !user.isActivated;
    this.http
      .patch(
        `${environment.apiUrl}/users/${user.id}/activate`,
        { isActivated: newStatus },
        { headers: this.getHeaders() },
      )
      .subscribe({
        next: () => { user.isActivated = newStatus; },
        error: (err) => console.error('Erreur toggleActivation:', err),
      });
  }

  viewDetails(user: User): void {
    this.selectedUser = user;
  }

  closeDetails(): void {
    this.selectedUser = null;
  }

  deleteUser(user: User): void {
    if (!confirm(`Supprimer ${user.firstName} ${user.lastName} ?`)) return;
    this.http
      .delete(`${environment.apiUrl}/users/${user.id}`, { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          this.users = this.users.filter(u => u.id !== user.id);
          this.applyFilters();
        },
        error: (err) => console.error('Erreur deleteUser:', err),
      });
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'ADMIN_RH': return 'bg-red-100 text-red-700';
      case 'TALENT_ACQUISITION': return 'bg-blue-100 text-blue-700';
      case 'CONSULTANT': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  getRoleLabel(role: string): string {
    switch (role) {
      case 'ADMIN_RH': return 'Admin RH';
      case 'TALENT_ACQUISITION': return 'Recruteur';
      case 'CONSULTANT': return 'Consultant';
      default: return role;
    }
  }

  formatLastLogin(date: string): string {
    if (!date) return 'Jamais';
    const d = new Date(date);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000 / 60);
    if (diff < 60) return `Il y a ${diff} min`;
    if (diff < 1440) return `Il y a ${Math.floor(diff / 60)}h`;
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
}