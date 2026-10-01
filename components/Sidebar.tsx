'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const menus = [
  { href: '/vigenere', label: '1. Vigenere Standard' },
  { href: '/autokey', label: '2. Auto-Key Vigenere' },
  { href: '/extended', label: '3. Extended Vigenere' },
  { href: '/playfair', label: '4. Playfair Cipher' },
  { href: '/affine', label: '5. Affine Cipher' },
  { href: '/hill', label: '6. Hill Cipher' },
  { href: '/super', label: '7. Super Encryption' },
  { href: '/enigma', label: '8. Enigma Cipher' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen flex-shrink-0">
      <div className="p-4 bg-gray-800">
        <h1 className="text-xl font-bold">KriptoApp</h1>
      </div>
      <nav className="p-4 space-y-2">
        <Link href="/" className={`block py-2 px-3 rounded-md ${pathname === '/' ? 'bg-blue-600' : 'hover:bg-gray-800'}`}>
           Home Dashboard
        </Link>
        <div className="pt-4 pb-2 text-xs text-gray-400 uppercase tracking-wider font-semibold">Algorithms</div>
        {menus.map(menu => (
          <Link key={menu.href} href={menu.href} className={`block py-2 px-3 rounded-md text-sm ${pathname === menu.href ? 'bg-blue-600' : 'hover:bg-gray-800'}`}>
            {menu.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
