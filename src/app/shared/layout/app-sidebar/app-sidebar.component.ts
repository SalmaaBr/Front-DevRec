import { CommonModule } from '@angular/common';
import { Component, ElementRef, QueryList, ViewChildren, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { SidebarService } from '../../services/sidebar.service';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { SafeHtmlPipe } from '../../pipe/safe-html.pipe';
import { combineLatest, Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';

type NavItem = {
  name: string;
  icon: string;
  path?: string;
  new?: boolean;
  roles?: string[];
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const ICONS = {
  dashboard: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M5.5 3.25C4.25736 3.25 3.25 4.25736 3.25 5.5V8.99998C3.25 10.2426 4.25736 11.25 5.5 11.25H9C10.2426 11.25 11.25 10.2426 11.25 8.99998V5.5C11.25 4.25736 10.2426 3.25 9 3.25H5.5ZM4.75 5.5C4.75 5.08579 5.08579 4.75 5.5 4.75H9C9.41421 4.75 9.75 5.08579 9.75 5.5V8.99998C9.75 9.41419 9.41421 9.74998 9 9.74998H5.5C5.08579 9.74998 4.75 9.41419 4.75 8.99998V5.5ZM5.5 12.75C4.25736 12.75 3.25 13.7574 3.25 15V18.5C3.25 19.7426 4.25736 20.75 5.5 20.75H9C10.2426 20.75 11.25 19.7427 11.25 18.5V15C11.25 13.7574 10.2426 12.75 9 12.75H5.5ZM4.75 15C4.75 14.5858 5.08579 14.25 5.5 14.25H9C9.41421 14.25 9.75 14.5858 9.75 15V18.5C9.75 18.9142 9.41421 19.25 9 19.25H5.5C5.08579 19.25 4.75 18.9142 4.75 18.5V15ZM12.75 5.5C12.75 4.25736 13.7574 3.25 15 3.25H18.5C19.7426 3.25 20.75 4.25736 20.75 5.5V8.99998C20.75 10.2426 19.7426 11.25 18.5 11.25H15C13.7574 11.25 12.75 10.2426 12.75 8.99998V5.5ZM15 4.75C14.5858 4.75 14.25 5.08579 14.25 5.5V8.99998C14.25 9.41419 14.5858 9.74998 15 9.74998H18.5C18.9142 9.74998 19.25 9.41419 19.25 8.99998V5.5C19.25 5.08579 18.9142 4.75 18.5 4.75H15ZM15 12.75C13.7574 12.75 12.75 13.7574 12.75 15V18.5C12.75 19.7426 13.7574 20.75 15 20.75H18.5C19.7426 20.75 20.75 19.7427 20.75 18.5V15C20.75 13.7574 19.7426 12.75 18.5 12.75H15ZM14.25 15C14.25 14.5858 14.5858 14.25 15 14.25H18.5C18.9142 14.25 19.25 14.5858 19.25 15V18.5C19.25 18.9142 18.9142 19.25 18.5 19.25H15C14.5858 19.25 14.25 18.9142 14.25 18.5V15Z" fill="currentColor"></path></svg>`,
  
  users: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 4.75C10.2051 4.75 8.75 6.20507 8.75 8C8.75 9.79493 10.2051 11.25 12 11.25C13.7949 11.25 15.25 9.79493 15.25 8C15.25 6.20507 13.7949 4.75 12 4.75ZM7.25 8C7.25 5.37665 9.37665 3.25 12 3.25C14.6234 3.25 16.75 5.37665 16.75 8C16.75 10.6234 14.6234 12.75 12 12.75C9.37665 12.75 7.25 10.6234 7.25 8ZM6.5 16.75C5.5335 16.75 4.75 17.5335 4.75 18.5V19.25C4.75 19.6642 4.41421 20 4 20C3.58579 20 3.25 19.6642 3.25 19.25V18.5C3.25 16.7051 4.70507 15.25 6.5 15.25H17.5C19.2949 15.25 20.75 16.7051 20.75 18.5V19.25C20.75 19.6642 20.4142 20 20 20C19.5858 20 19.25 19.6642 19.25 19.25V18.5C19.25 17.5335 18.4665 16.75 17.5 16.75H6.5Z" fill="currentColor"></path></svg>`,

  fiches: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M8.50391 4.25C8.50391 3.83579 8.83969 3.5 9.25391 3.5H15.2777C15.4766 3.5 15.6674 3.57902 15.8081 3.71967L18.2807 6.19234C18.4214 6.333 18.5004 6.52376 18.5004 6.72268V16.75C18.5004 17.1642 18.1646 17.5 17.7504 17.5H16.248V17.4993H14.748V17.5H9.25391C8.83969 17.5 8.50391 17.1642 8.50391 16.75V4.25ZM14.748 19H9.25391C8.01126 19 7.00391 17.9926 7.00391 16.75V6.49854H6.24805C5.83383 6.49854 5.49805 6.83432 5.49805 7.24854V19.75C5.49805 20.1642 5.83383 20.5 6.24805 20.5H13.998C14.4123 20.5 14.748 20.1642 14.748 19.75L14.748 19ZM7.00391 4.99854V4.25C7.00391 3.00736 8.01127 2 9.25391 2H15.2777C15.8745 2 16.4468 2.23705 16.8687 2.659L19.3414 5.13168C19.7634 5.55364 20.0004 6.12594 20.0004 6.72268V16.75C20.0004 17.9926 18.9931 19 17.7504 19H16.248L16.248 19.75C16.248 20.9926 15.2407 22 13.998 22H6.24805C5.00541 22 3.99805 20.9926 3.99805 19.75V7.24854C3.99805 6.00589 5.00541 4.99854 6.24805 4.99854H7.00391Z" fill="currentColor"></path></svg>`,

  assistance: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 3.25C7.16751 3.25 3.25 7.16751 3.25 12C3.25 16.8325 7.16751 20.75 12 20.75C16.8325 20.75 20.75 16.8325 20.75 12C20.75 7.16751 16.8325 3.25 12 3.25ZM1.75 12C1.75 6.33908 6.33908 1.75 12 1.75C17.6609 1.75 22.25 6.33908 22.25 12C22.25 17.6609 17.6609 22.25 12 22.25C6.33908 22.25 1.75 17.6609 1.75 12ZM12 8.25C11.0335 8.25 10.25 9.0335 10.25 10C10.25 10.4142 9.91421 10.75 9.5 10.75C9.08579 10.75 8.75 10.4142 8.75 10C8.75 8.20507 10.2051 6.75 12 6.75C13.7949 6.75 15.25 8.20507 15.25 10C15.25 11.4036 14.4162 12.6158 13.2222 13.1818C13.0183 13.2783 12.75 13.4505 12.75 13.75V14.5C12.75 14.9142 12.4142 15.25 12 15.25C11.5858 15.25 11.25 14.9142 11.25 14.5V13.75C11.25 12.6763 11.9242 11.8361 12.6583 11.4858C13.2998 11.1826 13.75 10.6395 13.75 10C13.75 9.0335 12.9665 8.25 12 8.25ZM12 18.25C11.5858 18.25 11.25 17.9142 11.25 17.5V17C11.25 16.5858 11.5858 16.25 12 16.25C12.4142 16.25 12.75 16.5858 12.75 17V17.5C12.75 17.9142 12.4142 18.25 12 18.25Z" fill="currentColor"></path></svg>`,
};

const ALL_NAV_ITEMS: NavItem[] = [
  {
    icon: ICONS.dashboard,
    name: 'Tableau de bord',
    path: '/',
    roles: ['ADMIN_RH', 'TALENT_ACQUISITION', 'CONSULTANT'],
  },
  {
    icon: ICONS.users,
    name: 'Utilisateurs',
    path: '/users',
    roles: ['ADMIN_RH'],
  },
  {
    icon: ICONS.fiches,
    name: 'Fiches de poste',
    path: '/fiches',
    roles: ['ADMIN_RH', 'TALENT_ACQUISITION'],
  },
  {
    icon: ICONS.assistance,
    name: 'Assistance',
    path: '/assistance',
    roles: ['ADMIN_RH', 'CONSULTANT'],
  },
];

@Component({
  standalone: true,
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule, SafeHtmlPipe],
  templateUrl: './app-sidebar.component.html',
})
export class AppSidebarComponent implements OnInit, OnDestroy {

  navItems: NavItem[] = [];

  openSubmenu: string | null | number = null;
  subMenuHeights: { [key: string]: number } = {};
  @ViewChildren('subMenu') subMenuRefs!: QueryList<ElementRef>;

  readonly isExpanded$;
  readonly isMobileOpen$;
  readonly isHovered$;

  private subscription: Subscription = new Subscription();

  constructor(
    public sidebarService: SidebarService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
  ) {
    this.isExpanded$ = this.sidebarService.isExpanded$;
    this.isMobileOpen$ = this.sidebarService.isMobileOpen$;
    this.isHovered$ = this.sidebarService.isHovered$;
  }

  ngOnInit() {
    // Filtre les navItems selon le rôle
    const role = this.authService.getRole() ?? '';
    this.navItems = ALL_NAV_ITEMS.filter(item =>
      item.roles?.includes(role)
    );

    this.subscription.add(
      this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          this.setActiveMenuFromRoute(this.router.url);
        }
      })
    );

    this.subscription.add(
      combineLatest([this.isExpanded$, this.isMobileOpen$, this.isHovered$]).subscribe(
        ([isExpanded, isMobileOpen, isHovered]) => {
          if (!isExpanded && !isMobileOpen && !isHovered) {
            this.cdr.detectChanges();
          }
        }
      )
    );

    this.setActiveMenuFromRoute(this.router.url);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  isActive(path: string): boolean {
    if (path === '/') {
      return this.router.url === '/'; 
    }
    return this.router.url.startsWith(path);
  }

  toggleSubmenu(section: string, index: number) {
    const key = `${section}-${index}`;
    if (this.openSubmenu === key) {
      this.openSubmenu = null;
      this.subMenuHeights[key] = 0;
    } else {
      this.openSubmenu = key;
      setTimeout(() => {
        const el = document.getElementById(key);
        if (el) {
          this.subMenuHeights[key] = el.scrollHeight;
          this.cdr.detectChanges();
        }
      });
    }
  }

  onSidebarMouseEnter() {
    this.isExpanded$.subscribe(expanded => {
      if (!expanded) {
        this.sidebarService.setHovered(true);
      }
    }).unsubscribe();
  }

  private setActiveMenuFromRoute(currentUrl: string) {
    this.navItems.forEach((nav, i) => {
      if (nav.subItems) {
        nav.subItems.forEach(subItem => {
          if (currentUrl === subItem.path) {
            const key = `main-${i}`;
            this.openSubmenu = key;
            setTimeout(() => {
              const el = document.getElementById(key);
              if (el) {
                this.subMenuHeights[key] = el.scrollHeight;
                this.cdr.detectChanges();
              }
            });
          }
        });
      }
    });
  }

  onSubmenuClick() {
    this.isMobileOpen$.subscribe(isMobile => {
      if (isMobile) {
        this.sidebarService.setMobileOpen(false);
      }
    }).unsubscribe();
  }
}
