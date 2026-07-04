import { Link } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'
import { WhatsAppChoice } from '@/components/WhatsAppChoice'
import { useLanguage } from '@/lib/i18n'

interface Product {
  id: string
  name: string
  category: string
  brand: string
  price: string
  visual: string
  image?: string
  colors: string[]
  sizes: string[]
}

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { t } = useLanguage()
  const isSchon = product.visual === 'schon'
  const productText =
    product.id === 'macaroca-curadoria' ? t.catalog.products.macaroca : t.catalog.products.scrub
  const productName = productText.name
  const productCategory = productText.category
  const productPrice = productText.price
  const productDescription = 'description' in productText ? productText.description : ''
  const productDetails = 'details' in productText ? productText.details : []
  const productSizes =
    product.id === 'macaroca-curadoria' && 'sizes' in productText
      ? productText.sizes
      : product.sizes
  const whatsappMessage = t.whatsapp.productMessage
    .replace('{{product}}', productName)
    .replace('{{brand}}', product.brand)

  return (
    <article className="group flex h-full flex-col border border-[#11130f]/10 bg-[#f8f8f4] p-3 transition-colors duration-300 hover:border-[#11130f]/35">
      <div className="relative aspect-[4/5] overflow-hidden border border-[#11130f]/10 bg-white">
        <div
          className={`absolute inset-0 overflow-hidden ${
            isSchon
              ? 'bg-[linear-gradient(145deg,#fbfcf7_0%,#eef4f1_46%,#dfe9e2_100%)]'
              : 'bg-[linear-gradient(145deg,#ffffff_0%,#f3f1eb_48%,#ddd8cd_100%)]'
          }`}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.96),transparent_34%),linear-gradient(to_top,rgba(17,19,15,0.2),transparent_58%)] opacity-80" />
          {product.image ? (
            <img
              src={product.image}
              alt=""
              loading="lazy"
              decoding="async"
              className={`absolute inset-0 h-full w-full object-cover opacity-95 transition-transform duration-700 group-hover:scale-[1.035] ${
                isSchon
                  ? 'object-[center_42%]'
                  : 'object-[center_32%] sm:object-[center_40%]'
              }`}
            />
          ) : isSchon ? (
            <div className="absolute inset-x-0 bottom-[14%] mx-auto w-[54%] h-[62%]">
              <div className="absolute left-1/2 top-0 h-[24%] w-[28%] -translate-x-1/2 rounded-t-full bg-white/75 shadow-sm" />
              <div className="absolute left-1/2 top-[17%] h-[48%] w-[66%] -translate-x-1/2 rounded-t-[36px] bg-[#f8fbfc]/90 shadow-[0_18px_45px_rgba(45,62,75,0.14)]" />
              <div className="absolute left-[17%] top-[25%] h-[28%] w-[18%] rotate-12 rounded-full bg-[#f8fbfc]/90" />
              <div className="absolute right-[17%] top-[25%] h-[28%] w-[18%] -rotate-12 rounded-full bg-[#f8fbfc]/90" />
              <div className="absolute left-[30%] bottom-0 h-[42%] w-[18%] rounded-b-[28px] bg-[#e9f0f2]/95" />
              <div className="absolute right-[30%] bottom-0 h-[42%] w-[18%] rounded-b-[28px] bg-[#e9f0f2]/95" />
              <div className="absolute left-1/2 top-[25%] h-[32%] w-px -translate-x-1/2 bg-[#2c3e50]/15" />
            </div>
          ) : (
            <div className="absolute inset-x-0 bottom-[9%] mx-auto w-[68%] h-[78%]">
              <div className="absolute left-1/2 top-0 h-[13%] w-px -translate-x-1/2 bg-[#a7a49b]/60" />
              <div className="absolute left-1/2 top-[11%] h-[8%] w-[30%] -translate-x-1/2 rounded-t-full border-t border-[#9c988f]/70" />
              <div className="absolute left-1/2 top-[15%] h-[14%] w-[34%] -translate-x-1/2 rounded-full border border-[#bbb7ad]/70 bg-white/40 shadow-sm" />
              <div className="absolute left-1/2 top-[24%] h-[16%] w-[66%] -translate-x-1/2 rounded-t-[44px] border border-[#b9b5aa]/70 bg-white/45" />
              <div className="absolute left-1/2 top-[32%] h-[58%] w-[56%] -translate-x-1/2 bg-white/70 shadow-[0_28px_70px_rgba(80,78,70,0.14)] [clip-path:polygon(28%_0%,72%_0%,88%_100%,12%_100%)]" />
              <div className="absolute left-1/2 top-[34%] h-[50%] w-[34%] -translate-x-1/2 border-l border-r border-[#c9c5bb]/60" />
              <div className="absolute left-[22%] top-[31%] h-[21%] w-[15%] -rotate-12 rounded-full border-l border-[#bdb8ad]/70" />
              <div className="absolute right-[22%] top-[31%] h-[21%] w-[15%] rotate-12 rounded-full border-r border-[#bdb8ad]/70" />
              <div className="absolute left-1/2 bottom-[6%] h-px w-[64%] -translate-x-1/2 bg-[#c8c4ba]/70" />
              <div className="absolute left-1/2 top-[50%] h-[34%] w-px -translate-x-1/2 bg-[#d7d3c9]/70" />
            </div>
          )}
        </div>
        <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-black/8 via-transparent to-white/14 opacity-80 transition-opacity duration-500 group-hover:opacity-40" />

        <span className="pointer-events-none absolute left-4 top-4 z-20 border border-[#11130f]/10 bg-white/95 px-3 py-1 text-[9px] uppercase tracking-[0.2em] text-[#11130f] shadow-sm backdrop-blur-sm">
          {product.brand}
        </span>
        <span className="pointer-events-none absolute right-4 top-4 z-20 bg-white/95 px-3 py-1 text-[9px] uppercase tracking-[0.18em] text-[#11130f] shadow-sm">
          {t.catalog.statusLabel}
        </span>
      </div>

      <div className="flex flex-1 flex-col bg-white px-4 pb-4 pt-5 sm:px-5 sm:pb-5">
        <span className="mb-3 text-[10px] uppercase tracking-[0.2em] text-[#11130f]/45">
          {t.catalog.availabilityLabel}
        </span>
        <h3 className="font-serif text-3xl leading-tight text-[#11130f]">{productName}</h3>
        <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.18em] text-[#11130f]/70">
          {productCategory}
        </p>
        {productDescription && (
          <p className="mt-4 text-sm font-light leading-relaxed text-[#11130f]/62">
            {productDescription}
          </p>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-[#11130f]/10 pt-4">
          <div className="flex gap-1.5">
            {product.colors.map((color: string, i: number) => (
              <span
                key={i}
                className="h-3.5 w-3.5 rounded-full border border-[#11130f]/15 shadow-sm"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <span className="h-4 w-px bg-[#11130f]/16" />
          <span className="text-[10px] font-medium uppercase leading-relaxed tracking-[0.16em] text-[#11130f]/48">
            {productSizes.join(' · ')}
          </span>
        </div>

        <div className="mt-4 grid gap-2">
          {productDetails.map((detail) => (
            <div
              key={detail}
              className="flex items-center justify-between gap-4 border-t border-[#11130f]/10 py-3"
            >
              <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#11130f]/45">
                {detail}
              </span>
              <span className="h-px w-10 bg-[#b8f24a]" />
            </div>
          ))}
        </div>

        <div className="mt-auto flex flex-col gap-4 border-t border-[#11130f]/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm font-medium text-[#11130f]">{productPrice}</span>
          {isSchon ? (
            <Link
              to="/schon-medical#monte-seu-schon"
              className="inline-flex h-10 items-center justify-center gap-2 border border-[#11130f] bg-[#11130f] px-5 text-[10px] uppercase tracking-widest text-white transition-colors hover:bg-[#b8f24a] hover:text-[#11130f]"
            >
              {t.catalog.buildSchon}
            </Link>
          ) : (
          <WhatsAppChoice
            message={whatsappMessage}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-none border border-[#11130f] px-5 text-[10px] uppercase tracking-widest text-[#11130f] transition-colors hover:bg-[#11130f] hover:text-white"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            {t.common.consult}
          </WhatsAppChoice>
          )}
        </div>
      </div>
    </article>
  )
}
