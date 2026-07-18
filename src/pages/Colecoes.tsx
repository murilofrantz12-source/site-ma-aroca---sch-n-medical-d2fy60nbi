import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'
import { Reveal } from '@/components/Reveal'
import { ProductCard } from '@/components/ProductCard'
import { WhatsAppChoice } from '@/components/WhatsAppChoice'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { PRODUCTS } from '@/data/products'
import { useLanguage } from '@/lib/i18n'

const CATEGORIES = ['Maçaroca', 'Schön Medical']

export default function Colecoes() {
  const [activeCategory, setActiveCategory] = useState('Maçaroca')
  const [activeSchonImageIndex, setActiveSchonImageIndex] = useState(0)
  const location = useLocation()
  const { t } = useLanguage()

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const brand = params.get('brand')
    if (brand === 'macaroca') {
      setActiveCategory('Maçaroca')
    }
  }, [location])

  const filteredProducts = PRODUCTS.filter((p) => {
    if (activeCategory === 'Maçaroca') return p.brand === 'Maçaroca'
    if (activeCategory === 'Schön Medical') return p.brand === 'Schön Medical'
    return p.category === activeCategory
  })
  const schonProduct = PRODUCTS.find((product) => product.brand === 'Schön Medical')
  const schonImages =
    schonProduct && 'gallery' in schonProduct && Array.isArray(schonProduct.gallery)
      ? schonProduct.gallery
      : schonProduct?.image
        ? [schonProduct.image]
        : []
  const activeSchonImage = schonImages[activeSchonImageIndex]
  const previousSchonImage =
    schonImages[(activeSchonImageIndex - 1 + schonImages.length) % schonImages.length]
  const nextSchonImage = schonImages[(activeSchonImageIndex + 1) % schonImages.length]
  const schonWhatsAppMessage = t.whatsapp.productMessage
    .replace('{{product}}', t.catalog.products.scrub.name)
    .replace('{{brand}}', 'Schön Medical')

  useEffect(() => {
    setActiveSchonImageIndex(0)
  }, [activeCategory])

  useEffect(() => {
    if (activeCategory !== 'Schön Medical' || schonImages.length <= 1) return

    const interval = window.setInterval(() => {
      setActiveSchonImageIndex((current) => (current + 1) % schonImages.length)
    }, 3600)

    return () => window.clearInterval(interval)
  }, [activeCategory, schonImages.length])

  return (
    <div className="min-h-screen w-full flex-1 bg-[#fbfcf7] pb-24 pt-32">
      <div className="container">
        <Reveal>
          <div className="mx-auto mb-14 max-w-3xl text-center sm:mb-16">
            <span className="mb-5 block text-[10px] font-medium uppercase tracking-[0.24em] text-[#11130f]/45">
              {t.catalog.eyebrow}
            </span>
            <h1 className="mb-6 font-serif text-4xl uppercase tracking-wider text-[#11130f] md:text-6xl">
              {t.catalog.title}
            </h1>
            <p className="mx-auto max-w-2xl text-lg font-light leading-relaxed text-[#11130f]/62">
              {t.catalog.intro}
            </p>
            <div className="mx-auto mt-8 inline-flex border border-[#11130f]/10 bg-white px-5 py-3 text-[10px] font-medium uppercase tracking-[0.2em] text-[#11130f]/70">
              {t.catalog.note}
            </div>
          </div>
        </Reveal>

        {/* Filter Bar */}
        <Reveal delay={100} className="mb-16">
          <div className="-mx-4 px-4 md:hidden">
            <ScrollArea className="w-full whitespace-nowrap pb-4">
              <div className="flex w-max space-x-3 px-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={cn(
                      'border px-6 py-3 text-[10px] uppercase tracking-widest transition-colors',
                      activeCategory === cat
                        ? 'border-[#11130f] bg-[#11130f] text-white'
                        : 'border-[#11130f]/15 bg-white text-[#11130f] hover:border-[#11130f]',
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="invisible" />
            </ScrollArea>
          </div>
          <div className="hidden flex-wrap justify-center gap-4 md:flex">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  'border px-8 py-3 text-[10px] uppercase tracking-widest transition-colors',
                  activeCategory === cat
                    ? 'border-[#11130f] bg-[#11130f] text-white'
                    : 'border-[#11130f]/15 bg-white text-[#11130f] hover:border-[#11130f]',
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </Reveal>

        {activeCategory === 'Schön Medical' && activeSchonImage && (
          <Reveal delay={150} className="mb-14">
            <section className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden border-y border-[#11130f]/10 bg-white">
              <div className="absolute inset-0">
                <img
                  src={activeSchonImage}
                  alt=""
                  className="h-full w-full scale-110 object-cover opacity-20 blur-2xl"
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(184,242,74,0.12),transparent_34%),linear-gradient(90deg,#fbfcf7_0%,rgba(251,252,247,0.72)_16%,rgba(251,252,247,0.2)_50%,rgba(251,252,247,0.72)_84%,#fbfcf7_100%)]" />
              </div>

              <div className="relative mx-auto flex min-h-[72vh] max-w-7xl items-center justify-center px-4 py-10 sm:min-h-[78vh] lg:px-8">
                <img
                  src={previousSchonImage}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="pointer-events-none absolute left-0 hidden h-[74%] w-[26%] object-cover opacity-25 blur-[2px] [mask-image:linear-gradient(to_right,transparent,black_28%,black_72%,transparent)] lg:block"
                />
                <img
                  src={nextSchonImage}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="pointer-events-none absolute right-0 hidden h-[74%] w-[26%] object-cover opacity-25 blur-[2px] [mask-image:linear-gradient(to_right,transparent,black_28%,black_72%,transparent)] lg:block"
                />

                <button
                  type="button"
                  onClick={() =>
                    setActiveSchonImageIndex((current) => (current + 1) % schonImages.length)
                  }
                  className="group/showcase relative z-10 flex h-[68vh] min-h-[480px] max-h-[760px] w-full max-w-[520px] items-center justify-center overflow-hidden bg-white shadow-[0_28px_90px_rgba(17,19,15,0.12)] sm:h-[74vh]"
                  aria-label="Avançar foto do catálogo Schön Medical"
                >
                  <img
                    src={activeSchonImage}
                    alt="Scrub Schön Medical em apresentação"
                    className="h-full w-full object-contain transition-transform duration-700 group-hover/showcase:scale-[1.02]"
                  />
                  <div className="absolute inset-x-0 bottom-0 translate-y-3 bg-gradient-to-t from-[#11130f]/82 via-[#11130f]/42 to-transparent px-5 pb-5 pt-16 opacity-100 transition-all duration-300 sm:opacity-0 sm:group-hover/showcase:translate-y-0 sm:group-hover/showcase:opacity-100 sm:group-focus-visible/showcase:translate-y-0 sm:group-focus-visible/showcase:opacity-100">
                    <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-white/62">
                      Schön Medical
                    </p>
                    <p className="mt-1 font-serif text-3xl text-white">
                      {t.catalog.products.scrub.category}
                    </p>
                  </div>
                </button>

                <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#fbfcf7] to-transparent" />
                <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#fbfcf7] to-transparent" />
              </div>

              <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2">
                {schonImages.map((image, index) => (
                  <button
                    key={image}
                    type="button"
                    onClick={() => setActiveSchonImageIndex(index)}
                    className={cn(
                      'h-2 w-8 border border-[#11130f]/20 transition-colors',
                      activeSchonImageIndex === index ? 'bg-[#11130f]' : 'bg-white/75',
                    )}
                    aria-label={`Ver foto ${index + 1} da Schön Medical`}
                  />
                ))}
              </div>
            </section>
          </Reveal>
        )}

        {activeCategory === 'Schön Medical' && (
          <Reveal delay={200} className="mx-auto mb-14 max-w-5xl">
            <div className="grid gap-6 border border-[#11130f]/10 bg-white p-6 text-[#11130f] shadow-[0_24px_70px_rgba(17,19,15,0.05)] sm:p-8 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <span className="mb-3 block text-[10px] font-medium uppercase tracking-[0.22em] text-[#11130f]/45">
                  Schön Medical
                </span>
                <h2 className="font-serif text-3xl leading-tight">
                  {t.schon.customizer.eyebrow}
                </h2>
                <p className="mt-3 max-w-2xl text-sm font-light leading-relaxed text-[#11130f]/62">
                  {t.schon.customizer.intro}
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
                <Link
                  to="/schon-medical#monte-seu-schon"
                  className="inline-flex h-12 items-center justify-center border border-[#11130f] bg-[#11130f] px-6 text-xs font-medium uppercase tracking-widest text-white transition-colors hover:bg-[#b8f24a] hover:text-[#11130f]"
                >
                  {t.schon.customizer.eyebrow}
                </Link>
                <WhatsAppChoice
                  message={schonWhatsAppMessage}
                  className="inline-flex h-12 items-center justify-center gap-2 border border-[#11130f]/20 bg-white px-6 text-xs font-medium uppercase tracking-widest text-[#11130f] transition-colors hover:border-[#11130f] hover:bg-[#11130f] hover:text-white"
                >
                  <MessageCircle className="h-4 w-4" />
                  {t.common.consult}
                </WhatsAppChoice>
              </div>
            </div>
          </Reveal>
        )}

        {/* Grid */}
        {activeCategory !== 'Schön Medical' && (
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 sm:grid-cols-2 lg:gap-10">
            {filteredProducts.map((product, index) => (
              <Reveal key={product.id} delay={(index % 4) * 100}>
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>
        )}

        {activeCategory !== 'Schön Medical' && filteredProducts.length === 0 && (
          <Reveal delay={200} className="text-center py-32 border border-dashed border-border mt-8">
            <p className="text-muted-foreground font-light text-lg">
              {t.catalog.empty}
            </p>
            <button
              onClick={() => setActiveCategory('Todos')}
              className="mt-4 text-sm font-medium uppercase tracking-widest underline underline-offset-4 hover:text-muted-foreground transition-colors"
            >
              {t.catalog.seeAll}
            </button>
          </Reveal>
        )}
      </div>
    </div>
  )
}
