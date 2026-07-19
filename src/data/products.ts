import macarocaSilhueta from '@/assets/optimized/macaroca-silhueta-catalogo.jpg'
import schonSilhueta from '@/assets/optimized/schon-silhueta-catalogo.jpg'
import schonCatalog1 from '@/assets/optimized/schon-catalog-1.jpg'
import schonCatalog2 from '@/assets/optimized/schon-catalog-2.jpg'
import schonCatalog3 from '@/assets/optimized/schon-catalog-3.jpg'
import schonCatalog4 from '@/assets/optimized/schon-catalog-4.jpg'
import schonCatalog6 from '@/assets/optimized/schon-catalog-6.jpg'
import schonCatalog7 from '@/assets/optimized/schon-catalog-7.jpg'
import schonCatalog8 from '@/assets/optimized/schon-catalog-8.jpg'

export const PRODUCTS = [
  {
    id: 'macaroca-curadoria',
    name: 'Maçaroca',
    category: 'Peças autorais sob consulta',
    brand: 'Maçaroca',
    price: 'Sob consulta',
    visual: 'macaroca',
    image: macarocaSilhueta,
    colors: ['#F7F7F4', '#D8D8D2', '#AFAFA8'],
    sizes: ['Sob medida'],
  },
  {
    id: 'schon-scrub-completo',
    name: 'Scrub completo',
    category: 'Schön Medical',
    brand: 'Schön Medical',
    price: 'A partir de R$ 190',
    visual: 'schon',
    image: schonSilhueta,
    gallery: [
      schonCatalog8,
      schonCatalog7,
      schonCatalog6,
      schonCatalog4,
      schonCatalog3,
      schonCatalog2,
      schonCatalog1,
    ],
    colors: ['#8c124b', '#d80b8c', '#07066f', '#a9efe2', '#ff520d', '#ffffff'],
    sizes: ['XXP', 'XP', 'P', 'M', 'G', 'XG', 'XXG', 'XXXG'],
  },
]
