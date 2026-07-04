import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { contactInfo } from '@/lib/contact-info'
import { Language, useLanguage } from '@/lib/i18n'

type SEOPage = {
  title: string
  description: string
  keywords: string
}

const baseTitle = 'Maçaroca + Schön Medical'
const imagePath = '/og-image.png'

const organizationDescription: Record<Language, string> = {
  pt: 'Moda autoral Maçaroca e scrubs Schön Medical sob demanda, com atendimento online, orientação de medidas e produção por demanda.',
  es: 'Moda de autor Maçaroca y scrubs Schön Medical a pedido, con atención online, orientación de medidas y producción bajo demanda.',
  en: 'Maçaroca authorial fashion and made-to-order Schön Medical scrubs, with online service, measurement guidance and demand-based production.',
}

const pages: Record<string, Record<Language, SEOPage>> = {
  '/': {
    pt: {
      title: 'Maçaroca + Schön Medical | Moda autoral e scrubs sob demanda',
      description:
        'Moda feminina autoral, peças sob demanda e scrubs Schön Medical para profissionais que buscam conforto, presença e identidade.',
      keywords:
        'Maçaroca, Schön Medical, moda autoral, scrubs, roupas sob demanda, moda feminina',
    },
    es: {
      title: 'Maçaroca + Schön Medical | Moda de autor y scrubs a pedido',
      description:
        'Moda femenina de autor, piezas a pedido y scrubs Schön Medical para profesionales que buscan comodidad, presencia e identidad.',
      keywords:
        'Maçaroca, Schön Medical, moda de autor, scrubs, ropa a pedido, moda femenina',
    },
    en: {
      title: 'Maçaroca + Schön Medical | Authorial fashion and made-to-order scrubs',
      description:
        'Authorial womenswear, made-to-order pieces and Schön Medical scrubs for professionals seeking comfort, presence and identity.',
      keywords:
        'Maçaroca, Schön Medical, authorial fashion, scrubs, made to order clothing, womenswear',
    },
  },
  '/colecoes': {
    pt: {
      title: 'Catálogo | Maçaroca + Schön Medical',
      description:
        'Conheça a seleção Maçaroca e Schön Medical: peças autorais, scrubs completos e pedidos sob medida.',
      keywords: 'catálogo Maçaroca, catálogo Schön Medical, scrubs sob demanda, peças autorais',
    },
    es: {
      title: 'Catálogo | Maçaroca + Schön Medical',
      description:
        'Conoce la selección Maçaroca y Schön Medical: piezas de autor, scrubs completos y pedidos a medida.',
      keywords: 'catálogo Maçaroca, catálogo Schön Medical, scrubs a pedido, piezas de autor',
    },
    en: {
      title: 'Catalog | Maçaroca + Schön Medical',
      description:
        'Explore the Maçaroca and Schön Medical selection: authorial pieces, complete scrubs and made-to-order requests.',
      keywords: 'Maçaroca catalog, Schön Medical catalog, made-to-order scrubs, authorial pieces',
    },
  },
  '/schon-medical': {
    pt: {
      title: 'Schön Medical | Scrubs sob demanda by Maçaroca',
      description:
        'Scrubs Schön Medical sob demanda, com orientação de medidas, cores, bordados e conforto para longas rotinas.',
      keywords: 'Schön Medical, scrub sob demanda, scrub personalizado, uniformes saúde, Maçaroca',
    },
    es: {
      title: 'Schön Medical | Scrubs a pedido by Maçaroca',
      description:
        'Scrubs Schön Medical a pedido, con orientación de medidas, colores, bordados y comodidad para rutinas largas.',
      keywords: 'Schön Medical, scrub a pedido, scrub personalizado, uniformes salud, Maçaroca',
    },
    en: {
      title: 'Schön Medical | Made-to-order scrubs by Maçaroca',
      description:
        'Made-to-order Schön Medical scrubs with measurement guidance, colors, embroidery and comfort for long routines.',
      keywords: 'Schön Medical, made-to-order scrubs, custom scrubs, healthcare uniforms, Maçaroca',
    },
  },
  '/sobre': {
    pt: {
      title: 'Sobre a marca | Maçaroca + Schön Medical',
      description:
        'Conheça a história da Maçaroca e da Schön Medical: criação autoral, produção sob demanda e presença no vestir.',
      keywords: 'sobre Maçaroca, história Maçaroca, Schön Medical, moda autoral, produção sob demanda',
    },
    es: {
      title: 'Sobre la marca | Maçaroca + Schön Medical',
      description:
        'Conoce la historia de Maçaroca y Schön Medical: creación de autor, producción a pedido y presencia al vestir.',
      keywords: 'sobre Maçaroca, historia Maçaroca, Schön Medical, moda de autor, producción a pedido',
    },
    en: {
      title: 'About the brand | Maçaroca + Schön Medical',
      description:
        'Learn about Maçaroca and Schön Medical: authorial creation, made-to-order production and presence in dressing.',
      keywords: 'about Maçaroca, Maçaroca story, Schön Medical, authorial fashion, made-to-order production',
    },
  },
  '/contato': {
    pt: {
      title: 'Contato | Atendimento Maçaroca + Schön Medical',
      description:
        'Fale com a Maçaroca para pedidos sob demanda, orientação de medidas, scrubs Schön Medical e atendimento Brasil ou Paraguai.',
      keywords: 'contato Maçaroca, atendimento Schön Medical, WhatsApp Maçaroca, pedidos sob demanda',
    },
    es: {
      title: 'Contacto | Atención Maçaroca + Schön Medical',
      description:
        'Habla con Maçaroca para pedidos a medida, orientación de medidas, scrubs Schön Medical y atención Brasil o Paraguay.',
      keywords: 'contacto Maçaroca, atención Schön Medical, WhatsApp Maçaroca, pedidos a medida',
    },
    en: {
      title: 'Contact | Maçaroca + Schön Medical service',
      description:
        'Contact Maçaroca for made-to-order requests, measurement guidance, Schön Medical scrubs and Brazil or Paraguay service.',
      keywords: 'Maçaroca contact, Schön Medical service, Maçaroca WhatsApp, made-to-order requests',
    },
  },
}

