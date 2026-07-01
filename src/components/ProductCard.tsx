import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { MessageCircle } from 'lucide-react'

interface Product {
  id: string
  name: string
  category: string
  brand: string
  price: string
  image: string
  colors: string[]
  sizes: string[]
}

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const handleWhatsApp = () => {
    const text = `Olá, tenho interesse no produto ${product.name}. Gostaria de consultar disponibilidade, tamanhos e valores.`
    window.open(`https://wa.me/5511999999999?text=${encodeURIComponent(text)}`, '_blank')
  }

  return (
    <div
      className="group flex flex-col h-full cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setIsHovered(!isHovered)}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-muted mb-4 border border-border/30">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
        />

        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-5 transition-all duration-500 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div
            className={`transform transition-all duration-500 ${
              isHovered ? 'translate-y-0' : 'translate-y-4'
            }`}
          >
            <span className="text-[10px] text-white/60 uppercase tracking-[0.2em] block mb-2">
              {product.category}
            </span>
            <h3 className="font-serif text-lg text-white mb-3 leading-tight">{product.name}</h3>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex gap-1.5">
                {product.colors.map((color: string, i: number) => (
                  <div
                    key={i}
                    className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-sm"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <span className="text-white/40 text-xs">|</span>
              <span className="text-[10px] text-white/70 uppercase tracking-wider">
                {product.sizes.join(' · ')}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-white font-medium">{product.price}</span>
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  handleWhatsApp()
                }}
                size="sm"
                className="rounded-none bg-white text-black hover:bg-white/90 text-[10px] uppercase tracking-widest h-8 px-4"
              >
                Consultar
              </Button>
            </div>
          </div>
        </div>

        <span className="absolute top-3 left-3 text-[9px] uppercase tracking-[0.2em] text-white/80 bg-black/20 backdrop-blur-sm px-3 py-1 pointer-events-none">
          {product.brand}
        </span>
      </div>

      <div
        className={`flex flex-col transition-opacity duration-300 ${
          isHovered ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'
        }`}
      >
        <h3 className="font-serif text-base leading-tight text-foreground">{product.name}</h3>
        <div className="flex items-center justify-between mt-1">
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
            {product.category}
          </span>
          <span className="text-sm font-medium text-foreground">{product.price}</span>
        </div>
      </div>
    </div>
  )
}
