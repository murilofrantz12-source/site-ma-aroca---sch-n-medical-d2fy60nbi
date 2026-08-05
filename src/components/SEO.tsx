import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { contactInfo } from '@/lib/contact-info'
import { Language, useLanguage } from '@/lib/i18n'

type SEOPage = {
  title: string
  description: string
  keywords: string
}

const baseTitle = 'Maçaroca'
const iconPath = '/favicon.png?v=4'
const icoPath = '/favicon.ico?v=4'
const imagePath = '/og-image.png?v=4'

const organizationDescription: Record<Language, string> = {
  pt: 'Moda autoral Maçaroca e scrubs Schön Medical sob demanda, com atendimento online, orientação de medidas e produção por demanda.',
  es: 'Moda de autor Maçaroca y scrubs Schön Medical a pedido, con atención online, orientación de medidas y producción bajo demanda.',
  en: 'Maçaroca authorial fashion and made-to-order Schön Medical scrubs, with online service, measurement guidance and demand-based production.',
}

const pages: Record<string, Record<Language, SEOPage>> = {
  '/': {
    pt: {
      title: 'Maçaroca',
      description:
        'Moda autoral Maçaroca, peças sob demanda e scrubs Schön Medical para profissionais que buscam conforto, presença e identidade.',
      keywords:
        'Maçaroca, Macaroca, Maçaroca moda, Schön Medical, Schon Medical, moda autoral, moda feminina, roupas sob demanda, roupas sob medida, scrubs, scrub feminino, uniformes profissionais, uniformes para saúde',
    },
    es: {
      title: 'Maçaroca',
      description:
        'Moda femenina de autor, piezas a pedido y scrubs Schön Medical para profesionales que buscan comodidad, presencia e identidad.',
      keywords:
        'Maçaroca, Macaroca, Maçaroca moda, Schön Medical, Schon Medical, moda de autor, moda femenina, ropa a pedido, ropa a medida, scrubs, uniformes profesionales, uniformes de salud',
    },
    en: {
      title: 'Maçaroca',
      description:
        'Authorial womenswear, made-to-order pieces and Schön Medical scrubs for professionals seeking comfort, presence and identity.',
      keywords:
        'Maçaroca, Macaroca, Maçaroca fashion, Schön Medical, Schon Medical, authorial fashion, womenswear, made-to-order clothing, custom clothing, scrubs, professional uniforms, healthcare uniforms',
    },
  },
  '/colecoes': {
    pt: {
      title: 'Catálogo | Maçaroca',
      description:
        'Conheça a seleção Maçaroca e Schön Medical: peças autorais, scrubs completos e pedidos sob medida.',
      keywords:
        'catálogo Maçaroca, catálogo Schön Medical, catálogo de scrubs, scrubs sob demanda, roupas sob medida, peças autorais, moda autoral feminina',
    },
    es: {
      title: 'Catálogo | Maçaroca',
      description:
        'Conoce la selección Maçaroca y Schön Medical: piezas de autor, scrubs completos y pedidos a medida.',
      keywords:
        'catálogo Maçaroca, catálogo Schön Medical, catálogo de scrubs, scrubs a pedido, ropa a medida, piezas de autor, moda femenina de autor',
    },
    en: {
      title: 'Catalog | Maçaroca',
      description:
        'Explore the Maçaroca and Schön Medical selection: authorial pieces, complete scrubs and made-to-order requests.',
      keywords:
        'Maçaroca catalog, Schön Medical catalog, scrub catalog, made-to-order scrubs, custom clothing, authorial pieces, womenswear',
    },
  },
  '/schon-medical': {
    pt: {
      title: 'Schön Medical | Scrubs sob demanda by Maçaroca',
      description:
        'Scrubs Schön Medical sob demanda, com orientação de medidas, cores disponíveis e conforto para longas rotinas.',
      keywords:
        'Schön Medical, Schon Medical, scrub sob demanda, scrubs coloridos, scrub feminino, uniformes saúde, uniformes profissionais, Maçaroca',
    },
    es: {
      title: 'Schön Medical | Scrubs a pedido by Maçaroca',
      description:
        'Scrubs Schön Medical a pedido, con orientación de medidas, colores disponibles y comodidad para rutinas largas.',
      keywords:
        'Schön Medical, Schon Medical, scrub a pedido, scrubs de colores, uniformes salud, uniformes profesionales, Maçaroca',
    },
    en: {
      title: 'Schön Medical | Made-to-order scrubs by Maçaroca',
      description:
        'Made-to-order Schön Medical scrubs with measurement guidance, available colors and comfort for long routines.',
      keywords:
        'Schön Medical, Schon Medical, made-to-order scrubs, colorful scrubs, professional uniforms, healthcare uniforms, Maçaroca',
    },
  },
  '/sobre': {
    pt: {
      title: 'Sobre a marca | Maçaroca',
      description:
        'Conheça a história da Maçaroca e da Schön Medical: criação autoral, produção sob demanda e presença no vestir.',
      keywords:
        'sobre Maçaroca, história Maçaroca, Schön Medical, Macaroca, moda autoral, produção sob demanda, fabricado no Paraguai',
    },
    es: {
      title: 'Sobre la marca | Maçaroca',
      description:
        'Conoce la historia de Maçaroca y Schön Medical: creación de autor, producción a pedido y presencia al vestir.',
      keywords:
        'sobre Maçaroca, historia Maçaroca, Schön Medical, Macaroca, moda de autor, producción a pedido, fabricado en Paraguay',
    },
    en: {
      title: 'About the brand | Maçaroca',
      description:
        'Learn about Maçaroca and Schön Medical: authorial creation, made-to-order production and presence in dressing.',
      keywords:
        'about Maçaroca, Maçaroca story, Macaroca, Schön Medical, authorial fashion, made-to-order production, made in Paraguay',
    },
  },
  '/contato': {
    pt: {
      title: 'Contato | Maçaroca',
      description:
        'Fale com a Maçaroca para pedidos sob demanda, orientação de medidas, scrubs Schön Medical e atendimento Brasil ou Paraguai.',
      keywords:
        'contato Maçaroca, atendimento Schön Medical, WhatsApp Maçaroca, pedidos sob demanda, scrubs Brasil, scrubs Paraguai',
    },
    es: {
      title: 'Contacto | Maçaroca',
      description:
        'Habla con Maçaroca para pedidos a medida, orientación de medidas, scrubs Schön Medical y atención Brasil o Paraguay.',
      keywords:
        'contacto Maçaroca, atención Schön Medical, WhatsApp Maçaroca, pedidos a medida, scrubs Brasil, scrubs Paraguay',
    },
    en: {
      title: 'Contact | Maçaroca',
      description:
        'Contact Maçaroca for made-to-order requests, measurement guidance, Schön Medical scrubs and Brazil or Paraguay service.',
      keywords:
        'Maçaroca contact, Schön Medical service, Maçaroca WhatsApp, made-to-order requests, scrubs Brazil, scrubs Paraguay',
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
    const logoUrl = `${origin}${iconPath}`
    const imageUrl = `${origin}${imagePath}`
    const locale = language === 'pt' ? 'pt_BR' : language === 'es' ? 'es_PY' : 'en_US'
    const shouldIndex = Boolean(pages[pathname])

    document.title = page.title

    setMeta('name', 'description', page.description)
    setMeta('name', 'keywords', page.keywords)
    setMeta('name', 'robots', shouldIndex ? 'index, follow' : 'noindex, follow')
    setMeta('name', 'author', 'Maçaroca')
    setMeta('name', 'creator', 'Maçaroca')
    setMeta('name', 'publisher', 'Maçaroca + Schön Medical')
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
    setMeta('name', 'theme-color', '#0b0b0b')
    setLink('canonical', canonicalUrl)
    setLink('icon', iconPath)
    setLink('shortcut icon', icoPath)
    setLink('apple-touch-icon', iconPath)

    const structuredData = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          '@id': `${origin}/#organization`,
          name: baseTitle,
          alternateName: [
            'Maçaroca',
            'Macaroca',
            'Maçaroca Moda',
            'Macaroca Moda',
            'Schön Medical',
            'Schon Medical',
            'Schön Medical by Maçaroca',
            'Schon Medical by Macaroca',
          ],
          url: origin,
          logo: logoUrl,
          image: imageUrl,
          description: organizationDescription[language],
          email: contactInfo.email.display,
          sameAs: [
            contactInfo.socialMedia.instagram.link,
            contactInfo.socialMedia.instagramSchon.link,
          ],
          areaServed: [
            { '@type': 'Country', name: 'Brasil' },
            { '@type': 'Country', name: 'Paraguai' },
          ],
          knowsAbout: [
            'moda autoral',
            'moda feminina',
            'moda sob medida',
            'peças sob demanda',
            'roupas sob demanda',
            'roupas sob medida',
            'scrubs',
            'scrubs coloridos',
            'scrubs sob demanda',
            'orientação de medidas',
            'uniformes profissionais',
            'uniformes para profissionais da saúde',
            'fabricado no Paraguai',
          ],
          hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: 'Catálogo Maçaroca + Schön Medical',
            itemListElement: [
              {
                '@type': 'OfferCatalog',
                name: 'Moda autoral feminina Maçaroca',
                itemListElement: [
                  {
                    '@type': 'Offer',
                    itemOffered: {
                      '@type': 'Service',
                      name: 'Atendimento sob consulta para peças autorais',
                      brand: { '@id': `${origin}/#macaroca-brand` },
                      serviceType: 'Moda autoral feminina sob demanda',
                      areaServed: [
                        { '@type': 'Country', name: 'Brasil' },
                        { '@type': 'Country', name: 'Paraguai' },
                      ],
                      provider: { '@id': `${origin}/#organization` },
                    },
                  },
                ],
              },
              {
                '@type': 'OfferCatalog',
                name: 'Scrubs Schön Medical',
                itemListElement: [
                  {
                    '@type': 'Offer',
                    itemOffered: {
                      '@type': 'Service',
                      name: 'Atendimento sob consulta para scrubs Schön Medical',
                      brand: { '@id': `${origin}/#schon-medical-brand` },
                      serviceType: 'Scrubs sob demanda',
                      areaServed: [
                        { '@type': 'Country', name: 'Brasil' },
                        { '@type': 'Country', name: 'Paraguai' },
                      ],
                      provider: { '@id': `${origin}/#organization` },
                    },
                  },
                ],
              },
            ],
          },
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
