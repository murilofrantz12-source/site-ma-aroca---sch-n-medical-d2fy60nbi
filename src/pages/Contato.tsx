import { Reveal } from '@/components/Reveal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ArrowRight,
  Clock,
  Instagram,
  MessageCircle,
  Phone,
  Ruler,
  Sparkles,
  Users,
} from 'lucide-react'
import { useState } from 'react'
import { contactInfo } from '@/lib/contact-info'
import { useLanguage } from '@/lib/i18n'

const COUNTRY_CODES = [
  { code: 'BR', dialCode: '+55', flag: '🇧🇷', name: 'Brasil' },
  { code: 'PY', dialCode: '+595', flag: '🇵🇾', name: 'Paraguai' },
  { code: 'AR', dialCode: '+54', flag: '🇦🇷', name: 'Argentina' },
  { code: 'UY', dialCode: '+598', flag: '🇺🇾', name: 'Uruguai' },
  { code: 'CL', dialCode: '+56', flag: '🇨🇱', name: 'Chile' },
  { code: 'BO', dialCode: '+591', flag: '🇧🇴', name: 'Bolívia' },
  { code: 'PE', dialCode: '+51', flag: '🇵🇪', name: 'Peru' },
  { code: 'CO', dialCode: '+57', flag: '🇨🇴', name: 'Colômbia' },
  { code: 'VE', dialCode: '+58', flag: '🇻🇪', name: 'Venezuela' },
  { code: 'MX', dialCode: '+52', flag: '🇲🇽', name: 'México' },
  { code: 'US', dialCode: '+1', flag: '🇺🇸', name: 'Estados Unidos / Canadá' },
  { code: 'PT', dialCode: '+351', flag: '🇵🇹', name: 'Portugal' },
  { code: 'ES', dialCode: '+34', flag: '🇪🇸', name: 'Espanha' },
  { code: 'IT', dialCode: '+39', flag: '🇮🇹', name: 'Itália' },
  { code: 'FR', dialCode: '+33', flag: '🇫🇷', name: 'França' },
  { code: 'DE', dialCode: '+49', flag: '🇩🇪', name: 'Alemanha' },
  { code: 'GB', dialCode: '+44', flag: '🇬🇧', name: 'Reino Unido' },
  { code: 'OTHER', dialCode: '+', flag: '🌐', name: 'Outro país' },
]

