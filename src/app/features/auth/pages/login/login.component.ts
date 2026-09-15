import { Component, signal } from '@angular/core';
import { Router,RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule,RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {

  protected readonly isPasswordVisible = signal<boolean>(false);

  protected readonly isLoading = signal<boolean>(false);

  protected readonly loginForm = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email]
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)]
    })
  });

  constructor(private readonly router: Router) {}

  protected togglePasswordVisibility(): void {
    this.isPasswordVisible.update(visible => !visible);
  }


  private readonly USUARIOS_MOCK = [
    { email: 'director@fatima.edu.pe', password: '123456', role: 'Director' },
    { email: 'profesor@fatima.edu.pe', password: '123456', role: 'Docente' },
    { email: 'padre@fatima.edu.pe', password: '123456', role: 'Padre de Familia' }
  ];

  protected onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    const { email, password } = this.loginForm.getRawValue();

    setTimeout(() => {
      
      const usuarioEncontrado = this.USUARIOS_MOCK.find(
        u => u.email === email && u.password === password
      );

      if (usuarioEncontrado) {
        localStorage.setItem('user_role', usuarioEncontrado.role);
        
        this.router.navigate(['/dashboard']);
      } else {
        this.isLoading.set(false);
        alert('Credenciales incorrectas.\n\nPruebe con los usuarios institucionales:\n- director@fatima.edu.pe / 123456\n- profesor@fatima.edu.pe / 123456\n- padre@fatima.edu.pe / 123456');
      }

    }, 1500);
  }

}
