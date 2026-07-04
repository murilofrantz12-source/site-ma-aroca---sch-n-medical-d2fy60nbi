import { useState } from 'react'
import { LANGUAGES, useLanguage } from '@/lib/i18n'
import { cn } from '@/lib/utils'

export function LanguageSwitcher({ dark = false }: { dark?: boolean }) {
  const { language, setLanguage, t } = useLanguage()
  const [open, setOpen] = useState(false)
  const activeLanguage = LANGUAGES.find((item) => item.code === language) ?? LANGUAGES[0]
  const options = LANGUAGES.filter((item) => item.code !== language)

  return (
    <div
      className="relative"
      aria-label={t.common.selectLanguage}
      onClick={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={cn(
          'inline-flex h-9 min-w-[4.5rem] items-center justify-center gap-2 border px-3 text-[10px] font-medium uppercase tracking-[0.16em] transition-colors',
          dark
            ? 'border-white/30 bg-black/10 text-white/90 hover:bg-white hover:text-black'
            : 'border-foreground/15 bg-background/80 text-foreground/75 hover:border-foreground/30 hover:text-foreground',
        )}
        aria-label={t.common.selectLanguage}
        aria-expanded={open}
      >
        <span className="text-base leading-none" aria-hidden="true">
          {activeLanguage.flag}
        </span>
        <span>{activeLanguage.shortLabel}</span>
      </button>

      {open && (
        <div
          className={cn(
            'absolute right-0 top-full z-[70] mt-2 w-40 overflow-hidden border shadow-xl',
            dark
              ? 'border-white/20 bg-[#11130f] text-white'
              : 'border-border bg-background text-foreground',
          )}
        >
          {options.map((item) => (
            <button
              key={item.code}
              type="button"
              onClick={() => {
                setLanguage(item.code)
                setOpen(false)
              }}
              className={cn(
                'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors',
                dark ? 'hover:bg-white/10' : 'hover:bg-secondary',
              )}
              title={item.label}
              aria-label={item.label}
            >
              <span className="text-lg leading-none" aria-hidden="true">
                {item.flag}
              </span>
              <span className="flex flex-col">
                <span className="text-[10px] font-medium uppercase tracking-[0.16em]">
                  {item.shortLabel}
                </span>
                <span className={cn('text-xs', dark ? 'text-white/60' : 'text-muted-foreground')}>
                  {item.label}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
