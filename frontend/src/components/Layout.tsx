import React, { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from './ui/button';

export function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow">
        <div className="p-6">
          <h1 className="text-xl font-bold text-gray-800">GDASH</h1>
          <p className="text-sm text-gray-600">Monitoramento Climático</p>
        </div>

        <nav className="mt-8 px-4 flex-1 space-y-2">
          <Button
            variant={isActive('/dashboard') ? 'default' : 'ghost'}
            onClick={() => navigate('/dashboard')}
            className="w-full justify-start"
          >
            Dashboard
          </Button>
          <Button
            variant={isActive('/users') ? 'default' : 'ghost'}
            onClick={() => navigate('/users')}
            className="w-full justify-start"
          >
            Usuários
          </Button>
        </nav>

        {/* Logout */}
        <div className="px-4 py-4 border-t">
          <Button
            variant="destructive"
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-full"
          >
            Sair
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
