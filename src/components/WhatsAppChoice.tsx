import { useState } from 'react'
import { ArrowUpRight, MessageCircle } from 'lucide-react'
import { contactInfo } from '@/lib/contact-info'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/lib/i18n'

type WhatsAppChoiceProps = {
  children?: React.ReactNode
  className?: string
  message?: string
  floating?: boolean
  menuPlacement?: 'top' | 'bottom'
}

function buildWhatsAppLink(rawNumber: string, fallbackLink: string, message?: string) {
  if (!message) return fallbackLink
  return `https://wa.me/${rawNumber}?text=${encodeURIComponent(message)}`
}

export function WhatsAppChoice({
  children = 'WhatsApp',
  className,
  message,
  floating = false,
  menuPlacement = 'bottom',
}: WhatsAppChoiceProps) {
  const [open, setOpen] = useState(false)
  const { t } = useLanguage()
  const activeMessage = message ?? t.whatsapp.defaultMessage

  const choices = [
    {
      flag: '🇧🇷',
      label: t.common.brasil,
      number: contactInfo.whatsapp.brasil.displayNumber,
      note: 'WhatsApp Brasil',
      href: buildWhatsAppLink(
        contactInfo.whatsapp.brasil.rawNumber,
        contactInfo.whatsapp.brasil.link,
        activeMessage,
      ),
    },
    {
      flag: '🇵🇾',
      label: t.common.paraguai,
      number: contactInfo.whatsapp.paraguai.displayNumber,
      note: 'WhatsApp Paraguai',
      href: buildWhatsAppLink(
        contactInfo.whatsapp.paraguai.rawNumber,
        contactInfo.whatsapp.paraguai.link,
        activeMessage,
      ),
    },
  ]

  return (
    <div
      className={cn(floating ? 'fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50' : 'relative')}
      onClick={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={cn(
          floating &&
            'w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-elevation hover:scale-110 transition-transform duration-300 animate-fade-in-up',
          className,
        )}
        aria-label={t.common.chooseService}
        aria-expanded={open}
      >
        {floating ? <MessageCircle className="w-6 h-6" /> : children}
      </button>

      {open && (
        <div
          className={cn(
            'absolute right-0 z-[60] w-[min(19rem,calc(100vw-2rem))] overflow-hidden border border-border/70 bg-background text-foreground shadow-2xl',
            floating || menuPlacement === 'top' ? 'bottom-16' : 'top-full mt-3',
          )}
        >
          <div className="bg-[#11130f] px-5 py-5 text-white">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg">
              <MessageCircle className="h-5 w-5" />
            </div>
            <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-white/50">
              WhatsApp
            </p>
            <h3 className="mt-1 font-serif text-2xl leading-tight">{t.common.chooseService}</h3>
            <p className="mt-2 text-sm font-light leading-relaxed text-white/65">
              {t.common.chooseServiceText}
            </p>
          </div>
          <div className="space-y-2 p-3">
            {choices.map((choice) => (
              <a
                key={choice.label}
                href={choice.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 border border-border/70 bg-background px-4 py-4 text-left transition-all hover:border-foreground/30 hover:bg-secondary"
                onClick={() => setOpen(false)}
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary text-xl leading-none">
                  {choice.flag}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-semibold uppercase tracking-[0.18em]">
                    {choice.label}
                  </span>
                  <span className="mt-1 block text-sm text-muted-foreground">{choice.number}</span>
                  <span className="mt-1 block text-[10px] uppercase tracking-[0.16em] text-muted-foreground/70">
                    {choice.note}
                  </span>
                </span>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
