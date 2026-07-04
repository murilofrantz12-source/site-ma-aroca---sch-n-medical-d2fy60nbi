import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/Reveal'
import { WhatsAppChoice } from '@/components/WhatsAppChoice'
import { useLanguage } from '@/lib/i18n'
import { MessageCircle, Ruler, Scissors, Users } from 'lucide-react'
import logoMacaroca from '@/assets/macaroca-editado-40689.png'
import heroBg from '@/assets/optimized/home-hero.jpg'
import macarocaBg from '@/assets/optimized/home-macaroca.jpg'
import schonBg from '@/assets/1ac556d2-00cd-49ab-86f8-bdd7aa54daec-fe795.jpg'

export default function Index() {
  const { t } = useLanguage()
  const trustIcons = [MessageCircle, Scissors, Ruler, Users]

  return (
    <div className="w-full flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[100svh] w-full overflow-hidden flex-shrink-0">
        <div className="absolute inset-0">
          <img
            src={heroBg}
            alt={t.home.heroAlt}
            fetchPriority="high"
            className="w-full h-full object-cover object-[center_34%]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/70 transition-colors" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center text-center px-5 pb-10 pt-28 sm:p-6 sm:pt-32">
          <Reveal className="max-w-4xl space-y-5 sm:space-y-8 flex flex-col items-center">
            <Link
              to="/"
              className="h-28 sm:h-48 md:h-64 overflow-hidden flex items-center justify-center hover:opacity-80 transition-opacity"
            >
              <img
                src={logoMacaroca}
                alt="Maçaroca - Você tem o poder"
                decoding="async"
                className="h-[210px] sm:h-[330px] md:h-[470px] w-auto object-contain mix-blend-screen drop-shadow-2xl max-w-none"
              />
            </Link>
            <h1 className="sr-only">{t.home.srTitle}</h1>
            <p className="text-base md:text-lg text-white/90 font-light max-w-2xl mx-auto drop-shadow leading-relaxed">
              {t.home.heroText}
            </p>
            <div className="flex w-full max-w-xs flex-col sm:max-w-none sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 pt-4 sm:pt-8">
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto rounded-none bg-white text-black hover:bg-white/90 text-xs tracking-widest uppercase px-6 sm:px-8 h-12"
              >
                <Link to="/colecoes">{t.home.seeCatalog}</Link>
              </Button>
              <WhatsAppChoice className="inline-flex w-full sm:w-auto items-center justify-center rounded-none border border-white text-white hover:bg-white hover:text-black text-xs tracking-widest uppercase px-6 sm:px-8 h-12 bg-transparent backdrop-blur-sm transition-colors">
                {t.home.whatsapp}
              </WhatsAppChoice>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full sm:w-auto rounded-none border-white text-white hover:bg-white hover:text-black text-xs tracking-widest uppercase px-6 sm:px-8 h-12 bg-transparent backdrop-blur-sm"
              >
                <Link to="/schon-medical">{t.home.knowSchon}</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Trust Section */}
      <section className="border-b border-border/60 bg-background py-8 sm:py-10 flex-shrink-0">
        <div className="container">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            {t.home.trust.map((item, index) => {
              const Icon = trustIcons[index]
              return (
                <Reveal
                  key={item}
                  delay={index * 80}
                  className="flex items-center gap-4 border border-border/50 bg-secondary/20 px-4 py-4 sm:px-5 sm:py-5"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-foreground/15 bg-background text-foreground">
                    <Icon className="h-5 w-5" strokeWidth={1.5} />
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.14em] sm:tracking-[0.16em] text-foreground/75 leading-relaxed">
                    {item}
                  </span>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* Brands Editorial Section */}
      <section className="py-20 sm:py-24 lg:py-32 bg-background flex-shrink-0 flex flex-col gap-20 sm:gap-24 lg:gap-32">
        {/* Maçaroca */}
        <div className="container">
          <div className="grid md:grid-cols-2 gap-8 sm:gap-10 lg:gap-16 items-center">
            <Reveal className="order-1 aspect-[4/5] lg:aspect-[3/4] overflow-hidden bg-muted">
              <img
                src={macarocaBg}
                alt="Maçaroca"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover object-[center_15%] md:object-center transition-transform duration-1000 hover:scale-105"
              />
            </Reveal>
            <Reveal delay={100} className="order-2 flex flex-col justify-center items-start">
              <h2 className="text-4xl md:text-5xl font-serif text-foreground mb-6">Maçaroca</h2>
              <p className="text-muted-foreground font-light mb-8 max-w-md leading-relaxed text-base sm:text-lg">
                {t.home.macarocaText}
              </p>
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto rounded-none uppercase tracking-widest px-8 h-14 text-xs"
              >
                <Link to="/colecoes?brand=macaroca">{t.home.consultPieces}</Link>
              </Button>
            </Reveal>
          </div>
        </div>

        {/* Schön Medical */}
        <div className="container">
          <div className="grid md:grid-cols-2 gap-8 sm:gap-10 lg:gap-16 items-center">
            <Reveal className="order-2 md:order-1 flex flex-col justify-center items-start">
              <h2 className="text-4xl md:text-5xl font-serif text-foreground mb-6">
                Schön Medical
              </h2>
              <p className="text-muted-foreground font-light mb-8 max-w-md leading-relaxed text-base sm:text-lg">
                {t.home.schonText}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Button
                  asChild
                  size="lg"
                  className="rounded-none uppercase tracking-widest px-8 h-14 text-xs bg-[#2c3e50] hover:bg-[#1a252f] text-white w-full sm:w-auto"
                >
                  <Link to="/schon-medical">{t.home.knowLine}</Link>
                </Button>
                <WhatsAppChoice className="inline-flex items-center justify-center rounded-none border border-[#2c3e50] text-[#2c3e50] hover:bg-[#2c3e50] hover:text-white uppercase tracking-widest px-8 h-14 text-xs w-full sm:w-auto transition-colors">
                  {t.home.requestBudget}
                </WhatsAppChoice>
              </div>
            </Reveal>
            <Reveal
              delay={100}
              className="order-1 md:order-2 aspect-[4/5] lg:aspect-[3/4] overflow-hidden bg-muted"
            >
              <img
                src={schonBg}
                alt="Schön Medical"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* Institutional Introduction */}
      <section className="py-32 lg:py-40 bg-secondary/30 flex-shrink-0">
        <div className="container max-w-5xl text-center">
          <Reveal>
            <span className="text-foreground/60 uppercase tracking-[0.2em] text-xs font-medium block mb-6">
              {t.home.manifestoLabel}
            </span>
            <h2 className="text-3xl md:text-5xl font-serif mb-8 text-foreground leading-tight">
              {t.home.manifestoTitle}
            </h2>
            <p className="text-base md:text-lg text-muted-foreground font-light max-w-3xl mx-auto leading-relaxed mb-20">
              {t.home.manifestoText}
            </p>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-12 md:gap-8 text-left">
            {t.home.features.map((feature, i) => (
              <Reveal
                key={i}
                delay={i * 150}
                className="bg-background p-8 lg:p-10 border border-border/50 shadow-sm hover:shadow-elevation transition-all duration-300 group"
              >
                <div className="w-12 h-12 border border-foreground/20 flex items-center justify-center mb-8 rounded-full group-hover:border-foreground transition-colors">
                  <div className="w-1.5 h-1.5 bg-foreground rounded-full" />
                </div>
                <h3 className="text-xl font-serif mb-4 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground font-light text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
