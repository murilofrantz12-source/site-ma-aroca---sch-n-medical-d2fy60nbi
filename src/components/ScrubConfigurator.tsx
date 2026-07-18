import { useMemo, useState } from 'react'
import { Check, ChevronDown, Download, MessageCircle } from 'lucide-react'
import { WhatsAppChoice } from '@/components/WhatsAppChoice'
import { useLanguage } from '@/lib/i18n'
import { cn } from '@/lib/utils'

type ColorOption = {
  name: string
  value: string
}

type QuoteCardItem = {
  color?: string
  label: string
  value: string
}

type QuoteCardData = {
  bottomColor: ColorOption
  downloadNote: string
  fabric: { name: string }
  finalTitle: string
  items: QuoteCardItem[]
  labelColor: ColorOption
  ribbonColor: ColorOption
  topColor: ColorOption
}

type StepId =
  | 'topColor'
  | 'bottomColor'
  | 'ribbonColor'
  | 'labelColor'
  | 'size'
  | 'fabric'
  | 'embroidery'

function OptionButton({
  active,
  children,
  onClick,
}: {
  active: boolean
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex min-h-12 items-center justify-center border px-4 py-3 text-center text-[10px] font-medium uppercase tracking-[0.16em] transition-colors',
        active
          ? 'border-[#11130f] bg-[#11130f] text-white'
          : 'border-[#11130f]/15 bg-white text-[#11130f] hover:border-[#11130f]/45',
      )}
    >
      {children}
    </button>
  )
}

function fillPath(ctx: CanvasRenderingContext2D, path: string, fillStyle: string | CanvasGradient) {
  ctx.fillStyle = fillStyle
  ctx.fill(new Path2D(path))
}

function strokePath(
  ctx: CanvasRenderingContext2D,
  path: string,
  strokeStyle: string,
  lineWidth: number,
) {
  ctx.strokeStyle = strokeStyle
  ctx.lineCap = 'round'
  ctx.lineWidth = lineWidth
  ctx.stroke(new Path2D(path))
}

function drawCardBox(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) {
  ctx.beginPath()
  ctx.roundRect(x, y, width, height, 18)
  ctx.fillStyle = '#ffffff'
  ctx.fill()
  ctx.strokeStyle = 'rgba(17,19,15,0.1)'
  ctx.lineWidth = 2
  ctx.stroke()
}

