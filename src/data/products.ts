import macarocaSilhueta from '@/assets/optimized/macaroca-silhueta-catalogo.jpg'
import schonSilhueta from '@/assets/optimized/schon-silhueta-catalogo.jpg'

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
    price: 'A partir de R$ 187',
    visual: 'schon',
    image: schonSilhueta,
    colors: ['#8c124b', '#d80b8c', '#07066f', '#a9efe2', '#ff520d', '#ffffff'],
    sizes: ['XXP', 'XP', 'P', 'M', 'G', 'XG', 'XXG', 'XXXG'],
  },
]
