'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Ticket, Car, Users, Wallet } from 'lucide-react'

const tabs = [
  { label: 'Home', icon: Home, href: '/dashboard' },
  { label: 'Permits', icon: Ticket, href: '/dashboard/permits' },
  { label: 'Vehicles', icon: Car, href: '/dashboard/vehicles' },
  { label: 'Household', icon: Users, href: '/dashboard/household' },
  { label: 'Top up', icon: Wallet, href: '/dashboard/topup' },
]

export function BottomTabBar() {
  const pathname = usePathname()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 bg-surface-secondary border-t border-border-default sm:hidden">
      <div className="flex items-stretch h-16">
        {tabs.map(({ label, icon: Icon, href }) => {
          // Active if pathname exactly matches or starts with href (for nested routes)
          const isActive = pathname === href || 
            (href !== '/dashboard' && pathname.startsWith(href))

          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 cursor-pointer"
            >
              <Icon
                className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-content-muted'}`}
              />
              <span
                className={`text-[10px] font-medium ${isActive ? 'text-blue-600' : 'text-content-muted'}`}
              >
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}