function drawSchonTagLogo(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, scale = 1) {
  ctx.save()
  ctx.translate(centerX, centerY)
  ctx.scale(scale, scale)
  ctx.fillStyle = 'rgba(17,19,15,0.78)'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.save()
  ctx.translate(-5.6, 0)
  ctx.rotate(-Math.PI / 2)
  ctx.font = '700 3.2px Arial'
  ctx.fillText('SCHÖN', 0, 0)
  ctx.restore()
  ctx.font = '900 8px Arial'
  ctx.fillText('S', 3.2, 1.2)
  ctx.beginPath()
  ctx.arc(0.7, -4.3, 1.1, 0, Math.PI * 2)
  ctx.arc(5.7, -4.3, 1.1, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawQuoteScrub(
  ctx: CanvasRenderingContext2D,
  {
    bottomColor,
    labelColor,
    ribbonColor,
    topColor,
  }: Pick<QuoteCardData, 'bottomColor' | 'labelColor' | 'ribbonColor' | 'topColor'>,
) {
  ctx.save()
  ctx.translate(377, 160)
  ctx.scale(1.25, 1.25)

  const fabricLight = ctx.createLinearGradient(0, 0, 260, 430)
  fabricLight.addColorStop(0, 'rgba(255,255,255,0.18)')
  fabricLight.addColorStop(0.5, 'rgba(255,255,255,0.03)')
  fabricLight.addColorStop(1, 'rgba(0,0,0,0.16)')

  const fabricShadow = ctx.createLinearGradient(0, 0, 260, 430)
  fabricShadow.addColorStop(0, 'rgba(255,255,255,0.18)')
  fabricShadow.addColorStop(1, 'rgba(0,0,0,0.2)')

  const topPath =
    'M78 70 C93 54 112 48 130 48 C148 48 167 54 182 70 L226 96 L206 157 L184 147 L178 228 C164 238 145 243 130 243 C115 243 96 238 82 228 L76 147 L54 157 L34 96 Z'
  fillPath(ctx, topPath, topColor.value)
  fillPath(ctx, topPath, fabricLight)
  fillPath(
    ctx,
    'M111 53 L130 104 L149 53 C143 49 137 48 130 48 C123 48 117 49 111 53 Z',
    '#fbfcf7',
  )
  strokePath(ctx, 'M99 78 C112 100 119 114 130 132 C141 114 148 100 161 78', 'rgba(255,255,255,0.34)', 3)
  strokePath(ctx, 'M78 96 C96 112 113 119 130 119 C147 119 164 112 182 96', 'rgba(0,0,0,0.18)', 2)
  strokePath(ctx, 'M83 224 C103 232 117 236 130 236 C143 236 157 232 177 224', 'rgba(0,0,0,0.22)', 2)
  strokePath(ctx, 'M76 147 C84 127 86 105 78 70', 'rgba(0,0,0,0.16)', 2)
  strokePath(ctx, 'M184 147 C176 127 174 105 182 70', 'rgba(0,0,0,0.16)', 2)
  fillPath(ctx, 'M152 107 L174 111 L172 154 L151 153 Z', 'rgba(255,255,255,0.12)')
  strokePath(ctx, 'M97 78 C101 123 99 174 88 226 M163 78 C159 123 161 174 172 226', 'rgba(255,255,255,0.2)', 2)

  ctx.fillStyle = labelColor.value
  ctx.beginPath()
  ctx.roundRect(195, 136, 24, 14, 2)
  ctx.fill()
  drawSchonTagLogo(ctx, 207, 143, 0.92)

  const bottomPath =
    'M81 226 C101 236 114 240 130 240 C146 240 159 236 179 226 L187 402 C173 414 151 418 134 411 L130 274 L126 411 C109 418 87 414 73 402 Z'
  fillPath(ctx, bottomPath, bottomColor.value)
  fillPath(ctx, bottomPath, fabricShadow)
  strokePath(ctx, 'M82 244 C100 251 115 255 130 255 C145 255 160 251 178 244', 'rgba(255,255,255,0.28)', 3)
  strokePath(ctx, 'M130 260 L130 405', 'rgba(0,0,0,0.2)', 2)
  strokePath(ctx, 'M95 259 C102 298 104 350 100 405', 'rgba(255,255,255,0.18)', 2)
  strokePath(ctx, 'M165 259 C158 298 156 350 160 405', 'rgba(255,255,255,0.18)', 2)
  fillPath(
    ctx,
    'M82 228 C101 236 115 239 130 239 C145 239 159 236 178 228 L178 255 C160 263 144 266 130 266 C116 266 100 263 82 255 Z',
    'rgba(255,255,255,0.12)',
  )
  strokePath(ctx, 'M91 274 C106 278 117 276 123 267', 'rgba(0,0,0,0.18)', 2)
  strokePath(ctx, 'M169 274 C154 278 143 276 137 267', 'rgba(0,0,0,0.18)', 2)
  fillPath(ctx, 'M157 312 L185 305 L185 359 L160 363 Z', 'rgba(255,255,255,0.1)')

  ctx.fillStyle = labelColor.value
  ctx.beginPath()
  ctx.roundRect(162, 313, 24, 14, 2)
  ctx.fill()
  drawSchonTagLogo(ctx, 174, 320, 0.92)

  strokePath(ctx, 'M114 240 C120 248 126 251 130 251 C134 251 140 248 146 240', ribbonColor.value, 5)
  strokePath(ctx, 'M126 250 C116 270 113 296 116 325', ribbonColor.value, 5)
  strokePath(ctx, 'M134 250 C144 270 147 296 144 325', ribbonColor.value, 5)
  strokePath(ctx, 'M111 328 L121 328', ribbonColor.value, 5)
  strokePath(ctx, 'M139 328 L149 328', ribbonColor.value, 5)
  strokePath(ctx, 'M68 173 L77 223 L82 228 M192 173 L183 223 L178 228', 'rgba(255,255,255,0.22)', 2)
  strokePath(ctx, 'M74 394 C88 400 106 400 126 393 M134 393 C154 400 172 400 186 394', 'rgba(0,0,0,0.18)', 4)

  ctx.restore()
}

function downloadQuoteCard(data: QuoteCardData) {
  const canvas = document.createElement('canvas')
  canvas.width = 1080
  canvas.height = 1420
  const ctx = canvas.getContext('2d')

  if (!ctx) return

  ctx.fillStyle = '#fbfcf7'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(48, 48, 984, 1324)
  ctx.strokeStyle = 'rgba(17,19,15,0.12)'
  ctx.lineWidth = 2
  ctx.strokeRect(48, 48, 984, 1324)

  ctx.textAlign = 'center'
  ctx.fillStyle = '#11130f'
  ctx.font = '700 34px Arial'
  ctx.fillText('SCHÖN MEDICAL', 540, 116)
  ctx.font = 'italic 44px Georgia'
  ctx.fillText('by Maçaroca', 540, 168)
  ctx.font = '28px Arial'
  ctx.fillStyle = 'rgba(17,19,15,0.58)'
  ctx.fillText(data.finalTitle, 540, 220)

  drawQuoteScrub(ctx, data)

  ctx.fillStyle = '#11130f'
  ctx.textAlign = 'left'
  ctx.font = '700 24px Arial'
  ctx.fillText('COMPOSIÇÃO', 94, 790)

  data.items.forEach((item, index) => {
    const isLastSingleItem = index === data.items.length - 1 && data.items.length % 2 === 1
    const column = index % 2
    const row = Math.floor(index / 2)
    const x = isLastSingleItem ? 94 : 94 + column * 456
    const y = 830 + row * 122
    const width = isLastSingleItem ? 860 : 404
    drawCardBox(ctx, x, y, width, 92)
    ctx.fillStyle = 'rgba(17,19,15,0.52)'
    ctx.font = '700 18px Arial'
    ctx.fillText(item.label.toUpperCase(), x + 28, y + 34)
    if (item.color) {
      ctx.fillStyle = item.color
      ctx.beginPath()
      ctx.arc(x + 42, y + 62, 14, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = 'rgba(17,19,15,0.16)'
      ctx.lineWidth = 2
      ctx.stroke()
      ctx.fillStyle = '#11130f'
      ctx.font = '24px Arial'
      ctx.fillText(item.value, x + 68, y + 70)
    } else {
      ctx.fillStyle = '#11130f'
      ctx.font = '24px Arial'
      ctx.fillText(item.value, x + 28, y + 70)
    }
  })

  ctx.textAlign = 'center'
  ctx.fillStyle = 'rgba(17,19,15,0.54)'
  ctx.font = '24px Arial'
  ctx.fillText(data.downloadNote, 540, 1320)

  const link = document.createElement('a')
  link.href = canvas.toDataURL('image/png')
  link.download = 'schon-medical-composicao.png'
  link.click()
}

function isLightHexColor(hex: string) {
  const normalized = hex.replace('#', '')
  if (normalized.length !== 3 && normalized.length !== 6) return false

  const expanded =
    normalized.length === 3
      ? normalized
          .split('')
          .map((char) => `${char}${char}`)
          .join('')
      : normalized

  const red = Number.parseInt(expanded.slice(0, 2), 16)
  const green = Number.parseInt(expanded.slice(2, 4), 16)
  const blue = Number.parseInt(expanded.slice(4, 6), 16)

  if ([red, green, blue].some(Number.isNaN)) return false

  return (red * 299 + green * 587 + blue * 114) / 1000 > 210
}

function ColorButton({
  active,
  color,
  onClick,
}: {
  active: boolean
  color: ColorOption
  onClick: () => void
}) {
  const isLightColor = isLightHexColor(color.value)

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex min-h-14 items-center gap-3 border px-3 py-3 text-left transition-colors',
        active ? 'border-[#11130f] bg-[#11130f] text-white' : 'border-[#11130f]/15 bg-white',
      )}
    >
      <span
        className={cn(
          'h-7 w-7 shrink-0 rounded-full border shadow-[inset_0_0_0_1px_rgba(255,255,255,0.45)]',
          active ? 'border-white/40' : 'border-[#11130f]/18',
          isLightColor && 'bg-[linear-gradient(135deg,#fff_0%,#fff_48%,#ece8dc_49%,#f7f5ef_100%)]',
        )}
        style={{ backgroundColor: color.value }}
      />
      <span className="text-[10px] font-medium uppercase tracking-[0.14em]">{color.name}</span>
    </button>
  )
}

