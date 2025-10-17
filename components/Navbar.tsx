'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from './ui/button';
import { ShoppingBag, LayoutDashboard, TestTube, User, LogOut } from 'lucide-react';

interface UserData {
  id: string;
  email: string;
  name?: string;
}

export function Navbar() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      setUser(data.user);
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      window.location.href = '/';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <nav className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-primary">
            🛍️ EcomRec
          </Link>
          
          <div className="flex items-center gap-6">
            <Link href="/products" className="flex items-center gap-2 hover:text-primary transition">
              <ShoppingBag className="h-4 w-4" />
              Products
            </Link>
            <Link href="/dashboard" className="flex items-center gap-2 hover:text-primary transition">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
            <Link href="/admin/test" className="flex items-center gap-2 hover:text-primary transition">
              <TestTube className="h-4 w-4" />
              Admin
            </Link>

            <div className="border-l pl-6">
              {loading ? (
                <span className="text-sm text-gray-500">Loading...</span>
              ) : user ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="text-sm">{user.name || user.email}</span>
                  </div>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/auth/login">
                    <Button variant="outline" size="sm">
                      Login
                    </Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button size="sm">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
