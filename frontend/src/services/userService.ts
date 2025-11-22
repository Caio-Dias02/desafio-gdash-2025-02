import api from './api';
import { User } from '../types';

export const userService = {
  // Listar todos os usuários
  async list(): Promise<User[]> {
    const response = await api.get<User[]>('/users');
    return response.data;
  },

  // Pegar usuário por ID
  async getById(id: string): Promise<User> {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },

  // Criar novo usuário
  async create(email: string, password: string, role: 'user' | 'admin' = 'user'): Promise<User> {
    const response = await api.post<User>('/users', {
      email,
      password,
      role,
    });
    return response.data;
  },

  // Atualizar usuário
  async update(id: string, data: Partial<User>): Promise<User> {
    const response = await api.patch<User>(`/users/${id}`, data);
    return response.data;
  },

  // Deletar usuário
  async delete(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  },
};
