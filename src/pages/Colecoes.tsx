import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Reveal } from '@/components/Reveal'
import { ProductCard } from '@/components/ProductCard'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { PRODUCTS } from '@/data/products'

const CATEGORIES = [
  'Todos',
  'Maçaroca',
  'Schön Medical',
  'Vestidos',
  'Macacões',
  'Conjuntos',
  'Scrubs',
]

export default function Colecoes() {
  const [activeCategory, setActiveCategory] = useState('Todos')
  const location = useLocation()

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const brand = params.get('brand')
    if (brand === 'macaroca') {
      setActiveCategory('Maçaroca')
    }
  }, [location])

  const filteredProducts = PRODUCTS.filter((p) => {
    if (activeCategory === 'Todos') return true
    if (activeCategory === 'Maçaroca') return p.brand === 'Maçaroca'
    if (activeCategory === 'Schön Medical') return p.brand === 'Schön Medical'
    return p.category === activeCategory
  })

  return (
    <div className="w-full pt-32 pb-24 bg-background min-h-screen flex-1">
      <div className="container">
        <Reveal>
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-serif mb-6 uppercase tracking-wider">
              Coleções
            </h1>
            <p className="text-muted-foreground font-light max-w-2xl mx-auto text-lg">
              Explore nossas peças autorais e a linha profissional Schön Medical. Feitas para
              destacar a sua essência.
            </p>
          </div>
        </Reveal>

        {/* Filter Bar */}
        <Reveal delay={100} className="mb-16">
          <div className="md:hidden -mx-4 px-4">
            <ScrollArea className="w-full whitespace-nowrap pb-4">
              <div className="flex w-max space-x-3 px-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={cn(
                      'px-6 py-2.5 text-xs uppercase tracking-widest transition-colors border',
                      activeCategory === cat
                        ? 'bg-foreground text-background border-foreground'
                        : 'bg-transparent text-foreground border-border hover:border-foreground',
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="invisible" />
            </ScrollArea>
          </div>
          <div className="hidden md:flex flex-wrap justify-center gap-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  'px-6 py-2.5 text-xs uppercase tracking-widest transition-colors border',
                  activeCategory === cat
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-transparent text-foreground border-border hover:border-foreground',
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </Reveal>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
          {filteredProducts.map((product, index) => (
            <Reveal key={product.id} delay={(index % 4) * 100}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <Reveal delay={200} className="text-center py-32 border border-dashed border-border mt-8">
            <p className="text-muted-foreground font-light text-lg">
              Nenhuma peça encontrada para esta categoria.
            </p>
            <button
              onClick={() => setActiveCategory('Todos')}
              className="mt-4 text-sm font-medium uppercase tracking-widest underline underline-offset-4 hover:text-muted-foreground transition-colors"
            >
              Ver todas as peças
            </button>
          </Reveal>
        )}
      </div>
    </div>
  )
}
