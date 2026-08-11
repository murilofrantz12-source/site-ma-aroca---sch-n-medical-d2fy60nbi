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
const siteOrigin = 'https://xn--maaroca-vxa.com'
const imagePath = '/og-image.png?v=10'

const organizationDescription: Record<Language, string> = {
  pt: 'Maçaroca é moda feminina autoral, peças sob medida e sob demanda. A Schön Medical, by Maçaroca, reúne scrubs, pijama médico e uniformes para profissionais da saúde.',
  es: 'Maçaroca es moda femenina de autor, piezas a medida y a pedido. Schön Medical, by Maçaroca, reúne scrubs, pijama médico y uniformes para profesionales de la salud.',
  en: 'Maçaroca creates authorial womenswear, made-to-measure and made-to-order pieces. Schön Medical by Maçaroca offers scrubs and medical uniforms for healthcare professionals.',
}

const pages: Record<string, Record<Language, SEOPage>> = {
  '/': {
    pt: {
      title: 'Maçaroca | Moda feminina autoral e sob medida',
      description:
        'Maçaroca cria moda feminina autoral, peças sob medida e sob demanda com presença, identidade e acabamento de luxo.',
      keywords:
        'Maçaroca, Macaroca, Maçaroca moda, Macaroca moda, moda, moda feminina, moda autoral, moda sob medida, sob medida, luxo Maçaroca, luxo maçarora, peças sob demanda',
    },
    es: {
      title: 'Maçaroca | Moda femenina de autor y a medida',
      description:
        'Maçaroca crea moda femenina de autor, piezas a medida y a pedido con presencia, identidad y acabado de lujo.',
      keywords:
        'Maçaroca, Macaroca, Maçaroca moda, Macaroca moda, moda, moda femenina, moda de autor, moda a medida, a medida, lujo Maçaroca, luxo maçarora, piezas a pedido',
    },
    en: {
      title: 'Maçaroca | Authorial womenswear and made-to-measure fashion',
      description:
        'Maçaroca creates authorial womenswear, made-to-measure and made-to-order pieces with presence, identity and a luxury finish.',
      keywords:
        'Maçaroca, Macaroca, Maçaroca fashion, Macaroca fashion, fashion, womenswear, authorial fashion, made to measure, made-to-order fashion, luxury Maçaroca, luxo maçarora',
    },
  },
  '/colecoes': {
    pt: {
      title: 'Catálogo | Maçaroca e Schön Medical',
      description:
        'Curadoria Maçaroca e Schön Medical: moda feminina autoral, peças sob medida, scrubs e pijama médico sob demanda.',
      keywords:
        'catálogo Maçaroca, catálogo Schön Medical, Maçaroca moda, moda feminina, scrub, scrubs, pijama médico, pijama medico, peças sob medida',
    },
    es: {
      title: 'Catálogo | Maçaroca y Schön Medical',
      description:
        'Curaduría Maçaroca y Schön Medical: moda femenina de autor, piezas a medida, scrubs y pijama médico a pedido.',
      keywords:
        'catálogo Maçaroca, catálogo Schön Medical, Maçaroca moda, moda femenina, scrub, scrubs, pijama médico, pijama medico, piezas a medida',
    },
    en: {
      title: 'Catalog | Maçaroca and Schön Medical',
      description:
        'Maçaroca and Schön Medical curation: authorial womenswear, made-to-measure pieces, scrubs and medical uniforms made to order.',
      keywords:
        'Maçaroca catalog, Schön Medical catalog, Maçaroca fashion, womenswear, scrub, scrubs, medical uniform, medical scrubs, made to measure',
    },
  },
  '/schon-medical': {
    pt: {
      title: 'Schön Medical | Scrubs e pijama médico sob demanda',
      description:
        'Schön Medical by Maçaroca: scrubs, pijama médico e uniformes para profissionais da saúde, feitos sob demanda com orientação de medidas, cores e conforto para longas rotinas.',
      keywords:
        'Schön, Schon, Schön Medical, Schon Medical, scrub, scrubs, pijama médico, pijama medico, uniforme médico, uniforme medico, uniformes saúde, scrubs sob demanda, Maçaroca',
    },
    es: {
      title: 'Schön Medical | Scrubs y pijama médico a pedido',
      description:
        'Schön Medical by Maçaroca: scrubs, pijama médico y uniformes para profesionales de la salud, hechos a pedido con orientación de medidas, colores y comodidad para rutinas largas.',
      keywords:
        'Schön, Schon, Schön Medical, Schon Medical, scrub, scrubs, pijama médico, pijama medico, uniforme médico, uniforme medico, uniformes salud, scrubs a pedido, Maçaroca',
    },
    en: {
      title: 'Schön Medical | Made-to-order scrubs and medical uniforms',
      description:
        'Schön Medical by Maçaroca: scrubs and medical uniforms for healthcare professionals, made to order with measurement guidance, colors and comfort for long routines.',
      keywords:
        'Schön, Schon, Schön Medical, Schon Medical, scrub, scrubs, medical scrubs, medical uniform, healthcare uniforms, made-to-order scrubs, Maçaroca',
    },
  },
  '/sobre': {
    pt: {
      title: 'Sobre a marca | Maçaroca moda autoral',
      description:
        'Conheça a Maçaroca: moda feminina autoral, peças sob medida e sob demanda com estética de luxo, presença e identidade no vestir.',
      keywords:
        'sobre Maçaroca, história Maçaroca, Maçaroca moda, moda feminina, moda autoral, moda sob medida, sob medida, luxo Maçaroca, luxo maçarora',
    },
    es: {
      title: 'Sobre la marca | Maçaroca moda de autor',
      description:
        'Conoce Maçaroca: moda femenina de autor, piezas a medida y a pedido con estética de lujo, presencia e identidad al vestir.',
      keywords:
        'sobre Maçaroca, historia Maçaroca, Maçaroca moda, moda femenina, moda de autor, moda a medida, a medida, lujo Maçaroca, luxo maçarora',
    },
    en: {
      title: 'About the brand | Maçaroca authorial fashion',
      description:
        'Meet Maçaroca: authorial womenswear, made-to-measure and made-to-order pieces with luxury aesthetics, presence and identity.',
      keywords:
        'about Maçaroca, Maçaroca story, Maçaroca fashion, womenswear, authorial fashion, made to measure, luxury Maçaroca, luxo maçarora',
    },
  },
  '/contato': {
    pt: {
      title: 'Contato | Maçaroca',
      description:
        'Fale com a Maçaroca para pedidos sob demanda, orientação de medidas, scrubs Schön Medical e atendimento Brasil ou Paraguai.',
      keywords: 'contato Maçaroca, atendimento Schön Medical, WhatsApp Maçaroca, pedidos sob demanda',
    },
    es: {
      title: 'Contacto | Maçaroca',
      description:
        'Habla con Maçaroca para pedidos a medida, orientación de medidas, scrubs Schön Medical y atención Brasil o Paraguay.',
      keywords: 'contacto Maçaroca, atención Schön Medical, WhatsApp Maçaroca, pedidos a medida',
    },
    en: {
      title: 'Contact | Maçaroca',
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
    const origin = siteOrigin
    const canonicalUrl = `${origin}${pathname}`
    const imageUrl = `${origin}${imagePath}`
    const locale = language === 'pt' ? 'pt_BR' : language === 'es' ? 'es_PY' : 'en_US'
    const shouldIndex = Boolean(pages[pathname])
    const pageAbout =
      pathname === '/schon-medical'
        ? { '@id': `${origin}/schon-medical#service` }
        : pathname === '/' || pathname === '/sobre'
          ? { '@id': `${origin}/#fashion-service` }
          : { '@id': `${origin}/#organization` }

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
          alternateName: [
            'Maçaroca',
            'Macaroca',
            'Maçaroca moda',
            'Macaroca moda',
            'Schön Medical',
            'Schon Medical',
            'Schön Medical by Maçaroca',
          ],
          url: origin,
          logo: imageUrl,
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
            'moda feminina',
            'moda autoral',
            'moda sob medida',
            'peças sob medida',
            'peças sob demanda',
            'luxo Maçaroca',
            'scrub',
            'scrubs',
            'pijama médico',
            'pijama medico',
            'uniforme médico',
            'uniforme medico',
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
          '@type': 'Service',
          '@id': `${origin}/schon-medical#service`,
          name: 'Schön Medical - scrubs e pijama médico sob demanda',
          alternateName: [
            'Schon Medical',
            'Schön',
            'Schon',
            'scrubs profissionais',
            'pijama médico',
            'pijama medico',
          ],
          serviceType: 'Scrubs, pijama médico e uniformes para profissionais da saúde',
          url: `${origin}/schon-medical`,
          provider: { '@id': `${origin}/#organization` },
          areaServed: [
            { '@type': 'Country', name: 'Brasil' },
            { '@type': 'Country', name: 'Paraguai' },
          ],
          keywords:
            'schon, schon medical, pijama medico, pijama médico, scrub, scrubs, uniforme médico, uniforme medico',
        },
        {
          '@type': 'Service',
          '@id': `${origin}/#fashion-service`,
          name: 'Maçaroca - moda feminina autoral e sob medida',
          alternateName: ['Maçaroca moda', 'Macaroca moda', 'luxo Maçaroca', 'luxo maçarora'],
          serviceType: 'Moda feminina autoral, peças sob medida e sob demanda',
          url: origin,
          provider: { '@id': `${origin}/#organization` },
          areaServed: [
            { '@type': 'Country', name: 'Brasil' },
            { '@type': 'Country', name: 'Paraguai' },
          ],
          keywords:
            'moda, moda feminina, sob medida, luxo Maçaroca, luxo maçarora, moda autoral',
        },
        {
          '@type': 'WebSite',
          '@id': `${origin}/#website`,
          name: baseTitle,
          url: origin,
          inLanguage: locale.replace('_', '-'),
          publisher: { '@id': `${origin}/#organization` },
          potentialAction: {
            '@type': 'SearchAction',
            target: `${origin}/colecoes?q={search_term_string}`,
            'query-input': 'required name=search_term_string',
          },
        },
        {
          '@type': 'WebPage',
          '@id': `${canonicalUrl}#webpage`,
          url: canonicalUrl,
          name: page.title,
          description: page.description,
          inLanguage: locale.replace('_', '-'),
          isPartOf: { '@id': `${origin}/#website` },
          about: pageAbout,
          keywords: page.keywords,
          publisher: { '@id': `${origin}/#organization` },
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
