import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Banknote,
  Calculator,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Menu,
  Package,
  PackageCheck,
  Plus,
  Printer,
  ReceiptText,
  RefreshCw,
  Scissors,
  ShieldCheck,
  Shirt,
  Store,
  Trash2,
  WalletCards,
  X,
} from 'lucide-react'
import logoMacaroca from '@/assets/macaroca-editado-40689.png'
import logoSchon from '@/assets/so-by-macaroca-logo-peq-editado-4f9ae.png'
import { supabase } from '@/lib/supabase/client'
import {
  loadErpState,
  loadProfile,
  saveErpChanges,
  usernameEmail,
  type AuditEvent,
  type ErpEnvironment,
  type ErpProfile,
  type VersionMap,
} from '@/lib/erp-store'

type Area =
  | 'inicio'
  | 'plano-geral'
  | 'modulo-vendas'
  | 'modulo-producao'
  | 'modulo-estoque'
  | 'modulo-cadastros'
  | 'modulo-gestao'
  | 'ajuda'
  | 'painel'
  | 'indicadores'
  | 'implantacao'
  | 'vendas'
  | 'entregas'
  | 'producao-necessidades'
  | 'produtos'
  | 'produto-guiado'
  | 'materias'
  | 'fornecedores'
  | 'clientes'
  | 'marcas'
  | 'precos'
  | 'usuarios'
  | 'configuracoes'
  | 'pedido-guiado'
  | 'producao-guiada'
  | 'notas'
  | 'pedidos'
  | 'producao'
  | 'estoque'
  | 'movimentacoes'
  | 'financeiro'
  | 'historico'
type BrandName = string
type UserRole = 'Admin' | 'Sócia' | 'Comercial' | 'Produção' | 'Financeiro'
type OrderDocumentType = 'Orçamento' | 'Pedido'
type OrderStatus = 'Aberto' | 'Em produção' | 'Pronto' | 'Entregue' | 'Cancelado'
type PaymentMethod = 'Pix' | 'Dinheiro' | 'Cartão' | 'Transferência' | 'Boleto' | 'A combinar'
type PaymentStatus = 'Pendente' | 'Parcial' | 'Pago'
type DeliveryMethod = 'Retirada' | 'Entrega local' | 'Transportadora' | 'Correios' | 'A combinar'
type ReservationStatus = 'Não se aplica' | 'Reservado' | 'Liberado'
type OpStatus = 'Não iniciada' | 'Em produção' | 'Pausada' | 'Finalizada'
type ProductionPriority = 'Baixa' | 'Normal' | 'Alta' | 'Urgente'
type ProductionEventType = 'Produção' | 'Perda' | 'Defeito' | 'Retrabalho'
type CashKind = 'Entrada' | 'Saída'
type InventoryCategory = 'Matéria-prima' | 'Produto acabado'
type InventoryKind =
  | 'Entrada MP'
  | 'Consumo MP'
  | 'Entrada PA'
  | 'Saída PA'
  | 'Ajuste entrada MP'
  | 'Ajuste saída MP'
  | 'Ajuste entrada PA'
  | 'Ajuste saída PA'
type FinanceCategory =
  | 'Venda recebida'
  | 'Conta a pagar'
  | 'Compra de matéria-prima'
  | 'Despesa fixa'
  | 'Comissão'
  | 'Outro'
type FinanceView = 'resumo' | 'resultados' | 'caixa' | 'lancamentos'
type IndicatorView = 'atencao' | 'producao' | 'produtos' | 'estoque'
type ImplementationView = 'resumo' | 'treinamento' | 'equipe' | 'duvidas'
type TimelineStatus = 'done' | 'current' | 'pending'
type TechnicalSheetStatus = 'Rascunho' | 'Aprovada' | 'Desativada'
type PriceApprovalStatus = 'Não necessária' | 'Pendente' | 'Aprovada' | 'Recusada'
type SyncStatus = 'Carregando' | 'Compartilhado' | 'Salvando' | 'Local' | 'Erro'

type HelpGuide = {
  id: string
  category: string
  title: string
  summary: string
  keywords: string[]
  target: Area
  action: string
  steps: string[]
}

type OrderTimelineItem = {
  label: string
  detail: string
  date?: string
  status: TimelineStatus
}

type SmartAlert = {
  id: string
  badge: string
  title: string
  detail: string
  tone: 'neutral' | 'green' | 'blue' | 'amber' | 'rose'
  actionLabel: string
  onClick: () => void
}

type MaterialLine = {
  id: string
  rawMaterialId?: string
  name: string
  qty: number
  unit: string
  unitCost: number
  expectedLoss?: number
}

type Product = {
  id: string
  code: string
  brand: BrandName
  name: string
  category: string
  description: string
  salePrice?: number
  referenceImage?: string
  active?: boolean
  materials: MaterialLine[]
  variations: ProductVariation[]
}

type ProductVariation = {
  id: string
  name: string
  model?: string
  size: string
  color: string
  fabric: string
  measurements: string
  technicalNotes: string
  referenceImage: string
  salePrice?: number
  sheetVersion?: string
  sheetResponsible?: string
  sheetStatus?: TechnicalSheetStatus
  materials: MaterialLine[]
}

type PurchaseNote = {
  id: string
  number: string
  purchaseOrderId?: string
  supplier: string
  date: string
  item: string
  qty: number
  unit: string
  unitCost: number
  stockQty?: number
  stockUnit?: string
  createdBy?: string
}

type PurchaseOrderStatus = 'Enviado' | 'Parcial' | 'Recebido' | 'Cancelado'

type PurchaseOrder = {
  id: string
  number: string
  supplier: string
  orderDate: string
  expectedDate: string
  rawMaterialId: string
  item: string
  qty: number
  unit: string
  unitCost: number
  stockQty: number
  stockUnit: string
  receivedQty: number
  status: PurchaseOrderStatus
  notes: string
  createdBy: string
  createdAt: string
  cancellationReason?: string
  cancelledBy?: string
  cancelledAt?: string
}

type RawMaterial = {
  id: string
  code?: string
  name: string
  category?: string
  stockLocation?: string
  unit: string
  purchaseUnit: string
  purchaseToStockFactor: number
  avgCost: number
  supplier: string
  minimumStock: number
  expectedLoss?: number
  lastPurchase?: string
}

type Supplier = {
  id: string
  name: string
  contact: string
  notes: string
}

type Customer = {
  id: string
  name: string
  phone: string
  city: string
  notes: string
  contact?: string
  address?: string
}

type Brand = {
  id: string
  name: BrandName
  prefix: string
  notes: string
}

type Order = {
  id: string
  documentType: OrderDocumentType
  customerId?: string
  client: string
  phone: string
  city: string
  contact?: string
  address?: string
  orderDate: string
  productId: string
  variationId?: string
  qty: number
  unitPrice?: number
  dueDate: string
  notes: string
  status: OrderStatus
  billed: boolean
  createdBy?: string
  pricing?: OrderPricing
  paymentMethod?: PaymentMethod
  paymentStatus?: PaymentStatus
  paymentNotes?: string
  deliveryMethod?: DeliveryMethod
  deliveryAddress?: string
  deliveryDate?: string
  availabilityCheckedAt?: string
  reservationStatus?: ReservationStatus
  reservedAt?: string
  cancelledAt?: string
  cancelledBy?: string
  cancellationReason?: string
  convertedFrom?: string
  duplicatedFrom?: string
  createdAt?: string
  history?: OrderHistoryEvent[]
}

type OrderHistoryEvent = {
  id: string
  type: 'Criação' | 'Disponibilidade' | 'Reserva' | 'Conversão' | 'Duplicação' | 'Cancelamento' | 'Produção'
  detail: string
  date: string
  user: string
}

type OrderPricing = {
  cost: number
  minimumPrice: number
  suggestedPrice: number
  officialPrice: number
  negotiatedPrice: number
  tax: number
  commission: number
  fixedCost: number
  desiredProfit: number
  realProfit: number
  realMargin: number
  discountPercent: number
  approvalStatus: PriceApprovalStatus
  requestedBy?: string
  requestedAt?: string
  approvedBy?: string
  approvedAt?: string
}

type OrderStockPosition = {
  product?: Product
  physical: number
  pending: number
  producing: number
  otherPending: number
  freeForThisOrder: number
  availableAfterReservations: number
  toProduce: number
  suggestedQty: number
}

type ProductionOrder = {
  id: string
  orderId?: string
  productId: string
  variationId?: string
  qty: number
  produced: number
  status: OpStatus
  priority: ProductionPriority
  origin: 'Pedido' | 'Estoque'
  notes: string
  responsible: string
  startedAt: string
  finishedAt: string
  launches: ProductionLaunch[]
}

type ProductionLaunch = {
  id: string
  date: string
  qty: number
  responsible: string
  type: ProductionEventType
  notes: string
}

type InventoryEntry = {
  id: string
  kind: InventoryKind
  item: string
  qty: number
  unit: string
  value: number
  source: string
  createdBy?: string
  createdAt?: string
  reason?: string
}

type InventoryCount = {
  id: string
  date: string
  category: InventoryCategory
  item: string
  unit: string
  systemQty: number
  countedQty: number
  difference: number
  notes: string
  createdBy: string
  createdAt: string
}

type ImplementationProgress = {
  id: string
  userId: string
  stepId: string
  completedAt: string
  completedBy: string
}

type ImplementationResponsibility = {
  id: string
  area: string
  userId: string
}

type ImplementationQuestion = {
  id: string
  text: string
  createdAt: string
  createdBy: string
  resolved: boolean
  resolvedAt?: string
  resolvedBy?: string
}

type CashEntry = {
  id: string
  kind: CashKind
  category: FinanceCategory
  description: string
  value: number
  source: string
  dueDate?: string
  paid: boolean
  createdBy?: string
  createdAt?: string
  paidAt?: string
}

type AppUser = {
  id: string
  name: string
  password: string
  role: UserRole
}

type CompanySettings = {
  name: string
  phone: string
  address: string
  logoUrl: string
  budgetDefaultText: string
  budgetValidityDays: number
  budgetDefaultNotes: string
}

type AppState = {
  users: AppUser[]
  company: CompanySettings
  brands: Brand[]
  rawMaterials: RawMaterial[]
  suppliers: Supplier[]
  customers: Customer[]
  products: Product[]
  purchaseOrders: PurchaseOrder[]
  purchaseNotes: PurchaseNote[]
  orders: Order[]
  productionOrders: ProductionOrder[]
  inventoryEntries: InventoryEntry[]
  inventoryCounts: InventoryCount[]
  implementationProgress: ImplementationProgress[]
  implementationResponsibilities: ImplementationResponsibility[]
  implementationQuestions: ImplementationQuestion[]
  cashEntries: CashEntry[]
  tax: number
  commission: number
  fixedCost: number
  profit: number
}

const storageKey = 'macaroca-erp-prototype-v2'
const cloudStateTable = (import.meta.env.VITE_SUPABASE_STATE_TABLE as string | undefined) || 'macaroca_app_state'
const cloudStateId = (import.meta.env.VITE_SUPABASE_STATE_ID as string | undefined) || 'main'
const appEnvironment = (import.meta.env.VITE_APP_ENV as string | undefined) || 'production'
const isTestEnvironment = appEnvironment === 'test'
const erpEnvironment: ErpEnvironment = isTestEnvironment ? 'test' : 'production'
const normalizedStoreEnabled = import.meta.env.VITE_ERP_V2 === 'true'

const defaultProducts: Product[] = [
  {
    id: 'produto-conj-base',
    code: 'CONJ-BASE',
    brand: 'Schön Medical',
    name: 'Conjunto base - calça + camiseta',
    category: 'Moda médica',
    description: 'Conjunto base com calça e camiseta. Ficha importada da base Valora.',
    materials: [
      {
        id: 'mat-conj-base-tecido',
        rawMaterialId: 'mp-tec-metro',
        name: 'Tecido principal para conjunto calça + camiseta',
        qty: 3,
        unit: 'm',
        unitCost: 18500,
      },
      {
        id: 'mat-conj-base-fita',
        rawMaterialId: 'mp-fit-gorg-m',
        name: 'Fita gorgurão - custo convertido por metro',
        qty: 0.5,
        unit: 'm',
        unitCost: 5989,
      },
      {
        id: 'mat-conj-base-etq-gerais',
        rawMaterialId: 'mp-etq-gerais',
        name: 'Kit etiquetas gerais de papel - por conjunto',
        qty: 1,
        unit: 'un',
        unitCost: 243,
      },
    ],
    variations: [
      {
        id: 'var-conj-base-v1',
        name: 'v1',
        size: 'Base',
        color: 'Conforme pedido',
        fabric: 'Tecido principal',
        measurements: 'Ficha base',
        technicalNotes: 'Versão base importada do Valora. Custo da versão: Gs. 58.738.',
        referenceImage: '',
        materials: [
          {
            id: 'mat-var-conj-base-tecido',
            rawMaterialId: 'mp-tec-metro',
            name: 'Tecido principal para conjunto calça + camiseta',
            qty: 3,
            unit: 'm',
            unitCost: 18500,
          },
          {
            id: 'mat-var-conj-base-fita',
            rawMaterialId: 'mp-fit-gorg-m',
            name: 'Fita gorgurão - custo convertido por metro',
            qty: 0.5,
            unit: 'm',
            unitCost: 5989,
          },
          {
            id: 'mat-var-conj-base-etq-gerais',
            rawMaterialId: 'mp-etq-gerais',
            name: 'Kit etiquetas gerais de papel - por conjunto',
            qty: 1,
            unit: 'un',
            unitCost: 243,
          },
        ],
      },
    ],
  },
  {
    id: 'produto-schon-scrub',
    code: 'SC-0000001',
    brand: 'Schön Medical',
    name: 'Scrub completo',
    category: 'Uniforme médico',
    description: 'Modelo scrub completo. Cor azul marinho. Tamanhos variados conforme pedido.',
    materials: [
      { id: 'mat-tecido', rawMaterialId: 'mp-tecido-principal', name: 'Tecido principal', qty: 3, unit: 'm', unitCost: 18500 },
      { id: 'mat-linha', rawMaterialId: 'mp-linha-acabamento', name: 'Linha e acabamento', qty: 1, unit: 'un', unitCost: 1800 },
      { id: 'mat-etiqueta', rawMaterialId: 'mp-etiqueta', name: 'Etiqueta / embalagem', qty: 1, unit: 'un', unitCost: 2500 },
    ],
    variations: [
      {
        id: 'var-scrub-m-azul',
        name: 'M · Azul marinho',
        size: 'M',
        color: 'Azul marinho',
        fabric: 'Tecido principal',
        measurements: 'Medidas padrão M',
        technicalNotes: 'Scrub completo azul marinho com acabamento padrão.',
        referenceImage: '',
        materials: [
          { id: 'mat-var-scrub-tecido', rawMaterialId: 'mp-tecido-principal', name: 'Tecido principal', qty: 3, unit: 'm', unitCost: 18500 },
          { id: 'mat-var-scrub-linha', rawMaterialId: 'mp-linha-acabamento', name: 'Linha e acabamento', qty: 1, unit: 'un', unitCost: 1800 },
          { id: 'mat-var-scrub-etiqueta', rawMaterialId: 'mp-etiqueta', name: 'Etiqueta / embalagem', qty: 1, unit: 'un', unitCost: 2500 },
        ],
      },
      {
        id: 'var-scrub-g-azul',
        name: 'G · Azul marinho',
        size: 'G',
        color: 'Azul marinho',
        fabric: 'Tecido principal',
        measurements: 'Medidas padrão G',
        technicalNotes: 'Variação maior com consumo adicional de tecido.',
        referenceImage: '',
        materials: [
          { id: 'mat-var-scrub-g-tecido', rawMaterialId: 'mp-tecido-principal', name: 'Tecido principal', qty: 3.4, unit: 'm', unitCost: 18500 },
          { id: 'mat-var-scrub-g-linha', rawMaterialId: 'mp-linha-acabamento', name: 'Linha e acabamento', qty: 1, unit: 'un', unitCost: 1800 },
          { id: 'mat-var-scrub-g-etiqueta', rawMaterialId: 'mp-etiqueta', name: 'Etiqueta / embalagem', qty: 1, unit: 'un', unitCost: 2500 },
        ],
      },
    ],
  },
  {
    id: 'produto-macaroca-vestido',
    code: 'MA-0000001',
    brand: 'Maçaroca',
    name: 'Vestido autoral',
    category: 'Peça sob medida',
    description: 'Vestido autoral sob medida. Medidas, tamanho e observações entram aqui.',
    materials: [
      { id: 'mat-tecido-vestido', rawMaterialId: 'mp-tecido-leve', name: 'Tecido leve', qty: 2.4, unit: 'm', unitCost: 22000 },
      { id: 'mat-aviamento', rawMaterialId: 'mp-aviamentos', name: 'Aviamentos', qty: 1, unit: 'un', unitCost: 6500 },
      { id: 'mat-embalagem', rawMaterialId: 'mp-embalagem', name: 'Embalagem', qty: 1, unit: 'un', unitCost: 1200 },
    ],
    variations: [
      {
        id: 'var-vestido-p-vinho',
        name: 'P · Vinho',
        size: 'P',
        color: 'Vinho',
        fabric: 'Tecido leve',
        measurements: 'Busto 86 cm · Cintura 68 cm · Comprimento conforme pedido',
        technicalNotes: 'Vestido autoral com caimento leve e acabamento delicado.',
        referenceImage: '',
        materials: [
          { id: 'mat-var-vestido-p-tecido', rawMaterialId: 'mp-tecido-leve', name: 'Tecido leve', qty: 2.2, unit: 'm', unitCost: 22000 },
          { id: 'mat-var-vestido-p-aviamento', rawMaterialId: 'mp-aviamentos', name: 'Aviamentos', qty: 1, unit: 'un', unitCost: 6500 },
          { id: 'mat-var-vestido-p-embalagem', rawMaterialId: 'mp-embalagem', name: 'Embalagem', qty: 1, unit: 'un', unitCost: 1200 },
        ],
      },
      {
        id: 'var-vestido-m-preto',
        name: 'M · Preto',
        size: 'M',
        color: 'Preto',
        fabric: 'Tecido leve',
        measurements: 'Busto 92 cm · Cintura 74 cm · Comprimento conforme pedido',
        technicalNotes: 'Variação em tecido leve preto com consumo médio.',
        referenceImage: '',
        materials: [
          { id: 'mat-var-vestido-m-tecido', rawMaterialId: 'mp-tecido-leve', name: 'Tecido leve', qty: 2.5, unit: 'm', unitCost: 22000 },
          { id: 'mat-var-vestido-m-aviamento', rawMaterialId: 'mp-aviamentos', name: 'Aviamentos', qty: 1, unit: 'un', unitCost: 6500 },
          { id: 'mat-var-vestido-m-embalagem', rawMaterialId: 'mp-embalagem', name: 'Embalagem', qty: 1, unit: 'un', unitCost: 1200 },
        ],
      },
    ],
  },
]

const initialState: AppState = {
  users: [
    {
      id: 'user-murilo',
      name: 'Murilo',
      password: '1',
      role: 'Admin',
    },
  ],
  company: {
    name: 'Maçaroca',
    phone: 'Telefone / WhatsApp',
    address: 'Assunção/PY',
    logoUrl: '',
    budgetDefaultText:
      'Orçamento calculado conforme ficha de custo, impostos, comissão, custos fixos e margem configurados no sistema.',
    budgetValidityDays: 7,
    budgetDefaultNotes:
      'Prazo, disponibilidade de matéria-prima e condições finais podem ser confirmados no fechamento do pedido.',
  },
  brands: [
    {
      id: 'marca-macaroca',
      name: 'Maçaroca',
      prefix: 'MA',
      notes: 'Marca principal',
    },
    {
      id: 'marca-schon',
      name: 'Schön Medical',
      prefix: 'SC',
      notes: 'Linha médica',
    },
  ],
  rawMaterials: [
    {
      id: 'mp-etq-especiais',
      code: 'ETQ-ESPECIAIS',
      name: 'Kit etiquetas especiais - primeira compra ou presente',
      category: 'Embalagem',
      unit: 'un',
      purchaseUnit: 'un',
      purchaseToStockFactor: 1,
      avgCost: 1070,
      supplier: 'Fornecedor não informado',
      minimumStock: 0,
      lastPurchase: '2026-06-23',
    },
    {
      id: 'mp-etq-gerais',
      code: 'ETQ-GERAIS',
      name: 'Kit etiquetas gerais de papel - por conjunto',
      category: 'Embalagem',
      unit: 'un',
      purchaseUnit: 'un',
      purchaseToStockFactor: 1,
      avgCost: 243,
      supplier: 'Fornecedor não informado',
      minimumStock: 0,
      lastPurchase: '2026-06-23',
    },
    {
      id: 'mp-fit-gorg-m',
      code: 'FIT-GORG-M',
      name: 'Fita gorgurão - custo convertido por metro',
      category: 'Insumo',
      unit: 'm',
      purchaseUnit: 'm',
      purchaseToStockFactor: 1,
      avgCost: 5989,
      supplier: 'Fornecedor não informado',
      minimumStock: 0,
      lastPurchase: '2026-06-23',
    },
    {
      id: 'mp-tec-metro',
      code: 'TEC-METRO',
      name: 'Tecido principal para conjunto calça + camiseta',
      category: 'Matéria-prima',
      unit: 'm',
      purchaseUnit: 'm',
      purchaseToStockFactor: 1,
      avgCost: 18500,
      supplier: 'Fornecedor não informado',
      minimumStock: 0,
    },
    {
      id: 'mp-tecido-principal',
      name: 'Tecido principal',
      unit: 'm',
      purchaseUnit: 'kg',
      purchaseToStockFactor: 3,
      avgCost: 18500,
      supplier: 'Fornecedor de tecidos',
      minimumStock: 15,
    },
    {
      id: 'mp-linha-acabamento',
      name: 'Linha e acabamento',
      unit: 'un',
      purchaseUnit: 'un',
      purchaseToStockFactor: 1,
      avgCost: 1800,
      supplier: 'Fornecedor de aviamentos',
      minimumStock: 20,
    },
    {
      id: 'mp-etiqueta',
      name: 'Etiqueta / embalagem',
      unit: 'un',
      purchaseUnit: 'un',
      purchaseToStockFactor: 1,
      avgCost: 2500,
      supplier: 'Fornecedor de embalagens',
      minimumStock: 30,
    },
    {
      id: 'mp-tecido-leve',
      name: 'Tecido leve',
      unit: 'm',
      purchaseUnit: 'kg',
      purchaseToStockFactor: 3,
      avgCost: 22000,
      supplier: 'Fornecedor de tecidos',
      minimumStock: 10,
    },
    {
      id: 'mp-aviamentos',
      name: 'Aviamentos',
      unit: 'un',
      purchaseUnit: 'un',
      purchaseToStockFactor: 1,
      avgCost: 6500,
      supplier: 'Fornecedor de aviamentos',
      minimumStock: 12,
    },
    {
      id: 'mp-embalagem',
      name: 'Embalagem',
      unit: 'un',
      purchaseUnit: 'un',
      purchaseToStockFactor: 1,
      avgCost: 1200,
      supplier: 'Fornecedor de embalagens',
      minimumStock: 25,
    },
  ],
  suppliers: [
    {
      id: 'forn-nao-informado',
      name: 'Fornecedor não informado',
      contact: 'Sem contato cadastrado',
      notes: 'Usado para registros importados do Valora sem fornecedor informado.',
    },
    {
      id: 'forn-copipunto-luque',
      name: 'COPIPUNTO LUQUE',
      contact: 'Sem contato cadastrado',
      notes: 'Fornecedor/registro identificado nas notas importadas do Valora.',
    },
    {
      id: 'forn-tecidos',
      name: 'Fornecedor de tecidos',
      contact: 'WhatsApp / telefone',
      notes: 'Tecidos principais para Maçaroca e Schön Medical',
    },
  ],
  customers: [
    {
      id: 'cli-san-rafael',
      name: 'Clínica San Rafael',
      phone: 'WhatsApp / telefone',
      city: 'Cidade do cliente',
      notes: 'Cliente exemplo da Schön Medical',
    },
  ],
  products: defaultProducts,
  purchaseOrders: [],
  purchaseNotes: [
    {
      id: 'NF-VALORA-001',
      number: '001-001-0104492',
      supplier: 'Fornecedor não informado',
      date: '2026-06-23',
      item: 'Fita gorgurão - custo convertido por metro',
      qty: 5,
      unit: 'm',
      unitCost: 5989,
      stockQty: 5,
      stockUnit: 'm',
      createdBy: 'Base Valora',
    },
    {
      id: 'NF-VALORA-COPIPUNTO',
      number: 'COPIPUNTO LUQUE',
      supplier: 'COPIPUNTO LUQUE',
      date: '2026-06-23',
      item: 'Kit etiquetas especiais - primeira compra ou presente',
      qty: 1,
      unit: 'un',
      unitCost: 223961,
      stockQty: 1,
      stockUnit: 'un',
      createdBy: 'Base Valora',
    },
    {
      id: 'NF-001',
      number: '0001',
      supplier: 'Fornecedor de tecidos',
      date: '2026-07-20',
      item: 'Tecido principal',
      qty: 40,
      unit: 'm',
      unitCost: 18500,
    },
  ],
  orders: [],
  productionOrders: [],
  inventoryEntries: [
    {
      id: 'EST-VALORA-FIT-GORG-M',
      kind: 'Entrada MP',
      item: 'Fita gorgurão - custo convertido por metro',
      qty: 5,
      unit: 'm',
      value: 29945,
      source: 'NF 001-001-0104492',
      createdBy: 'Base Valora',
    },
    {
      id: 'EST-001',
      kind: 'Entrada MP',
      item: 'Tecido principal',
      qty: 40,
      unit: 'm',
      value: 740000,
      source: 'NF 0001',
    },
    {
      id: 'EST-002',
      kind: 'Entrada MP',
      item: 'Linha e acabamento',
      qty: 30,
      unit: 'un',
      value: 54000,
      source: 'Compra inicial',
    },
  ],
  inventoryCounts: [],
  implementationProgress: [],
  implementationResponsibilities: [],
  implementationQuestions: [],
  cashEntries: [
    {
      id: 'CX-VALORA-001',
      kind: 'Saída',
      category: 'Compra de matéria-prima',
      description: 'NF 001-001-0104492 - Base Valora',
      value: 29945,
      source: 'NF 001-001-0104492',
      dueDate: '2026-06-23',
      paid: true,
      createdBy: 'Base Valora',
      createdAt: '2026-06-23T12:00:00.000Z',
      paidAt: '2026-06-23T12:00:00.000Z',
    },
    {
      id: 'CX-VALORA-COPIPUNTO',
      kind: 'Saída',
      category: 'Compra de matéria-prima',
      description: 'NF COPIPUNTO LUQUE - Base Valora',
      value: 223961,
      source: 'NF COPIPUNTO LUQUE',
      dueDate: '2026-06-23',
      paid: true,
      createdBy: 'Base Valora',
      createdAt: '2026-06-23T12:00:00.000Z',
      paidAt: '2026-06-23T12:00:00.000Z',
    },
    {
      id: 'CX-002',
      kind: 'Saída',
      category: 'Compra de matéria-prima',
      description: 'NF 0001 - Fornecedor de tecidos',
      value: 740000,
      source: 'NF 0001',
      dueDate: '2026-07-20',
      paid: true,
      createdAt: '2026-07-20T12:00:00.000Z',
      paidAt: '2026-07-20T12:00:00.000Z',
    },
  ],
  tax: 5,
  commission: 10,
  fixedCost: 0,
  profit: 52,
}

const brandPrefix = (brand: BrandName) => {
  if (brand === 'Maçaroca') return 'MA'
  if (brand === 'Schön Medical') return 'SC'

  const letters = brand
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z ]/g, '')
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 3)
    .toUpperCase()

  return letters || 'PR'
}

const makeProductCode = (brand: BrandName, sequence: number) =>
  `${brandPrefix(brand)}-${String(sequence).padStart(7, '0')}`

const productSequence = (product: Product) => {
  const sequence = Number(product.code?.split('-')[1])
  return Number.isFinite(sequence) ? sequence : 0
}

const nextProductCode = (products: Product[], brand: BrandName) => {
  const prefix = brandPrefix(brand)
  const lastSequence = products
    .filter((product) => product.code?.startsWith(`${prefix}-`) || product.brand === brand)
    .reduce((highest, product) => Math.max(highest, productSequence(product)), 0)
  return makeProductCode(brand, lastSequence + 1)
}

const nextRawMaterialCode = (materials: RawMaterial[]) => {
  const lastSequence = materials.reduce((highest, material) => {
    const match = material.code?.match(/^MP-(\d+)$/)
    return Math.max(highest, match ? Number(match[1]) : 0)
  }, 0)
  return `MP-${String(lastSequence + 1).padStart(6, '0')}`
}

const mergeById = <T extends { id: string }>(defaults: T[], saved: T[] = []) => {
  const savedIds = new Set(saved.map((item) => item.id))
  return [...saved, ...defaults.filter((item) => !savedIds.has(item.id))]
}

const productVariation = (product: Product | undefined, variationId?: string) =>
  product?.variations?.find((variation) => variation.id === variationId) ?? product?.variations?.[0]

const productMaterials = (product: Product, variationId?: string) => {
  const variation = productVariation(product, variationId)
  return variation?.materials?.length ? variation.materials : product.materials
}

const productReadyForUse = (product: Product, variationId?: string) => {
  const variation = productVariation(product, variationId)
  return product.active !== false && (variation?.sheetStatus ?? 'Aprovada') === 'Aprovada'
}

const productDisplayName = (product: Product | undefined, variationId?: string) => {
  if (!product) return 'Produto'
  const variation = productVariation(product, variationId)
  return variation ? `${product.name} · ${variation.name}` : product.name
}

const productFinishedItemName = (product: Product, variationId?: string) =>
  productDisplayName(product, variationId)

const normalizeOrderStatus = (status: string): OrderStatus => {
  if (status === 'Pedido aberto') return 'Aberto'
  if (status === 'OP gerada') return 'Em produção'
  if (status === 'Concluído') return 'Pronto'
  if (['Aberto', 'Em produção', 'Pronto', 'Entregue', 'Cancelado'].includes(status)) {
    return status as OrderStatus
  }
  return 'Aberto'
}

const normalizeOpStatus = (status: string): OpStatus => {
  if (['Não iniciada', 'Em produção', 'Pausada', 'Finalizada'].includes(status)) {
    return status as OpStatus
  }
  return 'Não iniciada'
}

const normalizeProductionPriority = (priority?: string): ProductionPriority => {
  if (priority && ['Baixa', 'Normal', 'Alta', 'Urgente'].includes(priority)) {
    return priority as ProductionPriority
  }
  return 'Normal'
}

const roleOptions: UserRole[] = ['Admin', 'Sócia', 'Comercial', 'Produção', 'Financeiro']

const normalizeUserRole = (role?: string): UserRole => {
  if (roleOptions.includes(role as UserRole)) return role as UserRole
  return 'Sócia'
}

const inferFinanceCategory = (entry: CashEntry): FinanceCategory => {
  if (entry.category) return entry.category
  if (entry.kind === 'Entrada' && entry.source.startsWith('PED-')) return 'Venda recebida'
  if (entry.description.toLowerCase().includes('nf')) return 'Compra de matéria-prima'
  if (entry.kind === 'Saída') return 'Despesa fixa'
  return 'Outro'
}

const financeEntryDate = (entry: CashEntry) =>
  ((entry.paid ? entry.paidAt : undefined) ?? entry.dueDate ?? entry.createdAt ?? '').slice(0, 10)

const isMonth = (date: string | undefined, month: string) => (date ?? '').startsWith(month)

const normalizeState = (state: AppState, includePrototypeDefaults = true): AppState => {
  const counters: Record<string, number> = {}
  const looksLikeOldPriceProfile =
    state.commission === 5 &&
    state.fixedCost === 12 &&
    state.profit === 35
  const company = {
    ...initialState.company,
    ...(state.company ?? {}),
    budgetValidityDays: Number(state.company?.budgetValidityDays) || initialState.company.budgetValidityDays,
  }
  const users = mergeById(includePrototypeDefaults ? initialState.users : [], state.users).map((user) => ({
    ...user,
    role: normalizeUserRole(user.role),
  }))
  const brands = mergeById(includePrototypeDefaults ? initialState.brands : [], state.brands)
  const rawMaterials = mergeById(includePrototypeDefaults ? initialState.rawMaterials : [], state.rawMaterials).map((material) => ({
    ...material,
    code: material.code,
    category: material.category ?? 'Matéria-prima',
    stockLocation: material.stockLocation ?? '',
    minimumStock: material.minimumStock ?? 0,
    expectedLoss: material.expectedLoss ?? 0,
    purchaseUnit: material.purchaseUnit ?? material.unit,
    purchaseToStockFactor: material.purchaseToStockFactor ?? 1,
    lastPurchase: material.lastPurchase ?? '',
  }))
  const suppliers = mergeById(includePrototypeDefaults ? initialState.suppliers : [], state.suppliers)
  const customers = mergeById(includePrototypeDefaults ? initialState.customers : [], state.customers).map((customer) => ({
    ...customer,
    phone: customer.phone ?? customer.contact ?? '',
    city: customer.city ?? customer.address ?? '',
    notes: customer.notes ?? '',
  }))
  const normalizeMaterialLine = (material: MaterialLine) => {
    const rawMaterial =
      rawMaterials.find((item) => item.id === material.rawMaterialId) ??
      rawMaterials.find((item) => item.name.toLowerCase() === material.name.toLowerCase())

    return rawMaterial
      ? {
          ...material,
          rawMaterialId: rawMaterial.id,
          name: rawMaterial.name,
          unit: rawMaterial.unit,
          unitCost: rawMaterial.avgCost,
          expectedLoss: material.expectedLoss ?? rawMaterial.expectedLoss ?? 0,
        }
      : { ...material, expectedLoss: material.expectedLoss ?? 0 }
  }

  return {
    ...initialState,
    ...state,
    company,
    users,
    brands,
    rawMaterials,
    suppliers,
    customers,
    tax: state.tax ?? 5,
    commission: looksLikeOldPriceProfile ? 10 : state.commission,
    fixedCost: looksLikeOldPriceProfile ? 0 : state.fixedCost,
    profit: looksLikeOldPriceProfile ? 52 : state.profit,
    products: mergeById(includePrototypeDefaults ? initialState.products : [], state.products).map((product) => {
      counters[product.brand] = (counters[product.brand] ?? 0) + 1
      return {
        ...product,
        code: product.code || makeProductCode(product.brand, counters[product.brand]),
        description: product.description || 'Descrição técnica da peça.',
        salePrice: typeof product.salePrice === 'number' ? product.salePrice : undefined,
        referenceImage: product.referenceImage ?? '',
        active: product.active !== false,
        materials: product.materials.map(normalizeMaterialLine),
        variations: (product.variations?.length
          ? product.variations
          : [
              {
                id: `var-${product.id}-padrao`,
                name: 'Padrão',
                size: 'Único',
                color: 'Conforme pedido',
                fabric: '',
                measurements: '',
                technicalNotes: product.description || 'Descrição técnica da peça.',
                referenceImage: '',
                materials: product.materials,
              },
            ]
        ).map((variation) => ({
          ...variation,
          name: variation.name || `${variation.size || 'Tamanho'} · ${variation.color || 'Cor'}`,
          model: variation.model ?? '',
          size: variation.size ?? '',
          color: variation.color ?? '',
          fabric: variation.fabric ?? '',
          measurements: variation.measurements ?? '',
          technicalNotes: variation.technicalNotes ?? '',
          referenceImage: variation.referenceImage ?? '',
          salePrice: typeof variation.salePrice === 'number' ? variation.salePrice : undefined,
          sheetVersion: variation.sheetVersion ?? 'v1',
          sheetResponsible: variation.sheetResponsible ?? 'Sistema',
          sheetStatus: variation.sheetStatus ?? 'Aprovada',
          materials: (variation.materials?.length ? variation.materials : product.materials).map(normalizeMaterialLine),
        })),
      }
    }),
    purchaseOrders: mergeById(
      includePrototypeDefaults ? initialState.purchaseOrders : [],
      state.purchaseOrders ?? [],
    ).map((order) => ({
      ...order,
      stockQty: order.stockQty ?? convertedStockQty(
        order.qty,
        rawMaterials.find((material) => material.id === order.rawMaterialId || material.name === order.item),
        order.unit,
      ),
      stockUnit:
        order.stockUnit ??
        rawMaterials.find((material) => material.id === order.rawMaterialId || material.name === order.item)?.unit ??
        order.unit,
      receivedQty: order.receivedQty ?? 0,
      status: (['Enviado', 'Parcial', 'Recebido', 'Cancelado'] as PurchaseOrderStatus[]).includes(order.status)
        ? order.status
        : 'Enviado',
      notes: order.notes ?? '',
      createdBy: order.createdBy ?? 'Sistema',
      createdAt: order.createdAt ?? new Date(`${order.orderDate}T12:00:00`).toISOString(),
    })),
    purchaseNotes: mergeById(includePrototypeDefaults ? initialState.purchaseNotes : [], state.purchaseNotes ?? []).map((note) => ({
      ...note,
      createdBy: note.createdBy ?? 'Sistema',
    })),
    orders: (state.orders ?? []).map((order) => ({
      ...order,
      documentType: order.documentType === 'Orçamento' ? 'Orçamento' : 'Pedido',
      customerId: order.customerId ?? customers.find((customer) => customer.name === order.client)?.id,
      phone: order.phone ?? order.contact ?? customers.find((customer) => customer.name === order.client)?.phone ?? '',
      city: order.city ?? order.address ?? customers.find((customer) => customer.name === order.client)?.city ?? '',
      orderDate: order.orderDate ?? '2026-07-20',
      unitPrice: typeof order.unitPrice === 'number' ? order.unitPrice : undefined,
      status: normalizeOrderStatus(order.status),
      createdBy: order.createdBy ?? 'Sistema',
      paymentMethod: order.paymentMethod ?? 'A combinar',
      paymentStatus: order.paymentStatus ?? (order.billed ? 'Pago' : 'Pendente'),
      paymentNotes: order.paymentNotes ?? '',
      deliveryMethod: order.deliveryMethod ?? 'A combinar',
      deliveryAddress: order.deliveryAddress ?? order.address ?? '',
      deliveryDate: order.deliveryDate ?? order.dueDate,
      reservationStatus:
        order.reservationStatus ??
        (order.documentType === 'Pedido' && order.status !== 'Entregue' && order.status !== 'Cancelado'
          ? 'Reservado'
          : 'Não se aplica'),
      createdAt: order.createdAt ?? `${order.orderDate ?? '2026-07-20'}T12:00:00.000Z`,
      history: order.history ?? [],
      pricing: order.pricing
        ? {
            ...order.pricing,
            approvalStatus: (['Não necessária', 'Pendente', 'Aprovada', 'Recusada'].includes(order.pricing.approvalStatus)
              ? order.pricing.approvalStatus
              : 'Não necessária') as PriceApprovalStatus,
          }
        : undefined,
    })),
    productionOrders: (state.productionOrders ?? []).map((op) => ({
      ...op,
      status: normalizeOpStatus(op.status),
      priority: normalizeProductionPriority(op.priority),
      notes: op.notes ?? '',
      responsible: op.responsible ?? '',
      startedAt: op.startedAt ?? '',
      finishedAt: op.finishedAt ?? '',
      launches: (op.launches ?? []).map((launch) => ({
        ...launch,
        type: launch.type ?? 'Produção',
        notes: launch.notes ?? '',
      })),
    })),
    inventoryEntries: mergeById(includePrototypeDefaults ? initialState.inventoryEntries : [], state.inventoryEntries ?? []).map((entry) =>
      entry.id === 'EST-003' && entry.kind === 'Consumo MP' && entry.item === 'Scrub completo'
        ? {
            ...entry,
            kind: 'Entrada PA' as InventoryKind,
            createdBy: entry.createdBy ?? 'Sistema',
            createdAt: entry.createdAt ?? '',
            reason: entry.reason ?? '',
          }
        : {
            ...entry,
            createdBy: entry.createdBy ?? 'Sistema',
            createdAt: entry.createdAt ?? '',
            reason: entry.reason ?? '',
          },
    ),
    inventoryCounts: (state.inventoryCounts ?? []).map((count) => ({
      ...count,
      notes: count.notes ?? '',
      createdBy: count.createdBy ?? 'Sistema',
      createdAt: count.createdAt ?? `${count.date}T12:00:00.000Z`,
    })),
    implementationProgress: (state.implementationProgress ?? []).map((progress) => ({
      ...progress,
      completedAt: progress.completedAt ?? '',
      completedBy: progress.completedBy ?? 'Sistema',
    })),
    implementationResponsibilities: state.implementationResponsibilities ?? [],
    implementationQuestions: (state.implementationQuestions ?? []).map((question) => ({
      ...question,
      createdAt: question.createdAt ?? '',
      createdBy: question.createdBy ?? 'Sistema',
      resolved: question.resolved ?? false,
    })),
    cashEntries: mergeById(includePrototypeDefaults ? initialState.cashEntries : [], state.cashEntries ?? []).map((entry) => ({
      ...entry,
      category: inferFinanceCategory(entry),
      paid: entry.paid ?? true,
      createdBy: entry.createdBy ?? 'Sistema',
      createdAt: entry.createdAt ?? (entry.dueDate ? `${entry.dueDate}T12:00:00.000Z` : ''),
      paidAt:
        entry.paid
          ? entry.paidAt ?? (entry.dueDate ? `${entry.dueDate}T12:00:00.000Z` : entry.createdAt)
          : undefined,
    })),
  }
}

const money = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'PYG',
    maximumFractionDigits: 0,
  })
    .format(Number.isFinite(value) ? value : 0)
    .replace('PYG', 'Gs.')

const numericCode = (id: string) => id.replace(/\D/g, '') || id

const formatDate = (date?: string) => {
  const source = date ? new Date(`${date}T00:00:00`) : new Date()
  return new Intl.DateTimeFormat('pt-BR').format(source)
}

const formatDateTime = (date?: string) => {
  const source = date ? new Date(date) : new Date()
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(source)
}

const auditEntityLabels: Record<string, string> = {
  brand: 'Marca',
  raw_material: 'Matéria-prima',
  supplier: 'Fornecedor',
  customer: 'Cliente',
  product: 'Produto',
  purchase_order: 'Pedido de compra',
  purchase_note: 'Compra de matéria-prima',
  order: 'Orçamento ou pedido',
  production_order: 'Ordem de produção',
  inventory_entry: 'Entrada ou saída de estoque',
  inventory_count: 'Contagem de inventário',
  cash_entry: 'Lançamento financeiro',
  company: 'Empresa e documentos',
  pricing: 'Configuração de preços',
}

const auditActionLabels: Record<AuditEvent['action'], string> = {
  INSERT: 'Criou',
  UPDATE: 'Alterou',
  DELETE: 'Excluiu',
}

const dateInputValue = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const currentDateValue = () => dateInputValue(new Date())

const datePlusDaysValue = (days: number) => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return dateInputValue(date)
}

const currentMonthValue = () => currentDateValue().slice(0, 7)

const isCurrentMonth = (date?: string) => (date ?? '').startsWith(currentMonthValue())

const fileDateTime = () =>
  new Date().toISOString().slice(0, 16).replace(/-/g, '').replace(/:/g, '').replace('T', '')

const nextDocumentId = (orders: Order[], type: OrderDocumentType) => {
  const prefix = type === 'Orçamento' ? 'ORC' : 'PED'
  const lastSequence = orders
    .filter((order) => order.id.startsWith(`${prefix}-`))
    .map((order) => Number(order.id.replace(/\D/g, '')))
    .filter(Number.isFinite)
    .reduce((max, value) => Math.max(max, value), 0)

  return `${prefix}-${String(lastSequence + 1).padStart(3, '0')}`
}

const nextProductionOrderId = (orders: ProductionOrder[]) => {
  const lastSequence = orders
    .filter((order) => order.id.startsWith('OP-'))
    .map((order) => Number(order.id.replace(/\D/g, '')))
    .filter(Number.isFinite)
    .reduce((max, value) => Math.max(max, value), 0)

  return `OP-${String(lastSequence + 1).padStart(3, '0')}`
}

const downloadTextFile = (fileName: string, content: string, type: string) => {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

const csvCell = (value: unknown) => {
  if (value === undefined || value === null) return ''
  const text = typeof value === 'object' ? JSON.stringify(value) : String(value)
  return `"${text.replace(/"/g, '""')}"`
}

const rowsToCsv = (rows: Record<string, unknown>[]) => {
  const headers = ['tabela', 'id', 'nome', 'descricao', 'status', 'quantidade', 'unidade', 'valor', 'data', 'extra']
  return [
    headers.join(';'),
    ...rows.map((row) => headers.map((header) => csvCell(row[header])).join(';')),
  ].join('\n')
}

const daysUntil = (date?: string) => {
  if (!date) return Number.POSITIVE_INFINITY
  const today = new Date(`${currentDateValue()}T00:00:00`)
  const target = new Date(`${date}T00:00:00`)
  return Math.ceil((target.getTime() - today.getTime()) / 86_400_000)
}

const financeDueStatus = (entry: CashEntry) => {
  if (entry.paid) return { label: 'Realizado', tone: 'green' as const }
  if (!entry.dueDate) return { label: 'Sem vencimento', tone: 'neutral' as const }
  const remainingDays = daysUntil(entry.dueDate)
  if (remainingDays < 0) {
    const overdueDays = Math.abs(remainingDays)
    return {
      label: `${overdueDays} dia${overdueDays === 1 ? '' : 's'} em atraso`,
      tone: 'rose' as const,
    }
  }
  if (remainingDays === 0) return { label: 'Vence hoje', tone: 'amber' as const }
  if (remainingDays <= 3) {
    return {
      label: `Vence em ${remainingDays} dia${remainingDays === 1 ? '' : 's'}`,
      tone: 'amber' as const,
    }
  }
  return { label: 'Pendente', tone: 'blue' as const }
}

const productionPriorityForDueDate = (dueDate?: string): ProductionPriority => {
  const remainingDays = daysUntil(dueDate)
  if (remainingDays < 0) return 'Urgente'
  if (remainingDays <= 3) return 'Alta'
  if (remainingDays <= 7) return 'Normal'
  return 'Baixa'
}

const orderTimeline = (state: AppState, order: Order): OrderTimelineItem[] => {
  const op = state.productionOrders.find((item) => item.orderId === order.id)
  const firstLaunch = op?.launches?.[0]
  const lastLaunch = op?.launches?.[op.launches.length - 1]
  const deliveredSource = `Entrega ${order.id}`
  const delivered = order.status === 'Entregue' || state.inventoryEntries.some(
    (entry) => entry.kind === 'Saída PA' && entry.source === deliveredSource,
  )
  const productionStarted = Boolean(op?.startedAt || firstLaunch || op?.status === 'Em produção' || op?.status === 'Pausada' || op?.status === 'Finalizada')
  const productionDone = Boolean(op && (op.status === 'Finalizada' || op.produced >= op.qty || order.status === 'Pronto' || delivered))
  const approvalStatus = orderApprovalStatus(order)
  const priceApproved = orderPriceApproved(order)

  return [
    {
      label: `${order.documentType} criado`,
      detail: `${order.client} · ${order.qty} un`,
      date: order.orderDate,
      status: 'done',
    },
    {
      label: 'Preço conferido',
      detail:
        approvalStatus === 'Pendente'
          ? 'Aguardando aprovação administrativa'
          : approvalStatus === 'Recusada'
            ? 'Preço recusado; precisa de nova negociação'
            : approvalStatus === 'Aprovada'
              ? `Desconto aprovado por ${order.pricing?.approvedBy ?? 'Admin'}`
              : 'Preço dentro do limite',
      date: order.pricing?.approvedAt ?? order.pricing?.requestedAt,
      status: priceApproved ? 'done' : approvalStatus === 'Recusada' ? 'pending' : 'current',
    },
    {
      label: order.documentType === 'Pedido' ? 'Estoque reservado' : 'Aguardando confirmação',
      detail:
        order.documentType === 'Orçamento'
          ? 'Orçamentos não comprometem o estoque'
          : order.reservationStatus === 'Liberado'
            ? 'Reserva liberada'
            : orderIsReserved(order)
              ? `${order.qty} un comprometidas para este pedido`
              : 'Aguardando liberação do preço',
      date: order.reservedAt ?? order.availabilityCheckedAt,
      status:
        order.documentType === 'Orçamento'
          ? 'pending'
          : orderIsReserved(order)
            ? 'done'
            : order.reservationStatus === 'Liberado'
              ? 'done'
              : 'current',
    },
    {
      label: 'Produção gerada',
      detail: op ? `${op.id} criada para o pedido` : 'Aguardando criação da produção',
      date: op?.startedAt || order.orderDate,
      status: op ? 'done' : priceApproved && order.status === 'Aberto' ? 'current' : 'pending',
    },
    {
      label: 'Produção iniciada',
      detail: op
        ? productionStarted
          ? `${op.responsible || 'Equipe'} iniciou ou recebeu a produção`
          : 'Produção criada, ainda não iniciada'
        : 'Depende da ordem de produção',
      date: op?.startedAt || firstLaunch?.date,
      status: productionStarted ? 'done' : op ? 'current' : 'pending',
    },
    {
      label: 'Peças prontas',
      detail: op
        ? `${op.produced} de ${op.qty} un prontas${lastLaunch ? ` · último registro ${lastLaunch.qty} un` : ''}`
        : 'Ainda sem produção vinculada',
      date: op?.finishedAt || lastLaunch?.date,
      status: productionDone ? 'done' : productionStarted ? 'current' : 'pending',
    },
    {
      label: order.status === 'Cancelado' ? 'Pedido cancelado' : 'Pedido entregue',
      detail:
        order.status === 'Cancelado'
          ? `${order.cancellationReason || 'Cancelado sem justificativa antiga'}${order.cancelledBy ? ` · por ${order.cancelledBy}` : ''}`
          : delivered
            ? 'Produto saiu do estoque e pedido foi concluído'
            : 'Aguardando separação/entrega',
      date: order.cancelledAt,
      status: order.status === 'Cancelado' || delivered ? 'done' : order.status === 'Pronto' ? 'current' : 'pending',
    },
  ]
}

const sameUnit = (left: string, right: string) =>
  left.trim().toLowerCase() === right.trim().toLowerCase()

const measurementUnits = [
  { value: 'un', label: 'Unidade (un)' },
  { value: 'm', label: 'Metro (m)' },
  { value: 'cm', label: 'Centímetro (cm)' },
  { value: 'mm', label: 'Milímetro (mm)' },
  { value: 'kg', label: 'Quilo (kg)' },
  { value: 'g', label: 'Grama (g)' },
  { value: 'l', label: 'Litro (l)' },
  { value: 'ml', label: 'Mililitro (ml)' },
  { value: 'rolo', label: 'Rolo' },
  { value: 'pacote', label: 'Pacote' },
  { value: 'caixa', label: 'Caixa' },
  { value: 'par', label: 'Par' },
  { value: 'dz', label: 'Dúzia (dz)' },
]

const productCategorySuggestions = [
  'Conjunto',
  'Blusa',
  'Calça',
  'Vestido',
  'Scrub',
  'Jaleco',
  'Acessório',
]

const productModelSuggestions = [
  'Padrão',
  'Feminino',
  'Masculino',
  'Unissex',
  'Sob medida',
]

const productSizeSuggestions = ['PP', 'P', 'M', 'G', 'GG', 'XG', 'Único', 'Sob medida']

const productColorSuggestions = [
  'Preto',
  'Branco',
  'Azul marinho',
  'Azul claro',
  'Verde',
  'Vinho',
  'Rosa',
  'Cinza',
]

const productFabricSuggestions = [
  'Tecido principal',
  'Gabardine',
  'Oxford',
  'Tricoline',
  'Viscose',
  'Linho',
  'Malha',
]

const unitLabel = (unit: string) =>
  measurementUnits.find((item) => sameUnit(item.value, unit) || sameUnit(item.label, unit))?.label ?? unit

const purchaseToStockFactorFor = (material: RawMaterial | undefined, purchaseUnit: string) => {
  if (!material) return 1
  if (sameUnit(purchaseUnit, material.purchaseUnit)) return material.purchaseToStockFactor || 1
  if (sameUnit(purchaseUnit, material.unit)) return 1
  return material.purchaseToStockFactor || 1
}

const convertedStockQty = (qty: number, material: RawMaterial | undefined, purchaseUnit: string) =>
  qty * purchaseToStockFactorFor(material, purchaseUnit)

const rawMaterialCode = (material: RawMaterial | undefined) =>
  material?.code || material?.id.replace(/^mp-/, '').slice(0, 18).toUpperCase() || ''

const materialCode = (material: MaterialLine) =>
  material.rawMaterialId?.replace(/^mp-/, '').slice(0, 18).toUpperCase() ??
  material.id.replace(/^mat-/, '').slice(0, 18).toUpperCase()

const readInitialState = () => {
  if (typeof window === 'undefined') return initialState

  try {
    const saved = window.localStorage.getItem(storageKey)
    if (!saved) return initialState
    const normalized = normalizeState({ ...initialState, ...JSON.parse(saved) } as AppState)
    if (normalizedStoreEnabled) {
      normalized.users = normalized.users.map((user) => ({ ...user, password: '' }))
    }
    return normalized
  } catch {
    return initialState
  }
}

const materialLossFactor = (material: MaterialLine) => 1 + Math.max(0, material.expectedLoss ?? 0) / 100

const materialPlannedQty = (material: MaterialLine, productQty = 1) =>
  material.qty * materialLossFactor(material) * productQty

const materialPlannedCost = (material: MaterialLine, productQty = 1) =>
  materialPlannedQty(material, productQty) * material.unitCost

const isBelowMinimumStock = (quantity: number, minimumStock: number) =>
  minimumStock > 0 && quantity < minimumStock

const normalizedNameKey = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()

const productCost = (product: Product, variationId?: string) =>
  productMaterials(product, variationId).reduce((total, material) => total + materialPlannedCost(material), 0)

const inventoryKindSign = (kind: InventoryKind) =>
  kind === 'Entrada MP' ||
  kind === 'Entrada PA' ||
  kind === 'Ajuste entrada MP' ||
  kind === 'Ajuste entrada PA'
    ? 1
    : -1

const inventoryKindCategory = (kind: InventoryKind): InventoryCategory =>
  kind === 'Entrada MP' ||
  kind === 'Consumo MP' ||
  kind === 'Ajuste entrada MP' ||
  kind === 'Ajuste saída MP'
    ? 'Matéria-prima'
    : 'Produto acabado'

const inventoryKindDirection = (kind: InventoryKind) =>
  inventoryKindSign(kind) > 0 ? 'Entrada' : 'Saída'

const rawMaterialBalanceFromState = (state: AppState, itemName: string) =>
  state.inventoryEntries.reduce((total, entry) => {
    if (entry.item !== itemName) return total
    if (inventoryKindCategory(entry.kind) === 'Matéria-prima') {
      return total + entry.qty * inventoryKindSign(entry.kind)
    }
    return total
  }, 0)

const productionOrderMissingMaterials = (state: AppState, product: Product, op: ProductionOrder) =>
  productMaterials(product, op.variationId)
    .map((material) => {
      const needed = materialPlannedQty(material, Math.max(0, op.qty - op.produced))
      const available = rawMaterialBalanceFromState(state, material.name)

      return {
        item: material.name,
        unit: material.unit,
        needed,
        available,
        missing: Math.max(0, needed - available),
      }
    })
    .filter((item) => item.missing > 0)

const idealPrice = (cost: number, tax: number, commission: number, fixedCost: number, profit: number) => {
  const divider = 1 - (tax + commission + fixedCost + profit) / 100
  return divider > 0 ? cost / divider : 0
}

const priceBreakdown = (
  cost: number,
  negotiatedPrice: number,
  tax: number,
  commission: number,
  fixedCost: number,
  desiredProfit: number,
  officialPrice = 0,
) => {
  const variableRate = Math.max(0, tax + commission + fixedCost)
  const minimumPrice = idealPrice(cost, tax, commission, fixedCost, 0)
  const suggestedPrice = idealPrice(cost, tax, commission, fixedCost, desiredProfit)
  const price = Math.max(0, negotiatedPrice)
  const variableValue = price * (variableRate / 100)
  const realProfit = price - cost - variableValue
  const realMargin = price > 0 ? (realProfit / price) * 100 : 0
  const discountPercent = officialPrice > 0
    ? Math.max(0, ((officialPrice - price) / officialPrice) * 100)
    : 0

  return {
    cost,
    minimumPrice,
    suggestedPrice,
    officialPrice,
    negotiatedPrice: price,
    tax,
    commission,
    fixedCost,
    desiredProfit,
    realProfit,
    realMargin,
    discountPercent,
  }
}

const priceNeedsApproval = (price: number, minimumPrice: number) =>
  price > 0 && price + 0.01 < minimumPrice

const orderApprovalStatus = (order: Order): PriceApprovalStatus =>
  order.pricing?.approvalStatus ?? 'Não necessária'

const orderPriceApproved = (order: Order) =>
  !priceNeedsApproval(
    order.pricing?.negotiatedPrice ?? order.unitPrice ?? 0,
    order.pricing?.minimumPrice ?? 0,
  ) || orderApprovalStatus(order) === 'Aprovada'

const productSalePrice = (product?: Product, variationId?: string) => {
  if (!product) return undefined
  const variation = productVariation(product, variationId)
  if (typeof variation?.salePrice === 'number' && Number.isFinite(variation.salePrice)) return variation.salePrice
  if (typeof product.salePrice === 'number' && Number.isFinite(product.salePrice)) return product.salePrice
  return undefined
}

const makeOrderPricing = (
  state: AppState,
  product: Product,
  variationId: string | undefined,
  negotiatedPrice: number,
  userName: string,
  canApprove: boolean,
): OrderPricing => {
  const officialPrice = productSalePrice(product, variationId) ?? 0
  const breakdown = priceBreakdown(
    productCost(product, variationId),
    negotiatedPrice,
    state.tax,
    state.commission,
    state.fixedCost,
    state.profit,
    officialPrice,
  )
  const needsApproval = priceNeedsApproval(negotiatedPrice, breakdown.minimumPrice)
  const approvalStatus: PriceApprovalStatus = needsApproval
    ? canApprove
      ? 'Aprovada'
      : 'Pendente'
    : 'Não necessária'
  const now = new Date().toISOString()

  return {
    ...breakdown,
    approvalStatus,
    requestedBy: needsApproval ? userName : undefined,
    requestedAt: needsApproval ? now : undefined,
    approvedBy: needsApproval && canApprove ? userName : undefined,
    approvedAt: needsApproval && canApprove ? now : undefined,
  }
}

const orderUnitPrice = (state: AppState, order: Order) => {
  if (typeof order.unitPrice === 'number' && Number.isFinite(order.unitPrice)) return order.unitPrice
  const product = state.products.find((item) => item.id === order.productId)
  return productSalePrice(product, order.variationId) ?? (product ? idealPrice(productCost(product, order.variationId), state.tax, state.commission, state.fixedCost, state.profit) : 0)
}

const orderPricingDetails = (state: AppState, order: Order): OrderPricing => {
  if (order.pricing) return order.pricing
  const product = state.products.find((item) => item.id === order.productId)
  const negotiatedPrice = orderUnitPrice(state, order)
  const breakdown = priceBreakdown(
    product ? productCost(product, order.variationId) : 0,
    negotiatedPrice,
    state.tax,
    state.commission,
    state.fixedCost,
    state.profit,
    productSalePrice(product, order.variationId) ?? 0,
  )

  return {
    ...breakdown,
    approvalStatus: 'Não necessária',
  }
}

const orderTotal = (state: AppState, order: Order) => order.qty * orderUnitPrice(state, order)

const orderIsReserved = (order: Order) =>
  order.documentType === 'Pedido' &&
  order.status !== 'Entregue' &&
  order.status !== 'Cancelado' &&
  (order.reservationStatus ?? 'Reservado') === 'Reservado' &&
  orderPriceApproved(order)

const newOrderHistoryEvent = (
  type: OrderHistoryEvent['type'],
  detail: string,
  user: string,
): OrderHistoryEvent => ({
  id: `HIS-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  type,
  detail,
  date: new Date().toISOString(),
  user,
})

const documentBrand = (brand?: BrandName, company?: CompanySettings) => {
  const isSchon = brand?.toLowerCase().includes('sch')
  const companyName = company?.name || 'Maçaroca'
  const companyLogo = company?.logoUrl || logoMacaroca

  return {
    logo: isSchon ? logoSchon : companyLogo,
    name: isSchon ? 'Schön Medical' : companyName,
    subtitle: isSchon ? `by ${companyName}` : 'Você tem o poder',
    darkLogo: !isSchon && !company?.logoUrl,
  }
}

const colorPreview = (color: string) => {
  const normalized = color
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

  if (normalized.includes('marinho')) return '#1b2a4a'
  if (normalized.includes('azul')) return '#2f69b1'
  if (normalized.includes('preto')) return '#151515'
  if (normalized.includes('branco') || normalized.includes('off')) return '#f7f2ea'
  if (normalized.includes('verde')) return '#4f7f5d'
  if (normalized.includes('vermelho')) return '#9f2732'
  if (normalized.includes('rosa')) return '#d9a2ad'
  if (normalized.includes('bege') || normalized.includes('nude')) return '#d9c0a3'
  if (normalized.includes('cinza')) return '#8a8a8a'
  return '#d1d5db'
}

const allAreas: Area[] = [
  'inicio',
  'plano-geral',
  'modulo-vendas',
  'modulo-producao',
  'modulo-estoque',
  'modulo-cadastros',
  'modulo-gestao',
  'ajuda',
  'painel',
  'indicadores',
  'implantacao',
  'vendas',
  'entregas',
  'producao-necessidades',
  'produtos',
  'produto-guiado',
  'materias',
  'fornecedores',
  'clientes',
  'marcas',
  'precos',
  'usuarios',
  'configuracoes',
  'pedido-guiado',
  'producao-guiada',
  'notas',
  'pedidos',
  'producao',
  'estoque',
  'movimentacoes',
  'financeiro',
  'historico',
]

const roleAreaAccess: Record<UserRole, Area[]> = {
  Admin: allAreas,
  Sócia: [
    'inicio',
    'plano-geral',
    'modulo-vendas',
    'modulo-producao',
    'modulo-estoque',
    'modulo-cadastros',
    'modulo-gestao',
    'ajuda',
    'implantacao',
    'vendas',
    'entregas',
    'pedido-guiado',
    'producao-necessidades',
    'producao',
    'producao-guiada',
    'estoque',
    'produto-guiado',
    'produtos',
    'clientes',
    'configuracoes',
    'pedidos',
  ],
  Comercial: ['inicio', 'plano-geral', 'modulo-vendas', 'modulo-estoque', 'modulo-gestao', 'ajuda', 'implantacao', 'vendas', 'entregas', 'pedido-guiado', 'pedidos', 'clientes', 'estoque', 'configuracoes'],
  Produção: ['inicio', 'plano-geral', 'modulo-producao', 'modulo-estoque', 'modulo-gestao', 'ajuda', 'implantacao', 'producao-necessidades', 'producao', 'producao-guiada', 'estoque', 'configuracoes'],
  Financeiro: [
    'inicio',
    'plano-geral',
    'modulo-vendas',
    'modulo-estoque',
    'modulo-cadastros',
    'modulo-gestao',
    'ajuda',
    'vendas',
    'entregas',
    'pedidos',
    'clientes',
    'estoque',
    'movimentacoes',
    'notas',
    'fornecedores',
    'precos',
    'financeiro',
    'indicadores',
    'implantacao',
    'historico',
    'configuracoes',
  ],
}

const roleDescriptions: Record<UserRole, string> = {
  Admin: 'Acesso total: cadastros, preços, usuários, compras, estoque, produção e financeiro.',
  Sócia: 'Rotina principal: pedidos, cadastro guiado de peças, entregas, produção e consulta de estoque.',
  Comercial: 'Foco em clientes, vendas, pedidos, entregas e consulta de disponibilidade.',
  Produção: 'Foco em ordens abertas, necessidades de produção, apontamentos e estoque.',
  Financeiro: 'Foco em compras, entradas e saídas, notas, fornecedores e financeiro.',
}

const implementationAreas = [
  { id: 'responsavel-vendas', area: 'Vendas e orçamentos' },
  { id: 'responsavel-producao', area: 'Produção' },
  { id: 'responsavel-compras', area: 'Compras e recebimentos' },
  { id: 'responsavel-entregas', area: 'Separação e entregas' },
  { id: 'responsavel-inventario', area: 'Estoque e inventário' },
] as const

const implementationSteps: {
  id: string
  title: string
  detail: string
  action: string
  target: Area
  roles: UserRole[]
}[] = [
  {
    id: 'revisar-manual',
    title: 'Revisar o manual',
    detail: 'Busque uma dúvida e confirme que os passos estão claros.',
    action: 'Abrir manual',
    target: 'ajuda',
    roles: ['Admin', 'Sócia', 'Comercial', 'Produção', 'Financeiro'],
  },
  {
    id: 'primeiro-pedido',
    title: 'Registrar o primeiro pedido',
    detail: 'Escolha cliente, produto, quantidade, preço e prazo.',
    action: 'Treinar pedido',
    target: 'pedido-guiado',
    roles: ['Admin', 'Sócia', 'Comercial'],
  },
  {
    id: 'primeira-producao',
    title: 'Registrar a primeira produção',
    detail: 'Selecione uma OP e informe somente o que ficou pronto.',
    action: 'Treinar produção',
    target: 'producao-guiada',
    roles: ['Admin', 'Sócia', 'Produção'],
  },
  {
    id: 'primeira-compra',
    title: 'Registrar a primeira compra',
    detail: 'Crie ou receba uma compra de matéria-prima.',
    action: 'Treinar compra',
    target: 'notas',
    roles: ['Admin', 'Financeiro'],
  },
  {
    id: 'primeira-entrega',
    title: 'Concluir a primeira entrega',
    detail: 'Separe o pedido pronto, registre a saída e conclua.',
    action: 'Treinar entrega',
    target: 'entregas',
    roles: ['Admin', 'Sócia', 'Comercial'],
  },
  {
    id: 'inventario-inicial',
    title: 'Fazer o inventário inicial',
    detail: 'Conte os materiais e produtos para estabelecer o saldo real.',
    action: 'Abrir inventário',
    target: 'estoque',
    roles: ['Admin'],
  },
]

const helpGuides: HelpGuide[] = [
  {
    id: 'implantacao-equipe',
    category: 'Começar a usar',
    title: 'Como concluir o treinamento do sistema',
    summary: 'Acompanhe a rotina de cada pessoa até que ela consiga trabalhar sem ajuda.',
    keywords: ['implantação', 'treinamento', 'sócia', 'responsabilidade', 'teste real', 'primeiro uso'],
    target: 'implantacao',
    action: 'Abrir implantação',
    steps: [
      'Abra Gestão e escolha Implantação com a equipe.',
      'Confirme que cada pessoa possui seu próprio usuário.',
      'Defina uma responsável para vendas, produção, compras, entregas e inventário.',
      'Escolha a pessoa que será treinada e siga uma atividade por vez.',
      'Abra a atividade, realize uma situação real e volte para marcar como concluída.',
      'Registre dúvidas ou textos confusos no campo de dúvidas recorrentes.',
      'Conclua o inventário físico para estabelecer o estoque inicial real.',
      'A implantação termina quando todas as pessoas completarem sua rotina.',
    ],
  },
  {
    id: 'usar-indicadores',
    category: 'Gestão',
    title: 'Como usar os indicadores',
    summary: 'Encontre atrasos, perdas, estoque parado e diferenças de preço e abra a ação correta.',
    keywords: ['indicador', 'atraso', 'estoque parado', 'desperdício', 'margem', 'prazo médio', 'mais vendido'],
    target: 'indicadores',
    action: 'Abrir indicadores',
    steps: [
      'Abra Gestão e escolha Indicadores.',
      'Comece por Atenção agora para ver pedidos e produções que exigem decisão.',
      'Use Produção para comparar o planejado com o realizado e conferir perdas e prazo médio.',
      'Use Produtos e margem para ver os mais vendidos, a margem e a diferença entre preço oficial e vendido.',
      'Use Estoque para ver itens críticos ou sem movimentação.',
      'Em cada linha, escolha a ação indicada para abrir diretamente a área onde o problema pode ser resolvido.',
    ],
  },
  {
    id: 'novo-orcamento',
    category: 'Vendas',
    title: 'Como criar um orçamento',
    summary: 'Registre uma proposta sem gerar produção ou reservar estoque.',
    keywords: ['orçamento', 'proposta', 'cliente', 'preço', 'imprimir'],
    target: 'pedido-guiado',
    action: 'Criar orçamento',
    steps: [
      'Abra Vendas e escolha Criar orçamento ou pedido.',
      'Siga os passos Cliente, Produto, Quantidade e Preço.',
      'Informe pagamento e entrega mesmo que ainda estejam A combinar.',
      'Confira a disponibilidade. O orçamento não reservará o estoque.',
      'Revise o resumo e escolha Salvar como orçamento.',
      'Use Prévia para revisar e depois imprimir ou baixar o documento.',
    ],
  },
  {
    id: 'novo-pedido',
    category: 'Vendas',
    title: 'Como registrar um pedido',
    summary: 'Cadastre a venda com o preço real negociado e verifique o estoque.',
    keywords: ['pedido', 'venda', 'cliente', 'valor', 'preço negociado'],
    target: 'pedido-guiado',
    action: 'Registrar pedido',
    steps: [
      'Abra Vendas e escolha Criar orçamento ou pedido.',
      'Escolha o cliente, o produto e a variação.',
      'Informe quantidade e preço unitário negociado.',
      'Defina pagamento, entrega, endereço e prazo.',
      'Confira disponível, reservado e quantidade que falta produzir.',
      'Revise o resumo e escolha Confirmar como pedido.',
      'O estoque será reservado e o sistema mostrará a próxima ação.',
    ],
  },
  {
    id: 'duplicar-orcamento',
    category: 'Vendas',
    title: 'Como duplicar ou transformar um orçamento',
    summary: 'Reaproveite uma proposta e confirme a venda quando o cliente aprovar.',
    keywords: ['duplicar', 'copiar', 'transformar', 'virar pedido', 'aprovar orçamento'],
    target: 'pedidos',
    action: 'Ver orçamentos',
    steps: [
      'Abra Vendas e entre em Acompanhar vendas.',
      'Localize o orçamento desejado.',
      'Use Duplicar orçamento para criar uma nova proposta sem alterar a original.',
      'Use Virar pedido quando o cliente confirmar a compra.',
      'Ao virar pedido, o sistema registra o financeiro e reserva o estoque disponível.',
    ],
  },
  {
    id: 'cancelar-pedido',
    category: 'Vendas',
    title: 'Como cancelar um orçamento ou pedido',
    summary: 'Cancele sem apagar o histórico e libere o estoque reservado.',
    keywords: ['cancelar', 'cancelamento', 'motivo', 'justificativa', 'liberar reserva'],
    target: 'pedidos',
    action: 'Ver vendas',
    steps: [
      'Abra Vendas e localize o documento.',
      'Escolha Cancelar com motivo.',
      'Explique por que o documento está sendo cancelado.',
      'Confirme o cancelamento.',
      'O financeiro será retirado, a reserva será liberada e o motivo ficará no histórico.',
    ],
  },
  {
    id: 'definir-preco',
    category: 'Preços',
    title: 'Como definir o preço de uma peça',
    summary: 'Use custo, comissão, despesas e lucro para chegar ao preço oficial.',
    keywords: ['preço', 'markup', 'lucro', 'comissão', 'custo', 'margem'],
    target: 'precos',
    action: 'Abrir preços',
    steps: [
      'Confirme primeiro se a ficha da peça possui todas as matérias-primas.',
      'Abra Gestão e entre em Preços de venda.',
      'Escolha a peça e a variação.',
      'Revise custo, comissão, custos fixos e lucro desejado.',
      'Compare preço mínimo, preço sugerido e preço oficial.',
      'Salve o preço oficial. No pedido ele ainda poderá ser negociado.',
    ],
  },
  {
    id: 'aprovar-desconto',
    category: 'Preços',
    title: 'Como aprovar um desconto abaixo do mínimo',
    summary: 'Revise a margem antes de liberar o pedido para financeiro e produção.',
    keywords: ['aprovação', 'desconto', 'abaixo do mínimo', 'margem', 'negociação'],
    target: 'pedidos',
    action: 'Revisar pedidos',
    steps: [
      'Abra Vendas e entre em Orçamentos e pedidos.',
      'Localize o documento marcado como Preço aguardando aprovação.',
      'Confira preço mínimo, preço negociado, desconto e margem real.',
      'Escolha Aprovar preço para liberar o fluxo ou Recusar para devolver à negociação.',
      'Se o preço for alterado para um valor acima do mínimo, a autorização deixa de ser necessária.',
    ],
  },
  {
    id: 'gerar-producao',
    category: 'Produção',
    title: 'Como mandar um pedido para produção',
    summary: 'Produza somente o que falta depois de descontar o estoque disponível.',
    keywords: ['PCP', 'produção', 'pedido', 'estoque', 'falta', 'OP'],
    target: 'producao-necessidades',
    action: 'Ver o que produzir',
    steps: [
      'Abra Produção e escolha O que precisa produzir.',
      'Veja os pedidos ordenados pelo prazo e a prioridade sugerida.',
      'Confira pendente, físico, reservado, disponível, produzindo e falta produzir.',
      'Selecione um ou vários pedidos.',
      'Revise ou edite a quantidade sugerida para cada OP.',
      'Confira a lista consolidada de matéria-prima e o que falta comprar.',
      'Gere as OPs selecionadas. Cada ordem continuará vinculada ao seu pedido.',
    ],
  },
  {
    id: 'op-estoque',
    category: 'Produção',
    title: 'Como criar uma produção para estoque',
    summary: 'Crie uma OP sem pedido relacionado para repor produtos acabados.',
    keywords: ['OP', 'estoque', 'reposição', 'produção livre'],
    target: 'producao',
    action: 'Abrir ordens',
    steps: [
      'Abra Produção e entre em Ordens de produção.',
      'Escolha Nova ordem para estoque.',
      'Selecione produto, variação e quantidade planejada.',
      'Defina prioridade, responsável e prazo.',
      'Confira se existe matéria-prima suficiente.',
      'Salve e imprima a OP para acompanhar a execução.',
    ],
  },
  {
    id: 'registrar-producao',
    category: 'Produção',
    title: 'Como registrar o que foi produzido',
    summary: 'Informe apenas as peças que realmente ficaram prontas naquele lançamento.',
    keywords: ['apontamento', 'produzi hoje', 'peça pronta', 'baixa', 'material'],
    target: 'producao-guiada',
    action: 'Registrar produção',
    steps: [
      'Abra Produção e escolha Registrar produção.',
      'Selecione a ordem de produção aberta.',
      'Informe quantas peças ficaram prontas agora.',
      'Confira os materiais que serão descontados do estoque.',
      'Confirme o lançamento com seu usuário.',
      'Quando atingir a quantidade total, conclua a produção.',
    ],
  },
  {
    id: 'comprar-material',
    category: 'Estoque',
    title: 'Como criar um pedido de compra',
    summary: 'Transforme a necessidade de material em uma encomenda ao fornecedor.',
    keywords: ['compra', 'pedido de compra', 'comprar', 'tecido', 'matéria-prima', 'fornecedor'],
    target: 'notas',
    action: 'Ver o que comprar',
    steps: [
      'Abra Estoque e compras e escolha Compras de matéria-prima.',
      'Na aba O que comprar, veja OPs, pedidos futuros, estoque mínimo e materiais já encomendados.',
      'No material desejado, escolha Pedir.',
      'Confira fornecedor, quantidade sugerida, unidade de compra, custo e previsão de chegada.',
      'Crie o pedido de compra.',
      'O material ficará como A caminho, sem aumentar o estoque antes de chegar.',
    ],
  },
  {
    id: 'receber-material',
    category: 'Estoque',
    title: 'Como receber uma compra parcial ou total',
    summary: 'Registre somente a quantidade que realmente chegou.',
    keywords: ['recebimento', 'chegou', 'nota', 'parcial', 'total', 'conta a pagar'],
    target: 'notas',
    action: 'Registrar recebimento',
    steps: [
      'Abra Compras de matéria-prima e escolha Recebimentos.',
      'Selecione o pedido que está aguardando material.',
      'Informe a nota, a data e a quantidade recebida.',
      'Revise o custo real e o vencimento da conta.',
      'Confira a conversão para a unidade usada no estoque.',
      'Confirme o recebimento.',
      'O sistema atualizará estoque, custo médio e conta a pagar; se faltar material, o pedido continuará Parcial.',
    ],
  },
  {
    id: 'conferir-resultado',
    category: 'Financeiro',
    title: 'Como conferir se um pedido deu lucro',
    summary: 'Compare o custo previsto com o material realmente utilizado na produção.',
    keywords: ['lucro real', 'lucro estimado', 'pedido', 'margem', 'custo realizado'],
    target: 'financeiro',
    action: 'Ver resultados',
    steps: [
      'Abra Gestão e escolha Financeiro.',
      'Entre na guia Pedidos e produtos.',
      'Localize o pedido ou produto desejado.',
      'Compare custo estimado, custo realizado, lucro previsto e lucro real.',
      'Se aparecer Aguardando produção, registre a produção ou a entrega para formar o custo real.',
      'Use a margem real para identificar quais produtos e negociações são mais saudáveis.',
    ],
  },
  {
    id: 'registrar-pagamento',
    category: 'Financeiro',
    title: 'Como registrar um pagamento ou recebimento',
    summary: 'Atualize o caixa sem perder o vínculo com pedidos e compras.',
    keywords: ['receber', 'pagar', 'conta', 'fluxo de caixa', 'vencimento', 'comissão'],
    target: 'financeiro',
    action: 'Abrir financeiro',
    steps: [
      'Abra Gestão e escolha Financeiro.',
      'Na Visão geral, confira valores a receber e contas a pagar.',
      'Use Marcar recebida ou Marcar paga no lançamento desejado.',
      'Para uma despesa nova, abra Lançamentos e informe categoria, data e valor.',
      'Use a categoria Comissão para pagamentos de comissão.',
      'Confira o efeito na guia Fluxo de caixa e no mês correto.',
    ],
  },
  {
    id: 'conferir-estoque',
    category: 'Estoque',
    title: 'Como conferir o estoque',
    summary: 'Entenda o físico, o reservado para pedidos e o saldo disponível.',
    keywords: ['estoque', 'saldo', 'reservado', 'disponível', 'baixo'],
    target: 'estoque',
    action: 'Conferir estoque',
    steps: [
      'Abra Estoque e compras e entre em Estoque atual.',
      'Escolha Matéria-prima ou Produto acabado.',
      'No produto, compare físico, pendente, produzindo e disponível.',
      'Lembre que pedidos pendentes reduzem o disponível.',
      'Produções só aumentam o físico após o registro das peças prontas.',
      'Use os alertas para ver o que precisa ser comprado.',
    ],
  },
  {
    id: 'ajustar-estoque',
    category: 'Estoque',
    title: 'Como corrigir uma diferença de estoque',
    summary: 'Registre uma correção justificada sem apagar o histórico anterior.',
    keywords: ['ajuste', 'corrigir', 'diferença', 'entrada', 'saída', 'justificativa'],
    target: 'movimentacoes',
    action: 'Fazer ajuste',
    steps: [
      'O administrador abre Estoque e compras e entra em Entradas e saídas.',
      'Escolha Novo ajuste.',
      'Selecione matéria-prima ou produto acabado e depois o item.',
      'Escolha Entrada para aumentar ou Saída para reduzir o saldo.',
      'Informe a quantidade e descreva obrigatoriamente o motivo.',
      'Confira o saldo físico atual e confirme o ajuste.',
      'A correção ficará registrada com data, usuário e justificativa.',
    ],
  },
  {
    id: 'contar-inventario',
    category: 'Estoque',
    title: 'Como fazer uma contagem de inventário',
    summary: 'Compare o saldo do sistema com a quantidade encontrada fisicamente.',
    keywords: ['inventário', 'contagem', 'contar', 'físico', 'conferência', 'diferença'],
    target: 'estoque',
    action: 'Fazer inventário',
    steps: [
      'O administrador abre Estoque atual e escolhe a aba Inventário.',
      'Selecione matéria-prima ou produto acabado e depois o item.',
      'Conte fisicamente o item e informe a quantidade encontrada.',
      'Confira a diferença calculada pelo sistema.',
      'Se houver diferença, descreva obrigatoriamente o motivo.',
      'Confirme a contagem para registrar o inventário e o ajuste correspondente.',
      'A contagem ficará no histórico com o saldo anterior, o contado e a diferença.',
    ],
  },
  {
    id: 'historico-estoque',
    category: 'Estoque',
    title: 'Como descobrir por que o estoque mudou',
    summary: 'Veja todas as entradas, saídas, produções, entregas e ajustes de um item.',
    keywords: ['histórico', 'movimento', 'movimentação', 'quem alterou', 'saldo', 'rastrear'],
    target: 'movimentacoes',
    action: 'Ver histórico',
    steps: [
      'Abra Estoque e compras e entre em Entradas e saídas.',
      'Mantenha selecionada a aba Histórico.',
      'Escolha o item que deseja conferir.',
      'Leia cada entrada ou saída em ordem, com data, origem e usuário.',
      'Compras aumentam matéria-prima; produção consome material e adiciona produto pronto.',
      'Entregas retiram produto acabado; ajustes mostram a justificativa informada.',
      'Use essa sequência para explicar qualquer diferença encontrada no saldo.',
    ],
  },
  {
    id: 'entregar-pedido',
    category: 'Vendas',
    title: 'Como separar e entregar um pedido',
    summary: 'Finalize o fluxo registrando a saída do produto acabado.',
    keywords: ['entrega', 'separação', 'saída', 'pedido pronto', 'concluir'],
    target: 'entregas',
    action: 'Ver entregas',
    steps: [
      'Abra Vendas e entre em Separação e entrega.',
      'Localize o pedido com status Pronto.',
      'Confira cliente, produto, quantidade e endereço.',
      'Separe fisicamente as peças.',
      'Registre a saída do estoque.',
      'Marque o pedido como Entregue para retirá-lo das pendências.',
    ],
  },
  {
    id: 'cadastrar-produto',
    category: 'Cadastros',
    title: 'Como cadastrar uma peça e sua ficha',
    summary: 'Crie produto, variações e os materiais consumidos em cada unidade.',
    keywords: ['produto', 'peça', 'ficha técnica', 'tamanho', 'cor', 'material'],
    target: 'produto-guiado',
    action: 'Cadastrar produto',
    steps: [
      'Abra Cadastros e escolha Cadastrar peça passo a passo.',
      'Informe marca, nome, categoria, descrição e uma foto ou referência.',
      'Descreva o modelo, tamanho, cor, tecido e medidas dessa versão.',
      'Escolha somente matérias-primas já cadastradas.',
      'Informe o consumo e a perda prevista de cada material para uma peça.',
      'Confira o resumo. A sócia salva como rascunho e o administrador pode aprovar e definir o preço.',
    ],
  },
  {
    id: 'cadastrar-material',
    category: 'Cadastros',
    title: 'Como cadastrar matéria-prima e conversão',
    summary: 'Defina como o material é comprado e como é consumido na produção.',
    keywords: ['matéria-prima', 'kg', 'metro', 'unidade', 'conversão', 'tecido'],
    target: 'materias',
    action: 'Cadastrar material',
    steps: [
      'Abra Cadastros e escolha Matérias-primas.',
      'Informe nome, categoria e fornecedor padrão.',
      'Escolha a unidade de compra, como kg.',
      'Escolha a unidade de uso, como metro.',
      'Informe a conversão, por exemplo: 1 kg rende 3 m.',
      'Defina custo e estoque mínimo, simule a conversão e salve.',
    ],
  },
  {
    id: 'usuarios-senha',
    category: 'Acesso',
    title: 'Como cadastrar usuário ou trocar senha',
    summary: 'Crie um acesso individual e mantenha cada lançamento identificado.',
    keywords: ['usuário', 'login', 'senha', 'sócia', 'permissão', 'perfil'],
    target: 'usuarios',
    action: 'Gerenciar usuários',
    steps: [
      'O administrador abre Gestão e entra em Usuários e permissões.',
      'Informe o nome, crie uma senha e escolha o perfil.',
      'Salve e entregue as credenciais somente para aquela pessoa.',
      'Cada usuária deve entrar usando o próprio nome e senha.',
      'Para trocar a própria senha, abra Conta no topo da tela.',
      'Informe a senha atual, a nova senha e confirme a alteração.',
    ],
  },
]

const areaAllowedForRole = (role: UserRole, area: Area) =>
  (roleAreaAccess[role] ?? roleAreaAccess.Sócia).includes(area)

export default function SistemaMacaroca() {
  const [state, setState] = useState<AppState>(readInitialState)
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('Carregando')
  const [syncDetail, setSyncDetail] = useState('Conectando ao banco compartilhado...')
  const [lastCloudSync, setLastCloudSync] = useState('')
  const [loggedUserId, setLoggedUserId] = useState('')
  const [authReady, setAuthReady] = useState(!normalizedStoreEnabled)
  const [authProfile, setAuthProfile] = useState<ErpProfile | null>(null)
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([])
  const [loginName, setLoginName] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [guideSearch, setGuideSearch] = useState('')
  const [activeArea, setActiveArea] = useState<Area>('plano-geral')
  const [selectedProductId, setSelectedProductId] = useState(
    state.products.find((product) => product.id === 'produto-conj-base')?.id ?? state.products[0]?.id ?? '',
  )
  const [selectedVariationId, setSelectedVariationId] = useState('')
  const [message, setMessage] = useState('Tudo certo por aqui.')
  const [newProductBrand, setNewProductBrand] = useState<BrandName>('Schön Medical')
  const [newProductName, setNewProductName] = useState('Novo modelo')
  const [newProductCategory] = useState('Peça sob demanda')
  const [guidedProductStep, setGuidedProductStep] = useState(1)
  const [guidedProductBrand, setGuidedProductBrand] = useState<BrandName>('Maçaroca')
  const [guidedProductName, setGuidedProductName] = useState('')
  const [guidedProductCategory, setGuidedProductCategory] = useState('Peça')
  const [guidedProductDescription, setGuidedProductDescription] = useState('')
  const [guidedProductReference, setGuidedProductReference] = useState('')
  const [guidedProductModel, setGuidedProductModel] = useState('')
  const [guidedProductSize, setGuidedProductSize] = useState('')
  const [guidedProductColor, setGuidedProductColor] = useState('')
  const [guidedProductFabric, setGuidedProductFabric] = useState('')
  const [guidedProductMeasurements, setGuidedProductMeasurements] = useState('')
  const [guidedProductNotes, setGuidedProductNotes] = useState('')
  const [guidedProductPrice, setGuidedProductPrice] = useState(0)
  const [guidedProductActive, setGuidedProductActive] = useState(true)
  const [guidedSheetStatus, setGuidedSheetStatus] = useState<TechnicalSheetStatus>('Rascunho')
  const [guidedProductMaterials, setGuidedProductMaterials] = useState<MaterialLine[]>(() => {
    const material = state.rawMaterials[0]
    return material
      ? [{
          id: `mat-guiado-${Date.now()}`,
          rawMaterialId: material.id,
          name: material.name,
          qty: 1,
          unit: material.unit,
          unitCost: material.avgCost,
          expectedLoss: material.expectedLoss ?? 0,
        }]
      : []
  })
  const [newVariationSize, setNewVariationSize] = useState('M')
  const [newVariationColor, setNewVariationColor] = useState('Preto')
  const [newVariationFabric, setNewVariationFabric] = useState('Tecido principal')
  const [newVariationMeasurements, setNewVariationMeasurements] = useState('Medidas da peça')
  const [newVariationNotes, setNewVariationNotes] = useState('Observação técnica da variação')
  const [newVariationReference, setNewVariationReference] = useState('')
  const [newMaterialName, setNewMaterialName] = useState('Nova matéria-prima')
  const [newMaterialCode, setNewMaterialCode] = useState(() => nextRawMaterialCode(state.rawMaterials))
  const [newMaterialStockLocation, setNewMaterialStockLocation] = useState('')
  const [newMaterialCategory, setNewMaterialCategory] = useState('Matéria-prima')
  const [newMaterialUnit, setNewMaterialUnit] = useState('m')
  const [newMaterialPurchaseUnit, setNewMaterialPurchaseUnit] = useState('kg')
  const [newMaterialPurchaseFactor, setNewMaterialPurchaseFactor] = useState(3)
  const [newMaterialCost, setNewMaterialCost] = useState(0)
  const [newMaterialMinimum, setNewMaterialMinimum] = useState(10)
  const [newMaterialExpectedLoss, setNewMaterialExpectedLoss] = useState(0)
  const [newMaterialSupplier, setNewMaterialSupplier] = useState('Fornecedor de tecidos')
  const [newMaterialSimulationQty, setNewMaterialSimulationQty] = useState(1)
  const [newSupplierName, setNewSupplierName] = useState('Novo fornecedor')
  const [newSupplierContact, setNewSupplierContact] = useState('WhatsApp / telefone')
  const [newCustomerName, setNewCustomerName] = useState('Novo cliente')
  const [newCustomerPhone, setNewCustomerPhone] = useState('WhatsApp / telefone')
  const [newCustomerCity, setNewCustomerCity] = useState('Cidade')
  const [newCustomerNotes, setNewCustomerNotes] = useState('Observações do cliente')
  const [newBrandName, setNewBrandName] = useState('Nova marca')
  const [newBrandPrefix, setNewBrandPrefix] = useState('NM')
  const [newUserName, setNewUserName] = useState('Nova sócia')
  const [newUserPassword, setNewUserPassword] = useState('')
  const [newUserRole, setNewUserRole] = useState<UserRole>('Sócia')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newAccountPassword, setNewAccountPassword] = useState('')
  const [confirmAccountPassword, setConfirmAccountPassword] = useState('')
  const [noteNumber, setNoteNumber] = useState('0002')
  const [noteSupplier, setNoteSupplier] = useState('Fornecedor de tecidos')
  const [noteDate, setNoteDate] = useState(currentDateValue())
  const [noteDueDate, setNoteDueDate] = useState(datePlusDaysValue(30))
  const [noteItem, setNoteItem] = useState('Tecido principal')
  const [noteQty, setNoteQty] = useState(10)
  const [noteUnit, setNoteUnit] = useState('kg')
  const [noteUnitCost, setNoteUnitCost] = useState(55500)
  const [purchaseView, setPurchaseView] = useState<'necessidades' | 'pedidos' | 'recebimentos'>('necessidades')
  const [purchaseMaterialId, setPurchaseMaterialId] = useState(state.rawMaterials[0]?.id ?? '')
  const [purchaseSupplier, setPurchaseSupplier] = useState(state.rawMaterials[0]?.supplier ?? state.suppliers[0]?.name ?? '')
  const [purchaseQty, setPurchaseQty] = useState(1)
  const [purchaseUnitCost, setPurchaseUnitCost] = useState(
    (state.rawMaterials[0]?.avgCost ?? 0) *
      purchaseToStockFactorFor(state.rawMaterials[0], state.rawMaterials[0]?.purchaseUnit ?? 'un'),
  )
  const [purchaseExpectedDate, setPurchaseExpectedDate] = useState(datePlusDaysValue(7))
  const [purchaseNotes, setPurchaseNotes] = useState('')
  const [receivingPurchaseOrderId, setReceivingPurchaseOrderId] = useState('')
  const [receiptNumber, setReceiptNumber] = useState('')
  const [receiptDate, setReceiptDate] = useState(currentDateValue())
  const [receiptQty, setReceiptQty] = useState(0)
  const [receiptUnitCost, setReceiptUnitCost] = useState(0)
  const [receiptDueDate, setReceiptDueDate] = useState(datePlusDaysValue(30))
  const [cancelPurchaseOrderId, setCancelPurchaseOrderId] = useState<string | null>(null)
  const [purchaseCancellationReason, setPurchaseCancellationReason] = useState('')
  const [selectedCustomerId, setSelectedCustomerId] = useState(state.customers[0]?.id ?? '')
  const [orderDocumentType, setOrderDocumentType] = useState<OrderDocumentType>('Pedido')
  const [orderDate, setOrderDate] = useState(currentDateValue())
  const [orderQty, setOrderQty] = useState(10)
  const [orderUnitPriceInput, setOrderUnitPriceInput] = useState(0)
  const [orderDueDate, setOrderDueDate] = useState(datePlusDaysValue(15))
  const [orderNotes, setOrderNotes] = useState('Observações do pedido')
  const [orderPaymentMethod, setOrderPaymentMethod] = useState<PaymentMethod>('Pix')
  const [orderPaymentStatus, setOrderPaymentStatus] = useState<PaymentStatus>('Pendente')
  const [orderPaymentNotes, setOrderPaymentNotes] = useState('')
  const [orderDeliveryMethod, setOrderDeliveryMethod] = useState<DeliveryMethod>('Retirada')
  const [orderDeliveryAddress, setOrderDeliveryAddress] = useState('')
  const [orderDeliveryDate, setOrderDeliveryDate] = useState(datePlusDaysValue(15))
  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null)
  const [cancellationReason, setCancellationReason] = useState('')
  const [productionDecisionOrderId, setProductionDecisionOrderId] = useState<string | null>(null)
  const [productionDecisionQty, setProductionDecisionQty] = useState(1)
  const [pcpSelectedOrderIds, setPcpSelectedOrderIds] = useState<string[]>([])
  const [pcpOrderQuantities, setPcpOrderQuantities] = useState<Record<string, number>>({})
  const [stockOpQty, setStockOpQty] = useState(12)
  const [stockOpResponsible, setStockOpResponsible] = useState('')
  const [stockOpStartDate, setStockOpStartDate] = useState(currentDateValue())
  const [stockOpNotes, setStockOpNotes] = useState('Produção para reposição de estoque')
  const [stockOpPriority, setStockOpPriority] = useState<ProductionPriority>('Normal')
  const [financeKind, setFinanceKind] = useState<CashKind>('Saída')
  const [financeCategory, setFinanceCategory] = useState<FinanceCategory>('Despesa fixa')
  const [financeDescription, setFinanceDescription] = useState('Despesa operacional')
  const [financeValue, setFinanceValue] = useState(250000)
  const [financeDueDate, setFinanceDueDate] = useState(currentDateValue())
  const [financePaid, setFinancePaid] = useState(true)
  const [financeView, setFinanceView] = useState<FinanceView>('resumo')
  const [financeMonth, setFinanceMonth] = useState(currentMonthValue())
  const [indicatorView, setIndicatorView] = useState<IndicatorView>('atencao')
  const [indicatorMonth, setIndicatorMonth] = useState(currentMonthValue())
  const [implementationView, setImplementationView] = useState<ImplementationView>('resumo')
  const [implementationUserId, setImplementationUserId] = useState('')
  const [implementationQuestion, setImplementationQuestion] = useState('')
  const [sidebarCompact, setSidebarCompact] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [moduleContext, setModuleContext] = useState<Area | null>(null)
  const [productionLaunches, setProductionLaunches] = useState<Record<string, number>>({})
  const [guidedOrderStep, setGuidedOrderStep] = useState(1)
  const [guidedOpId, setGuidedOpId] = useState(state.productionOrders.find((op) => op.status !== 'Finalizada')?.id ?? '')
  const [guidedProductionQty, setGuidedProductionQty] = useState(1)
  const [guidedProductionType, setGuidedProductionType] = useState<ProductionEventType>('Produção')
  const [guidedProductionNotes, setGuidedProductionNotes] = useState('')
  const [stockView, setStockView] = useState<'acabados' | 'materias' | 'inventario'>('acabados')
  const [movementView, setMovementView] = useState<'historico' | 'ajuste'>('historico')
  const [inventoryHistoryItem, setInventoryHistoryItem] = useState('Todos')
  const [adjustmentCategory, setAdjustmentCategory] = useState<InventoryCategory>('Matéria-prima')
  const [adjustmentItem, setAdjustmentItem] = useState(state.rawMaterials[0]?.name ?? '')
  const [adjustmentDirection, setAdjustmentDirection] = useState<'Entrada' | 'Saída'>('Entrada')
  const [adjustmentQty, setAdjustmentQty] = useState(1)
  const [adjustmentReason, setAdjustmentReason] = useState('')
  const [countCategory, setCountCategory] = useState<InventoryCategory>('Matéria-prima')
  const [countItem, setCountItem] = useState(state.rawMaterials[0]?.name ?? '')
  const [countedQty, setCountedQty] = useState(0)
  const [countNotes, setCountNotes] = useState('')
  const [previewOpId, setPreviewOpId] = useState<string | null>(null)
  const [previewOrderId, setPreviewOrderId] = useState<string | null>(null)
  const [printOpId, setPrintOpId] = useState<string | null>(null)
  const [printOrderId, setPrintOrderId] = useState<string | null>(null)
  const loggedUser = authProfile
    ? {
        id: authProfile.id,
        name: authProfile.username,
        password: '',
        role: authProfile.role,
      }
    : state.users.find((user) => user.id === loggedUserId)
  const userRole = normalizeUserRole(loggedUser?.role)
  const currentUserName = loggedUser?.name ?? 'Sistema'
  const canSeeMoney = userRole === 'Admin' || userRole === 'Financeiro'
  const canNegotiatePrice =
    userRole === 'Admin' || userRole === 'Financeiro' || userRole === 'Comercial' || userRole === 'Sócia'
  const canApproveDiscount = userRole === 'Admin'
  const canManagePurchases = userRole === 'Admin' || userRole === 'Financeiro'
  const canDeleteRecords = userRole === 'Admin'
  const canAdjustInventory = userRole === 'Admin'
  const selectedImplementationUserId =
    userRole === 'Admin'
      ? implementationUserId || state.users[0]?.id || ''
      : loggedUser?.id ?? ''
  const selectedImplementationUser =
    state.users.find((user) => user.id === selectedImplementationUserId) ?? loggedUser
  const selectedImplementationRole = normalizeUserRole(selectedImplementationUser?.role)
  const selectedImplementationSteps = implementationSteps.filter((step) =>
    step.roles.includes(selectedImplementationRole),
  )
  const selectedImplementationCompleted = new Set(
    state.implementationProgress
      .filter((progress) => progress.userId === selectedImplementationUserId)
      .map((progress) => progress.stepId),
  )
  const canAccessArea = (area: Area) =>
    authProfile?.mustChangePassword
      ? area === 'configuracoes' || area === 'ajuda'
      : areaAllowedForRole(userRole, area)
  const companyLogo = state.company.logoUrl || logoMacaroca
  const cloudLoadedRef = useRef(false)
  const applyingCloudStateRef = useRef(false)
  const lastSavedStateRef = useRef('')
  const lastCloudUpdatedAtRef = useRef('')
  const latestStateRef = useRef(state)
  const normalizedLoadedRef = useRef(false)
  const normalizedVersionsRef = useRef<VersionMap>({})
  const normalizedSavedStateRef = useRef<AppState | null>(null)
  const normalizedSavingRef = useRef(false)
  const normalizedDirtyRef = useRef(false)
  const normalizedPendingStateRef = useRef<AppState | null>(null)
  const normalizedReloadTimerRef = useRef<number | null>(null)

  useEffect(() => {
    latestStateRef.current = state
    window.localStorage.setItem(storageKey, JSON.stringify(state))
  }, [state])

  const explainSyncError = (error: unknown) => {
    if (error && typeof error === 'object' && 'message' in error) {
      return String((error as { message?: unknown }).message)
    }
    return ''
  }

  const loadNormalizedState = useCallback(async (detail = 'Dados seguros carregados do banco.') => {
    if (!normalizedStoreEnabled) return false

    try {
      setSyncStatus('Carregando')
      const loaded = await loadErpState(erpEnvironment, initialState as unknown as Record<string, unknown>)
      const nextState = normalizeState({ ...initialState, ...loaded.state } as AppState, false)

      normalizedVersionsRef.current = loaded.versions
      normalizedSavedStateRef.current = nextState
      normalizedLoadedRef.current = true
      normalizedDirtyRef.current = false
      applyingCloudStateRef.current = true
      latestStateRef.current = nextState
      setState(nextState)
      setAuditEvents(loaded.audit)
      setLastCloudSync(loaded.updatedAt || new Date().toISOString())
      window.localStorage.setItem(storageKey, JSON.stringify(nextState))
      setSyncStatus('Compartilhado')
      setSyncDetail(detail)
      return true
    } catch (error) {
      normalizedLoadedRef.current = false
      setSyncStatus('Erro')
      setSyncDetail(`Não foi possível abrir os dados seguros.${explainSyncError(error) ? ` Detalhe: ${explainSyncError(error)}` : ''}`)
      return false
    }
  }, [])

  const persistNormalizedState = useCallback(async (requestedState: AppState) => {
    normalizedPendingStateRef.current = requestedState
    if (normalizedSavingRef.current) return

    normalizedSavingRef.current = true

    while (normalizedPendingStateRef.current) {
      const nextState = normalizedPendingStateRef.current
      normalizedPendingStateRef.current = null
      const previousState = normalizedSavedStateRef.current

      if (!previousState) continue

      try {
        setSyncStatus('Salvando')
        const result = await saveErpChanges(
          erpEnvironment,
          previousState as unknown as Record<string, unknown>,
          nextState as unknown as Record<string, unknown>,
          normalizedVersionsRef.current,
        )

        normalizedVersionsRef.current = result.versions
        normalizedSavedStateRef.current = nextState
        normalizedDirtyRef.current = false
        lastSavedStateRef.current = JSON.stringify(nextState)
        const savedAt = new Date().toISOString()
        setLastCloudSync(savedAt)
        setSyncStatus('Compartilhado')
        setSyncDetail(result.changed ? 'Alterações salvas com histórico e identificação do usuário.' : 'Dados conferidos.')
      } catch (error) {
        const detail = explainSyncError(error)
        const conflict = detail.includes('CONFLICT') || detail.toLowerCase().includes('conflict')

        setSyncStatus('Erro')
        setSyncDetail(
          conflict
            ? 'Outra pessoa alterou este registro primeiro. Recarreguei a versão mais recente para evitar perda.'
            : `Não foi possível salvar a alteração.${detail ? ` Detalhe: ${detail}` : ''}`,
        )
        await loadNormalizedState(
          conflict
            ? 'Versão mais recente carregada. Confira o registro antes de tentar novamente.'
            : 'Dados recarregados após uma falha de gravação.',
        )
        normalizedPendingStateRef.current = null
        normalizedDirtyRef.current = false
      }
    }

    normalizedSavingRef.current = false
  }, [loadNormalizedState])

  useEffect(() => {
    if (!normalizedStoreEnabled) return
    let active = true

    const applySession = async (userId?: string) => {
      if (!active) return

      if (!userId) {
        setAuthProfile(null)
        setLoggedUserId('')
        setAuthReady(true)
        normalizedLoadedRef.current = false
        setSyncStatus('Carregando')
        setSyncDetail('Entre para acessar os dados compartilhados.')
        return
      }

      try {
        const profile = await loadProfile(userId)
        if (!active) return
        setAuthProfile(profile)
        setLoggedUserId(profile.id)
        setAuthReady(true)
      } catch (error) {
        if (!active) return
        setAuthProfile(null)
        setLoggedUserId('')
        setAuthReady(true)
        setLoginError(`Acesso sem perfil ativo.${explainSyncError(error) ? ` Detalhe: ${explainSyncError(error)}` : ''}`)
        await supabase.auth.signOut()
      }
    }

    void supabase.auth.getSession().then(({ data }) => {
      void applySession(data.session?.user.id)
    })

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      void applySession(session?.user.id)
    })

    return () => {
      active = false
      authListener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!normalizedStoreEnabled || !authProfile) return
    void loadNormalizedState(
      authProfile.mustChangePassword
        ? 'Primeiro acesso confirmado. Crie uma nova senha para continuar.'
        : 'Dados seguros carregados e sincronizados.',
    ).then(() => {
      if (authProfile.mustChangePassword) {
        setActiveArea('configuracoes')
        setMessage('Por segurança, troque a senha temporária antes de usar o sistema.')
      } else {
        setActiveArea('inicio')
        setMessage(`Olá, ${authProfile.username}. Escolha uma rotina para começar.`)
      }
    })
  }, [authProfile, loadNormalizedState])

  useEffect(() => {
    if (!normalizedStoreEnabled || !authProfile || !normalizedLoadedRef.current) return

    if (applyingCloudStateRef.current) {
      applyingCloudStateRef.current = false
      return
    }

    if (JSON.stringify(state) === JSON.stringify(normalizedSavedStateRef.current)) return

    normalizedDirtyRef.current = true
    const timeout = window.setTimeout(() => {
      void persistNormalizedState(state)
    }, 450)

    return () => window.clearTimeout(timeout)
  }, [authProfile, persistNormalizedState, state])

  useEffect(() => {
    if (!normalizedStoreEnabled || !authProfile) return

    const scheduleReload = () => {
      if (normalizedReloadTimerRef.current) window.clearTimeout(normalizedReloadTimerRef.current)
      normalizedReloadTimerRef.current = window.setTimeout(() => {
        if (normalizedSavingRef.current || normalizedDirtyRef.current) {
          scheduleReload()
          return
        }
        void loadNormalizedState('Atualização recebida de outro aparelho.')
      }, 350)
    }

    const channel = supabase
      .channel(`macaroca-erp-records-${erpEnvironment}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'erp_records', filter: `environment=eq.${erpEnvironment}` },
        scheduleReload,
      )
      .subscribe()

    const checkForChanges = () => {
      if (!normalizedSavingRef.current && !normalizedDirtyRef.current) {
        void loadNormalizedState('Dados conferidos com o banco compartilhado.')
      }
    }
    const interval = window.setInterval(checkForChanges, 12000)
    window.addEventListener('focus', checkForChanges)
    document.addEventListener('visibilitychange', checkForChanges)

    return () => {
      if (normalizedReloadTimerRef.current) window.clearTimeout(normalizedReloadTimerRef.current)
      window.clearInterval(interval)
      window.removeEventListener('focus', checkForChanges)
      document.removeEventListener('visibilitychange', checkForChanges)
      supabase.removeChannel(channel)
    }
  }, [authProfile, loadNormalizedState])

  const applyCloudState = useCallback((cloudData: Partial<AppState>, updatedAt?: string, detail = 'Dados atualizados do banco compartilhado.') => {
    const cloudUpdatedAt = updatedAt ?? new Date().toISOString()
    const lastUpdatedAt = lastCloudUpdatedAtRef.current

    if (lastUpdatedAt && new Date(cloudUpdatedAt).getTime() <= new Date(lastUpdatedAt).getTime()) {
      return false
    }

    const nextState = normalizeState({ ...initialState, ...cloudData } as AppState)
    const serialized = JSON.stringify(nextState)

    lastCloudUpdatedAtRef.current = cloudUpdatedAt
    lastSavedStateRef.current = serialized
    setLastCloudSync(cloudUpdatedAt)

    if (serialized !== JSON.stringify(latestStateRef.current)) {
      applyingCloudStateRef.current = true
      setState(nextState)
      window.localStorage.setItem(storageKey, serialized)
    }

    setSyncStatus('Compartilhado')
    setSyncDetail(detail)
    return true
  }, [])

  const saveStateImmediately = async (nextState: AppState, successDetail = 'Dados sincronizados para todas as usuárias.') => {
    if (normalizedStoreEnabled) {
      normalizedDirtyRef.current = true
      setState(nextState)
      await persistNormalizedState(nextState)
      setSyncDetail(successDetail)
      return
    }

    const serialized = JSON.stringify(nextState)
    const savedAt = new Date().toISOString()
    window.localStorage.setItem(storageKey, serialized)

    if (!cloudLoadedRef.current) {
      lastSavedStateRef.current = serialized
      return
    }

    try {
      setSyncStatus('Salvando')
      const { error } = await (supabase as any)
        .from(cloudStateTable)
        .upsert({
          id: cloudStateId,
          state: nextState,
          updated_at: savedAt,
        })

      if (error) {
        setSyncStatus('Local')
        setSyncDetail(`Não foi possível salvar no banco compartilhado. A alteração ficou neste navegador.${explainSyncError(error) ? ` Detalhe: ${explainSyncError(error)}` : ''}`)
        return
      }

      lastSavedStateRef.current = serialized
      lastCloudUpdatedAtRef.current = savedAt
      setLastCloudSync(savedAt)
      setSyncStatus('Compartilhado')
      setSyncDetail(successDetail)
    } catch (error) {
      setSyncStatus('Local')
      setSyncDetail(`Sem conexão com o banco compartilhado. A alteração ficou neste navegador.${explainSyncError(error) ? ` Detalhe: ${explainSyncError(error)}` : ''}`)
    }
  }

  const toggleImplementationStep = (stepId: string) => {
    if (!selectedImplementationUserId) return
    const existing = state.implementationProgress.find(
      (progress) =>
        progress.userId === selectedImplementationUserId &&
        progress.stepId === stepId,
    )
    if (existing && userRole !== 'Admin') {
      setMessage('Atividade concluída. Peça ao Admin para reabrir o treinamento se precisar refazê-la.')
      return
    }
    const nextState: AppState = {
      ...state,
      implementationProgress: existing
        ? state.implementationProgress.filter((progress) => progress.id !== existing.id)
        : [
            ...state.implementationProgress,
            {
              id: `implantacao-${selectedImplementationUserId}-${stepId}`,
              userId: selectedImplementationUserId,
              stepId,
              completedAt: new Date().toISOString(),
              completedBy: currentUserName,
            },
          ],
    }
    setState(nextState)
    void saveStateImmediately(nextState, 'Progresso do treinamento atualizado para toda a equipe.')
    setMessage(existing ? 'Atividade reaberta para novo treinamento.' : 'Atividade marcada como concluída.')
  }

  const assignImplementationResponsibility = (responsibilityId: string, area: string, userId: string) => {
    if (userRole !== 'Admin') return
    const nextState: AppState = {
      ...state,
      implementationResponsibilities: [
        ...state.implementationResponsibilities.filter(
          (responsibility) => responsibility.id !== responsibilityId,
        ),
        ...(userId ? [{ id: responsibilityId, area, userId }] : []),
      ],
    }
    setState(nextState)
    void saveStateImmediately(nextState, 'Responsabilidades da equipe atualizadas.')
    setMessage(userId ? 'Responsável definido para esta rotina.' : 'Responsabilidade removida.')
  }

  const addImplementationQuestion = () => {
    const text = implementationQuestion.trim()
    if (!text) {
      setMessage('Escreva a dúvida ou o trecho confuso antes de registrar.')
      return
    }
    const nextState: AppState = {
      ...state,
      implementationQuestions: [
        {
          id: `duvida-${Date.now()}`,
          text,
          createdAt: new Date().toISOString(),
          createdBy: currentUserName,
          resolved: false,
        },
        ...state.implementationQuestions,
      ],
    }
    setState(nextState)
    setImplementationQuestion('')
    void saveStateImmediately(nextState, 'Dúvida registrada para revisão da equipe.')
    setMessage('Dúvida registrada para a equipe revisar.')
  }

  const toggleImplementationQuestion = (questionId: string) => {
    if (userRole !== 'Admin') return
    const nextState: AppState = {
      ...state,
      implementationQuestions: state.implementationQuestions.map((question) =>
        question.id === questionId
          ? {
              ...question,
              resolved: !question.resolved,
              resolvedAt: !question.resolved ? new Date().toISOString() : undefined,
              resolvedBy: !question.resolved ? currentUserName : undefined,
            }
          : question,
      ),
    }
    setState(nextState)
    void saveStateImmediately(nextState, 'Situação da dúvida atualizada.')
    setMessage('Situação da dúvida atualizada.')
  }

  const loadCloudState = useCallback(
    async (options: { quiet?: boolean; createWhenEmpty?: boolean } = {}) => {
      try {
        if (!options.quiet) setSyncStatus('Carregando')

        const { data, error } = await (supabase as any)
          .from(cloudStateTable)
          .select('state, updated_at')
          .eq('id', cloudStateId)
          .maybeSingle()

        if (error) {
          setSyncStatus('Local')
          setSyncDetail(`Banco compartilhado não respondeu. O sistema está salvando neste navegador.${explainSyncError(error) ? ` Detalhe: ${explainSyncError(error)}` : ''}`)
          cloudLoadedRef.current = true
          return false
        }

        cloudLoadedRef.current = true

        if (data?.state) {
          const updated = applyCloudState(
            data.state,
            data.updated_at ?? undefined,
            options.quiet ? 'Atualização automática recebida.' : 'Dados carregados do banco compartilhado.',
          )

          if (!updated && !options.quiet) {
            setSyncStatus('Compartilhado')
            setSyncDetail('Este aparelho já está com a versão mais recente.')
          }

          return true
        }

        setSyncStatus('Compartilhado')
        setSyncDetail('Banco conectado. Criando o primeiro backup compartilhado deste aparelho.')

        if (options.createWhenEmpty) {
          void saveStateImmediately(latestStateRef.current, 'Primeiro backup compartilhado criado.')
        }

        return true
      } catch (error) {
        setSyncStatus('Local')
        setSyncDetail(`Sem conexão com o banco compartilhado. Alterações ficam salvas neste navegador.${explainSyncError(error) ? ` Detalhe: ${explainSyncError(error)}` : ''}`)
        cloudLoadedRef.current = true
        return false
      }
    },
    [applyCloudState],
  )

  useEffect(() => {
    if (normalizedStoreEnabled) return
    let cancelled = false

    void loadCloudState({ createWhenEmpty: true }).then(() => {
      if (cancelled) return
    })

    return () => {
      cancelled = true
    }
  }, [loadCloudState])

  useEffect(() => {
    if (normalizedStoreEnabled) return
    if (!cloudLoadedRef.current) return

    const serialized = JSON.stringify(state)

    if (applyingCloudStateRef.current) {
      applyingCloudStateRef.current = false
      lastSavedStateRef.current = serialized
      return
    }

    if (serialized === lastSavedStateRef.current) return

    const timeout = window.setTimeout(async () => {
      try {
        const savedAt = new Date().toISOString()
        setSyncStatus('Salvando')
        const { error } = await (supabase as any)
          .from(cloudStateTable)
          .upsert({
            id: cloudStateId,
            state,
            updated_at: savedAt,
          })

        if (error) {
          setSyncStatus('Local')
          setSyncDetail(`Não foi possível salvar no banco compartilhado. Mantive uma cópia neste navegador.${explainSyncError(error) ? ` Detalhe: ${explainSyncError(error)}` : ''}`)
          return
        }

        lastSavedStateRef.current = serialized
        lastCloudUpdatedAtRef.current = savedAt
        setLastCloudSync(savedAt)
        setSyncStatus('Compartilhado')
        setSyncDetail('Dados sincronizados para todas as usuárias.')
      } catch (error) {
        setSyncStatus('Local')
        setSyncDetail(`Sem conexão com o banco compartilhado. Alterações ficam salvas neste navegador.${explainSyncError(error) ? ` Detalhe: ${explainSyncError(error)}` : ''}`)
      }
    }, 900)

    return () => window.clearTimeout(timeout)
  }, [currentUserName, state])

  useEffect(() => {
    if (normalizedStoreEnabled) return
    const channel = supabase
      .channel('macaroca-app-state')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: cloudStateTable, filter: `id=eq.${cloudStateId}` },
        (payload: any) => {
          const cloudData = payload.new?.state
          const updatedAt = payload.new?.updated_at
          if (!cloudData) return

          applyCloudState(cloudData, updatedAt ?? undefined, 'Atualização recebida de outro aparelho.')
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [applyCloudState])

  useEffect(() => {
    if (normalizedStoreEnabled) return
    const checkForCloudChanges = () => {
      void loadCloudState({ quiet: true })
    }

    const interval = window.setInterval(checkForCloudChanges, 5000)
    window.addEventListener('focus', checkForCloudChanges)
    document.addEventListener('visibilitychange', checkForCloudChanges)

    return () => {
      window.clearInterval(interval)
      window.removeEventListener('focus', checkForCloudChanges)
      document.removeEventListener('visibilitychange', checkForCloudChanges)
    }
  }, [loadCloudState])

  useEffect(() => {
    if (!canAccessArea(activeArea)) {
      setActiveArea(authProfile?.mustChangePassword ? 'configuracoes' : 'inicio')
      setMessage(
        authProfile?.mustChangePassword
          ? 'Troque a senha temporária para liberar o restante do sistema.'
          : `Perfil ${userRole}: ${roleDescriptions[userRole]}`,
      )
    }
  }, [activeArea, authProfile?.mustChangePassword, userRole])

  const selectedProduct =
    state.products.find((product) => product.id === selectedProductId) ?? state.products[0]
  const selectedVariation = productVariation(selectedProduct, selectedVariationId)
  const activeVariationId = selectedVariation?.id
  const selectedCustomer =
    state.customers.find((customer) => customer.id === selectedCustomerId) ?? state.customers[0]
  const selectedNoteMaterial = state.rawMaterials.find((material) => material.name === noteItem)
  const noteStockQty = convertedStockQty(noteQty, selectedNoteMaterial, noteUnit)
  const noteStockUnit = selectedNoteMaterial?.unit ?? noteUnit
  const selectedPurchaseMaterial =
    state.rawMaterials.find((material) => material.id === purchaseMaterialId) ??
    state.rawMaterials[0]
  const selectedReceivingPurchaseOrder =
    state.purchaseOrders.find(
      (order) =>
        order.id === receivingPurchaseOrderId &&
        (order.status === 'Enviado' || order.status === 'Parcial'),
    ) ??
    state.purchaseOrders.find((order) => order.status === 'Enviado' || order.status === 'Parcial')
  const selectedReceivingMaterial = selectedReceivingPurchaseOrder
    ? state.rawMaterials.find(
        (material) =>
          material.id === selectedReceivingPurchaseOrder.rawMaterialId ||
          material.name === selectedReceivingPurchaseOrder.item,
      )
    : undefined
  const selectedReceivingPendingQty = selectedReceivingPurchaseOrder
    ? Math.max(0, selectedReceivingPurchaseOrder.qty - selectedReceivingPurchaseOrder.receivedQty)
    : 0
  const newMaterialFactor = Math.max(newMaterialPurchaseFactor || 1, 0.0001)
  const newMaterialStockCost = newMaterialCost / newMaterialFactor
  const newMaterialSimulationCost = newMaterialSimulationQty * newMaterialStockCost
  const selectedCost = selectedProduct ? productCost(selectedProduct, activeVariationId) : 0
  const selectedPrice = idealPrice(selectedCost, state.tax, state.commission, state.fixedCost, state.profit)
  const selectedMinimumPrice = idealPrice(selectedCost, state.tax, state.commission, state.fixedCost, 0)
  const selectedSalePrice = productSalePrice(selectedProduct, activeVariationId)
  const guidedProductCost = guidedProductMaterials.reduce(
    (total, material) => total + materialPlannedCost(material),
    0,
  )
  const guidedSuggestedPrice = idealPrice(
    guidedProductCost,
    state.tax,
    state.commission,
    state.fixedCost,
    state.profit,
  )
  const guidedMinimumPrice = idealPrice(
    guidedProductCost,
    state.tax,
    state.commission,
    state.fixedCost,
    0,
  )
  const guidedPriceSummary = priceBreakdown(
    guidedProductCost,
    guidedProductPrice,
    state.tax,
    state.commission,
    state.fixedCost,
    state.profit,
    guidedProductPrice,
  )
  const guidedProductReadyForSale =
    guidedSheetStatus === 'Aprovada' &&
    guidedProductPrice > 0 &&
    guidedProductMaterials.length > 0 &&
    guidedProductMaterials.every((material) => material.qty > 0)
  const selectedOrderPrice = selectedSalePrice ?? selectedPrice
  const finalOrderUnitPrice = Math.max(0, orderUnitPriceInput)
  const currentOrderPricing = priceBreakdown(
    selectedCost,
    finalOrderUnitPrice,
    state.tax,
    state.commission,
    state.fixedCost,
    state.profit,
    selectedSalePrice ?? 0,
  )
  const currentOrderNeedsApproval = priceNeedsApproval(finalOrderUnitPrice, selectedMinimumPrice)
  const selectedVariationMaterials = selectedVariation ? productMaterials(selectedProduct, selectedVariation.id) : []
  const openProductionOrders = state.productionOrders.filter((op) => op.status !== 'Finalizada')
  const guidedOp = openProductionOrders.find((op) => op.id === guidedOpId) ?? openProductionOrders[0]
  const guidedProduct = guidedOp ? state.products.find((product) => product.id === guidedOp.productId) : undefined
  const guidedOrder = guidedOp ? state.orders.find((order) => order.id === guidedOp.orderId) : undefined
  const guidedVariation = guidedProduct ? productVariation(guidedProduct, guidedOp?.variationId) : undefined
  const guidedProductImage = guidedVariation?.referenceImage || guidedProduct?.referenceImage || ''
  const guidedRemainingQty = guidedOp ? Math.max(0, guidedOp.qty - guidedOp.produced) : 0
  const guidedLaunchQty = Math.min(Math.max(0, guidedProductionQty), Math.max(1, guidedRemainingQty))
  const guidedDefectQty = guidedOp?.launches
    .filter((launch) => launch.type === 'Defeito' || launch.type === 'Perda')
    .reduce((total, launch) => total + launch.qty, 0) ?? 0
  const guidedReworkQty = guidedOp?.launches
    .filter((launch) => launch.type === 'Retrabalho')
    .reduce((total, launch) => total + launch.qty, 0) ?? 0

  useEffect(() => {
    setOrderUnitPriceInput(Math.round(selectedOrderPrice))
  }, [activeVariationId, selectedProductId, selectedOrderPrice])

  const totals = useMemo(() => {
    const income = state.cashEntries
      .filter((entry) => entry.kind === 'Entrada' && entry.paid)
      .reduce((sum, entry) => sum + entry.value, 0)
    const expenses = state.cashEntries
      .filter((entry) => entry.kind === 'Saída' && entry.paid)
      .reduce((sum, entry) => sum + entry.value, 0)
    return { income, expenses, balance: income - expenses }
  }, [state.cashEntries])
  const financeSummary = useMemo(() => {
    const byCategory = (category: FinanceCategory) =>
      state.cashEntries.filter((entry) => entry.category === category)
    const sum = (entries: CashEntry[]) => entries.reduce((total, entry) => total + entry.value, 0)
    const receivedSales = byCategory('Venda recebida').filter((entry) => entry.paid)
    const receivableSales = byCategory('Venda recebida').filter((entry) => !entry.paid)
    const accountsPayable = state.cashEntries.filter(
      (entry) => entry.kind === 'Saída' && (!entry.paid || entry.category === 'Conta a pagar'),
    )
    const rawMaterialPurchases = state.cashEntries.filter(
      (entry) =>
        entry.category === 'Compra de matéria-prima' ||
        entry.source === 'Compra de matéria-prima',
    )
    const fixedExpenses = byCategory('Despesa fixa')
    const orderResults = state.orders
      .filter((order) => order.documentType === 'Pedido' && order.status !== 'Cancelado')
      .map((order) => {
        const product = state.products.find((item) => item.id === order.productId)
        const pricing = orderPricingDetails(state, order)
        const price = orderUnitPrice(state, order)
        const revenue = price * order.qty
        const estimatedMaterialCost = pricing.cost * order.qty
        const taxCost = revenue * (pricing.tax / 100)
        const commissionCost = revenue * (pricing.commission / 100)
        const fixedCostShare = revenue * (pricing.fixedCost / 100)
        const estimatedProfit =
          revenue - estimatedMaterialCost - taxCost - commissionCost - fixedCostShare
        const relatedOps = state.productionOrders.filter((op) => op.orderId === order.id)
        const relatedOpIds = relatedOps.map((op) => op.id)
        const productionEntries = state.inventoryEntries.filter((entry) =>
          relatedOpIds.some((opId) => entry.source === opId || entry.source.startsWith(`${opId} ·`)),
        )
        const deliveryEntry = state.inventoryEntries.find(
          (entry) => entry.kind === 'Saída PA' && entry.source === `Entrega ${order.id}`,
        )
        const finishedProductionCost = productionEntries
          .filter((entry) => entry.kind === 'Entrada PA')
          .reduce((total, entry) => total + entry.value, 0)
        const abnormalLossCost = productionEntries
          .filter(
            (entry) =>
              entry.kind === 'Consumo MP' &&
              (entry.source.includes('Perda') || entry.source.includes('Defeito')),
          )
          .reduce((total, entry) => total + entry.value, 0)
        const realizedMaterialCost =
          (deliveryEntry?.value ?? finishedProductionCost) + abnormalLossCost
        const hasRealizedCost = Boolean(deliveryEntry || finishedProductionCost || abnormalLossCost)
        const realProfit = hasRealizedCost
          ? revenue - realizedMaterialCost - taxCost - commissionCost - fixedCostShare
          : 0
        const realMargin = hasRealizedCost && revenue > 0 ? (realProfit / revenue) * 100 : 0
        const resultDate =
          order.status === 'Entregue'
            ? order.deliveryDate || order.dueDate
            : order.orderDate

        return {
          order,
          product,
          revenue,
          estimatedMaterialCost,
          realizedMaterialCost,
          abnormalLossCost,
          costDifference: realizedMaterialCost - estimatedMaterialCost,
          estimatedProfit,
          realProfit,
          estimatedMargin: revenue > 0 ? (estimatedProfit / revenue) * 100 : 0,
          realMargin,
          taxCost,
          commissionCost,
          fixedCostShare,
          hasRealizedCost,
          resultDate,
        }
      })
    const monthEntries = state.cashEntries.filter((entry) =>
      isMonth(financeEntryDate(entry), financeMonth),
    )
    const monthReceived = monthEntries.filter((entry) => entry.kind === 'Entrada' && entry.paid)
    const monthPaid = monthEntries.filter((entry) => entry.kind === 'Saída' && entry.paid)
    const monthOrders = orderResults.filter((item) => isMonth(item.resultDate, financeMonth))
    const monthOrdersWithRealizedCost = monthOrders.filter((item) => item.hasRealizedCost).length
    const monthOrdersAwaitingRealizedCost = monthOrders.length - monthOrdersWithRealizedCost
    const allMonthCostsRealized =
      monthOrders.length === 0 || monthOrdersAwaitingRealizedCost === 0
    const monthRevenue = monthOrders.reduce((total, item) => total + item.revenue, 0)
    const monthEstimatedCost = monthOrders.reduce(
      (total, item) => total + item.estimatedMaterialCost,
      0,
    )
    const monthRealizedCost = monthOrders.reduce(
      (total, item) =>
        total + (item.hasRealizedCost ? item.realizedMaterialCost : item.estimatedMaterialCost),
      0,
    )
    const monthTaxes = monthOrders.reduce((total, item) => total + item.taxCost, 0)
    const monthCommissions = monthOrders.reduce((total, item) => total + item.commissionCost, 0)
    const monthFixedAllocation = monthOrders.reduce((total, item) => total + item.fixedCostShare, 0)
    const monthFixedExpenses = fixedExpenses
      .filter((entry) => entry.paid && isMonth(financeEntryDate(entry), financeMonth))
      .reduce((total, entry) => total + entry.value, 0)
    const fixedCostForResult = monthFixedExpenses || monthFixedAllocation
    const monthEstimatedProfit =
      monthRevenue - monthEstimatedCost - monthTaxes - monthCommissions - fixedCostForResult
    const monthRealProfit =
      monthRevenue - monthRealizedCost - monthTaxes - monthCommissions - fixedCostForResult
    const productResults = Array.from(
      orderResults.reduce((grouped, item) => {
        const key = `${item.order.productId}:${item.order.variationId ?? ''}`
        const current = grouped.get(key) ?? {
          key,
          product: item.product,
          variationId: item.order.variationId,
          orders: 0,
          qty: 0,
          revenue: 0,
          estimatedProfit: 0,
          realProfit: 0,
          realizedOrders: 0,
          realizedQty: 0,
          realizedRevenue: 0,
        }
        current.orders += 1
        current.qty += item.order.qty
        current.revenue += item.revenue
        current.estimatedProfit += item.estimatedProfit
        if (item.hasRealizedCost) {
          current.realProfit += item.realProfit
          current.realizedOrders += 1
          current.realizedQty += item.order.qty
          current.realizedRevenue += item.revenue
        }
        grouped.set(key, current)
        return grouped
      }, new Map<string, {
        key: string
        product?: Product
        variationId?: string
        orders: number
        qty: number
        revenue: number
        estimatedProfit: number
        realProfit: number
        realizedOrders: number
        realizedQty: number
        realizedRevenue: number
      }>()).values(),
    ).sort((a, b) => b.realProfit - a.realProfit)
    const overdueReceivables = receivableSales.filter(
      (entry) => entry.dueDate && daysUntil(entry.dueDate) < 0,
    )
    const overduePayables = accountsPayable.filter(
      (entry) => !entry.paid && entry.dueDate && daysUntil(entry.dueDate) < 0,
    )

    return {
      receivedSales,
      receivableSales,
      accountsPayable,
      rawMaterialPurchases,
      fixedExpenses,
      overdueReceivables,
      overduePayables,
      receivedSalesTotal: sum(receivedSales),
      receivedSalesMonthTotal: sum(
        receivedSales.filter((entry) => isCurrentMonth(financeEntryDate(entry))),
      ),
      receivableSalesTotal: sum(receivableSales),
      accountsPayableTotal: sum(accountsPayable.filter((entry) => !entry.paid)),
      rawMaterialPurchasesTotal: sum(rawMaterialPurchases),
      fixedExpensesTotal: sum(fixedExpenses),
      orderResults,
      productResults,
      estimatedProfitTotal: orderResults.reduce((total, item) => total + item.estimatedProfit, 0),
      monthEntries,
      monthReceivedTotal: sum(monthReceived),
      monthPaidTotal: sum(monthPaid),
      monthCashBalance: sum(monthReceived) - sum(monthPaid),
      monthRevenue,
      monthEstimatedCost,
      monthRealizedCost,
      monthTaxes,
      monthCommissions,
      monthFixedCost: fixedCostForResult,
      monthEstimatedProfit,
      monthRealProfit,
      monthOrdersWithRealizedCost,
      monthOrdersAwaitingRealizedCost,
      allMonthCostsRealized,
    }
  }, [financeMonth, state])

  const stock = useMemo(() => {
    const raw = new Map<string, { item: string; qty: number; unit: string; value: number }>()
    const finished = new Map<string, { item: string; qty: number; unit: string; value: number }>()

    state.inventoryEntries.forEach((entry) => {
      const isRaw = inventoryKindCategory(entry.kind) === 'Matéria-prima'
      const sign = inventoryKindSign(entry.kind)
      const group = isRaw ? raw : finished
      const current = group.get(entry.item) ?? {
        item: entry.item,
        qty: 0,
        unit: entry.unit,
        value: 0,
      }

      group.set(entry.item, {
        ...current,
        qty: current.qty + entry.qty * sign,
        value: current.value + entry.value * sign,
      })
    })

    const rawItems = Array.from(raw.values())
    const finishedItems = Array.from(finished.values())
    const rawValue = rawItems.reduce((sum, item) => sum + item.value, 0)
    const finishedValue = finishedItems.reduce((sum, item) => sum + item.value, 0)

    return { rawItems, finishedItems, rawValue, finishedValue }
  }, [state.inventoryEntries])
  const draftFinishedName = selectedProduct
    ? productFinishedItemName(selectedProduct, activeVariationId)
    : ''
  const draftPhysicalStock = draftFinishedName
    ? stock.finishedItems.find((item) => item.item === draftFinishedName)?.qty ?? 0
    : 0
  const draftReservedStock = selectedProduct
    ? state.orders
        .filter(
          (order) =>
            orderIsReserved(order) &&
            order.productId === selectedProduct.id &&
            (order.variationId ?? '') === (activeVariationId ?? ''),
        )
        .reduce((sum, order) => sum + order.qty, 0)
    : 0
  const draftAvailableStock = Math.max(0, draftPhysicalStock - draftReservedStock)
  const draftMissingStock = Math.max(0, orderQty - draftAvailableStock)
  const dashboard = useMemo(() => {
    const ordersToProduce = state.orders.filter(
      (order) =>
        order.documentType === 'Pedido' &&
        (order.status === 'Aberto' || order.status === 'Em produção'),
    )
    const activeOps = state.productionOrders.filter((op) => op.status === 'Em produção')
    const producedUnits = state.productionOrders.reduce((sum, op) => sum + op.produced, 0)
    const lowRaw = state.rawMaterials
      .map((material) => {
        const currentStock = stock.rawItems.find((item) => item.item === material.name)
        return {
          item: material.name,
          qty: currentStock?.qty ?? 0,
          unit: material.unit,
          minimumStock: material.minimumStock,
        }
      })
      .filter((item) => isBelowMinimumStock(item.qty, item.minimumStock))
    const lowFinished = stock.finishedItems.filter((item) => item.qty <= 2)

    return { ordersToProduce, activeOps, producedUnits, lowRaw, lowFinished }
  }, [state.orders, state.productionOrders, state.rawMaterials, stock.finishedItems, stock.rawItems])
  const finishedCatalog = useMemo(
    () =>
      state.products.flatMap((product) =>
        product.variations.length
          ? product.variations.map((variation) => ({
              key: `${product.id}:${variation.id}`,
              product,
              variationId: variation.id,
              item: productFinishedItemName(product, variation.id),
              label: productDisplayName(product, variation.id),
            }))
          : [{
              key: product.id,
              product,
              variationId: undefined,
              item: productFinishedItemName(product),
              label: productDisplayName(product),
            }],
      ),
    [state.products],
  )
  const finishedStockPositions = useMemo(
    () =>
      finishedCatalog.map((catalogItem) => {
        const physical = stock.finishedItems.find((item) => item.item === catalogItem.item)?.qty ?? 0
        const reserved = state.orders
          .filter(
            (order) =>
              orderIsReserved(order) &&
              order.productId === catalogItem.product.id &&
              (order.variationId ?? '') === (catalogItem.variationId ?? ''),
          )
          .reduce((sum, order) => sum + order.qty, 0)
        const producing = state.productionOrders
          .filter(
            (op) =>
              op.productId === catalogItem.product.id &&
              (op.variationId ?? '') === (catalogItem.variationId ?? '') &&
              op.status !== 'Finalizada',
          )
          .reduce((sum, op) => sum + Math.max(0, op.qty - op.produced), 0)

        return {
          ...catalogItem,
          physical,
          reserved,
          producing,
          available: Math.max(0, physical - reserved),
          shortage: Math.max(0, reserved - physical),
        }
      }),
    [finishedCatalog, state.orders, state.productionOrders, stock.finishedItems],
  )
  const rawStockPositions = useMemo(
    () =>
      state.rawMaterials.map((material) => {
        const physical = stock.rawItems.find((item) => item.item === material.name)?.qty ?? 0
        const committed = state.productionOrders
          .filter((op) => op.status !== 'Finalizada')
          .reduce((total, op) => {
            const product = state.products.find((item) => item.id === op.productId)
            const line = product
              ? productMaterials(product, op.variationId).find((item) => item.name === material.name)
              : undefined
            return total + (line ? materialPlannedQty(line, Math.max(0, op.qty - op.produced)) : 0)
          }, 0)
        return {
          item: material.name,
          unit: material.unit,
          minimumStock: material.minimumStock,
          physical,
          committed,
          available: Math.max(0, physical - committed),
          shortage: Math.max(0, committed - physical),
        }
      }),
    [state.productionOrders, state.products, state.rawMaterials, stock.rawItems],
  )
  const materialRegistrationIssues = useMemo(() => {
    const nameCounts = state.rawMaterials.reduce((counts, material) => {
      const key = normalizedNameKey(material.name)
      counts.set(key, (counts.get(key) ?? 0) + 1)
      return counts
    }, new Map<string, number>())
    const catalogByName = new Map(
      state.rawMaterials.map((material) => [normalizedNameKey(material.name), material]),
    )
    const technicalMaterials = state.products.flatMap((product) => {
      const variationIds = product.variations.length
        ? product.variations.map((variation) => variation.id)
        : [undefined]
      return variationIds.flatMap((variationId) => productMaterials(product, variationId))
    })
    const issues = state.rawMaterials.flatMap((material) => {
      const reasons: string[] = []
      const matchingTechnicalLines = technicalMaterials.filter(
        (line) => normalizedNameKey(line.name) === normalizedNameKey(material.name),
      )

      if ((nameCounts.get(normalizedNameKey(material.name)) ?? 0) > 1) {
        reasons.push('nome repetido no cadastro')
      }
      if (material.minimumStock <= 0) {
        reasons.push('estoque mínimo não definido')
      }
      if (!Number.isFinite(material.purchaseToStockFactor) || material.purchaseToStockFactor <= 0) {
        reasons.push('conversão de compra inválida')
      }
      if (matchingTechnicalLines.some((line) => line.unit !== material.unit)) {
        reasons.push('unidade diferente da ficha técnica')
      }

      return reasons.length
        ? [{
            key: `catalog:${material.id}`,
            item: material.name,
            reasons,
          }]
        : []
    })
    const missingCatalogItems = technicalMaterials
      .filter((line) => !catalogByName.has(normalizedNameKey(line.name)))
      .filter(
        (line, index, lines) =>
          lines.findIndex((candidate) => normalizedNameKey(candidate.name) === normalizedNameKey(line.name)) === index,
      )
      .map((line) => ({
        key: `technical:${normalizedNameKey(line.name)}`,
        item: line.name,
        reasons: ['usada em ficha técnica, mas não cadastrada como matéria-prima'],
      }))

    return [...issues, ...missingCatalogItems]
  }, [state.products, state.rawMaterials])
  const openPurchaseOrders = state.purchaseOrders.filter(
    (order) => order.status === 'Enviado' || order.status === 'Parcial',
  )
  const purchaseSuggestions = useMemo(() => {
    type Requirement = { qty: number; dueDate: string }
    const opRequirements = new Map<string, Requirement>()
    const futureRequirements = new Map<string, Requirement>()
    const addRequirement = (
      target: Map<string, Requirement>,
      material: MaterialLine,
      qty: number,
      dueDate?: string,
    ) => {
      const current = target.get(material.name) ?? { qty: 0, dueDate: '' }
      const nextDueDate =
        dueDate && (!current.dueDate || dueDate < current.dueDate)
          ? dueDate
          : current.dueDate
      target.set(material.name, {
        qty: current.qty + materialPlannedQty(material, qty),
        dueDate: nextDueDate,
      })
    }

    state.productionOrders
      .filter((op) => op.status !== 'Finalizada')
      .forEach((op) => {
        const product = state.products.find((item) => item.id === op.productId)
        const remaining = Math.max(0, op.qty - op.produced)
        if (!product || remaining <= 0) return
        const linkedOrder = state.orders.find((order) => order.id === op.orderId)
        productMaterials(product, op.variationId).forEach((material) =>
          addRequirement(opRequirements, material, remaining, linkedOrder?.dueDate || op.startDate),
        )
      })

    const futureGroups = new Map<string, Order[]>()
    state.orders
      .filter(
        (order) =>
          orderIsReserved(order) &&
          orderPriceApproved(order) &&
          (order.status === 'Aberto' || order.status === 'Em produção'),
      )
      .forEach((order) => {
        const key = `${order.productId}::${order.variationId ?? ''}`
        futureGroups.set(key, [...(futureGroups.get(key) ?? []), order])
      })

    futureGroups.forEach((orders, key) => {
      const [productId, variationId = ''] = key.split('::')
      const product = state.products.find((item) => item.id === productId)
      if (!product) return
      const finishedItem = productFinishedItemName(product, variationId || undefined)
      const physical = stock.finishedItems.find((item) => item.item === finishedItem)?.qty ?? 0
      const producing = state.productionOrders
        .filter(
          (op) =>
            op.productId === productId &&
            (op.variationId ?? '') === variationId &&
            op.status !== 'Finalizada',
        )
        .reduce((sum, op) => sum + Math.max(0, op.qty - op.produced), 0)
      const pending = orders.reduce((sum, order) => sum + order.qty, 0)
      const futureProductionQty = Math.max(0, pending - physical - producing)
      if (futureProductionQty <= 0) return
      const earliestDueDate = orders
        .map((order) => order.dueDate)
        .filter(Boolean)
        .sort()[0]
      productMaterials(product, variationId || undefined).forEach((material) =>
        addRequirement(futureRequirements, material, futureProductionQty, earliestDueDate),
      )
    })

    return state.rawMaterials
      .map((material) => {
        const opRequirement = opRequirements.get(material.name) ?? { qty: 0, dueDate: '' }
        const futureRequirement = futureRequirements.get(material.name) ?? { qty: 0, dueDate: '' }
        const physical = stock.rawItems.find((raw) => raw.item === material.name)?.qty ?? 0
        const onOrder = openPurchaseOrders
          .filter((order) => order.rawMaterialId === material.id || order.item === material.name)
          .reduce(
            (sum, order) =>
              sum +
              convertedStockQty(
                Math.max(0, order.qty - order.receivedQty),
                material,
                order.unit,
              ),
            0,
          )
        const totalDemand = opRequirement.qty + futureRequirement.qty
        const targetStock = totalDemand + material.minimumStock
        const missingBeforeOrders = Math.max(0, targetStock - physical)
        const suggestedStockQty = Math.max(0, missingBeforeOrders - onOrder)
        const conversionFactor = purchaseToStockFactorFor(material, material.purchaseUnit)
        const suggestedPurchaseQty =
          conversionFactor > 0
            ? Math.ceil((suggestedStockQty / conversionFactor) * 100) / 100
            : suggestedStockQty
        const needBy = [opRequirement.dueDate, futureRequirement.dueDate]
          .filter(Boolean)
          .sort()[0] ?? ''

        return {
          material,
          item: material.name,
          unit: material.unit,
          physical,
          requiredForOps: opRequirement.qty,
          requiredForFutureOrders: futureRequirement.qty,
          minimumStock: material.minimumStock,
          onOrder,
          suggestedStockQty,
          suggestedPurchaseQty,
          purchaseUnit: material.purchaseUnit,
          needBy,
        }
      })
      .filter((item) => item.suggestedStockQty > 0 || item.onOrder > 0)
  }, [
    openPurchaseOrders,
    state.orders,
    state.productionOrders,
    state.products,
    state.rawMaterials,
    stock.finishedItems,
    stock.rawItems,
  ])
  const rawInventoryItems = state.rawMaterials.map((material) => ({
    item: material.name,
    unit: material.unit,
  }))
  const finishedInventoryItems = finishedCatalog.map((catalogItem) => ({
    item: catalogItem.item,
    unit: 'un',
  }))
  const adjustmentItems = adjustmentCategory === 'Matéria-prima' ? rawInventoryItems : finishedInventoryItems
  const countItems = countCategory === 'Matéria-prima' ? rawInventoryItems : finishedInventoryItems
  const adjustmentSelection =
    adjustmentItems.find((item) => item.item === adjustmentItem) ?? adjustmentItems[0]
  const countSelection = countItems.find((item) => item.item === countItem) ?? countItems[0]
  const inventoryPhysicalQty = (category: InventoryCategory, item: string) => {
    const collection = category === 'Matéria-prima' ? stock.rawItems : stock.finishedItems
    return collection.find((entry) => entry.item === item)?.qty ?? 0
  }
  const countSystemQty = countSelection
    ? inventoryPhysicalQty(countCategory, countSelection.item)
    : 0
  const countDifference = countedQty - countSystemQty
  const inventoryHistoryItems = Array.from(
    new Set([
      ...rawInventoryItems.map((item) => item.item),
      ...finishedInventoryItems.map((item) => item.item),
      ...state.inventoryEntries.map((entry) => entry.item),
    ]),
  ).sort()
  const inventoryLedger = useMemo(() => {
    const balances = new Map<string, number>()

    return state.inventoryEntries
      .slice()
      .reverse()
      .map((entry) => {
        const key = `${inventoryKindCategory(entry.kind)}::${entry.item}`
        const balanceAfter =
          (balances.get(key) ?? 0) + entry.qty * inventoryKindSign(entry.kind)
        balances.set(key, balanceAfter)
        return { entry, balanceAfter }
      })
      .reverse()
  }, [state.inventoryEntries])
  const filteredInventoryLedger = inventoryLedger.filter(
    ({ entry }) => inventoryHistoryItem === 'Todos' || entry.item === inventoryHistoryItem,
  )
  const filteredInventoryEntries = filteredInventoryLedger.map(({ entry }) => entry)
  const selectedInventoryBalance =
    inventoryHistoryItem === 'Todos'
      ? null
      : filteredInventoryLedger.reduce(
          (total, { entry }) => total + entry.qty * inventoryKindSign(entry.kind),
          0,
        )
  const selectedInventoryUnit =
    inventoryHistoryItem === 'Todos'
      ? ''
      : filteredInventoryLedger[0]?.entry.unit ??
        rawInventoryItems.find((item) => item.item === inventoryHistoryItem)?.unit ??
        finishedInventoryItems.find((item) => item.item === inventoryHistoryItem)?.unit ??
        ''
  const openInventoryHistory = (item: string) => {
    setInventoryHistoryItem(item)
    setMovementView('historico')
    setActiveArea('movimentacoes')
    setMessage(`Histórico de ${item}. Confira cada entrada, saída e o saldo após o movimento.`)
  }

  const updateProduct = (productId: string, updater: (product: Product) => Product) => {
    setState((current) => ({
      ...current,
      products: current.products.map((product) =>
        product.id === productId ? updater(product) : product,
      ),
    }))
  }

  const updateMaterial = (materialId: string, field: keyof MaterialLine, value: string | number) => {
    if (!selectedProduct) return
    updateProduct(selectedProduct.id, (product) => ({
      ...product,
      materials: product.materials.map((material) =>
        material.id === materialId ? { ...material, [field]: value } : material,
      ),
    }))
    setMessage('Preço do produto recalculado.')
  }

  const selectProductMaterial = (materialLineId: string, rawMaterialId: string) => {
    if (!selectedProduct) return
    const rawMaterial = state.rawMaterials.find((item) => item.id === rawMaterialId)
    if (!rawMaterial) return

    updateProduct(selectedProduct.id, (product) => ({
      ...product,
      materials: product.materials.map((material) =>
        material.id === materialLineId
          ? {
              ...material,
              rawMaterialId: rawMaterial.id,
              name: rawMaterial.name,
              unit: rawMaterial.unit,
              unitCost: rawMaterial.avgCost,
              expectedLoss: material.expectedLoss ?? rawMaterial.expectedLoss ?? 0,
            }
          : material,
      ),
    }))
    setMessage('Matéria-prima da ficha atualizada.')
  }

  const createProduct = () => {
    const prefix = state.brands.find((brand) => brand.name === newProductBrand)?.prefix || brandPrefix(newProductBrand)
    const lastSequence = state.products
      .filter((product) => product.code?.startsWith(`${prefix}-`) || product.brand === newProductBrand)
      .reduce((highest, product) => Math.max(highest, productSequence(product)), 0)
    const firstMaterial = state.rawMaterials[0]
    const secondMaterial = state.rawMaterials[1] ?? firstMaterial
    const baseMaterials: MaterialLine[] = [
      {
        id: `mat-tecido-${Date.now()}`,
        rawMaterialId: firstMaterial?.id,
        name: firstMaterial?.name ?? 'Matéria-prima',
        qty: 1,
        unit: firstMaterial?.unit ?? 'un',
        unitCost: firstMaterial?.avgCost ?? 0,
      },
      {
        id: `mat-linha-${Date.now()}`,
        rawMaterialId: secondMaterial?.id,
        name: secondMaterial?.name ?? 'Matéria-prima',
        qty: 1,
        unit: secondMaterial?.unit ?? 'un',
        unitCost: secondMaterial?.avgCost ?? 0,
      },
    ]
    const product: Product = {
      id: `produto-${Date.now()}`,
      code: `${prefix}-${String(lastSequence + 1).padStart(7, '0')}`,
      brand: newProductBrand,
      name: newProductName || 'Nova peça',
      category: newProductCategory || 'Peça sob demanda',
      description: 'Descreva aqui tamanho, medidas, cor, modelo, MG ou qualquer especificação da peça.',
      referenceImage: newVariationReference,
      active: true,
      materials: baseMaterials,
      variations: [
        {
          id: `var-${Date.now()}`,
          name: `${newVariationSize} · ${newVariationColor}`,
          model: 'Padrão',
          size: newVariationSize,
          color: newVariationColor,
          fabric: newVariationFabric,
          measurements: newVariationMeasurements,
          technicalNotes: newVariationNotes,
          referenceImage: newVariationReference,
          sheetVersion: 'v1',
          sheetResponsible: currentUserName,
          sheetStatus: 'Rascunho',
          materials: baseMaterials.map((material, index) => ({
            ...material,
            id: `mat-var-${Date.now()}-${index}`,
          })),
        },
      ],
    }
    setState((current) => ({ ...current, products: [product, ...current.products] }))
    setSelectedProductId(product.id)
    setActiveArea('produtos')
    setMessage('Produto criado.')
  }

  const selectGuidedProductMaterial = (materialId: string, rawMaterialId: string) => {
    const rawMaterial = state.rawMaterials.find((item) => item.id === rawMaterialId)
    if (!rawMaterial) return
    setGuidedProductMaterials((current) =>
      current.map((material) =>
        material.id === materialId
          ? {
              ...material,
              rawMaterialId: rawMaterial.id,
              name: rawMaterial.name,
              unit: rawMaterial.unit,
              unitCost: rawMaterial.avgCost,
              expectedLoss: rawMaterial.expectedLoss ?? 0,
            }
          : material,
      ),
    )
  }

  const updateGuidedProductMaterial = (
    materialId: string,
    field: 'qty' | 'expectedLoss',
    value: number,
  ) => {
    setGuidedProductMaterials((current) =>
      current.map((material) =>
        material.id === materialId ? { ...material, [field]: Math.max(0, value) } : material,
      ),
    )
  }

  const addGuidedProductMaterial = () => {
    const rawMaterial = state.rawMaterials[0]
    if (!rawMaterial) {
      setMessage('Cadastre pelo menos uma matéria-prima antes de montar a peça.')
      return
    }
    setGuidedProductMaterials((current) => [
      ...current,
      {
        id: `mat-guiado-${Date.now()}`,
        rawMaterialId: rawMaterial.id,
        name: rawMaterial.name,
        qty: 1,
        unit: rawMaterial.unit,
        unitCost: rawMaterial.avgCost,
        expectedLoss: rawMaterial.expectedLoss ?? 0,
      },
    ])
  }

  const resetGuidedProduct = () => {
    const rawMaterial = state.rawMaterials[0]
    setGuidedProductStep(1)
    setGuidedProductName('')
    setGuidedProductCategory('Peça')
    setGuidedProductDescription('')
    setGuidedProductReference('')
    setGuidedProductModel('')
    setGuidedProductSize('')
    setGuidedProductColor('')
    setGuidedProductFabric('')
    setGuidedProductMeasurements('')
    setGuidedProductNotes('')
    setGuidedProductPrice(0)
    setGuidedProductActive(true)
    setGuidedSheetStatus('Rascunho')
    setGuidedProductMaterials(
      rawMaterial
        ? [{
            id: `mat-guiado-${Date.now()}`,
            rawMaterialId: rawMaterial.id,
            name: rawMaterial.name,
            qty: 1,
            unit: rawMaterial.unit,
            unitCost: rawMaterial.avgCost,
            expectedLoss: rawMaterial.expectedLoss ?? 0,
          }]
        : [],
    )
  }

  const createGuidedProduct = () => {
    if (!guidedProductName.trim()) {
      setGuidedProductStep(1)
      setMessage('Informe o nome da peça antes de salvar.')
      return
    }
    if (!guidedProductSize.trim() && !guidedProductModel.trim()) {
      setGuidedProductStep(2)
      setMessage('Informe ao menos o modelo ou o tamanho dessa versão.')
      return
    }
    if (!guidedProductMaterials.length || guidedProductMaterials.some((material) => material.qty <= 0)) {
      setGuidedProductStep(3)
      setMessage('Inclua os materiais e informe quanto é usado em uma peça.')
      return
    }
    if (canSeeMoney && guidedSheetStatus === 'Aprovada' && guidedProductPrice <= 0) {
      setGuidedProductStep(4)
      setMessage('Defina o preço oficial antes de aprovar a ficha para venda.')
      return
    }

    const productId = `produto-${Date.now()}`
    const variationId = `var-${Date.now()}`
    const materials = guidedProductMaterials.map((material, index) => ({
      ...material,
      id: `mat-${productId}-${index + 1}`,
    }))
    const variationName = [guidedProductModel, guidedProductSize, guidedProductColor]
      .filter(Boolean)
      .join(' · ') || 'Padrão'
    const product: Product = {
      id: productId,
      code: nextProductCode(state.products, guidedProductBrand),
      brand: guidedProductBrand,
      name: guidedProductName.trim(),
      category: guidedProductCategory.trim() || 'Peça',
      description: guidedProductDescription.trim() || guidedProductNotes.trim() || 'Sem descrição.',
      salePrice: canSeeMoney && guidedProductPrice > 0 ? guidedProductPrice : undefined,
      referenceImage: guidedProductReference.trim(),
      active: guidedProductActive,
      materials,
      variations: [{
        id: variationId,
        name: variationName,
        model: guidedProductModel.trim(),
        size: guidedProductSize.trim(),
        color: guidedProductColor.trim(),
        fabric: guidedProductFabric.trim(),
        measurements: guidedProductMeasurements.trim(),
        technicalNotes: guidedProductNotes.trim(),
        referenceImage: guidedProductReference.trim(),
        salePrice: canSeeMoney && guidedProductPrice > 0 ? guidedProductPrice : undefined,
        sheetVersion: 'v1',
        sheetResponsible: currentUserName,
        sheetStatus: userRole === 'Admin' ? guidedSheetStatus : 'Rascunho',
        materials: materials.map((material, index) => ({
          ...material,
          id: `mat-${variationId}-${index + 1}`,
        })),
      }],
    }

    setState((current) => ({ ...current, products: [product, ...current.products] }))
    setSelectedProductId(product.id)
    setSelectedVariationId(variationId)
    resetGuidedProduct()
    setActiveArea('produtos')
    setMessage(`${product.code} cadastrado. A ficha ficou ${product.variations[0].sheetStatus?.toLowerCase()}.`)
  }

  const addMaterial = () => {
    if (!selectedProduct) return
    const rawMaterial = state.rawMaterials[0]
    updateProduct(selectedProduct.id, (product) => ({
      ...product,
      materials: [
        ...product.materials,
        {
          id: `mat-${Date.now()}`,
          rawMaterialId: rawMaterial?.id,
          name: rawMaterial?.name ?? 'Matéria-prima',
          qty: 1,
          unit: rawMaterial?.unit ?? 'un',
          unitCost: rawMaterial?.avgCost ?? 0,
          expectedLoss: rawMaterial?.expectedLoss ?? 0,
        },
      ],
    }))
    setMessage('Material adicionado ao produto.')
  }

  const updateVariation = (
    variationId: string,
    updater: (variation: ProductVariation) => ProductVariation,
  ) => {
    if (!selectedProduct) return
    updateProduct(selectedProduct.id, (product) => ({
      ...product,
      variations: product.variations.map((variation) =>
        variation.id === variationId ? updater(variation) : variation,
      ),
    }))
    setMessage('Variação atualizada.')
  }

  const updateVariationField = (
    variationId: string,
    field: keyof Omit<ProductVariation, 'id' | 'materials'>,
    value: string,
  ) => {
    updateVariation(variationId, (variation) => {
      const nextVariation = { ...variation, [field]: value }
      return {
        ...nextVariation,
        name:
          field === 'size' || field === 'color'
            ? `${field === 'size' ? value : nextVariation.size} · ${field === 'color' ? value : nextVariation.color}`
            : nextVariation.name,
      }
    })
  }

  const updateVariationMaterial = (
    variationId: string,
    materialId: string,
    field: keyof MaterialLine,
    value: string | number,
  ) => {
    updateVariation(variationId, (variation) => ({
      ...variation,
      materials: variation.materials.map((material) =>
        material.id === materialId ? { ...material, [field]: value } : material,
      ),
    }))
  }

  const selectVariationMaterial = (variationId: string, materialId: string, rawMaterialId: string) => {
    const rawMaterial = state.rawMaterials.find((item) => item.id === rawMaterialId)
    if (!rawMaterial) return

    updateVariation(variationId, (variation) => ({
      ...variation,
      materials: variation.materials.map((material) =>
        material.id === materialId
          ? {
              ...material,
              rawMaterialId: rawMaterial.id,
              name: rawMaterial.name,
              unit: rawMaterial.unit,
              unitCost: rawMaterial.avgCost,
              expectedLoss: material.expectedLoss ?? rawMaterial.expectedLoss ?? 0,
            }
          : material,
      ),
    }))
  }

  const addVariationMaterial = (variationId: string) => {
    const rawMaterial = state.rawMaterials[0]
    updateVariation(variationId, (variation) => ({
      ...variation,
      materials: [
        ...variation.materials,
        {
          id: `mat-var-${Date.now()}`,
          rawMaterialId: rawMaterial?.id,
          name: rawMaterial?.name ?? 'Matéria-prima',
          qty: 1,
          unit: rawMaterial?.unit ?? 'un',
          unitCost: rawMaterial?.avgCost ?? 0,
          expectedLoss: rawMaterial?.expectedLoss ?? 0,
        },
      ],
    }))
  }

  const createVariation = () => {
    if (!selectedProduct) return
    const variation: ProductVariation = {
      id: `var-${Date.now()}`,
      name: `${newVariationSize} · ${newVariationColor}`,
      model: 'Padrão',
      size: newVariationSize,
      color: newVariationColor,
      fabric: newVariationFabric,
      measurements: newVariationMeasurements,
      technicalNotes: newVariationNotes,
      referenceImage: newVariationReference,
      sheetVersion: 'v1',
      sheetResponsible: currentUserName,
      sheetStatus: 'Rascunho',
      materials: productMaterials(selectedProduct, activeVariationId).map((material, index) => ({
        ...material,
        id: `mat-var-${Date.now()}-${index}`,
      })),
    }

    updateProduct(selectedProduct.id, (product) => ({
      ...product,
      variations: [variation, ...product.variations],
    }))
    setSelectedVariationId(variation.id)
    setMessage('Variação criada com ficha de matéria-prima própria.')
  }

  const createRawMaterial = () => {
    const material: RawMaterial = {
      id: `mp-${Date.now()}`,
      code: newMaterialCode.trim() || nextRawMaterialCode(state.rawMaterials),
      name: newMaterialName || 'Matéria-prima',
      category: newMaterialCategory || 'Matéria-prima',
      stockLocation: newMaterialStockLocation.trim(),
      unit: newMaterialUnit || 'un',
      purchaseUnit: newMaterialPurchaseUnit || newMaterialUnit || 'un',
      purchaseToStockFactor: newMaterialPurchaseFactor || 1,
      avgCost: newMaterialStockCost,
      supplier: newMaterialSupplier || 'Fornecedor',
      minimumStock: newMaterialMinimum,
      expectedLoss: newMaterialExpectedLoss,
    }

    setState((current) => ({
      ...current,
      rawMaterials: [material, ...current.rawMaterials],
    }))
    setActiveArea('materias')
    setNewMaterialCode(nextRawMaterialCode([material, ...state.rawMaterials]))
    setMessage('Matéria-prima cadastrada.')
  }

  const createSupplier = () => {
    const supplier: Supplier = {
      id: `forn-${Date.now()}`,
      name: newSupplierName || 'Fornecedor',
      contact: newSupplierContact || 'Contato',
      notes: 'Cadastro simples de fornecedor.',
    }

    setState((current) => ({
      ...current,
      suppliers: [supplier, ...current.suppliers],
    }))
    setActiveArea('fornecedores')
    setMessage('Fornecedor cadastrado.')
  }

  const createCustomer = () => {
    const customer: Customer = {
      id: `cli-${Date.now()}`,
      name: newCustomerName || 'Cliente',
      phone: newCustomerPhone || 'Telefone',
      city: newCustomerCity || 'Cidade',
      notes: newCustomerNotes || 'Sem observações.',
    }

    setState((current) => ({
      ...current,
      customers: [customer, ...current.customers],
    }))
    setSelectedCustomerId(customer.id)
    setActiveArea('clientes')
    setMessage('Cliente cadastrado. Para vender, use Nova venda.')
  }

  const createBrand = () => {
    const brandName = newBrandName || 'Nova marca'
    const brand: Brand = {
      id: `marca-${Date.now()}`,
      name: brandName,
      prefix: (newBrandPrefix || brandPrefix(brandName)).toUpperCase().slice(0, 3),
      notes: 'Marca cadastrada para novos produtos.',
    }

    setState((current) => ({
      ...current,
      brands: [brand, ...current.brands],
    }))
    setNewProductBrand(brand.name)
    setActiveArea('marcas')
    setMessage('Marca cadastrada.')
  }

  const selectRawMaterialForNote = (materialName: string) => {
    const material = state.rawMaterials.find((item) => item.name === materialName)
    setNoteItem(materialName)
    if (material) {
      setNoteUnit(material.purchaseUnit)
      setNoteUnitCost(material.avgCost * purchaseToStockFactorFor(material, material.purchaseUnit))
      if (material.supplier) setNoteSupplier(material.supplier)
    }
  }

  const selectPurchaseMaterial = (materialId: string) => {
    const material = state.rawMaterials.find((item) => item.id === materialId)
    setPurchaseMaterialId(materialId)
    if (!material) return
    setPurchaseSupplier(material.supplier || state.suppliers[0]?.name || '')
    setPurchaseQty(1)
    setPurchaseUnitCost(
      material.avgCost * purchaseToStockFactorFor(material, material.purchaseUnit),
    )
  }

  const preparePurchaseFromSuggestion = (suggestion: (typeof purchaseSuggestions)[number]) => {
    setPurchaseMaterialId(suggestion.material.id)
    setPurchaseSupplier(suggestion.material.supplier || state.suppliers[0]?.name || '')
    setPurchaseQty(Math.max(suggestion.suggestedPurchaseQty, 0.01))
    setPurchaseUnitCost(
      suggestion.material.avgCost *
        purchaseToStockFactorFor(suggestion.material, suggestion.material.purchaseUnit),
    )
    setPurchaseExpectedDate(suggestion.needBy || datePlusDaysValue(7))
    setPurchaseNotes(
      `Sugestão automática: OPs ${suggestion.requiredForOps.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} ${suggestion.unit}; pedidos futuros ${suggestion.requiredForFutureOrders.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} ${suggestion.unit}; mínimo ${suggestion.minimumStock.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} ${suggestion.unit}.`,
    )
    setPurchaseView('pedidos')
    setMessage(`Sugestão de ${suggestion.item} carregada. Confira fornecedor, quantidade e prazo.`)
  }

  const createPurchaseOrder = () => {
    const material = selectedPurchaseMaterial
    if (!canManagePurchases) {
      setMessage('Somente Administração ou Financeiro pode criar pedido de compra.')
      return
    }
    if (!material || purchaseQty <= 0 || purchaseUnitCost < 0) {
      setMessage('Escolha o material e informe uma quantidade válida.')
      return
    }
    if (!purchaseSupplier.trim()) {
      setMessage('Escolha o fornecedor antes de criar o pedido de compra.')
      return
    }

    const now = Date.now()
    const number = `PC-${String(state.purchaseOrders.length + 1).padStart(4, '0')}`
    const order: PurchaseOrder = {
      id: `PC-${now}`,
      number,
      supplier: purchaseSupplier,
      orderDate: currentDateValue(),
      expectedDate: purchaseExpectedDate,
      rawMaterialId: material.id,
      item: material.name,
      qty: purchaseQty,
      unit: material.purchaseUnit,
      unitCost: purchaseUnitCost,
      stockQty: convertedStockQty(purchaseQty, material, material.purchaseUnit),
      stockUnit: material.unit,
      receivedQty: 0,
      status: 'Enviado',
      notes: purchaseNotes,
      createdBy: currentUserName,
      createdAt: new Date().toISOString(),
    }
    const nextState = {
      ...state,
      purchaseOrders: [order, ...state.purchaseOrders],
    }
    setState(nextState)
    void saveStateImmediately(nextState)
    setReceivingPurchaseOrderId(order.id)
    setReceiptQty(order.qty)
    setReceiptUnitCost(order.unitCost)
    setPurchaseNotes('')
    setMessage(`${order.number} criado. O material aparece como compra a receber.`)
  }

  const cancelPurchaseOrder = () => {
    if (!canManagePurchases) {
      setMessage('Somente Administração ou Financeiro pode cancelar pedidos de compra.')
      return
    }
    const order = state.purchaseOrders.find((item) => item.id === cancelPurchaseOrderId)
    if (!order || (order.status !== 'Enviado' && order.status !== 'Parcial')) {
      setMessage('Escolha um pedido de compra que ainda esteja aberto.')
      return
    }
    if (!purchaseCancellationReason.trim()) {
      setMessage('Explique o motivo do cancelamento para manter o histórico da compra.')
      return
    }

    const nextState: AppState = {
      ...state,
      purchaseOrders: state.purchaseOrders.map((item) =>
        item.id === order.id
          ? {
              ...item,
              status: 'Cancelado',
              cancellationReason: purchaseCancellationReason.trim(),
              cancelledBy: currentUserName,
              cancelledAt: new Date().toISOString(),
            }
          : item,
      ),
    }
    const nextOpenOrder = nextState.purchaseOrders.find(
      (item) => item.status === 'Enviado' || item.status === 'Parcial',
    )

    setState(nextState)
    void saveStateImmediately(nextState, `${order.number} cancelado e sincronizado.`)
    setReceivingPurchaseOrderId(nextOpenOrder?.id ?? '')
    setCancelPurchaseOrderId(null)
    setPurchaseCancellationReason('')
    setMessage(
      `${order.number} cancelado. A quantidade pendente deixou de contar como material a caminho.`,
    )
  }

  const buildStateAfterMaterialReceipt = (
    current: AppState,
    {
      purchaseOrder,
      number,
      supplier,
      date,
      dueDate,
      material,
      qty,
      unit,
      unitCost,
    }: {
      purchaseOrder?: PurchaseOrder
      number: string
      supplier: string
      date: string
      dueDate: string
      material: RawMaterial
      qty: number
      unit: string
      unitCost: number
    },
  ): AppState => {
    const timestamp = Date.now()
    const total = qty * unitCost
    const stockQty = convertedStockQty(qty, material, unit)
    const stockUnitCost = stockQty > 0 ? total / stockQty : material.avgCost
    const currentMaterial =
      current.rawMaterials.find((item) => item.id === material.id) ?? material
    const physicalBefore = Math.max(0, rawMaterialBalanceFromState(current, material.name))
    const averageCost =
      physicalBefore + stockQty > 0
        ? ((physicalBefore * currentMaterial.avgCost) + (stockQty * stockUnitCost)) /
          (physicalBefore + stockQty)
        : stockUnitCost
    const note: PurchaseNote = {
      id: `NF-${timestamp}`,
      number,
      purchaseOrderId: purchaseOrder?.id,
      supplier,
      date,
      item: material.name,
      qty,
      unit,
      unitCost,
      stockQty,
      stockUnit: material.unit,
      createdBy: currentUserName,
    }
    const nextReceivedQty = purchaseOrder
      ? Math.min(purchaseOrder.qty, purchaseOrder.receivedQty + qty)
      : 0

    return {
      ...current,
      rawMaterials: current.rawMaterials.map((item) =>
        item.id === material.id
          ? { ...item, avgCost: averageCost, lastPurchase: date }
          : item,
      ),
      products: current.products.map((product) => ({
        ...product,
        materials: product.materials.map((productMaterial) =>
          productMaterial.rawMaterialId === material.id || productMaterial.name === material.name
            ? { ...productMaterial, unitCost: averageCost }
            : productMaterial,
        ),
        variations: product.variations.map((variation) => ({
          ...variation,
          materials: variation.materials.map((productMaterial) =>
            productMaterial.rawMaterialId === material.id || productMaterial.name === material.name
              ? { ...productMaterial, unitCost: averageCost }
              : productMaterial,
          ),
        })),
      })),
      purchaseOrders: purchaseOrder
        ? current.purchaseOrders.map((order) =>
            order.id === purchaseOrder.id
              ? {
                  ...order,
                  receivedQty: nextReceivedQty,
                  status: nextReceivedQty >= order.qty ? 'Recebido' : 'Parcial',
                }
              : order,
          )
        : current.purchaseOrders,
      purchaseNotes: [note, ...current.purchaseNotes],
      inventoryEntries: [
        {
          id: `EST-${timestamp}`,
          kind: 'Entrada MP',
          item: material.name,
          qty: stockQty,
          unit: material.unit,
          value: total,
          source: purchaseOrder ? `${purchaseOrder.number} · NF ${number}` : `NF ${number}`,
          createdBy: currentUserName,
          createdAt: new Date().toISOString(),
          reason: purchaseOrder
            ? `Recebimento do pedido de compra ${purchaseOrder.number}`
            : `Compra recebida de ${supplier}`,
        },
        ...current.inventoryEntries,
      ],
      cashEntries: [
        {
          id: `CX-${timestamp}`,
          kind: 'Saída',
          category: 'Conta a pagar',
          description: `${purchaseOrder?.number ? `${purchaseOrder.number} · ` : ''}NF ${number} - ${supplier}`,
          value: total,
          source: 'Compra de matéria-prima',
          dueDate,
          paid: false,
          createdBy: currentUserName,
          createdAt: new Date().toISOString(),
        },
        ...current.cashEntries,
      ],
    }
  }

  const createPurchaseNote = () => {
    const material = state.rawMaterials.find((item) => item.name === noteItem)
    if (!canManagePurchases) {
      setMessage('Somente Administração ou Financeiro pode registrar recebimentos.')
      return
    }
    if (!material || noteQty <= 0 || noteUnitCost < 0) {
      setMessage('Informe material, quantidade e custo válidos.')
      return
    }
    const nextState = buildStateAfterMaterialReceipt(state, {
      number: noteNumber || String(state.purchaseNotes.length + 1).padStart(4, '0'),
      supplier: noteSupplier || material.supplier || 'Fornecedor',
      date: noteDate,
      dueDate: noteDueDate,
      material,
      qty: noteQty,
      unit: noteUnit || material.purchaseUnit,
      unitCost: noteUnitCost,
    })
    setState(nextState)
    void saveStateImmediately(nextState)
    setActiveArea('notas')
    setPurchaseView('recebimentos')
    setMessage('Recebimento registrado. Estoque e custo médio foram atualizados e a conta ficou a pagar.')
  }

  const selectPurchaseOrderForReceipt = (orderId: string) => {
    const order = state.purchaseOrders.find((item) => item.id === orderId)
    setReceivingPurchaseOrderId(orderId)
    if (!order) return
    setReceiptQty(Math.max(0, order.qty - order.receivedQty))
    setReceiptUnitCost(order.unitCost)
    setReceiptNumber('')
    setReceiptDate(currentDateValue())
    setReceiptDueDate(datePlusDaysValue(30))
  }

  const receivePurchaseOrder = () => {
    const order = selectedReceivingPurchaseOrder
    const material = selectedReceivingMaterial
    if (!canManagePurchases) {
      setMessage('Somente Administração ou Financeiro pode registrar recebimentos.')
      return
    }
    if (!order || !material) {
      setMessage('Escolha um pedido de compra que ainda tenha material a receber.')
      return
    }
    if (receiptQty <= 0 || receiptQty > selectedReceivingPendingQty) {
      setMessage(`Informe uma quantidade entre 0 e ${selectedReceivingPendingQty.toLocaleString('pt-BR')} ${order.unit}.`)
      return
    }
    if (!receiptNumber.trim()) {
      setMessage('Informe o número da nota ou comprovante do recebimento.')
      return
    }

    const nextState = buildStateAfterMaterialReceipt(state, {
      purchaseOrder: order,
      number: receiptNumber,
      supplier: order.supplier,
      date: receiptDate,
      dueDate: receiptDueDate,
      material,
      qty: receiptQty,
      unit: order.unit,
      unitCost: receiptUnitCost,
    })
    setState(nextState)
    void saveStateImmediately(nextState)
    const remaining = Math.max(0, selectedReceivingPendingQty - receiptQty)
    const nextOpenOrder = nextState.purchaseOrders.find(
      (item) => item.status === 'Enviado' || item.status === 'Parcial',
    )
    setReceivingPurchaseOrderId(nextOpenOrder?.id ?? '')
    setReceiptNumber('')
    setReceiptQty(
      remaining > 0
        ? remaining
        : nextOpenOrder
          ? Math.max(0, nextOpenOrder.qty - nextOpenOrder.receivedQty)
          : 0,
    )
    setReceiptUnitCost(nextOpenOrder?.unitCost ?? 0)
    setMessage(
      remaining > 0
        ? `Recebimento parcial registrado. Ainda faltam ${remaining.toLocaleString('pt-BR')} ${order.unit}.`
        : `${order.number} recebido por completo. Estoque, custo e conta a pagar foram atualizados.`,
    )
  }

  const inventoryItemUnitCost = (category: InventoryCategory, itemName: string) => {
    if (category === 'Matéria-prima') {
      return state.rawMaterials.find((material) => material.name === itemName)?.avgCost ?? 0
    }
    const catalogItem = finishedCatalog.find((item) => item.item === itemName)
    return catalogItem ? productCost(catalogItem.product, catalogItem.variationId) : 0
  }

  const registerInventoryAdjustment = () => {
    if (!canAdjustInventory) {
      setMessage('Somente o perfil Admin pode ajustar o estoque.')
      return
    }
    const selected = adjustmentSelection
    if (!selected || adjustmentQty <= 0) {
      setMessage('Escolha um item e informe uma quantidade maior que zero.')
      return
    }
    if (!adjustmentReason.trim()) {
      setMessage('Explique o motivo do ajuste para manter o estoque rastreável.')
      return
    }

    const physical = inventoryPhysicalQty(adjustmentCategory, selected.item)
    if (adjustmentDirection === 'Saída' && adjustmentQty > physical) {
      setMessage(`A saída excede o saldo físico de ${physical.toLocaleString('pt-BR')} ${selected.unit}.`)
      return
    }

    const kind: InventoryKind =
      adjustmentCategory === 'Matéria-prima'
        ? adjustmentDirection === 'Entrada' ? 'Ajuste entrada MP' : 'Ajuste saída MP'
        : adjustmentDirection === 'Entrada' ? 'Ajuste entrada PA' : 'Ajuste saída PA'
    const timestamp = Date.now()
    const entry: InventoryEntry = {
      id: `AJ-${timestamp}`,
      kind,
      item: selected.item,
      qty: adjustmentQty,
      unit: selected.unit,
      value: inventoryItemUnitCost(adjustmentCategory, selected.item) * adjustmentQty,
      source: 'Ajuste manual',
      createdBy: currentUserName,
      createdAt: new Date().toISOString(),
      reason: adjustmentReason.trim(),
    }
    const nextState: AppState = {
      ...state,
      inventoryEntries: [entry, ...state.inventoryEntries],
    }
    setState(nextState)
    void saveStateImmediately(nextState, `Ajuste de ${selected.item} registrado e sincronizado.`)
    setAdjustmentQty(1)
    setAdjustmentReason('')
    setInventoryHistoryItem(selected.item)
    setMovementView('historico')
    setMessage(`Ajuste registrado por ${currentUserName}. O novo saldo já considera esta movimentação.`)
  }

  const registerInventoryCount = () => {
    if (!canAdjustInventory) {
      setMessage('Somente o perfil Admin pode concluir uma contagem física.')
      return
    }
    const selected = countSelection
    if (!selected || countedQty < 0) {
      setMessage('Escolha um item e informe a quantidade contada.')
      return
    }
    if (countDifference !== 0 && !countNotes.trim()) {
      setMessage('Explique a diferença encontrada antes de concluir a contagem.')
      return
    }

    const timestamp = Date.now()
    const countId = `INV-${timestamp}`
    const count: InventoryCount = {
      id: countId,
      date: currentDateValue(),
      category: countCategory,
      item: selected.item,
      unit: selected.unit,
      systemQty: countSystemQty,
      countedQty,
      difference: countDifference,
      notes: countNotes.trim(),
      createdBy: currentUserName,
      createdAt: new Date().toISOString(),
    }
    const adjustmentEntry: InventoryEntry | null =
      countDifference === 0
        ? null
        : {
            id: `AJ-INV-${timestamp}`,
            kind:
              countCategory === 'Matéria-prima'
                ? countDifference > 0 ? 'Ajuste entrada MP' : 'Ajuste saída MP'
                : countDifference > 0 ? 'Ajuste entrada PA' : 'Ajuste saída PA',
            item: selected.item,
            qty: Math.abs(countDifference),
            unit: selected.unit,
            value: inventoryItemUnitCost(countCategory, selected.item) * Math.abs(countDifference),
            source: countId,
            createdBy: currentUserName,
            createdAt: new Date().toISOString(),
            reason: countNotes.trim() || 'Contagem física sem diferença',
          }
    const nextState: AppState = {
      ...state,
      inventoryCounts: [count, ...state.inventoryCounts],
      inventoryEntries: adjustmentEntry
        ? [adjustmentEntry, ...state.inventoryEntries]
        : state.inventoryEntries,
    }
    setState(nextState)
    void saveStateImmediately(nextState, `Inventário de ${selected.item} concluído e sincronizado.`)
    setCountedQty(0)
    setCountNotes('')
    setMessage(
      countDifference === 0
        ? 'Contagem concluída sem diferença de estoque.'
        : `Contagem concluída. Diferença de ${countDifference.toLocaleString('pt-BR')} ${selected.unit} ajustada e documentada.`,
    )
  }

  const createOrder = () => {
    if (!selectedProduct || !selectedCustomer) return
    if (!productReadyForUse(selectedProduct, activeVariationId)) {
      setMessage('Ative o produto e aprove a ficha antes de registrar uma venda.')
      return
    }
    const price = finalOrderUnitPrice
    if (price <= 0) {
      setMessage('Defina um preço por peça maior que zero antes de registrar a venda.')
      return
    }
    const documentType = orderDocumentType
    const pricing = makeOrderPricing(
      state,
      selectedProduct,
      activeVariationId,
      price,
      currentUserName,
      canApproveDiscount,
    )
    const approvedForRoutine = pricing.approvalStatus !== 'Pendente'
    const now = new Date().toISOString()
    const willReserve = documentType === 'Pedido' && approvedForRoutine
    const order: Order = {
      id: nextDocumentId(state.orders, documentType),
      documentType,
      customerId: selectedCustomer.id,
      client: selectedCustomer.name,
      phone: selectedCustomer.phone,
      city: selectedCustomer.city,
      orderDate,
      productId: selectedProduct.id,
      variationId: activeVariationId,
      qty: orderQty,
      unitPrice: price,
      dueDate: orderDueDate,
      notes: orderNotes,
      status: 'Aberto',
      billed: documentType === 'Pedido' && approvedForRoutine,
      createdBy: currentUserName,
      pricing,
      paymentMethod: orderPaymentMethod,
      paymentStatus: orderPaymentStatus,
      paymentNotes: orderPaymentNotes,
      deliveryMethod: orderDeliveryMethod,
      deliveryAddress: orderDeliveryAddress || selectedCustomer.address || selectedCustomer.city,
      deliveryDate: orderDeliveryDate || orderDueDate,
      availabilityCheckedAt: now,
      reservationStatus: willReserve ? 'Reservado' : 'Não se aplica',
      reservedAt: willReserve ? now : undefined,
      createdAt: now,
      history: [
        newOrderHistoryEvent('Criação', `${documentType} registrado`, currentUserName),
        newOrderHistoryEvent(
          'Disponibilidade',
          `${draftAvailableStock} un disponíveis; ${draftMissingStock} un precisam de produção`,
          currentUserName,
        ),
        ...(willReserve
          ? [newOrderHistoryEvent('Reserva', `${orderQty} un reservadas para o pedido`, currentUserName)]
          : []),
      ],
    }

    setState((current) => ({
      ...current,
      orders: [order, ...current.orders],
      cashEntries:
        documentType === 'Pedido' && approvedForRoutine
          ? [
              {
                id: `CX-${Date.now()}`,
                kind: 'Entrada',
                category: 'Venda recebida',
                description: `Pedido ${order.client}`,
                value: order.qty * price,
                source: order.id,
                dueDate: order.orderDate,
                paid: orderPaymentStatus === 'Pago',
                createdBy: currentUserName,
                createdAt: now,
                paidAt: orderPaymentStatus === 'Pago' ? now : undefined,
              },
              ...current.cashEntries,
            ]
          : current.cashEntries,
    }))
    setActiveArea('vendas')
    setMessage(
      pricing.approvalStatus === 'Pendente'
        ? `${documentType} registrado com preço abaixo do mínimo. Aguarde a aprovação administrativa.`
        : documentType === 'Pedido'
        ? 'Pedido registrado. Confira o estoque e crie a produção se faltar peça pronta.'
        : 'Orçamento registrado. Você pode imprimir ou transformar em pedido quando for aprovado.',
    )
  }

  const createGuidedOrder = (requestedDocumentType?: OrderDocumentType) => {
    if (!selectedProduct || !selectedCustomer) return
    if (!productReadyForUse(selectedProduct, activeVariationId)) {
      setGuidedOrderStep(2)
      setMessage('Essa peça ainda está em rascunho ou desativada. Peça ao administrador para aprovar a ficha.')
      return
    }
    const price = finalOrderUnitPrice
    if (price <= 0) {
      setGuidedOrderStep(4)
      setMessage('Defina um preço por peça maior que zero para continuar.')
      return
    }
    const documentType = requestedDocumentType ?? orderDocumentType
    const orderId = nextDocumentId(state.orders, documentType)
    const pricing = makeOrderPricing(
      state,
      selectedProduct,
      activeVariationId,
      price,
      currentUserName,
      canApproveDiscount,
    )
    const approvedForRoutine = pricing.approvalStatus !== 'Pendente'
    const now = new Date().toISOString()
    const willReserve = documentType === 'Pedido' && approvedForRoutine
    const order: Order = {
      id: orderId,
      documentType,
      customerId: selectedCustomer.id,
      client: selectedCustomer.name,
      phone: selectedCustomer.phone,
      city: selectedCustomer.city,
      orderDate,
      productId: selectedProduct.id,
      variationId: activeVariationId,
      qty: orderQty,
      unitPrice: price,
      dueDate: orderDueDate,
      notes: orderNotes,
      status: 'Aberto',
      billed: documentType === 'Pedido' && approvedForRoutine,
      createdBy: currentUserName,
      pricing,
      paymentMethod: orderPaymentMethod,
      paymentStatus: orderPaymentStatus,
      paymentNotes: orderPaymentNotes,
      deliveryMethod: orderDeliveryMethod,
      deliveryAddress: orderDeliveryAddress || selectedCustomer.address || selectedCustomer.city,
      deliveryDate: orderDeliveryDate || orderDueDate,
      availabilityCheckedAt: now,
      reservationStatus: willReserve ? 'Reservado' : 'Não se aplica',
      reservedAt: willReserve ? now : undefined,
      createdAt: now,
      history: [
        newOrderHistoryEvent('Criação', `${documentType} registrado`, currentUserName),
        newOrderHistoryEvent(
          'Disponibilidade',
          `${draftAvailableStock} un disponíveis; ${draftMissingStock} un precisam de produção`,
          currentUserName,
        ),
        ...(willReserve
          ? [newOrderHistoryEvent('Reserva', `${orderQty} un reservadas para o pedido`, currentUserName)]
          : []),
      ],
    }

    if (documentType === 'Orçamento') {
      setState((current) => ({
        ...current,
        orders: [order, ...current.orders],
      }))
      setGuidedOrderStep(1)
      setActiveArea('pedidos')
      setMessage(
        pricing.approvalStatus === 'Pendente'
          ? `Orçamento ${order.id} salvo. O preço abaixo do mínimo aguarda aprovação administrativa.`
          : `Orçamento ${order.id} registrado. Quando aprovado, transforme em pedido.`,
      )
      return
    }

    setState((current) => ({
      ...current,
      orders: [order, ...current.orders],
      cashEntries: approvedForRoutine
        ? [
            {
              id: `CX-${Date.now()}`,
              kind: 'Entrada',
              category: 'Venda recebida',
              description: `Pedido ${order.client}`,
              value: order.qty * price,
              source: order.id,
              dueDate: order.orderDate,
              paid: orderPaymentStatus === 'Pago',
              createdBy: currentUserName,
              createdAt: now,
              paidAt: orderPaymentStatus === 'Pago' ? now : undefined,
            },
            ...current.cashEntries,
          ]
        : current.cashEntries,
    }))
    setGuidedOrderStep(1)
    setActiveArea(approvedForRoutine ? 'producao-necessidades' : 'pedidos')
    setMessage(
      approvedForRoutine
        ? `Pedido ${order.id} registrado. Agora o PCP confere estoque e decide a quantidade para produção.`
        : `Pedido ${order.id} salvo. O preço abaixo do mínimo precisa de aprovação antes do financeiro e da produção.`,
    )
  }

  const generateProductionOrder = (order: Order, requestedQty?: number) => {
    if (order.documentType === 'Orçamento') {
      setMessage('Transforme o orçamento em pedido antes de criar produção.')
      return
    }

    if (!orderPriceApproved(order)) {
      setMessage('O preço deste pedido está abaixo do mínimo e ainda aguarda aprovação administrativa.')
      setActiveArea('pedidos')
      return
    }

    if (state.productionOrders.some((op) => op.orderId === order.id)) {
      setMessage('Esse pedido já possui produção criada.')
      return
    }

    const qty = Math.max(0, Math.floor(requestedQty ?? order.qty))
    if (qty <= 0) {
      setMessage('Informe uma quantidade maior que zero para gerar a produção.')
      return
    }

    const op: ProductionOrder = {
      id: nextProductionOrderId(state.productionOrders),
      orderId: order.id,
      productId: order.productId,
      variationId: order.variationId,
      qty,
      produced: 0,
      status: 'Não iniciada',
      priority: productionPriorityForDueDate(order.dueDate),
      origin: 'Pedido',
      notes: order.notes,
      responsible: currentUserName,
      startedAt: '',
      finishedAt: '',
      launches: [],
    }

    const nextState = {
      ...state,
      orders: state.orders.map((item) =>
        item.id === order.id ? { ...item, status: 'Em produção' } : item,
      ),
      productionOrders: [op, ...state.productionOrders],
    }

    setState(nextState)
    void saveStateImmediately(nextState, `Produção ${op.id} criada e sincronizada.`)
    setProductionDecisionOrderId(null)
    setProductionDecisionQty(1)
    setActiveArea('producao')
    setMessage(`Produção ${op.id} criada para ${order.id} com ${qty} peça(s).`)
  }

  const convertBudgetToOrder = (order: Order) => {
    if (order.documentType !== 'Orçamento') return
    if (!orderPriceApproved(order)) {
      setMessage('Este orçamento precisa de aprovação administrativa antes de virar pedido.')
      return
    }
    const newOrderId = nextDocumentId(state.orders, 'Pedido')
    const now = new Date().toISOString()

    setState((current) => ({
      ...current,
      orders: current.orders.map((item) =>
        item.id === order.id
          ? {
              ...item,
              id: newOrderId,
              documentType: 'Pedido',
              billed: true,
              status: 'Aberto',
              reservationStatus: 'Reservado',
              reservedAt: now,
              convertedFrom: order.id,
              history: [
                ...(item.history ?? []),
                newOrderHistoryEvent('Conversão', `Orçamento ${order.id} convertido no pedido ${newOrderId}`, currentUserName),
                newOrderHistoryEvent('Reserva', `${item.qty} un reservadas após a confirmação`, currentUserName),
              ],
            }
          : item,
      ),
      productionOrders: current.productionOrders.map((op) =>
        op.orderId === order.id ? { ...op, orderId: newOrderId } : op,
      ),
      cashEntries: [
        {
          id: `CX-${Date.now()}`,
          kind: 'Entrada',
          category: 'Venda recebida',
          description: `Pedido ${order.client}`,
          value: orderTotal(state, order),
          source: newOrderId,
          dueDate: order.orderDate,
          paid: order.paymentStatus === 'Pago',
          createdBy: currentUserName,
          createdAt: now,
          paidAt: order.paymentStatus === 'Pago' ? now : undefined,
        },
        ...current.cashEntries.filter((entry) => entry.source !== order.id),
      ],
    }))
    setPreviewOrderId((current) => (current === order.id ? newOrderId : current))
    setPrintOrderId((current) => (current === order.id ? newOrderId : current))
    setMessage(`Orçamento ${order.id} virou pedido ${newOrderId}.`)
  }

  const duplicateBudget = (order: Order) => {
    if (order.documentType !== 'Orçamento') return
    const newId = nextDocumentId(state.orders, 'Orçamento')
    const duplicate: Order = {
      ...order,
      id: newId,
      status: 'Aberto',
      billed: false,
      reservationStatus: 'Não se aplica',
      reservedAt: undefined,
      cancelledAt: undefined,
      cancelledBy: undefined,
      cancellationReason: undefined,
      duplicatedFrom: order.id,
      createdAt: new Date().toISOString(),
      orderDate: currentDateValue(),
      history: [
        newOrderHistoryEvent('Criação', `Orçamento criado a partir de ${order.id}`, currentUserName),
        newOrderHistoryEvent('Duplicação', `Conteúdo duplicado de ${order.id}`, currentUserName),
      ],
    }
    const nextState = { ...state, orders: [duplicate, ...state.orders] }
    setState(nextState)
    void saveStateImmediately(nextState, `Orçamento ${newId} duplicado e sincronizado.`)
    setPreviewOrderId(newId)
    setMessage(`Orçamento ${newId} criado como cópia de ${order.id}.`)
  }

  const requestOrderCancellation = (order: Order) => {
    if (order.status === 'Entregue') {
      setMessage('Um pedido entregue não pode ser cancelado. Registre uma devolução no estoque e financeiro.')
      return
    }
    setCancelOrderId(order.id)
    setCancellationReason('')
  }

  const confirmOrderCancellation = () => {
    const order = state.orders.find((item) => item.id === cancelOrderId)
    const reason = cancellationReason.trim()
    if (!order) return
    if (reason.length < 3) {
      setMessage('Informe uma justificativa para cancelar.')
      return
    }
    const now = new Date().toISOString()
    const nextState = {
      ...state,
      orders: state.orders.map((item) =>
        item.id === order.id
          ? {
              ...item,
              status: 'Cancelado' as OrderStatus,
              billed: false,
              reservationStatus: 'Liberado' as ReservationStatus,
              cancelledAt: now,
              cancelledBy: currentUserName,
              cancellationReason: reason,
              history: [
                ...(item.history ?? []),
                newOrderHistoryEvent('Cancelamento', reason, currentUserName),
              ],
            }
          : item,
      ),
      productionOrders: state.productionOrders.map((op) =>
        op.orderId === order.id && op.status !== 'Finalizada'
          ? { ...op, status: 'Pausada' as OpStatus, notes: `${op.notes}\nPedido cancelado: ${reason}`.trim() }
          : op,
      ),
      cashEntries: state.cashEntries.filter((entry) => entry.source !== order.id),
    }
    setState(nextState)
    void saveStateImmediately(nextState, `${order.documentType} ${order.id} cancelado e sincronizado.`)
    setCancelOrderId(null)
    setCancellationReason('')
    setMessage(`${order.documentType} ${order.id} cancelado. A reserva foi liberada e o motivo ficou no histórico.`)
  }

  const deleteOrder = (order: Order) => {
    const relatedOps = state.productionOrders.filter((op) => op.orderId === order.id)
    const opText = relatedOps.length ? ` Também serão excluídas ${relatedOps.length} OP(s) ligada(s).` : ''
    const documentLabel = order.documentType.toLowerCase()

    if (!window.confirm(`Excluir ${documentLabel} ${order.id}? Essa ação remove financeiro, entrega e estoque vinculados.${opText}`)) {
      return
    }

    const relatedOpIds = relatedOps.map((op) => op.id)

    const nextState = {
      ...state,
      orders: state.orders.filter((item) => item.id !== order.id),
      productionOrders: state.productionOrders.filter((op) => op.orderId !== order.id),
      cashEntries: state.cashEntries.filter((entry) => entry.source !== order.id),
      inventoryEntries: state.inventoryEntries.filter(
        (entry) =>
          entry.source !== `Entrega ${order.id}` &&
          !relatedOpIds.some((opId) => entry.source === opId || entry.source.startsWith(`${opId} ·`)),
      ),
    }

    setState(nextState)
    void saveStateImmediately(nextState, `${order.documentType} ${order.id} excluído e sincronizado.`)
    setPreviewOrderId((current) => (current === order.id ? null : current))
    setPrintOrderId((current) => (current === order.id ? null : current))
    setPreviewOpId((current) => (current && relatedOpIds.includes(current) ? null : current))
    setPrintOpId((current) => (current && relatedOpIds.includes(current) ? null : current))
    setProductionLaunches((current) =>
      Object.fromEntries(Object.entries(current).filter(([opId]) => !relatedOpIds.includes(opId))),
    )
    setMessage(`${order.documentType} ${order.id} excluído. Estou sincronizando a alteração para os outros dispositivos.`)
  }

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    const order = state.orders.find((item) => item.id === orderId)
    if (status === 'Cancelado' && order) {
      requestOrderCancellation(order)
      return
    }
    if (
      order &&
      !orderPriceApproved(order) &&
      status !== 'Aberto' &&
      status !== 'Cancelado'
    ) {
      setMessage('A aprovação do preço é necessária antes de avançar este pedido.')
      return
    }
    if (status === 'Entregue' && order) {
      const product = state.products.find((item) => item.id === order.productId)
      const deliveredSource = `Entrega ${order.id}`
      const alreadyDelivered = state.inventoryEntries.some(
        (entry) => entry.kind === 'Saída PA' && entry.source === deliveredSource,
      )
      const finishedItemName = product ? productFinishedItemName(product, order.variationId) : ''
      const physical = product
        ? stock.finishedItems.find((item) => item.item === finishedItemName)?.qty ?? 0
        : 0

      if (product && physical < order.qty && !alreadyDelivered) {
        setMessage(
          `Produto acabado insuficiente para entregar ${order.id}. Disponível: ${physical} un; pedido: ${order.qty} un.`,
        )
        setActiveArea('estoque')
        return
      }
    }

    setState((current) => ({
      ...current,
      orders: current.orders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status,
              reservationStatus:
                status === 'Entregue' ? 'Liberado' : order.reservationStatus,
            }
          : order,
      ),
      inventoryEntries:
        status === 'Entregue' && order
          ? (() => {
              const product = current.products.find((item) => item.id === order.productId)
              const deliveredSource = `Entrega ${order.id}`
              const alreadyDelivered = current.inventoryEntries.some(
                (entry) => entry.kind === 'Saída PA' && entry.source === deliveredSource,
              )

              if (!product || alreadyDelivered) return current.inventoryEntries

              return [
                {
                  id: `EST-SAIDA-PA-${Date.now()}`,
                  kind: 'Saída PA' as InventoryKind,
                  item: productFinishedItemName(product, order.variationId),
                  qty: order.qty,
                  unit: 'un',
                  value: productCost(product, order.variationId) * order.qty,
                  source: deliveredSource,
                  createdBy: currentUserName,
                  createdAt: new Date().toISOString(),
                  reason: `Entrega do pedido ${order.id}`,
                },
                ...current.inventoryEntries,
              ]
            })()
          : current.inventoryEntries,
    }))
    setMessage(`Pedido marcado como ${status}.`)
  }

  const updateOrderUnitPrice = (orderId: string, unitPrice: number) => {
    if (!canNegotiatePrice) {
      setMessage('Seu perfil não pode alterar preços de venda.')
      return
    }
    const safePrice = Math.max(0, unitPrice)
    const order = state.orders.find((item) => item.id === orderId)
    if (!order) return
    if (order.status !== 'Aberto' || state.productionOrders.some((op) => op.orderId === orderId)) {
      setMessage('O preço só pode ser alterado enquanto o documento estiver aberto e antes da produção.')
      return
    }
    const product = state.products.find((item) => item.id === order.productId)
    if (!product) return
    const pricing = makeOrderPricing(
      state,
      product,
      order.variationId,
      safePrice,
      currentUserName,
      canApproveDiscount,
    )
    const approvedForRoutine = pricing.approvalStatus !== 'Pendente'
    const now = new Date().toISOString()
    const existingCashEntry = state.cashEntries.find(
      (entry) => entry.source === orderId && entry.category === 'Venda recebida',
    )
    const cashEntriesWithoutSale = state.cashEntries.filter(
      (entry) => !(entry.source === orderId && entry.category === 'Venda recebida'),
    )
    const nextCashEntries =
      order.documentType === 'Pedido' && approvedForRoutine
        ? [
            {
              id: existingCashEntry?.id ?? `CX-${Date.now()}`,
              kind: 'Entrada' as CashKind,
              category: 'Venda recebida' as FinanceCategory,
              description: `Pedido ${order.client}`,
              value: safePrice * order.qty,
              source: order.id,
              dueDate: order.orderDate,
              paid: order.paymentStatus === 'Pago',
              createdBy: existingCashEntry?.createdBy ?? currentUserName,
              createdAt: existingCashEntry?.createdAt ?? now,
              paidAt:
                order.paymentStatus === 'Pago'
                  ? existingCashEntry?.paidAt ?? now
                  : undefined,
            },
            ...cashEntriesWithoutSale,
          ]
        : cashEntriesWithoutSale

    const nextState = {
      ...state,
      orders: state.orders.map((item) =>
        item.id === orderId
          ? {
              ...item,
              unitPrice: safePrice,
              pricing,
              billed: item.documentType === 'Pedido' && approvedForRoutine,
              reservationStatus:
                item.documentType === 'Pedido' && approvedForRoutine ? 'Reservado' : 'Não se aplica',
              reservedAt:
                item.documentType === 'Pedido' && approvedForRoutine
                  ? item.reservedAt ?? new Date().toISOString()
                  : undefined,
            }
          : item,
      ),
      cashEntries: nextCashEntries,
    }

    setState(nextState)
    void saveStateImmediately(
      nextState,
      pricing.approvalStatus === 'Pendente'
        ? `Preço de ${order.id} enviado para aprovação.`
        : `Preço do ${order.documentType.toLowerCase()} ${order.id} sincronizado.`,
    )
    setMessage(
      pricing.approvalStatus === 'Pendente'
        ? `Preço abaixo do mínimo. ${order.id} ficou aguardando aprovação administrativa.`
        : `Preço do ${order.documentType.toLowerCase()} ${order.id} atualizado com margem de ${pricing.realMargin.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%.`,
    )
  }

  const reviewOrderPrice = (orderId: string, decision: 'Aprovada' | 'Recusada') => {
    if (!canApproveDiscount) {
      setMessage('Somente o administrador pode aprovar descontos abaixo do mínimo.')
      return
    }
    const order = state.orders.find((item) => item.id === orderId)
    if (!order?.pricing || order.pricing.approvalStatus !== 'Pendente') return
    const approved = decision === 'Aprovada'
    const now = new Date().toISOString()
    const existingCashEntry = state.cashEntries.find(
      (entry) => entry.source === orderId && entry.category === 'Venda recebida',
    )
    const cashEntriesWithoutSale = state.cashEntries.filter(
      (entry) => !(entry.source === orderId && entry.category === 'Venda recebida'),
    )
    const nextCashEntries =
      approved && order.documentType === 'Pedido'
        ? [
            {
              id: existingCashEntry?.id ?? `CX-${Date.now()}`,
              kind: 'Entrada' as CashKind,
              category: 'Venda recebida' as FinanceCategory,
              description: `Pedido ${order.client}`,
              value: order.qty * order.pricing.negotiatedPrice,
              source: order.id,
              dueDate: order.orderDate,
              paid: order.paymentStatus === 'Pago',
              createdBy: existingCashEntry?.createdBy ?? currentUserName,
              createdAt: existingCashEntry?.createdAt ?? now,
              paidAt:
                order.paymentStatus === 'Pago'
                  ? existingCashEntry?.paidAt ?? now
                  : undefined,
            },
            ...cashEntriesWithoutSale,
          ]
        : cashEntriesWithoutSale
    const nextState = {
      ...state,
      orders: state.orders.map((item) =>
        item.id === orderId
          ? {
              ...item,
              billed: approved && item.documentType === 'Pedido',
              reservationStatus:
                approved && item.documentType === 'Pedido' ? 'Reservado' : 'Não se aplica',
              reservedAt:
                approved && item.documentType === 'Pedido' ? now : undefined,
              pricing: {
                ...item.pricing!,
                approvalStatus: decision,
                approvedBy: currentUserName,
                approvedAt: now,
              },
              history:
                approved && item.documentType === 'Pedido'
                  ? [
                      ...(item.history ?? []),
                      newOrderHistoryEvent('Reserva', `${item.qty} un reservadas após a aprovação do preço`, currentUserName),
                    ]
                  : item.history,
            }
          : item,
      ),
      cashEntries: nextCashEntries,
    }

    setState(nextState)
    void saveStateImmediately(nextState, `Preço de ${order.id} ${decision.toLowerCase()} e sincronizado.`)
    setMessage(
      approved
        ? `Preço de ${order.id} aprovado. O pedido está liberado para financeiro e produção.`
        : `Preço de ${order.id} recusado. Edite o valor para solicitar uma nova análise.`,
    )
  }

  const updateProductSalePrice = (productId: string, variationId: string | undefined, salePrice: number) => {
    if (!canSeeMoney) {
      setMessage('Seu perfil não pode alterar o preço oficial.')
      return
    }
    const safePrice = Math.max(0, Math.round(salePrice))
    const product = state.products.find((item) => item.id === productId)
    if (!product) return
    const minimumPrice = idealPrice(
      productCost(product, variationId),
      state.tax,
      state.commission,
      state.fixedCost,
      0,
    )

    const nextState = {
      ...state,
      products: state.products.map((item) => {
        if (item.id !== productId) return item
        if (!variationId) return { ...item, salePrice: safePrice }

        return {
          ...item,
          variations: item.variations.map((variation) =>
            variation.id === variationId ? { ...variation, salePrice: safePrice } : variation,
          ),
        }
      }),
    }

    setState(nextState)
    void saveStateImmediately(nextState, `Preço de venda de ${product.name} sincronizado.`)
    setOrderUnitPriceInput(safePrice)
    setMessage(
      priceNeedsApproval(safePrice, minimumPrice)
        ? `Preço oficial de ${product.name} atualizado, mas está abaixo do mínimo de ${money(minimumPrice)}.`
        : `Preço oficial de ${product.name} atualizado.`,
    )
  }

  const deleteProductionOrder = (op: ProductionOrder) => {
    if (!window.confirm(`Excluir ordem de produção ${op.id}? Os lançamentos de matéria-prima e produto acabado dessa OP serão removidos.`)) {
      return
    }

    const hasAnotherOpForOrder = state.productionOrders.some(
        (item) => item.id !== op.id && item.orderId && item.orderId === op.orderId,
      )

    const nextState = {
        ...state,
        productionOrders: state.productionOrders.filter((item) => item.id !== op.id),
        inventoryEntries: state.inventoryEntries.filter(
          (entry) => entry.source !== op.id && !entry.source.startsWith(`${op.id} ·`),
        ),
        orders: state.orders.map((order) => {
          if (!op.orderId || order.id !== op.orderId || hasAnotherOpForOrder) return order
          if (order.status === 'Entregue' || order.status === 'Cancelado') return order
          return { ...order, status: 'Aberto' }
        }),
      }

    setState(nextState)
    void saveStateImmediately(nextState, `Ordem de produção ${op.id} excluída e sincronizada.`)
    setPreviewOpId((current) => (current === op.id ? null : current))
    setPrintOpId((current) => (current === op.id ? null : current))
    setProductionLaunches((current) => {
      const next = { ...current }
      delete next[op.id]
      return next
    })
    setMessage(`Ordem de produção ${op.id} excluída. Estou sincronizando a alteração para os outros dispositivos.`)
  }

  const createStockProductionOrder = () => {
    if (!selectedProduct) return
    if (!productReadyForUse(selectedProduct, activeVariationId)) {
      setMessage('Ative o produto e aprove a ficha antes de criar uma produção.')
      return
    }
    if (stockOpQty <= 0) {
      setMessage('Informe uma quantidade maior que zero para criar a produção.')
      return
    }
    const op: ProductionOrder = {
      id: nextProductionOrderId(state.productionOrders),
      productId: selectedProduct.id,
      variationId: activeVariationId,
      qty: stockOpQty,
      produced: 0,
      status: 'Não iniciada',
      priority: stockOpPriority,
      origin: 'Estoque',
      notes: stockOpNotes,
      responsible: stockOpResponsible || currentUserName,
      startedAt: stockOpStartDate,
      finishedAt: '',
      launches: [],
    }
    const missing = productionOrderMissingMaterials(state, selectedProduct, op)
    const nextState: AppState = {
      ...state,
      productionOrders: [op, ...state.productionOrders],
    }

    setState(nextState)
    void saveStateImmediately(nextState, `Produção ${op.id} para estoque criada e sincronizada.`)
    setActiveArea('producao')
    setMessage(
      missing.length
        ? `Produção ${op.id} criada. Antes de iniciar, confira o que falta comprar.`
        : `Produção ${op.id} para estoque criada com matéria-prima disponível.`,
    )
  }

  const updateProductionStatus = (opId: string, status: OpStatus) => {
    const op = state.productionOrders.find((item) => item.id === opId)
    if (op && status === 'Em produção' && op.status !== 'Em produção') {
      const product = state.products.find((item) => item.id === op.productId)
      const remaining = Math.max(0, op.qty - op.produced)
      const missing = product ? missingMaterialsFor(product, remaining, op.variationId) : []

      if (missing.length) {
        setMessage(
          `Antes de iniciar ${op.id}, falta comprar: ${missing
            .map((item) => `${item.missing.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} ${item.unit} de ${item.item}`)
            .join(', ')}.`,
        )
        setActiveArea('estoque')
        return
      }
    }

    const actionDate = currentDateValue()
    const nextState: AppState = {
      ...state,
      productionOrders: state.productionOrders.map((op) =>
        op.id === opId
          ? {
              ...op,
              status,
              startedAt: status === 'Em produção' && !op.startedAt ? actionDate : op.startedAt,
              finishedAt: status === 'Finalizada' ? op.finishedAt || actionDate : op.finishedAt,
            }
          : op,
      ),
      orders: state.orders.map((order) =>
        order.id === op?.orderId
          ? {
              ...order,
              status: status === 'Finalizada' ? 'Pronto' : 'Em produção',
              history: [
                ...(order.history ?? []),
                newOrderHistoryEvent(
                  'Produção',
                  `${opId} ${status === 'Em produção' ? (op?.status === 'Pausada' ? 'retomada' : 'iniciada') : status.toLowerCase()}`,
                  currentUserName,
                ),
              ],
            }
          : order,
      ),
    }
    setState(nextState)
    void saveStateImmediately(nextState, `${opId} marcada como ${status.toLowerCase()} e sincronizada.`)
    setMessage(`Produção marcada como ${status}.`)
  }

  const updateProductionOrder = (
    opId: string,
    field: 'notes' | 'responsible' | 'startedAt' | 'finishedAt' | 'priority',
    value: string,
  ) => {
    setState((current) => ({
      ...current,
      productionOrders: current.productionOrders.map((op) =>
        op.id === opId ? { ...op, [field]: value } : op,
      ),
    }))
    setMessage('Ordem de produção atualizada.')
  }

  const missingMaterialsFor = (product: Product, qty: number, variationId?: string) =>
    productMaterials(product, variationId)
      .map((material) => {
        const available = stock.rawItems.find((item) => item.item === material.name)?.qty ?? 0
        const needed = materialPlannedQty(material, qty)
        return {
          item: material.name,
          unit: material.unit,
          needed,
          available,
          missing: Math.max(0, needed - available),
        }
      })
      .filter((item) => item.missing > 0)

  const registerProductionEvent = (
    op: ProductionOrder,
    eventType: ProductionEventType,
    requestedAmount: number,
    notes = '',
    redirectToStock = true,
  ) => {
    const amount = Math.max(0, requestedAmount)
    if (amount <= 0) {
      setMessage('Informe uma quantidade maior que zero.')
      return
    }
    if (eventType !== 'Produção' && !notes.trim()) {
      setMessage(`Descreva o motivo para registrar ${eventType.toLowerCase()}.`)
      return
    }

    const product = state.products.find((item) => item.id === op.productId)
    if (!product) return

    const remaining = Math.max(0, op.qty - op.produced)
    if (eventType === 'Produção' && remaining <= 0) {
      setMessage('Essa produção já atingiu a quantidade planejada.')
      return
    }

    const eventAmount = eventType === 'Produção' ? Math.min(amount, remaining) : amount
    const consumesMaterials = eventType === 'Produção' || eventType === 'Perda' || eventType === 'Defeito'
    const addsFinishedGoods = eventType === 'Produção'
    const missing = consumesMaterials ? missingMaterialsFor(product, eventAmount, op.variationId) : []
    if (missing.length) {
      setMessage(
        `Estoque insuficiente. Falta comprar: ${missing
          .map((item) => `${item.missing.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} ${item.unit} de ${item.item}`)
          .join(', ')}.`,
      )
      if (redirectToStock) setActiveArea('estoque')
      return
    }

    const nextProduced = addsFinishedGoods ? Math.min(op.qty, op.produced + eventAmount) : op.produced
    const status: OpStatus =
      nextProduced >= op.qty ? 'Finalizada' : nextProduced > 0 ? 'Em produção' : 'Não iniciada'
    const nextStatus: OpStatus = eventType === 'Produção' ? status : 'Em produção'
    const unitCost = productCost(product, op.variationId)
    const launchDate = currentDateValue()
    const responsible = currentUserName
    const timestamp = Date.now()
    const inventoryEntries: InventoryEntry[] = [
      ...(addsFinishedGoods
        ? [{
            id: `EST-PA-${timestamp}`,
            kind: 'Entrada PA' as InventoryKind,
            item: productFinishedItemName(product, op.variationId),
            qty: eventAmount,
            unit: 'un',
            value: unitCost * eventAmount,
            source: `${op.id} · ${eventType}`,
            createdBy: currentUserName,
            createdAt: new Date().toISOString(),
            reason: notes.trim() || `Peças prontas lançadas na ${op.id}`,
          }]
        : []),
      ...(consumesMaterials
        ? productMaterials(product, op.variationId).map((material, index) => ({
            id: `EST-MP-${timestamp}-${index}`,
            kind: 'Consumo MP' as InventoryKind,
            item: material.name,
            qty: materialPlannedQty(material, eventAmount),
            unit: material.unit,
            value: materialPlannedCost(material, eventAmount),
            source: `${op.id} · ${eventType}`,
            createdBy: currentUserName,
            createdAt: new Date().toISOString(),
            reason: notes.trim() || `${eventType} registrada na ${op.id}`,
          }))
        : []),
    ]

    const nextState: AppState = {
      ...state,
      productionOrders: state.productionOrders.map((item) =>
        item.id === op.id
          ? {
              ...item,
              produced: nextProduced,
              status: nextStatus,
              responsible: item.responsible || responsible,
              startedAt: item.startedAt || launchDate,
              finishedAt: nextStatus === 'Finalizada' ? item.finishedAt || launchDate : item.finishedAt,
              launches: [
                ...(item.launches ?? []),
                {
                  id: `LAN-${timestamp}`,
                  date: launchDate,
                  qty: eventAmount,
                  responsible,
                  type: eventType,
                  notes: notes.trim(),
                },
              ],
            }
          : item,
      ),
      orders: state.orders.map((item) =>
        item.id === op.orderId
          ? {
              ...item,
              status: nextStatus === 'Finalizada' ? 'Pronto' : 'Em produção',
              history: [
                ...(item.history ?? []),
                newOrderHistoryEvent(
                  'Produção',
                  eventType === 'Produção'
                    ? `${op.id}: ${eventAmount} un prontas${nextStatus === 'Finalizada' ? ' e produção concluída' : ''}`
                    : `${op.id}: ${eventAmount} un registradas como ${eventType.toLowerCase()}${notes.trim() ? ` · ${notes.trim()}` : ''}`,
                  responsible,
                ),
              ],
            }
          : item,
      ),
      inventoryEntries: [...inventoryEntries, ...state.inventoryEntries],
    }

    setState(nextState)
    void saveStateImmediately(nextState, `${eventType} registrada em ${op.id} e sincronizada.`)
    setProductionLaunches((current) => ({ ...current, [op.id]: 1 }))
    setMessage(
      eventType === 'Produção'
        ? nextStatus === 'Finalizada'
          ? `Produção concluída com ${eventAmount} un prontas. Estoques e pedido foram atualizados.`
          : `${eventAmount} un prontas. Matéria-prima, produto acabado e histórico foram atualizados.`
        : eventType === 'Retrabalho'
          ? `Retrabalho de ${eventAmount} un registrado no histórico.`
          : `${eventAmount} un registradas como ${eventType.toLowerCase()}. A matéria-prima utilizada foi baixada.`,
    )
  }

  const registerProduction = (op: ProductionOrder) => {
    registerProductionEvent(op, 'Produção', productionLaunches[op.id] ?? 1)
  }

  const saveGuidedProduction = () => {
    if (!guidedOp || !guidedProduct) {
      setMessage('Escolha uma produção aberta para registrar o que ficou pronto.')
      return
    }

    const consumesMaterials =
      guidedProductionType === 'Produção' || guidedProductionType === 'Perda' || guidedProductionType === 'Defeito'
    const missing = consumesMaterials
      ? missingMaterialsFor(guidedProduct, guidedLaunchQty, guidedOp.variationId)
      : []
    if (missing.length) {
      setMessage('Não dá para salvar: falta matéria-prima para esse lançamento.')
      return
    }

    registerProductionEvent(
      guidedOp,
      guidedProductionType,
      guidedLaunchQty,
      guidedProductionNotes,
      false,
    )
    setGuidedProductionQty(1)
    setGuidedProductionNotes('')
    setActiveArea('producao-guiada')
  }

  const concludeProductionOrder = (op: ProductionOrder) => {
    const remaining = Math.max(0, op.qty - op.produced)
    if (remaining > 0) {
      setMessage(`Ainda faltam ${remaining} peça(s). Registre a produção antes de concluir a ordem.`)
      return
    }

    const finishedAt = op.finishedAt || currentDateValue()
    const nextState: AppState = {
      ...state,
      productionOrders: state.productionOrders.map((item) =>
        item.id === op.id ? { ...item, status: 'Finalizada', finishedAt } : item,
      ),
      orders: state.orders.map((order) =>
        order.id === op.orderId
          ? {
              ...order,
              status: 'Pronto',
              history: [
                ...(order.history ?? []),
                newOrderHistoryEvent('Produção', `${op.id} concluída`, currentUserName),
              ],
            }
          : order,
      ),
    }
    setState(nextState)
    void saveStateImmediately(nextState, `${op.id} concluída e sincronizada.`)
    setMessage(`${op.id} concluída. O pedido foi liberado como pronto.`)
  }

  const printProductionOrder = (opId: string) => {
    setPrintOrderId(null)
    setPrintOpId(opId)
    window.setTimeout(() => window.print(), 80)
  }

  const downloadProductionOrderPdf = (opId: string) => {
    setMessage('Para baixar em PDF, escolha "Salvar como PDF" na janela que vai abrir.')
    printProductionOrder(opId)
  }

  const printOrderBudget = (orderId: string) => {
    setPrintOpId(null)
    setPrintOrderId(orderId)
    const order = state.orders.find((item) => item.id === orderId)
    setMessage(`${order?.documentType ?? 'Documento'} pronto para imprimir. Para PDF, escolha "Salvar como PDF" na janela.`)
    window.setTimeout(() => window.print(), 80)
  }

  const downloadOrderBudgetPdf = (orderId: string) => {
    setMessage('Para baixar em PDF, escolha "Salvar como PDF" na janela que vai abrir.')
    printOrderBudget(orderId)
  }

  const addFinanceEntry = () => {
    if (!canSeeMoney) {
      setMessage('Somente Administração ou Financeiro pode registrar lançamentos.')
      return
    }
    const now = new Date().toISOString()
    const nextState: AppState = {
      ...state,
      cashEntries: [
        {
          id: `CX-${Date.now()}`,
          kind: financeKind,
          category: financeCategory,
          description: financeDescription || 'Lançamento financeiro',
          value: Math.max(0, financeValue),
          source: 'Manual',
          dueDate: financeDueDate,
          paid: financePaid,
          createdBy: currentUserName,
          createdAt: now,
          paidAt: financePaid ? now : undefined,
        },
        ...state.cashEntries,
      ],
    }
    setState(nextState)
    void saveStateImmediately(nextState, 'Lançamento financeiro salvo e sincronizado.')
    setFinanceView('lancamentos')
    setActiveArea('financeiro')
    setMessage('Lançamento financeiro registrado.')
  }

  const updateFinancePaid = (entryId: string, paid: boolean) => {
    if (!canSeeMoney) {
      setMessage('Somente Administração ou Financeiro pode alterar pagamentos.')
      return
    }
    const entry = state.cashEntries.find((item) => item.id === entryId)
    if (!entry) return
    const now = new Date().toISOString()
    const nextState: AppState = {
      ...state,
      cashEntries: state.cashEntries.map((item) =>
        item.id === entryId
          ? { ...item, paid, paidAt: paid ? now : undefined }
          : item,
      ),
      orders:
        entry.category === 'Venda recebida'
          ? state.orders.map((order) =>
              order.id === entry.source
                ? { ...order, paymentStatus: paid ? 'Pago' : 'Pendente' }
                : order,
            )
          : state.orders,
    }
    setState(nextState)
    void saveStateImmediately(
      nextState,
      paid ? 'Pagamento ou recebimento confirmado.' : 'Lançamento voltou para pendente.',
    )
    setMessage(
      paid
        ? entry.kind === 'Entrada'
          ? 'Recebimento confirmado e pedido atualizado.'
          : 'Conta marcada como paga.'
        : 'Lançamento voltou para pendente.',
    )
  }

  const login = async () => {
    if (normalizedStoreEnabled) {
      const name = loginName.trim()
      if (!name || !loginPassword) {
        setLoginError('Informe seu nome e sua senha.')
        return
      }

      setLoginError('')
      setSyncStatus('Carregando')
      const { error } = await supabase.auth.signInWithPassword({
        email: usernameEmail(name),
        password: loginPassword,
      })

      if (error) {
        setLoginError('Nome ou senha incorretos.')
        setSyncStatus('Erro')
        return
      }

      setLoginPassword('')
      return
    }

    const user = state.users.find(
      (item) =>
        item.name.trim().toLowerCase() === loginName.trim().toLowerCase() &&
        item.password === loginPassword,
    )

    if (!user) {
      setLoginError('Nome ou senha incorretos.')
      return
    }

    setLoggedUserId(user.id)
    setLoginError('')
    setMessage(`Olá, ${user.name}. Escolha uma rotina para começar.`)
    setActiveArea('inicio')
  }

  const logout = async () => {
    if (normalizedStoreEnabled) {
      await supabase.auth.signOut()
      setAuthProfile(null)
      normalizedLoadedRef.current = false
    }
    setLoggedUserId('')
    setLoginPassword('')
    setMessage('Tudo certo por aqui.')
  }

  const refreshSharedState = async () => {
    if (normalizedStoreEnabled) {
      if (normalizedDirtyRef.current || normalizedSavingRef.current) {
        setMessage('Aguarde um instante: há uma alteração sendo salva.')
        return
      }
      await loadNormalizedState('Dados atualizados com o banco compartilhado.')
      return
    }

    await loadCloudState()
  }

  const createUser = async () => {
    const name = newUserName.trim()
    const password = newUserPassword

    if (!name || !password) {
      setMessage('Informe nome e senha para cadastrar o usuário.')
      return
    }

    if (normalizedStoreEnabled && password.length < 8) {
      setMessage('A senha temporária precisa ter pelo menos 8 caracteres.')
      return
    }

    if (state.users.some((user) => user.name.trim().toLowerCase() === name.toLowerCase())) {
      setMessage('Já existe um usuário com esse nome.')
      return
    }

    if (normalizedStoreEnabled) {
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token
      if (!accessToken) {
        setMessage('Sua sessão expirou. Entre novamente.')
        return
      }

      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, password, role: newUserRole }),
      })
      const result = await response.json()

      if (!response.ok) {
        setMessage(result.error || 'Não foi possível cadastrar o usuário.')
        return
      }

      setState((current) => ({
        ...current,
        users: [
          {
            id: result.user.id,
            name: result.user.name,
            password: '',
            role: result.user.role,
          },
          ...current.users,
        ],
      }))
      setNewUserName('Nova sócia')
      setNewUserPassword('')
      setNewUserRole('Sócia')
      setActiveArea('usuarios')
      setMessage(`Usuário ${result.user.name} cadastrado com troca de senha obrigatória.`)
      return
    }

    const user: AppUser = {
      id: `user-${Date.now()}`,
      name,
      password,
      role: newUserRole,
    }

    setState((current) => ({
      ...current,
      users: [user, ...current.users],
    }))
    setNewUserName('Nova sócia')
    setNewUserPassword('')
    setNewUserRole('Sócia')
    setActiveArea('usuarios')
    setMessage(`Usuário ${user.name} cadastrado.`)
  }

  const updateOwnPassword = async () => {
    if (!loggedUser) return

    if (normalizedStoreEnabled) {
      if (newAccountPassword.length < 8) {
        setMessage('A nova senha precisa ter pelo menos 8 caracteres.')
        return
      }

      if (newAccountPassword !== confirmAccountPassword) {
        setMessage('A confirmação da senha não confere.')
        return
      }

      const { error: validationError } = await supabase.auth.signInWithPassword({
        email: usernameEmail(loggedUser.name),
        password: currentPassword,
      })
      if (validationError) {
        setMessage('Senha atual incorreta.')
        return
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newAccountPassword,
      })
      if (updateError) {
        setMessage(`Não foi possível alterar a senha. ${updateError.message}`)
        return
      }

      const { error: profileError } = await (supabase as any).rpc('erp_finish_password_change')
      if (profileError) {
        setMessage('A senha foi atualizada, mas o perfil precisa ser conferido pelo administrador.')
        return
      }

      setAuthProfile((profile) => profile ? { ...profile, mustChangePassword: false } : profile)
      setCurrentPassword('')
      setNewAccountPassword('')
      setConfirmAccountPassword('')
      setActiveArea('inicio')
      setMessage('Senha segura criada. O sistema está liberado.')
      return
    }

    if (currentPassword !== loggedUser.password) {
      setMessage('Senha atual incorreta.')
      return
    }

    if (!newAccountPassword.trim()) {
      setMessage('Informe uma nova senha.')
      return
    }

    if (newAccountPassword !== confirmAccountPassword) {
      setMessage('A confirmação da senha não confere.')
      return
    }

    setState((current) => ({
      ...current,
      users: current.users.map((user) =>
        user.id === loggedUser.id ? { ...user, password: newAccountPassword } : user,
      ),
    }))
    setCurrentPassword('')
    setNewAccountPassword('')
    setConfirmAccountPassword('')
    setActiveArea('configuracoes')
    setMessage('Senha alterada com sucesso.')
  }

  const updateCompanySetting = <K extends keyof CompanySettings>(field: K, value: CompanySettings[K]) => {
    setState((current) => ({
      ...current,
      company: {
        ...current.company,
        [field]: value,
      },
    }))
    setMessage('Configuração da empresa atualizada.')
  }

  const uploadCompanyLogo = (file?: File) => {
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      updateCompanySetting('logoUrl', String(reader.result || ''))
      setMessage('Logo da empresa atualizada.')
    }
    reader.readAsDataURL(file)
  }

  const backupRows = () => [
    {
      tabela: 'Empresa',
      id: 'empresa',
      nome: state.company.name,
      descricao: state.company.address,
      status: 'Ativo',
      quantidade: state.company.budgetValidityDays,
      unidade: 'dias validade',
      valor: '',
      data: currentDateValue(),
      extra: { telefone: state.company.phone, textoOrcamento: state.company.budgetDefaultText },
    },
    ...state.users.map((user) => ({
      tabela: 'Usuários',
      id: user.id,
      nome: user.name,
      descricao: user.role,
      status: 'Cadastrado',
      quantidade: '',
      unidade: '',
      valor: '',
      data: '',
      extra: 'Senha omitida no CSV. Use JSON completo apenas como backup seguro.',
    })),
    ...state.brands.map((brand) => ({
      tabela: 'Marcas',
      id: brand.id,
      nome: brand.name,
      descricao: brand.notes,
      status: brand.prefix,
      quantidade: '',
      unidade: '',
      valor: '',
      data: '',
      extra: '',
    })),
    ...state.customers.map((customer) => ({
      tabela: 'Clientes',
      id: customer.id,
      nome: customer.name,
      descricao: customer.city,
      status: 'Cadastrado',
      quantidade: '',
      unidade: '',
      valor: '',
      data: '',
      extra: { telefone: customer.phone, observacoes: customer.notes },
    })),
    ...state.suppliers.map((supplier) => ({
      tabela: 'Fornecedores',
      id: supplier.id,
      nome: supplier.name,
      descricao: supplier.contact,
      status: 'Cadastrado',
      quantidade: '',
      unidade: '',
      valor: '',
      data: '',
      extra: supplier.notes,
    })),
    ...state.rawMaterials.map((material) => ({
      tabela: 'Matérias-primas',
      id: material.id,
      nome: material.name,
      descricao: material.category ?? 'Matéria-prima',
      status: material.code ?? '',
      quantidade: material.minimumStock,
      unidade: material.unit,
      valor: material.avgCost,
      data: material.lastPurchase ?? '',
      extra: {
        fornecedor: material.supplier,
        compra: material.purchaseUnit,
        fatorConversao: material.purchaseToStockFactor,
      },
    })),
    ...state.products.map((product) => ({
      tabela: 'Produtos',
      id: product.id,
      nome: product.name,
      descricao: product.description,
      status: product.code,
      quantidade: product.variations.length,
      unidade: 'variações',
      valor: productCost(product),
      data: '',
      extra: { marca: product.brand, categoria: product.category, materiais: product.materials },
    })),
    ...state.products.flatMap((product) =>
      product.variations.map((variation) => ({
        tabela: 'Variações',
        id: variation.id,
        nome: `${product.name} · ${variation.name}`,
        descricao: variation.measurements,
        status: variation.color,
        quantidade: variation.materials.length,
        unidade: 'materiais',
        valor: productCost(product, variation.id),
        data: '',
        extra: {
          produto: product.code,
          tamanho: variation.size,
          tecido: variation.fabric,
          observacaoTecnica: variation.technicalNotes,
          materiais: variation.materials,
        },
      })),
    ),
    ...state.purchaseOrders.map((order) => ({
      tabela: 'Pedidos de compra',
      id: order.id,
      nome: order.number,
      descricao: order.item,
      status: order.status,
      quantidade: order.qty,
      unidade: order.unit,
      valor: order.qty * order.unitCost,
      data: order.orderDate,
      extra: {
        fornecedor: order.supplier,
        previsao: order.expectedDate,
        recebido: order.receivedQty,
        estoquePrevisto: `${order.stockQty} ${order.stockUnit}`,
        criadoPor: order.createdBy,
      },
    })),
    ...state.purchaseNotes.map((note) => ({
      tabela: 'Compras de matéria-prima',
      id: note.id,
      nome: note.number,
      descricao: note.item,
      status: note.supplier,
      quantidade: note.qty,
      unidade: note.unit,
      valor: note.qty * note.unitCost,
      data: note.date,
      extra: { custoUnitario: note.unitCost, estoque: `${note.stockQty ?? note.qty} ${note.stockUnit ?? note.unit}`, criadoPor: note.createdBy },
    })),
    ...state.orders.map((order) => ({
      tabela: order.documentType === 'Orçamento' ? 'Orçamentos' : 'Pedidos',
      id: order.id,
      nome: order.client,
      descricao: productDisplayName(state.products.find((product) => product.id === order.productId), order.variationId),
      status: order.status,
      quantidade: order.qty,
      unidade: 'un',
      valor: '',
      data: order.orderDate,
      extra: { tipo: order.documentType, prazo: order.dueDate, faturado: order.billed, criadoPor: order.createdBy, observacoes: order.notes },
    })),
    ...state.productionOrders.map((op) => ({
      tabela: 'Ordens de produção',
      id: op.id,
      nome: productDisplayName(state.products.find((product) => product.id === op.productId), op.variationId),
      descricao: op.origin,
      status: op.status,
      quantidade: op.qty,
      unidade: 'un',
      valor: '',
      data: op.startedAt,
      extra: { pedido: op.orderId, produzido: op.produced, prioridade: op.priority, responsavel: op.responsible, observacoes: op.notes },
    })),
    ...state.productionOrders.flatMap((op) =>
      op.launches.map((launch) => ({
        tabela: 'Lançamentos de produção',
        id: launch.id,
        nome: op.id,
        descricao: launch.responsible,
        status: op.status,
        quantidade: launch.qty,
        unidade: 'un',
        valor: '',
        data: launch.date,
        extra: { op: op.id, tipo: launch.type, observacoes: launch.notes },
      })),
    ),
    ...state.inventoryEntries.map((entry) => ({
      tabela: 'Estoque',
      id: entry.id,
      nome: entry.item,
      descricao: entry.source,
      status: entry.kind,
      quantidade: entry.qty,
      unidade: entry.unit,
      valor: entry.value,
      data: '',
      extra: { criadoPor: entry.createdBy, dataHora: entry.createdAt, motivo: entry.reason },
    })),
    ...state.inventoryCounts.map((count) => ({
      tabela: 'Inventários',
      id: count.id,
      nome: count.item,
      descricao: count.notes,
      status: count.category,
      quantidade: count.countedQty,
      unidade: count.unit,
      valor: count.difference,
      data: count.date,
      extra: { sistema: count.systemQty, diferenca: count.difference, criadoPor: count.createdBy },
    })),
    ...state.implementationResponsibilities.map((responsibility) => ({
      tabela: 'Implantação - responsabilidades',
      id: responsibility.id,
      nome: responsibility.area,
      descricao: state.users.find((user) => user.id === responsibility.userId)?.name ?? '',
      status: 'Definida',
      quantidade: '',
      unidade: '',
      valor: '',
      data: '',
      extra: { usuarioId: responsibility.userId },
    })),
    ...state.implementationProgress.map((progress) => ({
      tabela: 'Implantação - treinamento',
      id: progress.id,
      nome: state.users.find((user) => user.id === progress.userId)?.name ?? '',
      descricao: implementationSteps.find((step) => step.id === progress.stepId)?.title ?? progress.stepId,
      status: 'Concluído',
      quantidade: '',
      unidade: '',
      valor: '',
      data: progress.completedAt,
      extra: { concluidoPor: progress.completedBy },
    })),
    ...state.implementationQuestions.map((question) => ({
      tabela: 'Implantação - dúvidas',
      id: question.id,
      nome: question.createdBy,
      descricao: question.text,
      status: question.resolved ? 'Resolvida' : 'Em revisão',
      quantidade: '',
      unidade: '',
      valor: '',
      data: question.createdAt,
      extra: { resolvidoPor: question.resolvedBy, resolvidoEm: question.resolvedAt },
    })),
    ...state.cashEntries.map((entry) => ({
      tabela: 'Financeiro',
      id: entry.id,
      nome: entry.description,
      descricao: entry.source,
      status: `${entry.kind} · ${entry.category} · ${entry.paid ? 'Pago' : 'Pendente'}`,
      quantidade: '',
      unidade: '',
      valor: entry.value,
      data: entry.dueDate ?? '',
      extra: {
        criadoPor: entry.createdBy,
        criadoEm: entry.createdAt,
        realizadoEm: entry.paidAt,
      },
    })),
  ]

  const exportBackupJson = () => {
    downloadTextFile(
      `macaroca-backup-${fileDateTime()}.json`,
      JSON.stringify({ exportedAt: new Date().toISOString(), storageKey, data: state }, null, 2),
      'application/json;charset=utf-8',
    )
    setMessage('Backup completo em JSON exportado.')
  }

  const exportBackupCsv = () => {
    downloadTextFile(
      `macaroca-dados-${fileDateTime()}.csv`,
      `\ufeff${rowsToCsv(backupRows())}`,
      'text/csv;charset=utf-8',
    )
    setMessage('CSV para Excel exportado.')
  }

  const startQuickTask = (area: Area, nextMessage: string) => {
    setActiveArea(area)
    setMessage(nextMessage)
  }

  const guidedMissingMaterials =
    guidedProduct && guidedProductionType !== 'Retrabalho'
      ? missingMaterialsFor(guidedProduct, guidedLaunchQty, guidedOp?.variationId)
      : []
  const stockOpMaterialShortages = selectedProduct
    ? missingMaterialsFor(selectedProduct, Math.max(0, stockOpQty), activeVariationId)
    : []
  const guidedMaterialConsumption = guidedProduct
    ? productMaterials(guidedProduct, guidedOp?.variationId).map((material) => ({
        ...material,
        totalQty: materialPlannedQty(material, guidedLaunchQty),
      }))
    : []
  const generalPlan = {
    pendingOrders: state.orders.filter(
      (order) => order.documentType === 'Pedido' && (order.status === 'Aberto' || order.status === 'Em produção'),
    ),
    openOps: state.productionOrders.filter((op) => op.status !== 'Finalizada'),
    readyOrders: state.orders.filter((order) => order.documentType === 'Pedido' && order.status === 'Pronto'),
    overdueOrders: state.orders.filter(
      (order) =>
        order.documentType === 'Pedido' &&
        order.status !== 'Entregue' &&
        order.status !== 'Cancelado' &&
        order.dueDate &&
        order.dueDate < currentDateValue(),
    ),
    attentionStock: [...dashboard.lowRaw, ...dashboard.lowFinished],
    nextOps: state.productionOrders
      .filter((op) => op.status !== 'Finalizada')
      .slice()
      .sort((left, right) => priorityWeight(right.priority) - priorityWeight(left.priority)),
  }
  const pendingOrdersByDueDate = generalPlan.pendingOrders
    .slice()
    .sort((left, right) => (left.dueDate || '').localeCompare(right.dueDate || ''))
  const oldestPendingOrder = pendingOrdersByDueDate[0]
  const hasProductionOrder = (orderId: string) =>
    state.productionOrders.some((op) => op.orderId === orderId)
  const sameProductDemand = (order: Order, productId: string, variationId?: string) =>
    order.productId === productId && (order.variationId ?? '') === (variationId ?? '')
  const sameProductProduction = (op: ProductionOrder, productId: string, variationId?: string) =>
    op.productId === productId && (op.variationId ?? '') === (variationId ?? '')
  const orderStockPosition = (order: Order) => {
    const product = state.products.find((item) => item.id === order.productId)
    const finishedName = product ? productFinishedItemName(product, order.variationId) : ''
    const physical = finishedName
      ? stock.finishedItems.find((item) => item.item === finishedName)?.qty ?? 0
      : 0
    const pending = state.orders
      .filter(
        (item) =>
          orderIsReserved(item) &&
          sameProductDemand(item, order.productId, order.variationId),
      )
      .reduce((sum, item) => sum + item.qty, 0)
    const producing = state.productionOrders
      .filter((op) => sameProductProduction(op, order.productId, order.variationId) && op.status !== 'Finalizada')
      .reduce((sum, op) => sum + Math.max(0, op.qty - op.produced), 0)
    const otherPending = Math.max(0, pending - order.qty)
    const freeForThisOrder = Math.max(0, physical - otherPending)
    const toProduce = Math.max(0, pending - physical - producing)
    const suggestedQty = Math.min(order.qty, toProduce)

    return {
      product,
      physical,
      pending,
      producing,
      otherPending,
      freeForThisOrder,
      availableAfterReservations: physical - pending,
      toProduce,
      suggestedQty,
    }
  }
  const productionDecisionOrder = productionDecisionOrderId
    ? state.orders.find((order) => order.id === productionDecisionOrderId)
    : undefined
  const productionDecisionPosition = productionDecisionOrder
    ? orderStockPosition(productionDecisionOrder)
    : undefined
  const openProductionDecision = (order: Order) => {
    if (order.documentType === 'Orçamento') {
      setMessage('Transforme o orçamento em pedido antes de enviar para produção.')
      return
    }

    if (!orderPriceApproved(order)) {
      setMessage('O preço deste pedido precisa de aprovação administrativa antes da produção.')
      setActiveArea('pedidos')
      return
    }

    if (hasProductionOrder(order.id)) {
      setMessage('Esse pedido já possui produção criada.')
      return
    }

    const position = orderStockPosition(order)
    if (position.suggestedQty <= 0) {
      setMessage('Esse pedido parece coberto pelo estoque pronto. Separe do estoque antes de criar produção.')
      return
    }

    setProductionDecisionOrderId(order.id)
    setProductionDecisionQty(Math.max(1, position.suggestedQty))
  }
  const salesFlow = {
    open: state.orders.filter((order) => order.documentType === 'Pedido' && order.status === 'Aberto'),
    inProduction: state.orders.filter((order) => order.documentType === 'Pedido' && order.status === 'Em produção'),
    ready: state.orders.filter((order) => order.documentType === 'Pedido' && order.status === 'Pronto'),
    delivered: state.orders.filter((order) => order.documentType === 'Pedido' && order.status === 'Entregue'),
    active: state.orders.filter((order) => order.documentType === 'Pedido' && order.status !== 'Entregue' && order.status !== 'Cancelado'),
  }
  const ordersWaitingProductionOrder = salesFlow.open.filter(
    (order) =>
      orderPriceApproved(order) &&
      !hasProductionOrder(order.id) &&
      orderStockPosition(order).suggestedQty > 0,
  )
  const pcpOrderPlans = useMemo(() => {
    const eligibleOrders = state.orders
      .filter(
        (order) =>
          orderIsReserved(order) &&
          orderPriceApproved(order) &&
          (order.status === 'Aberto' || order.status === 'Em produção'),
      )
      .slice()
      .sort((left, right) => {
        const dueDateOrder = (left.dueDate || '9999-12-31').localeCompare(right.dueDate || '9999-12-31')
        if (dueDateOrder !== 0) return dueDateOrder
        return (left.createdAt || left.orderDate || '').localeCompare(right.createdAt || right.orderDate || '')
      })
    const groupedOrders = new Map<string, Order[]>()

    eligibleOrders.forEach((order) => {
      const key = `${order.productId}::${order.variationId ?? ''}`
      groupedOrders.set(key, [...(groupedOrders.get(key) ?? []), order])
    })

    return Array.from(groupedOrders.entries()).flatMap(([key, orders]) => {
      const [productId, variationId = ''] = key.split('::')
      const product = state.products.find((item) => item.id === productId)
      const finishedName = product ? productFinishedItemName(product, variationId || undefined) : ''
      const physical = finishedName
        ? stock.finishedItems.find((item) => item.item === finishedName)?.qty ?? 0
        : 0
      const producing = state.productionOrders
        .filter(
          (op) =>
            op.productId === productId &&
            (op.variationId ?? '') === variationId &&
            op.status !== 'Finalizada',
        )
        .reduce((sum, op) => sum + Math.max(0, op.qty - op.produced), 0)
      const pending = orders.reduce((sum, order) => sum + order.qty, 0)
      let coverage = Math.max(0, physical + producing)

      return orders.map((order) => {
        const covered = Math.min(order.qty, coverage)
        const suggestedQty = Math.max(0, order.qty - covered)
        coverage = Math.max(0, coverage - order.qty)
        const relatedOp = state.productionOrders.find(
          (op) => op.orderId === order.id && op.status !== 'Finalizada',
        )

        return {
          order,
          product,
          variationId: variationId || undefined,
          physical,
          pending,
          producing,
          available: physical - pending,
          covered,
          suggestedQty,
          priority: productionPriorityForDueDate(order.dueDate),
          relatedOp,
        }
      })
    })
  }, [state.orders, state.productionOrders, state.products, stock.finishedItems])
  const pcpSelectablePlans = pcpOrderPlans.filter(
    (plan) => plan.suggestedQty > 0 && !plan.relatedOp && plan.order.status === 'Aberto',
  )
  const pcpAdjustablePlans = pcpOrderPlans.filter(
    (plan) => plan.suggestedQty > 0 && Boolean(plan.relatedOp),
  )
  const pcpCoveredPlans = pcpOrderPlans.filter(
    (plan) => plan.suggestedQty === 0 && !plan.relatedOp && plan.order.status === 'Aberto',
  )
  const productionNeedRows = useMemo(() => {
    const rows = new Map<string, (typeof pcpOrderPlans)[number] & { toProduce: number }>()

    pcpOrderPlans.forEach((plan) => {
      const key = `${plan.order.productId}::${plan.variationId ?? ''}`
      if (rows.has(key)) return
      rows.set(key, {
        ...plan,
        toProduce: Math.max(0, plan.pending - plan.physical - plan.producing),
      })
    })

    return Array.from(rows.values()).filter(
      (row) => row.pending > 0 || row.producing > 0 || row.toProduce > 0,
    )
  }, [pcpOrderPlans])
  const selectedPcpPlans = pcpSelectablePlans.filter((plan) =>
    pcpSelectedOrderIds.includes(plan.order.id),
  )
  const selectedPcpSuggestedQty = selectedPcpPlans.reduce(
    (sum, plan) => sum + plan.suggestedQty,
    0,
  )
  const selectedPcpPlannedQty = selectedPcpPlans.reduce(
    (sum, plan) =>
      sum + Math.max(0, Math.floor(pcpOrderQuantities[plan.order.id] ?? plan.suggestedQty)),
    0,
  )
  const selectedPcpExtraStockQty = selectedPcpPlans.reduce(
    (sum, plan) => {
      const plannedQty = Math.max(
        0,
        Math.floor(pcpOrderQuantities[plan.order.id] ?? plan.suggestedQty),
      )
      return sum + Math.max(0, plannedQty - plan.suggestedQty)
    },
    0,
  )
  const selectedPcpMaterialShortages = (() => {
    const required = new Map<string, { item: string; unit: string; needed: number }>()

    selectedPcpPlans.forEach((plan) => {
      if (!plan.product) return
      const qty = Math.max(0, Math.floor(pcpOrderQuantities[plan.order.id] ?? plan.suggestedQty))
      productMaterials(plan.product, plan.variationId).forEach((material) => {
        const current = required.get(material.name) ?? {
          item: material.name,
          unit: material.unit,
          needed: 0,
        }
        required.set(material.name, {
          ...current,
          needed: current.needed + materialPlannedQty(material, qty),
        })
      })
    })

    return Array.from(required.values())
      .map((item) => {
        const available = stock.rawItems.find((raw) => raw.item === item.item)?.qty ?? 0
        return { ...item, available, missing: Math.max(0, item.needed - available) }
      })
      .filter((item) => item.missing > 0)
  })()
  const togglePcpOrder = (orderId: string) => {
    const plan = pcpSelectablePlans.find((item) => item.order.id === orderId)
    if (!plan) return

    setPcpSelectedOrderIds((current) =>
      current.includes(orderId)
        ? current.filter((id) => id !== orderId)
        : [...current, orderId],
    )
    setPcpOrderQuantities((current) => ({
      ...current,
      [orderId]: current[orderId] ?? Math.max(1, plan.suggestedQty),
    }))
  }
  const toggleAllPcpOrders = () => {
    const selectableIds = pcpSelectablePlans.map((plan) => plan.order.id)
    const allSelected = selectableIds.length > 0 && selectableIds.every((id) => pcpSelectedOrderIds.includes(id))

    if (allSelected) {
      setPcpSelectedOrderIds([])
      return
    }

    setPcpSelectedOrderIds(selectableIds)
    setPcpOrderQuantities((current) => {
      const next = { ...current }
      pcpSelectablePlans.forEach((plan) => {
        next[plan.order.id] = next[plan.order.id] ?? Math.max(1, plan.suggestedQty)
      })
      return next
    })
  }
  const generateSelectedPcpOrders = () => {
    if (!selectedPcpPlans.length) {
      setMessage('Selecione ao menos um pedido que precise de produção.')
      return
    }

    const createdOps: ProductionOrder[] = []
    const createdOrderIds = new Set<string>()
    const usedProductionOrders = [...state.productionOrders]

    selectedPcpPlans.forEach((plan) => {
      if (!plan.product || plan.relatedOp) return
      const requestedQty = Math.floor(pcpOrderQuantities[plan.order.id] ?? plan.suggestedQty)
      const qty = Math.min(plan.order.qty, Math.max(0, requestedQty))
      if (qty <= 0) return
      const extraStockQty = Math.max(0, qty - plan.suggestedQty)
      const extraStockNote =
        extraStockQty > 0
          ? `Inclui ${extraStockQty} un adicional(is) para o estoque.`
          : ''

      const op: ProductionOrder = {
        id: nextProductionOrderId(usedProductionOrders),
        orderId: plan.order.id,
        productId: plan.order.productId,
        variationId: plan.order.variationId,
        qty,
        produced: 0,
        status: 'Não iniciada',
        priority: plan.priority,
        origin: 'Pedido',
        notes: [plan.order.notes, extraStockNote].filter(Boolean).join('\n'),
        responsible: currentUserName,
        startedAt: '',
        finishedAt: '',
        launches: [],
      }
      createdOps.push(op)
      usedProductionOrders.push(op)
      createdOrderIds.add(plan.order.id)
    })

    if (!createdOps.length) {
      setMessage('Informe uma quantidade maior que zero para os pedidos selecionados.')
      return
    }

    const nextState: AppState = {
      ...state,
      productionOrders: [...createdOps, ...state.productionOrders],
      orders: state.orders.map((order) =>
        createdOrderIds.has(order.id)
          ? {
              ...order,
              status: 'Em produção',
              history: [
                ...(order.history ?? []),
                newOrderHistoryEvent(
                  'Produção',
                  (() => {
                    const createdOp = createdOps.find((op) => op.orderId === order.id)
                    const plan = selectedPcpPlans.find((item) => item.order.id === order.id)
                    const extraStockQty = Math.max(0, (createdOp?.qty ?? 0) - (plan?.suggestedQty ?? 0))
                    return `OP criada pelo PCP para ${createdOp?.qty ?? 0} un${
                      extraStockQty > 0 ? `, sendo ${extraStockQty} un adicional(is) para estoque` : ''
                    }`
                  })(),
                  currentUserName,
                ),
              ],
            }
          : order,
      ),
    }

    setState(nextState)
    void saveStateImmediately(nextState, `${createdOps.length} ordem(ns) de produção criada(s) e sincronizada(s).`)
    setPcpSelectedOrderIds([])
    setPcpOrderQuantities({})
    setMessage(
      selectedPcpMaterialShortages.length
        ? `${createdOps.length} OP(s) criada(s). Antes de iniciar, confira a lista do que falta comprar.`
        : `${createdOps.length} OP(s) criada(s) com matéria-prima disponível.`,
    )
  }
  const completeExistingProductionOrder = (plan: (typeof pcpOrderPlans)[number]) => {
    if (!plan.relatedOp || plan.suggestedQty <= 0) return
    if (plan.relatedOp.status === 'Finalizada') {
      setMessage('Essa OP já foi finalizada. Revise o pedido antes de criar uma nova produção.')
      return
    }

    const nextQty = plan.relatedOp.qty + plan.suggestedQty
    const nextState: AppState = {
      ...state,
      productionOrders: state.productionOrders.map((op) =>
        op.id === plan.relatedOp?.id
          ? {
              ...op,
              qty: nextQty,
              priority:
                priorityWeight(plan.priority) > priorityWeight(op.priority)
                  ? plan.priority
                  : op.priority,
            }
          : op,
      ),
      orders: state.orders.map((order) =>
        order.id === plan.order.id
          ? {
              ...order,
              history: [
                ...(order.history ?? []),
                newOrderHistoryEvent(
                  'Produção',
                  `${plan.relatedOp?.id} ajustada para ${nextQty} un após recálculo do PCP`,
                  currentUserName,
                ),
              ],
            }
          : order,
      ),
    }

    setState(nextState)
    void saveStateImmediately(nextState, `${plan.relatedOp.id} ajustada para ${nextQty} un e sincronizada.`)
    setMessage(`${plan.relatedOp.id} foi ajustada para cobrir as ${plan.suggestedQty} peça(s) restantes.`)
  }
  const overdueSmartOrders = state.orders.filter(
    (order) =>
      order.documentType === 'Pedido' &&
      order.status !== 'Entregue' &&
      order.status !== 'Cancelado' &&
      daysUntil(order.dueDate) < 0,
  )
  const nearDueOrders = state.orders.filter((order) => {
    const days = daysUntil(order.dueDate)
    return order.documentType === 'Pedido' && order.status !== 'Entregue' && order.status !== 'Cancelado' && days >= 0 && days <= 3
  })
  const pausedProductionOrders = openProductionOrders.filter((op) => {
    const daysSinceStart = op.startedAt ? Math.abs(daysUntil(op.startedAt)) : 0
    return op.status === 'Pausada' || (op.status === 'Em produção' && daysSinceStart >= 3 && !(op.launches ?? []).length)
  })
  const materialShortageAlerts = openProductionOrders
    .map((op) => {
      const product = state.products.find((item) => item.id === op.productId)
      const remaining = Math.max(0, op.qty - op.produced)
      const missing = product && remaining > 0 ? missingMaterialsFor(product, remaining, op.variationId) : []
      return { op, product, missing }
    })
    .filter((item) => item.missing.length > 0)
  const smartAlerts: SmartAlert[] = [
    ...state.orders
      .filter((order) => order.pricing?.approvalStatus === 'Pendente')
      .map((order) => ({
        id: `preco-pendente-${order.id}`,
        badge: 'Preço em aprovação',
        title: `${order.id} · ${order.client}`,
        detail: `Negociado em ${money(order.pricing!.negotiatedPrice)}; mínimo ${money(order.pricing!.minimumPrice)}. Financeiro e produção estão aguardando.`,
        tone: 'rose' as const,
        actionLabel: canApproveDiscount ? 'Revisar preço' : 'Ver pedido',
        onClick: () => setActiveArea('pedidos'),
      })),
    ...overdueSmartOrders.map((order) => ({
      id: `prazo-vencido-${order.id}`,
      badge: 'Prazo vencido',
      title: `${order.id} · ${order.client}`,
      detail: `Prazo era ${formatDate(order.dueDate)}. Confira produção, estoque ou entrega.`,
      tone: 'rose' as const,
      actionLabel: 'Ver venda',
      onClick: () => setActiveArea('vendas'),
    })),
    ...materialShortageAlerts.map(({ op, product, missing }) => ({
      id: `falta-mp-${op.id}`,
      badge: 'Falta matéria-prima',
      title: `${op.id} · ${productDisplayName(product, op.variationId)}`,
      detail: `Falta comprar ${missing
        .slice(0, 2)
        .map((item) => `${item.missing.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} ${item.unit} de ${item.item}`)
        .join(' e ')}${missing.length > 2 ? '...' : ''}.`,
      tone: 'rose' as const,
      actionLabel: 'Ver estoque',
      onClick: () => setActiveArea('estoque'),
    })),
    ...pausedProductionOrders.map((op) => {
      const product = state.products.find((item) => item.id === op.productId)
      return {
        id: `producao-parada-${op.id}`,
        badge: op.status === 'Pausada' ? 'Produção pausada' : 'Produção parada',
        title: `${op.id} · ${productDisplayName(product, op.variationId)}`,
        detail: op.status === 'Pausada'
          ? 'Essa produção está pausada. Retome ou ajuste o planejamento.'
          : 'Essa produção está aberta há alguns dias sem registro de peças prontas.',
        tone: 'amber' as const,
        actionLabel: 'Abrir produção',
        onClick: () => {
          setGuidedOpId(op.id)
          setActiveArea('producao')
        },
      }
    }),
    ...ordersWaitingProductionOrder.map((order) => {
      const product = state.products.find((item) => item.id === order.productId)
      return {
        id: `sem-op-${order.id}`,
        badge: 'Pedido sem produção',
        title: `${order.id} · ${order.client}`,
        detail: `${productDisplayName(product, order.variationId)} ainda não tem ordem de produção vinculada.`,
        tone: 'amber' as const,
        actionLabel: 'Gerar produção',
        onClick: () => openProductionDecision(order),
      }
    }),
    ...nearDueOrders.map((order) => ({
      id: `prazo-proximo-${order.id}`,
      badge: 'Prazo próximo',
      title: `${order.id} · ${order.client}`,
      detail: `Entrega prevista para ${formatDate(order.dueDate)}. Faltam ${daysUntil(order.dueDate)} dia(s).`,
      tone: 'blue' as const,
      actionLabel: order.status === 'Pronto' ? 'Separar entrega' : 'Ver venda',
      onClick: () => setActiveArea(order.status === 'Pronto' ? 'entregas' : 'vendas'),
    })),
  ]
  const visibleSmartAlerts = smartAlerts.filter((alert) => {
    if (alert.id.startsWith('preco-pendente')) return canAccessArea('pedidos')
    if (alert.id.startsWith('prazo-vencido')) return canAccessArea('vendas')
    if (alert.id.startsWith('falta-mp')) return canAccessArea('estoque')
    if (alert.id.startsWith('producao-parada')) return canAccessArea('producao')
    if (alert.id.startsWith('sem-op')) return canAccessArea('producao')
    if (alert.id.startsWith('prazo-proximo')) return canAccessArea('vendas') || canAccessArea('entregas')
    return true
  })
  const indicatorSummary = useMemo(() => {
    const today = new Date(`${currentDateValue()}T12:00:00`)
    const elapsedDays = (date?: string) => {
      if (!date) return Number.POSITIVE_INFINITY
      const parsed = new Date(date.includes('T') ? date : `${date}T12:00:00`)
      if (Number.isNaN(parsed.getTime())) return Number.POSITIVE_INFINITY
      return Math.max(0, Math.floor((today.getTime() - parsed.getTime()) / 86400000))
    }
    const latestDate = (dates: (string | undefined)[]) =>
      dates.filter((date): date is string => Boolean(date)).sort().at(-1)
    const monthOrders = financeSummary.orderResults.filter((item) =>
      isMonth(item.order.orderDate, indicatorMonth),
    )
    const plannedMonthOps = state.productionOrders.filter((op) => {
      const planningDate = op.startedAt || op.launches?.[0]?.date || op.finishedAt
      return isMonth(planningDate, indicatorMonth)
    })
    const completedMonthOps = state.productionOrders.filter(
      (op) =>
        op.status === 'Finalizada' &&
        Boolean(op.startedAt && op.finishedAt) &&
        isMonth(op.finishedAt, indicatorMonth),
    )
    const delayedOps = openProductionOrders
      .map((op) => {
        const relatedOrder = state.orders.find((order) => order.id === op.orderId)
        const lastActivity = latestDate([
          op.startedAt,
          ...(op.launches ?? []).map((launch) => launch.date),
        ])
        const stoppedDays = elapsedDays(lastActivity)
        const overdue = Boolean(
          relatedOrder?.dueDate &&
            relatedOrder.status !== 'Entregue' &&
            relatedOrder.status !== 'Cancelado' &&
            daysUntil(relatedOrder.dueDate) < 0,
        )
        return {
          op,
          product: state.products.find((product) => product.id === op.productId),
          relatedOrder,
          stoppedDays,
          overdue,
          needsAttention: op.status === 'Pausada' || overdue || stoppedDays >= 3,
        }
      })
      .filter((item) => item.needsAttention)
      .sort((left, right) => right.stoppedDays - left.stoppedDays)
    const plannedQty = plannedMonthOps.reduce((total, op) => total + op.qty, 0)
    const monthLaunches = state.productionOrders.flatMap((op) =>
      (op.launches ?? []).filter((launch) => isMonth(launch.date, indicatorMonth)),
    )
    const producedFromLaunches = monthLaunches
      .filter((launch) => launch.type === 'Produção')
      .reduce((total, launch) => total + launch.qty, 0)
    const legacyProducedQty = plannedMonthOps
      .filter((op) => !(op.launches ?? []).length)
      .reduce((total, op) => total + op.produced, 0)
    const producedQty = producedFromLaunches + legacyProducedQty
    const lostQty = monthLaunches
      .filter((launch) => launch.type === 'Perda' || launch.type === 'Defeito')
      .reduce((total, launch) => total + launch.qty, 0)
    const reworkQty = monthLaunches
      .filter((launch) => launch.type === 'Retrabalho')
      .reduce((total, launch) => total + launch.qty, 0)
    const productionDate = (date: string) =>
      new Date(date.includes('T') ? date : `${date}T12:00:00`)
    const leadTimes = completedMonthOps
      .map((op) => {
        const started = productionDate(op.startedAt)
        const finished = productionDate(op.finishedAt)
        if (Number.isNaN(started.getTime()) || Number.isNaN(finished.getTime())) return undefined
        return Math.max(0, Math.ceil((finished.getTime() - started.getTime()) / 86400000))
      })
      .filter((days): days is number => typeof days === 'number')
    const averageLeadTime = leadTimes.length
      ? leadTimes.reduce((total, days) => total + days, 0) / leadTimes.length
      : 0
    const topProducts = Array.from(
      monthOrders
        .reduce((grouped, item) => {
          const key = `${item.order.productId}:${item.order.variationId ?? ''}`
          const current = grouped.get(key) ?? {
            key,
            product: item.product,
            variationId: item.order.variationId,
            qty: 0,
            revenue: 0,
            orders: 0,
          }
          current.qty += item.order.qty
          current.revenue += item.revenue
          current.orders += 1
          grouped.set(key, current)
          return grouped
        }, new Map<string, {
          key: string
          product?: Product
          variationId?: string
          qty: number
          revenue: number
          orders: number
        }>())
        .values(),
    ).sort((left, right) => right.qty - left.qty)
    const priceDifferences = Array.from(
      monthOrders
        .reduce((grouped, item) => {
          const key = `${item.order.productId}:${item.order.variationId ?? ''}`
          const officialPrice =
            item.order.pricing?.officialPrice ||
            productSalePrice(item.product, item.order.variationId) ||
            item.order.pricing?.suggestedPrice ||
            0
          const soldPrice = orderUnitPrice(state, item.order)
          const current = grouped.get(key) ?? {
            key,
            product: item.product,
            variationId: item.order.variationId,
            qty: 0,
            officialTotal: 0,
            soldTotal: 0,
          }
          current.qty += item.order.qty
          current.officialTotal += officialPrice * item.order.qty
          current.soldTotal += soldPrice * item.order.qty
          grouped.set(key, current)
          return grouped
        }, new Map<string, {
          key: string
          product?: Product
          variationId?: string
          qty: number
          officialTotal: number
          soldTotal: number
        }>())
        .values(),
    )
      .map((item) => {
        const officialAverage = item.qty ? item.officialTotal / item.qty : 0
        const soldAverage = item.qty ? item.soldTotal / item.qty : 0
        return {
          ...item,
          officialAverage,
          soldAverage,
          difference: soldAverage - officialAverage,
          differencePercent: officialAverage
            ? ((soldAverage - officialAverage) / officialAverage) * 100
            : 0,
        }
      })
      .sort((left, right) => left.differencePercent - right.differencePercent)
    const productMargins = financeSummary.productResults
      .map((item) => {
        const profit = item.realizedOrders ? item.realProfit : item.estimatedProfit
        const revenue = item.realizedOrders ? item.realizedRevenue : item.revenue
        return {
          ...item,
          profit,
          margin: revenue ? (profit / revenue) * 100 : 0,
          basis: item.realizedOrders ? 'real' : 'estimada',
        }
      })
      .sort((left, right) => left.margin - right.margin)
    const stockItems = [
      ...stock.rawItems.map((item) => ({ ...item, category: 'Matéria-prima' as const })),
      ...stock.finishedItems.map((item) => ({ ...item, category: 'Produto acabado' as const })),
    ]
    const staleStock = stockItems
      .filter((item) => item.qty > 0)
      .map((item) => {
        const lastMovement = latestDate(
          state.inventoryEntries
            .filter((entry) => entry.item === item.item)
            .map((entry) => entry.createdAt),
        )
        return {
          ...item,
          lastMovement,
          daysWithoutMovement: elapsedDays(lastMovement),
        }
      })
      .filter((item) => !item.lastMovement || item.daysWithoutMovement >= 60)
      .sort((left, right) => right.daysWithoutMovement - left.daysWithoutMovement)
    const monthConsumption = state.inventoryEntries.filter(
      (entry) =>
        entry.kind === 'Consumo MP' &&
        isMonth(entry.createdAt, indicatorMonth),
    )
    const consumptionByMaterial = Array.from(
      monthConsumption
        .reduce((grouped, entry) => {
          const current = grouped.get(entry.item) ?? {
            item: entry.item,
            qty: 0,
            unit: entry.unit,
            value: 0,
            wasteQty: 0,
            wasteValue: 0,
          }
          current.qty += entry.qty
          current.value += entry.value
          if (entry.source.includes('Perda') || entry.source.includes('Defeito')) {
            current.wasteQty += entry.qty
            current.wasteValue += entry.value
          }
          grouped.set(entry.item, current)
          return grouped
        }, new Map<string, {
          item: string
          qty: number
          unit: string
          value: number
          wasteQty: number
          wasteValue: number
        }>())
        .values(),
    ).sort((left, right) => right.value - left.value)

    return {
      delayedOps,
      plannedQty,
      producedQty,
      completionRate: plannedQty ? (producedQty / plannedQty) * 100 : 0,
      lostQty,
      reworkQty,
      averageLeadTime,
      completedOps: completedMonthOps.length,
      productionLaunches: monthLaunches.filter((launch) => launch.type === 'Produção').length,
      topProducts,
      priceDifferences,
      productMargins,
      staleStock,
      consumptionByMaterial,
    }
  }, [
    financeSummary,
    indicatorMonth,
    openProductionOrders,
    state,
    stock.finishedItems,
    stock.rawItems,
  ])
  const implementationOverview = {
    assignedResponsibilities: implementationAreas.filter((area) =>
      state.implementationResponsibilities.some(
        (responsibility) => responsibility.id === area.id && responsibility.userId,
      ),
    ).length,
    selectedCompleted: selectedImplementationSteps.filter((step) =>
      selectedImplementationCompleted.has(step.id),
    ).length,
    openQuestions: state.implementationQuestions.filter((question) => !question.resolved).length,
    countedItems: new Set(
      state.inventoryCounts.map((count) => `${count.category}:${count.item}`),
    ).size,
    expectedInventoryItems: state.rawMaterials.length + finishedCatalog.length,
  }
  const teamImplementationProgress = state.users.map((user) => {
    const role = normalizeUserRole(user.role)
    const steps = implementationSteps.filter((step) => step.roles.includes(role))
    const completed = steps.filter((step) =>
      state.implementationProgress.some(
        (progress) => progress.userId === user.id && progress.stepId === step.id,
      ),
    ).length
    return {
      user,
      completed,
      total: steps.length,
      percent: steps.length ? Math.round((completed / steps.length) * 100) : 0,
    }
  })
  const nextImplementationStep = selectedImplementationSteps.find(
    (step) => !selectedImplementationCompleted.has(step.id),
  )
  const teamTrainingCompleted = teamImplementationProgress.reduce(
    (total, item) => total + item.completed,
    0,
  )
  const teamTrainingTotal = teamImplementationProgress.reduce(
    (total, item) => total + item.total,
    0,
  )
  const implementationReadinessChecks = [
    {
      label: 'Usuários individuais',
      complete: state.users.length > 1,
    },
    {
      label: 'Responsabilidades definidas',
      complete: implementationOverview.assignedResponsibilities === implementationAreas.length,
    },
    {
      label: 'Treinamentos concluídos',
      complete: teamTrainingTotal > 0 && teamTrainingCompleted === teamTrainingTotal,
    },
    {
      label: 'Dúvidas revisadas',
      complete: implementationOverview.openQuestions === 0,
    },
    {
      label: 'Inventário inicial',
      complete:
        implementationOverview.expectedInventoryItems > 0 &&
        implementationOverview.countedItems >= implementationOverview.expectedInventoryItems,
    },
  ]
  const implementationReadinessCompleted = implementationReadinessChecks.filter(
    (check) => check.complete,
  ).length
  const implementationReadinessPercent = Math.round(
    (implementationReadinessCompleted / implementationReadinessChecks.length) * 100,
  )

  const navGroups: { title: string; items: { key: Area; label: string; icon: ReactNode }[] }[] = [
    {
      title: 'Início',
      items: [
        { key: 'inicio', label: 'Módulos', icon: <LayoutDashboard /> },
        { key: 'plano-geral', label: 'Visão geral', icon: <ShieldCheck /> },
        { key: 'ajuda', label: 'Ajuda passo a passo', icon: <FileText /> },
      ],
    },
    {
      title: 'Rotina',
      items: [
        { key: 'modulo-vendas', label: 'Vendas', icon: <ClipboardList /> },
        { key: 'modulo-producao', label: 'Produção', icon: <Scissors /> },
        { key: 'modulo-estoque', label: 'Estoque e compras', icon: <Package /> },
      ],
    },
    {
      title: 'Organização',
      items: [
        { key: 'modulo-cadastros', label: 'Cadastros', icon: <Shirt /> },
        { key: 'modulo-gestao', label: 'Gestão', icon: <WalletCards /> },
      ],
    },
  ]
  const visibleNavGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => canAccessArea(item.key)),
    }))
    .filter((group) => group.items.length > 0)
  const normalizedGuideSearch = guideSearch
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
  const visibleHelpGuides = helpGuides.filter((guide) => {
    if (!normalizedGuideSearch) return true

    return [guide.category, guide.title, ...guide.keywords]
      .join(' ')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .includes(normalizedGuideSearch)
  })
  const moduleTiles: {
    key: Area
    title: string
    detail: string
    badge: string
    icon: ReactNode
    tone: 'dark' | 'rose' | 'green' | 'blue' | 'amber' | 'neutral'
  }[] = [
    {
      key: 'plano-geral',
      title: 'Administrativo',
      detail: 'Cenário geral: pendências, atrasos, alertas e visão rápida.',
      badge: `${generalPlan.pendingOrders.length} pendente(s)`,
      icon: <LayoutDashboard />,
      tone: 'dark',
    },
    {
      key: 'modulo-vendas',
      title: 'Vendas',
      detail: 'Orçamentos, pedidos, clientes e próximos passos.',
      badge: `${salesFlow.active.length} pedido(s)`,
      icon: <ClipboardList />,
      tone: 'rose',
    },
    {
      key: 'modulo-producao',
      title: 'Produção',
      detail: 'Ordens de produção, apontamentos, OPs e prioridades.',
      badge: `${openProductionOrders.length} OP aberta(s)`,
      icon: <Scissors />,
      tone: 'blue',
    },
    {
      key: 'modulo-estoque',
      title: 'Estoque e compras',
      detail: 'Saldos, entradas, saídas, compras e fornecedores.',
      badge: `${generalPlan.attentionStock.length} alerta(s)`,
      icon: <Package />,
      tone: generalPlan.attentionStock.length ? 'amber' : 'neutral',
    },
    {
      key: 'modulo-cadastros',
      title: 'Cadastros',
      detail: 'Produtos, fichas, matérias-primas, clientes e marcas.',
      badge: `${state.products.length} produto(s)`,
      icon: <Shirt />,
      tone: 'neutral',
    },
    {
      key: 'modulo-gestao',
      title: 'Gestão',
      detail: 'Preços, financeiro, usuários, documentos e relatórios.',
      badge: canSeeMoney ? money(totals.balance) : 'acesso restrito',
      icon: <WalletCards />,
      tone: canSeeMoney && totals.balance >= 0 ? 'green' : 'neutral',
    },
  ].filter((item) => canAccessArea(item.key))
  const moduleHubs: {
    key: Area
    eyebrow: string
    title: string
    description: string
    items: {
      key: Area
      title: string
      detail: string
      badge: string
      icon: ReactNode
      primary?: boolean
    }[]
  }[] = [
    {
      key: 'modulo-vendas',
      eyebrow: 'Comercial e atendimento',
      title: 'Vendas',
      description: 'Comece uma venda, acompanhe os pedidos e conclua a entrega sem misturar as etapas.',
      items: [
        { key: 'pedido-guiado', title: 'Criar orçamento ou pedido', detail: 'Escolha cliente, peça, quantidade, preço e prazo.', badge: 'Começar', icon: <Plus />, primary: true },
        { key: 'vendas', title: 'Acompanhar vendas', detail: 'Veja pedidos abertos e a próxima ação de cada um.', badge: `${salesFlow.active.length} aberto(s)`, icon: <ClipboardList /> },
        { key: 'entregas', title: 'Separação e entrega', detail: 'Confira o que está pronto e registre a saída.', badge: `${salesFlow.ready.length} pronto(s)`, icon: <PackageCheck /> },
        { key: 'clientes', title: 'Clientes', detail: 'Cadastre contatos e consulte o histórico de pedidos.', badge: `${state.customers.length} cadastrado(s)`, icon: <Store /> },
      ],
    },
    {
      key: 'modulo-producao',
      eyebrow: 'PCP e ateliê',
      title: 'Produção',
      description: 'Decida o que produzir, acompanhe as ordens e registre somente o que ficou pronto.',
      items: [
        { key: 'producao-necessidades', title: 'O que precisa produzir', detail: 'Compare pedidos, estoque disponível e quantidade faltante.', badge: `${productionNeedRows.length} necessidade(s)`, icon: <PackageCheck />, primary: true },
        { key: 'producao', title: 'Ordens de produção', detail: 'Crie, priorize, confira e imprima as OPs.', badge: `${openProductionOrders.length} aberta(s)`, icon: <Scissors /> },
        { key: 'producao-guiada', title: 'Registrar produção', detail: 'Informe as peças prontas e confirme os materiais usados.', badge: 'Apontar', icon: <Printer /> },
        { key: 'estoque', title: 'Conferir materiais', detail: 'Veja matéria-prima disponível e o que falta comprar.', badge: `${dashboard.lowRaw.length} alerta(s)`, icon: <Package /> },
      ],
    },
    {
      key: 'modulo-estoque',
      eyebrow: 'Materiais e recebimentos',
      title: 'Estoque e compras',
      description: 'Consulte o saldo, registre compras e acompanhe tudo o que entrou ou saiu.',
      items: [
        { key: 'estoque', title: 'Estoque atual', detail: 'Consulte matéria-prima, produto pronto e compras sugeridas.', badge: `${generalPlan.attentionStock.length} alerta(s)`, icon: <Package />, primary: true },
        { key: 'notas', title: 'Compras de matéria-prima', detail: 'Decida o que comprar, acompanhe pedidos e registre recebimentos.', badge: `${openPurchaseOrders.length} a receber`, icon: <ReceiptText /> },
        { key: 'movimentacoes', title: 'Entradas e saídas', detail: 'Consulte o histórico de tudo que movimentou o estoque.', badge: `${state.inventoryEntries.length} registro(s)`, icon: <PackageCheck /> },
        { key: 'fornecedores', title: 'Fornecedores', detail: 'Mantenha os contatos usados nas compras.', badge: `${state.suppliers.length} cadastrado(s)`, icon: <Store /> },
      ],
    },
    {
      key: 'modulo-cadastros',
      eyebrow: 'Base do sistema',
      title: 'Cadastros',
      description: 'Organize as informações usadas nas vendas, fichas técnicas, produção e compras.',
      items: [
        { key: 'produto-guiado', title: 'Cadastrar peça passo a passo', detail: 'Siga quatro passos simples para criar a peça e sua primeira ficha.', badge: 'Começar', icon: <Plus />, primary: true },
        { key: 'produtos', title: 'Produtos e fichas', detail: 'Consulte peças, variações, versões e materiais cadastrados.', badge: `${state.products.length} produto(s)`, icon: <Shirt /> },
        { key: 'materias', title: 'Matérias-primas', detail: 'Defina unidade, conversão, custo e estoque mínimo.', badge: `${state.rawMaterials.length} material(is)`, icon: <Package /> },
        { key: 'clientes', title: 'Clientes', detail: 'Cadastre contatos e informações de entrega.', badge: `${state.customers.length} cliente(s)`, icon: <Store /> },
        { key: 'marcas', title: 'Marcas', detail: 'Configure Maçaroca, Schön e novos prefixos de produto.', badge: `${state.brands.length} marca(s)`, icon: <PackageCheck /> },
      ],
    },
    {
      key: 'modulo-gestao',
      eyebrow: 'Administração',
      title: 'Gestão',
      description: 'Defina preços, acompanhe o dinheiro e controle os acessos ao sistema.',
      items: [
        { key: 'implantacao', title: 'Implantação com a equipe', detail: 'Organize responsabilidades, treinamento, dúvidas e inventário inicial.', badge: `${state.implementationQuestions.filter((question) => !question.resolved).length} dúvida(s)`, icon: <ShieldCheck />, primary: true },
        { key: 'indicadores', title: 'Indicadores', detail: 'Veja atrasos, produção, estoque, vendas e margem com ações diretas.', badge: `${overdueSmartOrders.length + indicatorSummary.delayedOps.length} atenção`, icon: <LayoutDashboard /> },
        { key: 'precos', title: 'Preços de venda', detail: 'Defina o valor oficial de cada peça e variação.', badge: `${state.products.length} produto(s)`, icon: <Calculator /> },
        { key: 'financeiro', title: 'Financeiro', detail: 'Acompanhe recebimentos, despesas, contas e saldo.', badge: canSeeMoney ? money(totals.balance) : 'Restrito', icon: <WalletCards /> },
        { key: 'usuarios', title: 'Usuários e permissões', detail: 'Cadastre pessoas e escolha o que cada perfil acessa.', badge: `${state.users.length} usuário(s)`, icon: <ShieldCheck /> },
        { key: 'historico', title: 'Histórico de alterações', detail: 'Veja quem criou, alterou ou excluiu cada registro.', badge: `${auditEvents.length} evento(s)`, icon: <FileText /> },
        { key: 'configuracoes', title: 'Conta e documentos', detail: 'Altere senha, logo e textos de orçamento e pedido.', badge: 'Configurar', icon: <FileText /> },
        { key: 'painel', title: 'Painel completo', detail: 'Consulte indicadores administrativos e relatórios gerais.', badge: 'Relatórios', icon: <LayoutDashboard /> },
      ],
    },
  ]
    .map((module) => ({
      ...module,
      items: module.items.filter((item) => canAccessArea(item.key)),
    }))
    .filter((module) => canAccessArea(module.key) && module.items.length > 0)
  const activeModuleHub = moduleHubs.find((module) => module.key === activeArea)
  const contextualParentModuleHub = moduleContext
    ? moduleHubs.find(
        (module) =>
          module.key === moduleContext &&
          module.items.some((item) => item.key === activeArea),
      )
    : undefined
  const parentModuleHub =
    contextualParentModuleHub ??
    moduleHubs.find((module) => module.items.some((item) => item.key === activeArea))
  const previewOp = state.productionOrders.find((op) => op.id === previewOpId)
  const previewOrder = state.orders.find((order) => order.id === previewOrderId)
  const printOp = state.productionOrders.find((op) => op.id === printOpId)
  const printOrder = state.orders.find((order) => order.id === printOrderId)
  const cancellationOrder = state.orders.find((order) => order.id === cancelOrderId)
  const pageIntro: Record<Area, { title: string; description: string }> = {
    inicio: {
      title: 'Escolha uma área',
      description: 'Entrada principal do sistema por módulos de trabalho.',
    },
    'plano-geral': {
      title: 'Administrativo',
      description: 'Cenário amplo para acompanhar pendências, pedidos, produção, estoque e financeiro.',
    },
    'modulo-vendas': {
      title: 'Vendas',
      description: 'Escolha o que deseja fazer dentro da rotina comercial.',
    },
    'modulo-producao': {
      title: 'Produção',
      description: 'Escolha uma etapa do planejamento ou da produção.',
    },
    'modulo-estoque': {
      title: 'Estoque e compras',
      description: 'Escolha entre consulta, compra ou histórico de movimentações.',
    },
    'modulo-cadastros': {
      title: 'Cadastros',
      description: 'Escolha a informação que deseja cadastrar ou revisar.',
    },
    'modulo-gestao': {
      title: 'Gestão',
      description: 'Escolha uma área administrativa do sistema.',
    },
    ajuda: {
      title: 'Ajuda passo a passo',
      description: 'Busque uma dúvida e siga os passos na ordem indicada.',
    },
    painel: {
      title: 'Painel completo',
      description: 'Resumo amplo do sistema para conferências administrativas.',
    },
    indicadores: {
      title: 'Indicadores para decidir',
      description: 'Atrasos, produção, vendas, estoque e margem com uma ação clara para cada situação.',
    },
    implantacao: {
      title: 'Implantação com a equipe',
      description: 'Acompanhe usuários, responsabilidades, treinamento, dúvidas e o inventário inicial.',
    },
    vendas: {
      title: 'Acompanhar vendas',
      description: 'Veja pedidos abertos, produção relacionada e entregas pendentes.',
    },
    entregas: {
      title: 'Pedidos prontos para entregar',
      description: 'Separe os pedidos prontos, registre a saída e conclua a venda.',
    },
    'pedido-guiado': {
      title: 'Nova venda',
      description: 'Registre cliente, peça, quantidade, prazo e gere a produção quando necessário.',
    },
    clientes: {
      title: 'Clientes',
      description: 'Cadastre clientes e consulte o histórico de pedidos.',
    },
    'producao-necessidades': {
      title: 'O que precisa produzir?',
      description: 'Compare pedido, estoque disponível e produções abertas antes de criar nova ordem.',
    },
    producao: {
      title: 'Ordens de produção',
      description: 'Acompanhe ordens, ajuste detalhes, imprima e avance o status.',
    },
    'producao-guiada': {
      title: 'Registrar produção',
      description: 'Informe quantas peças ficaram prontas e confirme os materiais utilizados.',
    },
    estoque: {
      title: 'Estoque atual',
      description: 'Consulte matéria-prima, produto acabado e alertas de compra.',
    },
    movimentacoes: {
      title: 'Entradas e saídas',
      description: 'Histórico administrativo de entradas, consumo de materiais e saída de produto pronto.',
    },
    notas: {
      title: 'Compras de matéria-prima',
      description: 'Veja o que comprar, acompanhe o que está a caminho e registre o que chegou.',
    },
    fornecedores: {
      title: 'Fornecedores',
      description: 'Cadastre contatos de compra e recebimento.',
    },
    produtos: {
      title: 'Produtos e fichas',
      description: 'Consulte e mantenha peças, variações e fichas de matéria-prima.',
    },
    'produto-guiado': {
      title: 'Cadastrar uma peça',
      description: 'Siga os passos em linguagem simples. O código e o custo são calculados pelo sistema.',
    },
    materias: {
      title: 'Matérias-primas',
      description: 'Cadastre unidades, conversões, custos e estoque mínimo.',
    },
    marcas: {
      title: 'Marcas',
      description: 'Configure prefixos e marcas para novos produtos.',
    },
    precos: {
      title: 'Preços de venda',
      description: 'Defina o valor oficial das peças e variações antes de registrar pedidos.',
    },
    financeiro: {
      title: 'Financeiro e resultados',
      description: 'Veja caixa, contas e o lucro estimado e real de cada pedido e produto.',
    },
    usuarios: {
      title: 'Usuários',
      description: 'Cadastre acessos e perfis de uso.',
    },
    configuracoes: {
      title: 'Minha conta e documentos',
      description: 'Veja seu perfil, altere sua senha e configure dados dos documentos.',
    },
    historico: {
      title: 'Histórico de alterações',
      description: 'Veja quem criou, alterou ou excluiu cada registro do sistema.',
    },
    pedidos: {
      title: 'Pedidos e entregas',
      description: 'Tela completa de pedidos, usada como apoio operacional.',
    },
  }
  const navigateFromMenu = (area: Area) => {
    if (area.startsWith('modulo-')) setModuleContext(area)
    setActiveArea(area)
    setMobileMenuOpen(false)
    setMessage(
      area === 'inicio'
        ? `Olá, ${currentUserName}. Escolha uma rotina para começar.`
        : `Você entrou em ${pageIntro[area].title}.`,
    )
  }

  if (!authReady) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f8fafc] px-5 text-[#111827]">
        <div className="text-center">
          <RefreshCw className="mx-auto h-6 w-6 animate-spin text-[#3730a3]" />
          <p className="mt-3 text-sm text-black/55">Conferindo acesso seguro...</p>
        </div>
      </div>
    )
  }

  if (!loggedUser) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f8fafc] px-5 text-[#111827]">
        <div className="w-full max-w-md rounded-lg border border-[#d9c7bd] bg-[#ffffff] p-7 shadow-[0_22px_60px_rgba(49,35,30,0.10)]">
          {isTestEnvironment && (
            <div className="mb-5 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-center text-xs font-semibold uppercase tracking-[0.08em] text-amber-900">
              Ambiente de teste · dados separados
            </div>
          )}
          <div className="mb-7 flex items-center gap-4">
            <img src={companyLogo} alt={state.company.name} className="h-16 w-auto rounded-md object-contain" />
            <div>
              <p className="text-sm text-black/50">Rotina interna Maçaroca</p>
              <h1 className="font-serif text-4xl leading-tight">Bem-vinda</h1>
            </div>
          </div>
          <form
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault()
              void login()
            }}
          >
            <SoftInput label="Nome" value={loginName} onChange={setLoginName} />
            <label className="grid gap-2">
              <FieldLabel>Senha</FieldLabel>
              <input
                type="password"
                value={loginPassword}
                onChange={(event) => setLoginPassword(event.target.value)}
                className="h-11 rounded-md border border-black/10 bg-white px-3 text-sm outline-none focus:border-[#3730a3]"
              />
            </label>
            {loginError && (
              <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900">
                {loginError}
              </div>
            )}
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#111827] px-4 text-sm font-medium text-white shadow-[0_10px_24px_rgba(33,31,28,0.18)] transition hover:bg-[#3730a3]"
            >
              Acessar sistema
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
          <p className="mt-4 text-xs text-black/45">
            Use seu nome e senha para registrar pedidos, compras e produções no seu usuário.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#111827]">
      <style>
        {`
          .document-print-sheet { display: none; }
          @media print {
            body * { visibility: hidden; }
            .document-print-sheet, .document-print-sheet * { visibility: visible; }
            .document-print-sheet {
              display: block;
              position: absolute;
              inset: 0;
              min-height: 100vh;
              background: white;
              color: #111;
              padding: 28px;
              font-family: Arial, sans-serif;
            }
          }
        `}
      </style>
      {printOp && <ProductionOrderPrint op={printOp} state={state} />}
      {printOrder && <OrderBudgetPrint order={printOrder} state={state} />}
      {previewOrder && (
        <OrderBudgetPreview
          order={previewOrder}
          state={state}
          onClose={() => setPreviewOrderId(null)}
          onPrint={() => printOrderBudget(previewOrder.id)}
          onDownloadPdf={() => downloadOrderBudgetPdf(previewOrder.id)}
        />
      )}
      {cancellationOrder && (
        <OrderCancellationDialog
          order={cancellationOrder}
          reason={cancellationReason}
          onReasonChange={setCancellationReason}
          onClose={() => {
            setCancelOrderId(null)
            setCancellationReason('')
          }}
          onConfirm={confirmOrderCancellation}
        />
      )}
      {previewOp && (
        <ProductionOrderPreview
          op={previewOp}
          state={state}
          onClose={() => setPreviewOpId(null)}
          onPrint={() => printProductionOrder(previewOp.id)}
          onDownloadPdf={() => downloadProductionOrderPdf(previewOp.id)}
        />
      )}
      {productionDecisionOrder && productionDecisionPosition && (
        <ProductionDecisionPreview
          order={productionDecisionOrder}
          product={productionDecisionPosition.product}
          position={productionDecisionPosition}
          qty={productionDecisionQty}
          onQtyChange={setProductionDecisionQty}
          onClose={() => setProductionDecisionOrderId(null)}
          onConfirm={() => generateProductionOrder(productionDecisionOrder, productionDecisionQty)}
        />
      )}
      <div className={`macaroca-system grid min-h-screen transition-[grid-template-columns] duration-300 ${sidebarCompact ? 'lg:grid-cols-[88px_minmax(0,_1fr)]' : 'lg:grid-cols-[292px_minmax(0,_1fr)]'}`}>
        <aside className="border-b border-[#e5e7eb] bg-white transition-all duration-300 lg:border-b-0 lg:border-r">
          <div className={`flex items-center gap-3 border-b border-[#e5e7eb] px-4 py-3 lg:px-5 lg:py-5 ${sidebarCompact ? 'lg:flex-col lg:px-3' : ''}`}>
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-[#111827] p-1.5 shadow-[0_10px_24px_rgba(33,31,28,0.12)] lg:h-16 lg:w-16 lg:p-2">
              <img src={companyLogo} alt={state.company.name} className="max-h-12 max-w-12 object-contain" />
            </div>
            <div className={sidebarCompact ? 'lg:hidden' : ''}>
              <strong className="block text-sm">Maçaroca</strong>
              <span className="text-xs text-black/50">Rotina do ateliê</span>
            </div>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((current) => !current)}
              className="ml-auto inline-flex h-9 items-center gap-2 rounded-md border border-[#d1d5db] bg-white px-3 text-sm font-medium text-[#111827] lg:hidden"
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              Menu
            </button>
            <button
              type="button"
              onClick={() => setSidebarCompact((current) => !current)}
              className={`ml-auto hidden h-9 w-9 items-center justify-center rounded-md border border-[#e5e7eb] bg-white text-[#4b5563] transition hover:border-[#9ca3af] lg:inline-flex ${sidebarCompact ? 'lg:ml-0' : ''}`}
              aria-label={sidebarCompact ? 'Abrir menu lateral' : 'Recolher menu lateral'}
              title={sidebarCompact ? 'Abrir menu' : 'Recolher menu'}
            >
              {sidebarCompact ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          </div>

          <nav className={`${mobileMenuOpen ? 'grid' : 'hidden'} gap-5 p-4 lg:grid ${sidebarCompact ? 'lg:px-3' : ''}`}>
            {visibleNavGroups.map((group) => (
              <div key={group.title}>
                <p className={`mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 ${sidebarCompact ? 'lg:text-center lg:text-[9px] lg:tracking-[0.08em]' : ''}`}>
                  {group.title}
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-1">
                  {group.items.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => {
                        navigateFromMenu(item.key)
                      }}
                      className={`flex h-11 items-center gap-3 rounded-md px-3 text-left text-sm transition ${
                        activeArea === item.key
                          ? 'bg-[#312e81] text-white shadow-sm'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                      } ${sidebarCompact ? 'lg:justify-center lg:px-0' : ''}`}
                      title={sidebarCompact ? item.label : undefined}
                    >
                      <span className="grid h-5 w-5 place-items-center [&_svg]:h-4 [&_svg]:w-4">
                        {item.icon}
                      </span>
                      <span className={sidebarCompact ? 'lg:hidden' : ''}>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        <main className="min-w-0">
          <header className="sticky top-0 z-20 border-b border-[#e5e7eb] bg-white/95 px-4 py-3 backdrop-blur md:px-8 md:py-4">
            <div className="mx-auto flex max-w-[1220px] flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex min-w-0 items-center gap-4">
                {parentModuleHub && (
                  <button
                    type="button"
                    onClick={() => navigateFromMenu(parentModuleHub.key)}
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:text-slate-950"
                    aria-label={`Voltar para ${parentModuleHub.title}`}
                    title={`Voltar para ${parentModuleHub.title}`}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                )}
                <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-md bg-[#111827] p-2 sm:flex">
                  <img src={companyLogo} alt={state.company.name} className="max-h-full max-w-full object-contain" />
                </div>
                <div className="min-w-0">
                  <p className="hidden text-sm text-slate-500 sm:block">{pageIntro[activeArea].description}</p>
                  <h1 className="text-xl font-semibold leading-tight tracking-tight md:mt-1 md:text-[2rem]">{pageIntro[activeArea].title}</h1>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 md:justify-end">
                {isTestEnvironment && (
                  <div className="flex h-9 items-center rounded-md border border-amber-300 bg-amber-50 px-2.5 text-xs font-semibold uppercase tracking-[0.06em] text-amber-900">
                    Ambiente de teste
                  </div>
                )}
                <div className="flex h-9 items-center gap-2 rounded-md border border-[#e5e7eb] bg-[#ffffff] px-2.5 text-sm">
                  <ShieldCheck className="h-4 w-4 text-[#3730a3]" />
                  <span className="hidden text-black/55 xl:inline">{currentUserName}</span>
                  <strong>{userRole}</strong>
                </div>
                <button
                  type="button"
                  onClick={() => void refreshSharedState()}
                  className={`flex h-9 items-center gap-2 rounded-md border px-2.5 text-sm transition hover:shadow-sm ${
                    syncStatus === 'Compartilhado'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                      : syncStatus === 'Salvando'
                        ? 'border-sky-200 bg-sky-50 text-sky-800'
                        : 'border-amber-200 bg-amber-50 text-amber-900'
                  }`}
                  title={`${syncDetail} Clique para sincronizar agora.`}
                >
                  <span className="h-2 w-2 rounded-full bg-current" />
                  <strong>{syncStatus}</strong>
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>
                {canManagePurchases && (
                  <button
                    type="button"
                    onClick={() => navigateFromMenu('notas')}
                    className="hidden h-9 items-center gap-2 rounded-md bg-[#312e81] px-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#3730a3] md:inline-flex"
                  >
                    <FileText className="h-4 w-4" />
                    Compra
                  </button>
                )}
                {canAccessArea('pedido-guiado') && (
                  <button
                    type="button"
                    onClick={() => navigateFromMenu('pedido-guiado')}
                    className="hidden h-9 items-center gap-2 rounded-md bg-[#111827] px-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#3730a3] md:inline-flex"
                  >
                    <Plus className="h-4 w-4" />
                    Nova venda
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => navigateFromMenu('configuracoes')}
                  className="inline-flex h-9 items-center gap-2 rounded-md border border-[#e5e7eb] bg-[#ffffff] px-2.5 text-sm font-medium transition hover:border-[#9ca3af] hover:bg-white"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Conta
                </button>
                <button
                  type="button"
                  onClick={() => void logout()}
                  className="inline-flex h-9 items-center gap-2 rounded-md border border-[#e5e7eb] bg-[#ffffff] px-2.5 text-sm font-medium transition hover:border-[#9ca3af] hover:bg-white"
                >
                  Sair
                </button>
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-[1220px] px-4 py-4 md:px-8 md:py-6">
            <div className="mb-3 rounded-md border border-[#e5e7eb] bg-white px-3 py-2 text-sm text-slate-600 md:mb-6 md:px-4 md:py-3">
              {message}
            </div>

            {parentModuleHub && (
              <ModuleSectionTabs
                moduleTitle={parentModuleHub.title}
                items={parentModuleHub.items}
                activeArea={activeArea}
                onSelect={(area) => {
                  setModuleContext(parentModuleHub.key)
                  setActiveArea(area)
                  setMessage(`Você entrou em ${pageIntro[area].title}.`)
                }}
              />
            )}

            {activeArea === 'inicio' && (
              <section className="grid gap-5">
                <section className="overflow-hidden rounded-lg border border-[#e5e7eb] bg-[#ffffff] shadow-[0_12px_34px_rgba(49,35,30,0.045)]">
                  <div className="grid gap-4 border-b border-[#e5e7eb] bg-[#ffffff] p-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-stretch">
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="grid h-16 w-16 shrink-0 place-items-center rounded-md bg-[#111827] p-2">
                        <img src={companyLogo} alt={state.company.name} className="max-h-12 max-w-12 object-contain" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-black/38">
                          Central de módulos
                        </span>
                        <h2 className="mt-1 font-serif text-3xl leading-tight">Maçaroca</h2>
                        <p className="mt-1 text-sm leading-5 text-black/52">
                          Escolha a área de trabalho. Depois, cada módulo mostra só o que precisa para aquela rotina.
                        </p>
                      </div>
                    </div>
                    <div className="hidden gap-2 rounded-md border border-[#e5e7eb] bg-white p-3 text-sm text-black/58 sm:grid sm:grid-cols-3 lg:grid-cols-1">
                      <div>
                        <span className="block text-xs uppercase text-black/35">Usuário</span>
                        <strong className="text-[#111827]">{currentUserName}</strong>
                      </div>
                      <div>
                        <span className="block text-xs uppercase text-black/35">Hoje</span>
                        <strong className="text-[#111827]">{new Date().toLocaleDateString('pt-BR')}</strong>
                      </div>
                      <div>
                        <span className="block text-xs uppercase text-black/35">Sincronização</span>
                        <strong className="text-[#111827]">{syncStatus}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-3 sm:gap-3 sm:p-4 xl:grid-cols-4">
                    {moduleTiles.map((item) => (
                      <ModuleTile
                        key={item.key}
                        title={item.title}
                        detail={item.detail}
                        badge={item.badge}
                        icon={item.icon}
                        tone={item.tone}
                        onClick={() => navigateFromMenu(item.key)}
                      />
                    ))}
                  </div>
                </section>
              </section>
            )}

            {activeArea === 'ajuda' && (
              <section className="grid gap-5">
                <div className="border-b border-[#e5e7eb] bg-white p-4 md:p-6">
                  <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                    <label className="grid min-w-0 gap-2">
                      <FieldLabel>O que você precisa fazer?</FieldLabel>
                      <div className="flex min-w-0 items-center gap-2">
                        <input
                          type="search"
                          value={guideSearch}
                          onChange={(event) => setGuideSearch(event.target.value)}
                          placeholder="Ex.: criar pedido, definir preço, produzir, estoque..."
                          className="h-11 min-w-0 flex-1 rounded-md border border-[#d1d5db] bg-white px-3 text-sm outline-none transition focus:border-[#3730a3] focus:ring-2 focus:ring-[#3730a3]/10"
                        />
                        {guideSearch && (
                          <button
                            type="button"
                            onClick={() => setGuideSearch('')}
                            className="grid h-11 w-11 shrink-0 place-items-center rounded-md border border-[#d1d5db] bg-white text-slate-600 transition hover:border-slate-400 hover:text-slate-950"
                            aria-label="Limpar busca"
                            title="Limpar busca"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['Pedido', 'Preço', 'Produção', 'Estoque', 'Produto', 'Senha'].map((term) => (
                        <button
                          key={term}
                          type="button"
                          onClick={() => setGuideSearch(term)}
                          className="h-9 rounded-md border border-[#d1d5db] bg-white px-3 text-sm font-medium text-slate-700 transition hover:border-[#3730a3] hover:text-[#3730a3]"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold">Guias disponíveis</h2>
                    <p className="text-sm text-slate-500">
                      {visibleHelpGuides.length} passo(s) a passo encontrado(s)
                    </p>
                  </div>
                </div>

                <div className="grid items-start gap-4 xl:grid-cols-2">
                  {visibleHelpGuides.map((guide) => (
                    <article
                      key={guide.id}
                      className="overflow-hidden rounded-md border border-[#dfe3e8] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.035)]"
                    >
                      <div className="border-b border-[#e5e7eb] bg-[#f8fafc] px-4 py-4 md:px-5">
                        <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#3730a3]">
                          {guide.category}
                        </span>
                        <h3 className="mt-1 text-lg font-semibold text-[#111827]">{guide.title}</h3>
                        <p className="mt-1 text-sm leading-5 text-slate-600">{guide.summary}</p>
                      </div>
                      <ol className="grid gap-3 p-4 md:p-5">
                        {guide.steps.map((step, index) => (
                          <li key={step} className="grid grid-cols-[28px_minmax(0,1fr)] items-start gap-3 text-sm leading-5 text-slate-700">
                            <span className="grid h-7 w-7 place-items-center rounded-full bg-[#eef2ff] text-xs font-semibold text-[#3730a3]">
                              {index + 1}
                            </span>
                            <span className="pt-1">{step}</span>
                          </li>
                        ))}
                      </ol>
                      <div className="flex items-center justify-between gap-3 border-t border-[#e5e7eb] px-4 py-3 md:px-5">
                        <span className="hidden text-xs text-slate-400 sm:block">
                          Palavras: {guide.keywords.slice(0, 3).join(', ')}
                        </span>
                        {canAccessArea(guide.target) ? (
                          <button
                            type="button"
                            onClick={() => {
                              setActiveArea(guide.target)
                              setMessage(`Guia aberto: ${guide.title}. Siga os passos e use esta tela para concluir.`)
                            }}
                            className="ml-auto inline-flex h-9 items-center gap-2 rounded-md bg-[#111827] px-3 text-sm font-medium text-white transition hover:bg-[#3730a3]"
                          >
                            {guide.action}
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        ) : (
                          <span className="ml-auto text-xs font-medium text-slate-500">
                            Disponível para o perfil responsável
                          </span>
                        )}
                      </div>
                    </article>
                  ))}
                </div>

                {!visibleHelpGuides.length && (
                  <div className="rounded-md border border-dashed border-[#cbd5e1] bg-white px-5 py-10 text-center">
                    <strong className="block text-base">Nenhum guia encontrado</strong>
                    <p className="mt-1 text-sm text-slate-500">
                      Tente buscar por pedido, preço, produção, estoque, produto ou senha.
                    </p>
                    <button
                      type="button"
                      onClick={() => setGuideSearch('')}
                      className="mt-4 h-9 rounded-md border border-[#d1d5db] bg-white px-3 text-sm font-medium"
                    >
                      Ver todos os guias
                    </button>
                  </div>
                )}
              </section>
            )}

            {activeModuleHub && (
              <ModuleHub
                eyebrow={activeModuleHub.eyebrow}
                title={activeModuleHub.title}
                description={activeModuleHub.description}
                items={activeModuleHub.items}
                onBack={() => {
                  setModuleContext(null)
                  navigateFromMenu('inicio')
                }}
                onOpen={(area) => {
                  setModuleContext(activeModuleHub.key)
                  setActiveArea(area)
                  setMessage(`Você entrou em ${pageIntro[area].title}.`)
                }}
              />
            )}

            {activeArea === 'plano-geral' && (
              <section className="grid gap-5">
                <section className="grid gap-3 md:hidden">
                  <div className="grid grid-cols-2 gap-2">
                    <PocketMetric
                      label="Pedidos pendentes"
                      value={generalPlan.pendingOrders.length.toString()}
                      detail={generalPlan.overdueOrders.length ? `${generalPlan.overdueOrders.length} vencido(s)` : 'Em aberto'}
                      tone={generalPlan.overdueOrders.length ? 'rose' : 'neutral'}
                    />
                    <PocketMetric
                      label="Produções abertas"
                      value={generalPlan.openOps.length.toString()}
                      detail={`${generalPlan.openOps.filter((op) => op.status === 'Em produção').length} em produção`}
                      tone="blue"
                    />
                    <PocketMetric
                      label="Estoque crítico"
                      value={generalPlan.attentionStock.length.toString()}
                      detail={generalPlan.attentionStock.length ? 'Precisa revisar' : 'Sem alerta'}
                      tone={generalPlan.attentionStock.length ? 'amber' : 'neutral'}
                    />
                    <PocketMetric
                      label="Faturamento mês"
                      value={canSeeMoney ? money(financeSummary.receivedSalesMonthTotal) : 'Restrito'}
                      detail={canSeeMoney ? 'Recebido este mês' : 'Admin/Financeiro'}
                      tone="green"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {canAccessArea('pedido-guiado') && (
                      <button
                        type="button"
                        onClick={() => setActiveArea('pedido-guiado')}
                        className="inline-flex h-10 items-center justify-center rounded-md bg-[#111827] px-3 text-sm font-medium text-white"
                      >
                        Nova venda
                      </button>
                    )}
                    {canAccessArea('producao-guiada') && (
                      <button
                        type="button"
                        onClick={() => setActiveArea('producao-guiada')}
                        className="inline-flex h-10 items-center justify-center rounded-md border border-[#d1d5db] bg-white px-3 text-sm font-medium"
                      >
                        Produzi hoje
                      </button>
                    )}
                  </div>

                  <MobileSummaryPanel
                    title="Pedidos pendentes"
                    actionLabel="Ver todos"
                    onAction={() => setActiveArea('vendas')}
                  >
                    {oldestPendingOrder && (
                      <button
                        type="button"
                        onClick={() => setActiveArea('vendas')}
                        className="rounded-md border border-[#d1d5db] bg-[#ffffff] px-3 py-2.5 text-left"
                      >
                        <span className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-[#3730a3]">Mais atrasado / mais próximo</span>
                        <strong className="mt-1 block text-sm text-[#111827]">
                          {oldestPendingOrder.id} · {oldestPendingOrder.client}
                        </strong>
                        <span className="mt-1 block text-sm text-black/55">
                          Prazo {formatDate(oldestPendingOrder.dueDate)} · clique para ver todos
                        </span>
                      </button>
                    )}
                    {pendingOrdersByDueDate.slice(0, 3).map((order) => {
                      const product = state.products.find((item) => item.id === order.productId)
                      return (
                        <button
                          key={order.id}
                          type="button"
                          onClick={() => setActiveArea('vendas')}
                          className="rounded-md border border-[#e2d5cc] bg-white px-3 py-2.5 text-left"
                        >
                          <strong className="block text-sm">{order.id} · {order.client}</strong>
                          <span className="mt-1 block text-sm leading-5 text-black/52">
                            {productDisplayName(product, order.variationId)} · {order.qty} un · prazo {formatDate(order.dueDate)}
                          </span>
                        </button>
                      )
                    })}
                    {!generalPlan.pendingOrders.length && <EmptyLine text="Nenhum pedido pendente." />}
                  </MobileSummaryPanel>

                  <MobileSummaryPanel
                    title="Produções abertas"
                    actionLabel="Abrir OPs"
                    onAction={() => setActiveArea('producao')}
                  >
                    {generalPlan.nextOps.slice(0, 2).map((op) => {
                      const product = state.products.find((item) => item.id === op.productId)
                      const remaining = Math.max(0, op.qty - op.produced)
                      return (
                        <MiniRow
                          key={op.id}
                          title={`${op.id} · ${op.status}`}
                          detail={`${productDisplayName(product, op.variationId)} · falta ${remaining} de ${op.qty} un`}
                        />
                      )
                    })}
                    {!generalPlan.nextOps.length && <EmptyLine text="Nenhuma produção aberta." />}
                  </MobileSummaryPanel>

                  <MobileSummaryPanel
                    title="Estoque crítico"
                    actionLabel="Ver estoque"
                    onAction={() => setActiveArea('estoque')}
                  >
                    {generalPlan.attentionStock.slice(0, 3).map((item) => (
                      <MiniRow
                        key={item.item}
                        title={item.item}
                        detail={
                          'minimumStock' in item
                            ? `Atual: ${item.qty.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} ${item.unit} · mínimo ${item.minimumStock.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}`
                            : `${item.qty.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} ${item.unit}`
                        }
                      />
                    ))}
                    {!generalPlan.attentionStock.length && <EmptyLine text="Nenhum estoque crítico." />}
                  </MobileSummaryPanel>
                </section>

                <section className="hidden overflow-hidden rounded-lg border border-[#2f2b27] bg-[#111827] text-white shadow-[0_18px_44px_rgba(33,31,28,0.14)] md:block">
                  <div className="grid gap-5 p-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:p-6">
                    <div className="min-w-0">
                      <span className="text-sm text-white/58">Resumo para acompanhar pelo celular</span>
                      <h2 className="mt-2 font-serif text-[2.1rem] leading-none md:text-[2.8rem]">Plano geral</h2>
                      <p className="mt-3 max-w-2xl text-sm leading-6 text-white/64">
                        Pedidos, produção, estoque e dinheiro em uma tela rápida.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:flex">
                      {canAccessArea('pedido-guiado') && (
                        <PocketAction label="Entrou pedido" onClick={() => startQuickTask('pedido-guiado', 'Registre o pedido em passos simples.')} />
                      )}
                      {canAccessArea('producao-guiada') && (
                        <PocketAction label="Produzi hoje" onClick={() => startQuickTask('producao-guiada', 'Escolha a produção aberta e registre o que ficou pronto.')} />
                      )}
                    </div>
                  </div>
                </section>

                <div className="hidden grid-cols-2 gap-3 md:grid xl:grid-cols-4">
                  <PocketMetric
                    label="Pedidos pendentes"
                    value={generalPlan.pendingOrders.length.toString()}
                    detail={generalPlan.overdueOrders.length ? `${generalPlan.overdueOrders.length} com prazo vencido` : 'Tudo dentro do prazo'}
                    tone={generalPlan.overdueOrders.length ? 'rose' : 'neutral'}
                  />
                  <PocketMetric
                    label="Produções abertas"
                    value={generalPlan.openOps.length.toString()}
                    detail={`${generalPlan.openOps.filter((op) => op.status === 'Em produção').length} em produção`}
                    tone="blue"
                  />
                  <PocketMetric
                    label="Faturamento"
                    value={canSeeMoney ? money(financeSummary.receivedSalesMonthTotal) : 'Restrito'}
                    detail={canSeeMoney ? 'Recebido este mês' : 'Valores visíveis para Admin/Financeiro'}
                    tone="green"
                  />
                  <PocketMetric
                    label="Estoque baixo"
                    value={generalPlan.attentionStock.length.toString()}
                    detail={generalPlan.attentionStock.length ? 'Itens para revisar' : 'Sem alerta agora'}
                    tone={generalPlan.attentionStock.length ? 'amber' : 'neutral'}
                  />
                </div>

                <div className="hidden gap-5 md:grid xl:grid-cols-[minmax(0,1fr)_360px]">
                  <Panel title="Precisa de atenção">
                    <SmartAlertList alerts={visibleSmartAlerts} limit={6} />
                  </Panel>

                  <Panel title="Atalhos do dia">
                    <div className="grid gap-2">
                      {canAccessArea('pedido-guiado') && (
                        <DashboardAction label="Nova venda" onClick={() => startQuickTask('pedido-guiado', 'Registre a venda em passos simples.')} />
                      )}
                      {canAccessArea('producao-guiada') && (
                        <DashboardAction label="Registrar produção" onClick={() => startQuickTask('producao-guiada', 'Escolha a produção aberta e registre o que ficou pronto.')} />
                      )}
                      {canAccessArea('producao') && <DashboardAction label="Ver ordens abertas" onClick={() => setActiveArea('producao')} />}
                      {canAccessArea('estoque') && <DashboardAction label="Conferir estoque" onClick={() => setActiveArea('estoque')} />}
                      {canAccessArea('financeiro') && <DashboardAction label="Financeiro" onClick={() => setActiveArea('financeiro')} />}
                    </div>
                  </Panel>
                </div>

                <div className="hidden gap-5 md:grid xl:grid-cols-2">
                  <Panel title="Pedidos pendentes">
                    <div className="grid gap-3">
                      {generalPlan.pendingOrders.slice(0, 5).map((order) => {
                        const product = state.products.find((item) => item.id === order.productId)
                        return (
                          <MiniRow
                            key={order.id}
                            title={`${order.id} · ${order.client}`}
                            detail={`${productDisplayName(product, order.variationId)} · ${order.qty} un · ${order.status} · prazo ${formatDate(order.dueDate)}`}
                          />
                        )
                      })}
                      {!generalPlan.pendingOrders.length && <EmptyLine text="Nenhum pedido pendente." />}
                    </div>
                  </Panel>

                  <Panel title="Produções abertas">
                    <div className="grid gap-3">
                      {generalPlan.nextOps.slice(0, 5).map((op) => {
                        const product = state.products.find((item) => item.id === op.productId)
                        const remaining = Math.max(0, op.qty - op.produced)
                        return (
                          <div key={op.id} className="rounded-md border border-[#e5e7eb] bg-[#ffffff] px-3 py-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <strong className="text-sm">{op.id}</strong>
                              <StatusBadge tone={opStatusTone(op.status)}>{op.status}</StatusBadge>
                              <StatusBadge tone={priorityTone(op.priority)}>{op.priority}</StatusBadge>
                            </div>
                            <span className="mt-2 block text-sm leading-5 text-black/52">
                              {productDisplayName(product, op.variationId)} · falta produzir {remaining} de {op.qty} un
                            </span>
                          </div>
                        )
                      })}
                      {!generalPlan.nextOps.length && <EmptyLine text="Nenhuma produção aberta." />}
                    </div>
                  </Panel>
                </div>
              </section>
            )}

            {activeArea === 'vendas' && (
              <section className="grid gap-5">
                <div className="grid gap-3 md:grid-cols-4">
                  <PocketMetric label="Novas vendas" value={salesFlow.open.length.toString()} detail="Aguardam produção ou estoque" tone="blue" />
                  <PocketMetric label="Em produção" value={salesFlow.inProduction.length.toString()} detail="Já têm produção em andamento" tone="amber" />
                  <PocketMetric label="Prontas" value={salesFlow.ready.length.toString()} detail="Podem seguir para entrega" tone="green" />
                  <PocketMetric label="Entregues" value={salesFlow.delivered.length.toString()} detail="Histórico concluído" tone="neutral" />
                </div>

                <Panel title="Fluxo da venda">
                  <div className="grid gap-3 md:grid-cols-4">
                    <ProcessStep title="1. Venda registrada" detail="Cliente, peça, quantidade e prazo." />
                    <ProcessStep title="2. Verificar estoque" detail="O sistema mostra o que tem e o que falta." />
                    <ProcessStep title="3. Produzir o faltante" detail="Crie a ordem e registre produção." />
                    <ProcessStep title="4. Entregar" detail="Quando estiver pronto, marque como entregue." />
                  </div>
                </Panel>

                <Panel title="Alertas inteligentes">
                  <SmartAlertList
                    alerts={visibleSmartAlerts.filter((alert) =>
                      ['Pedido sem produção', 'Prazo próximo', 'Prazo vencido'].includes(alert.badge),
                    )}
                    limit={4}
                  />
                </Panel>

                <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
                  <Panel title="Vendas que precisam de ação">
                    <div className="grid gap-3">
                      {salesFlow.active.map((order) => {
                        const product = state.products.find((item) => item.id === order.productId)
                        const stockPosition = orderStockPosition(order)
                        const unitPrice = orderUnitPrice(state, order)
                        const pricing = orderPricingDetails(state, order)
                        const relatedOp = state.productionOrders.find((op) => op.orderId === order.id)
                        const timeline = orderTimeline(state, order)
                        const hasOp = hasProductionOrder(order.id)
                        const missingQty = stockPosition.toProduce
                        const remainingOpQty = relatedOp ? Math.max(0, relatedOp.qty - relatedOp.produced) : 0
                        const openProductionAction = () => {
                          if (relatedOp) setGuidedOpId(relatedOp.id)
                          setGuidedProductionStep(1)
                          setActiveArea(relatedOp ? 'producao-guiada' : 'producao')
                        }
                        const nextAction =
                          !orderPriceApproved(order)
                            ? {
                                label: canApproveDiscount ? 'Revisar preço' : 'Aguardar aprovação',
                                detail: `O preço negociado de ${money(unitPrice)} está abaixo do mínimo de ${money(pricing.minimumPrice)}.`,
                                onClick: () => setActiveArea('pedidos'),
                              }
                            : order.status === 'Aberto' && missingQty > 0 && !hasOp
                            ? {
                                label: 'Gerar produção',
                                detail: `PCP sugere produzir ${missingQty} un depois de conferir estoque e reservas.`,
                                onClick: () => openProductionDecision(order),
                              }
                            : order.status === 'Aberto' && missingQty > 0 && hasOp
                              ? {
                                  label: 'Registrar produção',
                                  detail: relatedOp
                                    ? `Produção ${relatedOp.id} criada. Ainda faltam ${remainingOpQty} un.`
                                    : 'A produção já foi criada para essa venda.',
                                  onClick: openProductionAction,
                                }
                              : order.status === 'Aberto'
                                ? {
                                    label: 'Separar do estoque',
                                    detail: 'Tem produto acabado suficiente. Separe as peças e deixe o pedido pronto.',
                                    onClick: () => {
                                      updateOrderStatus(order.id, 'Pronto')
                                      setActiveArea('entregas')
                                    },
                                  }
                                : order.status === 'Em produção'
                                  ? {
                                      label: relatedOp ? 'Registrar produção' : 'Ver produção',
                                      detail: relatedOp
                                        ? `Continue a produção ${relatedOp.id}. Faltam ${remainingOpQty} un.`
                                        : 'Acompanhe a produção vinculada ao pedido.',
                                      onClick: openProductionAction,
                                    }
                                  : order.status === 'Pronto'
                                    ? {
                                        label: 'Separar/entregar',
                                        detail: 'Pedido pronto. Vá para a tela de entregas para conferir e concluir.',
                                        onClick: () => setActiveArea('entregas'),
                                      }
                                    : null

                        return (
                          <div key={order.id} className="rounded-md border border-[#e5e7eb] bg-[#ffffff] p-4">
                            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <strong>{order.id} · {order.client}</strong>
                                  <StatusBadge tone={orderStatusTone(order.status)}>{order.status}</StatusBadge>
                                  {hasOp && <StatusBadge tone="blue">{relatedOp?.id ?? 'Produção criada'}</StatusBadge>}
                                  {pricing.approvalStatus === 'Pendente' && <StatusBadge tone="rose">Preço em aprovação</StatusBadge>}
                                  {pricing.approvalStatus === 'Recusada' && <StatusBadge tone="rose">Preço recusado</StatusBadge>}
                                </div>
                                <p className="mt-2 text-sm text-black/62">
                                  {productDisplayName(product, order.variationId)} · {order.qty} un · prazo {formatDate(order.dueDate)}
                                </p>
                                <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                                  <MiniStat label="Pronto" value={`${stockPosition.physical} un`} />
                                  <MiniStat label="Reservado" value={`${stockPosition.pending} un`} />
                                  <MiniStat label="Falta" value={`${missingQty} un`} tone={missingQty > 0 ? 'rose' : 'green'} />
                                  {canNegotiatePrice && <MiniStat label="Venda" value={money(unitPrice * order.qty)} tone="green" />}
                                  {canNegotiatePrice && <MiniStat label="Margem real" value={`${pricing.realMargin.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`} tone={orderPriceApproved(order) ? 'green' : 'rose'} />}
                                </div>
                                <details className="mt-3 rounded-md border border-[#e5e7eb] bg-[#ffffff] p-3">
                                  <summary className="cursor-pointer text-sm font-medium text-[#3730a3]">Ver detalhes da venda</summary>
                                  <div className="mt-3 grid gap-1 text-sm text-black/55">
                                    <span>Telefone: {order.phone || 'Não informado'}</span>
                                    <span>Cidade: {order.city || 'Não informada'}</span>
                                    <span>Data do pedido: {formatDate(order.orderDate)}</span>
                                    <span>Registrado por: {order.createdBy ?? 'Sistema'}</span>
                                    {order.notes && <span>Observação: {order.notes}</span>}
                                  </div>
                                  <div className="mt-4">
                                    <FieldLabel>Linha do tempo do pedido</FieldLabel>
                                    <div className="mt-2">
                                      <OrderTimeline items={timeline} />
                                    </div>
                                  </div>
                                </details>
                              </div>
                              <div className="grid min-w-[180px] gap-2">
                                {nextAction && (
                                  <div className="rounded-md border border-[#111827]/10 bg-white p-3">
                                    <span className="text-xs font-medium uppercase text-black/40">Próxima ação</span>
                                    <p className="mt-1 text-sm leading-5 text-black/60">{nextAction.detail}</p>
                                    <button
                                      type="button"
                                      onClick={nextAction.onClick}
                                      className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-md bg-[#111827] px-3 text-sm font-medium text-white transition hover:bg-[#3730a3]"
                                    >
                                      {nextAction.label}
                                    </button>
                                  </div>
                                )}
                                <button
                                  type="button"
                                  onClick={() => setPreviewOrderId(order.id)}
                                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[#c7d2fe] bg-[#eef2ff] px-3 text-sm font-medium text-[#1f2937]"
                                >
                                  <ReceiptText className="h-4 w-4" />
                                  Ver pedido
                                </button>
                                {canNegotiatePrice && (
                                  <label className="grid gap-1 rounded-md border border-[#e5e7eb] bg-white p-2">
                                    <FieldLabel>Preço por peça</FieldLabel>
                                    <input
                                      type="number"
                                      value={Math.round(unitPrice)}
                                      onChange={(event) => updateOrderUnitPrice(order.id, Number(event.target.value))}
                                      disabled={order.status !== 'Aberto' || hasOp}
                                      className="h-9 rounded-md border border-[#e5e7eb] bg-[#ffffff] px-2 text-sm outline-none focus:border-[#4f46e5] disabled:bg-[#f3f4f6] disabled:text-black/40"
                                    />
                                  </label>
                                )}
                                {canApproveDiscount && pricing.approvalStatus === 'Pendente' && (
                                  <button
                                    type="button"
                                    onClick={() => reviewOrderPrice(order.id, 'Aprovada')}
                                    className="inline-flex h-10 items-center justify-center rounded-md bg-[#166534] px-3 text-sm font-medium text-white"
                                  >
                                    Aprovar desconto
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => setActiveArea('pedido-guiado')}
                                  className="inline-flex h-10 items-center justify-center rounded-md border border-[#e5e7eb] bg-white px-3 text-sm font-medium"
                                >
                                  Nova venda
                                </button>
                                {order.status !== 'Entregue' && order.status !== 'Cancelado' && (
                                  <button
                                    type="button"
                                    onClick={() => requestOrderCancellation(order)}
                                    className="inline-flex h-10 items-center justify-center rounded-md border border-amber-200 bg-amber-50 px-3 text-sm font-medium text-amber-900"
                                  >
                                    Cancelar com motivo
                                  </button>
                                )}
                                {canDeleteRecords && (
                                  <button
                                    type="button"
                                    onClick={() => deleteOrder(order)}
                                    className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-rose-200 bg-white px-3 text-sm font-medium text-rose-800"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    Excluir
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                      {!salesFlow.active.length && (
                        <EmptyLine text="Nenhuma venda aberta. As novas vendas aparecerão aqui." />
                      )}
                    </div>
                  </Panel>

                  <Panel title="Próximo passo">
                    <div className="grid gap-2">
                      {canAccessArea('pedido-guiado') && <DashboardAction label="Registrar nova venda" onClick={() => setActiveArea('pedido-guiado')} />}
                      {canAccessArea('producao-necessidades') && <DashboardAction label="Ver o que precisa produzir" onClick={() => setActiveArea('producao-necessidades')} />}
                      {canAccessArea('producao-guiada') && <DashboardAction label="Registrar produção pronta" onClick={() => setActiveArea('producao-guiada')} />}
                      {canAccessArea('entregas') && <DashboardAction label="Separar entregas" onClick={() => setActiveArea('entregas')} />}
                      {canAccessArea('clientes') && <DashboardAction label="Cadastrar cliente" onClick={() => setActiveArea('clientes')} />}
                    </div>
                  </Panel>
                </div>
              </section>
            )}

            {activeArea === 'entregas' && (
              <section className="grid gap-5">
                <div className="grid gap-3 md:grid-cols-3">
                  <PocketMetric
                    label="Prontos para entregar"
                    value={salesFlow.ready.length.toString()}
                    detail="Aguardam separação e saída"
                    tone={salesFlow.ready.length ? 'green' : 'neutral'}
                  />
                  <PocketMetric
                    label="Entregues"
                    value={salesFlow.delivered.length.toString()}
                    detail="Vendas concluídas"
                    tone="neutral"
                  />
                  <PocketMetric
                    label="Em produção"
                    value={salesFlow.inProduction.length.toString()}
                    detail="Ainda não liberados"
                    tone="amber"
                  />
                </div>

                <Panel title="Pedidos prontos para entregar">
                  <div className="grid gap-3">
                    {salesFlow.ready.map((order) => {
                      const product = state.products.find((item) => item.id === order.productId)
                      const finishedName = product ? productFinishedItemName(product, order.variationId) : ''
                      const available = stock.finishedItems.find((item) => item.item === finishedName)?.qty ?? 0
                      const canDeliver = available >= order.qty
                      const relatedOp = state.productionOrders.find((op) => op.orderId === order.id)
                      const timeline = orderTimeline(state, order)

                      return (
                        <div key={order.id} className="rounded-md border border-[#e5e7eb] bg-[#ffffff] p-4">
                          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <strong>{order.id} · {order.client}</strong>
                                <StatusBadge tone="green">Pronto</StatusBadge>
                                {relatedOp && <StatusBadge tone="blue">{relatedOp.id}</StatusBadge>}
                                {!canDeliver && <StatusBadge tone="rose">Estoque insuficiente</StatusBadge>}
                              </div>
                              <p className="mt-2 text-sm text-black/62">
                                {productDisplayName(product, order.variationId)} · {order.qty} un · prazo {formatDate(order.dueDate)}
                              </p>
                              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                                <MiniStat label="Pronto no estoque" value={`${available} un`} tone={canDeliver ? 'green' : 'rose'} />
                                <MiniStat label="Separar" value={`${order.qty} un`} />
                                <MiniStat label="Cliente" value={order.city || 'Sem cidade'} />
                              </div>
                              <details className="mt-3 rounded-md border border-[#e5e7eb] bg-[#ffffff] p-3">
                                <summary className="cursor-pointer text-sm font-medium text-[#3730a3]">
                                  Conferir dados da entrega
                                </summary>
                                <div className="mt-3 grid gap-1 text-sm text-black/55">
                                  <span>Telefone: {order.phone || 'Não informado'}</span>
                                  <span>Cidade/endereço: {order.city || order.address || 'Não informado'}</span>
                                  <span>Data do pedido: {formatDate(order.orderDate)}</span>
                                  <span>Registrado por: {order.createdBy ?? 'Sistema'}</span>
                                  {order.notes && <span>Observação: {order.notes}</span>}
                                </div>
                                <div className="mt-4">
                                  <FieldLabel>Linha do tempo do pedido</FieldLabel>
                                  <div className="mt-2">
                                    <OrderTimeline items={timeline} />
                                  </div>
                                </div>
                              </details>
                            </div>

                            <div className="grid min-w-[220px] gap-2">
                              <div className="rounded-md border border-[#111827]/10 bg-white p-3">
                                <span className="text-xs font-medium uppercase text-black/40">Próxima ação</span>
                                <p className="mt-1 text-sm leading-5 text-black/60">
                                  {canDeliver
                                    ? 'Confira as peças separadas e registre a entrega.'
                                    : 'O pedido está pronto, mas o estoque de produto acabado não cobre a quantidade.'}
                                </p>
                                <button
                                  type="button"
                                  onClick={() => updateOrderStatus(order.id, 'Entregue')}
                                  disabled={!canDeliver}
                                  className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-md bg-[#111827] px-3 text-sm font-medium text-white transition hover:bg-[#3730a3] disabled:cursor-not-allowed disabled:opacity-45"
                                >
                                  Registrar entrega
                                </button>
                              </div>
                              <button
                                type="button"
                                onClick={() => setPreviewOrderId(order.id)}
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[#c7d2fe] bg-[#eef2ff] px-3 text-sm font-medium text-[#1f2937]"
                              >
                                <ReceiptText className="h-4 w-4" />
                                Ver pedido
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    {!salesFlow.ready.length && (
                      <div className="rounded-md border border-dashed border-[#d1d5db] bg-[#ffffff] p-6 text-sm text-black/55">
                        <strong className="block text-[#111827]">Nenhum pedido pronto para entregar</strong>
                        <span className="mt-1 block">
                          Quando uma produção for finalizada ou uma venda for separada do estoque, ela aparece aqui.
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveArea('vendas')}
                          className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-[#111827] px-4 text-sm font-medium text-white"
                        >
                          Ver vendas em aberto
                        </button>
                      </div>
                    )}
                  </div>
                </Panel>
              </section>
            )}

            {activeArea === 'producao-necessidades' && (
              <section className="grid gap-5">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <PocketMetric
                    label="Pedidos pendentes"
                    value={pcpOrderPlans.length.toString()}
                    detail={`${pcpOrderPlans.reduce((sum, plan) => sum + plan.order.qty, 0)} peças comprometidas`}
                    tone={pcpOrderPlans.length ? 'amber' : 'neutral'}
                  />
                  <PocketMetric
                    label="Precisam de ação"
                    value={(pcpSelectablePlans.length + pcpAdjustablePlans.length).toString()}
                    detail={`${[...pcpSelectablePlans, ...pcpAdjustablePlans].reduce((sum, plan) => sum + plan.suggestedQty, 0)} peças faltantes`}
                    tone={pcpSelectablePlans.length || pcpAdjustablePlans.length ? 'rose' : 'neutral'}
                  />
                  <PocketMetric
                    label="Produzindo"
                    value={openProductionOrders.reduce((sum, op) => sum + Math.max(0, op.qty - op.produced), 0).toString()}
                    detail={`${openProductionOrders.length} ordens abertas`}
                    tone="blue"
                  />
                  <PocketMetric
                    label="Cobertos pelo estoque"
                    value={pcpCoveredPlans.length.toString()}
                    detail="Podem seguir para separação"
                    tone={pcpCoveredPlans.length ? 'green' : 'neutral'}
                  />
                </div>

                <Panel title="Alertas de produção">
                  <SmartAlertList
                    alerts={visibleSmartAlerts.filter((alert) =>
                      ['Pedido sem produção', 'Produção pausada', 'Produção parada', 'Falta matéria-prima'].includes(alert.badge),
                    )}
                    limit={5}
                  />
                </Panel>

                <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
                  <Panel title="Pedidos para planejar">
                    <div className="grid gap-3">
                      {!!pcpSelectablePlans.length && (
                        <div className="flex flex-col justify-between gap-3 rounded-md border border-[#d1d5db] bg-[#f9fafb] p-3 sm:flex-row sm:items-center">
                          <label className="inline-flex items-center gap-3 text-sm font-medium">
                            <input
                              type="checkbox"
                              checked={pcpSelectablePlans.every((plan) => pcpSelectedOrderIds.includes(plan.order.id))}
                              onChange={toggleAllPcpOrders}
                              className="h-4 w-4 accent-[#3730a3]"
                            />
                            Selecionar todos os pedidos que precisam produzir
                          </label>
                          <span className="text-sm text-black/55">{selectedPcpPlans.length} selecionado(s)</span>
                        </div>
                      )}

                      {pcpSelectablePlans.map((plan) => {
                        const selected = pcpSelectedOrderIds.includes(plan.order.id)
                        const quantity = pcpOrderQuantities[plan.order.id] ?? plan.suggestedQty
                        const extraStockQty = Math.max(0, Math.floor(quantity) - plan.suggestedQty)
                        const remainingDays = daysUntil(plan.order.dueDate)

                        return (
                          <div
                            key={plan.order.id}
                            className={`rounded-md border p-4 transition ${
                              selected
                                ? 'border-[#818cf8] bg-[#f5f3ff]'
                                : 'border-[#e5e7eb] bg-[#ffffff]'
                            }`}
                          >
                            <div className="grid gap-4 lg:grid-cols-[auto_minmax(0,1fr)_150px] lg:items-start">
                              <input
                                type="checkbox"
                                checked={selected}
                                onChange={() => togglePcpOrder(plan.order.id)}
                                aria-label={`Selecionar ${plan.order.id}`}
                                className="mt-1 h-5 w-5 accent-[#3730a3]"
                              />
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <strong>{plan.order.id} · {plan.order.client}</strong>
                                  <StatusBadge tone={priorityTone(plan.priority)}>{plan.priority}</StatusBadge>
                                  <StatusBadge tone={remainingDays < 0 ? 'rose' : remainingDays <= 3 ? 'amber' : 'neutral'}>
                                    {remainingDays < 0
                                      ? `${Math.abs(remainingDays)} dia(s) atrasado`
                                      : remainingDays === 0
                                        ? 'Entrega hoje'
                                        : `Prazo em ${remainingDays} dia(s)`}
                                  </StatusBadge>
                                </div>
                                <p className="mt-2 text-sm text-black/60">
                                  {productDisplayName(plan.product, plan.variationId)} · pedido de {plan.order.qty} un · prazo {formatDate(plan.order.dueDate)}
                                </p>
                                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
                                  <MiniStat label="Neste pedido" value={`${plan.order.qty} un`} />
                                  <MiniStat label="Comprometido total" value={`${plan.pending} un`} />
                                  <MiniStat label="Físico" value={`${plan.physical} un`} />
                                  <MiniStat label="Produzindo" value={`${plan.producing} un`} tone="blue" />
                                  <MiniStat label="Coberto neste pedido" value={`${plan.covered} un`} tone="green" />
                                  <MiniStat label="Falta neste pedido" value={`${plan.suggestedQty} un`} tone="rose" />
                                </div>
                              </div>
                              <label className="grid gap-2">
                                <FieldLabel>Quantidade da OP</FieldLabel>
                                <input
                                  type="number"
                                  min={1}
                                  max={plan.order.qty}
                                  value={quantity}
                                  onChange={(event) =>
                                    setPcpOrderQuantities((current) => ({
                                      ...current,
                                      [plan.order.id]: Math.max(0, Number(event.target.value)),
                                    }))
                                  }
                                  className="h-11 w-full rounded-md border border-[#d1d5db] bg-white px-3 text-sm outline-none focus:border-[#3730a3]"
                                />
                                <span className="text-xs leading-4 text-black/45">Sugestão: {plan.suggestedQty} un</span>
                                {extraStockQty > 0 && (
                                  <span className="rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-xs leading-4 text-blue-900">
                                    {extraStockQty} un adicional(is) irão para estoque
                                  </span>
                                )}
                              </label>
                            </div>
                          </div>
                        )
                      })}
                      {!pcpSelectablePlans.length && (
                        <EmptyLine text="Nenhum pedido precisa de uma nova OP. A necessidade está coberta pelo estoque ou por produções já abertas." />
                      )}
                    </div>
                  </Panel>

                  <div className="grid content-start gap-5">
                    <Panel title="Gerar ordens">
                      <div className="grid gap-3">
                        <MiniStat
                          label="Pedidos selecionados"
                          value={selectedPcpPlans.length.toString()}
                          tone={selectedPcpPlans.length ? 'blue' : 'neutral'}
                        />
                        <MiniStat
                          label="Necessidade sugerida"
                          value={`${selectedPcpSuggestedQty} un`}
                        />
                        <MiniStat label="Quantidade planejada" value={`${selectedPcpPlannedQty} un`} />
                        {selectedPcpExtraStockQty > 0 && (
                          <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-950">
                            <strong>{selectedPcpExtraStockQty} un adicional(is) para estoque.</strong>
                            <span className="mt-1 block text-blue-900/80">
                              Essa quantidade excede a falta dos pedidos e ficará disponível após o registro da produção.
                            </span>
                          </div>
                        )}
                        {selectedPcpMaterialShortages.length ? (
                          <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
                            <strong className="text-sm text-amber-950">Falta matéria-prima</strong>
                            <div className="mt-2 grid gap-1 text-sm leading-5 text-amber-900">
                              {selectedPcpMaterialShortages.slice(0, 5).map((item) => (
                                <span key={item.item}>
                                  Comprar {item.missing.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} {item.unit} de {item.item}
                                </span>
                              ))}
                            </div>
                            <button
                              type="button"
                              onClick={() => setActiveArea('estoque')}
                              className="mt-3 inline-flex h-9 items-center justify-center rounded-md border border-amber-300 bg-white px-3 text-sm font-medium text-amber-950"
                            >
                              Ver compras sugeridas
                            </button>
                          </div>
                        ) : selectedPcpPlans.length ? (
                          <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
                            Matéria-prima suficiente para as quantidades selecionadas.
                          </div>
                        ) : (
                          <p className="text-sm leading-5 text-black/50">
                            Selecione os pedidos. O sistema reunirá as quantidades e verificará os materiais antes de criar as OPs.
                          </p>
                        )}
                        <button
                          type="button"
                          onClick={generateSelectedPcpOrders}
                          disabled={!selectedPcpPlans.length}
                          className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#111827] px-4 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Scissors className="h-4 w-4" />
                          Gerar OPs selecionadas
                        </button>
                      </div>
                    </Panel>

                    <Panel title="Outras ações">
                      <div className="grid gap-2">
                        {canAccessArea('producao') && <DashboardAction label="Criar OP independente para estoque" onClick={() => setActiveArea('producao')} />}
                        {canAccessArea('producao-guiada') && <DashboardAction label="Registrar produção pronta" onClick={() => setActiveArea('producao-guiada')} />}
                        {canAccessArea('producao') && <DashboardAction label="Ver e imprimir OPs" onClick={() => setActiveArea('producao')} />}
                      </div>
                    </Panel>
                  </div>
                </div>

                {!!pcpAdjustablePlans.length && (
                  <Panel title="OPs que precisam completar a quantidade">
                    <div className="grid gap-3 md:grid-cols-2">
                      {pcpAdjustablePlans.map((plan) => (
                        <div
                          key={plan.order.id}
                          className="grid gap-3 rounded-md border border-amber-200 bg-amber-50 p-4 sm:grid-cols-[1fr_auto] sm:items-center"
                        >
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <strong>{plan.relatedOp?.id} · {plan.order.id}</strong>
                              <StatusBadge tone="amber">Faltam {plan.suggestedQty} un</StatusBadge>
                            </div>
                            <p className="mt-2 text-sm text-amber-950/75">
                              {productDisplayName(plan.product, plan.variationId)} · OP atual {plan.relatedOp?.qty} un · pedido {plan.order.qty} un
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => completeExistingProductionOrder(plan)}
                            className="inline-flex h-10 items-center justify-center rounded-md border border-amber-300 bg-white px-4 text-sm font-medium text-amber-950"
                          >
                            Completar OP para {(plan.relatedOp?.qty ?? 0) + plan.suggestedQty} un
                          </button>
                        </div>
                      ))}
                    </div>
                  </Panel>
                )}

                {!!pcpCoveredPlans.length && (
                  <Panel title="Pedidos cobertos pelo estoque">
                    <div className="grid gap-3 md:grid-cols-2">
                      {pcpCoveredPlans.map((plan) => (
                        <div key={plan.order.id} className="grid gap-3 rounded-md border border-emerald-200 bg-emerald-50 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                          <div>
                            <strong>{plan.order.id} · {plan.order.client}</strong>
                            <p className="mt-1 text-sm text-emerald-900/75">
                              {productDisplayName(plan.product, plan.variationId)} · {plan.order.qty} un · prazo {formatDate(plan.order.dueDate)}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              updateOrderStatus(plan.order.id, 'Pronto')
                              setActiveArea('entregas')
                            }}
                            className="inline-flex h-10 items-center justify-center rounded-md border border-emerald-300 bg-white px-4 text-sm font-medium text-emerald-950"
                          >
                            Enviar para separação
                          </button>
                        </div>
                      ))}
                    </div>
                  </Panel>
                )}

                <Panel title="Necessidade por produto">
                  <div className="grid gap-3">
                    {productionNeedRows.map((row) => (
                      <div key={`${row.order.productId}-${row.variationId ?? 'base'}`} className="grid gap-3 rounded-md border border-[#e5e7eb] bg-[#ffffff] p-4 md:grid-cols-[1fr_auto] md:items-center">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <strong>{row.product?.code} · {productDisplayName(row.product, row.variationId)}</strong>
                            {row.toProduce > 0 ? <StatusBadge tone="rose">Produzir {row.toProduce} un</StatusBadge> : <StatusBadge tone="green">Coberto</StatusBadge>}
                          </div>
                          <p className="mt-2 text-sm text-black/60">
                            Vendido/pendente: {row.pending} un · Pronto: {row.physical} un · Em produção: {row.producing} un · Disponível após reservas: {row.available} un
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedProductId(row.order.productId)
                            setSelectedVariationId(row.variationId ?? '')
                            setStockOpQty(Math.max(1, row.toProduce))
                            setActiveArea('producao')
                          }}
                          className="inline-flex h-10 items-center justify-center rounded-md border border-[#e5e7eb] bg-white px-4 text-sm font-medium"
                        >
                          Abrir ordem
                        </button>
                      </div>
                    ))}
                    {!productionNeedRows.length && (
                      <EmptyLine text="Sem necessidade de produção no momento." />
                    )}
                  </div>
                </Panel>
              </section>
            )}

            {activeArea === 'implantacao' && (
              <section className="grid gap-5">
                <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                  <MobileViewSelect
                    label="Área da implantação"
                    value={implementationView}
                    options={[
                      ['resumo', 'Visão geral'],
                      ['treinamento', 'Treinamento'],
                      ['equipe', 'Responsabilidades'],
                      ['duvidas', 'Dúvidas e melhorias'],
                    ]}
                    onChange={(value) => setImplementationView(value as ImplementationView)}
                  />
                  <nav
                    aria-label="Áreas da implantação"
                    className="hidden gap-2 sm:flex sm:flex-wrap"
                  >
                    {([
                      ['resumo', 'Visão geral'],
                      ['treinamento', 'Treinamento'],
                      ['equipe', 'Responsabilidades'],
                      ['duvidas', 'Dúvidas e melhorias'],
                    ] as [ImplementationView, string][]).map(([view, label]) => (
                      <button
                        key={view}
                        type="button"
                        onClick={() => setImplementationView(view)}
                        aria-current={implementationView === view ? 'page' : undefined}
                        className={`min-h-10 rounded-md border px-3 text-sm font-medium ${
                          implementationView === view
                            ? 'border-[#312e81] bg-[#312e81] text-white'
                            : 'border-slate-200 bg-white text-slate-700'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </nav>
                </div>

                {implementationView === 'resumo' && (
                  <>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 xl:grid-cols-4">
                  <PocketMetric
                    label="Usuários individuais"
                    value={state.users.length.toString()}
                    detail="Uma conta para cada pessoa"
                    tone={state.users.length > 1 ? 'green' : 'amber'}
                  />
                  <PocketMetric
                    label="Responsabilidades"
                    value={`${implementationOverview.assignedResponsibilities}/${implementationAreas.length}`}
                    detail="Áreas com responsável definida"
                    tone={implementationOverview.assignedResponsibilities === implementationAreas.length ? 'green' : 'amber'}
                  />
                  <PocketMetric
                    label="Treinamento"
                    value={`${implementationOverview.selectedCompleted}/${selectedImplementationSteps.length}`}
                    detail={selectedImplementationUser?.name ?? 'Escolha uma pessoa'}
                    tone={implementationOverview.selectedCompleted === selectedImplementationSteps.length ? 'green' : 'blue'}
                  />
                  <PocketMetric
                    label="Dúvidas abertas"
                    value={implementationOverview.openQuestions.toString()}
                    detail="Textos ou processos para revisar"
                    tone={implementationOverview.openQuestions ? 'amber' : 'green'}
                  />
                </div>

                  <Panel title="Prontidão para usar no dia a dia">
                  <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(300px,0.7fr)] xl:items-center">
                    <div className="grid gap-4">
                      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                        <div>
                          <strong className="text-3xl text-slate-950">{implementationReadinessPercent}%</strong>
                          <p className="mt-1 text-sm text-slate-500">
                            {implementationReadinessCompleted} de {implementationReadinessChecks.length} pontos preparados.
                          </p>
                        </div>
                        <span className="text-sm font-medium text-slate-600">
                          {teamTrainingCompleted}/{teamTrainingTotal} atividades concluídas pela equipe
                        </span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full ${
                            implementationReadinessPercent === 100 ? 'bg-emerald-600' : 'bg-[#312e81]'
                          }`}
                          style={{ width: `${implementationReadinessPercent}%` }}
                        />
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {implementationReadinessChecks.map((check) => (
                          <div
                            key={check.label}
                            className={`flex min-w-0 items-center gap-2 rounded-md border px-3 py-2 text-sm ${
                              check.complete
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                                : 'border-slate-200 bg-slate-50 text-slate-600'
                            }`}
                          >
                            <span aria-hidden="true">{check.complete ? '✓' : '○'}</span>
                            <span className="break-words">{check.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-md border border-indigo-200 bg-indigo-50 p-4">
                      <span className="text-xs font-semibold uppercase tracking-[0.06em] text-[#312e81]">
                        Próximo passo de {selectedImplementationUser?.name ?? 'treinamento'}
                      </span>
                      {nextImplementationStep ? (
                        <>
                          <strong className="mt-2 block text-lg text-slate-950">{nextImplementationStep.title}</strong>
                          <p className="mt-1 text-sm leading-5 text-slate-600">{nextImplementationStep.detail}</p>
                          <button
                            type="button"
                            disabled={!canAccessArea(nextImplementationStep.target)}
                            onClick={() => {
                              if (nextImplementationStep.id === 'inventario-inicial') setStockView('inventario')
                              setActiveArea(nextImplementationStep.target)
                            }}
                            className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md bg-[#312e81] px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                          >
                            {canAccessArea(nextImplementationStep.target)
                              ? nextImplementationStep.action
                              : 'Atividade com outro perfil'}
                            {canAccessArea(nextImplementationStep.target) && <ArrowRight className="h-4 w-4" />}
                          </button>
                        </>
                      ) : (
                        <div className="mt-3">
                          <StatusBadge tone="green">Treinamento concluído</StatusBadge>
                          <p className="mt-2 text-sm leading-5 text-slate-600">
                            Esta pessoa concluiu todas as atividades previstas para sua função.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  </Panel>

                  <Panel title="Inventário inicial real">
                    <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                      <div>
                        <strong className="text-slate-950">
                          {implementationOverview.countedItems} de {implementationOverview.expectedInventoryItems} itens contados
                        </strong>
                        <p className="mt-1 text-sm leading-6 text-slate-500">
                          Conte matéria-prima e produto acabado. Toda diferença precisa de justificativa e ficará no histórico.
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={!canAdjustInventory}
                        onClick={() => {
                          setStockView('inventario')
                          setActiveArea('estoque')
                        }}
                        className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#312e81] px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                      >
                        {canAdjustInventory ? 'Continuar inventário' : 'Inventário com o Admin'}
                      </button>
                    </div>
                  </Panel>
                  </>
                )}

                {implementationView === 'treinamento' && (
                  <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
                  <Panel title="Treinamento por pessoa">
                    <div className="grid gap-4">
                      {userRole === 'Admin' ? (
                        <label className="grid gap-2">
                          <FieldLabel>Pessoa em treinamento</FieldLabel>
                          <select
                            value={selectedImplementationUserId}
                            onChange={(event) => setImplementationUserId(event.target.value)}
                            className="h-11 min-w-0 rounded-md border border-slate-200 bg-white px-3 text-sm"
                          >
                            {state.users.map((user) => (
                              <option key={user.id} value={user.id}>
                                {user.name} · {user.role}
                              </option>
                            ))}
                          </select>
                        </label>
                      ) : (
                        <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                          <span className="block text-xs uppercase text-slate-400">Minha rotina</span>
                          <strong className="mt-1 block">{selectedImplementationUser?.name} · {selectedImplementationRole}</strong>
                        </div>
                      )}

                      <div className="grid gap-3">
                        {selectedImplementationSteps.map((step, index) => {
                          const completed = selectedImplementationCompleted.has(step.id)
                          const canOpenStep = canAccessArea(step.target)
                          return (
                            <article
                              key={step.id}
                              className={`grid gap-3 rounded-md border p-4 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center ${
                                completed
                                  ? 'border-emerald-200 bg-emerald-50/50'
                                  : 'border-slate-200 bg-white'
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => toggleImplementationStep(step.id)}
                                aria-label={completed ? `Marcar ${step.title} como pendente` : `Marcar ${step.title} como concluído`}
                                className={`grid h-9 w-9 place-items-center rounded-md border text-sm font-semibold ${
                                  completed
                                    ? 'border-emerald-600 bg-emerald-600 text-white'
                                    : 'border-slate-300 bg-white text-slate-500'
                                }`}
                              >
                                {completed ? '✓' : index + 1}
                              </button>
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <strong className="text-sm text-slate-950">{step.title}</strong>
                                  {!completed && nextImplementationStep?.id === step.id && (
                                    <StatusBadge tone="blue">Próximo</StatusBadge>
                                  )}
                                  {completed && <StatusBadge tone="green">Concluído</StatusBadge>}
                                </div>
                                <p className="mt-1 text-sm leading-5 text-slate-500">{step.detail}</p>
                              </div>
                              <button
                                type="button"
                                disabled={!canOpenStep}
                                onClick={() => {
                                  if (step.id === 'inventario-inicial') setStockView('inventario')
                                  setActiveArea(step.target)
                                }}
                                className="inline-flex min-h-10 items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-[#312e81] disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                {canOpenStep ? step.action : 'Fora da sua função'}
                              </button>
                            </article>
                          )
                        })}
                      </div>
                    </div>
                  </Panel>

                  <Panel title="Progresso da equipe">
                    <div className="grid gap-3">
                      {teamImplementationProgress.map(({ user, completed, total, percent }) => (
                        <button
                          key={user.id}
                          type="button"
                          disabled={userRole !== 'Admin'}
                          onClick={() => setImplementationUserId(user.id)}
                          className="grid gap-2 rounded-md border border-slate-200 bg-white p-4 text-left disabled:cursor-default"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <strong className="block text-sm text-slate-950">{user.name}</strong>
                              <span className="text-xs text-slate-500">{user.role} · {completed}/{total} atividades</span>
                            </div>
                            <StatusBadge tone={percent === 100 ? 'green' : percent ? 'blue' : 'neutral'}>
                              {percent}%
                            </StatusBadge>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className={`h-full rounded-full ${percent === 100 ? 'bg-emerald-600' : 'bg-[#312e81]'}`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </button>
                      ))}
                      {!state.users.length && <EmptyLine text="Cadastre os usuários individuais para iniciar." />}
                      {userRole === 'Admin' && (
                        <button
                          type="button"
                          onClick={() => setActiveArea('usuarios')}
                          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-[#312e81] px-4 text-sm font-semibold text-white"
                        >
                          <Plus className="h-4 w-4" />
                          Cadastrar usuário
                        </button>
                      )}
                    </div>
                  </Panel>
                </div>
                )}

                {implementationView === 'equipe' && (
                  <Panel title="Responsabilidades">
                    <div className="grid gap-3">
                      {implementationAreas.map((item) => {
                        const responsibility = state.implementationResponsibilities.find(
                          (entry) => entry.id === item.id,
                        )
                        const owner = state.users.find((user) => user.id === responsibility?.userId)
                        return (
                          <div
                            key={item.id}
                            className="grid gap-2 rounded-md border border-slate-200 bg-white p-3 sm:grid-cols-[minmax(0,1fr)_minmax(180px,0.8fr)] sm:items-center"
                          >
                            <strong className="text-sm text-slate-900">{item.area}</strong>
                            {userRole === 'Admin' ? (
                              <select
                                aria-label={`Responsável por ${item.area}`}
                                value={responsibility?.userId ?? ''}
                                onChange={(event) =>
                                  assignImplementationResponsibility(
                                    item.id,
                                    item.area,
                                    event.target.value,
                                  )
                                }
                                className="h-10 min-w-0 rounded-md border border-slate-200 bg-white px-3 text-sm"
                              >
                                <option value="">Escolher responsável</option>
                                {state.users.map((user) => (
                                  <option key={user.id} value={user.id}>{user.name}</option>
                                ))}
                              </select>
                            ) : (
                              <span className="text-sm text-slate-500">{owner?.name ?? 'Ainda não definida'}</span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </Panel>
                )}

                {implementationView === 'duvidas' && (
                  <Panel title="Dúvidas e melhorias">
                    <div className="grid gap-4">
                      <label className="grid gap-2">
                        <FieldLabel>O que ficou difícil ou confuso?</FieldLabel>
                        <textarea
                          value={implementationQuestion}
                          onChange={(event) => setImplementationQuestion(event.target.value)}
                          rows={3}
                          placeholder="Ex.: não entendi qual preço usar no pedido"
                          className="min-h-24 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#312e81]"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={addImplementationQuestion}
                        className="inline-flex min-h-10 items-center justify-center rounded-md bg-[#312e81] px-4 text-sm font-semibold text-white sm:w-fit"
                      >
                        Registrar dúvida
                      </button>
                      <div className="grid gap-3">
                        {state.implementationQuestions.map((question) => (
                          <article
                            key={question.id}
                            className="grid gap-3 rounded-md border border-slate-200 bg-white p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                          >
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <StatusBadge tone={question.resolved ? 'green' : 'amber'}>
                                  {question.resolved ? 'Resolvida' : 'Em revisão'}
                                </StatusBadge>
                                <span className="text-xs text-slate-400">
                                  {question.createdBy} · {formatDate(question.createdAt)}
                                </span>
                              </div>
                              <p className="mt-2 text-sm leading-5 text-slate-700">{question.text}</p>
                            </div>
                            {userRole === 'Admin' && (
                              <button
                                type="button"
                                onClick={() => toggleImplementationQuestion(question.id)}
                                className="inline-flex min-h-9 items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-[#312e81]"
                              >
                                {question.resolved ? 'Reabrir' : 'Marcar resolvida'}
                              </button>
                            )}
                          </article>
                        ))}
                        {!state.implementationQuestions.length && (
                          <EmptyLine text="Nenhuma dúvida registrada. Use este espaço durante o treinamento." />
                        )}
                      </div>
                    </div>
                  </Panel>
                )}
              </section>
            )}

            {activeArea === 'indicadores' && (
              <section className="grid gap-5">
                <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-end sm:justify-between md:p-4">
                  <div className="min-w-0">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                      Período analisado
                    </span>
                    <input
                      aria-label="Mês dos indicadores"
                      type="month"
                      value={indicatorMonth}
                      onChange={(event) => setIndicatorMonth(event.target.value)}
                      className="mt-1 block h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 sm:w-48"
                    />
                  </div>
                  <MobileViewSelect
                    label="Visão dos indicadores"
                    value={indicatorView}
                    options={[
                      ['atencao', 'Atenção agora'],
                      ['producao', 'Produção'],
                      ['produtos', 'Produtos e margem'],
                      ['estoque', 'Estoque'],
                    ]}
                    onChange={(value) => setIndicatorView(value as IndicatorView)}
                  />
                  <nav
                    aria-label="Visões dos indicadores"
                    className="hidden gap-2 sm:flex sm:flex-wrap"
                  >
                    {([
                      ['atencao', 'Atenção agora'],
                      ['producao', 'Produção'],
                      ['produtos', 'Produtos e margem'],
                      ['estoque', 'Estoque'],
                    ] as [IndicatorView, string][]).map(([key, label]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setIndicatorView(key)}
                        aria-current={indicatorView === key ? 'page' : undefined}
                        className={`min-h-10 shrink-0 rounded-md border px-3 text-sm font-medium transition ${
                          indicatorView === key
                            ? 'border-[#312e81] bg-[#312e81] text-white'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </nav>
                </div>

                {indicatorView === 'atencao' && (
                  <>
                    <div className="grid grid-cols-2 gap-2 sm:gap-3 xl:grid-cols-4">
                      <PocketMetric
                        label="Pedidos atrasados"
                        value={overdueSmartOrders.length.toString()}
                        detail={overdueSmartOrders.length ? 'Precisam de uma decisão hoje' : 'Nenhum prazo vencido'}
                        tone={overdueSmartOrders.length ? 'rose' : 'green'}
                      />
                      <PocketMetric
                        label="OPs atrasadas ou paradas"
                        value={indicatorSummary.delayedOps.length.toString()}
                        detail={indicatorSummary.delayedOps.length ? 'Revise prazo ou andamento' : 'Produção dentro do esperado'}
                        tone={indicatorSummary.delayedOps.length ? 'amber' : 'green'}
                      />
                      <PocketMetric
                        label="Pedidos sem OP"
                        value={ordersWaitingProductionOrder.length.toString()}
                        detail={ordersWaitingProductionOrder.length ? 'Precisam de decisão do PCP' : 'Todos os pedidos encaminhados'}
                        tone={ordersWaitingProductionOrder.length ? 'amber' : 'green'}
                      />
                      <PocketMetric
                        label="Estoque crítico"
                        value={generalPlan.attentionStock.length.toString()}
                        detail={generalPlan.attentionStock.length ? 'Itens para conferir ou comprar' : 'Nenhum item crítico'}
                        tone={generalPlan.attentionStock.length ? 'amber' : 'green'}
                      />
                    </div>

                    <div className="grid gap-5 xl:grid-cols-2">
                      <Panel title="Pedidos atrasados e próximos do prazo">
                        <div className="grid gap-3">
                          {overdueSmartOrders
                            .slice()
                            .sort((left, right) => (left.dueDate || '').localeCompare(right.dueDate || ''))
                            .map((order) => {
                              const product = state.products.find((item) => item.id === order.productId)
                              return (
                                <IndicatorActionRow
                                  key={order.id}
                                  badge={`${Math.abs(daysUntil(order.dueDate))} dia(s) atrasado`}
                                  tone="rose"
                                  title={`${order.id} · ${order.client}`}
                                  detail={`${productDisplayName(product, order.variationId)} · ${order.qty} un · prazo ${formatDate(order.dueDate)}`}
                                  value={order.status}
                                  actionLabel="Resolver pedido"
                                  onAction={() => setActiveArea('vendas')}
                                />
                              )
                            })}
                          {nearDueOrders
                            .slice()
                            .sort((left, right) => (left.dueDate || '').localeCompare(right.dueDate || ''))
                            .map((order) => {
                              const product = state.products.find((item) => item.id === order.productId)
                              const remainingDays = daysUntil(order.dueDate)
                              return (
                                <IndicatorActionRow
                                  key={`near-${order.id}`}
                                  badge={remainingDays === 0 ? 'Vence hoje' : `${remainingDays} dia(s) para o prazo`}
                                  tone="amber"
                                  title={`${order.id} · ${order.client}`}
                                  detail={`${productDisplayName(product, order.variationId)} · ${order.qty} un · prazo ${formatDate(order.dueDate)}`}
                                  value={order.status}
                                  actionLabel={order.status === 'Pronto' ? 'Separar entrega' : 'Ver pedido'}
                                  onAction={() => setActiveArea(order.status === 'Pronto' ? 'entregas' : 'vendas')}
                                />
                              )
                            })}
                          {!overdueSmartOrders.length && !nearDueOrders.length && (
                            <EmptyLine text="Nenhum pedido atrasado ou próximo do prazo." />
                          )}
                        </div>
                      </Panel>

                      <Panel title="Produções que precisam de atenção">
                        <div className="grid gap-3">
                          {indicatorSummary.delayedOps.map(({ op, product, relatedOrder, stoppedDays, overdue }) => (
                            <IndicatorActionRow
                              key={op.id}
                              badge={op.status === 'Pausada' ? 'Pausada' : overdue ? 'Prazo vencido' : 'Sem atualização'}
                              tone={overdue ? 'rose' : 'amber'}
                              title={`${op.id} · ${productDisplayName(product, op.variationId)}`}
                              detail={`${relatedOrder ? `Pedido ${relatedOrder.id} · ` : ''}${op.produced}/${op.qty} un prontas · ${
                                Number.isFinite(stoppedDays) ? `${stoppedDays} dia(s) sem lançamento` : 'sem início registrado'
                              }`}
                              value={op.priority}
                              actionLabel="Abrir produção"
                              onAction={() => {
                                setGuidedOpId(op.id)
                                setActiveArea('producao')
                              }}
                            />
                          ))}
                          {!indicatorSummary.delayedOps.length && (
                            <EmptyLine text="Nenhuma produção atrasada ou parada." />
                          )}
                        </div>
                      </Panel>

                      <Panel title="Falta de material para produzir">
                        <div className="grid gap-3">
                          {materialShortageAlerts.map(({ op, product, missing }) => (
                            <IndicatorActionRow
                              key={`shortage-${op.id}`}
                              badge="Compra necessária"
                              tone="rose"
                              title={`${op.id} · ${productDisplayName(product, op.variationId)}`}
                              detail={missing
                                .slice(0, 2)
                                .map((item) => `${item.missing.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} ${item.unit} de ${item.item}`)
                                .join(' · ')}
                              value={`${missing.length} item(ns)`}
                              actionLabel="Preparar compra"
                              onAction={() => {
                                setPurchaseView('necessidades')
                                setActiveArea('notas')
                              }}
                            />
                          ))}
                          {!materialShortageAlerts.length && (
                            <EmptyLine text="As ordens abertas possuem os materiais necessários." />
                          )}
                        </div>
                      </Panel>
                    </div>
                  </>
                )}

                {indicatorView === 'producao' && (
                  <>
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      <PocketMetric
                        label="Planejado"
                        value={`${indicatorSummary.plannedQty.toLocaleString('pt-BR')} un`}
                        detail="Quantidade das OPs do mês"
                        tone="neutral"
                      />
                      <PocketMetric
                        label="Realizado"
                        value={`${indicatorSummary.producedQty.toLocaleString('pt-BR')} un`}
                        detail={`${indicatorSummary.completionRate.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}% · ${indicatorSummary.productionLaunches} lançamento(s)`}
                        tone={indicatorSummary.completionRate >= 100 ? 'green' : 'blue'}
                      />
                      <PocketMetric
                        label="Perdas e defeitos"
                        value={`${indicatorSummary.lostQty.toLocaleString('pt-BR')} un`}
                        detail={`${indicatorSummary.reworkQty.toLocaleString('pt-BR')} un em retrabalho`}
                        tone={indicatorSummary.lostQty ? 'rose' : 'green'}
                      />
                      <PocketMetric
                        label="Prazo médio"
                        value={`${indicatorSummary.averageLeadTime.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} dias`}
                        detail={`${indicatorSummary.completedOps} OP(s) concluída(s) no mês`}
                        tone="neutral"
                      />
                    </div>

                    <div className="grid gap-5 xl:grid-cols-2">
                      <Panel title="Planejado versus realizado">
                        <div className="grid gap-4">
                          <div>
                            <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                              <span className="text-slate-500">Avanço das OPs do mês</span>
                              <strong>{indicatorSummary.completionRate.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%</strong>
                            </div>
                            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className="h-full rounded-full bg-[#312e81]"
                                style={{ width: `${Math.min(100, indicatorSummary.completionRate)}%` }}
                              />
                            </div>
                          </div>
                          <p className="text-sm leading-6 text-slate-600">
                            Foram planejadas {indicatorSummary.plannedQty.toLocaleString('pt-BR')} peças e registradas{' '}
                            {indicatorSummary.producedQty.toLocaleString('pt-BR')} peças prontas.
                          </p>
                          <button
                            type="button"
                            onClick={() => setActiveArea('producao')}
                            className="inline-flex min-h-10 items-center justify-center rounded-md bg-[#312e81] px-4 text-sm font-semibold text-white sm:w-fit"
                          >
                            Acompanhar ordens
                          </button>
                        </div>
                      </Panel>

                      <Panel title="Consumo e desperdício">
                        <div className="grid gap-3">
                          {indicatorSummary.consumptionByMaterial.slice(0, 8).map((item) => (
                            <IndicatorActionRow
                              key={item.item}
                              badge={item.wasteQty ? 'Com desperdício' : 'Consumo normal'}
                              tone={item.wasteQty ? 'rose' : 'neutral'}
                              title={item.item}
                              detail={`Consumido: ${item.qty.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} ${item.unit}${
                                item.wasteQty
                                  ? ` · perdas: ${item.wasteQty.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} ${item.unit}`
                                  : ''
                              }`}
                              value={canSeeMoney ? money(item.value) : `${item.qty.toLocaleString('pt-BR')} ${item.unit}`}
                              actionLabel="Ver movimentações"
                              onAction={() => setActiveArea('movimentacoes')}
                            />
                          ))}
                          {!indicatorSummary.consumptionByMaterial.length && (
                            <EmptyLine text="Ainda não há consumo registrado neste mês." />
                          )}
                        </div>
                      </Panel>
                    </div>
                  </>
                )}

                {indicatorView === 'produtos' && (
                  <div className="grid gap-5 xl:grid-cols-2">
                    <Panel title="Produtos mais vendidos">
                      <div className="grid gap-3">
                        {indicatorSummary.topProducts.slice(0, 8).map((item, index) => (
                          <IndicatorActionRow
                            key={item.key}
                            badge={`${index + 1}º no mês`}
                            tone={index === 0 ? 'green' : 'neutral'}
                            title={productDisplayName(item.product, item.variationId)}
                            detail={`${item.orders} pedido(s) · ${item.qty.toLocaleString('pt-BR')} peça(s)`}
                            value={canSeeMoney ? money(item.revenue) : `${item.qty} un`}
                            actionLabel="Ver vendas"
                            onAction={() => setActiveArea('vendas')}
                          />
                        ))}
                        {!indicatorSummary.topProducts.length && (
                          <EmptyLine text="Nenhum pedido registrado neste mês." />
                        )}
                      </div>
                    </Panel>

                    <Panel title="Margem por produto">
                      <div className="grid gap-3">
                        {indicatorSummary.productMargins.slice(0, 8).map((item) => (
                          <IndicatorActionRow
                            key={item.key}
                            badge={`Margem ${item.basis}`}
                            tone={item.margin < 0 ? 'rose' : item.margin < 15 ? 'amber' : 'green'}
                            title={productDisplayName(item.product, item.variationId)}
                            detail={`${item.qty} peça(s) · ${item.orders} pedido(s) · lucro ${item.basis}`}
                            value={`${item.margin.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`}
                            actionLabel="Analisar resultado"
                            onAction={() => {
                              setFinanceView('resultados')
                              setActiveArea('financeiro')
                            }}
                          />
                        ))}
                        {!indicatorSummary.productMargins.length && (
                          <EmptyLine text="Ainda não existem pedidos para calcular margem." />
                        )}
                      </div>
                    </Panel>

                    <Panel title="Preço oficial versus vendido">
                      <div className="grid gap-3">
                        {indicatorSummary.priceDifferences.slice(0, 8).map((item) => (
                          <IndicatorActionRow
                            key={item.key}
                            badge={item.difference < 0 ? 'Vendido abaixo' : item.difference > 0 ? 'Vendido acima' : 'Mesmo preço'}
                            tone={item.difference < 0 ? 'amber' : 'green'}
                            title={productDisplayName(item.product, item.variationId)}
                            detail={`Oficial médio: ${money(item.officialAverage)} · vendido médio: ${money(item.soldAverage)}`}
                            value={`${item.differencePercent > 0 ? '+' : ''}${item.differencePercent.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`}
                            actionLabel="Revisar preços"
                            onAction={() => setActiveArea('precos')}
                          />
                        ))}
                        {!indicatorSummary.priceDifferences.length && (
                          <EmptyLine text="Nenhuma comparação de preço disponível neste mês." />
                        )}
                      </div>
                    </Panel>
                  </div>
                )}

                {indicatorView === 'estoque' && (
                  <div className="grid gap-5 xl:grid-cols-2">
                    <Panel title="Estoque crítico">
                      <div className="grid gap-3">
                        {generalPlan.attentionStock.map((item) => (
                          <IndicatorActionRow
                            key={`${item.item}-${item.unit}`}
                            badge="Estoque baixo"
                            tone="rose"
                            title={item.item}
                            detail={
                              'minimumStock' in item
                                ? `Atual: ${item.qty.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} ${item.unit} · mínimo: ${item.minimumStock.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} ${item.unit}`
                                : `Atual: ${item.qty.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} ${item.unit}`
                            }
                            value="Conferir"
                            actionLabel="Abrir estoque"
                            onAction={() => setActiveArea('estoque')}
                          />
                        ))}
                        {!generalPlan.attentionStock.length && (
                          <EmptyLine text="Nenhum item está abaixo do nível de atenção." />
                        )}
                      </div>
                    </Panel>

                    <Panel title="Estoque sem movimentação">
                      <div className="grid gap-3">
                        {indicatorSummary.staleStock.slice(0, 10).map((item) => (
                          <IndicatorActionRow
                            key={`${item.category}-${item.item}`}
                            badge={item.category}
                            tone="amber"
                            title={item.item}
                            detail={
                              item.lastMovement
                                ? `Sem movimentação há ${item.daysWithoutMovement} dia(s)`
                                : 'Sem data de movimentação registrada'
                            }
                            value={`${item.qty.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} ${item.unit}`}
                            actionLabel="Ver histórico"
                            onAction={() => {
                              setInventoryHistoryItem(item.item)
                              setMovementView('historico')
                              setActiveArea('movimentacoes')
                            }}
                          />
                        ))}
                        {!indicatorSummary.staleStock.length && (
                          <EmptyLine text="Nenhum saldo está parado há 60 dias ou mais." />
                        )}
                      </div>
                    </Panel>
                  </div>
                )}
              </section>
            )}

            {activeArea === 'painel' && (
              <section className="grid gap-5">
                <Panel title="O que vamos resolver agora?">
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <QuickTaskButton
                      icon={<ClipboardList />}
                      title="Entrou pedido"
                      detail="Cadastrar cliente, peça, prazo e quantidade"
                      onClick={() => {
                        setGuidedOrderStep(1)
                        startQuickTask('pedido-guiado', 'Siga os passos para registrar a venda e criar a produção.')
                      }}
                    />
                    <QuickTaskButton
                      icon={<Scissors />}
                      title="Produzi hoje"
                      detail="Lançar quantas peças ficaram prontas"
                      onClick={() => {
                        setGuidedProductionStep(1)
                        startQuickTask('producao-guiada', 'Siga os passos para lançar a produção de hoje.')
                      }}
                    />
                    <QuickTaskButton
                      icon={<PackageCheck />}
                      title="Conferir estoque"
                      detail="Ver matéria-prima, produto pronto e compras"
                      onClick={() =>
                        startQuickTask('estoque', 'Confira o saldo de estoque e a lista automática de compras sugeridas.')
                      }
                    />
                    <QuickTaskButton
                      icon={<Printer />}
                      title="Ver ordens abertas"
                      detail="Acompanhar, pausar, registrar ou imprimir ordem"
                      onClick={() =>
                        startQuickTask('producao-guiada', 'Veja as ordens abertas e escolha o próximo registro.')
                      }
                    />
                  </div>
                </Panel>

                <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                  <DashboardBlock
                    title="Pedidos para produzir"
                    value={dashboard.ordersToProduce.length.toString()}
                    icon={<ClipboardList />}
                  >
                    <div className="grid gap-2">
                      {dashboard.ordersToProduce.slice(0, 4).map((order) => {
                        const product = state.products.find((item) => item.id === order.productId)
                        return (
                          <MiniRow
                            key={order.id}
                            title={`${order.id} · ${order.client}`}
                            detail={`${productDisplayName(product, order.variationId)} · ${order.qty} un · ${order.status}`}
                          />
                        )
                      })}
                      {!dashboard.ordersToProduce.length && (
                        <EmptyLine text="Nenhum pedido pendente." />
                      )}
                    </div>
                  </DashboardBlock>

                  <DashboardBlock
                    title="Produção de hoje"
                    value={`${dashboard.activeOps.length} ordem`}
                    icon={<Scissors />}
                  >
                    <div className="grid gap-2">
                      <MiniRow title="Unidades lançadas" detail={`${dashboard.producedUnits} un registradas`} />
                      <MiniRow title="Em produção" detail={`${dashboard.activeOps.length} ordem(ns) em andamento`} />
                      <MiniRow
                        title="Pausadas"
                        detail={`${state.productionOrders.filter((op) => op.status === 'Pausada').length} ordem(ns)`}
                      />
                    </div>
                  </DashboardBlock>
                </div>

                <div className="grid gap-5 xl:grid-cols-[repeat(3,minmax(0,1fr))]">
                  <DashboardBlock
                    title="Estoque baixo"
                    value={(dashboard.lowRaw.length + dashboard.lowFinished.length).toString()}
                    icon={<Package />}
                  >
                    <div className="grid gap-2">
                      {[...dashboard.lowRaw, ...dashboard.lowFinished].slice(0, 4).map((item) => (
                        <MiniRow
                          key={`${item.item}-${item.unit}`}
                          title={item.item}
                          detail={
                            'minimumStock' in item
                              ? `Atual: ${item.qty.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} ${item.unit} · Mínimo: ${item.minimumStock.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} ${item.unit}`
                              : `${item.qty.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} ${item.unit}`
                          }
                        />
                      ))}
                      {!dashboard.lowRaw.length && !dashboard.lowFinished.length && (
                        <EmptyLine text="Nenhum item crítico." />
                      )}
                    </div>
                  </DashboardBlock>

                  <DashboardBlock
                    title="Entradas e saídas do mês"
                    value={canSeeMoney ? money(totals.balance) : 'Restrito'}
                    icon={<Banknote />}
                  >
                    <div className="grid gap-2">
                      {canSeeMoney ? (
                        <>
                          <MiniRow title="Entradas" detail={money(totals.income)} />
                          <MiniRow title="Saídas" detail={money(totals.expenses)} />
                          <MiniRow title="Saldo" detail={money(totals.balance)} />
                        </>
                      ) : (
                        <EmptyLine text="Valores disponíveis para Admin e Financeiro." />
                      )}
                    </div>
                  </DashboardBlock>

                  <DashboardBlock title="Atalhos rápidos" value="4" icon={<Plus />}>
                    <div className="grid gap-2">
                      {canAccessArea('pedidos') && <DashboardAction label="Novo pedido" onClick={() => setActiveArea('pedidos')} />}
                      {canAccessArea('producao') && <DashboardAction label="Lançar produção" onClick={() => setActiveArea('producao')} />}
                      {canAccessArea('estoque') && <DashboardAction label="Ver estoque" onClick={() => setActiveArea('estoque')} />}
                      {canManagePurchases && <DashboardAction label="Lançar compra" onClick={() => setActiveArea('notas')} />}
                    </div>
                  </DashboardBlock>
                </div>
              </section>
            )}

            {activeArea === 'configuracoes' && loggedUser && (
              <section className="grid gap-5">
                <div className="grid gap-5 xl:grid-cols-[minmax(320px,360px)_minmax(0,1fr)]">
                  <Panel title="Minha conta">
                    <div className="grid gap-3">
                      {authProfile?.mustChangePassword && (
                        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm leading-5 text-amber-950">
                          Esta é uma senha temporária. Crie uma senha pessoal com pelo menos 8 caracteres para liberar o sistema.
                        </div>
                      )}
                      <ReadOnlyField label="Nome" value={loggedUser.name} />
                      <ReadOnlyField label="Perfil" value={loggedUser.role} />
                      <ReadOnlyField
                        label="Status"
                        value={authProfile?.mustChangePassword ? 'Troca de senha necessária' : 'Acesso protegido'}
                      />
                    </div>
                  </Panel>

                  <Panel title="Alterar minha senha">
                    <div className="grid gap-4 md:max-w-md">
                      <label className="grid gap-2">
                        <FieldLabel>Senha atual</FieldLabel>
                        <input
                          type="password"
                          autoComplete="current-password"
                          value={currentPassword}
                          onChange={(event) => setCurrentPassword(event.target.value)}
                          className="h-11 rounded-md border border-black/10 bg-white px-3 text-sm outline-none focus:border-[#3730a3]"
                        />
                      </label>
                      <label className="grid gap-2">
                        <FieldLabel>Nova senha</FieldLabel>
                        <input
                          type="password"
                          minLength={normalizedStoreEnabled ? 8 : undefined}
                          autoComplete="new-password"
                          placeholder={normalizedStoreEnabled ? 'Pelo menos 8 caracteres' : undefined}
                          value={newAccountPassword}
                          onChange={(event) => setNewAccountPassword(event.target.value)}
                          className="h-11 rounded-md border border-black/10 bg-white px-3 text-sm outline-none focus:border-[#3730a3]"
                        />
                      </label>
                      <label className="grid gap-2">
                        <FieldLabel>Confirmar nova senha</FieldLabel>
                        <input
                          type="password"
                          minLength={normalizedStoreEnabled ? 8 : undefined}
                          autoComplete="new-password"
                          value={confirmAccountPassword}
                          onChange={(event) => setConfirmAccountPassword(event.target.value)}
                          className="h-11 rounded-md border border-black/10 bg-white px-3 text-sm outline-none focus:border-[#3730a3]"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => void updateOwnPassword()}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#111827] px-4 text-sm font-medium text-white"
                      >
                        Salvar nova senha
                      </button>
                    </div>
                  </Panel>
                </div>

                {userRole === 'Admin' && !authProfile?.mustChangePassword && (
                  <>
                    <Panel title="Empresa e documentos">
                      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
                        <div className="grid gap-4">
                          <div className="grid gap-3 md:grid-cols-3">
                            <SoftInput label="Nome da empresa" value={state.company.name} onChange={(value) => updateCompanySetting('name', value)} />
                            <SoftInput label="Telefone / WhatsApp" value={state.company.phone} onChange={(value) => updateCompanySetting('phone', value)} />
                            <SoftInput label="Endereço" value={state.company.address} onChange={(value) => updateCompanySetting('address', value)} />
                          </div>

                          <div className="grid gap-3 md:grid-cols-[1fr_220px]">
                            <SoftInput label="URL da logo" value={state.company.logoUrl} onChange={(value) => updateCompanySetting('logoUrl', value)} />
                            <label className="grid gap-2">
                              <FieldLabel>Enviar logo</FieldLabel>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(event) => uploadCompanyLogo(event.target.files?.[0])}
                                className="h-11 rounded-md border border-[#e5e7eb] bg-[#ffffff] px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-[#111827] file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white"
                              />
                            </label>
                          </div>

                          <label className="grid gap-2">
                            <FieldLabel>Texto padrão do orçamento</FieldLabel>
                            <textarea
                              value={state.company.budgetDefaultText}
                              onChange={(event) => updateCompanySetting('budgetDefaultText', event.target.value)}
                              rows={3}
                              className="min-h-24 rounded-md border border-[#e5e7eb] bg-[#ffffff] px-3 py-2 text-sm leading-5 outline-none transition focus:border-[#4f46e5] focus:bg-white"
                            />
                          </label>

                          <div className="grid gap-3 md:grid-cols-[220px_1fr]">
                            <SoftNumber
                              label="Validade do orçamento (dias)"
                              value={state.company.budgetValidityDays}
                              onChange={(value) => updateCompanySetting('budgetValidityDays', Math.max(1, value))}
                            />
                            <label className="grid gap-2">
                              <FieldLabel>Observação padrão</FieldLabel>
                              <textarea
                                value={state.company.budgetDefaultNotes}
                                onChange={(event) => updateCompanySetting('budgetDefaultNotes', event.target.value)}
                                rows={3}
                                className="min-h-24 rounded-md border border-[#e5e7eb] bg-[#ffffff] px-3 py-2 text-sm leading-5 outline-none transition focus:border-[#4f46e5] focus:bg-white"
                              />
                            </label>
                          </div>
                        </div>

                        <div className="rounded-lg border border-[#e5e7eb] bg-[#ffffff] p-4">
                          <span className="text-xs font-medium uppercase tracking-[0.08em] text-black/45">Prévia</span>
                          <div className="mt-3 flex h-28 items-center justify-center rounded-md border border-[#e5e7eb] bg-white p-4">
                            <img src={companyLogo} alt={state.company.name} className="max-h-full max-w-full object-contain" />
                          </div>
                          <div className="mt-4 grid gap-1 text-sm text-black/62">
                            <strong className="text-[#111827]">{state.company.name}</strong>
                            <span>{state.company.phone}</span>
                            <span>{state.company.address}</span>
                            <span>Orçamento válido por {state.company.budgetValidityDays} dia(s).</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => updateCompanySetting('logoUrl', '')}
                            className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-md border border-[#d1d5db] bg-white px-3 text-sm font-medium text-[#4b5563]"
                          >
                            Usar logo padrão Maçaroca
                          </button>
                        </div>
                      </div>
                    </Panel>

                    <Panel title="Backup e exportação">
                      <div className="grid gap-5">
                        <div className="rounded-md border border-[#e5e7eb] bg-[#ffffff] p-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <StatusBadge tone={syncStatus === 'Compartilhado' ? 'green' : syncStatus === 'Salvando' ? 'blue' : 'amber'}>
                              {syncStatus}
                            </StatusBadge>
                            <strong>Banco compartilhado</strong>
                          </div>
                          <p className="mt-2 text-sm leading-6 text-black/58">{syncDetail}</p>
                          {lastCloudSync && (
                            <p className="mt-1 text-xs text-black/42">
                              Última sincronização: {new Date(lastCloudSync).toLocaleString('pt-BR')}
                            </p>
                          )}
                          <button
                            type="button"
                            onClick={() => void refreshSharedState()}
                            className="mt-4 inline-flex h-10 items-center gap-2 rounded-md border border-[#d1d5db] bg-white px-3 text-sm font-medium text-[#111827] transition hover:border-[#3730a3] hover:text-[#3730a3]"
                          >
                            <RefreshCw className="h-4 w-4" />
                            Sincronizar agora
                          </button>
                        </div>

                        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                        <div>
                          <p className="text-sm leading-6 text-black/58">
                            Exporte os dados antes de começar a usar com informações reais ou antes de fazer mudanças grandes.
                          </p>
                          <p className="mt-2 text-xs leading-5 text-black/42">
                            O JSON é o backup completo. O CSV é consolidado para abrir no Excel e não inclui senhas.
                          </p>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2 md:min-w-[360px]">
                          <button
                            type="button"
                            onClick={exportBackupJson}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#111827] px-4 text-sm font-medium text-white"
                          >
                            <FileText className="h-4 w-4" />
                            Exportar JSON
                          </button>
                          <button
                            type="button"
                            onClick={exportBackupCsv}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[#d1d5db] bg-white px-4 text-sm font-medium text-[#4b5563]"
                          >
                            <ReceiptText className="h-4 w-4" />
                            Exportar CSV
                          </button>
                        </div>
                      </div>
                      </div>
                    </Panel>
                  </>
                )}
              </section>
            )}

            {activeArea === 'pedido-guiado' && selectedProduct && (
              <section className="grid gap-5">
                <Panel title="Novo orçamento ou pedido">
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                    {[
                      'Cliente',
                      'Produto',
                      'Quantidade',
                      'Preço',
                      'Pagamento',
                      'Disponibilidade',
                      'Resumo',
                      'Salvar',
                    ].map((label, index) => (
                      <StepButton
                        key={label}
                        number={index + 1}
                        label={label}
                        active={guidedOrderStep === index + 1}
                        done={guidedOrderStep > index + 1}
                        onClick={() => setGuidedOrderStep(index + 1)}
                      />
                    ))}
                  </div>
                </Panel>

                {guidedOrderStep === 1 && (
                  <Panel title="1. Quem está comprando?">
                    <div className="grid gap-4">
                      <label className="grid gap-2">
                        <FieldLabel>Cliente</FieldLabel>
                        <select
                          value={selectedCustomerId}
                          onChange={(event) => {
                            const customer = state.customers.find((item) => item.id === event.target.value)
                            setSelectedCustomerId(event.target.value)
                            setOrderDeliveryAddress(customer?.address || customer?.city || '')
                          }}
                          className="h-11 rounded-md border border-black/10 bg-white px-3 text-sm outline-none"
                        >
                          {state.customers.map((customer) => (
                            <option key={customer.id} value={customer.id}>{customer.name}</option>
                          ))}
                        </select>
                      </label>
                      {selectedCustomer && (
                        <div className="grid gap-1 rounded-md border border-[#e5e7eb] bg-[#f9fafb] p-4 text-sm text-black/60">
                          <strong className="text-[#111827]">{selectedCustomer.name}</strong>
                          <span>{selectedCustomer.phone || 'Telefone não informado'}</span>
                          <span>{selectedCustomer.address || selectedCustomer.city || 'Endereço não informado'}</span>
                        </div>
                      )}
                      <FlowButtons onBack={null} onNext={() => setGuidedOrderStep(2)} nextLabel="Escolher produto" />
                    </div>
                  </Panel>
                )}

                {guidedOrderStep === 2 && (
                  <Panel title="2. Qual peça e variação?">
                    <div className="grid gap-4">
                      <label className="grid gap-2">
                        <FieldLabel>Produto</FieldLabel>
                        <select
                          value={selectedProductId}
                          onChange={(event) => setSelectedProductId(event.target.value)}
                          className="h-11 rounded-md border border-black/10 bg-white px-3 text-sm outline-none"
                        >
                          {state.products.map((product) => (
                            <option
                              value={product.id}
                              key={product.id}
                              disabled={product.active === false || !product.variations.some((variation) => (variation.sheetStatus ?? 'Aprovada') === 'Aprovada')}
                            >
                              {product.code} · {product.name} · {product.brand}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="grid gap-2">
                        <FieldLabel>Variação</FieldLabel>
                        <select
                          value={activeVariationId ?? ''}
                          onChange={(event) => setSelectedVariationId(event.target.value)}
                          className="h-11 rounded-md border border-black/10 bg-white px-3 text-sm outline-none"
                        >
                          {selectedProduct.variations.map((variation) => (
                            <option key={variation.id} value={variation.id} disabled={(variation.sheetStatus ?? 'Aprovada') !== 'Aprovada'}>
                              {variation.name} · {variation.fabric || 'tecido não informado'}
                            </option>
                          ))}
                        </select>
                      </label>
                      <div className="rounded-md border border-[#e5e7eb] bg-[#f9fafb] p-4 text-sm text-black/60">
                        <strong className="block text-[#111827]">{selectedProduct.code} · {productDisplayName(selectedProduct, activeVariationId)}</strong>
                        <span className="mt-1 block">{selectedVariation?.measurements || selectedProduct.description}</span>
                      </div>
                      <FlowButtons onBack={() => setGuidedOrderStep(1)} onNext={() => setGuidedOrderStep(3)} nextLabel="Informar quantidade" />
                    </div>
                  </Panel>
                )}

                {guidedOrderStep === 3 && (
                  <Panel title="3. Quantas peças?">
                    <div className="grid gap-4">
                      <SoftNumber label="Quantidade" value={orderQty} onChange={(value) => setOrderQty(Math.max(1, Math.floor(value)))} />
                      <div className="rounded-md border border-[#e5e7eb] bg-[#f9fafb] p-4 text-sm text-black/60">
                        {productDisplayName(selectedProduct, activeVariationId)} · {orderQty} un
                      </div>
                      <FlowButtons onBack={() => setGuidedOrderStep(2)} onNext={() => setGuidedOrderStep(4)} nextLabel="Definir preço" />
                    </div>
                  </Panel>
                )}

                {guidedOrderStep === 4 && (
                  <Panel title="4. Qual foi o preço combinado?">
                    <div className="grid gap-4">
                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <MiniStat label="Mínimo" value={money(selectedMinimumPrice)} tone="amber" />
                        <MiniStat label="Sugerido" value={money(selectedPrice)} />
                        <MiniStat label="Oficial" value={selectedSalePrice ? money(selectedSalePrice) : 'Não definido'} />
                        <MiniStat
                          label="Diferença do oficial"
                          value={
                            selectedSalePrice
                              ? `${money(finalOrderUnitPrice - selectedSalePrice)} · ${currentOrderPricing.discountPercent.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}% desc.`
                              : 'Sem preço oficial'
                          }
                          tone={selectedSalePrice && finalOrderUnitPrice < selectedSalePrice ? 'amber' : 'green'}
                        />
                      </div>
                      <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
                        <SoftNumber label="Preço por peça" value={orderUnitPriceInput} onChange={setOrderUnitPriceInput} />
                        <button
                          type="button"
                          onClick={() => setOrderUnitPriceInput(Math.round(selectedOrderPrice))}
                          className="inline-flex h-11 items-center justify-center rounded-md border border-[#d1d5db] bg-white px-4 text-sm font-medium"
                        >
                          Usar preço {selectedSalePrice ? 'oficial' : 'sugerido'}
                        </button>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <MiniStat
                          label="Margem real"
                          value={`${money(currentOrderPricing.realProfit)} · ${currentOrderPricing.realMargin.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`}
                          tone={currentOrderNeedsApproval ? 'rose' : 'green'}
                        />
                        <MiniStat label="Total" value={money(orderQty * finalOrderUnitPrice)} tone="green" />
                      </div>
                      {currentOrderNeedsApproval && (
                        <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm leading-5 text-rose-900">
                          Preço abaixo do mínimo. {canApproveDiscount ? 'Sua autorização será registrada ao confirmar.' : 'O pedido precisará da aprovação de um administrador.'}
                        </div>
                      )}
                      {finalOrderUnitPrice <= 0 && (
                        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm leading-5 text-amber-900">
                          Informe o preço combinado para continuar.
                        </div>
                      )}
                      <FlowButtons
                        onBack={() => setGuidedOrderStep(3)}
                        onNext={() => {
                          if (finalOrderUnitPrice <= 0) {
                            setMessage('Defina um preço por peça maior que zero para continuar.')
                            return
                          }
                          setGuidedOrderStep(5)
                        }}
                        nextLabel="Pagamento e entrega"
                      />
                    </div>
                  </Panel>
                )}

                {guidedOrderStep === 5 && (
                  <Panel title="5. Como será o pagamento e a entrega?">
                    <div className="grid gap-4">
                      <div className="grid gap-3 md:grid-cols-2">
                        <label className="grid gap-2">
                          <FieldLabel>Forma de pagamento</FieldLabel>
                          <select value={orderPaymentMethod} onChange={(event) => setOrderPaymentMethod(event.target.value as PaymentMethod)} className="h-11 rounded-md border border-black/10 bg-white px-3 text-sm outline-none">
                            {(['Pix', 'Dinheiro', 'Cartão', 'Transferência', 'Boleto', 'A combinar'] as PaymentMethod[]).map((value) => <option key={value}>{value}</option>)}
                          </select>
                        </label>
                        <label className="grid gap-2">
                          <FieldLabel>Situação do pagamento</FieldLabel>
                          <select value={orderPaymentStatus} onChange={(event) => setOrderPaymentStatus(event.target.value as PaymentStatus)} className="h-11 rounded-md border border-black/10 bg-white px-3 text-sm outline-none">
                            {(['Pendente', 'Parcial', 'Pago'] as PaymentStatus[]).map((value) => <option key={value}>{value}</option>)}
                          </select>
                        </label>
                        <label className="grid gap-2">
                          <FieldLabel>Forma de entrega</FieldLabel>
                          <select value={orderDeliveryMethod} onChange={(event) => setOrderDeliveryMethod(event.target.value as DeliveryMethod)} className="h-11 rounded-md border border-black/10 bg-white px-3 text-sm outline-none">
                            {(['Retirada', 'Entrega local', 'Transportadora', 'Correios', 'A combinar'] as DeliveryMethod[]).map((value) => <option key={value}>{value}</option>)}
                          </select>
                        </label>
                        <SoftInput label="Endereço de entrega" value={orderDeliveryAddress} onChange={setOrderDeliveryAddress} />
                        <SoftInput label="Data da venda" value={orderDate} onChange={setOrderDate} />
                        <SoftInput label="Prazo de entrega" value={orderDeliveryDate} onChange={(value) => { setOrderDeliveryDate(value); setOrderDueDate(value) }} />
                      </div>
                      <SoftInput label="Condição ou observação do pagamento" value={orderPaymentNotes} onChange={setOrderPaymentNotes} />
                      <SoftInput label="Observações do pedido" value={orderNotes} onChange={setOrderNotes} />
                      <FlowButtons onBack={() => setGuidedOrderStep(4)} onNext={() => setGuidedOrderStep(6)} nextLabel="Ver disponibilidade" />
                    </div>
                  </Panel>
                )}

                {guidedOrderStep === 6 && (
                  <Panel title="6. Tem estoque suficiente?">
                    <div className="grid gap-4">
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <MiniStat label="Estoque físico" value={`${draftPhysicalStock} un`} />
                        <MiniStat label="Já reservado" value={`${draftReservedStock} un`} />
                        <MiniStat label="Livre agora" value={`${draftAvailableStock} un`} tone={draftAvailableStock >= orderQty ? 'green' : 'amber'} />
                        <MiniStat label="Falta produzir" value={`${draftMissingStock} un`} tone={draftMissingStock > 0 ? 'rose' : 'green'} />
                      </div>
                      <div className={`rounded-md border p-4 text-sm leading-6 ${draftMissingStock > 0 ? 'border-amber-200 bg-amber-50 text-amber-900' : 'border-emerald-200 bg-emerald-50 text-emerald-900'}`}>
                        {draftMissingStock > 0
                          ? `O pedido pode ser confirmado. ${Math.min(orderQty, draftAvailableStock)} un serão atendidas pelo estoque e o PCP verá que precisa produzir ${draftMissingStock} un.`
                          : `Há estoque livre para atender as ${orderQty} un. Ao confirmar como pedido, essa quantidade ficará reservada.`}
                      </div>
                      <FlowButtons onBack={() => setGuidedOrderStep(5)} onNext={() => setGuidedOrderStep(7)} nextLabel="Conferir resumo" />
                    </div>
                  </Panel>
                )}

                {guidedOrderStep === 7 && (
                  <Panel title="7. Confira antes de salvar">
                    <div className="grid gap-4">
                      <div className="grid gap-3 md:grid-cols-2">
                        <MiniRow title="Cliente" detail={selectedCustomer?.name ?? 'Sem cliente'} />
                        <MiniRow title="Produto" detail={`${selectedProduct.code} · ${productDisplayName(selectedProduct, activeVariationId)}`} />
                        <MiniRow title="Quantidade e valor" detail={`${orderQty} un · ${money(finalOrderUnitPrice)} por peça · ${money(orderQty * finalOrderUnitPrice)} total`} />
                        <MiniRow
                          title="Preço oficial e negociado"
                          detail={
                            selectedSalePrice
                              ? `${money(selectedSalePrice)} oficial → ${money(finalOrderUnitPrice)} negociado · ${currentOrderPricing.discountPercent.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}% de desconto`
                              : `Sem preço oficial · ${money(finalOrderUnitPrice)} negociado`
                          }
                        />
                        <MiniRow title="Pagamento" detail={`${orderPaymentMethod} · ${orderPaymentStatus}${orderPaymentNotes ? ` · ${orderPaymentNotes}` : ''}`} />
                        <MiniRow title="Entrega" detail={`${orderDeliveryMethod} · ${formatDate(orderDeliveryDate)} · ${orderDeliveryAddress || 'endereço não informado'}`} />
                        <MiniRow title="Estoque" detail={draftMissingStock > 0 ? `${draftMissingStock} un precisarão de produção` : `${orderQty} un poderão ser reservadas`} />
                        <MiniRow title="Margem" detail={`${money(currentOrderPricing.realProfit)} por peça · ${currentOrderPricing.realMargin.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`} />
                        <MiniRow title="Aprovação" detail={currentOrderNeedsApproval ? (canApproveDiscount ? 'Será aprovada por você' : 'Aguardará administrador') : 'Não necessária'} />
                      </div>
                      <FlowButtons onBack={() => setGuidedOrderStep(6)} onNext={() => setGuidedOrderStep(8)} nextLabel="Escolher como salvar" />
                    </div>
                  </Panel>
                )}

                {guidedOrderStep === 8 && (
                  <Panel title="8. Salvar orçamento ou confirmar pedido">
                    <div className="grid gap-4">
                      <div className="grid gap-3 md:grid-cols-2">
                        <button
                          type="button"
                          onClick={() => createGuidedOrder('Orçamento')}
                          className="grid min-h-32 gap-2 rounded-md border border-[#d1d5db] bg-white p-5 text-left transition hover:border-[#3730a3]"
                        >
                          <ReceiptText className="h-5 w-5 text-[#3730a3]" />
                          <strong>Salvar como orçamento</strong>
                          <span className="text-sm leading-5 text-black/55">Não reserva estoque e não entra no financeiro. Pode ser impresso, duplicado ou convertido depois.</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => createGuidedOrder('Pedido')}
                          className="grid min-h-32 gap-2 rounded-md bg-[#111827] p-5 text-left text-white transition hover:bg-[#3730a3]"
                        >
                          <PackageCheck className="h-5 w-5" />
                          <strong>Confirmar como pedido</strong>
                          <span className="text-sm leading-5 text-white/70">Reserva o estoque disponível, registra o financeiro e mostra ao PCP o que falta produzir.</span>
                        </button>
                      </div>
                      <button type="button" onClick={() => setGuidedOrderStep(7)} className="inline-flex h-11 items-center justify-center rounded-md border border-[#d1d5db] bg-white px-4 text-sm font-medium">
                        Voltar ao resumo
                      </button>
                    </div>
                  </Panel>
                )}
              </section>
            )}

            {activeArea === 'producao-guiada' && (
              <section className="grid gap-5">
                <Panel title="Produção no ateliê">
                  <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                    <label className="grid gap-2">
                      <FieldLabel>Qual ordem você está trabalhando?</FieldLabel>
                      <select
                        value={guidedOp?.id ?? ''}
                        onChange={(event) => {
                          setGuidedOpId(event.target.value)
                          setGuidedProductionQty(1)
                          setGuidedProductionType('Produção')
                          setGuidedProductionNotes('')
                        }}
                        className="h-11 min-w-0 rounded-md border border-[#d1d5db] bg-white px-3 text-sm outline-none focus:border-[#4f46e5]"
                      >
                        {openProductionOrders.map((op) => {
                          const product = state.products.find((item) => item.id === op.productId)
                          return (
                            <option key={op.id} value={op.id}>
                              {op.id} · {productDisplayName(product, op.variationId)} · faltam {Math.max(0, op.qty - op.produced)} un
                            </option>
                          )
                        })}
                      </select>
                    </label>
                    <button
                      type="button"
                      onClick={() => setActiveArea('producao')}
                      className="inline-flex h-11 items-center justify-center rounded-md border border-[#d1d5db] bg-white px-4 text-sm font-medium"
                    >
                      Ver todas as ordens
                    </button>
                  </div>
                </Panel>

                {!openProductionOrders.length && (
                  <Panel title="Nenhuma produção aberta">
                    <EmptyLine text="As ordens aparecem aqui quando o PCP envia uma necessidade para o ateliê." />
                  </Panel>
                )}

                {guidedOp && guidedProduct && (
                  <>
                    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
                      <section className="overflow-hidden rounded-md border border-[#d1d5db] bg-white">
                        <div className="grid gap-5 p-5 sm:grid-cols-[144px_minmax(0,1fr)]">
                          <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-md border border-[#e5e7eb] bg-[#f9fafb]">
                            {guidedProductImage ? (
                              <img
                                src={guidedProductImage}
                                alt={productDisplayName(guidedProduct, guidedOp.variationId)}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Shirt className="h-10 w-10 text-[#9ca3af]" aria-hidden="true" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <StatusBadge tone={opStatusTone(guidedOp.status)}>{guidedOp.status}</StatusBadge>
                              <StatusBadge tone={priorityTone(guidedOp.priority)}>{guidedOp.priority}</StatusBadge>
                            </div>
                            <h2 className="mt-3 text-xl font-semibold text-[#111827]">
                              {productDisplayName(guidedProduct, guidedOp.variationId)}
                            </h2>
                            <p className="mt-1 text-sm text-[#6b7280]">
                              {guidedProduct.code} · {guidedOp.id}
                              {guidedOrder ? ` · Pedido ${guidedOrder.id}` : ' · Produção para estoque'}
                            </p>
                            <div className="mt-4 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
                              <MiniRow title="Tamanho" detail={guidedVariation?.size || 'Não informado'} />
                              <MiniRow title="Cor" detail={guidedVariation?.color || 'Não informada'} />
                              <MiniRow title="Responsável" detail={guidedOp.responsible || currentUserName} />
                              <MiniRow title="Prazo" detail={guidedOrder?.dueDate ? formatDate(guidedOrder.dueDate) : 'Sem prazo'} />
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 border-t border-[#e5e7eb] bg-[#f9fafb]">
                          <div className="p-4">
                            <span className="block text-xs uppercase text-[#6b7280]">Planejado</span>
                            <strong className="mt-1 block text-xl">{guidedOp.qty}</strong>
                          </div>
                          <div className="border-x border-[#e5e7eb] p-4">
                            <span className="block text-xs uppercase text-[#6b7280]">Já produzido</span>
                            <strong className="mt-1 block text-xl">{guidedOp.produced}</strong>
                          </div>
                          <div className="p-4">
                            <span className="block text-xs uppercase text-[#6b7280]">Restante</span>
                            <strong className="mt-1 block text-xl">{guidedRemainingQty}</strong>
                          </div>
                        </div>
                      </section>

                      <section className="rounded-md border border-[#d1d5db] bg-white p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span className="text-sm text-[#6b7280]">Controle da ordem</span>
                            <h3 className="mt-1 text-lg font-semibold">O que fazer agora</h3>
                          </div>
                          <span className="text-sm font-medium text-[#4f46e5]">{currentUserName}</span>
                        </div>
                        <div className="mt-5 grid gap-2 sm:grid-cols-2">
                          {guidedOp.status === 'Não iniciada' && (
                            <button
                              type="button"
                              onClick={() => updateProductionStatus(guidedOp.id, 'Em produção')}
                              className="inline-flex h-11 items-center justify-center rounded-md bg-[#111827] px-4 text-sm font-medium text-white sm:col-span-2"
                            >
                              Iniciar produção
                            </button>
                          )}
                          {guidedOp.status === 'Pausada' && (
                            <button
                              type="button"
                              onClick={() => updateProductionStatus(guidedOp.id, 'Em produção')}
                              className="inline-flex h-11 items-center justify-center rounded-md bg-[#111827] px-4 text-sm font-medium text-white sm:col-span-2"
                            >
                              Retomar produção
                            </button>
                          )}
                          {guidedOp.status === 'Em produção' && (
                            <button
                              type="button"
                              onClick={() => updateProductionStatus(guidedOp.id, 'Pausada')}
                              className="inline-flex h-11 items-center justify-center rounded-md border border-[#d1d5db] bg-white px-4 text-sm font-medium"
                            >
                              Pausar
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => concludeProductionOrder(guidedOp)}
                            disabled={guidedRemainingQty > 0}
                            className="inline-flex h-11 items-center justify-center rounded-md border border-[#d1d5db] bg-white px-4 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Concluir
                          </button>
                          <button
                            type="button"
                            onClick={() => setPreviewOpId(guidedOp.id)}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[#d1d5db] bg-white px-4 text-sm font-medium sm:col-span-2"
                          >
                            <Printer className="h-4 w-4" />
                            Ver ou imprimir OP
                          </button>
                        </div>
                        <p className="mt-4 text-xs leading-5 text-[#6b7280]">
                          A ordem só pode ser concluída quando toda a quantidade planejada estiver pronta.
                        </p>
                      </section>
                    </div>

                    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.75fr)]">
                      <section className="rounded-md border border-[#d1d5db] bg-white p-5">
                        <span className="text-sm text-[#6b7280]">Lançamento do dia</span>
                        <h3 className="mt-1 text-lg font-semibold">O que aconteceu nesta produção?</h3>
                        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                          {(['Produção', 'Perda', 'Defeito', 'Retrabalho'] as ProductionEventType[]).map((eventType) => (
                            <button
                              key={eventType}
                              type="button"
                              onClick={() => {
                                setGuidedProductionType(eventType)
                                if (eventType === 'Produção') setGuidedProductionNotes('')
                              }}
                              aria-pressed={guidedProductionType === eventType}
                              className={`h-11 rounded-md border px-3 text-sm font-medium transition ${
                                guidedProductionType === eventType
                                  ? 'border-[#111827] bg-[#111827] text-white'
                                  : 'border-[#d1d5db] bg-white text-[#374151] hover:border-[#9ca3af]'
                              }`}
                            >
                              {eventType}
                            </button>
                          ))}
                        </div>
                        <div className="mt-5 grid gap-4 sm:grid-cols-[180px_minmax(0,1fr)]">
                          <SoftNumber
                            label={guidedProductionType === 'Produção' ? `Peças prontas (máx. ${guidedRemainingQty})` : 'Quantidade afetada'}
                            value={guidedProductionQty}
                            onChange={setGuidedProductionQty}
                          />
                          <label className="grid gap-2">
                            <FieldLabel>
                              {guidedProductionType === 'Produção' ? 'Observação opcional' : 'Motivo ou observação'}
                            </FieldLabel>
                            <input
                              value={guidedProductionNotes}
                              onChange={(event) => setGuidedProductionNotes(event.target.value)}
                              placeholder={
                                guidedProductionType === 'Produção'
                                  ? 'Ex.: lote conferido'
                                  : 'Explique o que aconteceu'
                              }
                              className="h-11 min-w-0 rounded-md border border-[#d1d5db] bg-white px-3 text-sm outline-none focus:border-[#4f46e5]"
                            />
                          </label>
                        </div>
                        <div className="mt-5 rounded-md border border-[#e5e7eb] bg-[#f9fafb] p-4 text-sm leading-5 text-[#4b5563]">
                          {guidedProductionType === 'Produção' && 'Baixa os materiais e adiciona as peças prontas ao estoque.'}
                          {guidedProductionType === 'Perda' && 'Baixa os materiais utilizados, sem adicionar produto pronto.'}
                          {guidedProductionType === 'Defeito' && 'Registra o defeito e baixa os materiais, sem adicionar produto pronto.'}
                          {guidedProductionType === 'Retrabalho' && 'Registra o retrabalho no histórico, sem movimentar o estoque novamente.'}
                        </div>
                        <button
                          type="button"
                          onClick={saveGuidedProduction}
                          disabled={
                            guidedLaunchQty <= 0 ||
                            !!guidedMissingMaterials.length ||
                            (guidedProductionType !== 'Produção' && !guidedProductionNotes.trim())
                          }
                          className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-md bg-[#111827] px-4 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {guidedProductionType === 'Produção' ? 'Registrar peças prontas' : `Registrar ${guidedProductionType.toLowerCase()}`}
                        </button>
                      </section>

                      <section className="rounded-md border border-[#d1d5db] bg-white p-5">
                        <span className="text-sm text-[#6b7280]">Materiais deste lançamento</span>
                        <h3 className="mt-1 text-lg font-semibold">
                          {guidedProductionType === 'Retrabalho' ? 'Sem nova baixa' : 'Baixa prevista'}
                        </h3>
                        <div className="mt-4 grid gap-3">
                          {guidedProductionType !== 'Retrabalho' && guidedMaterialConsumption.map((material) => (
                            <div key={material.id} className="flex items-start justify-between gap-3 border-b border-[#e5e7eb] pb-3 text-sm last:border-0 last:pb-0">
                              <div>
                                <strong className="block font-medium">{material.name}</strong>
                                <span className="text-xs text-[#6b7280]">
                                  {material.qty.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} {material.unit} por peça
                                </span>
                              </div>
                              <strong className="whitespace-nowrap">
                                {material.totalQty.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} {material.unit}
                              </strong>
                            </div>
                          ))}
                          {guidedProductionType !== 'Retrabalho' && !guidedMaterialConsumption.length && (
                            <EmptyLine text="A ficha desta peça ainda não tem materiais." />
                          )}
                          {guidedProductionType === 'Retrabalho' && (
                            <p className="text-sm leading-6 text-[#4b5563]">
                              O material já foi consumido no lançamento original. O retrabalho será apenas documentado.
                            </p>
                          )}
                        </div>
                        {!!guidedMissingMaterials.length && (
                          <div className="mt-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
                            <strong className="block">Falta matéria-prima</strong>
                            {guidedMissingMaterials.map((item) => (
                              <span key={item.item} className="mt-1 block">
                                {item.missing.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} {item.unit} de {item.item}
                              </span>
                            ))}
                          </div>
                        )}
                      </section>
                    </div>

                    <div className="grid gap-5 lg:grid-cols-2">
                      <Panel title="Observações da ordem">
                        <div className="grid gap-3">
                          <p className="whitespace-pre-wrap text-sm leading-6 text-[#4b5563]">
                            {guidedOp.notes || 'Nenhuma observação cadastrada.'}
                          </p>
                          {!!guidedVariation?.technicalNotes && (
                            <div className="border-t border-[#e5e7eb] pt-3">
                              <FieldLabel>Observação técnica</FieldLabel>
                              <p className="mt-2 text-sm leading-6 text-[#4b5563]">{guidedVariation.technicalNotes}</p>
                            </div>
                          )}
                        </div>
                      </Panel>

                      <Panel title="Histórico da produção">
                        <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
                          <MiniRow title="Perdas e defeitos" detail={`${guidedDefectQty} un`} />
                          <MiniRow title="Retrabalho" detail={`${guidedReworkQty} un`} />
                        </div>
                        <div className="grid gap-2">
                          {guidedOp.launches.length ? (
                            guidedOp.launches.slice().reverse().map((launch) => (
                              <div key={launch.id} className="grid gap-1 rounded-md border border-[#e5e7eb] bg-[#f9fafb] p-3 sm:grid-cols-[110px_90px_minmax(0,1fr)]">
                                <strong className="text-sm">{launch.type}</strong>
                                <span className="text-sm">{launch.qty} un</span>
                                <span className="text-sm text-[#6b7280]">
                                  {formatDate(launch.date)} · {launch.responsible || 'Sistema'}
                                  {launch.notes ? ` · ${launch.notes}` : ''}
                                </span>
                              </div>
                            ))
                          ) : (
                            <EmptyLine text="Nenhum lançamento registrado nesta ordem." />
                          )}
                        </div>
                      </Panel>
                    </div>
                  </>
                )}
              </section>
            )}

            {activeArea === 'produto-guiado' && (
              <section className="grid gap-5 xl:grid-cols-[minmax(260px,300px)_minmax(0,1fr)]">
                <Panel title="Cadastro guiado">
                  <div className="grid gap-2">
                    <StepButton number={1} label="Qual é a peça?" active={guidedProductStep === 1} done={guidedProductStep > 1} onClick={() => setGuidedProductStep(1)} />
                    <StepButton number={2} label="Tamanho e modelo" active={guidedProductStep === 2} done={guidedProductStep > 2} onClick={() => setGuidedProductStep(2)} />
                    <StepButton number={3} label="O que ela usa?" active={guidedProductStep === 3} done={guidedProductStep > 3} onClick={() => setGuidedProductStep(3)} />
                    <StepButton number={4} label="Conferir e salvar" active={guidedProductStep === 4} done={false} onClick={() => setGuidedProductStep(4)} />
                  </div>
                  <div className="mt-5 rounded-md border border-[#e5e7eb] bg-[#f9fafb] p-4 text-sm leading-6 text-black/60">
                    O código é criado automaticamente. O custo vem dos materiais e considera a perda prevista.
                  </div>
                </Panel>

                <div className="grid gap-5">
                  {guidedProductStep === 1 && (
                    <Panel title="1. Qual peça vamos cadastrar?">
                      <div className="grid gap-4">
                        <div className="grid gap-3 md:grid-cols-2">
                          <label className="grid gap-2">
                            <FieldLabel>Marca</FieldLabel>
                            <select value={guidedProductBrand} onChange={(event) => setGuidedProductBrand(event.target.value)} className="h-11 rounded-md border border-black/10 bg-white px-3 text-sm outline-none">
                              {state.brands.map((brand) => <option key={brand.id} value={brand.name}>{brand.name}</option>)}
                            </select>
                          </label>
                          <ReadOnlyField label="Código que será criado" value={nextProductCode(state.products, guidedProductBrand)} />
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                          <SoftInput label="Nome da peça" value={guidedProductName} onChange={setGuidedProductName} />
                          <SuggestionInput
                            label="Categoria"
                            value={guidedProductCategory}
                            options={productCategorySuggestions}
                            onChange={setGuidedProductCategory}
                          />
                        </div>
                        <SoftTextarea label="Descrição simples" value={guidedProductDescription} onChange={setGuidedProductDescription} />
                        <SoftInput label="Foto ou link de referência" value={guidedProductReference} onChange={setGuidedProductReference} />
                        <button
                          type="button"
                          onClick={() => {
                            if (!guidedProductName.trim()) {
                              setMessage('Informe o nome da peça para continuar.')
                              return
                            }
                            setGuidedProductStep(2)
                          }}
                          className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#111827] px-4 text-sm font-medium text-white"
                        >
                          Próximo: tamanho e modelo
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </Panel>
                  )}

                  {guidedProductStep === 2 && (
                    <Panel title="2. Como é essa versão da peça?">
                      <div className="grid gap-4">
                        <div className="grid gap-3 md:grid-cols-3">
                          <SuggestionInput
                            label="Modelo"
                            value={guidedProductModel}
                            options={productModelSuggestions}
                            onChange={setGuidedProductModel}
                          />
                          <SuggestionInput
                            label="Tamanho"
                            value={guidedProductSize}
                            options={productSizeSuggestions}
                            onChange={setGuidedProductSize}
                          />
                          <SuggestionInput
                            label="Cor"
                            value={guidedProductColor}
                            options={productColorSuggestions}
                            onChange={setGuidedProductColor}
                          />
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                          <SuggestionInput
                            label="Tecido principal"
                            value={guidedProductFabric}
                            options={productFabricSuggestions}
                            onChange={setGuidedProductFabric}
                          />
                          <SoftInput label="Medidas" value={guidedProductMeasurements} onChange={setGuidedProductMeasurements} />
                        </div>
                        <SoftTextarea label="Observação para quem vai produzir" value={guidedProductNotes} onChange={setGuidedProductNotes} />
                        <div className="flex flex-wrap gap-2">
                          <button type="button" onClick={() => setGuidedProductStep(1)} className="inline-flex h-11 items-center justify-center rounded-md border border-black/10 bg-white px-4 text-sm font-medium">Voltar</button>
                          <button
                            type="button"
                            onClick={() => {
                              if (!guidedProductModel.trim() && !guidedProductSize.trim()) {
                                setMessage('Informe ao menos o modelo ou o tamanho para continuar.')
                                return
                              }
                              setGuidedProductStep(3)
                            }}
                            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md bg-[#111827] px-4 text-sm font-medium text-white"
                          >
                            Próximo: materiais usados
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </Panel>
                  )}

                  {guidedProductStep === 3 && (
                    <Panel title="3. O que é usado para fazer uma peça?">
                      <div className="grid gap-4">
                        <p className="text-sm leading-6 text-black/55">
                          Escolha o material, informe a quantidade para uma peça e a sobra esperada no corte ou uso.
                        </p>
                        <div className="grid gap-3">
                          {guidedProductMaterials.map((material) => (
                            <div key={material.id} className="grid gap-3 rounded-md border border-[#e5e7eb] bg-white p-4">
                              <div className="grid gap-3 lg:grid-cols-[minmax(220px,1.4fr)_140px_140px_auto] lg:items-end">
                                <label className="grid gap-2">
                                  <FieldLabel>Matéria-prima</FieldLabel>
                                  <select value={material.rawMaterialId ?? ''} onChange={(event) => selectGuidedProductMaterial(material.id, event.target.value)} className="h-11 min-w-0 rounded-md border border-black/10 bg-white px-3 text-sm outline-none">
                                    {state.rawMaterials.map((rawMaterial) => (
                                      <option key={rawMaterial.id} value={rawMaterial.id}>
                                        {rawMaterial.code || rawMaterialCode(rawMaterial)} · {rawMaterial.name}
                                      </option>
                                    ))}
                                  </select>
                                </label>
                                <SoftNumber label={`Quanto usa (${material.unit})`} value={material.qty} step="0.01" onChange={(value) => updateGuidedProductMaterial(material.id, 'qty', value)} />
                                <SoftNumber label="Perda prevista (%)" value={material.expectedLoss ?? 0} step="0.1" onChange={(value) => updateGuidedProductMaterial(material.id, 'expectedLoss', value)} />
                                <button type="button" aria-label={`Remover ${material.name}`} title="Remover material" onClick={() => setGuidedProductMaterials((current) => current.filter((item) => item.id !== material.id))} className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-rose-200 bg-white text-rose-700">
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                              <div className="grid gap-2 text-sm text-black/55 md:grid-cols-2">
                                <span>Separar: <strong className="text-[#111827]">{materialPlannedQty(material).toLocaleString('pt-BR', { maximumFractionDigits: 3 })} {material.unit}</strong></span>
                                {canSeeMoney && <span>Custo nesta peça: <strong className="text-[#111827]">{money(materialPlannedCost(material))}</strong></span>}
                              </div>
                            </div>
                          ))}
                          {!guidedProductMaterials.length && <EmptyLine text="Adicione ao menos uma matéria-prima para montar a ficha." />}
                        </div>
                        <button type="button" onClick={addGuidedProductMaterial} className="inline-flex h-10 w-fit items-center gap-2 rounded-md border border-black/10 bg-white px-4 text-sm font-medium">
                          <Plus className="h-4 w-4" />
                          Adicionar outro material
                        </button>
                        <div className="flex flex-wrap gap-2">
                          <button type="button" onClick={() => setGuidedProductStep(2)} className="inline-flex h-11 items-center justify-center rounded-md border border-black/10 bg-white px-4 text-sm font-medium">Voltar</button>
                          <button
                            type="button"
                            onClick={() => {
                              if (!guidedProductMaterials.length || guidedProductMaterials.some((material) => material.qty <= 0)) {
                                setMessage('Adicione os materiais e informe uma quantidade maior que zero.')
                                return
                              }
                              setGuidedProductStep(4)
                            }}
                            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md bg-[#111827] px-4 text-sm font-medium text-white"
                          >
                            Conferir cadastro
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </Panel>
                  )}

                  {guidedProductStep === 4 && (
                    <Panel title="4. Confira antes de salvar">
                      <div className="grid gap-5">
                        <div className="grid gap-3 md:grid-cols-2">
                          <MiniRow title="Peça" detail={`${nextProductCode(state.products, guidedProductBrand)} · ${guidedProductName || 'Nome não informado'}`} />
                          <MiniRow title="Marca e categoria" detail={`${guidedProductBrand} · ${guidedProductCategory}`} />
                          <MiniRow title="Versão" detail={[guidedProductModel, guidedProductSize, guidedProductColor].filter(Boolean).join(' · ') || 'Padrão'} />
                          <MiniRow title="Ficha" detail={`v1 · ${currentUserName} · ${userRole === 'Admin' ? guidedSheetStatus : 'Rascunho'}`} />
                          <MiniRow title="Materiais" detail={`${guidedProductMaterials.length} item(ns) · custo calculado ${canSeeMoney ? money(guidedProductCost) : 'automaticamente'}`} />
                          <MiniRow title="Situação da peça" detail={guidedProductActive ? 'Ativa para uso' : 'Desativada'} />
                          <MiniRow
                            title="Pronta para vender?"
                            detail={
                              guidedProductReadyForSale
                                ? 'Sim. Ficha aprovada, materiais conferidos e preço oficial definido.'
                                : 'Ainda não. Confira a ficha, os materiais e o preço oficial.'
                            }
                          />
                        </div>

                        {canSeeMoney && (
                          <section className="grid gap-3 rounded-md border border-[#e5e7eb] bg-[#f9fafb] p-4">
                            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                              <ReadOnlyField label="Custo da ficha" value={money(guidedProductCost)} />
                              <ReadOnlyField label="Preço mínimo" value={money(guidedMinimumPrice)} />
                              <ReadOnlyField label="Preço sugerido" value={money(guidedSuggestedPrice)} />
                              <SoftNumber label="Preço oficial" value={guidedProductPrice} onChange={setGuidedProductPrice} />
                            </div>
                            {guidedProductPrice > 0 && (
                              <div
                                className={`rounded-md border px-3 py-2.5 text-sm ${
                                  guidedProductPrice < guidedMinimumPrice
                                    ? 'border-rose-200 bg-rose-50 text-rose-800'
                                    : 'border-emerald-200 bg-emerald-50 text-emerald-800'
                                }`}
                              >
                                {guidedProductPrice < guidedMinimumPrice
                                  ? `Atenção: este preço fica abaixo do mínimo em ${money(guidedMinimumPrice - guidedProductPrice)}.`
                                  : `Margem estimada: ${guidedPriceSummary.realMargin.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}% · sobra ${money(guidedPriceSummary.realProfit)} por peça.`}
                              </div>
                            )}
                            {guidedSheetStatus === 'Aprovada' && guidedProductPrice <= 0 && (
                              <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-900">
                                Para aprovar a ficha e liberar a peça nos pedidos, defina primeiro o preço oficial.
                              </div>
                            )}
                            <div className="grid gap-3 md:grid-cols-2">
                              <label className="grid gap-2">
                                <FieldLabel>Situação da ficha</FieldLabel>
                                <select value={guidedSheetStatus} onChange={(event) => setGuidedSheetStatus(event.target.value as TechnicalSheetStatus)} className="h-11 rounded-md border border-black/10 bg-white px-3 text-sm outline-none">
                                  <option>Rascunho</option>
                                  <option>Aprovada</option>
                                  <option>Desativada</option>
                                </select>
                              </label>
                              <button type="button" onClick={() => setGuidedProductPrice(Math.round(guidedSuggestedPrice))} className="mt-auto inline-flex h-11 items-center justify-center rounded-md border border-black/10 bg-white px-4 text-sm font-medium">Usar preço sugerido</button>
                            </div>
                          </section>
                        )}

                        {!canSeeMoney && (
                          <div className="rounded-md border border-[#e5e7eb] bg-[#f9fafb] p-4 text-sm leading-6 text-black/60">
                            A peça será salva como rascunho. O administrador confere o custo, define o preço oficial e aprova a ficha.
                          </div>
                        )}

                        <button type="button" role="switch" aria-checked={guidedProductActive} onClick={() => setGuidedProductActive((value) => !value)} className="flex min-h-11 items-center justify-between rounded-md border border-black/10 bg-white px-4 text-left text-sm">
                          <span>
                            <strong className="block">Produto ativo</strong>
                            <span className="text-black/50">Pode ser usado em novos pedidos.</span>
                          </span>
                          <span className={`h-6 w-11 rounded-full p-1 ${guidedProductActive ? 'bg-[#111827]' : 'bg-[#d1d5db]'}`}>
                            <span className={`block h-4 w-4 rounded-full bg-white transition-transform ${guidedProductActive ? 'translate-x-5' : ''}`} />
                          </span>
                        </button>

                        <div className="flex flex-wrap gap-2">
                          <button type="button" onClick={() => setGuidedProductStep(3)} className="inline-flex h-11 items-center justify-center rounded-md border border-black/10 bg-white px-4 text-sm font-medium">Voltar</button>
                          <button type="button" onClick={createGuidedProduct} className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md bg-[#111827] px-4 text-sm font-medium text-white">
                            Salvar peça e ficha
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </Panel>
                  )}
                </div>
              </section>
            )}

            {activeArea === 'produtos' && selectedProduct && (
              <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,360px)]">
                <Panel title="Cadastro de produtos">
                  <div className="mb-5 grid gap-3 lg:grid-cols-4">
                    <label className="grid gap-2">
                      <FieldLabel>Selecionar</FieldLabel>
                      <select
                        value={selectedProductId}
                        onChange={(event) => setSelectedProductId(event.target.value)}
                        className="h-11 rounded-md border border-black/10 bg-white px-3 text-sm outline-none"
                      >
                        {state.products.map((product) => (
                          <option value={product.id} key={product.id}>
                            {product.code} · {product.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="grid gap-2">
                      <FieldLabel>Nova marca</FieldLabel>
                      <select
                        value={newProductBrand}
                        onChange={(event) => setNewProductBrand(event.target.value as BrandName)}
                        className="h-11 rounded-md border border-black/10 bg-white px-3 text-sm outline-none"
                      >
                        {state.brands.map((brand) => (
                          <option key={brand.id} value={brand.name}>
                            {brand.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <SoftInput label="Novo produto" value={newProductName} onChange={setNewProductName} />
                    <div className="grid gap-2">
                      <FieldLabel>Ação</FieldLabel>
                      <button
                        type="button"
                        onClick={createProduct}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#111827] px-4 text-sm font-medium text-white"
                      >
                        <Plus className="h-4 w-4" />
                        Criar
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-3 lg:grid-cols-[160px_1fr_1fr_1fr]">
                    <div className="grid gap-2">
                      <FieldLabel>Código interno</FieldLabel>
                      <div className="flex h-11 items-center rounded-md border border-black/10 bg-[#f9fafb] px-3 text-sm font-semibold">
                        {selectedProduct.code}
                      </div>
                    </div>
                    <label className="grid gap-2">
                      <FieldLabel>Marca</FieldLabel>
                      <select
                        value={selectedProduct.brand}
                        onChange={(event) =>
                          updateProduct(selectedProduct.id, (product) => ({
                            ...product,
                            brand: event.target.value as BrandName,
                          }))
                        }
                        className="h-11 rounded-md border border-black/10 bg-white px-3 text-sm outline-none"
                      >
                        {state.brands.map((brand) => (
                          <option key={brand.id} value={brand.name}>
                            {brand.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <SoftInput
                      label="Produto"
                      value={selectedProduct.name}
                      onChange={(value) =>
                        updateProduct(selectedProduct.id, (product) => ({ ...product, name: value }))
                      }
                    />
                    <SoftInput
                      label="Categoria"
                      value={selectedProduct.category}
                      onChange={(value) =>
                        updateProduct(selectedProduct.id, (product) => ({ ...product, category: value }))
                      }
                    />
                  </div>

                  <div className="mt-4">
                    <SoftTextarea
                      label="Descrição técnica da peça"
                      value={selectedProduct.description}
                      onChange={(value) =>
                        updateProduct(selectedProduct.id, (product) => ({
                          ...product,
                          description: value,
                        }))
                      }
                    />
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
                    <SoftInput
                      label="Foto ou referência principal"
                      value={selectedProduct.referenceImage ?? ''}
                      onChange={(value) =>
                        updateProduct(selectedProduct.id, (product) => ({ ...product, referenceImage: value }))
                      }
                    />
                    <button
                      type="button"
                      role="switch"
                      aria-checked={selectedProduct.active !== false}
                      onClick={() =>
                        updateProduct(selectedProduct.id, (product) => ({ ...product, active: product.active === false }))
                      }
                      className="flex min-h-11 items-center justify-between self-end rounded-md border border-black/10 bg-white px-4 text-left text-sm"
                    >
                      <span>
                        <strong className="block">Produto {selectedProduct.active === false ? 'desativado' : 'ativo'}</strong>
                        <span className="text-xs text-black/45">{selectedProduct.active === false ? 'Não aparece em novos pedidos' : 'Disponível para pedidos'}</span>
                      </span>
                      <span className={`h-6 w-11 rounded-full p-1 ${selectedProduct.active === false ? 'bg-[#d1d5db]' : 'bg-[#111827]'}`}>
                        <span className={`block h-4 w-4 rounded-full bg-white transition-transform ${selectedProduct.active === false ? '' : 'translate-x-5'}`} />
                      </span>
                    </button>
                  </div>

                  <div className="mt-5 grid gap-4 rounded-md border border-[#3730a3]/20 bg-[#f9fafb] p-4">
                    <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
                      <label className="grid flex-1 gap-2">
                        <FieldLabel>Variação da peça</FieldLabel>
                        <select
                          value={activeVariationId ?? ''}
                          onChange={(event) => setSelectedVariationId(event.target.value)}
                          className="h-11 rounded-md border border-black/10 bg-white px-3 text-sm outline-none"
                        >
                          {selectedProduct.variations.map((variation) => (
                            <option key={variation.id} value={variation.id}>
                              {variation.name} · {variation.fabric}
                            </option>
                          ))}
                        </select>
                      </label>
                      <button
                        type="button"
                        onClick={createVariation}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#111827] px-4 text-sm font-medium text-white"
                      >
                        <Plus className="h-4 w-4" />
                        Nova variação
                      </button>
                    </div>

                    <div className="grid gap-3 lg:grid-cols-5">
                      <SoftInput label="Tamanho" value={newVariationSize} onChange={setNewVariationSize} />
                      <SoftInput label="Cor" value={newVariationColor} onChange={setNewVariationColor} />
                      <SoftInput label="Tecido" value={newVariationFabric} onChange={setNewVariationFabric} />
                      <SoftInput label="Medida" value={newVariationMeasurements} onChange={setNewVariationMeasurements} />
                      <SoftInput label="Referência/foto" value={newVariationReference} onChange={setNewVariationReference} />
                    </div>
                    <SoftInput label="Observação técnica para nova variação" value={newVariationNotes} onChange={setNewVariationNotes} />
                  </div>

                  {selectedVariation && (
                    <div className="mt-5 grid gap-5">
                      <section className="grid gap-4 border-t border-black/10 pt-5">
                        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                          <div>
                            <h3 className="font-medium">Variação selecionada</h3>
                            <p className="mt-1 text-sm text-black/50">
                              Resumo visual da peça antes de editar a ficha técnica.
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <StatusBadge tone={selectedVariation.sheetStatus === 'Aprovada' ? 'green' : selectedVariation.sheetStatus === 'Desativada' ? 'rose' : 'amber'}>
                              {selectedVariation.sheetStatus ?? 'Rascunho'}
                            </StatusBadge>
                            <StatusBadge tone="blue">{selectedVariation.sheetVersion ?? 'v1'} · {selectedVariation.name}</StatusBadge>
                          </div>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                          <div className="rounded-md border border-[#e5e7eb] bg-[#ffffff] p-4">
                            <span className="text-xs text-black/45">Tamanho</span>
                            <strong className="mt-2 block text-2xl">{selectedVariation.size || '-'}</strong>
                          </div>
                          <div className="rounded-md border border-[#e5e7eb] bg-[#ffffff] p-4">
                            <span className="text-xs text-black/45">Cor</span>
                            <div className="mt-2 flex items-center gap-3">
                              <span
                                className="h-8 w-8 rounded-full border border-black/15"
                                style={{ backgroundColor: colorPreview(selectedVariation.color) }}
                              />
                              <strong className="text-lg">{selectedVariation.color || '-'}</strong>
                            </div>
                          </div>
                          <div className="rounded-md border border-[#e5e7eb] bg-[#ffffff] p-4">
                            <span className="text-xs text-black/45">Tecido</span>
                            <strong className="mt-2 block text-lg">{selectedVariation.fabric || '-'}</strong>
                          </div>
                          <div className="rounded-md border border-[#e5e7eb] bg-[#ffffff] p-4">
                            <span className="text-xs text-black/45">Ficha da variação</span>
                            <strong className="mt-2 block text-lg">{canSeeMoney ? money(selectedCost) : `${selectedVariationMaterials.length} material(is)`}</strong>
                            <span className="mt-1 block text-xs text-black/45">
                              {selectedVariation.sheetVersion ?? 'v1'} · {selectedVariation.sheetResponsible ?? 'Sistema'}
                            </span>
                          </div>
                        </div>

                        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
                          <div className="rounded-md border border-[#e5e7eb] bg-[#ffffff] p-4">
                            <FieldLabel>Medidas e observação técnica</FieldLabel>
                            <p className="mt-3 text-sm leading-6 text-black/62">
                              {selectedVariation.measurements || 'Sem medidas cadastradas.'}
                            </p>
                            <p className="mt-2 text-sm leading-6 text-black/52">
                              {selectedVariation.technicalNotes || 'Sem observação técnica.'}
                            </p>
                          </div>
                          <div className="overflow-hidden rounded-md border border-[#e5e7eb] bg-[#ffffff]">
                            {selectedVariation.referenceImage ? (
                              <img
                                src={selectedVariation.referenceImage}
                                alt={`Referência ${selectedProduct.name} ${selectedVariation.name}`}
                                className="h-56 w-full object-cover"
                              />
                            ) : (
                              <div className="grid h-56 place-items-center bg-[#f3f4f6] px-6 text-center text-sm text-black/45">
                                Adicione uma foto ou link de referência para facilitar a conferência visual.
                              </div>
                            )}
                          </div>
                        </div>
                      </section>

                      <section className="grid gap-4 rounded-md border border-[#e5e7eb] bg-[#ffffff] p-4">
                        <div>
                          <h3 className="font-medium">Editar dados da variação</h3>
                          <p className="mt-1 text-sm text-black/50">
                            Essas informações aparecem no pedido, na produção e nos documentos.
                          </p>
                        </div>
                        <div className="grid gap-3 md:grid-cols-4">
                          <SoftInput label="Modelo" value={selectedVariation.model ?? ''} onChange={(value) => updateVariationField(selectedVariation.id, 'model', value)} />
                          <SoftInput
                            label="Tamanho"
                            value={selectedVariation.size}
                            onChange={(value) => updateVariationField(selectedVariation.id, 'size', value)}
                          />
                          <SoftInput
                            label="Cor"
                            value={selectedVariation.color}
                            onChange={(value) => updateVariationField(selectedVariation.id, 'color', value)}
                          />
                          <SoftInput
                            label="Tecido"
                            value={selectedVariation.fabric}
                            onChange={(value) => updateVariationField(selectedVariation.id, 'fabric', value)}
                          />
                        </div>
                        <div className="grid gap-3 lg:grid-cols-[1fr_1fr]">
                          <SoftInput
                            label="Medidas"
                            value={selectedVariation.measurements}
                            onChange={(value) => updateVariationField(selectedVariation.id, 'measurements', value)}
                          />
                          <SoftInput
                            label="Foto ou referência"
                            value={selectedVariation.referenceImage}
                            onChange={(value) => updateVariationField(selectedVariation.id, 'referenceImage', value)}
                          />
                        </div>
                        <SoftTextarea
                          label="Observação técnica"
                          value={selectedVariation.technicalNotes}
                          onChange={(value) => updateVariationField(selectedVariation.id, 'technicalNotes', value)}
                        />
                        <div className="grid gap-3 rounded-md border border-[#e5e7eb] bg-[#f9fafb] p-4 md:grid-cols-3">
                          <SoftInput label="Versão da ficha" value={selectedVariation.sheetVersion ?? 'v1'} onChange={(value) => updateVariationField(selectedVariation.id, 'sheetVersion', value)} />
                          <SoftInput label="Responsável" value={selectedVariation.sheetResponsible ?? currentUserName} onChange={(value) => updateVariationField(selectedVariation.id, 'sheetResponsible', value)} />
                          <label className="grid gap-2">
                            <FieldLabel>Situação da ficha</FieldLabel>
                            <select value={selectedVariation.sheetStatus ?? 'Rascunho'} disabled={userRole !== 'Admin'} onChange={(event) => updateVariation(selectedVariation.id, (variation) => ({ ...variation, sheetStatus: event.target.value as TechnicalSheetStatus }))} className="h-11 rounded-md border border-black/10 bg-white px-3 text-sm outline-none disabled:bg-[#f3f4f6]">
                              <option>Rascunho</option>
                              <option>Aprovada</option>
                              <option>Desativada</option>
                            </select>
                          </label>
                        </div>
                      </section>

                      <section className="grid gap-4 border-t border-black/10 pt-5">
                        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
                          <div>
                            <h3 className="font-medium">Matéria-prima desta variação</h3>
                            <p className="mt-1 text-sm text-black/50">
                              Use materiais específicos quando tamanho, tecido ou cor mudarem o consumo.
                            </p>
                          </div>
                          {canSeeMoney && <div className="grid grid-cols-3 gap-2 md:min-w-[360px]">
                            <MiniStat label="Custo da ficha" value={money(selectedCost)} />
                            <MiniStat label="Preço sugerido" value={money(selectedPrice)} tone="green" />
                            <MiniStat label="Preço definido" value={selectedSalePrice ? money(selectedSalePrice) : 'Não definido'} tone={selectedSalePrice ? 'blue' : 'amber'} />
                          </div>}
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                          {selectedVariation.materials.map((material) => (
                            <div
                              key={material.id}
                              className="rounded-md border border-[#e5e7eb] bg-[#ffffff] p-4"
                            >
                              <div className="mb-3 flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <FieldLabel>Matéria-prima</FieldLabel>
                                  <strong className="mt-1 block leading-5">{material.name}</strong>
                                  <span className="mt-1 block text-xs text-black/45">
                                    {material.qty.toLocaleString('pt-BR', { maximumFractionDigits: 3 })} {material.unit} por peça
                                  </span>
                                </div>
                                {canSeeMoney && <StatusBadge>{money(materialPlannedCost(material))}</StatusBadge>}
                              </div>
                              <div className="grid gap-3">
                                <label className="grid gap-2">
                                  <FieldLabel>Escolher material cadastrado</FieldLabel>
                                  <select
                                    value={material.rawMaterialId ?? ''}
                                    onChange={(event) =>
                                      selectVariationMaterial(selectedVariation.id, material.id, event.target.value)
                                    }
                                    className="h-11 rounded-md border border-black/10 bg-white px-3 text-sm outline-none focus:border-[#3730a3]"
                                  >
                                    <option value="" disabled>
                                      Escolha uma matéria-prima
                                    </option>
                                    {state.rawMaterials.map((rawMaterial) => (
                                      <option key={rawMaterial.id} value={rawMaterial.id}>
                                        {rawMaterial.name}
                                      </option>
                                    ))}
                                  </select>
                                </label>
                                <div className="grid grid-cols-[1fr_110px_92px] gap-3">
                                  <SoftNumber
                                    label="Qtd. por peça"
                                    value={material.qty}
                                    step="0.1"
                                    onChange={(value) =>
                                      updateVariationMaterial(selectedVariation.id, material.id, 'qty', value)
                                    }
                                  />
                                  <SoftNumber label="Perda (%)" value={material.expectedLoss ?? 0} step="0.1" onChange={(value) => updateVariationMaterial(selectedVariation.id, material.id, 'expectedLoss', value)} />
                                  <ReadOnlyField label="Un." value={material.unit} />
                                </div>
                                <div className="grid gap-3 md:grid-cols-2">
                                  {canSeeMoney && <ReadOnlyField label="Custo médio" value={money(material.unitCost)} />}
                                  <ReadOnlyField label="Separar por peça" value={`${materialPlannedQty(material).toLocaleString('pt-BR', { maximumFractionDigits: 3 })} ${material.unit}`} />
                                </div>
                              </div>
                            </div>
                          ))}
                          {!selectedVariation.materials.length && (
                            <EmptyLine text="Essa variação ainda não tem matéria-prima cadastrada." />
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => addVariationMaterial(selectedVariation.id)}
                          className="inline-flex h-10 w-fit items-center gap-2 rounded-md border border-black/10 bg-white px-4 text-sm font-medium"
                        >
                          <Plus className="h-4 w-4" />
                          Adicionar material na variação
                        </button>
                      </section>

                      <section className="grid gap-4 border-t border-black/10 pt-4">
                        <div>
                          <h3 className="font-medium">Ficha base do produto</h3>
                          <p className="mt-1 text-sm text-black/50">Use como modelo rápido para novas variações.</p>
                        </div>
                        <div className="grid gap-3">
                          {selectedProduct.materials.map((material) => (
                            <div
                              key={material.id}
                              className="grid gap-3 rounded-md border border-black/10 bg-[#f9fafb] p-3 lg:grid-cols-[1.4fr_110px_110px_90px_130px]"
                            >
                              <label className="grid gap-2">
                                <FieldLabel>Matéria-prima</FieldLabel>
                                <select
                                  value={material.rawMaterialId ?? ''}
                                  onChange={(event) => selectProductMaterial(material.id, event.target.value)}
                                  className="h-11 rounded-md border border-black/10 bg-white px-3 text-sm outline-none focus:border-[#3730a3]"
                                >
                                  <option value="" disabled>
                                    Escolha uma matéria-prima
                                  </option>
                                  {state.rawMaterials.map((rawMaterial) => (
                                    <option key={rawMaterial.id} value={rawMaterial.id}>
                                      {rawMaterial.name}
                                    </option>
                                  ))}
                                </select>
                              </label>
                              <SoftNumber
                                label="Qtd. por peça"
                                value={material.qty}
                                step="0.1"
                                onChange={(value) => updateMaterial(material.id, 'qty', value)}
                              />
                              <SoftNumber label="Perda (%)" value={material.expectedLoss ?? 0} step="0.1" onChange={(value) => updateMaterial(material.id, 'expectedLoss', value)} />
                              <ReadOnlyField label="Un." value={material.unit} />
                              {canSeeMoney && <ReadOnlyField label="Custo médio" value={money(material.unitCost)} />}
                            </div>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={addMaterial}
                          className="mt-4 inline-flex h-10 items-center gap-2 rounded-md border border-black/10 bg-white px-4 text-sm font-medium"
                        >
                          <Plus className="h-4 w-4" />
                          Adicionar material base
                        </button>
                      </section>
                    </div>
                  )}
                </Panel>

                {canSeeMoney ? <PricePanel
                  cost={selectedCost}
                  price={selectedPrice}
                  tax={state.tax}
                  commission={state.commission}
                  fixedCost={state.fixedCost}
                  profit={state.profit}
                  onChange={(field, value) => {
                    setState((current) => ({ ...current, [field]: value }))
                    setMessage('Preço recalculado.')
                  }}
                /> : (
                  <Panel title="Conferência administrativa">
                    <p className="text-sm leading-6 text-black/60">
                      Custos, margem e preço oficial ficam visíveis somente para os perfis autorizados.
                    </p>
                  </Panel>
                )}
              </section>
            )}

            {activeArea === 'precos' && (
              <section className="grid gap-5">
                <Panel title="Como o preço funciona">
                  <div className="grid gap-3 md:grid-cols-3">
                    <ProcessStep title="1. Custo da ficha" detail="Vem da matéria-prima cadastrada na peça ou variação." />
                    <ProcessStep title="2. Preço sugerido" detail="Calculado com imposto, comissão, custo fixo e lucro desejado." />
                    <ProcessStep title="3. Preço definido" detail="É o valor oficial usado em orçamento e pedido." />
                  </div>
                </Panel>

                <div className="grid gap-4">
                  {state.products.map((product) => {
                    const baseCost = productCost(product)
                    const baseMinimumPrice = idealPrice(baseCost, state.tax, state.commission, state.fixedCost, 0)
                    const baseSuggestedPrice = idealPrice(baseCost, state.tax, state.commission, state.fixedCost, state.profit)
                    const baseSalePrice = productSalePrice(product)
                    const basePricing = priceBreakdown(
                      baseCost,
                      baseSalePrice ?? 0,
                      state.tax,
                      state.commission,
                      state.fixedCost,
                      state.profit,
                      baseSalePrice ?? 0,
                    )

                    return (
                      <Panel key={product.id} title={`${product.code} · ${product.name}`}>
                        <div className="grid gap-4">
                          <div className="grid gap-3 rounded-md border border-[#e5e7eb] bg-[#ffffff] p-4 lg:grid-cols-[1fr_120px_120px_130px_150px_auto] lg:items-end">
                            <div>
                              <FieldLabel>Preço padrão do produto</FieldLabel>
                              <p className="mt-1 text-sm leading-5 text-black/56">
                                Use quando todas as variações tiverem o mesmo preço de venda.
                              </p>
                              <p className="mt-2 text-xs text-black/40">{product.brand} · {product.category}</p>
                            </div>
                            <ReadOnlyField label="Custo" value={money(baseCost)} />
                            <ReadOnlyField label="Mínimo" value={money(baseMinimumPrice)} />
                            <ReadOnlyField label="Sugerido" value={money(baseSuggestedPrice)} />
                            <SoftNumber
                              label="Preço oficial"
                              value={baseSalePrice ?? 0}
                              onChange={(value) => updateProductSalePrice(product.id, undefined, value)}
                            />
                            <button
                              type="button"
                              onClick={() => updateProductSalePrice(product.id, undefined, baseSuggestedPrice)}
                              className="inline-flex h-11 items-center justify-center rounded-md border border-[#d1d5db] bg-white px-3 text-sm font-medium"
                            >
                              Usar sugerido
                            </button>
                          </div>
                          {baseSalePrice ? (
                            <div className="grid gap-3 sm:grid-cols-3">
                              <MiniStat label="Sobra por peça" value={money(basePricing.realProfit)} tone={basePricing.realProfit >= 0 ? 'green' : 'rose'} />
                              <MiniStat label="Margem oficial" value={`${basePricing.realMargin.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`} tone={basePricing.realMargin >= 0 ? 'green' : 'rose'} />
                              <MiniStat label="Situação" value={priceNeedsApproval(baseSalePrice, baseMinimumPrice) ? 'Abaixo do mínimo' : 'Preço saudável'} tone={priceNeedsApproval(baseSalePrice, baseMinimumPrice) ? 'rose' : 'green'} />
                            </div>
                          ) : null}

                          <div className="grid gap-3">
                            {product.variations.map((variation) => {
                              const cost = productCost(product, variation.id)
                              const minimum = idealPrice(cost, state.tax, state.commission, state.fixedCost, 0)
                              const suggested = idealPrice(cost, state.tax, state.commission, state.fixedCost, state.profit)
                              const salePrice = productSalePrice(product, variation.id)
                              const pricing = priceBreakdown(
                                cost,
                                salePrice ?? 0,
                                state.tax,
                                state.commission,
                                state.fixedCost,
                                state.profit,
                                salePrice ?? 0,
                              )

                              return (
                                <div
                                  key={variation.id}
                                  className="grid gap-3 rounded-md border border-[#e5e7eb] bg-white p-4 lg:grid-cols-[1.3fr_110px_110px_120px_150px_135px_auto] lg:items-end"
                                >
                                  <div>
                                    <FieldLabel>Variação</FieldLabel>
                                    <strong className="mt-1 block text-sm">{variation.name}</strong>
                                    <span className="mt-1 block text-xs leading-5 text-black/45">
                                      {variation.fabric || 'Tecido não informado'} · {variation.measurements || 'Medida não informada'}
                                    </span>
                                  </div>
                                  <ReadOnlyField label="Custo" value={money(cost)} />
                                  <ReadOnlyField label="Mínimo" value={money(minimum)} />
                                  <ReadOnlyField label="Sugerido" value={money(suggested)} />
                                  <SoftNumber
                                    label="Preço oficial"
                                    value={salePrice ?? 0}
                                    onChange={(value) => updateProductSalePrice(product.id, variation.id, value)}
                                  />
                                  <MiniStat
                                    label="Margem real"
                                    value={salePrice ? `${money(pricing.realProfit)} · ${pricing.realMargin.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%` : 'Sem preço'}
                                    tone={salePrice && pricing.realProfit >= 0 ? 'green' : 'rose'}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => updateProductSalePrice(product.id, variation.id, suggested)}
                                    className="inline-flex h-11 items-center justify-center rounded-md border border-[#d1d5db] bg-[#ffffff] px-3 text-sm font-medium"
                                  >
                                    Usar sugerido
                                  </button>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </Panel>
                    )
                  })}
                </div>
              </section>
            )}

            {activeArea === 'materias' && (
              <section className="grid gap-5 xl:grid-cols-[minmax(420px,520px)_minmax(0,1fr)]">
                <div id="cadastro-materia-prima" className="order-2 xl:order-1">
                  <Panel title="Cadastrar matéria-prima">
                    <div className="grid gap-5">
                    <section className="grid gap-4">
                      <div>
                        <h3 className="text-sm font-semibold text-[#111827]">Identificação</h3>
                        <p className="mt-1 text-sm text-black/50">Nome, fornecedor e alerta mínimo para não faltar no ateliê.</p>
                      </div>
                      <div className="grid gap-3 md:grid-cols-[160px_minmax(0,1fr)]">
                        <SoftInput label="Código interno" value={newMaterialCode} onChange={setNewMaterialCode} />
                        <SoftInput label="Nome da matéria-prima" value={newMaterialName} onChange={setNewMaterialName} />
                      </div>
                      <SoftInput label="Locação no estoque" value={newMaterialStockLocation} onChange={setNewMaterialStockLocation} />
                      <label className="grid min-w-0 gap-2">
                        <FieldLabel>Categoria</FieldLabel>
                        <select
                          value={newMaterialCategory}
                          onChange={(event) => setNewMaterialCategory(event.target.value)}
                          className="h-11 min-w-0 rounded-md border border-black/10 bg-white px-3 text-sm outline-none"
                        >
                          <option>Matéria-prima</option>
                          <option>Insumo</option>
                          <option>Embalagem</option>
                          <option>Aviamento</option>
                          <option>Outro</option>
                        </select>
                      </label>
                      <label className="grid min-w-0 gap-2">
                        <FieldLabel>Fornecedor padrão</FieldLabel>
                        <select
                          value={newMaterialSupplier}
                          onChange={(event) => setNewMaterialSupplier(event.target.value)}
                          className="h-11 min-w-0 rounded-md border border-black/10 bg-white px-3 text-sm outline-none"
                        >
                          {state.suppliers.map((supplier) => (
                            <option key={supplier.id} value={supplier.name}>
                              {supplier.name}
                            </option>
                          ))}
                        </select>
                      </label>
                      <SoftNumber
                        label={`Estoque mínimo (${newMaterialUnit || 'un'})`}
                        value={newMaterialMinimum}
                        step="0.01"
                        onChange={setNewMaterialMinimum}
                      />
                      <SoftNumber label="Perda prevista no uso (%)" value={newMaterialExpectedLoss} step="0.1" onChange={setNewMaterialExpectedLoss} />
                    </section>

                    <section className="grid gap-4 rounded-md border border-[#e5e7eb] bg-[#ffffff] p-4">
                      <div>
                        <h3 className="text-sm font-semibold text-[#111827]">Unidades e conversão</h3>
                        <p className="mt-1 text-sm text-black/50">
                          Ex.: compra em kg, mas usa em metro na ficha técnica.
                        </p>
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        <UnitInput
                          label="Unidade de compra"
                          value={newMaterialPurchaseUnit}
                          onChange={setNewMaterialPurchaseUnit}
                        />
                        <UnitInput
                          label="Unidade de uso"
                          value={newMaterialUnit}
                          onChange={setNewMaterialUnit}
                        />
                      </div>
                      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                        <SoftNumber
                          label={`1 ${newMaterialPurchaseUnit || 'un'} rende em ${newMaterialUnit || 'un'}`}
                          value={newMaterialPurchaseFactor}
                          step="0.01"
                          onChange={setNewMaterialPurchaseFactor}
                        />
                        <SoftNumber
                          label={`Custo por ${newMaterialPurchaseUnit || 'un'} comprado`}
                          value={newMaterialCost}
                          onChange={setNewMaterialCost}
                        />
                      </div>
                      <div className="rounded-md border border-black/10 bg-[#f9fafb] p-3 text-sm text-black/65">
                        <strong className="block text-[#111827]">Como o sistema vai entender</strong>
                        <span className="mt-1 block">
                          1 {newMaterialPurchaseUnit || 'un'} = {newMaterialFactor.toLocaleString('pt-BR', { maximumFractionDigits: 3 })}{' '}
                          {newMaterialUnit || 'un'}
                        </span>
                        <span className="mt-1 block">
                          Custo médio: {money(newMaterialStockCost)} por {newMaterialUnit || 'un'}
                        </span>
                      </div>
                    </section>

                    <section className="grid gap-4 rounded-md border border-dashed border-[#d9c8be] bg-[#f9fafb] p-4">
                      <div>
                        <h3 className="text-sm font-semibold text-[#111827]">Simulação de uso</h3>
                        <p className="mt-1 text-sm text-black/50">Confira antes de cadastrar.</p>
                      </div>
                      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                        <SoftNumber
                          label={`Usar na peça (${newMaterialUnit || 'un'})`}
                          value={newMaterialSimulationQty}
                          step="0.01"
                          onChange={setNewMaterialSimulationQty}
                        />
                        <div className="flex min-h-11 min-w-0 flex-col justify-center rounded-md border border-[#e5e7eb] bg-white px-3 text-sm">
                          <span className="text-xs text-black/45">Custo estimado na ficha</span>
                          <strong className="text-[#111827]">{money(newMaterialSimulationCost)}</strong>
                        </div>
                      </div>
                    </section>

                    <button
                      type="button"
                      onClick={createRawMaterial}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#111827] px-4 text-sm font-medium text-white"
                    >
                      <Plus className="h-4 w-4" />
                      Cadastrar
                    </button>
                    </div>
                  </Panel>
                </div>

                <div className="order-1 xl:order-2">
                  <Panel title="Matérias-primas cadastradas">
                    <a
                      href="#cadastro-materia-prima"
                      className="mb-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-[#111827] px-4 text-sm font-medium text-white xl:hidden"
                    >
                      <Plus className="h-4 w-4" />
                      Cadastrar nova matéria-prima
                    </a>
                    <div className="mb-4 rounded-md border border-[#e5e7eb] bg-[#f9fafb] p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <strong className="block text-sm text-[#111827]">Revisão dos cadastros</strong>
                        <span className="mt-1 block text-sm leading-5 text-[#6b7280]">
                          O sistema apenas sinaliza possíveis inconsistências. Nenhum material é alterado automaticamente.
                        </span>
                      </div>
                      <StatusBadge tone={materialRegistrationIssues.length ? 'amber' : 'green'}>
                        {materialRegistrationIssues.length
                          ? `${materialRegistrationIssues.length} para revisar`
                          : 'Tudo conferido'}
                      </StatusBadge>
                    </div>
                    {materialRegistrationIssues.length > 0 && (
                      <div className="mt-4 grid gap-2">
                        {materialRegistrationIssues.map((issue) => (
                          <div key={issue.key} className="rounded-md border border-amber-200 bg-white px-3 py-2.5">
                            <strong className="block text-sm text-[#111827]">{issue.item}</strong>
                            <span className="mt-1 block text-xs leading-5 text-amber-800">
                              {issue.reasons.join(' · ')}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    </div>
                    <div className="grid gap-3">
                      {state.rawMaterials.map((material) => {
                        const currentStock = stock.rawItems.find((item) => item.item === material.name)?.qty ?? 0
                        const isLow = isBelowMinimumStock(currentStock, material.minimumStock)

                        return (
                          <RecordRow
                            key={material.id}
                            badge={isLow ? 'Baixo' : material.category ?? material.unit}
                            title={material.name}
                            detail={`Código: ${rawMaterialCode(material)}${material.stockLocation ? ` · Locação: ${material.stockLocation}` : ''} · Fornecedor: ${material.supplier} · Atual: ${currentStock.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} ${unitLabel(material.unit)} · Compra: 1 ${unitLabel(material.purchaseUnit)} = ${material.purchaseToStockFactor.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} ${unitLabel(material.unit)} · Perda padrão: ${(material.expectedLoss ?? 0).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%${material.lastPurchase ? ` · Última compra: ${formatDate(material.lastPurchase)}` : ''}`}
                            value={`Mín.: ${material.minimumStock.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} ${material.unit} · ${money(material.avgCost)}/${material.unit}`}
                          />
                        )
                      })}
                    </div>
                  </Panel>
                </div>
              </section>
            )}

            {activeArea === 'fornecedores' && (
              <section className="grid gap-5 xl:grid-cols-[minmax(320px,360px)_minmax(0,1fr)]">
                <Panel title="Cadastrar fornecedor">
                  <div className="grid gap-4">
                    <SoftInput label="Nome" value={newSupplierName} onChange={setNewSupplierName} />
                    <SoftInput label="Contato" value={newSupplierContact} onChange={setNewSupplierContact} />
                    <button
                      type="button"
                      onClick={createSupplier}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#111827] px-4 text-sm font-medium text-white"
                    >
                      <Plus className="h-4 w-4" />
                      Cadastrar
                    </button>
                  </div>
                </Panel>

                <Panel title="Fornecedores cadastrados">
                  <div className="grid gap-3">
                    {state.suppliers.map((supplier) => (
                      <RecordRow
                        key={supplier.id}
                        badge="Fornecedor"
                        title={supplier.name}
                        detail={supplier.notes}
                        value={supplier.contact}
                      />
                    ))}
                  </div>
                </Panel>
              </section>
            )}

            {activeArea === 'clientes' && (
              <section className="grid gap-5 xl:grid-cols-[minmax(320px,360px)_minmax(0,1fr)]">
                <Panel title="Cadastrar cliente">
                  <div className="grid gap-4">
                    <SoftInput label="Nome" value={newCustomerName} onChange={setNewCustomerName} />
                    <SoftInput label="Telefone" value={newCustomerPhone} onChange={setNewCustomerPhone} />
                    <SoftInput label="Cidade" value={newCustomerCity} onChange={setNewCustomerCity} />
                    <SoftTextarea label="Observações" value={newCustomerNotes} onChange={setNewCustomerNotes} />
                    <button
                      type="button"
                      onClick={createCustomer}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#111827] px-4 text-sm font-medium text-white"
                    >
                      <Plus className="h-4 w-4" />
                      Cadastrar
                    </button>
                  </div>
                </Panel>

                <Panel title="Clientes cadastrados">
                  <div className="grid gap-3">
                    {state.customers.map((customer) => {
                      const customerOrders = state.orders.filter(
                        (order) => order.customerId === customer.id || order.client === customer.name,
                      )

                      return (
                        <div key={customer.id} className="rounded-md border border-black/10 bg-[#f9fafb] p-4">
                          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                            <div>
                              <StatusBadge>Cliente</StatusBadge>
                              <h3 className="mt-3 font-medium">{customer.name}</h3>
                              <p className="mt-1 text-sm text-black/55">
                                {customer.phone} · {customer.city}
                              </p>
                              <p className="mt-1 text-sm text-black/50">{customer.notes}</p>
                            </div>
                            <strong className="text-sm">{customerOrders.length} pedido(s)</strong>
                          </div>
                          <div className="mt-4 grid gap-2">
                            {customerOrders.slice(0, 4).map((order) => {
                              const product = state.products.find((item) => item.id === order.productId)
                              return (
                                <MiniRow
                                  key={order.id}
                                  title={`${order.id} · ${order.status}`}
                                  detail={`${productDisplayName(product, order.variationId)} · ${order.qty} un · ${formatDate(order.orderDate)}`}
                                />
                              )
                            })}
                            {!customerOrders.length && <EmptyLine text="Sem pedidos cadastrados." />}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </Panel>
              </section>
            )}

            {activeArea === 'marcas' && (
              <section className="grid gap-5 xl:grid-cols-[minmax(320px,360px)_minmax(0,1fr)]">
                <Panel title="Cadastrar marca">
                  <div className="grid gap-4">
                    <SoftInput label="Nome da marca" value={newBrandName} onChange={setNewBrandName} />
                    <SoftInput label="Prefixo do código" value={newBrandPrefix} onChange={setNewBrandPrefix} />
                    <button
                      type="button"
                      onClick={createBrand}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#111827] px-4 text-sm font-medium text-white"
                    >
                      <Plus className="h-4 w-4" />
                      Cadastrar
                    </button>
                  </div>
                </Panel>

                <Panel title="Marcas cadastradas">
                  <div className="grid gap-3">
                    {state.brands.map((brand) => (
                      <RecordRow
                        key={brand.id}
                        badge={brand.prefix}
                        title={brand.name}
                        detail={brand.notes}
                        value={`${brand.prefix}-0000001`}
                      />
                    ))}
                  </div>
                </Panel>
              </section>
            )}

            {activeArea === 'usuarios' && (
              <section className="grid gap-5 xl:grid-cols-[minmax(320px,360px)_minmax(0,1fr)]">
                <Panel title="Cadastrar usuário">
                  <div className="grid gap-4">
                    <SoftInput label="Nome de acesso" value={newUserName} onChange={setNewUserName} />
                    <label className="grid gap-2">
                      <FieldLabel>Senha</FieldLabel>
                      <input
                        type="password"
                        minLength={normalizedStoreEnabled ? 8 : undefined}
                        autoComplete="new-password"
                        placeholder={normalizedStoreEnabled ? 'Senha temporária com 8 ou mais caracteres' : undefined}
                        value={newUserPassword}
                        onChange={(event) => setNewUserPassword(event.target.value)}
                        className="h-11 rounded-md border border-black/10 bg-white px-3 text-sm outline-none focus:border-[#3730a3]"
                      />
                      {normalizedStoreEnabled && (
                        <span className="text-xs leading-5 text-black/48">
                          A pessoa deverá criar uma nova senha no primeiro acesso.
                        </span>
                      )}
                    </label>
                    <label className="grid gap-2">
                      <FieldLabel>Perfil</FieldLabel>
                      <select
                        value={newUserRole}
                        onChange={(event) => setNewUserRole(event.target.value as UserRole)}
                        className="h-11 rounded-md border border-black/10 bg-white px-3 text-sm outline-none"
                      >
                        {roleOptions.map((role) => (
                          <option key={role}>{role}</option>
                        ))}
                      </select>
                    </label>
                    <div className="rounded-md border border-[#e5e7eb] bg-[#ffffff] p-3 text-sm leading-5 text-black/60">
                      {roleDescriptions[newUserRole]}
                    </div>
                    <button
                      type="button"
                      onClick={() => void createUser()}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#111827] px-4 text-sm font-medium text-white"
                    >
                      <Plus className="h-4 w-4" />
                      Cadastrar usuário
                    </button>
                  </div>
                </Panel>

                <Panel title="Usuários cadastrados">
                  <div className="grid gap-3">
                    {state.users.map((user) => (
                      <RecordRow
                        key={user.id}
                        badge={user.role}
                        title={user.name}
                        detail={user.id === loggedUserId ? `Usuário acessando agora · ${roleDescriptions[user.role]}` : roleDescriptions[user.role]}
                        value={normalizedStoreEnabled ? 'Senha protegida' : user.password ? 'Senha definida' : 'Sem senha'}
                      />
                    ))}
                  </div>
                </Panel>
              </section>
            )}

            {activeArea === 'notas' && (
              <section className="grid gap-5">
                <MobileViewSelect
                  label="Área de compras"
                  value={purchaseView}
                  options={[
                    ['necessidades', 'O que comprar'],
                    ['pedidos', 'Pedidos de compra'],
                    ['recebimentos', 'Recebimentos'],
                  ]}
                  onChange={(value) => setPurchaseView(value as typeof purchaseView)}
                />
                <div className="hidden max-w-full gap-2 rounded-md border border-[#e5e7eb] bg-[#f3f4f6] p-1 sm:flex">
                  {([
                    ['necessidades', 'O que comprar'],
                    ['pedidos', 'Pedidos de compra'],
                    ['recebimentos', 'Recebimentos'],
                  ] as const).map(([view, label]) => (
                    <button
                      key={view}
                      type="button"
                      onClick={() => setPurchaseView(view)}
                      aria-pressed={purchaseView === view}
                      className={`h-10 min-w-max rounded-md px-4 text-sm font-medium ${
                        purchaseView === view
                          ? 'bg-[#111827] text-white'
                          : 'bg-transparent text-[#4b5563] hover:bg-white'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {purchaseView === 'necessidades' && (
                  <>
                    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-[#e5e7eb] bg-[#e5e7eb] lg:grid-cols-4">
                      <StockSummary label="Materiais para comprar" value={purchaseSuggestions.filter((item) => item.suggestedStockQty > 0).length.toString()} />
                      <StockSummary label="Pedidos a receber" value={openPurchaseOrders.length.toString()} />
                      <StockSummary label="Com necessidade de OP" value={purchaseSuggestions.filter((item) => item.requiredForOps > 0).length.toString()} />
                      <StockSummary label="Com pedidos futuros" value={purchaseSuggestions.filter((item) => item.requiredForFutureOrders > 0).length.toString()} />
                    </div>
                    <Panel title="Necessidades de compra">
                      <div className="grid gap-3">
                        {purchaseSuggestions.length ? (
                          purchaseSuggestions.map((suggestion) => (
                            <div
                              key={suggestion.material.id}
                              className="grid gap-4 rounded-md border border-[#e5e7eb] bg-white p-4 xl:grid-cols-[minmax(220px,1fr)_repeat(5,minmax(90px,120px))_auto] xl:items-center"
                            >
                              <div>
                                <StatusBadge tone={suggestion.suggestedStockQty > 0 ? 'amber' : 'green'}>
                                  {suggestion.suggestedStockQty > 0 ? 'Comprar' : 'Coberto'}
                                </StatusBadge>
                                <strong className="mt-2 block">{suggestion.item}</strong>
                                <span className="mt-1 block text-xs text-[#6b7280]">
                                  {suggestion.material.supplier} · Precisamos até {suggestion.needBy ? formatDate(suggestion.needBy) : 'sem prazo definido'}
                                </span>
                              </div>
                              <StockCountValue label="Físico" value={`${suggestion.physical.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} ${suggestion.unit}`} />
                              <StockCountValue label="Para OPs" value={`${suggestion.requiredForOps.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} ${suggestion.unit}`} />
                              <StockCountValue label="Pedidos futuros" value={`${suggestion.requiredForFutureOrders.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} ${suggestion.unit}`} />
                              <StockCountValue label="Mínimo" value={`${suggestion.minimumStock.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} ${suggestion.unit}`} />
                              <StockCountValue label="Já encomendado" value={`${suggestion.onOrder.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} ${suggestion.unit}`} />
                              {suggestion.suggestedStockQty > 0 ? (
                                <button
                                  type="button"
                                  onClick={() => preparePurchaseFromSuggestion(suggestion)}
                                  disabled={!canManagePurchases}
                                  className="inline-flex h-10 min-w-max items-center justify-center rounded-md bg-[#111827] px-4 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                  Pedir {suggestion.suggestedPurchaseQty.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} {suggestion.purchaseUnit}
                                </button>
                              ) : (
                                <span className="text-sm font-medium text-emerald-700">Sem nova compra</span>
                              )}
                            </div>
                          ))
                        ) : (
                          <EmptyLine text="Estoque físico, pedidos futuros, OPs e mínimo estão cobertos." />
                        )}
                      </div>
                    </Panel>
                  </>
                )}

                {purchaseView === 'pedidos' && (
                  <div className="grid gap-5 xl:grid-cols-[minmax(320px,390px)_minmax(0,1fr)]">
                    <Panel title="Novo pedido de compra">
                      {canManagePurchases ? (
                        <div className="grid gap-4">
                          <label className="grid gap-2">
                            <FieldLabel>Matéria-prima</FieldLabel>
                            <select
                              value={selectedPurchaseMaterial?.id ?? ''}
                              onChange={(event) => selectPurchaseMaterial(event.target.value)}
                              className="h-11 min-w-0 rounded-md border border-[#d1d5db] bg-white px-3 text-sm"
                            >
                              {state.rawMaterials.map((material) => (
                                <option key={material.id} value={material.id}>{material.name}</option>
                              ))}
                            </select>
                          </label>
                          <label className="grid gap-2">
                            <FieldLabel>Fornecedor</FieldLabel>
                            <select
                              value={purchaseSupplier}
                              onChange={(event) => setPurchaseSupplier(event.target.value)}
                              className="h-11 min-w-0 rounded-md border border-[#d1d5db] bg-white px-3 text-sm"
                            >
                              {state.suppliers.map((supplier) => (
                                <option key={supplier.id} value={supplier.name}>{supplier.name}</option>
                              ))}
                            </select>
                          </label>
                          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_120px]">
                            <SoftNumber
                              label={`Quantidade em ${selectedPurchaseMaterial?.purchaseUnit ?? 'un'}`}
                              value={purchaseQty}
                              step="0.01"
                              onChange={setPurchaseQty}
                            />
                            <ReadOnlyField label="Unidade" value={selectedPurchaseMaterial?.purchaseUnit ?? 'un'} />
                          </div>
                          <SoftNumber
                            label={`Custo por ${selectedPurchaseMaterial?.purchaseUnit ?? 'un'}`}
                            value={purchaseUnitCost}
                            onChange={setPurchaseUnitCost}
                          />
                          <SoftInput label="Previsão de chegada" value={purchaseExpectedDate} onChange={setPurchaseExpectedDate} />
                          <label className="grid gap-2">
                            <FieldLabel>Observações</FieldLabel>
                            <textarea
                              value={purchaseNotes}
                              onChange={(event) => setPurchaseNotes(event.target.value)}
                              className="min-h-24 rounded-md border border-[#d1d5db] bg-white p-3 text-sm"
                              placeholder="Prazo combinado, condição e referência do fornecedor"
                            />
                          </label>
                          {selectedPurchaseMaterial && (
                            <div className="rounded-md border border-[#dbeafe] bg-[#eff6ff] p-3 text-sm">
                              <strong className="block">Conversão prevista</strong>
                              <span className="mt-1 block text-[#4b5563]">
                                {purchaseQty.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} {selectedPurchaseMaterial.purchaseUnit}
                                {' → '}
                                {convertedStockQty(purchaseQty, selectedPurchaseMaterial, selectedPurchaseMaterial.purchaseUnit).toLocaleString('pt-BR', { maximumFractionDigits: 2 })} {selectedPurchaseMaterial.unit}
                              </span>
                            </div>
                          )}
                          <TotalLine label="Valor previsto" value={money(purchaseQty * purchaseUnitCost)} />
                          <button
                            type="button"
                            onClick={createPurchaseOrder}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#111827] px-4 text-sm font-medium text-white"
                          >
                            Criar pedido de compra
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <EmptyLine text="Seu perfil pode consultar pedidos, mas não criar novas compras." />
                      )}
                    </Panel>

                    <Panel title="Pedidos de compra">
                      <div className="grid gap-3">
                        {state.purchaseOrders.length ? (
                          state.purchaseOrders.map((order) => {
                            const pending = Math.max(0, order.qty - order.receivedQty)
                            const receivedPercent =
                              order.qty > 0
                                ? Math.min(100, Math.round((order.receivedQty / order.qty) * 100))
                                : 0
                            const arrivalDays = daysUntil(order.expectedDate)
                            const isOpen = order.status === 'Enviado' || order.status === 'Parcial'
                            return (
                              <div
                                key={order.id}
                                className="grid gap-3 rounded-md border border-[#e5e7eb] bg-white p-4 md:grid-cols-[minmax(0,1fr)_160px_auto] md:items-center"
                              >
                                <div>
                                  <div className="flex flex-wrap gap-2">
                                    <StatusBadge tone={order.status === 'Recebido' ? 'green' : order.status === 'Parcial' ? 'amber' : order.status === 'Cancelado' ? 'rose' : 'blue'}>
                                      {order.status}
                                    </StatusBadge>
                                    {isOpen && (
                                      <StatusBadge tone={arrivalDays < 0 ? 'rose' : arrivalDays <= 3 ? 'amber' : 'neutral'}>
                                        {arrivalDays < 0
                                          ? `${Math.abs(arrivalDays)} dia(s) atrasado`
                                          : arrivalDays === 0
                                            ? 'Chega hoje'
                                            : `Chega em ${arrivalDays} dia(s)`}
                                      </StatusBadge>
                                    )}
                                  </div>
                                  <strong className="mt-2 block">{order.number} · {order.item}</strong>
                                  <span className="mt-1 block text-sm text-[#6b7280]">
                                    {order.supplier} · Pedido em {formatDate(order.orderDate)} · Previsto para {formatDate(order.expectedDate)}
                                  </span>
                                  {order.notes && <span className="mt-1 block text-xs text-[#6b7280]">{order.notes}</span>}
                                  {order.cancellationReason && (
                                    <span className="mt-2 block rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-xs text-rose-800">
                                      Cancelado por {order.cancelledBy ?? 'Sistema'}: {order.cancellationReason}
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm">
                                  <span className="block text-[#6b7280]">Pedido: {order.qty.toLocaleString('pt-BR')} {order.unit}</span>
                                  <span className="block text-[#6b7280]">
                                    Recebido: {order.receivedQty.toLocaleString('pt-BR')} {order.unit} ({receivedPercent}%)
                                  </span>
                                  <strong className="block">
                                    {order.status === 'Cancelado' ? 'Não recebido' : 'Pendente'}: {pending.toLocaleString('pt-BR')} {order.unit}
                                  </strong>
                                  <span className="block text-[#6b7280]">{money(order.qty * order.unitCost)}</span>
                                </div>
                                {isOpen && (
                                  <div className="grid gap-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        selectPurchaseOrderForReceipt(order.id)
                                        setPurchaseView('recebimentos')
                                      }}
                                      className="inline-flex h-10 items-center justify-center rounded-md bg-[#111827] px-4 text-sm font-medium text-white"
                                    >
                                      Registrar chegada
                                    </button>
                                    {canManagePurchases && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setCancelPurchaseOrderId(order.id)
                                          setPurchaseCancellationReason('')
                                        }}
                                        className="inline-flex h-9 items-center justify-center rounded-md border border-rose-200 bg-white px-3 text-xs font-medium text-rose-700"
                                      >
                                        Cancelar pedido
                                      </button>
                                    )}
                                  </div>
                                )}
                                {cancelPurchaseOrderId === order.id && (
                                  <div className="grid gap-3 rounded-md border border-rose-200 bg-rose-50 p-3 md:col-span-3">
                                    <label className="grid gap-2">
                                      <FieldLabel>Motivo do cancelamento</FieldLabel>
                                      <textarea
                                        value={purchaseCancellationReason}
                                        onChange={(event) => setPurchaseCancellationReason(event.target.value)}
                                        rows={2}
                                        placeholder="Ex.: fornecedor não conseguirá entregar no prazo"
                                        className="min-h-20 rounded-md border border-rose-200 bg-white px-3 py-2 text-sm"
                                      />
                                    </label>
                                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setCancelPurchaseOrderId(null)
                                          setPurchaseCancellationReason('')
                                        }}
                                        className="inline-flex h-10 items-center justify-center rounded-md border border-[#d1d5db] bg-white px-4 text-sm font-medium"
                                      >
                                        Manter pedido
                                      </button>
                                      <button
                                        type="button"
                                        onClick={cancelPurchaseOrder}
                                        disabled={!purchaseCancellationReason.trim()}
                                        className="inline-flex h-10 items-center justify-center rounded-md bg-rose-700 px-4 text-sm font-medium text-white disabled:opacity-40"
                                      >
                                        Confirmar cancelamento
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )
                          })
                        ) : (
                          <EmptyLine text="Nenhum pedido de compra criado." />
                        )}
                      </div>
                    </Panel>
                  </div>
                )}

                {purchaseView === 'recebimentos' && (
                  <>
                    <div className="grid gap-5 xl:grid-cols-[minmax(320px,390px)_minmax(0,1fr)]">
                      <Panel title="Receber pedido de compra">
                        {canManagePurchases && openPurchaseOrders.length ? (
                          <div className="grid gap-4">
                            <label className="grid gap-2">
                              <FieldLabel>Pedido aguardando material</FieldLabel>
                              <select
                                value={selectedReceivingPurchaseOrder?.id ?? ''}
                                onChange={(event) => selectPurchaseOrderForReceipt(event.target.value)}
                                className="h-11 min-w-0 rounded-md border border-[#d1d5db] bg-white px-3 text-sm"
                              >
                                {openPurchaseOrders.map((order) => (
                                  <option key={order.id} value={order.id}>
                                    {order.number} · {order.item} · falta {(order.qty - order.receivedQty).toLocaleString('pt-BR')} {order.unit}
                                  </option>
                                ))}
                              </select>
                            </label>
                            {selectedReceivingPurchaseOrder && (
                              <div className="rounded-md border border-[#e5e7eb] bg-[#f9fafb] p-3 text-sm">
                                <strong className="block">{selectedReceivingPurchaseOrder.supplier}</strong>
                                <span className="mt-1 block text-[#6b7280]">
                                  Pendente: {selectedReceivingPendingQty.toLocaleString('pt-BR')} {selectedReceivingPurchaseOrder.unit}
                                  {' · '}Previsão: {formatDate(selectedReceivingPurchaseOrder.expectedDate)}
                                </span>
                              </div>
                            )}
                            <div className="grid grid-cols-2 gap-3">
                              <SoftInput label="Nota / comprovante" value={receiptNumber} onChange={setReceiptNumber} />
                              <SoftInput label="Data da chegada" value={receiptDate} onChange={setReceiptDate} />
                            </div>
                            <SoftNumber
                              label={`Quantidade recebida em ${selectedReceivingPurchaseOrder?.unit ?? 'un'}`}
                              value={receiptQty}
                              step="0.01"
                              onChange={setReceiptQty}
                            />
                            <SoftNumber
                              label={`Custo real por ${selectedReceivingPurchaseOrder?.unit ?? 'un'}`}
                              value={receiptUnitCost}
                              onChange={setReceiptUnitCost}
                            />
                            <SoftInput label="Vencimento da conta" value={receiptDueDate} onChange={setReceiptDueDate} />
                            {selectedReceivingMaterial && selectedReceivingPurchaseOrder && (
                              <div className="rounded-md border border-[#dbeafe] bg-[#eff6ff] p-3 text-sm">
                                Entrará no estoque como{' '}
                                <strong>
                                  {convertedStockQty(
                                    receiptQty,
                                    selectedReceivingMaterial,
                                    selectedReceivingPurchaseOrder.unit,
                                  ).toLocaleString('pt-BR', { maximumFractionDigits: 2 })} {selectedReceivingMaterial.unit}
                                </strong>
                              </div>
                            )}
                            <TotalLine label="Conta a pagar gerada" value={money(receiptQty * receiptUnitCost)} />
                            <button
                              type="button"
                              onClick={receivePurchaseOrder}
                              disabled={!receiptNumber.trim() || receiptQty <= 0 || receiptQty > selectedReceivingPendingQty}
                              className="inline-flex h-11 items-center justify-center rounded-md bg-[#111827] px-4 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              Confirmar recebimento
                            </button>
                          </div>
                        ) : (
                          <EmptyLine text={canManagePurchases ? 'Nenhum pedido aguardando recebimento.' : 'Seu perfil pode consultar, mas não registrar recebimentos.'} />
                        )}
                      </Panel>

                      <Panel title="Recebimentos registrados">
                        <div className="grid gap-3">
                          {state.purchaseNotes.length ? state.purchaseNotes.map((note) => {
                            const material = state.rawMaterials.find((item) => item.name === note.item)
                            const stockQty = note.stockQty ?? convertedStockQty(note.qty, material, note.unit)
                            const stockUnit = note.stockUnit ?? material?.unit ?? note.unit
                            const order = state.purchaseOrders.find((item) => item.id === note.purchaseOrderId)
                            return (
                              <RecordRow
                                key={note.id}
                                badge={`NF ${note.number}`}
                                title={`${order?.number ? `${order.number} · ` : ''}${note.item}`}
                                detail={`${note.supplier} · Recebido: ${note.qty.toLocaleString('pt-BR')} ${note.unit} · Estoque: ${stockQty.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} ${stockUnit} · ${formatDate(note.date)} · Por: ${note.createdBy ?? 'Sistema'}`}
                                value={money(note.qty * note.unitCost)}
                              />
                            )
                          }) : <EmptyLine text="Nenhum recebimento registrado." />}
                        </div>
                      </Panel>
                    </div>

                    <Panel title="Recebimento sem pedido de compra">
                      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:items-end">
                        <SoftInput label="Número" value={noteNumber} onChange={setNoteNumber} />
                        <SoftInput label="Data" value={noteDate} onChange={setNoteDate} />
                        <SoftInput label="Vencimento da conta" value={noteDueDate} onChange={setNoteDueDate} />
                        <label className="grid gap-2">
                          <FieldLabel>Fornecedor</FieldLabel>
                          <select value={noteSupplier} onChange={(event) => setNoteSupplier(event.target.value)} className="h-11 min-w-0 rounded-md border border-[#d1d5db] bg-white px-3 text-sm">
                            {state.suppliers.map((supplier) => <option key={supplier.id} value={supplier.name}>{supplier.name}</option>)}
                          </select>
                        </label>
                        <label className="grid gap-2">
                          <FieldLabel>Matéria-prima</FieldLabel>
                          <select value={noteItem} onChange={(event) => selectRawMaterialForNote(event.target.value)} className="h-11 min-w-0 rounded-md border border-[#d1d5db] bg-white px-3 text-sm">
                            {state.rawMaterials.map((material) => <option key={material.id} value={material.name}>{material.name}</option>)}
                          </select>
                        </label>
                        <SoftNumber label="Quantidade" value={noteQty} step="0.01" onChange={setNoteQty} />
                        <UnitInput label="Unidade" value={noteUnit} onChange={setNoteUnit} />
                        <SoftNumber label={`Custo por ${noteUnit || 'un'}`} value={noteUnitCost} onChange={setNoteUnitCost} />
                        <button type="button" onClick={createPurchaseNote} disabled={!canManagePurchases} className="inline-flex h-11 items-center justify-center rounded-md border border-[#d1d5db] bg-white px-4 text-sm font-medium disabled:opacity-40">
                          Registrar avulso
                        </button>
                      </div>
                      <p className="mt-3 text-xs text-[#6b7280]">
                        Use apenas quando o material chegar sem um pedido de compra criado anteriormente. A conversão será {noteStockQty.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} {noteStockUnit}.
                      </p>
                    </Panel>
                  </>
                )}
              </section>
            )}

            {activeArea === 'pedidos' && selectedProduct && (
              <section className="grid gap-5 xl:grid-cols-[minmax(320px,380px)_minmax(0,1fr)]">
                <Panel title="Novo orçamento ou pedido">
                  <div className="grid gap-4">
                    <label className="grid gap-2">
                      <FieldLabel>Tipo</FieldLabel>
                      <select
                        value={orderDocumentType}
                        onChange={(event) => setOrderDocumentType(event.target.value as OrderDocumentType)}
                        className="h-11 rounded-md border border-black/10 bg-white px-3 text-sm outline-none"
                      >
                        <option value="Orçamento">Orçamento - para enviar ao cliente</option>
                        <option value="Pedido">Pedido - venda aprovada</option>
                      </select>
                    </label>
                    <label className="grid gap-2">
                      <FieldLabel>Cliente cadastrado</FieldLabel>
                      <select
                        value={selectedCustomerId}
                        onChange={(event) => setSelectedCustomerId(event.target.value)}
                        className="h-11 rounded-md border border-black/10 bg-white px-3 text-sm outline-none"
                      >
                        {state.customers.map((customer) => (
                          <option key={customer.id} value={customer.id}>
                            {customer.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    {selectedCustomer && (
                      <div className="grid gap-2 rounded-md border border-black/10 bg-[#f9fafb] p-3 text-sm text-black/65">
                        <div>
                          <strong>Telefone:</strong> {selectedCustomer.phone}
                        </div>
                        <div>
                          <strong>Cidade:</strong> {selectedCustomer.city}
                        </div>
                        <div>
                          <strong>Obs.:</strong> {selectedCustomer.notes}
                        </div>
                      </div>
                    )}
                    <div className="grid gap-3 rounded-md border border-dashed border-black/15 bg-white p-3">
                      <FieldLabel>Novo cliente rápido</FieldLabel>
                      <SoftInput label="Nome" value={newCustomerName} onChange={setNewCustomerName} />
                      <SoftInput label="Telefone" value={newCustomerPhone} onChange={setNewCustomerPhone} />
                      <SoftInput label="Cidade" value={newCustomerCity} onChange={setNewCustomerCity} />
                      <SoftInput label="Observações" value={newCustomerNotes} onChange={setNewCustomerNotes} />
                      <button
                        type="button"
                        onClick={createCustomer}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-black/10 bg-white px-4 text-sm font-medium"
                      >
                        <Plus className="h-4 w-4" />
                        Cadastrar e usar
                      </button>
                    </div>
                    <label className="grid gap-2">
                      <FieldLabel>Produto</FieldLabel>
                      <select
                        value={selectedProductId}
                        onChange={(event) => setSelectedProductId(event.target.value)}
                        className="h-11 rounded-md border border-black/10 bg-white px-3 text-sm outline-none"
                      >
                        {state.products.map((product) => (
                          <option value={product.id} key={product.id} disabled={product.active === false || !product.variations.some((variation) => (variation.sheetStatus ?? 'Aprovada') === 'Aprovada')}>
                            {product.code} · {product.name} · {product.brand}{product.active === false ? ' · desativado' : !product.variations.some((variation) => (variation.sheetStatus ?? 'Aprovada') === 'Aprovada') ? ' · aguardando aprovação' : ''}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="grid gap-2">
                      <FieldLabel>Variação</FieldLabel>
                      <select
                        value={activeVariationId ?? ''}
                        onChange={(event) => setSelectedVariationId(event.target.value)}
                        className="h-11 rounded-md border border-black/10 bg-white px-3 text-sm outline-none"
                      >
                        {selectedProduct.variations.map((variation) => (
                          <option key={variation.id} value={variation.id} disabled={(variation.sheetStatus ?? 'Aprovada') !== 'Aprovada'}>
                            {variation.name} · {variation.fabric}{(variation.sheetStatus ?? 'Aprovada') !== 'Aprovada' ? ` · ${variation.sheetStatus}` : ''}
                          </option>
                        ))}
                      </select>
                    </label>
                    {selectedVariation && (
                      <div className="grid gap-1 rounded-md border border-black/10 bg-[#f9fafb] p-3 text-sm text-black/60">
                        <strong className="text-[#111827]">{selectedVariation.name}</strong>
                        <span>{selectedVariation.measurements}</span>
                        <span>{selectedVariation.technicalNotes}</span>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      <SoftInput label="Data do pedido" value={orderDate} onChange={setOrderDate} />
                      <SoftInput label="Prazo" value={orderDueDate} onChange={setOrderDueDate} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <SoftNumber label="Qtd." value={orderQty} onChange={setOrderQty} />
                      <ReadOnlyField label="Status inicial" value="Aberto" />
                    </div>
                    {canNegotiatePrice && (
                      <div className="grid gap-3 rounded-md border border-[#d1d5db] bg-white p-3">
                        <div className="grid gap-3 sm:grid-cols-3">
                          <MiniStat label="Preço mínimo" value={money(selectedMinimumPrice)} tone="amber" />
                          <MiniStat label="Preço sugerido" value={money(selectedPrice)} />
                          <MiniStat label="Preço oficial" value={selectedSalePrice ? money(selectedSalePrice) : 'Não definido'} />
                        </div>
                        <SoftNumber label="Preço combinado por peça" value={orderUnitPriceInput} onChange={setOrderUnitPriceInput} />
                        <button
                          type="button"
                          onClick={() => setOrderUnitPriceInput(Math.round(selectedOrderPrice))}
                          className="inline-flex h-10 items-center justify-center rounded-md border border-[#d1d5db] bg-[#ffffff] px-3 text-sm font-medium"
                        >
                          {selectedSalePrice ? 'Usar preço da tabela' : 'Usar preço sugerido'}
                        </button>
                        <MiniStat
                          label="Margem real da venda"
                          value={`${money(currentOrderPricing.realProfit)} por peça · ${currentOrderPricing.realMargin.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`}
                          tone={currentOrderNeedsApproval ? 'rose' : 'green'}
                        />
                        {currentOrderNeedsApproval && (
                          <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm leading-5 text-rose-900">
                            Abaixo do preço mínimo. O documento aguardará aprovação administrativa antes de seguir para financeiro ou produção.
                          </div>
                        )}
                      </div>
                    )}
                    <SoftInput label="Observações" value={orderNotes} onChange={setOrderNotes} />
                    {canNegotiatePrice && <TotalLine label={orderDocumentType === 'Pedido' ? 'Venda prevista' : 'Valor do orçamento'} value={money(orderQty * finalOrderUnitPrice)} />}
                    <button
                      type="button"
                      onClick={createOrder}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#111827] px-4 text-sm font-medium text-white"
                    >
                      {orderDocumentType === 'Pedido' ? 'Registrar pedido' : 'Registrar orçamento'}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </Panel>

                <Panel title="Orçamentos e pedidos">
                  <div className="grid gap-3">
                    {state.orders.map((order) => {
                      const product = state.products.find((item) => item.id === order.productId)
                      const timeline = orderTimeline(state, order)
                      const price = orderUnitPrice(state, order)
                      const pricing = orderPricingDetails(state, order)
                      return (
                        <div
                          key={order.id}
                          className="grid gap-3 rounded-md border border-black/10 bg-[#f9fafb] p-4 md:grid-cols-[1fr_220px]"
                        >
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <strong>{order.client}</strong>
                              <StatusBadge tone={order.documentType === 'Pedido' ? 'blue' : 'amber'}>
                                {order.documentType}
                              </StatusBadge>
                              <StatusBadge tone={orderStatusTone(order.status)}>{order.status}</StatusBadge>
                              {order.documentType === 'Pedido' && order.billed && <StatusBadge tone="green">Faturado</StatusBadge>}
                              {pricing.approvalStatus === 'Pendente' && <StatusBadge tone="rose">Preço aguardando aprovação</StatusBadge>}
                              {pricing.approvalStatus === 'Aprovada' && <StatusBadge tone="green">Desconto aprovado</StatusBadge>}
                              {pricing.approvalStatus === 'Recusada' && <StatusBadge tone="rose">Preço recusado</StatusBadge>}
                            </div>
                            <p className="mt-2 text-sm text-black/60">
                              {productDisplayName(product, order.variationId)} · {order.qty} un
                              {canSeeMoney ? ` · ${money(order.qty * price)}` : ''}
                            </p>
                            <div className="mt-2 grid gap-1 text-sm text-black/50">
                              <p>Pedido: {formatDate(order.orderDate)} · Prazo: {formatDate(order.dueDate)}</p>
                              <p>Telefone: {order.phone || 'Não informado'}</p>
                              <p>Cidade: {order.city || 'Não informada'}</p>
                              <p>Registrado por: {order.createdBy ?? 'Sistema'}</p>
                              {canNegotiatePrice && <p>Preço combinado: {money(price)} por peça · Total: {money(order.qty * price)}</p>}
                              {canNegotiatePrice && (
                                <p>
                                  Mínimo: {money(pricing.minimumPrice)} · Oficial: {pricing.officialPrice ? money(pricing.officialPrice) : 'não definido'} · Margem real: {money(pricing.realProfit)} ({pricing.realMargin.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%)
                                </p>
                              )}
                              {order.notes && <p>Obs.: {order.notes}</p>}
                              {order.paymentMethod && <p>Pagamento: {order.paymentMethod} · {order.paymentStatus}</p>}
                              {order.deliveryMethod && <p>Entrega: {order.deliveryMethod} · {formatDate(order.deliveryDate ?? order.dueDate)}</p>}
                              {order.cancellationReason && <p>Cancelamento: {order.cancellationReason}</p>}
                            </div>
                            <details className="mt-3 rounded-md border border-[#e5e7eb] bg-[#ffffff] p-3">
                              <summary className="cursor-pointer text-sm font-medium text-[#3730a3]">
                                Linha do tempo do pedido
                              </summary>
                              <div className="mt-3">
                                <OrderTimeline items={timeline} />
                              </div>
                            </details>
                          </div>
                          <div className="grid gap-2">
                            <select
                              value={order.status}
                              onChange={(event) =>
                                updateOrderStatus(order.id, event.target.value as OrderStatus)
                              }
                              className="h-10 rounded-md border border-black/10 bg-white px-3 text-sm outline-none"
                            >
                              {(['Aberto', 'Em produção', 'Pronto', 'Entregue', 'Cancelado'] as OrderStatus[]).map((status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => openProductionDecision(order)}
                              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#111827] px-4 text-sm font-medium text-white disabled:opacity-40"
                              disabled={order.documentType !== 'Pedido' || order.status !== 'Aberto' || !orderPriceApproved(order)}
                            >
                              Analisar produção
                            </button>
                            {order.documentType === 'Orçamento' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => convertBudgetToOrder(order)}
                                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#3730a3] px-4 text-sm font-medium text-white"
                                  disabled={!orderPriceApproved(order)}
                                >
                                  Virar pedido
                                </button>
                                <button
                                  type="button"
                                  onClick={() => duplicateBudget(order)}
                                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[#d1d5db] bg-white px-4 text-sm font-medium"
                                >
                                  Duplicar orçamento
                                </button>
                              </>
                            )}
                            <button
                              type="button"
                              onClick={() => setPreviewOrderId(order.id)}
                              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[#c7d2fe] bg-[#eef2ff] px-4 text-sm font-medium text-[#1f2937]"
                            >
                              <ReceiptText className="h-4 w-4" />
                              {order.documentType}
                            </button>
                            {canNegotiatePrice && (
                              <label className="grid gap-1 rounded-md border border-[#e5e7eb] bg-white p-2">
                                <FieldLabel>Preço por peça</FieldLabel>
                                <input
                                  type="number"
                                  value={Math.round(price)}
                                  onChange={(event) => updateOrderUnitPrice(order.id, Number(event.target.value))}
                                  disabled={order.status !== 'Aberto' || state.productionOrders.some((op) => op.orderId === order.id)}
                                  className="h-9 rounded-md border border-[#e5e7eb] bg-[#ffffff] px-2 text-sm outline-none focus:border-[#4f46e5] disabled:bg-[#f3f4f6] disabled:text-black/40"
                                />
                              </label>
                            )}
                            {canApproveDiscount && pricing.approvalStatus === 'Pendente' && (
                              <div className="grid grid-cols-2 gap-2 rounded-md border border-rose-200 bg-rose-50 p-2">
                                <button
                                  type="button"
                                  onClick={() => reviewOrderPrice(order.id, 'Aprovada')}
                                  className="inline-flex h-10 items-center justify-center rounded-md bg-[#166534] px-3 text-sm font-medium text-white"
                                >
                                  Aprovar preço
                                </button>
                                <button
                                  type="button"
                                  onClick={() => reviewOrderPrice(order.id, 'Recusada')}
                                  className="inline-flex h-10 items-center justify-center rounded-md border border-rose-300 bg-white px-3 text-sm font-medium text-rose-800"
                                >
                                  Recusar
                                </button>
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => updateOrderStatus(order.id, 'Entregue')}
                              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-black/10 bg-white px-4 text-sm font-medium disabled:opacity-40"
                              disabled={order.status !== 'Pronto'}
                            >
                              Marcar entregue
                            </button>
                            {order.status !== 'Entregue' && order.status !== 'Cancelado' && (
                              <button
                                type="button"
                                onClick={() => requestOrderCancellation(order)}
                                className="inline-flex h-10 items-center justify-center rounded-md border border-amber-200 bg-amber-50 px-4 text-sm font-medium text-amber-900"
                              >
                                Cancelar com motivo
                              </button>
                            )}
                            {canDeleteRecords && (
                              <button
                                type="button"
                                onClick={() => deleteOrder(order)}
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-rose-200 bg-rose-50 px-4 text-sm font-medium text-rose-800"
                              >
                                <Trash2 className="h-4 w-4" />
                                Excluir
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </Panel>
              </section>
            )}

            {activeArea === 'producao' && selectedProduct && (
              <section className="grid gap-5">
                <Panel title="Criar produção para estoque">
                  <div className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-[1fr_1fr_120px_150px_150px]">
                    <label className="grid gap-2">
                      <FieldLabel>Produto</FieldLabel>
                      <select
                        value={selectedProductId}
                        onChange={(event) => setSelectedProductId(event.target.value)}
                        className="h-11 rounded-md border border-black/10 bg-white px-3 text-sm outline-none"
                      >
                        {state.products.map((product) => (
                          <option value={product.id} key={product.id} disabled={product.active === false || !product.variations.some((variation) => (variation.sheetStatus ?? 'Aprovada') === 'Aprovada')}>
                            {product.code} · {product.name}{product.active === false ? ' · desativado' : !product.variations.some((variation) => (variation.sheetStatus ?? 'Aprovada') === 'Aprovada') ? ' · aguardando aprovação' : ''}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="grid gap-2">
                      <FieldLabel>Variação</FieldLabel>
                      <select
                        value={activeVariationId ?? ''}
                        onChange={(event) => setSelectedVariationId(event.target.value)}
                        className="h-11 rounded-md border border-black/10 bg-white px-3 text-sm outline-none"
                      >
                        {selectedProduct.variations.map((variation) => (
                          <option key={variation.id} value={variation.id} disabled={(variation.sheetStatus ?? 'Aprovada') !== 'Aprovada'}>
                            {variation.name} · {variation.fabric}{(variation.sheetStatus ?? 'Aprovada') !== 'Aprovada' ? ` · ${variation.sheetStatus}` : ''}
                          </option>
                        ))}
                      </select>
                    </label>
                    <SoftNumber label="Qtd." value={stockOpQty} onChange={setStockOpQty} />
                    <SoftInput label="Início" value={stockOpStartDate} onChange={setStockOpStartDate} />
                    <label className="grid gap-2">
                      <FieldLabel>Prioridade</FieldLabel>
                      <select
                        value={stockOpPriority}
                        onChange={(event) => setStockOpPriority(event.target.value as ProductionPriority)}
                        className="h-11 rounded-md border border-black/10 bg-white px-3 text-sm outline-none"
                      >
                        {(['Baixa', 'Normal', 'Alta', 'Urgente'] as ProductionPriority[]).map((priority) => (
                          <option key={priority} value={priority}>
                            {priority}
                          </option>
                        ))}
                      </select>
                    </label>
                    <SoftInput label="Responsável" value={stockOpResponsible} onChange={setStockOpResponsible} />
                    <div className="lg:col-span-2 2xl:col-span-4">
                      <SoftInput label="Observação da produção" value={stockOpNotes} onChange={setStockOpNotes} />
                    </div>
                    <div className="grid gap-2 lg:col-span-2 2xl:col-span-4">
                      <FieldLabel>Verificação de matéria-prima</FieldLabel>
                      {stockOpMaterialShortages.length ? (
                        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm leading-5 text-amber-950">
                          {stockOpMaterialShortages.map((item) => (
                            <span key={item.item} className="block">
                              Falta comprar {item.missing.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} {item.unit} de {item.item}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
                          Matéria-prima suficiente para iniciar esta quantidade.
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={createStockProductionOrder}
                      className="inline-flex h-11 items-center justify-center gap-2 self-end rounded-md bg-[#111827] px-4 text-sm font-medium text-white"
                    >
                      <Plus className="h-4 w-4" />
                      Criar produção
                    </button>
                  </div>
                </Panel>

                <div className="grid gap-4 xl:grid-cols-2">
                  {(['Não iniciada', 'Em produção', 'Pausada', 'Finalizada'] as OpStatus[]).map((status) => (
                    <Panel key={status} title={status}>
                      <div className="grid gap-3">
                        {state.productionOrders
                          .filter((op) => op.status === status)
                          .map((op) => {
                            const order = state.orders.find((item) => item.id === op.orderId)
                            const product = state.products.find((item) => item.id === op.productId)
                            const remainingQty = Math.max(0, op.qty - op.produced)
                            const missingForStart = product ? missingMaterialsFor(product, remainingQty, op.variationId) : []
                            return (
                              <div key={op.id} className="rounded-md border border-[#e5e7eb] bg-[#ffffff] p-4">
                                <div className="flex items-center justify-between gap-3">
                                  <strong>{op.id}</strong>
                                  <div className="flex flex-wrap justify-end gap-1">
                                    <StatusBadge tone={opStatusTone(op.status)}>{op.status}</StatusBadge>
                                    <StatusBadge tone={priorityTone(op.priority)}>{op.priority}</StatusBadge>
                                  </div>
                                </div>
                                <div className="mt-2 flex flex-wrap gap-1">
                                  <StatusBadge tone={op.origin === 'Pedido' ? 'blue' : 'amber'}>
                                    {op.origin}
                                  </StatusBadge>
                                  {!!missingForStart.length && op.status !== 'Finalizada' && (
                                    <StatusBadge tone="rose">Falta MP</StatusBadge>
                                  )}
                                </div>
                                <p className="mt-2 text-sm font-medium text-black/75">
                                  {product?.code} · {productDisplayName(product, op.variationId)}
                                </p>
                                <p className="text-sm text-black/50">
                                  {order ? `Pedido ${order.id} · ${order.client}` : 'Produção para estoque'}
                                </p>
                                <details className="mt-3 rounded-md border border-[#e5e7eb] bg-[#ffffff] p-3">
                                  <summary className="cursor-pointer text-sm font-medium text-[#3730a3]">
                                    Ajustar detalhes da ordem
                                  </summary>
                                  <div className="mt-3 grid gap-2">
                                    <label className="grid gap-1">
                                      <FieldLabel>Responsável</FieldLabel>
                                      <input
                                        value={op.responsible}
                                        onChange={(event) =>
                                          updateProductionOrder(op.id, 'responsible', event.target.value)
                                        }
                                        className="h-9 rounded-md border border-[#e5e7eb] bg-[#ffffff] px-2 text-sm outline-none focus:border-[#4f46e5]"
                                      />
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                      <label className="grid gap-1">
                                        <FieldLabel>Início</FieldLabel>
                                        <input
                                          value={op.startedAt}
                                          onChange={(event) =>
                                            updateProductionOrder(op.id, 'startedAt', event.target.value)
                                          }
                                          className="h-9 rounded-md border border-[#e5e7eb] bg-[#ffffff] px-2 text-sm outline-none focus:border-[#4f46e5]"
                                        />
                                      </label>
                                      <label className="grid gap-1">
                                        <FieldLabel>Final</FieldLabel>
                                        <input
                                          value={op.finishedAt}
                                          onChange={(event) =>
                                            updateProductionOrder(op.id, 'finishedAt', event.target.value)
                                          }
                                          className="h-9 rounded-md border border-[#e5e7eb] bg-[#ffffff] px-2 text-sm outline-none focus:border-[#4f46e5]"
                                        />
                                      </label>
                                    </div>
                                    <label className="grid gap-1">
                                      <FieldLabel>Prioridade</FieldLabel>
                                      <select
                                        value={op.priority}
                                        onChange={(event) =>
                                          updateProductionOrder(op.id, 'priority', event.target.value)
                                        }
                                        className="h-9 rounded-md border border-[#e5e7eb] bg-[#ffffff] px-2 text-sm outline-none focus:border-[#4f46e5]"
                                      >
                                        {(['Baixa', 'Normal', 'Alta', 'Urgente'] as ProductionPriority[]).map((priority) => (
                                          <option key={priority} value={priority}>
                                            {priority}
                                          </option>
                                        ))}
                                      </select>
                                    </label>
                                    <label className="grid gap-1">
                                      <FieldLabel>Observação da produção</FieldLabel>
                                      <textarea
                                        value={op.notes}
                                        rows={2}
                                        onChange={(event) =>
                                          updateProductionOrder(op.id, 'notes', event.target.value)
                                        }
                                        className="min-h-16 rounded-md border border-[#e5e7eb] bg-[#ffffff] px-2 py-2 text-sm outline-none focus:border-[#4f46e5]"
                                      />
                                    </label>
                                  </div>
                                </details>
                                <div className="mt-4 h-2 overflow-hidden rounded-full bg-black/10">
                                  <span
                                    className="block h-full rounded-full bg-[#3730a3]"
                                    style={{ width: `${Math.min(100, (op.produced / op.qty) * 100)}%` }}
                                  />
                                </div>
                                <p className="mt-2 text-xs text-black/50">
                                  {op.produced} de {op.qty} un
                                </p>
                                <div className="mt-3 rounded-md border border-[#e5e7eb] bg-[#ffffff] p-3">
                                  <FieldLabel>Histórico de lançamentos</FieldLabel>
                                  <div className="mt-3 grid gap-2 text-xs text-black/60">
                                    {op.launches?.length ? (
                                      op.launches.slice(-4).reverse().map((launch) => (
                                        <div key={launch.id} className="grid grid-cols-[90px_1fr] gap-2 rounded-md bg-[#ffffff] px-2 py-2">
                                          <strong className="text-[#3730a3]">{launch.type} · {launch.qty} un</strong>
                                          <span>
                                            {formatDate(launch.date)}
                                            {launch.responsible ? ` · ${launch.responsible}` : ''}
                                            {launch.notes ? ` · ${launch.notes}` : ''}
                                          </span>
                                        </div>
                                      ))
                                    ) : (
                                      <div className="rounded-md border border-dashed border-black/15 px-2 py-2">
                                        Nenhum lançamento ainda.
                                      </div>
                                    )}
                                  </div>
                                </div>
                                {!!missingForStart.length && op.status !== 'Finalizada' && (
                                  <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                                    <strong className="block">Alerta antes de iniciar</strong>
                                    {missingForStart.slice(0, 3).map((item) => (
                                      <span key={item.item} className="mt-1 block">
                                        Falta {item.missing.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} {item.unit} de {item.item}
                                      </span>
                                    ))}
                                    <span className="mt-1 block">Veja a lista completa em Estoque.</span>
                                  </div>
                                )}
                                <div className="mt-4 grid gap-2">
                                  {op.status !== 'Finalizada' && (
                                    <>
                                      {op.status === 'Não iniciada' && (
                                        <button
                                          type="button"
                                          onClick={() => updateProductionStatus(op.id, 'Em produção')}
                                          className="inline-flex h-10 w-full items-center justify-center rounded-md bg-[#111827] px-4 text-sm font-medium text-white"
                                        >
                                          Iniciar produção
                                        </button>
                                      )}
                                      <div className="grid grid-cols-[1fr_auto] gap-2">
                                        <input
                                          type="number"
                                          min="1"
                                          max={Math.max(1, op.qty - op.produced)}
                                          value={productionLaunches[op.id] ?? 1}
                                          onChange={(event) =>
                                            setProductionLaunches((current) => ({
                                              ...current,
                                              [op.id]: Number(event.target.value),
                                            }))
                                          }
                                          className="h-10 rounded-md border border-[#e5e7eb] bg-[#ffffff] px-3 text-sm outline-none focus:border-[#4f46e5]"
                                          aria-label={`Quantidade produzida para ${op.id}`}
                                        />
                                        <button
                                          type="button"
                                          onClick={() => registerProduction(op)}
                                          className="inline-flex h-10 items-center justify-center rounded-md bg-[#111827] px-4 text-sm font-medium text-white transition hover:bg-[#3730a3]"
                                        >
                                          Lançar
                                        </button>
                                      </div>
                                      {op.status !== 'Não iniciada' && (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            updateProductionStatus(
                                              op.id,
                                              op.status === 'Pausada'
                                                ? op.produced > 0
                                                  ? 'Em produção'
                                                  : 'Não iniciada'
                                                : 'Pausada',
                                            )
                                          }
                                          className="inline-flex h-10 w-full items-center justify-center rounded-md border border-[#e5e7eb] bg-[#ffffff] px-4 text-sm font-medium transition hover:border-[#9ca3af]"
                                        >
                                          {op.status === 'Pausada' ? 'Retomar produção' : 'Pausar produção'}
                                        </button>
                                      )}
                                    </>
                                  )}
                                  <div className="grid grid-cols-2 gap-2">
                                    <button
                                      type="button"
                                      onClick={() => setPreviewOpId(op.id)}
                                      className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[#e5e7eb] bg-[#ffffff] px-3 text-sm font-medium transition hover:border-[#9ca3af]"
                                    >
                                      <Printer className="h-4 w-4" />
                                      Ver ordem
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => downloadProductionOrderPdf(op.id)}
                                      className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[#c7d2fe] bg-[#eef2ff] px-3 text-sm font-medium text-[#1f2937] transition hover:bg-white"
                                    >
                                      <FileText className="h-4 w-4" />
                                      PDF
                                    </button>
                                  </div>
                                  {canDeleteRecords && (
                                    <button
                                      type="button"
                                      onClick={() => deleteProductionOrder(op)}
                                      className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-rose-200 bg-rose-50 px-3 text-sm font-medium text-rose-800 transition hover:bg-white"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      Excluir OP
                                    </button>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                      </div>
                    </Panel>
                  ))}
                </div>
              </section>
            )}

            {activeArea === 'estoque' && (
              <section className="grid gap-5">
                <MobileViewSelect
                  label="Área do estoque"
                  value={stockView}
                  options={[
                    ['acabados', 'Produtos acabados'],
                    ['materias', 'Matérias-primas'],
                    ['inventario', 'Inventário'],
                  ]}
                  onChange={(value) => setStockView(value as typeof stockView)}
                />
                <div className="hidden gap-2 rounded-md border border-[#d1d5db] bg-white p-2 sm:flex">
                  {([
                    ['acabados', 'Produtos acabados'],
                    ['materias', 'Matérias-primas'],
                    ['inventario', 'Inventário'],
                  ] as const).map(([view, label]) => (
                    <button
                      key={view}
                      type="button"
                      onClick={() => setStockView(view)}
                      aria-pressed={stockView === view}
                      className={`h-10 min-w-max rounded-md px-4 text-sm font-medium ${
                        stockView === view
                          ? 'bg-[#111827] text-white'
                          : 'bg-white text-[#4b5563] hover:bg-[#f3f4f6]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {stockView === 'acabados' && (
                  <Panel title="Posição de produtos acabados">
                    <div className="mb-5 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-[#e5e7eb] bg-[#e5e7eb] md:grid-cols-4">
                      <StockSummary label="Físico" value={`${finishedStockPositions.reduce((sum, item) => sum + item.physical, 0)} un`} />
                      <StockSummary label="Reservado" value={`${finishedStockPositions.reduce((sum, item) => sum + item.reserved, 0)} un`} />
                      <StockSummary label="Disponível" value={`${finishedStockPositions.reduce((sum, item) => sum + item.available, 0)} un`} />
                      <StockSummary label="Produzindo" value={`${finishedStockPositions.reduce((sum, item) => sum + item.producing, 0)} un`} />
                    </div>
                    <FinishedStockPositionTable
                      rows={finishedStockPositions}
                      onOpenHistory={openInventoryHistory}
                    />
                  </Panel>
                )}

                {stockView === 'materias' && (
                  <>
                    <Panel title="Posição de matérias-primas">
                      <div className="mb-5 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-[#e5e7eb] bg-[#e5e7eb] md:grid-cols-4">
                        <StockSummary label="Itens cadastrados" value={rawStockPositions.length.toString()} />
                        <StockSummary label="Abaixo do mínimo" value={rawStockPositions.filter((item) => isBelowMinimumStock(item.physical, item.minimumStock)).length.toString()} />
                        <StockSummary label="Com falta para OP" value={rawStockPositions.filter((item) => item.shortage > 0).length.toString()} />
                        <StockSummary label="Valor físico" value={canSeeMoney ? money(stock.rawValue) : 'Restrito'} />
                      </div>
                      <RawStockPositionTable
                        rows={rawStockPositions}
                        onOpenHistory={openInventoryHistory}
                      />
                    </Panel>

                    <Panel title="O que precisa comprar">
                      {purchaseSuggestions.length ? (
                        <div className="grid gap-3">
                          {purchaseSuggestions.map((item) => (
                            <div
                              key={item.item}
                              className="grid gap-3 rounded-md border border-[#e5e7eb] bg-white p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center"
                            >
                              <div>
                                <StatusBadge tone={item.suggestedStockQty > 0 ? 'amber' : 'green'}>
                                  {item.suggestedStockQty > 0 ? 'Comprar' : 'Já encomendado'}
                                </StatusBadge>
                                <strong className="mt-2 block">{item.item}</strong>
                                <span className="mt-1 block text-sm leading-5 text-[#6b7280]">
                                  OPs: {item.requiredForOps.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} {item.unit}
                                  {' · '}Pedidos futuros: {item.requiredForFutureOrders.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} {item.unit}
                                  {' · '}Mínimo: {item.minimumStock.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} {item.unit}
                                  {' · '}A caminho: {item.onOrder.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} {item.unit}
                                </span>
                              </div>
                              {item.suggestedStockQty > 0 ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    preparePurchaseFromSuggestion(item)
                                    setActiveArea('notas')
                                  }}
                                  className="inline-flex h-10 items-center justify-center rounded-md bg-[#111827] px-4 text-sm font-medium text-white"
                                >
                                  Pedir {item.suggestedPurchaseQty.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} {item.purchaseUnit}
                                </button>
                              ) : (
                                <strong className="text-sm text-emerald-700">Coberto pelo pedido aberto</strong>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <EmptyLine text="Nenhuma compra sugerida no momento." />
                      )}
                    </Panel>
                  </>
                )}

                {stockView === 'inventario' && (
                  <div className="grid gap-5 xl:grid-cols-[minmax(320px,0.7fr)_minmax(0,1.3fr)]">
                    <Panel title="Nova contagem física">
                      {canAdjustInventory ? (
                        <div className="grid gap-4">
                          <label className="grid gap-2">
                            <FieldLabel>Tipo de estoque</FieldLabel>
                            <select
                              value={countCategory}
                              onChange={(event) => {
                                const category = event.target.value as InventoryCategory
                                const nextItems = category === 'Matéria-prima' ? rawInventoryItems : finishedInventoryItems
                                setCountCategory(category)
                                setCountItem(nextItems[0]?.item ?? '')
                                setCountedQty(0)
                              }}
                              className="h-11 rounded-md border border-[#d1d5db] bg-white px-3 text-sm"
                            >
                              <option>Matéria-prima</option>
                              <option>Produto acabado</option>
                            </select>
                          </label>
                          <label className="grid gap-2">
                            <FieldLabel>Item que será contado</FieldLabel>
                            <select
                              value={countSelection?.item ?? ''}
                              onChange={(event) => {
                                setCountItem(event.target.value)
                                setCountedQty(0)
                              }}
                              className="h-11 min-w-0 rounded-md border border-[#d1d5db] bg-white px-3 text-sm"
                            >
                              {countItems.map((item) => (
                                <option key={item.item} value={item.item}>{item.item}</option>
                              ))}
                            </select>
                          </label>
                          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-[#e5e7eb] bg-[#e5e7eb]">
                            <StockSummary label="Saldo no sistema" value={`${countSystemQty.toLocaleString('pt-BR')} ${countSelection?.unit ?? ''}`} />
                            <StockSummary
                              label="Diferença"
                              value={`${countDifference > 0 ? '+' : ''}${countDifference.toLocaleString('pt-BR')} ${countSelection?.unit ?? ''}`}
                              tone={countDifference === 0 ? 'neutral' : 'attention'}
                            />
                          </div>
                          <SoftNumber label="Quantidade contada fisicamente" value={countedQty} onChange={setCountedQty} />
                          <label className="grid gap-2">
                            <FieldLabel>Observação da contagem</FieldLabel>
                            <textarea
                              value={countNotes}
                              onChange={(event) => setCountNotes(event.target.value)}
                              rows={3}
                              placeholder="Obrigatória quando houver diferença"
                              className="min-h-24 rounded-md border border-[#d1d5db] bg-white px-3 py-2 text-sm outline-none focus:border-[#4f46e5]"
                            />
                          </label>
                          <button
                            type="button"
                            onClick={registerInventoryCount}
                            disabled={!countSelection || countedQty < 0 || (countDifference !== 0 && !countNotes.trim())}
                            className="inline-flex h-11 items-center justify-center rounded-md bg-[#111827] px-4 text-sm font-medium text-white disabled:opacity-40"
                          >
                            Concluir contagem
                          </button>
                        </div>
                      ) : (
                        <EmptyLine text="A contagem física pode ser consultada por todos, mas somente o Admin pode concluí-la e ajustar diferenças." />
                      )}
                    </Panel>

                    <Panel title="Contagens realizadas">
                      <div className="grid gap-3">
                        {state.inventoryCounts.length ? (
                          state.inventoryCounts.map((count) => (
                            <div key={count.id} className="grid gap-3 rounded-md border border-[#e5e7eb] bg-white p-4 md:grid-cols-[minmax(0,1fr)_repeat(3,110px)_100px] md:items-center">
                              <div>
                                <strong className="block">{count.item}</strong>
                                <span className="mt-1 block text-xs text-[#6b7280]">
                                  {count.id} · {formatDate(count.date)} · {count.createdBy}
                                  {count.notes ? ` · ${count.notes}` : ''}
                                </span>
                              </div>
                              <StockCountValue label="Sistema" value={`${count.systemQty} ${count.unit}`} />
                              <StockCountValue label="Contado" value={`${count.countedQty} ${count.unit}`} />
                              <StockCountValue
                                label="Diferença"
                                value={`${count.difference > 0 ? '+' : ''}${count.difference} ${count.unit}`}
                                attention={count.difference !== 0}
                              />
                              <button
                                type="button"
                                onClick={() => openInventoryHistory(count.item)}
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[#d1d5db] bg-white px-3 text-xs font-medium"
                              >
                                <FileText className="h-4 w-4" />
                                Histórico
                              </button>
                            </div>
                          ))
                        ) : (
                          <EmptyLine text="Nenhuma contagem física concluída." />
                        )}
                      </div>
                    </Panel>
                  </div>
                )}
              </section>
            )}

            {activeArea === 'movimentacoes' && canAccessArea('movimentacoes') && (
              <section className="grid gap-5">
                <div className="flex gap-2 rounded-md border border-[#d1d5db] bg-white p-2">
                  <button
                    type="button"
                    onClick={() => setMovementView('historico')}
                    className={`h-10 rounded-md px-4 text-sm font-medium ${movementView === 'historico' ? 'bg-[#111827] text-white' : 'text-[#4b5563]'}`}
                  >
                    Histórico
                  </button>
                  {canAdjustInventory && (
                    <button
                      type="button"
                      onClick={() => setMovementView('ajuste')}
                      className={`h-10 rounded-md px-4 text-sm font-medium ${movementView === 'ajuste' ? 'bg-[#111827] text-white' : 'text-[#4b5563]'}`}
                    >
                      Novo ajuste
                    </button>
                  )}
                </div>

                {movementView === 'historico' && (
                  <Panel title="Histórico por item">
                    <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_repeat(4,150px)] xl:items-end">
                      <label className="grid gap-2">
                        <FieldLabel>Item para consultar</FieldLabel>
                        <select
                          value={inventoryHistoryItem}
                          onChange={(event) => {
                            const item = event.target.value
                            setInventoryHistoryItem(item)
                            setMessage(
                              item === 'Todos'
                                ? 'Histórico completo de entradas e saídas do estoque.'
                                : `Histórico de ${item}. Confira cada entrada, saída e o saldo após o movimento.`,
                            )
                          }}
                          className="h-11 min-w-0 rounded-md border border-[#d1d5db] bg-white px-3 text-sm"
                        >
                          <option>Todos</option>
                          {inventoryHistoryItems.map((item) => <option key={item}>{item}</option>)}
                        </select>
                      </label>
                      <StockSummary label="Movimentos" value={filteredInventoryEntries.length.toString()} />
                      <StockSummary
                        label="Entradas"
                        value={filteredInventoryEntries.filter((entry) => inventoryKindDirection(entry.kind) === 'Entrada').length.toString()}
                      />
                      <StockSummary
                        label="Saídas"
                        value={filteredInventoryEntries.filter((entry) => inventoryKindDirection(entry.kind) === 'Saída').length.toString()}
                      />
                      <StockSummary
                        label={selectedInventoryBalance === null ? 'Itens no histórico' : 'Saldo atual'}
                        value={
                          selectedInventoryBalance === null
                            ? inventoryHistoryItems.length.toString()
                            : `${selectedInventoryBalance.toLocaleString('pt-BR')} ${selectedInventoryUnit}`
                        }
                        tone={selectedInventoryBalance !== null && selectedInventoryBalance < 0 ? 'attention' : 'neutral'}
                      />
                    </div>
                    <div className="grid gap-3">
                      {filteredInventoryLedger.length ? (
                        filteredInventoryLedger.map(({ entry, balanceAfter }) => (
                          <InventoryHistoryRow
                            key={entry.id}
                            entry={entry}
                            balanceAfter={balanceAfter}
                            showValue={canSeeMoney}
                          />
                        ))
                      ) : (
                        <EmptyLine text="Nenhuma movimentação encontrada para este item." />
                      )}
                    </div>
                  </Panel>
                )}

                {movementView === 'ajuste' && canAdjustInventory && (
                  <Panel title="Ajuste controlado de estoque">
                    <div className="grid gap-4 lg:grid-cols-2">
                      <label className="grid gap-2">
                        <FieldLabel>Tipo de estoque</FieldLabel>
                        <select
                          value={adjustmentCategory}
                          onChange={(event) => {
                            const category = event.target.value as InventoryCategory
                            const nextItems = category === 'Matéria-prima' ? rawInventoryItems : finishedInventoryItems
                            setAdjustmentCategory(category)
                            setAdjustmentItem(nextItems[0]?.item ?? '')
                          }}
                          className="h-11 rounded-md border border-[#d1d5db] bg-white px-3 text-sm"
                        >
                          <option>Matéria-prima</option>
                          <option>Produto acabado</option>
                        </select>
                      </label>
                      <label className="grid gap-2">
                        <FieldLabel>Item</FieldLabel>
                        <select
                          value={adjustmentSelection?.item ?? ''}
                          onChange={(event) => setAdjustmentItem(event.target.value)}
                          className="h-11 min-w-0 rounded-md border border-[#d1d5db] bg-white px-3 text-sm"
                        >
                          {adjustmentItems.map((item) => <option key={item.item}>{item.item}</option>)}
                        </select>
                      </label>
                      <label className="grid gap-2">
                        <FieldLabel>O ajuste aumenta ou reduz o saldo?</FieldLabel>
                        <select
                          value={adjustmentDirection}
                          onChange={(event) => setAdjustmentDirection(event.target.value as 'Entrada' | 'Saída')}
                          className="h-11 rounded-md border border-[#d1d5db] bg-white px-3 text-sm"
                        >
                          <option>Entrada</option>
                          <option>Saída</option>
                        </select>
                      </label>
                      <SoftNumber label={`Quantidade (${adjustmentSelection?.unit ?? ''})`} value={adjustmentQty} onChange={setAdjustmentQty} />
                      <label className="grid gap-2 lg:col-span-2">
                        <FieldLabel>Justificativa obrigatória</FieldLabel>
                        <textarea
                          value={adjustmentReason}
                          onChange={(event) => setAdjustmentReason(event.target.value)}
                          rows={3}
                          placeholder="Ex.: correção após conferência física"
                          className="min-h-24 rounded-md border border-[#d1d5db] bg-white px-3 py-2 text-sm outline-none focus:border-[#4f46e5]"
                        />
                      </label>
                      <div className="rounded-md border border-[#e5e7eb] bg-[#f9fafb] p-4 text-sm text-[#4b5563]">
                        Saldo físico atual: <strong>{inventoryPhysicalQty(adjustmentCategory, adjustmentSelection?.item ?? '').toLocaleString('pt-BR')} {adjustmentSelection?.unit ?? ''}</strong>
                      </div>
                      <button
                        type="button"
                        onClick={registerInventoryAdjustment}
                        disabled={!adjustmentSelection || adjustmentQty <= 0 || !adjustmentReason.trim()}
                        className="inline-flex h-11 items-center justify-center rounded-md bg-[#111827] px-4 text-sm font-medium text-white disabled:opacity-40"
                      >
                        Registrar ajuste
                      </button>
                    </div>
                  </Panel>
                )}
              </section>
            )}

            {activeArea === 'historico' && canAccessArea('historico') && (
              <section className="grid gap-5">
                <Panel title="Quem fez cada alteração">
                  <div className="mb-5 grid gap-3 sm:grid-cols-3">
                    <Metric label="Ações recentes" value={auditEvents.length.toString()} icon={<FileText />} />
                    <Metric
                      label="Pessoas"
                      value={new Set(auditEvents.map((event) => event.userName)).size.toString()}
                      icon={<ShieldCheck />}
                    />
                    <Metric
                      label="Última alteração"
                      value={auditEvents[0] ? formatDateTime(auditEvents[0].createdAt) : 'Nenhuma'}
                      icon={<RefreshCw />}
                    />
                  </div>

                  <div className="grid gap-3">
                    {auditEvents.length ? (
                      auditEvents.map((event) => (
                        <RecordRow
                          key={event.id}
                          badge={auditActionLabels[event.action]}
                          title={`${auditEntityLabels[event.entityType] ?? 'Registro'} · ${event.recordId}`}
                          detail={`${event.userName} · ${formatDateTime(event.createdAt)}`}
                          value={event.version ? `Versão ${event.version}` : 'Registro excluído'}
                        />
                      ))
                    ) : (
                      <EmptyLine text="As próximas inclusões, alterações e exclusões aparecerão aqui com o nome da pessoa responsável." />
                    )}
                  </div>
                </Panel>
              </section>
            )}

            {activeArea === 'financeiro' && (
              <section className="grid gap-5">
                <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm lg:flex-row lg:items-end lg:justify-between">
                  <MobileViewSelect
                    label="Área do financeiro"
                    value={financeView}
                    options={[
                      ['resumo', 'Visão geral'],
                      ['resultados', 'Pedidos e produtos'],
                      ['caixa', 'Fluxo de caixa'],
                      ['lancamentos', 'Lançamentos'],
                    ]}
                    onChange={(value) => setFinanceView(value as FinanceView)}
                  />
                  <nav
                    aria-label="Áreas do financeiro"
                    className="hidden gap-2 sm:flex sm:flex-wrap"
                  >
                    {([
                      ['resumo', 'Visão geral'],
                      ['resultados', 'Pedidos e produtos'],
                      ['caixa', 'Fluxo de caixa'],
                      ['lancamentos', 'Lançamentos'],
                    ] as [FinanceView, string][]).map(([view, label]) => (
                      <button
                        key={view}
                        type="button"
                        onClick={() => setFinanceView(view)}
                        className={`min-h-10 shrink-0 rounded-md border px-3 text-sm font-medium transition ${
                          financeView === view
                            ? 'border-[#312e81] bg-[#312e81] text-white'
                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-white'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </nav>
                  <label className="grid gap-1.5 sm:w-48">
                    <FieldLabel>Mês analisado</FieldLabel>
                    <input
                      type="month"
                      value={financeMonth}
                      onChange={(event) => setFinanceMonth(event.target.value || currentMonthValue())}
                      className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#312e81]"
                    />
                  </label>
                </div>

                {financeView === 'resumo' && (
                  <>
                    <div className="grid grid-cols-2 gap-2 sm:gap-3 xl:grid-cols-4">
                      <Metric label="Recebido no mês" value={money(financeSummary.monthReceivedTotal)} icon={<Banknote />} />
                      <Metric label="Valores a receber" value={money(financeSummary.receivableSalesTotal)} icon={<ReceiptText />} />
                      <Metric label="Contas a pagar" value={money(financeSummary.accountsPayableTotal)} icon={<WalletCards />} />
                      <Metric
                        label={financeSummary.allMonthCostsRealized ? 'Resultado real do mês' : 'Resultado atualizado'}
                        value={money(financeSummary.monthRealProfit)}
                        icon={<Calculator />}
                      />
                    </div>

                    {(financeSummary.overdueReceivables.length > 0 ||
                      financeSummary.overduePayables.length > 0 ||
                      financeSummary.monthOrdersAwaitingRealizedCost > 0) && (
                      <Panel title="Precisa de atenção">
                        <div className="grid gap-3 md:grid-cols-3">
                          <FinanceAttention
                            label="Recebimentos vencidos"
                            value={financeSummary.overdueReceivables.length}
                            detail="Valores de clientes que passaram do vencimento."
                            tone={financeSummary.overdueReceivables.length ? 'rose' : 'neutral'}
                          />
                          <FinanceAttention
                            label="Contas vencidas"
                            value={financeSummary.overduePayables.length}
                            detail="Pagamentos que precisam ser regularizados."
                            tone={financeSummary.overduePayables.length ? 'rose' : 'neutral'}
                          />
                          <FinanceAttention
                            label="Custos ainda estimados"
                            value={financeSummary.monthOrdersAwaitingRealizedCost}
                            detail="Pedidos sem produção ou entrega suficiente para formar o custo real."
                            tone={financeSummary.monthOrdersAwaitingRealizedCost ? 'amber' : 'neutral'}
                          />
                        </div>
                      </Panel>
                    )}

                    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,.85fr)]">
                      <Panel title="Resultado do mês">
                        <div className="grid gap-2">
                          <RecordRow badge="Receita" title="Vendas do período" detail="Pedidos considerados no resultado" value={money(financeSummary.monthRevenue)} />
                          <RecordRow badge="Custo" title="Matéria-prima utilizada" detail={`Previsto: ${money(financeSummary.monthEstimatedCost)}`} value={`-${money(financeSummary.monthRealizedCost)}`} />
                          <RecordRow badge="Variável" title="Impostos" detail="Conforme o percentual salvo em cada pedido" value={`-${money(financeSummary.monthTaxes)}`} />
                          <RecordRow badge="Variável" title="Comissões" detail="Calculadas sobre as vendas do período" value={`-${money(financeSummary.monthCommissions)}`} />
                          <RecordRow badge="Fixo" title="Despesas fixas" detail="Usa lançamentos pagos; sem lançamentos, usa o rateio configurado" value={`-${money(financeSummary.monthFixedCost)}`} />
                          <div className={`mt-2 flex flex-col justify-between gap-2 rounded-md border p-4 sm:flex-row sm:items-center ${
                            financeSummary.monthRealProfit >= 0
                              ? 'border-emerald-200 bg-emerald-50'
                              : 'border-rose-200 bg-rose-50'
                          }`}>
                            <div>
                              <strong>
                                {financeSummary.allMonthCostsRealized
                                  ? 'Resultado real'
                                  : 'Resultado atualizado'}
                              </strong>
                              <p className="text-sm text-slate-500">
                                {financeSummary.monthOrdersAwaitingRealizedCost
                                  ? `${financeSummary.monthOrdersAwaitingRealizedCost} pedido(s) ainda usam custo estimado. `
                                  : ''}
                                Estimativa original: {money(financeSummary.monthEstimatedProfit)}
                              </p>
                            </div>
                            <strong className="text-xl">{money(financeSummary.monthRealProfit)}</strong>
                          </div>
                        </div>
                      </Panel>

                      <Panel title="Caixa do mês">
                        <div className="grid gap-3">
                          <Metric label="Entradas realizadas" value={money(financeSummary.monthReceivedTotal)} icon={<Banknote />} />
                          <Metric label="Saídas realizadas" value={money(financeSummary.monthPaidTotal)} icon={<WalletCards />} />
                          <Metric label="Saldo do caixa" value={money(financeSummary.monthCashBalance)} icon={<Calculator />} />
                          <button
                            type="button"
                            onClick={() => setFinanceView('caixa')}
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800"
                          >
                            Conferir movimentações
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        </div>
                      </Panel>
                    </div>

                    <div className="grid gap-5 xl:grid-cols-2">
                      <Panel title="Valores a receber">
                        <div className="grid gap-3">
                          {financeSummary.receivableSales.length ? (
                            financeSummary.receivableSales.map((entry) => {
                              const dueStatus = financeDueStatus(entry)
                              return (
                              <div key={entry.id} className="flex flex-col justify-between gap-3 rounded-md border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center">
                                <div>
                                  <StatusBadge tone={dueStatus.tone}>{dueStatus.label}</StatusBadge>
                                  <p className="mt-2 font-medium">{entry.description}</p>
                                  <p className="text-sm text-slate-500">{entry.source} · {entry.dueDate ? formatDate(entry.dueDate) : 'Sem vencimento'}</p>
                                </div>
                                <div className="grid gap-2 sm:justify-items-end">
                                  <strong>{money(entry.value)}</strong>
                                  <button type="button" onClick={() => updateFinancePaid(entry.id, true)} className="h-9 rounded-md bg-[#111827] px-3 text-xs font-medium text-white">
                                    Marcar recebida
                                  </button>
                                </div>
                              </div>
                              )
                            })
                          ) : (
                            <EmptyLine text="Nenhum valor pendente de recebimento." />
                          )}
                        </div>
                      </Panel>

                      <Panel title="Contas a pagar">
                        <div className="grid gap-3">
                          {financeSummary.accountsPayable.filter((entry) => !entry.paid).length ? (
                            financeSummary.accountsPayable.filter((entry) => !entry.paid).map((entry) => {
                              const dueStatus = financeDueStatus(entry)
                              return (
                              <div key={entry.id} className="flex flex-col justify-between gap-3 rounded-md border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center">
                                <div>
                                  <StatusBadge tone={dueStatus.tone}>{dueStatus.label}</StatusBadge>
                                  <p className="mt-2 font-medium">{entry.description}</p>
                                  <p className="text-sm text-slate-500">{entry.dueDate ? `Vence em ${formatDate(entry.dueDate)}` : 'Sem vencimento'} · {entry.source}</p>
                                </div>
                                <div className="grid gap-2 sm:justify-items-end">
                                  <strong>{money(entry.value)}</strong>
                                  <button type="button" onClick={() => updateFinancePaid(entry.id, true)} className="h-9 rounded-md bg-[#111827] px-3 text-xs font-medium text-white">
                                    Marcar paga
                                  </button>
                                </div>
                              </div>
                              )
                            })
                          ) : (
                            <EmptyLine text="Nenhuma conta pendente." />
                          )}
                        </div>
                      </Panel>
                    </div>
                  </>
                )}

                {financeView === 'resultados' && (
                  <div className="grid gap-5">
                    <Panel title="Lucro por pedido">
                      <div className="grid gap-3">
                        {financeSummary.orderResults.length ? (
                          financeSummary.orderResults.map((item) => (
                            <article key={item.order.id} className="grid gap-4 rounded-md border border-slate-200 bg-slate-50 p-4">
                              <div className="flex flex-col justify-between gap-2 md:flex-row md:items-start">
                                <div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <StatusBadge tone={item.hasRealizedCost ? 'green' : 'amber'}>
                                      {item.hasRealizedCost ? 'Custo realizado' : 'Aguardando produção/entrega'}
                                    </StatusBadge>
                                    <span className="text-xs text-slate-500">{item.order.status}</span>
                                  </div>
                                  <h3 className="mt-2 font-semibold">{item.order.id} · {item.order.client}</h3>
                                  <p className="text-sm text-slate-500">{productDisplayName(item.product, item.order.variationId)} · {item.order.qty} un</p>
                                </div>
                                <strong className={item.hasRealizedCost && item.realProfit < 0 ? 'text-rose-700' : 'text-emerald-700'}>
                                  {item.hasRealizedCost ? money(item.realProfit) : money(item.estimatedProfit)}
                                </strong>
                              </div>
                              <div className="grid gap-2 text-sm sm:grid-cols-2 xl:grid-cols-5">
                                <FinanceValue label="Venda" value={money(item.revenue)} />
                                <FinanceValue label="Custo estimado" value={money(item.estimatedMaterialCost)} />
                                <FinanceValue label="Custo realizado" value={item.hasRealizedCost ? money(item.realizedMaterialCost) : 'Ainda não formado'} />
                                <FinanceValue label="Lucro estimado" value={money(item.estimatedProfit)} />
                                <FinanceValue label="Lucro real" value={item.hasRealizedCost ? `${money(item.realProfit)} · ${item.realMargin.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%` : 'Aguardando'} />
                              </div>
                              <details className="rounded-md border border-slate-200 bg-white">
                                <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-slate-700">
                                  Ver composição do resultado
                                </summary>
                                <div className="grid gap-2 border-t border-slate-200 p-3 text-sm sm:grid-cols-2 xl:grid-cols-4">
                                  <FinanceValue label="Impostos" value={money(item.taxCost)} />
                                  <FinanceValue label="Comissão" value={money(item.commissionCost)} />
                                  <FinanceValue label="Custos fixos" value={money(item.fixedCostShare)} />
                                  <FinanceValue label="Perdas e defeitos" value={money(item.abnormalLossCost)} />
                                  <FinanceValue
                                    label="Diferença de custo"
                                    value={item.hasRealizedCost ? money(item.costDifference) : 'Aguardando'}
                                  />
                                  <FinanceValue label="Margem prevista" value={`${item.estimatedMargin.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`} />
                                  <FinanceValue
                                    label="Margem realizada"
                                    value={item.hasRealizedCost ? `${item.realMargin.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%` : 'Aguardando'}
                                  />
                                </div>
                              </details>
                            </article>
                          ))
                        ) : (
                          <EmptyLine text="Nenhum pedido confirmado para analisar." />
                        )}
                      </div>
                    </Panel>

                    <Panel title="Produtos que mais dão resultado">
                      <div className="grid gap-3">
                        {financeSummary.productResults.length ? (
                          financeSummary.productResults.map((item) => (
                            <RecordRow
                              key={item.key}
                              badge={`${item.orders} pedido(s)`}
                              title={productDisplayName(item.product, item.variationId)}
                              detail={`${item.qty} un vendidas · Receita ${money(item.revenue)} · ${item.realizedQty} un com custo real (${item.realizedOrders}/${item.orders} pedidos)`}
                              value={
                                item.realizedOrders
                                  ? `${money(item.realProfit)} · ${((item.realProfit / item.realizedRevenue) * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}% real`
                                  : `Prev. ${money(item.estimatedProfit)}`
                              }
                            />
                          ))
                        ) : (
                          <EmptyLine text="Os produtos aparecerão aqui após os primeiros pedidos." />
                        )}
                      </div>
                    </Panel>
                  </div>
                )}

                {financeView === 'caixa' && (
                  <div className="grid gap-5">
                    <div className="grid gap-3 sm:grid-cols-3">
                      <Metric label="Entradas recebidas" value={money(financeSummary.monthReceivedTotal)} icon={<Banknote />} />
                      <Metric label="Saídas pagas" value={money(financeSummary.monthPaidTotal)} icon={<WalletCards />} />
                      <Metric label="Saldo realizado" value={money(financeSummary.monthCashBalance)} icon={<Calculator />} />
                    </div>
                    <Panel title="Movimentações do mês">
                      <div className="grid gap-3">
                        {financeSummary.monthEntries.length ? (
                          financeSummary.monthEntries.map((entry) => (
                            <div key={entry.id} className="flex flex-col justify-between gap-3 rounded-md border border-slate-200 p-4 sm:flex-row sm:items-center">
                              <div>
                                <div className="flex flex-wrap gap-2">
                                  <StatusBadge tone={entry.paid ? 'green' : 'amber'}>{entry.paid ? 'Realizado' : 'Pendente'}</StatusBadge>
                                  <StatusBadge>{entry.category}</StatusBadge>
                                </div>
                                <p className="mt-2 font-medium">{entry.description}</p>
                                <p className="text-sm text-slate-500">{formatDate(financeEntryDate(entry))} · {entry.source} · Por: {entry.createdBy ?? 'Sistema'}</p>
                              </div>
                              <strong className={entry.kind === 'Saída' ? 'text-rose-700' : 'text-emerald-700'}>
                                {entry.kind === 'Saída' ? '-' : '+'}{money(entry.value)}
                              </strong>
                            </div>
                          ))
                        ) : (
                          <EmptyLine text="Nenhuma movimentação registrada neste mês." />
                        )}
                      </div>
                    </Panel>
                  </div>
                )}

                {financeView === 'lancamentos' && (
                  <div className="grid gap-5 xl:grid-cols-[minmax(300px,380px)_minmax(0,1fr)]">
                    <Panel title="Novo lançamento">
                      <div className="grid gap-4">
                        <label className="grid gap-2">
                          <FieldLabel>Categoria</FieldLabel>
                          <select
                            value={financeCategory}
                            onChange={(event) => {
                              const category = event.target.value as FinanceCategory
                              setFinanceCategory(category)
                              setFinanceKind(category === 'Venda recebida' ? 'Entrada' : 'Saída')
                              setFinancePaid(category !== 'Conta a pagar')
                            }}
                            className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none"
                          >
                            <option>Venda recebida</option>
                            <option>Conta a pagar</option>
                            <option>Compra de matéria-prima</option>
                            <option>Despesa fixa</option>
                            <option>Comissão</option>
                            <option>Outro</option>
                          </select>
                        </label>
                        <label className="grid gap-2">
                          <FieldLabel>Entrada ou saída</FieldLabel>
                          <select value={financeKind} onChange={(event) => setFinanceKind(event.target.value as CashKind)} className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none">
                            <option>Entrada</option>
                            <option>Saída</option>
                          </select>
                        </label>
                        <SoftInput label="Descrição" value={financeDescription} onChange={setFinanceDescription} />
                        <SoftInput label="Vencimento / data" value={financeDueDate} onChange={setFinanceDueDate} />
                        <SoftNumber label="Valor" value={financeValue} onChange={setFinanceValue} />
                        <label className="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm">
                          <input type="checkbox" checked={financePaid} onChange={(event) => setFinancePaid(event.target.checked)} className="h-4 w-4 accent-[#3730a3]" />
                          Já foi pago ou recebido
                        </label>
                        <button type="button" onClick={addFinanceEntry} className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#111827] px-4 text-sm font-medium text-white">
                          Registrar lançamento
                        </button>
                      </div>
                    </Panel>

                    <Panel title="Todos os lançamentos">
                      <div className="grid gap-3">
                        {state.cashEntries.length ? (
                          state.cashEntries.map((entry) => (
                            <div key={entry.id} className="flex flex-col justify-between gap-3 rounded-md border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center">
                              <div>
                                <div className="flex flex-wrap gap-2">
                                  <StatusBadge tone={entry.paid ? 'green' : 'amber'}>{entry.paid ? 'Realizado' : 'Pendente'}</StatusBadge>
                                  <StatusBadge>{entry.category}</StatusBadge>
                                </div>
                                <p className="mt-2 font-medium">{entry.description}</p>
                                <p className="text-sm text-slate-500">{entry.dueDate ? formatDate(entry.dueDate) : 'Sem data'} · {entry.source} · Por: {entry.createdBy ?? 'Sistema'}</p>
                              </div>
                              <div className="grid gap-2 md:justify-items-end">
                                <strong>{entry.kind === 'Saída' ? '-' : ''}{money(entry.value)}</strong>
                                <button type="button" onClick={() => updateFinancePaid(entry.id, !entry.paid)} className="h-9 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium">
                                  {entry.paid ? 'Voltar pendente' : entry.kind === 'Entrada' ? 'Marcar recebida' : 'Marcar paga'}
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <EmptyLine text="Nenhum lançamento financeiro registrado." />
                        )}
                      </div>
                    </Panel>
                  </div>
                )}
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

function MobileSummaryPanel({
  title,
  actionLabel,
  onAction,
  children,
}: {
  title: string
  actionLabel?: string
  onAction?: () => void
  children: ReactNode
}) {
  return (
    <section className="grid gap-2.5 rounded-md border border-[#d1d5db] bg-white p-3 shadow-[0_8px_18px_rgba(49,35,30,0.035)]">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-black/48">{title}</h3>
        {actionLabel && onAction && (
          <button
            type="button"
            onClick={onAction}
            className="text-xs font-semibold text-[#3730a3]"
          >
            {actionLabel}
          </button>
        )}
      </div>
      <div className="grid gap-2">{children}</div>
    </section>
  )
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="min-w-0 rounded-lg border border-[#e5e7eb] bg-white p-5 shadow-sm md:p-6">
      <h2 className="mb-5 text-[1.08rem] font-semibold leading-tight tracking-tight text-slate-950 md:text-[1.18rem]">{title}</h2>
      {children}
    </section>
  )
}

function FinanceValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-md border border-slate-200 bg-white p-3">
      <span className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
        {label}
      </span>
      <strong className="mt-1 block break-words text-sm leading-5 text-slate-900">{value}</strong>
    </div>
  )
}

function FinanceAttention({
  label,
  value,
  detail,
  tone,
}: {
  label: string
  value: number
  detail: string
  tone: 'neutral' | 'amber' | 'rose'
}) {
  const toneClass = {
    neutral: 'border-slate-200 bg-slate-50',
    amber: 'border-amber-200 bg-amber-50',
    rose: 'border-rose-200 bg-rose-50',
  }[tone]

  return (
    <div className={`min-w-0 rounded-md border p-4 ${toneClass}`}>
      <span className="block text-xs font-semibold uppercase tracking-[0.06em] text-slate-500">
        {label}
      </span>
      <strong className="mt-2 block text-2xl text-slate-950">{value}</strong>
      <p className="mt-1 text-sm leading-5 text-slate-600">{detail}</p>
    </div>
  )
}

function PocketAction({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-10 items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-center text-sm font-medium text-slate-800 transition hover:bg-slate-50"
    >
      {label}
    </button>
  )
}

function PocketMetric({
  label,
  value,
  detail,
  tone = 'neutral',
}: {
  label: string
  value: string
  detail: string
  tone?: 'neutral' | 'green' | 'blue' | 'amber' | 'rose'
}) {
  const toneClass = {
    neutral: 'border-slate-200 border-l-slate-400 bg-white',
    green: 'border-slate-200 border-l-emerald-600 bg-white',
    blue: 'border-slate-200 border-l-indigo-600 bg-white',
    amber: 'border-slate-200 border-l-amber-500 bg-white',
    rose: 'border-slate-200 border-l-rose-500 bg-white',
  }[tone]

  return (
    <div className={`min-w-0 rounded-md border border-l-4 p-3 shadow-sm ${toneClass}`}>
      <span className="block text-[11px] font-semibold uppercase leading-tight tracking-[0.06em] text-slate-400">{label}</span>
      <strong className="mt-1.5 block break-words text-xl font-semibold leading-tight text-slate-950">{value}</strong>
      <span className="mt-1.5 block text-xs leading-4 text-slate-500">{detail}</span>
    </div>
  )
}

function ModuleTile({
  title,
  detail,
  badge,
  icon,
  tone,
  onClick,
}: {
  title: string
  detail: string
  badge: string
  icon: ReactNode
  tone: 'dark' | 'rose' | 'green' | 'blue' | 'amber' | 'neutral'
  onClick: () => void
}) {
  const toneClass = {
    dark: 'border-[#312e81] bg-[#312e81] text-white shadow-sm',
    rose: 'border-slate-200 bg-white text-slate-950',
    green: 'border-slate-200 bg-white text-slate-950',
    blue: 'border-slate-200 bg-white text-slate-950',
    amber: 'border-slate-200 bg-white text-slate-950',
    neutral: 'border-slate-200 bg-white text-slate-950',
  }[tone]
  const mutedClass = tone === 'dark' ? 'text-white/70' : 'text-slate-500'
  const iconClass = tone === 'dark' ? 'bg-white/12 text-white' : 'bg-slate-100 text-[#312e81]'
  const badgeClass = tone === 'dark' ? 'bg-white/12 text-white/82' : 'bg-slate-100 text-slate-600'

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group grid min-h-[126px] grid-rows-[auto_1fr_auto] rounded-md border p-3 text-left transition hover:-translate-y-0.5 hover:shadow-md sm:min-h-[150px] sm:p-4 ${toneClass}`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-md sm:h-11 sm:w-11 [&_svg]:h-4 [&_svg]:w-4 sm:[&_svg]:h-5 sm:[&_svg]:w-5 ${iconClass}`}>
          {icon}
        </span>
        <span className={`max-w-[78px] rounded-full px-1.5 py-1 text-right text-[10px] font-medium leading-3 sm:max-w-none sm:px-2 sm:text-xs ${badgeClass}`}>{badge}</span>
      </div>
      <div className="mt-3 min-w-0 sm:mt-4">
        <strong className="block text-sm leading-5 sm:text-lg sm:leading-6">{title}</strong>
        <span className={`mt-2 hidden text-sm leading-5 sm:block ${mutedClass}`}>{detail}</span>
      </div>
      <span className={`mt-2 inline-flex items-center gap-1 text-xs font-medium sm:mt-4 sm:gap-2 sm:text-sm ${tone === 'dark' ? 'text-white' : 'text-[#312e81]'}`}>
        Abrir
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
      </span>
    </button>
  )
}

function MobileViewSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: readonly (readonly [string, string])[]
  onChange: (value: string) => void
}) {
  return (
    <label className="grid min-w-0 gap-1.5 sm:hidden">
      <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
        {label}
      </span>
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 min-w-0 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-900 outline-none focus:border-[#312e81] focus:ring-2 focus:ring-[#312e81]/15"
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  )
}

function ModuleSectionTabs({
  moduleTitle,
  items,
  activeArea,
  onSelect,
}: {
  moduleTitle: string
  items: {
    key: Area
    title: string
    detail: string
    badge: string
    icon: ReactNode
    primary?: boolean
  }[]
  activeArea: Area
  onSelect: (area: Area) => void
}) {
  return (
    <section className="mb-5 rounded-lg border border-slate-200 bg-white p-3 shadow-sm md:p-4">
      <div className="mb-2 flex items-center justify-between gap-3 sm:mb-3">
        <div>
          <span className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
            Acesso rápido
          </span>
          <strong className="mt-0.5 block text-sm text-slate-800">{moduleTitle}</strong>
        </div>
        <span className="hidden text-xs text-slate-400 sm:block">Troque de tela sem voltar ao menu</span>
      </div>
      <MobileViewSelect
        label={`Tela de ${moduleTitle}`}
        value={activeArea}
        options={items.map((item) => [item.key, item.title] as const)}
        onChange={(value) => onSelect(value as Area)}
      />
      <nav
        aria-label={`Opções de ${moduleTitle}`}
        className="hidden gap-2 sm:grid sm:grid-cols-[repeat(auto-fit,minmax(140px,1fr))]"
      >
        {items.map((item) => {
          const isActive = item.key === activeArea
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onSelect(item.key)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex min-h-12 min-w-[152px] items-center gap-2 rounded-md border px-3 py-2 text-left text-xs font-medium leading-4 transition sm:min-w-0 sm:text-sm ${
                isActive
                  ? 'border-[#312e81] bg-[#312e81] text-white shadow-sm'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white hover:text-slate-950'
              }`}
            >
              <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-md [&_svg]:h-4 [&_svg]:w-4 ${
                isActive ? 'bg-white/12' : 'bg-white text-[#312e81]'
              }`}>
                {item.icon}
              </span>
              <span>{item.title}</span>
            </button>
          )
        })}
      </nav>
    </section>
  )
}

function ModuleHub({
  eyebrow,
  title,
  description,
  items,
  onBack,
  onOpen,
}: {
  eyebrow: string
  title: string
  description: string
  items: {
    key: Area
    title: string
    detail: string
    badge: string
    icon: ReactNode
    primary?: boolean
  }[]
  onBack: () => void
  onOpen: (area: Area) => void
}) {
  return (
    <section className="grid gap-5">
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm md:p-7">
        <button
          type="button"
          onClick={onBack}
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-950"
        >
          <ChevronLeft className="h-4 w-4" />
          Todos os módulos
        </button>
        <span className="block text-xs font-semibold uppercase tracking-[0.1em] text-slate-400">{eyebrow}</span>
        <div className="mt-2 flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <h2 className="text-2xl font-semibold leading-tight text-slate-950 md:text-3xl">{title}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{description}</p>
          </div>
          <span className="text-sm text-slate-400">{items.length} opções</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {items.map((item, index) => (
          <button
            key={item.key}
            type="button"
            onClick={() => onOpen(item.key)}
            className={`group relative grid min-h-[138px] grid-cols-1 grid-rows-[40px_1fr] gap-2 rounded-lg border p-3 text-left transition hover:-translate-y-0.5 hover:shadow-md sm:min-h-[170px] sm:grid-cols-[48px_minmax(0,1fr)] sm:grid-rows-none sm:gap-4 sm:p-5 ${
              item.primary
                ? 'border-[#312e81] bg-[#312e81] text-white'
                : 'border-slate-200 bg-white text-slate-950 hover:border-slate-300'
            } ${items.length % 2 === 1 && index === items.length - 1 ? 'sm:col-span-2' : ''}`}
          >
            <span className={`grid h-10 w-10 place-items-center rounded-md sm:h-12 sm:w-12 [&_svg]:h-4 [&_svg]:w-4 sm:[&_svg]:h-5 sm:[&_svg]:w-5 ${
              item.primary ? 'bg-white/12 text-white' : 'bg-slate-100 text-[#312e81]'
            }`}>
              {item.icon}
            </span>
            <span className="min-w-0">
              <strong className="block pr-1 text-sm leading-5 sm:pr-20 sm:text-lg sm:leading-6">{item.title}</strong>
              <span className={`mt-2 hidden text-sm leading-5 sm:block ${item.primary ? 'text-white/72' : 'text-slate-500'}`}>
                {item.detail}
              </span>
              <span className={`mt-2 inline-flex items-center gap-1 text-xs font-medium sm:mt-4 sm:gap-2 sm:text-sm ${item.primary ? 'text-white' : 'text-[#312e81]'}`}>
                Abrir
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </span>
            </span>
            <span className={`absolute right-3 top-3 hidden rounded-full px-2 py-1 text-xs font-medium sm:inline-flex ${
              item.primary ? 'bg-white/12 text-white/85' : 'bg-slate-100 text-slate-500'
            }`}>
              {item.badge}
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}

function ProcessStep({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="min-w-0 rounded-md border border-[#e5e7eb] bg-[#ffffff] p-4">
      <strong className="block text-sm text-[#111827]">{title}</strong>
      <span className="mt-2 block text-sm leading-5 text-black/52">{detail}</span>
    </div>
  )
}

function MiniStat({
  label,
  value,
  tone = 'neutral',
}: {
  label: string
  value: string
  tone?: 'neutral' | 'green' | 'rose'
}) {
  const toneClass = {
    neutral: 'text-[#111827]',
    green: 'text-emerald-700',
    rose: 'text-rose-700',
  }[tone]

  return (
    <div className="rounded-md border border-[#e5e7eb] bg-[#ffffff] px-3 py-2">
      <span className="block text-xs text-black/45">{label}</span>
      <strong className={`mt-1 block text-sm ${toneClass}`}>{value}</strong>
    </div>
  )
}

function Metric({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="min-w-0 rounded-lg border border-[#e5e7eb] bg-[#ffffff] p-3 shadow-[0_8px_24px_rgba(49,35,30,0.035)] sm:p-4">
      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-md bg-[#eef2ff] text-[#3730a3] sm:mb-4 sm:h-9 sm:w-9 [&_svg]:h-4 [&_svg]:w-4 sm:[&_svg]:h-5 sm:[&_svg]:w-5">
        {icon}
      </div>
      <span className="block text-xs leading-4 text-black/50 sm:text-sm">{label}</span>
      <strong className="mt-1 block break-words text-base font-semibold leading-tight sm:text-xl">{value}</strong>
    </div>
  )
}

function DashboardBlock({
  title,
  value,
  icon,
  children,
}: {
  title: string
  value: string
  icon: ReactNode
  children: ReactNode
}) {
  return (
    <section className="min-w-0 rounded-lg border border-[#e5e7eb] bg-[#ffffff] p-5 shadow-[0_10px_30px_rgba(49,35,30,0.035)]">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <span className="text-sm text-black/50">{title}</span>
          <strong className="mt-1 block text-3xl font-semibold">{value}</strong>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#eef2ff] text-[#3730a3] [&_svg]:h-5 [&_svg]:w-5">
          {icon}
        </span>
      </div>
      {children}
    </section>
  )
}

function MiniRow({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-md border border-[#e5e7eb] bg-[#ffffff] px-3 py-3">
      <strong className="block text-sm">{title}</strong>
      <span className="mt-1 block text-sm leading-5 text-black/52">{detail}</span>
    </div>
  )
}

function SmartAlertList({ alerts, limit }: { alerts: SmartAlert[]; limit?: number }) {
  const visibleAlerts = typeof limit === 'number' ? alerts.slice(0, limit) : alerts

  if (!visibleAlerts.length) {
    return <EmptyLine text="Nenhum alerta importante agora." />
  }

  return (
    <div className="grid gap-3">
      {visibleAlerts.map((alert) => (
        <div
          key={alert.id}
          className="flex flex-col justify-between gap-3 rounded-md border border-[#e5e7eb] bg-[#ffffff] p-4 md:flex-row md:items-center"
        >
          <div className="min-w-0">
            <StatusBadge tone={alert.tone}>{alert.badge}</StatusBadge>
            <strong className="mt-3 block text-sm">{alert.title}</strong>
            <p className="mt-1 text-sm leading-5 text-black/55">{alert.detail}</p>
          </div>
          <button
            type="button"
            onClick={alert.onClick}
            className="inline-flex h-10 shrink-0 items-center justify-center rounded-md bg-[#111827] px-4 text-sm font-medium text-white transition hover:bg-[#3730a3]"
          >
            {alert.actionLabel}
          </button>
        </div>
      ))}
    </div>
  )
}

function OrderTimeline({ items }: { items: OrderTimelineItem[] }) {
  const statusClass: Record<TimelineStatus, string> = {
    done: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    current: 'border-[#c7d2fe] bg-[#eef2ff] text-[#3730a3]',
    pending: 'border-[#e5e7eb] bg-[#ffffff] text-black/42',
  }

  const dotClass: Record<TimelineStatus, string> = {
    done: 'bg-emerald-600',
    current: 'bg-[#3730a3]',
    pending: 'bg-[#d1d5db]',
  }

  return (
    <div className="grid gap-2">
      {items.map((item, index) => (
        <div key={`${item.label}-${index}`} className={`rounded-md border px-3 py-3 ${statusClass[item.status]}`}>
          <div className="flex items-start gap-3">
            <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${dotClass[item.status]}`} />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <strong className="text-sm">{item.label}</strong>
                {item.date && <span className="text-xs opacity-70">{formatDate(item.date)}</span>}
              </div>
              <span className="mt-1 block text-sm leading-5 opacity-80">{item.detail}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyLine({ text }: { text: string }) {
  return (
    <div className="rounded-md border border-dashed border-[#d1d5db] bg-[#ffffff] px-3 py-4 text-sm text-black/48">
      {text}
    </div>
  )
}

function DashboardAction({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-10 items-center justify-between rounded-md border border-[#e5e7eb] bg-[#ffffff] px-3 text-left text-sm font-medium transition hover:border-[#9ca3af] hover:bg-white"
    >
      {label}
      <ArrowRight className="h-4 w-4 text-black/40" />
    </button>
  )
}

function StepButton({
  number,
  label,
  active,
  done,
  onClick,
}: {
  number: number
  label: string
  active: boolean
  done: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-12 items-center gap-3 rounded-md border px-3 text-left text-sm transition ${
        active
          ? 'border-[#818cf8] bg-[#eef2ff] text-[#1f2937]'
          : done
            ? 'border-[#e5e7eb] bg-[#ffffff] text-black/70'
            : 'border-[#e5e7eb] bg-[#ffffff] text-black/55'
      }`}
    >
      <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-semibold ${
        active || done ? 'bg-[#111827] text-white' : 'bg-[#f3f4f6] text-black/55'
      }`}>
        {done ? 'OK' : number}
      </span>
      <span className="font-medium">{label}</span>
    </button>
  )
}

function FlowButtons({
  onBack,
  onNext,
  nextLabel,
}: {
  onBack: (() => void) | null
  onNext: () => void
  nextLabel: string
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-[auto_1fr]">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-11 items-center justify-center rounded-md border border-[#d1d5db] bg-white px-4 text-sm font-medium"
        >
          Voltar
        </button>
      )}
      <button
        type="button"
        onClick={onNext}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#111827] px-4 text-sm font-medium text-white"
      >
        {nextLabel}
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  )
}

function QuickTaskButton({
  icon,
  title,
  detail,
  onClick,
}: {
  icon: ReactNode
  title: string
  detail: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex min-h-[104px] items-start gap-4 rounded-lg border border-[#e5e7eb] bg-[#ffffff] p-4 text-left transition hover:-translate-y-0.5 hover:border-[#9ca3af] hover:bg-[#ffffff] hover:shadow-[0_12px_28px_rgba(49,35,30,0.065)]"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-[#111827] text-white transition group-hover:bg-[#3730a3] [&_svg]:h-5 [&_svg]:w-5">
        {icon}
      </span>
      <span className="min-w-0">
        <strong className="block text-lg font-medium">{title}</strong>
        <span className="mt-1 block text-sm leading-5 text-black/52">{detail}</span>
        <span className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-[#3730a3]">
          Abrir
          <ArrowRight className="h-4 w-4" />
        </span>
      </span>
    </button>
  )
}

function PricePanel({
  cost,
  price,
  tax,
  commission,
  fixedCost,
  profit,
  onChange,
}: {
  cost: number
  price: number
  tax: number
  commission: number
  fixedCost: number
  profit: number
  onChange: (field: 'tax' | 'commission' | 'fixedCost' | 'profit', value: number) => void
}) {
  const minimumPrice = idealPrice(cost, tax, commission, fixedCost, 0)
  const allocatedPercent = tax + commission + fixedCost + profit
  const calculationValid = allocatedPercent < 100

  return (
    <aside className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-indigo-50 text-[#312e81]">
          <Calculator className="h-5 w-5" />
        </div>
        <div>
          <span className="text-sm text-slate-500">Preço automático</span>
          <h2 className="text-lg font-semibold tracking-tight text-slate-950">Preço sugerido</h2>
        </div>
      </div>
      <div className="mt-5 grid gap-4">
        <PriceLine label="Custo da ficha com perdas" value={money(cost)} />
        <PriceLine label="Preço mínimo" value={money(minimumPrice)} />
        <PriceLine label="Preço sugerido" value={calculationValid ? money(price) : 'Revisar percentuais'} featured />
        <PercentControl label="Impostos" value={tax} onChange={(value) => onChange('tax', value)} />
        <PercentControl label="Comissão" value={commission} onChange={(value) => onChange('commission', value)} />
        <PercentControl label="Rateio de custos fixos" value={fixedCost} onChange={(value) => onChange('fixedCost', value)} />
        <PercentControl label="Lucro desejado" value={profit} onChange={(value) => onChange('profit', value)} />
        <div className={`rounded-md border p-3 text-sm leading-5 ${calculationValid ? 'border-slate-200 bg-slate-50 text-slate-600' : 'border-rose-200 bg-rose-50 text-rose-900'}`}>
          {calculationValid
            ? `${allocatedPercent}% do preço está distribuído entre impostos, comissão, custos fixos e lucro.`
            : 'A soma dos percentuais precisa ficar abaixo de 100% para o preço ser calculado.'}
        </div>
      </div>
    </aside>
  )
}

function PriceLine({ label, value, featured = false }: { label: string; value: string; featured?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
      <span className="text-sm text-slate-500">{label}</span>
      <strong className={featured ? 'text-2xl text-[#312e81]' : 'text-lg text-slate-900'}>{value}</strong>
    </div>
  )
}

function PercentControl({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (value: number) => void
}) {
  return (
    <label className="grid gap-2">
      <span className="flex items-center justify-between text-sm text-slate-600">
        {label}
        <strong>{value}%</strong>
      </span>
      <input
        type="range"
        min="0"
        max="60"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="accent-[#312e81]"
      />
    </label>
  )
}

function FieldLabel({ children }: { children: ReactNode }) {
  return <span className="text-xs font-medium text-black/46">{children}</span>
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid min-w-0 gap-2">
      <FieldLabel>{label}</FieldLabel>
      <div className="flex h-11 min-w-0 items-center rounded-md border border-[#e5e7eb] bg-[#f9fafb] px-3 text-sm text-black/68">
        {value}
      </div>
    </div>
  )
}

function SoftInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="grid min-w-0 gap-2">
      <FieldLabel>{label}</FieldLabel>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 min-w-0 rounded-md border border-[#e5e7eb] bg-[#ffffff] px-3 text-sm outline-none transition placeholder:text-black/30 focus:border-[#4f46e5] focus:bg-white"
      />
    </label>
  )
}

function SuggestionInput({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: readonly string[]
  onChange: (value: string) => void
}) {
  const listId = useId()

  return (
    <label className="grid min-w-0 gap-2">
      <FieldLabel>{label}</FieldLabel>
      <input
        list={listId}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Escolha ou digite"
        className="h-11 min-w-0 rounded-md border border-[#e5e7eb] bg-[#ffffff] px-3 text-sm outline-none transition placeholder:text-black/30 focus:border-[#4f46e5] focus:bg-white"
      />
      <datalist id={listId}>
        {options.map((option) => (
          <option key={option} value={option} />
        ))}
      </datalist>
    </label>
  )
}

function UnitInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  const listId = useId()

  return (
    <label className="grid min-w-0 gap-2">
      <FieldLabel>{label}</FieldLabel>
      <input
        list={listId}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Escolha ou digite"
        className="h-11 min-w-0 rounded-md border border-[#e5e7eb] bg-[#ffffff] px-3 text-sm outline-none transition placeholder:text-black/30 focus:border-[#4f46e5] focus:bg-white"
      />
      <datalist id={listId}>
        {measurementUnits.map((unit) => (
          <option key={unit.value} value={unit.value}>
            {unit.label}
          </option>
        ))}
      </datalist>
    </label>
  )
}

function SoftTextarea({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="grid min-w-0 gap-2">
      <FieldLabel>{label}</FieldLabel>
      <textarea
        value={value}
        rows={4}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-28 min-w-0 rounded-md border border-[#e5e7eb] bg-[#ffffff] px-3 py-3 text-sm outline-none transition placeholder:text-black/30 focus:border-[#4f46e5] focus:bg-white"
      />
    </label>
  )
}

function SoftNumber({
  label,
  value,
  step = '1',
  onChange,
}: {
  label: string
  value: number
  step?: string
  onChange: (value: number) => void
}) {
  return (
    <label className="grid min-w-0 gap-2">
      <FieldLabel>{label}</FieldLabel>
      <input
        type="number"
        min="0"
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-11 min-w-0 rounded-md border border-[#e5e7eb] bg-[#ffffff] px-3 text-sm outline-none transition focus:border-[#4f46e5] focus:bg-white"
      />
    </label>
  )
}

function ProductionDecisionPreview({
  order,
  product,
  position,
  qty,
  onQtyChange,
  onClose,
  onConfirm,
}: {
  order: Order
  product?: Product
  position: OrderStockPosition
  qty: number
  onQtyChange: (qty: number) => void
  onClose: () => void
  onConfirm: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/45 p-4 backdrop-blur-sm print:hidden">
      <div className="mx-auto flex max-h-[calc(100vh-2rem)] max-w-3xl flex-col overflow-hidden rounded-lg bg-[#ffffff] shadow-2xl">
        <header className="flex flex-col gap-3 border-b border-[#e5e7eb] px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="text-sm text-black/50">Conferência do PCP</span>
            <h2 className="font-serif text-2xl">Enviar pedido para produção</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-black/10 bg-white"
            aria-label="Fechar conferência de produção"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="grid gap-5 overflow-auto p-5">
          <div className="rounded-md border border-[#e5e7eb] bg-white p-4">
            <div className="flex flex-wrap items-center gap-2">
              <strong>{order.id} · {order.client}</strong>
              <StatusBadge tone="amber">Pedido em análise</StatusBadge>
            </div>
            <p className="mt-2 text-sm leading-6 text-black/58">
              {productDisplayName(product, order.variationId)} · pedido de {order.qty} un · prazo {formatDate(order.dueDate)}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <MiniStat label="Pedido" value={`${order.qty} un`} />
            <MiniStat label="Pronto no estoque" value={`${position.physical} un`} tone={position.physical > 0 ? 'green' : 'neutral'} />
            <MiniStat label="Reservado em pedidos" value={`${position.pending} un`} />
            <MiniStat label="Em produção" value={`${position.producing} un`} tone={position.producing > 0 ? 'blue' : 'neutral'} />
          </div>

          <div className="grid gap-3 rounded-md border border-[#d1d5db] bg-[#ffffff] p-4 md:grid-cols-[1fr_220px] md:items-end">
            <div>
              <FieldLabel>Quantidade que o PCP recomenda produzir</FieldLabel>
              <p className="mt-2 text-sm leading-6 text-black/58">
                Depois de descontar o estoque pronto, os pedidos pendentes e as produções abertas, o sistema sugere produzir{' '}
                <strong>{position.suggestedQty} un</strong>. Você pode ajustar a quantidade antes de gerar a OP.
              </p>
              <p className="mt-2 text-xs leading-5 text-black/42">
                Estoque livre para este pedido: {position.freeForThisOrder} un · saldo após reservas: {position.availableAfterReservations} un.
              </p>
            </div>
            <label className="grid gap-2">
              <FieldLabel>Quantidade da OP</FieldLabel>
              <input
                type="number"
                min={1}
                value={qty}
                onChange={(event) => onQtyChange(Math.max(1, Number(event.target.value)))}
                className="h-11 rounded-md border border-[#d1d5db] bg-white px-3 text-sm outline-none focus:border-[#3730a3]"
              />
            </label>
          </div>

          {qty > order.qty && (
            <div className="rounded-md border border-[#f0c36a] bg-[#fff8e5] p-3 text-sm text-[#6d4b13]">
              A quantidade da OP está maior que o pedido. Use isso apenas se a intenção for produzir sobra para estoque.
            </div>
          )}

          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 items-center justify-center rounded-md border border-[#d1d5db] bg-white px-4 text-sm font-medium"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#111827] px-4 text-sm font-medium text-white"
            >
              Gerar OP com {qty} un
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProductionOrderPreview({
  op,
  state,
  onClose,
  onPrint,
  onDownloadPdf,
}: {
  op: ProductionOrder
  state: AppState
  onClose: () => void
  onPrint: () => void
  onDownloadPdf: () => void
}) {
  const product = state.products.find((item) => item.id === op.productId)
  const order = state.orders.find((item) => item.id === op.orderId)

  if (!product) return null
  const variation = productVariation(product, op.variationId)
  const opDescription = [
    productDisplayName(product, op.variationId),
    variation?.measurements,
    variation?.technicalNotes || product.description,
  ].filter(Boolean).join(' - ')
  const materials = productMaterials(product, op.variationId)
  const missingMaterials = productionOrderMissingMaterials(state, product, op)
  const brandDoc = documentBrand(product.brand, state.company)

  return (
    <div className="fixed inset-0 z-50 bg-black/45 p-4 backdrop-blur-sm print:hidden">
      <div className="mx-auto flex max-h-[calc(100vh-2rem)] max-w-5xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl">
        <header className="flex items-center justify-between gap-4 border-b border-black/10 px-5 py-4">
          <div>
            <span className="text-sm text-black/55">Prévia para conferência</span>
            <h2 className="font-serif text-2xl">Ordem de Produção {numericCode(op.id)}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onDownloadPdf}
              className="inline-flex h-10 items-center gap-2 rounded-md bg-[#111827] px-4 text-sm font-medium text-white"
            >
              <FileText className="h-4 w-4" />
              Baixar PDF
            </button>
            <button
              type="button"
              onClick={onPrint}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-black/10 bg-white px-4 text-sm font-medium"
            >
              <Printer className="h-4 w-4" />
              Imprimir
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-black/10"
              aria-label="Fechar prévia"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>

        <div className="overflow-auto bg-[#f5f5f3] p-5">
          <article className="mx-auto max-w-5xl overflow-hidden rounded-md border border-black/10 bg-white text-[#111] shadow-sm">
            <header className="grid gap-6 border-b-2 border-[#111827] bg-[#f9fafb] p-6 md:grid-cols-[240px_1fr_220px] md:items-center">
              <div className={`flex h-24 items-center justify-center rounded-md border border-black/10 px-5 ${brandDoc.darkLogo ? 'bg-[#111]' : 'bg-white'}`}>
                <img src={brandDoc.logo} alt={brandDoc.name} className="max-h-20 w-auto object-contain" />
              </div>
              <div className="text-center">
                <span className="text-sm uppercase text-black/45">Ordem de Produção</span>
                <h1 className="mt-2 text-3xl font-semibold">{numericCode(op.id)}</h1>
                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  <StatusBadge tone={opStatusTone(op.status)}>{op.status}</StatusBadge>
                  <StatusBadge tone={priorityTone(op.priority)}>Prioridade {op.priority}</StatusBadge>
                </div>
              </div>
              <div className="grid gap-2 text-sm md:text-right">
                <strong>{brandDoc.name}</strong>
                <span>{product.brand}</span>
                <span>{op.origin}</span>
                <span>{order ? `Pedido ${order.id}` : 'Produção para estoque'}</span>
                <span>{state.company.phone}</span>
                <span>{state.company.address}</span>
              </div>
            </header>

            <section className="grid gap-3 border-b border-black/20 px-6 py-4 text-sm md:grid-cols-[1fr_1fr_1fr_1.1fr]">
              <OpField label="Nº da Ordem" value={numericCode(op.id)} />
              <OpField label="Cliente" value={order?.client ?? 'Estoque'} />
              <OpField label="Responsável" value={op.responsible || '-'} />
              <div className="grid gap-1 bg-black/[0.08] p-2">
                <OpField label="Pedido" value={order?.id ?? '-'} plain />
                <OpField label="Início" value={op.startedAt ? formatDate(op.startedAt) : '-'} plain />
                <OpField label="Final" value={op.finishedAt ? formatDate(op.finishedAt) : '-'} plain />
                <OpField label="Prazo" value={order ? formatDate(order.dueDate) : '-'} plain />
              </div>
            </section>

            <section className="grid gap-2 border-b border-black/20 px-6 py-4 text-sm md:grid-cols-[110px_1fr_120px]">
              <OpField label="Código" value={product.code} plain />
              <OpField label="Descrição" value={opDescription} plain />
              <OpField label="Quant." value={`${op.qty}`} plain />
            </section>

            {!!missingMaterials.length && (
              <section className="mx-6 mt-4 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                <strong className="block">Atenção: falta matéria-prima para concluir a OP</strong>
                <div className="mt-2 grid gap-1">
                  {missingMaterials.map((item) => (
                    <span key={item.item}>
                      Falta {item.missing.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} {item.unit} de {item.item}
                    </span>
                  ))}
                </div>
              </section>
            )}

            <section className="px-6 pt-5">
              <div className="grid max-w-3xl grid-cols-[140px_1fr_90px_80px] bg-black/[0.08] px-2 py-2 text-sm font-bold">
                <span>Composição:</span>
                <span></span>
                <span>Quant.:</span>
                <span>Un.:</span>
              </div>
              <div className="max-w-3xl text-sm">
                {materials.map((material) => (
                  <div key={material.id} className="grid grid-cols-[140px_1fr_90px_80px] px-2 py-1">
                    <span>{materialCode(material)}</span>
                    <span>{material.name}</span>
                    <span>{materialPlannedQty(material, op.qty).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}</span>
                    <span>{material.unit.toUpperCase()}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="mx-6 mt-5 min-h-20 text-sm">
              <strong>OBSERVAÇÃO:</strong>
              <p className="mt-2 whitespace-pre-wrap">{op.notes || '-'}</p>
            </section>

            <section className="mx-6 mt-4 text-sm">
              <strong>HISTÓRICO DE LANÇAMENTOS:</strong>
              <div className="mt-3 grid max-w-3xl gap-2">
                {op.launches?.length ? (
                  op.launches.map((launch) => (
                    <div key={launch.id} className="grid grid-cols-[120px_110px_90px_1fr] rounded-md border border-black/10 bg-[#f9fafb] px-3 py-2">
                      <strong>{formatDate(launch.date)}</strong>
                      <span>{launch.type}</span>
                      <span>{launch.qty} un</span>
                      <span>
                        {launch.responsible || '-'}
                        {launch.notes ? ` · ${launch.notes}` : ''}
                      </span>
                    </div>
                  ))
                ) : (
                  <span>Nenhum lançamento registrado.</span>
                )}
              </div>
            </section>

            <footer className="mx-auto my-8 max-w-xs border-t border-black pt-2 text-center text-xs">
              Assinatura
            </footer>
          </article>
        </div>
      </div>
    </div>
  )
}

function ProductionOrderPrint({ op, state }: { op: ProductionOrder; state: AppState }) {
  const product = state.products.find((item) => item.id === op.productId)
  const order = state.orders.find((item) => item.id === op.orderId)

  if (!product) return null
  const variation = productVariation(product, op.variationId)
  const opDescription = [
    productDisplayName(product, op.variationId),
    variation?.measurements,
    variation?.technicalNotes || product.description,
  ].filter(Boolean).join(' - ')
  const materials = productMaterials(product, op.variationId)
  const missingMaterials = productionOrderMissingMaterials(state, product, op)
  const brandDoc = documentBrand(product.brand, state.company)

  return (
    <article className="document-print-sheet op-print-sheet">
      <header style={{ display: 'grid', gridTemplateColumns: '230px 1fr 210px', alignItems: 'center', gap: 22, borderBottom: '2px solid #111', paddingBottom: 14 }}>
        <div style={{ display: 'flex', height: 82, alignItems: 'center', justifyContent: 'center', border: '1px solid #ddd', background: brandDoc.darkLogo ? '#111' : '#fff', padding: '10px 18px' }}>
          <img src={brandDoc.logo} alt={brandDoc.name} style={{ maxHeight: 72, maxWidth: '100%', objectFit: 'contain' }} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 12, letterSpacing: 2, color: '#666' }}>ORDEM DE PRODUÇÃO</div>
          <h1 style={{ margin: '6px 0 8px', fontSize: 26, fontWeight: 700 }}>{numericCode(op.id)}</h1>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, fontSize: 11 }}>
            <span style={{ border: '1px solid #ccc', padding: '3px 7px', borderRadius: 4 }}>{op.status}</span>
            <span style={{ border: '1px solid #ccc', padding: '3px 7px', borderRadius: 4 }}>Prioridade {op.priority}</span>
          </div>
        </div>
        <div style={{ textAlign: 'right', fontSize: 13, lineHeight: 1.6 }}>
          <strong>{brandDoc.name}</strong>
          <div>{product.brand}</div>
          <div>Origem: {op.origin}</div>
          <div>{state.company.phone}</div>
          <div>{state.company.address}</div>
        </div>
      </header>

      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1.1fr', gap: 12, borderBottom: '1px solid #111', padding: '8px 0', fontSize: 13 }}>
        <PrintField label="Nº da Ordem" value={numericCode(op.id)} />
        <PrintField label="Cliente" value={order?.client ?? 'Estoque'} />
        <PrintField label="Responsável" value={op.responsible || '-'} />
        <div style={{ display: 'grid', gap: 4, background: '#e8e8e8', padding: 8 }}>
          <PrintField label="Pedido" value={order?.id ?? '-'} plain />
          <PrintField label="Início" value={op.startedAt ? formatDate(op.startedAt) : '-'} plain />
          <PrintField label="Final" value={op.finishedAt ? formatDate(op.finishedAt) : '-'} plain />
          <PrintField label="Prazo" value={order ? formatDate(order.dueDate) : '-'} plain />
        </div>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: '100px 1fr 90px', gap: 10, borderBottom: '1px solid #111', padding: '8px 0', fontSize: 13 }}>
        <PrintField label="Código" value={product.code} plain />
        <PrintField label="Descrição" value={opDescription} plain />
        <PrintField label="Quant." value={`${op.qty}`} plain />
      </section>

      {!!missingMaterials.length && (
        <section style={{ marginTop: 10, border: '1px solid #f0c36a', background: '#fff8e5', padding: 10, fontSize: 12 }}>
          <strong>Atenção: falta matéria-prima para concluir a OP</strong>
          <div style={{ marginTop: 5 }}>
            {missingMaterials.map((item) => (
              <div key={item.item}>
                Falta {item.missing.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} {item.unit} de {item.item}
              </div>
            ))}
          </div>
        </section>
      )}

      <section style={{ paddingTop: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr 80px 70px', maxWidth: 720, background: '#e8e8e8', padding: '6px 8px', fontSize: 13, fontWeight: 700 }}>
          <span>Composição:</span>
          <span></span>
          <span>Quant.:</span>
          <span>Un.:</span>
        </div>
        <div style={{ maxWidth: 720, fontSize: 13 }}>
          {materials.map((material) => (
            <div key={material.id} style={{ display: 'grid', gridTemplateColumns: '130px 1fr 80px 70px', padding: '4px 8px' }}>
              <span>{materialCode(material)}</span>
              <span>{material.name}</span>
              <span>{materialPlannedQty(material, op.qty).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}</span>
              <span>{material.unit.toUpperCase()}</span>
            </div>
          ))}
        </div>
      </section>

      <section style={{ minHeight: 70, marginTop: 10, fontSize: 13 }}>
        <strong>OBSERVAÇÃO:</strong>
        <p style={{ margin: '8px 0 0', whiteSpace: 'pre-wrap' }}>{op.notes || '-'}</p>
      </section>

      <section style={{ marginTop: 12, fontSize: 13 }}>
        <strong>HISTÓRICO DE LANÇAMENTOS:</strong>
        <div style={{ maxWidth: 720, marginTop: 8, display: 'grid', gap: 5 }}>
          {op.launches?.length ? (
            op.launches.map((launch) => (
              <div key={launch.id} style={{ display: 'grid', gridTemplateColumns: '120px 100px 80px 1fr', border: '1px solid #ddd', padding: '5px 8px' }}>
                <span>{formatDate(launch.date)}</span>
                <span>{launch.type}</span>
                <span>{launch.qty} un</span>
                <span>
                  {launch.responsible || '-'}
                  {launch.notes ? ` · ${launch.notes}` : ''}
                </span>
              </div>
            ))
          ) : (
            <span>Nenhum lançamento registrado.</span>
          )}
        </div>
      </section>

      <footer style={{ width: 320, margin: '34px auto 0', borderTop: '1px solid #111', paddingTop: 8, textAlign: 'center', fontSize: 12 }}>
        Assinatura
      </footer>
    </article>
  )
}

function OrderCancellationDialog({
  order,
  reason,
  onReasonChange,
  onClose,
  onConfirm,
}: {
  order: Order
  reason: string
  onReasonChange: (value: string) => void
  onClose: () => void
  onConfirm: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4 backdrop-blur-sm print:hidden">
      <div className="w-full max-w-lg rounded-lg bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-sm text-black/50">Cancelamento com histórico</span>
            <h2 className="mt-1 font-serif text-2xl">Cancelar {order.documentType.toLowerCase()} {order.id}</h2>
          </div>
          <button type="button" onClick={onClose} className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[#d1d5db]" aria-label="Fechar cancelamento">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-4 text-sm leading-6 text-black/58">
          A reserva será liberada, o lançamento financeiro será removido e produções abertas ficarão pausadas. O pedido continuará visível no histórico.
        </p>
        <div className="mt-4">
          <SoftTextarea label="Por que está sendo cancelado?" value={reason} onChange={onReasonChange} />
        </div>
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <button type="button" onClick={onClose} className="inline-flex h-11 items-center justify-center rounded-md border border-[#d1d5db] bg-white px-4 text-sm font-medium">
            Voltar
          </button>
          <button type="button" onClick={onConfirm} disabled={reason.trim().length < 3} className="inline-flex h-11 items-center justify-center rounded-md bg-rose-700 px-4 text-sm font-medium text-white disabled:opacity-40">
            Confirmar cancelamento
          </button>
        </div>
      </div>
    </div>
  )
}

function OrderBudgetPreview({
  order,
  state,
  onClose,
  onPrint,
  onDownloadPdf,
}: {
  order: Order
  state: AppState
  onClose: () => void
  onPrint: () => void
  onDownloadPdf: () => void
}) {
  const product = state.products.find((item) => item.id === order.productId)
  const customer = state.customers.find(
    (item) => item.id === order.customerId || item.name === order.client,
  )

  if (!product) return null

  const variation = productVariation(product, order.variationId)
  const brandDoc = documentBrand(product.brand, state.company)
  const unitCost = productCost(product, order.variationId)
  const suggestedPrice = idealPrice(unitCost, state.tax, state.commission, state.fixedCost, state.profit)
  const unitPrice = orderUnitPrice(state, order)
  const total = unitPrice * order.qty
  const relatedOp = state.productionOrders.find((op) => op.orderId === order.id)
  const documentTitle = order.documentType ?? 'Pedido'
  const productDescription = [
    productDisplayName(product, order.variationId),
    variation?.measurements,
    variation?.technicalNotes || product.description,
  ].filter(Boolean).join(' - ')
  const budgetNotes = order.notes || state.company.budgetDefaultNotes || '-'
  const budgetTerms = state.company.budgetDefaultText || initialState.company.budgetDefaultText

  return (
    <div className="fixed inset-0 z-50 bg-black/45 p-4 backdrop-blur-sm print:hidden">
      <div className="mx-auto flex max-h-[calc(100vh-2rem)] max-w-5xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl">
        <header className="flex flex-col gap-3 border-b border-black/10 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="text-sm text-black/55">Prévia para conferência</span>
            <h2 className="font-serif text-2xl">{documentTitle} {order.id}</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onDownloadPdf}
              className="inline-flex h-10 items-center gap-2 rounded-md bg-[#111827] px-4 text-sm font-medium text-white"
            >
              <FileText className="h-4 w-4" />
              Baixar PDF
            </button>
            <button
              type="button"
              onClick={onPrint}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-black/10 bg-white px-4 text-sm font-medium"
            >
              <Printer className="h-4 w-4" />
              Imprimir
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-black/10"
              aria-label="Fechar prévia do pedido"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>

        <div className="overflow-auto bg-[#f5f5f3] p-5">
          <article className="mx-auto max-w-5xl overflow-hidden rounded-md border border-black/10 bg-white text-[#111] shadow-sm">
            <header className="grid gap-6 border-b-2 border-[#111827] bg-[#f9fafb] p-6 md:grid-cols-[240px_1fr_220px] md:items-center">
              <div className={`flex h-24 items-center justify-center rounded-md border border-black/10 px-5 ${brandDoc.darkLogo ? 'bg-[#111]' : 'bg-white'}`}>
                <img src={brandDoc.logo} alt={brandDoc.name} className="max-h-20 w-auto object-contain" />
              </div>
              <div className="text-center">
                <span className="text-sm uppercase text-black/45">{documentTitle}</span>
                <h1 className="mt-2 text-3xl font-semibold">{order.id}</h1>
                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  <StatusBadge tone={orderStatusTone(order.status)}>{order.status}</StatusBadge>
                  <StatusBadge>{product.brand}</StatusBadge>
                  {relatedOp && <StatusBadge tone="blue">{relatedOp.id}</StatusBadge>}
                  {orderIsReserved(order) && <StatusBadge tone="green">Estoque reservado</StatusBadge>}
                </div>
              </div>
              <div className="grid gap-2 text-sm md:text-right">
                <strong>{brandDoc.name}</strong>
                <span>{brandDoc.subtitle}</span>
                <span>{state.company.phone}</span>
                <span>{state.company.address}</span>
                <span>Emissão: {formatDate(currentDateValue())}</span>
                <span>Validade: {state.company.budgetValidityDays} dia(s)</span>
              </div>
            </header>

            <section className="grid gap-3 border-b border-black/20 px-6 py-4 text-sm md:grid-cols-3">
              <OpField label="Cliente" value={order.client} />
              <OpField label="Telefone" value={order.phone || customer?.phone || '-'} />
              <OpField label="Cidade" value={order.city || customer?.city || '-'} />
              <OpField label="Prazo" value={formatDate(order.dueDate)} />
              <OpField label="Pagamento" value={`${order.paymentMethod ?? 'A combinar'} · ${order.paymentStatus ?? 'Pendente'}`} />
              <OpField label="Entrega" value={`${order.deliveryMethod ?? 'A combinar'} · ${order.deliveryAddress || '-'}`} />
            </section>

            <section className="grid gap-2 border-b border-black/20 px-6 py-4 text-sm md:grid-cols-[120px_1fr_100px]">
              <OpField label="Código" value={product.code} plain />
              <OpField label="Produto" value={productDescription} plain />
              <OpField label="Qtd." value={`${order.qty} un`} plain />
            </section>

            <section className="px-6 pt-5">
              <div className="grid grid-cols-[120px_1fr_90px_130px_130px] bg-black/[0.08] px-2 py-2 text-sm font-bold max-md:hidden">
                <span>Código</span>
                <span>Descrição</span>
                <span>Qtd.</span>
                <span>Valor un.</span>
                <span>Total</span>
              </div>
              <div className="grid gap-2 border-b border-black/10 px-2 py-3 text-sm md:grid-cols-[120px_1fr_90px_130px_130px]">
                <span>{product.code}</span>
                <span>{productDisplayName(product, order.variationId)}</span>
                <span>{order.qty} un</span>
                <span>{money(unitPrice)}</span>
                <strong>{money(total)}</strong>
              </div>
            </section>

            <section className="grid gap-5 px-6 py-5 md:grid-cols-[1fr_280px]">
              <div className="text-sm">
                <strong>OBSERVAÇÕES:</strong>
                <p className="mt-2 min-h-16 whitespace-pre-wrap text-black/65">{budgetNotes}</p>
                <strong className="mt-4 block">CONDIÇÕES:</strong>
                <p className="mt-2 whitespace-pre-wrap text-black/55">{budgetTerms}</p>
                <p className="mt-2 text-black/55">Orçamento válido por {state.company.budgetValidityDays} dia(s) a partir da emissão.</p>
                {!!order.history?.length && (
                  <>
                    <strong className="mt-4 block">HISTÓRICO:</strong>
                    <div className="mt-2 grid gap-1 text-black/55">
                      {order.history.slice().reverse().map((event) => (
                        <span key={event.id}>{formatDateTime(event.date)} · {event.type} · {event.user}</span>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <div className="rounded-md border border-[#111827] p-4 text-sm">
                <div className="flex justify-between border-b border-black/10 pb-3">
                  <span>Valor unitário</span>
                  <strong>{money(unitPrice)}</strong>
                </div>
                <div className="flex justify-between border-b border-black/10 py-3 text-black/55">
                  <span>Preço sugerido</span>
                  <span>{money(suggestedPrice)}</span>
                </div>
                <div className="flex justify-between border-b border-black/10 py-3">
                  <span>Quantidade</span>
                  <strong>{order.qty} un</strong>
                </div>
                <div className="flex justify-between pt-3">
                  <span>Total do {documentTitle.toLowerCase()}</span>
                  <strong className="text-xl">{money(total)}</strong>
                </div>
              </div>
            </section>
          </article>
        </div>
      </div>
    </div>
  )
}

function OrderBudgetPrint({ order, state }: { order: Order; state: AppState }) {
  const product = state.products.find((item) => item.id === order.productId)
  const customer = state.customers.find(
    (item) => item.id === order.customerId || item.name === order.client,
  )

  if (!product) return null

  const variation = productVariation(product, order.variationId)
  const brandDoc = documentBrand(product.brand, state.company)
  const unitPrice = orderUnitPrice(state, order)
  const total = unitPrice * order.qty
  const documentTitle = order.documentType ?? 'Pedido'
  const productDescription = [
    productDisplayName(product, order.variationId),
    variation?.measurements,
    variation?.technicalNotes || product.description,
  ].filter(Boolean).join(' - ')
  const budgetNotes = order.notes || state.company.budgetDefaultNotes || '-'
  const budgetTerms = state.company.budgetDefaultText || initialState.company.budgetDefaultText

  return (
    <article className="document-print-sheet order-print-sheet">
      <header style={{ display: 'grid', gridTemplateColumns: '230px 1fr 210px', alignItems: 'center', gap: 22, borderBottom: '2px solid #111', paddingBottom: 14 }}>
        <div style={{ display: 'flex', height: 82, alignItems: 'center', justifyContent: 'center', border: '1px solid #ddd', background: brandDoc.darkLogo ? '#111' : '#fff', padding: '10px 18px' }}>
          <img src={brandDoc.logo} alt={brandDoc.name} style={{ maxHeight: 72, maxWidth: '100%', objectFit: 'contain' }} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 12, letterSpacing: 2, color: '#666' }}>{documentTitle.toUpperCase()}</div>
          <h1 style={{ margin: '6px 0 8px', fontSize: 26, fontWeight: 700 }}>{order.id}</h1>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, fontSize: 11 }}>
            <span style={{ border: '1px solid #ccc', padding: '3px 7px', borderRadius: 4 }}>{order.status}</span>
            <span style={{ border: '1px solid #ccc', padding: '3px 7px', borderRadius: 4 }}>{product.brand}</span>
          </div>
        </div>
        <div style={{ textAlign: 'right', fontSize: 13, lineHeight: 1.6 }}>
          <strong>{brandDoc.name}</strong>
          <div>{brandDoc.subtitle}</div>
          <div>{state.company.phone}</div>
          <div>{state.company.address}</div>
          <div>Emissão: {formatDate(currentDateValue())}</div>
          <div>Validade: {state.company.budgetValidityDays} dia(s)</div>
        </div>
      </header>

      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, borderBottom: '1px solid #111', padding: '10px 0', fontSize: 13 }}>
        <PrintField label="Cliente" value={order.client} />
        <PrintField label="Telefone" value={order.phone || customer?.phone || '-'} />
        <PrintField label="Cidade" value={order.city || customer?.city || '-'} />
        <PrintField label="Prazo" value={formatDate(order.dueDate)} />
        <PrintField label="Pagamento" value={`${order.paymentMethod ?? 'A combinar'} · ${order.paymentStatus ?? 'Pendente'}`} />
        <PrintField label="Entrega" value={`${order.deliveryMethod ?? 'A combinar'} · ${order.deliveryAddress || '-'}`} />
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: '120px 1fr 80px', gap: 10, borderBottom: '1px solid #111', padding: '10px 0', fontSize: 13 }}>
        <PrintField label="Código" value={product.code} plain />
        <PrintField label="Produto" value={productDescription} plain />
        <PrintField label="Qtd." value={`${order.qty} un`} plain />
      </section>

      <section style={{ marginTop: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 90px 130px 130px', background: '#e8e8e8', padding: '7px 8px', fontSize: 13, fontWeight: 700 }}>
          <span>Código</span>
          <span>Descrição</span>
          <span>Qtd.</span>
          <span>Valor un.</span>
          <span>Total</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 90px 130px 130px', borderBottom: '1px solid #ddd', padding: '8px', fontSize: 13 }}>
          <span>{product.code}</span>
          <span>{productDisplayName(product, order.variationId)}</span>
          <span>{order.qty} un</span>
          <span>{money(unitPrice)}</span>
          <strong>{money(total)}</strong>
        </div>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 20, marginTop: 20, fontSize: 13 }}>
        <div>
          <strong>OBSERVAÇÕES:</strong>
          <p style={{ minHeight: 70, margin: '8px 0 0', whiteSpace: 'pre-wrap' }}>{budgetNotes}</p>
          <strong style={{ display: 'block', marginTop: 12 }}>CONDIÇÕES:</strong>
          <p style={{ margin: '8px 0 0', whiteSpace: 'pre-wrap' }}>{budgetTerms}</p>
          <p style={{ margin: '8px 0 0' }}>Orçamento válido por {state.company.budgetValidityDays} dia(s) a partir da emissão.</p>
          {!!order.history?.length && (
            <>
              <strong style={{ display: 'block', marginTop: 12 }}>HISTÓRICO:</strong>
              <div style={{ display: 'grid', gap: 4, marginTop: 8 }}>
                {order.history.slice().reverse().map((event) => (
                  <span key={event.id}>{formatDateTime(event.date)} · {event.type} · {event.user}</span>
                ))}
              </div>
            </>
          )}
        </div>
        <div style={{ border: '1px solid #111', padding: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ddd', paddingBottom: 8 }}>
            <span>Subtotal</span>
            <strong>{money(total)}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8 }}>
            <span>Total do {documentTitle.toLowerCase()}</span>
            <strong style={{ fontSize: 18 }}>{money(total)}</strong>
          </div>
        </div>
      </section>

      <footer style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 70, marginTop: 46, fontSize: 12 }}>
        <div style={{ borderTop: '1px solid #111', paddingTop: 8, textAlign: 'center' }}>
          Assinatura {state.company.name}
        </div>
        <div style={{ borderTop: '1px solid #111', paddingTop: 8, textAlign: 'center' }}>
          Cliente
        </div>
      </footer>
    </article>
  )
}

function OpField({ label, value, plain = false }: { label: string; value: string; plain?: boolean }) {
  return (
    <div className={plain ? '' : 'flex items-center gap-2'}>
      <strong className="mr-1">{label}:</strong>
      <span className={plain ? '' : 'inline-flex min-h-8 min-w-32 items-center bg-black/[0.08] px-2'}>
        {value}
      </span>
    </div>
  )
}

function PrintField({ label, value, plain = false }: { label: string; value: string; plain?: boolean }) {
  return (
    <div style={plain ? undefined : { display: 'flex', alignItems: 'center', gap: 6 }}>
      <strong style={{ marginRight: 4 }}>{label}:</strong>
      <span style={plain ? undefined : { display: 'inline-flex', minHeight: 26, minWidth: 118, alignItems: 'center', background: '#e8e8e8', padding: '0 7px' }}>
        {value}
      </span>
    </div>
  )
}

function TotalLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-[#e5e7eb] bg-[#ffffff] p-4">
      <span className="text-sm text-black/50">{label}</span>
      <strong className="mt-1 block text-2xl font-semibold">{value}</strong>
    </div>
  )
}

function StockSummary({
  label,
  value,
  tone = 'neutral',
}: {
  label: string
  value: string
  tone?: 'neutral' | 'attention'
}) {
  return (
    <div className={`min-w-0 bg-white p-3 ${tone === 'attention' ? 'text-amber-900' : 'text-[#111827]'}`}>
      <span className="block text-[11px] uppercase text-[#6b7280]">{label}</span>
      <strong className="mt-1 block truncate text-base">{value}</strong>
    </div>
  )
}

function StockCountValue({
  label,
  value,
  attention = false,
}: {
  label: string
  value: string
  attention?: boolean
}) {
  return (
    <div>
      <span className="block text-[10px] uppercase text-[#6b7280]">{label}</span>
      <strong className={`mt-1 block text-sm ${attention ? 'text-amber-800' : 'text-[#111827]'}`}>{value}</strong>
    </div>
  )
}

function FinishedStockPositionTable({
  rows,
  onOpenHistory,
}: {
  rows: {
    key: string
    item: string
    product: Product
    label: string
    physical: number
    reserved: number
    producing: number
    available: number
    shortage: number
  }[]
  onOpenHistory: (item: string) => void
}) {
  return (
    <>
      <div className="grid gap-3 md:hidden">
        {rows.map((row) => (
          <div key={row.key} className="rounded-md border border-[#e5e7eb] bg-white p-4">
            <strong className="block">{row.product.code}</strong>
            <span className="mt-1 block text-sm text-[#6b7280]">{row.label}</span>
            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
              <StockCountValue label="Físico" value={`${row.physical} un`} />
              <StockCountValue label="Reservado" value={`${row.reserved} un`} />
              <StockCountValue label="Disponível" value={`${row.available} un`} attention={row.shortage > 0} />
              <StockCountValue label="Produzindo" value={`${row.producing} un`} />
            </div>
            {row.shortage > 0 && (
              <p className="mt-3 border-t border-[#e5e7eb] pt-3 text-xs font-medium text-rose-700">
                Faltam {row.shortage} un para atender as reservas.
              </p>
            )}
            <button
              type="button"
              onClick={() => onOpenHistory(row.item)}
              className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-[#d1d5db] bg-white px-3 text-sm font-medium"
            >
              <FileText className="h-4 w-4" />
              Ver histórico
            </button>
          </div>
        ))}
      </div>
      <div className="hidden overflow-hidden rounded-md border border-[#e5e7eb] bg-white md:block">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-[#f3f4f6]">
            <tr>
              <th className="border-b border-[#e5e7eb] px-3 py-3 text-left">Produto e variação</th>
              <th className="border-b border-[#e5e7eb] px-3 py-3 text-left">Físico</th>
              <th className="border-b border-[#e5e7eb] px-3 py-3 text-left">Reservado</th>
              <th className="border-b border-[#e5e7eb] px-3 py-3 text-left">Disponível</th>
              <th className="border-b border-[#e5e7eb] px-3 py-3 text-left">Produzindo</th>
              <th className="border-b border-[#e5e7eb] px-3 py-3 text-right">Histórico</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key}>
                <td className="border-b border-[#e5e7eb] px-3 py-3">
                  <strong className="block">{row.product.code}</strong>
                  <span className="text-[#6b7280]">{row.label}</span>
                </td>
                <td className="border-b border-[#e5e7eb] px-3 py-3">{row.physical} un</td>
                <td className="border-b border-[#e5e7eb] px-3 py-3">{row.reserved} un</td>
                <td className="border-b border-[#e5e7eb] px-3 py-3">
                  <strong className={row.shortage > 0 ? 'text-rose-700' : 'text-emerald-700'}>
                    {row.available} un
                  </strong>
                  {row.shortage > 0 && <span className="ml-2 text-xs text-rose-600">Faltam {row.shortage}</span>}
                </td>
                <td className="border-b border-[#e5e7eb] px-3 py-3">{row.producing} un</td>
                <td className="border-b border-[#e5e7eb] px-3 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => onOpenHistory(row.item)}
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-[#d1d5db] bg-white px-3 text-xs font-medium"
                  >
                    <FileText className="h-4 w-4" />
                    Ver
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

function RawStockPositionTable({
  rows,
  onOpenHistory,
}: {
  rows: {
    item: string
    unit: string
    minimumStock: number
    physical: number
    committed: number
    available: number
    shortage: number
  }[]
  onOpenHistory: (item: string) => void
}) {
  return (
    <div className="grid gap-3">
      {rows.map((row) => {
        const minimumShortage = Math.max(row.minimumStock - row.physical, 0)
        const attentionQty = Math.max(row.shortage, minimumShortage)
        const attentionLabel = row.shortage > 0 ? 'Falta para OP' : 'Abaixo do mínimo'
        return (
          <div key={row.item} className="grid gap-3 rounded-md border border-[#e5e7eb] bg-white p-4 md:grid-cols-[minmax(0,1fr)_repeat(4,120px)_90px] md:items-center">
            <div>
              <strong className="block">{row.item}</strong>
              <span className="mt-1 block text-xs text-[#6b7280]">
                Mínimo: {row.minimumStock.toLocaleString('pt-BR')} {row.unit}
              </span>
            </div>
            <StockCountValue label="Físico" value={`${row.physical.toLocaleString('pt-BR')} ${row.unit}`} />
            <StockCountValue label="Necessário nas OPs" value={`${row.committed.toLocaleString('pt-BR')} ${row.unit}`} />
            <StockCountValue label="Livre" value={`${row.available.toLocaleString('pt-BR')} ${row.unit}`} attention={row.shortage > 0} />
            <StockCountValue
              label={attentionQty > 0 ? attentionLabel : 'Situação'}
              value={attentionQty > 0 ? `${attentionQty.toLocaleString('pt-BR')} ${row.unit}` : 'Atendido'}
              attention={attentionQty > 0}
            />
            <button
              type="button"
              onClick={() => onOpenHistory(row.item)}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[#d1d5db] bg-white px-3 text-xs font-medium"
            >
              <FileText className="h-4 w-4" />
              Histórico
            </button>
          </div>
        )
      })}
    </div>
  )
}

function InventoryHistoryRow({
  entry,
  balanceAfter,
  showValue,
}: {
  entry: InventoryEntry
  balanceAfter: number
  showValue: boolean
}) {
  const direction = inventoryKindDirection(entry.kind)
  return (
    <div className="grid gap-3 rounded-md border border-[#e5e7eb] bg-white p-4 md:grid-cols-[130px_minmax(0,1fr)_140px] md:items-center">
      <div>
        <span className={`inline-flex rounded-md px-2 py-1 text-xs font-medium ${
          direction === 'Entrada' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
        }`}>
          {entry.kind}
        </span>
        <span className="mt-2 block text-xs text-[#6b7280]">
          {entry.createdAt ? formatDateTime(entry.createdAt) : 'Registro anterior'}
        </span>
      </div>
      <div>
        <strong className="block">{entry.item}</strong>
        <span className="mt-1 block text-sm text-[#6b7280]">
          {entry.source} · {entry.createdBy ?? 'Sistema'}
        </span>
        <span className="mt-1 block text-xs text-[#4b5563]">
          {entry.reason || 'Sem observação no registro original'}
        </span>
      </div>
      <div className="md:text-right">
        <strong className={direction === 'Entrada' ? 'text-emerald-700' : 'text-rose-700'}>
          {direction === 'Entrada' ? '+' : '-'}{entry.qty.toLocaleString('pt-BR')} {entry.unit}
        </strong>
        <span className="mt-1 block text-xs font-medium text-[#4b5563]">
          Saldo após: {balanceAfter.toLocaleString('pt-BR')} {entry.unit}
        </span>
        {showValue && <span className="mt-1 block text-xs text-[#6b7280]">{money(entry.value)}</span>}
      </div>
    </div>
  )
}

function orderStatusTone(status: OrderStatus) {
  if (status === 'Aberto') return 'blue'
  if (status === 'Em produção') return 'amber'
  if (status === 'Pronto') return 'green'
  if (status === 'Entregue') return 'neutral'
  return 'rose'
}

function opStatusTone(status: OpStatus) {
  if (status === 'Finalizada') return 'green'
  if (status === 'Em produção') return 'blue'
  if (status === 'Pausada') return 'amber'
  return 'neutral'
}

function priorityTone(priority: ProductionPriority) {
  if (priority === 'Urgente') return 'rose'
  if (priority === 'Alta') return 'amber'
  if (priority === 'Baixa') return 'neutral'
  return 'blue'
}

function priorityWeight(priority: ProductionPriority) {
  if (priority === 'Urgente') return 4
  if (priority === 'Alta') return 3
  if (priority === 'Normal') return 2
  return 1
}

function StatusBadge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'green' | 'blue' | 'amber' | 'rose' }) {
  const toneClass = {
    neutral: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
    green: 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200',
    blue: 'bg-sky-50 text-sky-800 ring-1 ring-sky-200',
    amber: 'bg-amber-50 text-amber-800 ring-1 ring-amber-200',
    rose: 'bg-rose-50 text-rose-800 ring-1 ring-rose-200',
  }[tone]

  return <span className={`rounded-md px-2 py-1 text-xs font-medium ${toneClass}`}>{children}</span>
}

function RecordRow({
  badge,
  title,
  detail,
  value,
}: {
  badge: string
  title: string
  detail: string
  value: string
}) {
  return (
    <div className="flex flex-col justify-between gap-3 rounded-md border border-[#e5e7eb] bg-[#ffffff] p-4 md:flex-row md:items-center">
      <div>
        <StatusBadge tone={badge.includes('Entrada') || badge.includes('Faturado') ? 'green' : badge.includes('Saída') || badge.includes('Consumo') ? 'amber' : 'neutral'}>
          {badge}
        </StatusBadge>
        <p className="mt-3 font-medium">{title}</p>
        <p className="text-sm leading-5 text-black/50">{detail}</p>
      </div>
      <strong className="text-right font-semibold">{value}</strong>
    </div>
  )
}

function IndicatorActionRow({
  badge,
  tone,
  title,
  detail,
  value,
  actionLabel,
  onAction,
}: {
  badge: string
  tone: 'neutral' | 'green' | 'blue' | 'amber' | 'rose'
  title: string
  detail: string
  value: string
  actionLabel: string
  onAction: () => void
}) {
  return (
    <article className="grid min-w-0 gap-3 rounded-md border border-slate-200 bg-white p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge tone={tone}>{badge}</StatusBadge>
          <strong className="break-words text-sm leading-5 text-slate-950">{title}</strong>
        </div>
        <p className="mt-2 text-sm leading-5 text-slate-500">{detail}</p>
      </div>
      <div className="flex min-w-0 items-center justify-between gap-3 sm:flex-col sm:items-end">
        <strong className="break-words text-sm text-slate-900">{value}</strong>
        <button
          type="button"
          onClick={onAction}
          className="inline-flex min-h-9 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-[#312e81] transition hover:border-slate-300 hover:bg-slate-50"
        >
          {actionLabel}
        </button>
      </div>
    </article>
  )
}
