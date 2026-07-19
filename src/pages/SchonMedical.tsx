import { Link } from 'react-router-dom'
import { Reveal } from '@/components/Reveal'
import { HeartPulse, Shirt, Users, Highlighter, MessageCircle, Ruler, Scissors } from 'lucide-react'
import { WhatsAppChoice } from '@/components/WhatsAppChoice'
import { ScrubConfigurator } from '@/components/ScrubConfigurator'
import { useLanguage } from '@/lib/i18n'
import schonIcon from '@/assets/s-correto-4afa7.png'
import schonWordmark from '@/assets/so-by-macaroca-logo-peq-editado-4f9ae.png'
import schonImage from '@/assets/optimized/schon-hero.jpg'
import schonCatalog1 from '@/assets/optimized/schon-catalog-1.jpg'
import schonCatalog2 from '@/assets/optimized/schon-catalog-2.jpg'
import schonCatalog3 from '@/assets/optimized/schon-catalog-3.jpg'
import schonCatalog4 from '@/assets/optimized/schon-catalog-4.jpg'
import schonCatalog6 from '@/assets/optimized/schon-catalog-6.jpg'
import schonCatalog7 from '@/assets/optimized/schon-catalog-7.jpg'
import schonCatalog8 from '@/assets/optimized/schon-catalog-8.jpg'

