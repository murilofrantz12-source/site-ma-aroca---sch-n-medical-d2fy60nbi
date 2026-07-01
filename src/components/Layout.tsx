import { Outlet, Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu, MessageCircle, Instagram } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import logoMacaroca from '@/assets/macaroca-4aef6.png'

const LINKS = [
  { name: 'Início', path: '/' },
  { name: 'Coleções', path: '/colecoes' },
  { name: 'Schön Medical', path: '/schon-medical' },
  { name: 'Sobre', path: '/sobre' },
  { name: 'Contato', path: '/contato' },
]

export default function Layout() {
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  const isHome = location.pathname === '/'
  const isTransparentAndDarkBg = isHome && !scrolled

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  const handleWhatsApp = () => {
    const msg = encodeURIComponent('Olá, vim pelo site da Maçaroca e gostaria de mais informações.')
    window.open(`https://wa.me/5511999999999?text=${msg}`, '_blank')
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header
        className={cn(
          'fixed top-0 w-full z-50 transition-all duration-300',
          scrolled ? 'bg-background/95 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6',
        )}
      >
        <div className="container grid grid-cols-3 items-center">
          {/* Mobile Menu Trigger */}
          <div className="lg:hidden flex justify-start">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    '-ml-3',
                    isTransparentAndDarkBg
                      ? 'text-white hover:bg-white/20'
                      : 'text-foreground hover:bg-foreground/10',
                  )}
                >
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="flex flex-col pt-20 border-l border-border bg-background"
              >
                <nav className="flex flex-col space-y-8">
                  {LINKS.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className="text-xl font-serif uppercase tracking-wider text-foreground"
                    >
                      {link.name}
                    </Link>
                  ))}
                  <div className="pt-8 border-t border-border flex flex-col space-y-6">
                    <a
                      href="https://instagram.com"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center space-x-2 text-foreground/80"
                    >
                      <Instagram className="w-5 h-5" />
                      <span className="text-sm uppercase tracking-widest">Instagram</span>
                    </a>
                    <Button
                      variant="outline"
                      className="w-full rounded-none border-foreground text-foreground uppercase tracking-widest text-xs"
                      onClick={handleWhatsApp}
                    >
                      Falar no WhatsApp
                    </Button>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop Left Nav */}
          <nav className="hidden lg:flex items-center space-x-8 justify-start">
            {LINKS.slice(0, 3).map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  'text-xs font-medium uppercase tracking-[0.15em] transition-colors',
                  isTransparentAndDarkBg
                    ? 'text-white/90 hover:text-white'
                    : 'text-foreground/80 hover:text-foreground',
                )}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Centered Logo */}
          <div className="flex justify-center">
            <Link to="/" className="flex flex-col items-center transition-opacity hover:opacity-80">
              <img
                src={logoMacaroca}
                alt="Maçaroca"
                className={cn(
                  'h-8 md:h-10 w-auto object-contain transition-all duration-300',
                  isTransparentAndDarkBg
                    ? 'invert mix-blend-screen opacity-100'
                    : 'mix-blend-multiply opacity-95',
                )}
              />
            </Link>
          </div>

          {/* Desktop Right Nav & Actions */}
          <div className="hidden lg:flex items-center justify-end space-x-6">
            {LINKS.slice(3).map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  'text-xs font-medium uppercase tracking-[0.15em] transition-colors',
                  isTransparentAndDarkBg
                    ? 'text-white/90 hover:text-white'
                    : 'text-foreground/80 hover:text-foreground',
                )}
              >
                {link.name}
              </Link>
            ))}
            <div
              className={cn(
                'h-4 w-px opacity-30',
                isTransparentAndDarkBg ? 'bg-white' : 'bg-foreground',
              )}
            />
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className={cn(
                'transition-colors',
                isTransparentAndDarkBg
                  ? 'text-white/90 hover:text-white'
                  : 'text-foreground/80 hover:text-foreground',
              )}
            >
              <Instagram className="w-4 h-4" />
            </a>
          </div>

          {/* Mobile Right Action */}
          <div className="lg:hidden flex justify-end">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className={cn(
                '-mr-2 p-2 transition-colors',
                isTransparentAndDarkBg
                  ? 'text-white hover:text-white/80'
                  : 'text-foreground hover:text-foreground/80',
              )}
            >
              <Instagram className="w-5 h-5" />
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      <footer className="bg-foreground text-background py-16 lg:py-24">
        <div className="container grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-16">
          <div className="md:col-span-1 flex flex-col items-start">
            <img
              src={logoMacaroca}
              alt="Maçaroca"
              className="h-14 md:h-16 w-auto object-contain invert mix-blend-screen mb-8 opacity-100"
            />
            <p className="text-sm text-background/70 font-light leading-relaxed">
              Criações femininas com alma, movimento e estilo. Peças autorais para mulheres que
              desejam se sentir elegantes, livres e únicas.
            </p>
          </div>
          <div>
            <h4 className="font-serif text-lg mb-6 text-background/90">Navegação</h4>
            <ul className="space-y-3 text-sm text-background/70 font-light">
              {LINKS.map((l) => (
                <li key={l.path}>
                  <Link to={l.path} className="hover:text-background transition-colors">
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-serif text-lg mb-6 text-background/90">Suporte</h4>
            <ul className="space-y-3 text-sm text-background/70 font-light">
              <li>
                <Link to="/contato" className="hover:text-background transition-colors">
                  Trocas e Entregas
                </Link>
              </li>
              <li>
                <Link to="/contato" className="hover:text-background transition-colors">
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link to="/contato" className="hover:text-background transition-colors">
                  Fale Conosco
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-serif text-lg mb-6 text-background/90">Contato</h4>
            <ul className="space-y-3 text-sm text-background/70 font-light">
              <li>contato@macaroca.com.br</li>
              <li>(11) 99999-9999</li>
              <li className="pt-4">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block hover:text-background transition-colors p-2 -ml-2"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="container mt-16 pt-8 border-t border-background/20 text-xs text-background/50 font-light flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p>
            © {new Date().getFullYear()} Maçaroca + Schön Medical. Todos os direitos reservados.
          </p>
          <p>CNPJ: 00.000.000/0001-00</p>
        </div>
      </footer>

      <button
        onClick={handleWhatsApp}
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-elevation hover:scale-110 transition-transform duration-300 z-50 animate-fade-in-up"
        aria-label="Falar no WhatsApp"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    </div>
  )
}