function SchonTagLogo({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} fill="rgba(17,19,15,0.78)">
      <text
        transform="translate(-5.6 0) rotate(-90)"
        dominantBaseline="middle"
        fontFamily="Arial, sans-serif"
        fontSize="3.2"
        fontWeight="700"
        letterSpacing="0.35"
        textAnchor="middle"
      >
        SCHÖN
      </text>
      <text
        x="3.2"
        y="1.5"
        dominantBaseline="middle"
        fontFamily="Arial, sans-serif"
        fontSize="8"
        fontWeight="900"
        textAnchor="middle"
      >
        S
      </text>
      <circle cx="0.7" cy="-4.3" r="1.1" />
      <circle cx="5.7" cy="-4.3" r="1.1" />
    </g>
  )
}

function ScrubPreview({
  bottomColor,
  labelColor,
  ribbonColor,
  topColor,
}: {
  bottomColor: string
  labelColor: string
  ribbonColor: string
  topColor: string
}) {
  return (
    <svg
      viewBox="0 0 260 430"
      role="img"
      aria-label="Prévia do scrub personalizado"
      className="relative h-[410px] w-full max-w-[280px] drop-shadow-[0_24px_55px_rgba(17,19,15,0.16)]"
    >
      <defs>
        <linearGradient id="fabricLight" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
          <stop offset="50%" stopColor="rgba(255,255,255,0.03)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.16)" />
        </linearGradient>
        <linearGradient id="fabricShadow" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.2)" />
        </linearGradient>
      </defs>

      <path
        d="M78 70 C93 54 112 48 130 48 C148 48 167 54 182 70 L226 96 L206 157 L184 147 L178 228 C164 238 145 243 130 243 C115 243 96 238 82 228 L76 147 L54 157 L34 96 Z"
        fill={topColor}
      />
      <path
        d="M78 70 C93 54 112 48 130 48 C148 48 167 54 182 70 L226 96 L206 157 L184 147 L178 228 C164 238 145 243 130 243 C115 243 96 238 82 228 L76 147 L54 157 L34 96 Z"
        fill="url(#fabricLight)"
      />

      <path
        d="M111 53 L130 104 L149 53 C143 49 137 48 130 48 C123 48 117 49 111 53 Z"
        fill="#fbfcf7"
        stroke="rgba(17,19,15,0.18)"
        strokeWidth="2"
      />
      <path
        d="M99 78 C112 100 119 114 130 132 C141 114 148 100 161 78"
        fill="none"
        stroke="rgba(255,255,255,0.34)"
        strokeLinecap="round"
        strokeWidth="3"
      />

      <path
        d="M78 96 C96 112 113 119 130 119 C147 119 164 112 182 96"
        fill="none"
        stroke="rgba(0,0,0,0.18)"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <path
        d="M83 224 C103 232 117 236 130 236 C143 236 157 232 177 224"
        fill="none"
        stroke="rgba(0,0,0,0.22)"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <path
        d="M76 147 C84 127 86 105 78 70"
        fill="none"
        stroke="rgba(0,0,0,0.16)"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <path
        d="M184 147 C176 127 174 105 182 70"
        fill="none"
        stroke="rgba(0,0,0,0.16)"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <path
        d="M152 107 L174 111 L172 154 L151 153 Z"
        fill="rgba(255,255,255,0.12)"
        stroke="rgba(0,0,0,0.16)"
        strokeWidth="1.5"
      />
      <path
        d="M97 78 C101 123 99 174 88 226 M163 78 C159 123 161 174 172 226"
        fill="none"
        stroke="rgba(255,255,255,0.2)"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <rect
        x="195"
        y="136"
        width="24"
        height="14"
        rx="2"
        fill={labelColor}
        stroke="rgba(17,19,15,0.18)"
        strokeWidth="1"
      />
      <SchonTagLogo x={207} y={143} />

      <path
        d="M81 226 C101 236 114 240 130 240 C146 240 159 236 179 226 L187 402 C173 414 151 418 134 411 L130 274 L126 411 C109 418 87 414 73 402 Z"
        fill={bottomColor}
      />
      <path
        d="M81 226 C101 236 114 240 130 240 C146 240 159 236 179 226 L187 402 C173 414 151 418 134 411 L130 274 L126 411 C109 418 87 414 73 402 Z"
        fill="url(#fabricShadow)"
      />
      <path
        d="M82 244 C100 251 115 255 130 255 C145 255 160 251 178 244"
        fill="none"
        stroke="rgba(255,255,255,0.28)"
        strokeLinecap="round"
        strokeWidth="3"
      />
      <path
        d="M130 260 L130 405"
        fill="none"
        stroke="rgba(0,0,0,0.2)"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <path
        d="M95 259 C102 298 104 350 100 405"
        fill="none"
        stroke="rgba(255,255,255,0.18)"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <path
        d="M165 259 C158 298 156 350 160 405"
        fill="none"
        stroke="rgba(255,255,255,0.18)"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <path
        d="M82 228 C101 236 115 239 130 239 C145 239 159 236 178 228 L178 255 C160 263 144 266 130 266 C116 266 100 263 82 255 Z"
        fill="rgba(255,255,255,0.12)"
        stroke="rgba(0,0,0,0.12)"
        strokeWidth="1"
      />
      <path
        d="M91 274 C106 278 117 276 123 267"
        fill="none"
        stroke="rgba(0,0,0,0.18)"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <path
        d="M169 274 C154 278 143 276 137 267"
        fill="none"
        stroke="rgba(0,0,0,0.18)"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <path
        d="M157 312 L185 305 L185 359 L160 363 Z"
        fill="rgba(255,255,255,0.1)"
        stroke="rgba(0,0,0,0.16)"
        strokeWidth="1.5"
      />
      <rect
        x="162"
        y="313"
        width="24"
        height="14"
        rx="2"
        fill={labelColor}
        stroke="rgba(17,19,15,0.18)"
        strokeWidth="1"
      />
      <SchonTagLogo x={174} y={320} />

      <path
        d="M114 240 C120 248 126 251 130 251 C134 251 140 248 146 240"
        fill="none"
        stroke={ribbonColor}
        strokeLinecap="round"
        strokeWidth="5"
      />
      <path
        d="M126 250 C116 270 113 296 116 325"
        fill="none"
        stroke={ribbonColor}
        strokeLinecap="round"
        strokeWidth="5"
      />
      <path
        d="M134 250 C144 270 147 296 144 325"
        fill="none"
        stroke={ribbonColor}
        strokeLinecap="round"
        strokeWidth="5"
      />
      <path
        d="M111 328 L121 328"
        stroke={ribbonColor}
        strokeLinecap="round"
        strokeWidth="5"
      />
      <path
        d="M139 328 L149 328"
        stroke={ribbonColor}
        strokeLinecap="round"
        strokeWidth="5"
      />

      <path
        d="M68 173 L77 223 L82 228 M192 173 L183 223 L178 228"
        fill="none"
        stroke="rgba(255,255,255,0.22)"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <path
        d="M74 394 C88 400 106 400 126 393 M134 393 C154 400 172 400 186 394"
        fill="none"
        stroke="rgba(0,0,0,0.18)"
        strokeLinecap="round"
        strokeWidth="4"
      />
    </svg>
  )
}

