import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Modal } from '../../shared/modal';
@Component({
  selector: 'app-sign-in',
  imports: [RouterLink, Modal],
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.css',
})
export class SignIn {}
