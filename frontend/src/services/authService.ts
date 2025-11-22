import api from './api';
import { LoginRequest, LoginResponse, User } from '../types';

export const authService = {
  // Login: envia email/password, recebe user + token
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  // Logout: limpar dados locais
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Pegar usuário autenticado
  async getMe(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  // Verificar se tem token salvo
  getToken(): string | null {
    return localStorage.getItem('token');
  },

  // Verificar se está autenticado
  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  // Salvar token no localStorage
  saveToken(token: string): void {
    localStorage.setItem('token', token);
  },

  // Salvar usuário no localStorage
  saveUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  },

  // Recuperar usuário do localStorage
  getUser(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};
