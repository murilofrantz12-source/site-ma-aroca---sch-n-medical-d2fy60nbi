export const contactInfo = {
  brandName: 'Maçaroca',
  whatsapp: {
    brasil: {
      label: 'Brasil',
      displayNumber: '+55 (44) 99988-1151',
      rawNumber: '5544999881151',
      message: 'Olá, vim pelo site da Maçaroca e gostaria de receber um atendimento personalizado.',
      link: 'https://wa.me/5544999881151?text=Ol%C3%A1%2C%20vim%20pelo%20site%20da%20Ma%C3%A7aroca%20e%20gostaria%20de%20receber%20um%20atendimento%20personalizado.',
    },
    paraguai: {
      label: 'Paraguai',
      displayNumber: '+595 987 317 911',
      rawNumber: '595987317911',
      message:
        'Hola, vengo del sitio web de Maçaroca y me gustaría recibir atención personalizada.',
      link: 'https://wa.me/595987317911?text=Hola%2C%20vengo%20del%20sitio%20web%20de%20Ma%C3%A7aroca%20y%20me%20gustar%C3%ADa%20recibir%20atenci%C3%B3n%20personalizada.',
    },
  },
  businessHours: 'Segunda a sexta, das 7h às 18h',
  email: {
    display: 'macaroca.atelier@gmail.com',
    link: 'mailto:macaroca.atelier@gmail.com',
  },
  location: {
    title: 'ATENDIMENTO ONLINE',
    city: 'Base em Assunção, PY',
    description: 'Atendimento personalizado pelo Instagram, WhatsApp e e-mail.',
  },
  socialMedia: {
    instagram: {
      username: '@mmacaroca',
      link: 'https://www.instagram.com/mmacaroca/',
    },
    instagramSchon: {
      username: '@schonmedical',
      link: 'https://www.instagram.com/schonmedical/',
    },
  },
} as const

export const WHATSAPP_URL = contactInfo.whatsapp.brasil.link
export const INSTAGRAM_URL = contactInfo.socialMedia.instagram.link
export const SCHON_INSTAGRAM_URL = contactInfo.socialMedia.instagramSchon.link
