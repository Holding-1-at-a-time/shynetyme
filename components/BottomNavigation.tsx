import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Clipboard, BarChart2, Settings } from 'lucide-react'

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/assessments', icon: Clipboard, label: 'Assessments' },
  { href: '/analytics', icon: BarChart2, label: 'Analytics' },
  { href: '/settings', icon: Settings, label: 'Settings' },
]

export function BottomNavigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 md:hidden">
      <ul className="flex justify-around items-center">
        {navItems.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className={`flex flex-col items-center p-2 ${pathname === item.href ? 'text-blue-600' : 'text-gray-600'}`}>
              <item.icon className="w-6 h-6" />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