export function ScrubConfigurator() {
  const { t } = useLanguage()
  const config = t.schon.customizer
  const [topColor, setTopColor] = useState<ColorOption>(config.topColors[0])
  const [bottomColor, setBottomColor] = useState<ColorOption>(config.bottomColors[0])
  const [ribbonColor, setRibbonColor] = useState<ColorOption>(config.ribbonColors[0])
  const [labelColor, setLabelColor] = useState<ColorOption>(config.labelColors[0])
  const [size, setSize] = useState(config.sizes[3])
  const [fabric, setFabric] = useState(config.fabrics[1])
  const [embroidery, setEmbroidery] = useState(config.embroideryOptions[0])
  const [activeStep, setActiveStep] = useState<StepId | null>('topColor')
  const [hasDownloadedPreview, setHasDownloadedPreview] = useState(false)

  const quoteItems = useMemo<QuoteCardItem[]>(
    () => [
      { color: topColor.value, label: config.labels.topColor, value: topColor.name },
      { color: bottomColor.value, label: config.labels.bottomColor, value: bottomColor.name },
      { color: ribbonColor.value, label: config.labels.ribbonColor, value: ribbonColor.name },
      { color: labelColor.value, label: config.labels.labelColor, value: labelColor.name },
      { label: config.labels.size, value: size },
      { label: config.labels.fabric, value: fabric.name },
      { label: config.labels.embroidery, value: embroidery },
    ],
    [
      bottomColor.name,
      bottomColor.value,
      config.labels,
      embroidery,
      fabric.name,
      labelColor.name,
      labelColor.value,
      ribbonColor.name,
      ribbonColor.value,
      size,
      topColor.name,
      topColor.value,
    ],
  )

  const message = useMemo(
    () =>
      [
        config.messageTitle,
        '',
        `${config.labels.topColor}: ${topColor.name}`,
        `${config.labels.bottomColor}: ${bottomColor.name}`,
        `${config.labels.ribbonColor}: ${ribbonColor.name}`,
        `${config.labels.labelColor}: ${labelColor.name}`,
        `${config.labels.size}: ${size}`,
        `${config.labels.fabric}: ${fabric.name}`,
        `${config.labels.embroidery}: ${embroidery}`,
        '',
        config.messageFooter,
      ].join('\n'),
    [
      bottomColor.name,
      config,
      embroidery,
      fabric.name,
      labelColor.name,
      ribbonColor.name,
      size,
      topColor.name,
    ],
  )

  const handleDownloadPreview = () => {
    downloadQuoteCard({
      bottomColor,
      downloadNote: config.downloadNote,
      fabric,
      finalTitle: config.finalTitle,
      items: quoteItems,
      labelColor,
      ribbonColor,
      topColor,
    })
    setHasDownloadedPreview(true)
  }

  return (
    <section id="monte-seu-schon" className="scroll-mt-24 bg-white py-20 sm:py-24 lg:py-32">
      <div className="container">
        <RevealHeader />
        <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:gap-12">
          <div className="border border-[#11130f]/10 bg-[#f7f7f2] p-5 sm:p-7 lg:p-9">
            <div className="mb-8 flex items-start justify-between gap-4">
              <div>
                <span className="mb-3 block text-[10px] font-medium uppercase tracking-[0.22em] text-[#11130f]/50">
                  {config.previewLabel}
                </span>
                <h3 className="font-serif text-3xl text-[#11130f]">{config.previewTitle}</h3>
              </div>
              <span className="border border-[#b8f24a] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-[#11130f]/70">
                {fabric.name}
              </span>
            </div>

            <div className="relative mx-auto mb-8 flex min-h-[500px] max-w-sm items-center justify-center overflow-hidden border border-[#11130f]/10 bg-[#fdfdf9]">
              <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(255,255,255,0.92),rgba(244,244,238,0.54)_46%,rgba(184,242,74,0.13))]" />
              <div className="absolute inset-x-10 bottom-14 h-24 rounded-[999px] bg-[#11130f]/10 blur-2xl" />
              <div className="absolute left-5 top-5 border border-[#11130f]/10 bg-white/80 px-3 py-2 text-[9px] font-medium uppercase tracking-[0.18em] text-[#11130f]/55 backdrop-blur">
                {config.previewDisclaimer}
              </div>
              <div className="absolute bottom-5 right-5 flex items-center gap-2 border border-[#11130f]/10 bg-white/80 px-3 py-2 backdrop-blur">
                <span
                  className="h-3 w-3 rounded-full border border-[#11130f]/15"
                  style={{ backgroundColor: topColor.value }}
                />
                <span
                  className="h-3 w-3 rounded-full border border-[#11130f]/15"
                  style={{ backgroundColor: bottomColor.value }}
                />
                <span
                  className="h-3 w-3 rounded-full border border-[#11130f]/15"
                  style={{ backgroundColor: ribbonColor.value }}
                />
              </div>
              <ScrubPreview
                bottomColor={bottomColor.value}
                labelColor={labelColor.value}
                ribbonColor={ribbonColor.value}
                topColor={topColor.value}
              />
            </div>

            <p className="mb-6 border-l-2 border-[#b8f24a] bg-white px-4 py-3 text-sm font-light leading-relaxed text-[#11130f]/62">
              {config.previewNote}
            </p>

            <div className="border border-[#11130f]/10 bg-white p-5">
              <div className="mb-5 flex items-center justify-between gap-4">
                <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#11130f]/45">
                  {config.summaryLabel}
                </span>
                <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#11130f]/70">
                  {size} / {fabric.name}
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <SummaryLine
                  color={topColor.value}
                  label={config.labels.topColor}
                  value={topColor.name}
                />
                <SummaryLine
                  color={bottomColor.value}
                  label={config.labels.bottomColor}
                  value={bottomColor.name}
                />
                <SummaryLine
                  color={ribbonColor.value}
                  label={config.labels.ribbonColor}
                  value={ribbonColor.name}
                />
                <SummaryLine
                  color={labelColor.value}
                  label={config.labels.labelColor}
                  value={labelColor.name}
                />
                <SummaryLine label={config.labels.size} value={size} />
                <SummaryLine label={config.labels.fabric} value={fabric.name} />
                <SummaryLine label={config.labels.embroidery} value={embroidery} />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <OptionGroup
              isOpen={activeStep === 'topColor'}
              onToggle={() => setActiveStep(activeStep === 'topColor' ? null : 'topColor')}
              summary={topColor.name}
              title={config.steps.topColor}
              step="01"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                {config.topColors.map((color) => (
                  <ColorButton
                    key={color.name}
                    active={topColor.name === color.name}
                    color={color}
                    onClick={() => {
                      setTopColor(color)
                      setActiveStep('bottomColor')
                    }}
                  />
                ))}
              </div>
            </OptionGroup>

            <OptionGroup
              isOpen={activeStep === 'bottomColor'}
              onToggle={() => setActiveStep(activeStep === 'bottomColor' ? null : 'bottomColor')}
              summary={bottomColor.name}
              title={config.steps.bottomColor}
              step="02"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                {config.bottomColors.map((color) => (
                  <ColorButton
                    key={color.name}
                    active={bottomColor.name === color.name}
                    color={color}
                    onClick={() => {
                      setBottomColor(color)
                      setActiveStep('ribbonColor')
                    }}
                  />
                ))}
              </div>
            </OptionGroup>

            <OptionGroup
              isOpen={activeStep === 'ribbonColor'}
              onToggle={() => setActiveStep(activeStep === 'ribbonColor' ? null : 'ribbonColor')}
              summary={ribbonColor.name}
              title={config.steps.ribbonColor}
              step="03"
            >
              <div className="grid gap-3 sm:grid-cols-3">
                {config.ribbonColors.map((color) => (
                  <ColorButton
                    key={color.name}
                    active={ribbonColor.name === color.name}
                    color={color}
                    onClick={() => {
                      setRibbonColor(color)
                      setActiveStep('labelColor')
                    }}
                  />
                ))}
              </div>
            </OptionGroup>

            <OptionGroup
              isOpen={activeStep === 'labelColor'}
              onToggle={() => setActiveStep(activeStep === 'labelColor' ? null : 'labelColor')}
              summary={labelColor.name}
              title={config.steps.labelColor}
              step="04"
            >
              <div className="grid gap-3 sm:grid-cols-3">
                {config.labelColors.map((color) => (
                  <ColorButton
                    key={color.name}
                    active={labelColor.name === color.name}
                    color={color}
                    onClick={() => {
                      setLabelColor(color)
                      setActiveStep('size')
                    }}
                  />
                ))}
              </div>
            </OptionGroup>

            <OptionGroup
              isOpen={activeStep === 'size'}
              onToggle={() => setActiveStep(activeStep === 'size' ? null : 'size')}
              summary={size}
              title={config.steps.size}
              step="05"
            >
              <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
                {config.sizes.map((item) => (
                  <OptionButton
                    key={item}
                    active={size === item}
                    onClick={() => {
                      setSize(item)
                      setActiveStep('fabric')
                    }}
                  >
                    {item}
                  </OptionButton>
                ))}
              </div>
            </OptionGroup>

            <OptionGroup
              isOpen={activeStep === 'fabric'}
              onToggle={() => setActiveStep(activeStep === 'fabric' ? null : 'fabric')}
              summary={fabric.name}
              title={config.steps.fabric}
              step="06"
            >
              <div className="grid gap-3 md:grid-cols-3">
                {config.fabrics.map((item) => (
                  <button
                    type="button"
                    key={item.name}
                    onClick={() => {
                      setFabric(item)
                      setActiveStep('embroidery')
                    }}
                    className={cn(
                      'border p-5 text-left transition-colors',
                      fabric.name === item.name
                        ? 'border-[#11130f] bg-[#11130f] text-white'
                        : 'border-[#11130f]/15 bg-white text-[#11130f] hover:border-[#11130f]/45',
                    )}
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <span className="text-xs font-medium uppercase tracking-[0.16em]">
                        {item.name}
                      </span>
                      {fabric.name === item.name && <Check className="h-4 w-4" />}
                    </div>
                    <p
                      className={cn(
                        'text-sm font-light leading-relaxed',
                        fabric.name === item.name ? 'text-white/65' : 'text-[#11130f]/60',
                      )}
                    >
                      {item.desc}
                    </p>
                  </button>
                ))}
              </div>
            </OptionGroup>

            <OptionGroup
              isOpen={activeStep === 'embroidery'}
              onToggle={() => setActiveStep(activeStep === 'embroidery' ? null : 'embroidery')}
              summary={embroidery}
              title={config.steps.embroidery}
              step="07"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                {config.embroideryOptions.map((item) => (
                  <OptionButton
                    key={item}
                    active={embroidery === item}
                    onClick={() => {
                      setEmbroidery(item)
                      setActiveStep(null)
                    }}
                  >
                    {item}
                  </OptionButton>
                ))}
              </div>
            </OptionGroup>

            <div className="border border-[#11130f] bg-[#11130f] p-6 text-white sm:p-8">
              <h3 className="font-serif text-3xl">{config.finalTitle}</h3>
              <p className="mt-3 max-w-2xl text-sm font-light leading-relaxed text-white/65">
                {config.finalText}
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleDownloadPreview}
                  className="inline-flex h-14 w-full items-center justify-center gap-2 border border-white/25 bg-white px-8 text-xs font-medium uppercase tracking-widest text-[#11130f] transition-colors hover:bg-[#fbfcf7] sm:w-auto"
                >
                  <Download className="h-4 w-4" />
                  {config.downloadPreview}
                </button>
                <WhatsAppChoice
                  message={message}
                  className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-none bg-[#b8f24a] px-8 text-xs font-medium uppercase tracking-widest text-[#11130f] transition-colors hover:bg-white sm:w-auto"
                >
                  <MessageCircle className="h-4 w-4" />
                  {hasDownloadedPreview ? config.submitWithPreview : config.submit}
                </WhatsAppChoice>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )

  function RevealHeader() {
    return (
      <div className="mx-auto mb-14 max-w-3xl text-center sm:mb-16">
        <span className="mb-5 inline-flex border-l-2 border-[#b8f24a] bg-[#fbfcf7] px-4 py-2 text-[10px] font-medium uppercase tracking-[0.22em] text-[#11130f]/70">
          {config.eyebrow}
        </span>
        <h2 className="text-3xl font-serif leading-tight text-[#11130f] md:text-5xl">
          {config.title}
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-base font-light leading-relaxed text-[#11130f]/65 sm:text-lg">
          {config.intro}
        </p>
      </div>
    )
  }
}