export default function Contato() {
  const { t } = useLanguage()
  const [formData, setFormData] = useState<{
    name: string
    phone: string
    phoneCountry: string
    interest: string
    message: string
    whatsappDestination: 'brasil' | 'paraguai'
  }>({
    name: '',
    phone: '',
    phoneCountry: 'BR',
    interest: '',
    message: '',
    whatsappDestination: 'brasil',
  })

  const selectedPhoneCountry =
    COUNTRY_CODES.find((country) => country.code === formData.phoneCountry) ?? COUNTRY_CODES[0]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const labels = t.contact.formMessageLabels
    const phoneWithCountry =
      formData.phone.trim().startsWith('+') || selectedPhoneCountry.code === 'OTHER'
        ? formData.phone
        : `${selectedPhoneCountry.dialCode} ${formData.phone}`
    const text = `${labels.greeting} ${formData.name}.\n${labels.country}: ${selectedPhoneCountry.name} ${selectedPhoneCountry.dialCode}\n${labels.phone}: ${phoneWithCountry}\n${labels.interest}: ${formData.interest}\n\n${labels.message}:\n${formData.message}`
    const destination = contactInfo.whatsapp[formData.whatsappDestination]
    const waUrl = `https://wa.me/${destination.rawNumber}?text=${encodeURIComponent(text)}`
    window.location.href = waUrl
  }

  const serviceItems = [
    { icon: Sparkles, title: t.contact.serviceItems[0].title, desc: t.contact.serviceItems[0].desc },
    { icon: Ruler, title: t.contact.serviceItems[1].title, desc: t.contact.serviceItems[1].desc },
    { icon: Users, title: t.contact.serviceItems[2].title, desc: t.contact.serviceItems[2].desc },
  ]

  const directWhatsAppLinks = {
    brasil: `https://wa.me/${contactInfo.whatsapp.brasil.rawNumber}?text=${encodeURIComponent(t.whatsapp.defaultMessage)}`,
    paraguai: `https://wa.me/${contactInfo.whatsapp.paraguai.rawNumber}?text=${encodeURIComponent(t.whatsapp.defaultMessage)}`,
  }

  const selectedDestinationLabel =
    formData.whatsappDestination === 'brasil' ? t.common.brasil : t.common.paraguai

  return (
    <div className="w-full pt-28 sm:pt-32 bg-background min-h-screen flex-1">
      <section className="container max-w-6xl pb-16 sm:pb-20">
        <Reveal>
          <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <div>
              <span className="mb-5 block text-[10px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
                {t.contact.eyebrow}
              </span>
              <h1 className="max-w-3xl text-4xl font-serif uppercase tracking-wider leading-tight sm:text-5xl md:text-6xl">
                {t.contact.title}
              </h1>
              <p className="mt-6 max-w-2xl text-base font-light leading-relaxed text-muted-foreground sm:text-lg">
                {t.contact.intro}
              </p>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {serviceItems.map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="border border-border/60 bg-secondary/20 p-5">
                    <Icon className="mb-5 h-5 w-5 text-foreground/70" strokeWidth={1.5} />
                    <h3 className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-foreground">
                      {title}
                    </h3>
                    <p className="text-sm font-light leading-relaxed text-muted-foreground">{desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#161616] p-6 text-white sm:p-8 lg:p-10">
              <span className="mb-4 block text-[10px] font-medium uppercase tracking-[0.24em] text-white/45">
                {t.contact.chooseLabel}
              </span>
              <h2 className="mb-4 text-3xl font-serif leading-tight">{t.contact.chooseTitle}</h2>
              <p className="mb-8 text-sm font-light leading-relaxed text-white/65">
                {t.contact.chooseText}
              </p>

              <div className="space-y-3">
                <a
                  href={directWhatsAppLinks.brasil}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between border border-white/15 bg-white/[0.04] p-4 transition-colors hover:bg-white hover:text-[#161616]"
                >
                  <span>
                    <span className="block text-sm font-medium uppercase tracking-[0.16em]">
                      🇧🇷 {t.common.brasil}
                    </span>
                    <span className="mt-1 block text-sm font-light text-white/55 transition-colors group-hover:text-[#161616]/60">
                      {contactInfo.whatsapp.brasil.displayNumber}
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                </a>

                <a
                  href={directWhatsAppLinks.paraguai}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between border border-white/15 bg-white/[0.04] p-4 transition-colors hover:bg-white hover:text-[#161616]"
                >
                  <span>
                    <span className="block text-sm font-medium uppercase tracking-[0.16em]">
                      🇵🇾 {t.common.paraguai}
                    </span>
                    <span className="mt-1 block text-sm font-light text-white/55 transition-colors group-hover:text-[#161616]/60">
                      {contactInfo.whatsapp.paraguai.displayNumber}
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="border-y border-border/60 bg-secondary/20 py-12 sm:py-14">
        <div className="container max-w-6xl">
          <Reveal>
            <div className="grid gap-8 md:grid-cols-3">
              <div>
                <h3 className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-foreground">
                  {t.contact.whatsapp}
                </h3>
                <div className="space-y-1 text-sm font-light text-muted-foreground">
                  <a
                    href={directWhatsAppLinks.brasil}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block hover:text-foreground"
                  >
                    {t.common.brasil}: {contactInfo.whatsapp.brasil.displayNumber}
                  </a>
                  <a
                    href={directWhatsAppLinks.paraguai}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block hover:text-foreground"
                  >
                    {t.common.paraguai}: {contactInfo.whatsapp.paraguai.displayNumber}
                  </a>
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-foreground">
                  {t.contact.email}
                </h3>
                <a
                  href={contactInfo.email.link}
                  className="text-sm font-light text-muted-foreground transition-colors hover:text-foreground"
                >
                  {contactInfo.email.display}
                </a>
              </div>

              <div>
                <h3 className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-foreground">
                  {t.contact.hours}
                </h3>
                <p className="text-sm font-light text-muted-foreground">
                  {t.contactInfo.businessHours}
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="container max-w-6xl py-16 sm:py-20 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[0.72fr_1fr] lg:gap-16">
          <Reveal delay={100}>
            <div className="lg:sticky lg:top-28">
              <span className="mb-5 block text-[10px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
                {t.contact.formLabel}
              </span>
              <h2 className="mb-5 text-3xl font-serif leading-tight sm:text-4xl">
                {t.contact.formTitle}
              </h2>
              <p className="mb-8 text-base font-light leading-relaxed text-muted-foreground">
                {t.contact.formIntro}
              </p>

              <div className="space-y-5 border-l border-border pl-6">
                <div className="flex gap-4">
                  <MessageCircle className="mt-1 h-5 w-5 text-foreground/55" strokeWidth={1.5} />
                  <div>
                    <h3 className="mb-1 text-xs font-medium uppercase tracking-[0.18em]">
                      {t.contact.responseTitle}
                    </h3>
                    <p className="text-sm font-light leading-relaxed text-muted-foreground">
                      {t.contact.responseText}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Phone className="mt-1 h-5 w-5 text-foreground/55" strokeWidth={1.5} />
                  <div>
                    <h3 className="mb-1 text-xs font-medium uppercase tracking-[0.18em]">
                      {t.contact.sendTo}
                    </h3>
                    <p className="text-sm font-light leading-relaxed text-muted-foreground">
                      {t.contact.destinationText}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Clock className="mt-1 h-5 w-5 text-foreground/55" strokeWidth={1.5} />
                  <div>
                    <h3 className="mb-1 text-xs font-medium uppercase tracking-[0.18em]">
                      {t.contact.hours}
                    </h3>
                    <p className="text-sm font-light leading-relaxed text-muted-foreground">
                      {t.contactInfo.businessHours}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-10 border-t border-border pt-8">
                <h3 className="mb-5 text-xs font-medium uppercase tracking-[0.18em]">
                  {t.contact.social}
                </h3>
                <div className="flex items-center gap-4">
                  <a
                    href={contactInfo.socialMedia.instagram.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-border transition-colors hover:bg-foreground hover:text-background"
                    aria-label="Instagram"
                  >
                    <Instagram className="h-5 w-5" strokeWidth={1.5} />
                  </a>
                  <a
                    href={contactInfo.socialMedia.instagram.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-light text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Instagram: {contactInfo.socialMedia.instagram.username}
                  </a>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={200}>
            <form
              onSubmit={handleSubmit}
              className="border border-border/70 bg-background p-6 sm:p-8 lg:p-10"
            >
              <div className="grid sm:grid-cols-2 gap-7 sm:gap-8">
                <div className="space-y-3">
                  <label className="text-xs font-medium uppercase tracking-widest text-foreground/80">
                    {t.contact.name}
                  </label>
                  <Input
                    required
                    placeholder={t.contact.namePlaceholder}
                    className="rounded-none bg-transparent border-b border-t-0 border-x-0 border-border focus-visible:ring-0 focus-visible:border-foreground px-0 h-12 text-base font-light shadow-none"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-medium uppercase tracking-widest text-foreground/80">
                    {t.contact.country}
                  </label>
                  <Select
                    value={formData.phoneCountry}
                    onValueChange={(value) =>
                      setFormData({ ...formData, phoneCountry: value })
                    }
                  >
                    <SelectTrigger className="rounded-none bg-transparent border-b border-t-0 border-x-0 border-border focus:ring-0 px-0 h-12 text-base font-light shadow-none">
                      <SelectValue placeholder={t.contact.countryPlaceholder} />
                    </SelectTrigger>
                    <SelectContent className="max-h-72 rounded-none font-light">
                      {COUNTRY_CODES.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.flag} {country.name} ({country.dialCode})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-7 pt-8 sm:grid-cols-[0.3fr_1fr] sm:gap-8">
                <div className="space-y-3">
                  <label className="text-xs font-medium uppercase tracking-widest text-foreground/80">
                    DDI
                  </label>
                  <div className="flex h-12 items-center border-b border-border text-base font-light text-foreground/75">
                    {selectedPhoneCountry.flag} {selectedPhoneCountry.dialCode}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-medium uppercase tracking-widest text-foreground/80">
                    {t.contact.phone}
                  </label>
                  <Input
                    required
                    type="tel"
                    placeholder={
                      selectedPhoneCountry.code === 'OTHER'
                        ? t.contact.phonePlaceholderOther
                        : t.contact.phonePlaceholder.replace('{{ddi}}', selectedPhoneCountry.dialCode)
                    }
                    className="rounded-none bg-transparent border-b border-t-0 border-x-0 border-border focus-visible:ring-0 focus-visible:border-foreground px-0 h-12 text-base font-light shadow-none"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-medium uppercase tracking-widest text-foreground/80">
                  {t.contact.interest}
                </label>
                <Select
                  required
                  value={formData.interest}
                  onValueChange={(v) => setFormData({ ...formData, interest: v })}
                >
                  <SelectTrigger className="rounded-none bg-transparent border-b border-t-0 border-x-0 border-border focus:ring-0 px-0 h-12 text-base font-light shadow-none">
                    <SelectValue placeholder={t.contact.interestPlaceholder} />
                  </SelectTrigger>
                  <SelectContent className="rounded-none font-light">
                    {t.contact.options.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3 pt-8">
                <label className="text-xs font-medium uppercase tracking-widest text-foreground/80">
                  {t.contact.message}
                </label>
                <Textarea
                  required
                  placeholder={t.contact.messagePlaceholder}
                  className="rounded-none bg-transparent border border-border focus-visible:ring-0 focus-visible:border-foreground min-h-[160px] resize-none p-4 text-base font-light shadow-none"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              <div className="space-y-4 pt-8">
                <label className="text-xs font-medium uppercase tracking-widest text-foreground/80">
                  {t.contact.sendTo}
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  {(['brasil', 'paraguai'] as const).map((destination) => {
                    const isSelected = formData.whatsappDestination === destination
                    const info = contactInfo.whatsapp[destination]
                    return (
                      <button
                        key={destination}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, whatsappDestination: destination })
                        }
                        className={`border p-4 text-left transition-colors ${
                          isSelected
                            ? 'border-foreground bg-foreground text-background'
                            : 'border-border bg-transparent hover:border-foreground/60'
                        }`}
                      >
                        <span className="block text-xs font-medium uppercase tracking-[0.16em]">
                          {destination === 'brasil' ? '🇧🇷' : '🇵🇾'}{' '}
                          {destination === 'brasil' ? t.common.brasil : t.common.paraguai}
                        </span>
                        <span
                          className={`mt-2 block text-sm font-light ${
                            isSelected ? 'text-background/70' : 'text-muted-foreground'
                          }`}
                        >
                          {info.displayNumber}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="mt-8 h-14 w-full rounded-none px-12 text-xs font-medium uppercase tracking-widest sm:w-auto"
              >
                {t.contact.submit} {selectedDestinationLabel}
              </Button>
            </form>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
