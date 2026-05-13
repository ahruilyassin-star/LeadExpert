'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Search,
  Users,
  MessageSquare,
  Settings,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const nav = [
  { href: '/', icon: LayoutDashboard, label: 'Overzicht' },
  { href: '/zoeken', icon: Search, label: 'Bedrijven Zoeken' },
  { href: '/leads', icon: Users, label: 'Leads' },
  { href: '/whatsapp', icon: MessageSquare, label: 'WhatsApp' },
  { href: '/instellingen', icon: Settings, label: 'Instellingen' },
]

export default function Sidebar() {
  const path = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-slate-900 text-white flex flex-col z-50">
      {/* Logo */}
      <div className="p-5 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-sm leading-tight">Lead Generator</p>
            <p className="text-xs text-slate-400">Webdesign + SEO</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {nav.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium',
              path === href
                ? 'bg-green-600 text-white'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            )}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>

      {/* Bottom info */}
      <div className="p-4 border-t border-slate-700">
        <p className="text-xs text-slate-500 text-center">
          Automatisch Lead Systeem v1.0
        </p>
      </div>
    </aside>
  )
}
