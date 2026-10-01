import Link from "next/link";

const menus = [
  { href: '/vigenere', label: 'Vigenere Standard', desc: 'Klasik abjad 26 karakter' },
  { href: '/autokey', label: 'Auto-Key Vigenere', desc: 'Vigenere dengan kunci dinamis' },
  { href: '/extended', label: 'Extended Vigenere', desc: 'Enkripsi byte/ASCII 256' },
  { href: '/playfair', label: 'Playfair Cipher', desc: 'Enkripsi matriks 5x5' },
  { href: '/affine', label: 'Affine Cipher', desc: 'Fungsi linear matematika' },
  { href: '/hill', label: 'Hill Cipher', desc: 'Perkalian matriks aljabar' },
  { href: '/super', label: 'Super Encryption', desc: 'Vigenere + Transposisi' },
  { href: '/enigma', label: 'Enigma Cipher', desc: 'Simulasi mesin rotor' },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen px-8 py-20 md:px-20 max-w-5xl mx-auto">
      <div className="space-y-6 max-w-2xl mb-16">
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-slate-900">
          Cryptography Toolkit
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          Koleksi algoritma kriptografi klasik dan modern untuk keperluan pembelajaran. 
          Semua proses berjalan 100% secara lokal di browser Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {menus.map((menu) => (
          <Link key={menu.href} href={menu.href} className="group p-5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm transition-all">
            <h3 className="font-medium text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">{menu.label}</h3>
            <p className="text-sm text-slate-500">{menu.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