export default function SchonMedical() {
  const { t } = useLanguage()
  const valueIcons = [HeartPulse, Shirt, Users, Highlighter]
  const stepIcons = [MessageCircle, Ruler, Scissors]
  const showcaseImages = [
    schonCatalog8,
    schonCatalog7,
    schonCatalog6,
    schonCatalog4,
    schonCatalog3,
    schonCatalog2,
    schonCatalog1,
  ]

  return (
    <div className="w-full flex-1">
      {/* Full-width Hero */}
      <section className="relative w-full min-h-[100svh] lg:min-h-[88vh] bg-[#fbfcf7] flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0">
          <div className="absolute inset-x-0 top-0 h-[3px] bg-[#b8f24a]" />
          <img
            src={schonImage}
            alt=""
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover object-[center_30%] opacity-48 mix-blend-multiply"
          />
          <div className="absolute inset-0 bg-white/58" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.42)_0%,rgba(251,252,247,0.76)_62%,rgba(251,252,247,0.9)_100%)]" />
          <div className="absolute bottom-0 left-0 right-0 h-[24%] bg-[linear-gradient(to_top,#fbfcf7_0%,rgba(251,252,247,0.7)_50%,transparent_100%)]" />
        </div>
        <Link
          to="/"
          className="absolute left-5 top-24 z-20 inline-flex items-center gap-3 hover:opacity-80 transition-opacity md:left-10 md:top-28"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#11130f]/10 bg-white/85 shadow-sm md:h-12 md:w-12">
            <img src={schonIcon} alt="Schön Medical" className="h-7 w-7 object-contain md:h-8 md:w-8" />
          </span>
          <span className="hidden text-[10px] font-medium uppercase tracking-[0.2em] text-[#11130f]/55 sm:inline">
            {t.schon.sideLabel}
          </span>
        </Link>
        <div className="container relative z-10 py-20 sm:py-24 flex justify-center">
          <Reveal className="max-w-3xl text-center flex flex-col items-center">
            <Link
              to="/"
              className="mb-6 sm:mb-10 w-full max-w-md sm:max-w-2xl md:max-w-3xl hover:opacity-80 transition-opacity"
            >
              <img
                src={schonWordmark}
                alt={t.schon.title}
                decoding="async"
                className="w-full h-auto object-contain opacity-95"
              />
            </Link>
            <h1 className="sr-only">{t.schon.title}</h1>
            <p className="text-2xl sm:text-3xl md:text-4xl font-serif text-[#11130f] mb-5 sm:mb-6 leading-tight">
              {t.schon.tagline.split('\n').map((line, index) => (
                <span key={line}>
                  {index > 0 && <br />}
                  {line}
                </span>
              ))}
            </p>
            <p className="text-sm sm:text-base md:text-lg text-[#11130f]/65 font-light mb-8 sm:mb-10 leading-relaxed max-w-xl mx-auto">
              {t.schon.intro}
            </p>
            <span className="mb-8 inline-flex border border-[#11130f]/12 bg-white/72 px-5 py-3 text-[10px] font-medium uppercase tracking-[0.2em] text-[#11130f]/72 backdrop-blur-sm sm:mb-10">
              {t.schon.priceText}
            </span>
            <WhatsAppChoice
              message={t.whatsapp.schonMessage}
              className="inline-flex w-full max-w-xs sm:w-auto sm:max-w-none items-center justify-center rounded-none uppercase tracking-widest bg-[#11130f] text-white hover:bg-[#2a2d25] px-8 h-14 text-xs transition-colors"
            >
              {t.schon.requestBudget}
            </WhatsAppChoice>
          </Reveal>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-20 sm:py-28 lg:py-36 bg-white">
        <div className="container">
          <Reveal>
            <div className="text-center mb-12 sm:mb-20 flex flex-col items-center">
              <span className="mb-5 border-l-2 border-[#b8f24a] bg-[#fbfcf7] px-4 py-2 text-[10px] font-medium uppercase tracking-[0.22em] text-[#11130f]/70">
                {t.schon.valueLabel}
              </span>
              <h2 className="text-3xl md:text-5xl font-serif mb-5 sm:mb-6 text-foreground">
                {t.schon.whyTitle}
              </h2>
              <p className="text-muted-foreground font-light max-w-2xl mx-auto text-base sm:text-lg">
                {t.schon.whyText}
              </p>
            </div>
          </Reveal>

          <Reveal delay={100} className="mb-12 sm:mb-16">
            <div className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden border-y border-[#11130f]/10 bg-[#fbfcf7] py-8 sm:py-10">
              <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-white via-white/85 to-transparent sm:w-40" />
              <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-white via-white/85 to-transparent sm:w-40" />
              <div className="schon-showcase-track flex w-max gap-4 px-4 sm:gap-6 sm:px-6">
                {[...showcaseImages, ...showcaseImages].map((image, index) => (
                  <div
                    key={`${image}-${index}`}
                    className="relative h-[360px] w-[220px] shrink-0 overflow-hidden border border-[#11130f]/10 bg-white shadow-[0_24px_70px_rgba(17,19,15,0.08)] sm:h-[520px] sm:w-[320px]"
                  >
                    <img
                      src={image}
                      alt={index < showcaseImages.length ? 'Modelo Schön Medical em apresentação' : ''}
                      loading={index < 3 ? 'eager' : 'lazy'}
                      decoding="async"
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-8">
            {t.schon.values.map((prop, i) => {
              const Icon = valueIcons[i]
              return (
              <Reveal
                key={i}
                delay={i * 100}
                className="text-center p-6 sm:p-8 bg-[#fbfcf7] border border-[#11130f]/10 hover:border-[#b8f24a]/70 transition-colors group"
              >
                <div className="w-16 h-16 mx-auto bg-white border border-[#11130f]/10 rounded-full flex items-center justify-center mb-8 shadow-sm text-[#11130f] group-hover:border-[#b8f24a] transition-colors duration-300">
                  <Icon className="w-8 h-8" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-serif mb-4 text-foreground">{prop.title}</h3>
                <p className="text-muted-foreground text-sm font-light leading-relaxed">
                  {prop.desc}
                </p>
              </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      <ScrubConfigurator />

      {/* Ordering Process */}
      <section className="py-20 sm:py-24 lg:py-32 bg-[#f4f7ee] text-[#11130f]">
        <div className="container">
          <Reveal>
            <div className="text-center mb-16 flex flex-col items-center">
              <h2 className="text-3xl md:text-5xl font-serif mb-6 text-[#11130f]">
                {t.schon.processTitle}
              </h2>
              <p className="text-[#11130f]/65 font-light max-w-2xl mx-auto text-base sm:text-lg">
                {t.schon.processText}
              </p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
            {t.schon.steps.map((step, i) => {
              const Icon = stepIcons[i]
              return (
              <Reveal
                key={step.title}
                delay={i * 120}
                className="bg-white p-6 sm:p-8 border border-[#11130f]/10 text-center"
              >
                <div className="w-14 h-14 mx-auto rounded-full border border-[#b8f24a] bg-[#fbfcf7] text-[#11130f] flex items-center justify-center mb-7">
                  <Icon className="w-6 h-6" strokeWidth={1.5} />
                </div>
                <h3 className="font-serif text-xl mb-4 text-[#11130f]">{step.title}</h3>
                <p className="text-[#11130f]/60 font-light text-sm leading-relaxed">
                  {step.desc}
                </p>
              </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-28 lg:py-36 bg-[#11130f] text-white text-center">
        <div className="container relative z-10">
          <Reveal className="max-w-3xl mx-auto flex flex-col items-center">
            <Link to="/" className="mb-10 hover:opacity-80 transition-opacity">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center overflow-hidden shadow-lg mx-auto">
                <img src={schonIcon} alt="Schön Medical" className="w-12 h-12 object-contain" />
              </div>
            </Link>
            <h2 className="text-3xl md:text-5xl font-serif mb-6 sm:mb-8 leading-tight">
              {t.schon.ctaTitle}
            </h2>
            <p className="text-white/70 font-light mb-10 sm:mb-12 text-base sm:text-lg leading-relaxed">
              {t.schon.ctaText}
            </p>
            <WhatsAppChoice
              message={t.whatsapp.schonMessage}
              className="inline-flex w-full max-w-xs sm:w-auto sm:max-w-none items-center justify-center rounded-none border border-[#b8f24a] text-[#b8f24a] hover:bg-[#b8f24a] hover:text-[#11130f] uppercase tracking-widest bg-transparent h-14 px-10 text-xs transition-colors"
            >
              {t.schon.talkToConsultant}
            </WhatsAppChoice>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
