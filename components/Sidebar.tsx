'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const menus = [
  { href: '/vigenere', label: 'Vigenere Standard' },
  { href: '/autokey', label: 'Auto-Key Vigenere' },
  { href: '/extended', label: 'Extended Vigenere' },
  { href: '/playfair', label: 'Playfair Cipher' },
  { href: '/affine', label: 'Affine Cipher' },
  { href: '/hill', label: 'Hill Cipher' },
  { href: '/super', label: 'Super Encryption' },
  { href: '/enigma', label: 'Enigma Cipher' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-slate-50/50 border-r border-slate-200 min-h-screen flex-shrink-0 flex flex-col">
      <div className="p-8">
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">KriptoApp.</h1>
      </div>
      <nav className="px-4 flex-1 space-y-1">
        <Link href="/" className={`flex items-center px-4 py-2 text-sm rounded-md transition-colors ${pathname === '/' ? 'bg-slate-200/50 text-slate-900 font-medium' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
           Dashboard
        </Link>
        
        <div className="pt-8 pb-3 px-4 text-xs font-medium text-slate-400">Algorithms</div>
        
        {menus.map(menu => {
          const isActive = pathname === menu.href;
          return (
            <Link key={menu.href} href={menu.href} className={`flex items-center px-4 py-2 text-sm rounded-md transition-colors ${isActive ? 'bg-slate-200/50 text-slate-900 font-medium' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
              {menu.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
