import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { StorageService } from '@services/storage.service';

@Component({
  selector: 'app-logout',
  standalone: true,
  template: ''
})
export class LogoutComponent implements OnInit {
  constructor(
    private storageService: StorageService,
    private router: Router
  ) {}

  ngOnInit() {
    this.storageService.clear();
    this.router.navigate(['/auth/login']);
  }
}
