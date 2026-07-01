import { Button } from '@/components/ui/button'

export function ProductCard({ product }: any) {
  const handleWhatsApp = () => {
    const text = `Olá, tenho interesse no produto ${product.name}. Gostaria de consultar disponibilidade, tamanhos e valores.`
    window.open(`https://wa.me/5511999999999?text=${encodeURIComponent(text)}`, '_blank')
  }

  return (
    <div className="group flex flex-col h-full">
      <div className="relative aspect-[3/4] overflow-hidden bg-muted mb-4 border border-border/50">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>
      <div className="flex flex-col flex-1">
        <div className="flex justify-between items-start mb-1">
          <div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
              {product.brand}
            </span>
            <h3 className="font-serif text-lg leading-tight mt-1">{product.name}</h3>
          </div>
          <span className="text-sm font-medium whitespace-nowrap ml-2">{product.price}</span>
        </div>

        <div className="flex items-center space-x-2 mt-3 mb-5">
          <div className="flex space-x-1">
            {product.colors.map((color: string, i: number) => (
              <div
                key={i}
                className="w-4 h-4 rounded-full border border-border shadow-sm"
                style={{ backgroundColor: color }}
                title="Cor disponível"
              />
            ))}
          </div>
          <span className="text-border mx-1">|</span>
          <span className="text-xs text-muted-foreground uppercase">
            {product.sizes.join(' - ')}
          </span>
        </div>

        <div className="mt-auto pt-2">
          <Button
            onClick={handleWhatsApp}
            variant="outline"
            className="w-full rounded-none border-foreground text-xs uppercase tracking-widest hover:bg-foreground hover:text-background transition-colors"
          >
            Consultar no WhatsApp
          </Button>
        </div>
      </div>
    </div>
  )
}
