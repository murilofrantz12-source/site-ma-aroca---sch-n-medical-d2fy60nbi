import { Link } from 'react-router-dom'
import { Reveal } from '@/components/Reveal'
import { useLanguage } from '@/lib/i18n'
import { ArrowRight, HeartPulse, Ruler, Scissors, Sparkles } from 'lucide-react'
import logoMacaroca from '@/assets/macaroca-editado-40689.png'
import macarocaImage from '@/assets/optimized/macaroca-sobre.jpg'
import schonImage from '@/assets/optimized/schon-sobre.jpg'

export default function Sobre() {
  const { t } = useLanguage()
  const pillarIcons = [Scissors, Ruler, Sparkles]
  const brandCards = [
    {
      label: t.about.manifestoLabel,
      title: t.about.macarocaTitle,
      paragraphs: [t.about.macarocaP1, t.about.macarocaP2],
      image: macarocaImage,
      imageAlt: 'Maçaroca',
      imageClass: 'object-[center_34%]',
      link: '/colecoes',
      cta: t.about.macarocaCta,
    },
    {
      label: t.about.evolutionLabel,
      title: t.about.schonTitle,
      paragraphs: [t.about.schonP1, t.about.schonP2],
      image: schonImage,
      imageAlt: 'Schön Medical',
      imageClass: 'object-[center_42%]',
      link: '/schon-medical',
      cta: t.about.schonCta,
    },
  ]

  return (
    <div className="w-full bg-background min-h-screen flex-1">
      <section className="container max-w-6xl pt-28 sm:pt-32 pb-16 sm:pb-20">
        <Reveal>
          <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
            <div>
              <span className="mb-5 block text-[10px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
                {t.about.eyebrow}
              </span>
              <h1 className="max-w-3xl text-4xl font-serif uppercase tracking-wider leading-tight sm:text-5xl md:text-6xl">
                {t.about.title}
              </h1>
            </div>
            <div className="lg:pb-2">
              <Link
                to="/"
                className="mb-8 flex h-20 w-fit items-center overflow-hidden hover:opacity-80 transition-opacity sm:h-24"
              >
                <img
                  src={logoMacaroca}
                  alt="Maçaroca"
                  loading="lazy"
                  decoding="async"
                  className="h-40 w-auto max-w-none object-contain invert mix-blend-multiply opacity-90 sm:h-48"
                />
              </Link>
              <p className="max-w-2xl text-base font-light leading-relaxed text-muted-foreground sm:text-lg">
                {t.about.intro}
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="mt-14 grid gap-4 sm:grid-cols-3">
            {t.about.pillars.map((pillar, index) => {
              const Icon = pillarIcons[index]
              return (
                <div key={pillar.title} className="border border-border/60 bg-secondary/20 p-6">
                  <Icon className="mb-6 h-5 w-5 text-foreground/70" strokeWidth={1.5} />
                  <h2 className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-foreground">
                    {pillar.title}
                  </h2>
                  <p className="text-sm font-light leading-relaxed text-muted-foreground">
                    {pillar.desc}
                  </p>
                </div>
              )
            })}
          </div>
        </Reveal>
      </section>

      <section className="border-y border-border/60 bg-secondary/20 py-14 sm:py-16">
        <div className="container max-w-6xl">
          <Reveal>
            <div className="grid gap-8 text-center md:grid-cols-3 md:text-left">
              {t.about.values.map((item) => (
                <div key={item.title}>
                  <span className="mb-4 block text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                    {item.label}
                  </span>
                  <h2 className="text-2xl font-serif leading-tight text-foreground">
                    {item.title}
                  </h2>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="container max-w-6xl py-20 sm:py-24 lg:py-32">
        <div className="space-y-20 sm:space-y-24 lg:space-y-32">
          {brandCards.map((brand, index) => (
            <Reveal
              key={brand.title}
              delay={150 + index * 100}
              className={`grid gap-10 md:grid-cols-2 lg:gap-20 items-center ${
                index === 1 ? '' : ''
              }`}
            >
              <div className={`${index === 0 ? 'md:order-2' : ''} aspect-[4/5] bg-muted relative overflow-hidden group`}>
                <img
                  src={brand.image}
                  alt={brand.imageAlt}
                  loading="lazy"
                  decoding="async"
                  className={`h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105 ${brand.imageClass}`}
                />
              </div>

              <div className={index === 0 ? 'md:order-1' : ''}>
                <span className="mb-5 block text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  {brand.label}
                </span>
                <h2 className="mb-8 text-3xl font-serif leading-tight md:text-5xl">
                  {brand.title}
                </h2>
                <div className="space-y-6 text-base font-light leading-relaxed text-muted-foreground sm:text-lg">
                  {brand.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
                <Link
                  to={brand.link}
                  className="mt-10 inline-flex items-center gap-3 border-b border-foreground pb-2 text-xs font-medium uppercase tracking-[0.18em] transition-opacity hover:opacity-60"
                >
                  {brand.cta}
                  <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-[#161616] py-20 text-white sm:py-24 lg:py-28">
        <div className="container max-w-5xl text-center">
          <Reveal delay={300}>
            <HeartPulse className="mx-auto mb-8 h-7 w-7 text-white/45" strokeWidth={1.4} />
            <span className="mb-6 block text-[10px] font-medium uppercase tracking-[0.24em] text-white/45">
              {t.about.quoteLabel}
            </span>
            <h2 className="mx-auto mb-8 max-w-3xl text-3xl font-serif leading-tight sm:text-4xl md:text-5xl">
              {t.about.quoteTitle}
            </h2>
            <p className="mx-auto max-w-3xl text-lg font-light leading-relaxed text-white/70 sm:text-xl">
              {t.about.quote}
            </p>
            <div className="mt-12 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                to="/colecoes"
                className="inline-flex h-14 items-center justify-center border border-white bg-white px-8 text-xs font-medium uppercase tracking-widest text-[#161616] transition-colors hover:bg-transparent hover:text-white"
              >
                {t.about.catalogCta}
              </Link>
              <Link
                to="/contato"
                className="inline-flex h-14 items-center justify-center border border-white/35 px-8 text-xs font-medium uppercase tracking-widest text-white transition-colors hover:border-white hover:bg-white hover:text-[#161616]"
              >
                {t.about.contactCta}
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
