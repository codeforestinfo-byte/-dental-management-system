'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  Activity, Bell, CircleHelp, CreditCard, FileBarChart, HeartPulse, LayoutDashboard,
  Menu, PanelLeftClose, PanelLeftOpen, Search, Stethoscope,
  Users, X, LogOut, CalendarDays, Loader2, UserCog,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'

const navItems = [
  ['Dashboard', LayoutDashboard, '/'],
  ['Appointments', CalendarDays, '/appointments'],
]

const dentistNavItems = [
  ['Patients', Users, '/patients'],
  ['Dentists', Stethoscope, '/dentists'],
  ['Treatments', Activity, '/treatments'],
  ['Billing', CreditCard, '/billing'],
]

const bottomNavItems = [
  ['Help', CircleHelp, '/help'],
]

export default function DashboardLayout({ children, title }: { children: React.ReactNode; title?: string }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [query, setQuery] = useState('')
  const pathname = usePathname()
  const { user, logout, loading, hasRole } = useAuth()

  const adminNavItems = [
    ['Users', UserCog, '/users'],
  ]

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="flex justify-center items-center px-4 pt-[18px] pb-5">
          <Image src="/sunrice-logo-2.png" alt="Sunrise Dental Logo" width={0} height={34} className="w-auto object-contain" priority />
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3 py-5">
          {navItems.map(([label, Icon, href]) => (
            <Link key={label as string} href={href as string} className={`nav-item ${pathname === href ? 'active' : ''}`} title={collapsed ? label as string : undefined}>
              <Icon className="size-[18px]" /><span>{!collapsed && label as string}</span>
            </Link>
          ))}
          {!hasRole('DENTIST') && dentistNavItems.map(([label, Icon, href]) => (
            <Link key={label as string} href={href as string} className={`nav-item ${pathname === href ? 'active' : ''}`} title={collapsed ? label as string : undefined}>
              <Icon className="size-[18px]" /><span>{!collapsed && label as string}</span>
            </Link>
          ))}
          {!hasRole('RECEPTIONIST') && !hasRole('DENTIST') && (
            <Link href="/reports" className={`nav-item ${pathname === '/reports' ? 'active' : ''}`} title={collapsed ? 'Reports' : undefined}>
              <FileBarChart className="size-[18px]" /><span>{!collapsed && 'Reports'}</span>
            </Link>
          )}
          {hasRole('ADMIN') && (
            <>
              <div className="my-4 border-t border-border" />
              {adminNavItems.map(([label, Icon, href]) => (
                <Link key={label as string} href={href as string} className={`nav-item ${pathname === href ? 'active' : ''}`} title={collapsed ? label as string : undefined}>
                  <Icon className="size-[18px]" /><span>{!collapsed && label as string}</span>
                </Link>
              ))}
            </>
          )}
          <div className="my-4 border-t border-border" />
          {bottomNavItems.map(([label, Icon, href]) => (
            <Link key={label as string} href={href as string} className="nav-item" title={collapsed ? label as string : undefined}>
              <Icon className="size-[18px]" /><span>{!collapsed && label as string}</span>
            </Link>
          ))}
        </nav>
        <div className="border-t border-border p-3">
          <div className="flex items-center gap-3">
            <div className="avatar">{user?.username?.slice(0, 2).toUpperCase() || 'U'}</div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold">{user?.username || 'User'}</p>
                <p className="text-[11px] text-muted-foreground">{user?.roles?.[0] || 'Staff'}</p>
              </div>
            )}
            <button onClick={logout} className="rounded-md p-1.5 text-muted-foreground hover:bg-accent" title="Logout">
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>

      <div className={`main-shell ${collapsed ? 'sidebar-collapsed' : ''}`}>
        <header className="topbar">
          <button className="rounded-md p-2 text-muted-foreground hover:bg-accent md:hidden" onClick={() => setMobileOpen(true)}><Menu className="size-5" /></button>
          <button className="hidden rounded-md p-2 text-muted-foreground hover:bg-accent md:block" onClick={() => setCollapsed(!collapsed)}>{collapsed ? <PanelLeftOpen className="size-5" /> : <PanelLeftClose className="size-5" />}</button>
          <div className="hidden items-center gap-5 ml-auto sm:flex">
            <div className="text-right"><p className="text-xs font-medium">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p><p className="text-[11px] text-muted-foreground">Colombo, Sri Lanka</p></div>
            <button className="relative rounded-md p-2 text-muted-foreground hover:bg-accent"><Bell className="size-[18px]" /><span className="notification-dot" /></button>
            <div className="avatar small">{user?.username?.slice(0, 2).toUpperCase() || 'U'}</div>
          </div>
        </header>
        <main className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8">
          {title && <h1 className="mb-6 text-2xl font-bold tracking-tight">{title}</h1>}
          {children}
        </main>
      </div>
    </div>
  )
}
