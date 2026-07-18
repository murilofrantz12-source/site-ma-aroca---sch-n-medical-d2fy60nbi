import { Outlet, Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu, Instagram, Mail } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { contactInfo, INSTAGRAM_URL } from '@/lib/contact-info'
import { WhatsAppChoice } from '@/components/WhatsAppChoice'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { useLanguage } from '@/lib/i18n'
import logoMacaroca from '@/assets/macaroca-editado-40689.png'

const LINKS = [
  { key: 'home', path: '/' },
  { key: 'collections', path: '/colecoes' },
  { key: 'schon', path: '/schon-medical' },
  { key: 'about', path: '/sobre' },
  { key: 'contact', path: '/contato' },
] as const

export default function Layout() {
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const { t } = useLanguage()

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

  return (
    <div className="flex flex-col min-h-screen">
      <header
        className={cn(
          'fixed top-0 w-full z-50 transition-all duration-300',
          scrolled ? 'bg-background/95 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6',
        )}
      >
        <div className="container grid grid-cols-3 items-center">
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
                      {t.nav[link.key]}
                    </Link>
                  ))}
                  <div className="pt-8 border-t border-border flex flex-col space-y-6">
                    <LanguageSwitcher />
                    <a
                      href={INSTAGRAM_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-foreground/80"
                    >
                      <Instagram className="w-5 h-5" />
                      <span className="text-sm uppercase tracking-widest">
                        {contactInfo.socialMedia.instagram.username}
                      </span>
                    </a>
                    <a
                      href={contactInfo.socialMedia.instagramSchon.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-foreground/80"
                    >
                      <Instagram className="w-5 h-5" />
                      <span className="text-sm uppercase tracking-widest">
                        {contactInfo.socialMedia.instagramSchon.username}
                      </span>
                    </a>
                    <WhatsAppChoice
                      className="inline-flex items-center justify-center w-full rounded-none border border-foreground bg-transparent text-foreground uppercase tracking-widest text-xs h-10 px-4 py-2 hover:bg-foreground/5 transition-colors"
                    >
                      {t.common.whatsapp}
                    </WhatsAppChoice>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>

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
                {t.nav[link.key]}
              </Link>
            ))}
          </nav>

          <div className="flex justify-center overflow-hidden h-12 md:h-16">
            <Link
              to="/"
              className="flex items-center justify-center transition-opacity hover:opacity-80"
            >
              <img
                src={logoMacaroca}
                alt="Maçaroca"
                className={cn(
                  'h-28 md:h-40 w-auto object-contain transition-all duration-300 max-w-none',
                  isTransparentAndDarkBg
                    ? 'mix-blend-screen opacity-100'
                    : 'invert mix-blend-multiply opacity-95',
                )}
              />
            </Link>
          </div>

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
                {t.nav[link.key]}
              </Link>
            ))}
            <LanguageSwitcher dark={isTransparentAndDarkBg} />
            <div
              className={cn(
                'h-4 w-px opacity-30',
                isTransparentAndDarkBg ? 'bg-white' : 'bg-foreground',
              )}
            />
            <div
              className={cn(
                'flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.16em]',
                isTransparentAndDarkBg ? 'text-white/85' : 'text-foreground/70',
              )}
            >
              <Instagram className="h-4 w-4" />
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'transition-colors',
                  isTransparentAndDarkBg ? 'hover:text-white' : 'hover:text-foreground',
                )}
              >
                Maçaroca
              </a>
              <span className="opacity-35">/</span>
              <a
                href={contactInfo.socialMedia.instagramSchon.link}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'transition-colors',
                  isTransparentAndDarkBg ? 'hover:text-white' : 'hover:text-foreground',
                )}
              >
                Schön
              </a>
            </div>
          </div>

          <div className="lg:hidden flex justify-end">
            <LanguageSwitcher dark={isTransparentAndDarkBg} />
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      <footer className="bg-foreground text-background py-14 lg:py-20">
        <div className="container">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.4fr_1fr_1.1fr] lg:gap-16">
            <div className="flex max-w-md flex-col items-start">
              <Link
                to="/"
                className="h-20 md:h-24 overflow-hidden flex items-center justify-start mb-5 -ml-4 md:-ml-6 hover:opacity-80 transition-opacity"
              >
                <img
                  src={logoMacaroca}
                  alt="Maçaroca"
                  className="h-44 md:h-52 w-auto object-contain mix-blend-screen opacity-100 max-w-none"
                />
              </Link>
              <p className="max-w-sm text-sm text-background/62 font-light leading-relaxed">
                {t.footer.description}
              </p>
            </div>

            <div>
              <h4 className="mb-6 text-[10px] font-medium uppercase tracking-[0.22em] text-background/45">
                {t.footer.navigation}
              </h4>
              <nav className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm text-background/72 font-light lg:grid-cols-1">
                {LINKS.map((l) => (
                  <Link key={l.path} to={l.path} className="hover:text-background transition-colors">
                    {t.nav[l.key]}
                  </Link>
                ))}
              </nav>
            </div>

            <div>
              <h4 className="mb-6 text-[10px] font-medium uppercase tracking-[0.22em] text-background/45">
                {t.footer.contact}
              </h4>
              <div className="space-y-5 text-sm text-background/72 font-light">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  <a
                    href={contactInfo.whatsapp.brasil.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group border border-background/12 px-4 py-3 transition-colors hover:border-background/35"
                  >
                    <span className="block text-[10px] uppercase tracking-[0.2em] text-background/40">
                      {t.common.brasil}
                    </span>
                    <span className="mt-1 block group-hover:text-background">
                      {contactInfo.whatsapp.brasil.displayNumber}
                    </span>
                  </a>
                  <a
                    href={contactInfo.whatsapp.paraguai.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group border border-background/12 px-4 py-3 transition-colors hover:border-background/35"
                  >
                    <span className="block text-[10px] uppercase tracking-[0.2em] text-background/40">
                      {t.common.paraguai}
                    </span>
                    <span className="mt-1 block group-hover:text-background">
                      {contactInfo.whatsapp.paraguai.displayNumber}
                    </span>
                  </a>
                </div>
                <a
                  href={contactInfo.email.link}
                  className="inline-flex items-center gap-2 hover:text-background transition-colors"
                >
                  <Mail className="w-4 h-4 text-background/40" strokeWidth={1.5} />
                  {contactInfo.email.display}
                </a>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <p className="text-xs text-background/45">{t.contactInfo.businessHours}</p>
                  <a
                    href={INSTAGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-9 items-center gap-2 border border-background/12 px-3 transition-colors hover:border-background/35 hover:text-background"
                  >
                    <Instagram className="w-4 h-4" />
                    <span className="text-[10px] uppercase tracking-[0.16em]">
                      Maçaroca
                    </span>
                  </a>
                  <a
                    href={contactInfo.socialMedia.instagramSchon.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-9 items-center gap-2 border border-background/12 px-3 transition-colors hover:border-background/35 hover:text-background"
                  >
                    <Instagram className="w-4 h-4" />
                    <span className="text-[10px] uppercase tracking-[0.16em]">
                      Schön
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-14 flex flex-col gap-4 border-t border-background/12 pt-6 text-xs text-background/42 font-light md:flex-row md:items-center md:justify-between">
            <p>© {new Date().getFullYear()} Maçaroca + Schön Medical.</p>
            <p>{t.footer.origin}</p>
            <p>{t.footer.rights}</p>
          </div>
        </div>
      </footer>

      <WhatsAppChoice floating />
    </div>
  )
}
