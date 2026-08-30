'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import type { UserRole } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  LayoutDashboard,
  Newspaper,
  FolderOpen,
  Image,
  PenTool,
  MessageSquare,
  BarChart3,
  Settings,
  Menu,
  LogOut,
  User,
  Users,
  ChevronLeft,
  Megaphone,
} from 'lucide-react';

const menuItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, roles: ['super_admin', 'editor', 'author'] },
  { label: 'Berita', href: '/admin/berita', icon: Newspaper, roles: ['super_admin', 'editor', 'author'] },
  { label: 'Kategori', href: '/admin/kategori', icon: FolderOpen, roles: ['super_admin', 'editor'] },
  { label: 'Media', href: '/admin/media', icon: Image, roles: ['super_admin', 'editor', 'author'] },
  { label: 'Penulis', href: '/admin/author', icon: PenTool, roles: ['super_admin', 'editor'] },
  { label: 'Redaksi', href: '/admin/redaksi', icon: Users, roles: ['super_admin', 'editor'] },
  { label: 'Komentar', href: '/admin/komentar', icon: MessageSquare, roles: ['super_admin', 'editor'] },
  { label: 'Iklan', href: '/admin/iklan', icon: Megaphone, roles: ['super_admin', 'editor'] },
  { label: 'Analitik', href: '/admin/analytics', icon: BarChart3, roles: ['super_admin', 'editor'] },
  { label: 'Pengaturan', href: '/admin/settings', icon: Settings, roles: ['super_admin'] },
] as const;

function SidebarContent({
  role,
  pathname,
  onNavigate,
}: {
  role: UserRole;
  pathname: string;
  onNavigate?: () => void;
}) {
  const filteredItems = menuItems.filter((item) => (item.roles as readonly string[]).includes(role));

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center gap-2 px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
          MR
        </div>
        <div>
          <h2 className="text-sm font-semibold leading-none">Meranti Report</h2>
          <p className="text-xs text-muted-foreground">Admin Panel</p>
        </div>
      </div>
      <Separator />
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-1">
          {filteredItems.map((item) => {
            const isActive =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
      <Separator />
      <div className="p-4">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Kembali ke Website
        </Link>
      </div>
    </div>
  );
}

function AdminLoading() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Memuat...</p>
      </div>
    </div>
  );
}

/**
 * Authenticated admin shell: sidebar + topbar + content.
 * This layout ONLY applies to routes under (dashboard) route group.
 * Login page is in a separate (auth) route group and is NOT wrapped by this.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!loading && !user) {
      router.push('/admin/login');
    }
  }, [loading, user, router]);

  // Show loading until auth is checked
  if (loading) {
    return <AdminLoading />;
  }

  // Not authenticated - will redirect via useEffect
  if (!user) {
    return <AdminLoading />;
  }

  // Check role
  const validRoles: UserRole[] = ['super_admin', 'editor', 'author'];
  if (!user.role || !validRoles.includes(user.role)) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Akses Ditolak</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Anda tidak memiliki akses ke panel admin.
          </p>
          <Button className="mt-4" onClick={() => signOut()}>
            Keluar
          </Button>
        </div>
      </div>
    );
  }

  const initials = user.displayName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? 'U';

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-[280px] lg:flex-col lg:border-r lg:bg-background">
        <SidebarContent role={user.role} pathname={pathname} />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-[280px] p-0">
          <SheetTitle className="sr-only">Menu Navigasi</SheetTitle>
          <SidebarContent
            role={user.role}
            pathname={pathname}
            onNavigate={() => setSidebarOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:px-6">
          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>

          {/* Title */}
          <h1 className="text-sm font-semibold lg:text-base">Meranti Report Admin</h1>

          <div className="ml-auto flex items-center gap-2">
            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.photoURL} alt={user.displayName} />
                    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center gap-2 p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoURL} alt={user.displayName} />
                    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.displayName}</p>
                    <p className="text-xs text-muted-foreground leading-none">
                      {user.email}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize leading-none mt-1">
                      {user.role.replace('_', ' ')}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin/settings" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Pengaturan
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-destructive focus:text-destructive"
                  onClick={async () => {
                    await signOut();
                    router.push('/admin/login');
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