const fallback: Record<Language, SEOPage> = {
  pt: {
    title: `Página não encontrada | ${baseTitle}`,
    description: 'Página não encontrada no site Maçaroca + Schön Medical.',
    keywords: 'Maçaroca, Schön Medical',
  },
  es: {
    title: `Página no encontrada | ${baseTitle}`,
    description: 'Página no encontrada en el sitio Maçaroca + Schön Medical.',
    keywords: 'Maçaroca, Schön Medical',
  },
  en: {
    title: `Page not found | ${baseTitle}`,
    description: 'Page not found on the Maçaroca + Schön Medical website.',
    keywords: 'Maçaroca, Schön Medical',
  },
}

function setMeta(attribute: 'name' | 'property', key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`)

  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.appendChild(element)
  }

  element.content = content
}

function setLink(rel: string, href: string) {
  let element = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)

  if (!element) {
    element = document.createElement('link')
    element.rel = rel
    document.head.appendChild(element)
  }

  element.href = href
}

export function SEO() {
  const location = useLocation()
  const { language } = useLanguage()

  useEffect(() => {
    const pathname = location.pathname.replace(/\/$/, '') || '/'
    const page = pages[pathname]?.[language] ?? fallback[language]
    const origin = window.location.origin
    const canonicalUrl = `${origin}${pathname}`
    const imageUrl = `${origin}${imagePath}`
    const locale = language === 'pt' ? 'pt_BR' : language === 'es' ? 'es_PY' : 'en_US'
    const shouldIndex = Boolean(pages[pathname])

    document.title = page.title

    setMeta('name', 'description', page.description)
    setMeta('name', 'keywords', page.keywords)
    setMeta('name', 'robots', shouldIndex ? 'index, follow' : 'noindex, follow')
    setMeta('name', 'author', 'Maçaroca')
    setMeta('property', 'og:type', 'website')
    setMeta('property', 'og:site_name', baseTitle)
    setMeta('property', 'og:title', page.title)
    setMeta('property', 'og:description', page.description)
    setMeta('property', 'og:url', canonicalUrl)
    setMeta('property', 'og:image', imageUrl)
    setMeta('property', 'og:locale', locale)
    setMeta('name', 'twitter:card', 'summary_large_image')
    setMeta('name', 'twitter:title', page.title)
    setMeta('name', 'twitter:description', page.description)
    setMeta('name', 'twitter:image', imageUrl)
    setLink('canonical', canonicalUrl)

    const structuredData = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          '@id': `${origin}/#organization`,
          name: baseTitle,
          alternateName: ['Maçaroca', 'Schön Medical', 'Schön Medical by Maçaroca'],
          url: origin,
          logo: imageUrl,
          image: imageUrl,
          description: organizationDescription[language],
          email: contactInfo.email.display,
          sameAs: [contactInfo.socialMedia.instagram.link],
          areaServed: [
            { '@type': 'Country', name: 'Brasil' },
            { '@type': 'Country', name: 'Paraguai' },
          ],
          knowsAbout: [
            'moda autoral',
            'peças sob demanda',
            'scrubs personalizados',
            'orientação de medidas',
            'uniformes para profissionais da saúde',
          ],
          brand: [
            {
              '@type': 'Brand',
              '@id': `${origin}/#macaroca-brand`,
              name: 'Maçaroca',
              description: 'Moda autoral feminina sob demanda.',
            },
            {
              '@type': 'Brand',
              '@id': `${origin}/#schon-medical-brand`,
              name: 'Schön Medical',
              alternateName: 'Schön Medical by Maçaroca',
              description: 'Scrubs sob demanda para profissionais da saúde.',
            },
          ],
          contactPoint: [
            {
              '@type': 'ContactPoint',
              telephone: contactInfo.whatsapp.brasil.displayNumber,
              contactType: 'customer service',
              contactOption: 'WhatsApp',
              areaServed: { '@type': 'Country', name: 'Brasil' },
              availableLanguage: ['Portuguese'],
            },
            {
              '@type': 'ContactPoint',
              telephone: contactInfo.whatsapp.paraguai.displayNumber,
              contactType: 'customer service',
              contactOption: 'WhatsApp',
              areaServed: { '@type': 'Country', name: 'Paraguai' },
              availableLanguage: ['Spanish', 'Portuguese'],
            },
          ],
        },
        {
          '@type': 'WebSite',
          '@id': `${origin}/#website`,
          name: baseTitle,
          url: origin,
          inLanguage: locale.replace('_', '-'),
          publisher: { '@id': `${origin}/#organization` },
        },
        {
          '@type': 'WebPage',
          '@id': `${canonicalUrl}#webpage`,
          url: canonicalUrl,
          name: page.title,
          description: page.description,
          inLanguage: locale.replace('_', '-'),
          isPartOf: { '@id': `${origin}/#website` },
          about: { '@id': `${origin}/#organization` },
          primaryImageOfPage: {
            '@type': 'ImageObject',
            url: imageUrl,
          },
        },
      ],
    }

    let script = document.getElementById('organization-schema')

    if (!script) {
      script = document.createElement('script')
      script.id = 'organization-schema'
      script.type = 'application/ld+json'
      document.head.appendChild(script)
    }

    script.textContent = JSON.stringify(structuredData)
  }, [language, location.pathname])

  return null
}
