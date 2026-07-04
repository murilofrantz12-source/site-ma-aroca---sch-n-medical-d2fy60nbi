import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Reveal } from '@/components/Reveal'
import { ProductCard } from '@/components/ProductCard'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { PRODUCTS } from '@/data/products'
import { useLanguage } from '@/lib/i18n'

const CATEGORIES = ['Maçaroca', 'Schön Medical']

export default function Colecoes() {
  const [activeCategory, setActiveCategory] = useState('Maçaroca')
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

        {activeCategory === 'Schön Medical' && (
          <Reveal delay={150} className="mx-auto mb-10 max-w-5xl">
            <div className="grid gap-6 border border-[#11130f]/10 bg-white p-6 text-[#11130f] sm:p-8 md:grid-cols-[1fr_auto] md:items-center">
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
              <Link
                to="/schon-medical#monte-seu-schon"
                className="inline-flex h-12 items-center justify-center border border-[#11130f] bg-[#11130f] px-6 text-xs font-medium uppercase tracking-widest text-white transition-colors hover:bg-[#b8f24a] hover:text-[#11130f]"
              >
                {t.schon.customizer.eyebrow}
              </Link>
            </div>
          </Reveal>
        )}

        {/* Grid */}
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 sm:grid-cols-2 lg:gap-10">
          {filteredProducts.map((product, index) => (
            <Reveal key={product.id} delay={(index % 4) * 100}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>

        {filteredProducts.length === 0 && (
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