function OptionGroup({
  children,
  isOpen,
  onToggle,
  step,
  summary,
  title,
}: {
  children: React.ReactNode
  isOpen: boolean
  onToggle: () => void
  step: string
  summary: string
  title: string
}) {
  return (
    <div
      className={cn(
        'border transition-colors',
        isOpen ? 'border-[#11130f] bg-[#fbfcf7]' : 'border-[#11130f]/10 bg-white',
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-4 p-5 text-left sm:p-6"
        aria-expanded={isOpen}
      >
        <span
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-[10px] font-medium transition-colors',
            isOpen
              ? 'border-[#b8f24a] bg-[#11130f] text-white'
              : 'border-[#11130f]/15 bg-[#fbfcf7] text-[#11130f]',
          )}
        >
          {step}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-xs font-medium uppercase tracking-[0.18em] text-[#11130f]">
            {title}
          </span>
          <span className="mt-1 block truncate text-sm font-light text-[#11130f]/55">
            {summary}
          </span>
        </span>
        <ChevronDown
          className={cn(
            'h-5 w-5 shrink-0 text-[#11130f]/45 transition-transform',
            isOpen && 'rotate-180 text-[#11130f]',
          )}
        />
      </button>
      {isOpen && <div className="border-t border-[#11130f]/10 p-5 pt-5 sm:p-6">{children}</div>}
    </div>
  )
}

function SummaryLine({ color, label, value }: { color?: string; label: string; value: string }) {
  return (
    <div className="flex min-h-16 items-center justify-between gap-4 border border-[#11130f]/10 bg-[#fbfcf7] px-4 py-3">
      <span className="min-w-0">
        <span className="block text-[9px] font-medium uppercase tracking-[0.16em] text-[#11130f]/45">
          {label}
        </span>
        <span className="mt-1 block truncate text-sm text-[#11130f]">{value}</span>
      </span>
      {color && (
        <span
          className="h-7 w-7 shrink-0 rounded-full border border-[#11130f]/15"
          style={{ backgroundColor: color }}
        />
      )}
    </div>
  )
}
