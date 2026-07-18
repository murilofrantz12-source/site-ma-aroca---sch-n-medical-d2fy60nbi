import { createContext, useContext, useEffect, useMemo, useState } from 'react'

export type Language = 'pt' | 'es' | 'en'

const STORAGE_KEY = 'macaroca-language'

export const LANGUAGES: Array<{ code: Language; flag: string; label: string; shortLabel: string }> =
  [
    { code: 'pt', flag: '🇧🇷', label: 'Português', shortLabel: 'PT' },
    { code: 'es', flag: '🇵🇾', label: 'Español', shortLabel: 'ES' },
    { code: 'en', flag: '🇺🇸', label: 'English', shortLabel: 'EN' },
  ]

export const translations = {
  pt: {
    nav: {
      home: 'Início',
      collections: 'Coleções',
      schon: 'Schön Medical',
      about: 'Sobre',
      contact: 'Contato',
    },
    common: {
      whatsapp: 'Falar no WhatsApp',
      chooseService: 'Escolha o atendimento',
      chooseServiceText: 'Selecione o país para iniciar a conversa pelo WhatsApp.',
      brasil: 'Brasil',
      paraguai: 'Paraguai',
      consult: 'Consultar',
      selectLanguage: 'Selecionar idioma',
      instagram: 'Instagram',
    },
    footer: {
      description:
        'Moda autoral para mulheres que ocupam o próprio espaço com elegância, presença e liberdade.',
      navigation: 'Navegação',
      support: 'Suporte',
      exchanges: 'Trocas e Entregas',
      privacy: 'Política de Privacidade',
      talkToUs: 'Fale Conosco',
      contact: 'Contato',
      rights: 'Todos os direitos reservados.',
    },
    contactInfo: {
      businessHours: 'Segunda a sexta, das 7h às 18h',
      locationTitle: 'ATENDIMENTO ONLINE',
      locationCity: 'Base em Assunção, PY',
      locationDescription: 'Atendimento personalizado pelo Instagram, WhatsApp e e-mail.',
    },
    whatsapp: {
      defaultMessage:
        'Olá, vim pelo site da Maçaroca e gostaria de receber um atendimento personalizado.',
      productMessage:
        'Olá, tenho interesse em {{product}}, da {{brand}}. Gostaria de consultar disponibilidade, medidas e valores.',
      schonMessage:
        'Olá, vim pelo site e gostaria de consultar um scrub da Schön Medical. Pode me orientar sobre modelos, medidas, cores e prazo?',
    },
    home: {
      heroAlt: 'Maçaroca Fashion',
      srTitle: 'Maçaroca e Schön Medical - moda autoral e scrubs sob demanda',
      heroText:
        'Moda autoral e scrubs sob demanda para quem entende que vestir bem também é ocupar o mundo com presença.',
      seeCatalog: 'Ver Catálogo',
      whatsapp: 'Falar pelo WhatsApp',
      knowSchon: 'Conhecer Schön Medical',
      macarocaText:
        'Peças femininas autorais, criadas em pequena escala para vestir corpo, gesto e personalidade com naturalidade.',
      consultPieces: 'Consultar Peças',
      schonText:
        'Scrubs completos e personalizados para rotinas intensas, com conforto, precisão e imagem profissional.',
      knowLine: 'Conhecer a Linha',
      requestBudget: 'Pedir Orçamento',
      trust: [
        'Atendimento sob medida',
        'Produção por demanda',
        'Orientação de medidas',
        'Pedidos individuais e equipes',
      ],
      manifestoLabel: 'Manifesto',
      manifestoTitle: 'A Roupa como Expressão',
      manifestoText:
        'A Maçaroca nasce da roupa como linguagem: criação autoral, atendimento próximo e produção sob demanda. A Schön Medical leva esse olhar ao universo da saúde, onde conforto, qualidade e presença também importam.',
      features: [
        {
          title: 'Produção sob demanda',
          desc: 'Cada peça nasce com intenção: tecido, medida, prazo e finalidade são pensados pedido a pedido.',
        },
        {
          title: 'Presença no vestir',
          desc: 'Da peça autoral ao scrub, o foco é unir estética, conforto e identidade em uma mesma experiência.',
        },
        {
          title: 'Atendimento direto',
          desc: 'A conversa começa pelo WhatsApp, com orientação sobre medidas, cores, prazos e possibilidades.',
        },
      ],
    },
    catalog: {
      title: 'Catálogo',
      eyebrow: 'Curadoria',
      statusLabel: 'Linha em apresentação',
      note: 'Curadoria inicial',
      availabilityLabel: 'Disponível sob consulta',
      viewDetails: 'Ver detalhes',
      buildSchon: 'Monte seu Schön',
      intro:
        'Uma curadoria inicial para apresentar os dois caminhos da marca: criação autoral Maçaroca e scrubs Schön Medical sob demanda.',
      empty: 'Nenhuma peça encontrada para esta categoria.',
      seeAll: 'Ver todas as peças',
      products: {
        macaroca: {
          name: 'Maçaroca',
          category: 'Peças autorais sob consulta',
          price: 'Disponível sob consulta',
          description:
            'Criações femininas sob demanda, pensadas a partir de intenção, medidas e presença.',
          sizes: ['Sob medida'],
          details: ['Criação autoral', 'Disponível sob consulta', 'Atendimento próximo'],
        },
        scrub: {
          name: 'Schön Medical',
          category: 'Scrubs sob demanda',
          price: 'A partir de R$ 187',
          description:
            'Scrubs completos para rotina profissional, com orientação de medidas, cores e modelos.',
          details: ['Cores personalizáveis', 'Pedidos individuais e equipes', 'Prévia visual'],
        },
      },
    },
    schon: {
      sideLabel: 'Schön Medical',
      title: 'Schön Medical by Maçaroca',
      tagline: 'Vista conforto.\nTransmita confiança.',
      intro:
        'Scrubs sob demanda para profissionais que precisam de conforto, movimento e uma imagem à altura da própria rotina.',
      priceText: 'A partir de R$ 187',
      requestBudget: 'Solicitar orçamento',
      valueLabel: 'Precisão, conforto e presença',
      whyTitle: 'Por que escolher a Schön?',
      whyText:
        'Uma linha criada para transformar uniforme em presença profissional: funcional, elegante e feita para acompanhar longas jornadas.',
      values: [
        {
          title: 'Conforto na rotina',
          desc: 'Modelagem pensada para movimento, plantões, atendimentos e jornadas que exigem constância.',
        },
        {
          title: 'Imagem profissional',
          desc: 'Scrubs com visual limpo e firme, alinhados à autoridade de quem veste.',
        },
        {
          title: 'Pedidos individuais ou para equipes',
          desc: 'Atendimento para profissionais, duplas, equipes, clínicas e consultórios.',
        },
        {
          title: 'Acabamento funcional',
          desc: 'Modelos com bolsos, recortes e detalhes pensados para acompanhar a rotina com praticidade.',
        },
      ],
      processTitle: 'Como funciona o pedido',
      processText:
        'O atendimento acontece pelo WhatsApp para alinhar medidas, modelos, cores e prazo.',
      steps: [
        {
          title: '1. Conversa inicial',
          desc: 'Você informa tamanho, cor desejada e se o pedido é individual ou para equipe.',
        },
        {
          title: '2. Medidas e detalhes',
          desc: 'Alinhamos medidas, caimento, modelo e detalhes importantes para o uso diário.',
        },
        {
          title: '3. Produção sob demanda',
          desc: 'Com o pedido confirmado, combinamos prazo, pagamento e acompanhamento da produção.',
        },
      ],
      ctaTitle: 'Sua rotina também merece vestir presença.',
      ctaText:
        'Fale pelo WhatsApp para consultar valores, medidas, cores disponíveis e modelos.',
      talkToConsultant: 'Falar com Consultora',
      customizer: {
        eyebrow: 'Monte seu Schön',
        title: 'Monte seu scrub antes do orçamento',
        intro:
          'Escolha cores, tamanhos da blusa e da calça, modelo de bolsos, fitas e etiqueta. No final, envie a composição pronta para receber um orçamento.',
        previewLabel: 'Prévia visual',
        previewTitle: 'Sua composição',
        previewDisclaimer: 'Prévia ilustrativa',
        previewNote:
          'A prévia é uma referência visual; nossa equipe confirma disponibilidade no atendimento.',
        summaryLabel: 'Resumo da composição',
        finalTitle: 'Composição pronta',
        finalText:
          'Ao enviar, nossa equipe recebe suas escolhas e continua o atendimento pelo WhatsApp para confirmar medidas, prazo e valor.',
        submit: 'Enviar para orçamento',
        submitWithPreview: 'Enviar composição pelo WhatsApp',
        messageTitle: 'Olá, gostaria de um orçamento Schön Medical com esta composição:',
        messageFooter: 'Pode me orientar sobre valores, medidas e prazo?',
        downloadPreview: 'Baixar prévia',
        downloadNote: 'Prévia visual para orçamento. Valores e prazos sob confirmação.',
        labels: {
          topColor: 'Cor da blusa',
          bottomColor: 'Cor da calça',
          ribbonColor: 'Cor das fitas',
          labelColor: 'Cor da etiqueta',
          topSize: 'Tamanho da blusa',
          bottomSize: 'Tamanho da calça',
          model: 'Modelo',
          topPrice: 'Blusa',
          bottomPrice: 'Calça',
          totalPrice: 'Conjunto',
        },
        steps: {
          topColor: 'Cor da parte de cima',
          bottomColor: 'Cor da parte de baixo',
          ribbonColor: 'Cor das fitas',
          labelColor: 'Cor da etiqueta',
          topSize: 'Tamanho da blusa',
          bottomSize: 'Tamanho da calça',
          model: 'Modelo e bolsos',
        },
        topColors: [
          { name: 'Bordô', value: '#8c124b' },
          { name: 'Lilás', value: '#b477c8' },
          { name: 'Azul profundo', value: '#07066f' },
          { name: 'Preto', value: '#050505' },
          { name: 'Pink Schön', value: '#d80b8c' },
          { name: 'Lavanda claro', value: '#ddc8f5' },
          { name: 'Azul claro', value: '#94c6f2' },
          { name: 'Verde água', value: '#a9efe2' },
          { name: 'Rosa bebê', value: '#f5a9d8' },
          { name: 'Rosa blush', value: '#f2d2dc' },
          { name: 'Coral suave', value: '#ff9aa0' },
          { name: 'Verde oliva', value: '#3d5b41' },
          { name: 'Vermelho', value: '#df0000' },
          { name: 'Laranja Schön', value: '#ff520d' },
          { name: 'Amarelo Schön', value: '#ffe600' },
          { name: 'Branco', value: '#ffffff' },
        ],
        bottomColors: [
          { name: 'Bordô', value: '#8c124b' },
          { name: 'Lilás', value: '#b477c8' },
          { name: 'Azul profundo', value: '#07066f' },
          { name: 'Preto', value: '#050505' },
          { name: 'Pink Schön', value: '#d80b8c' },
          { name: 'Lavanda claro', value: '#ddc8f5' },
          { name: 'Azul claro', value: '#94c6f2' },
          { name: 'Verde água', value: '#a9efe2' },
          { name: 'Rosa bebê', value: '#f5a9d8' },
          { name: 'Rosa blush', value: '#f2d2dc' },
          { name: 'Coral suave', value: '#ff9aa0' },
          { name: 'Verde oliva', value: '#3d5b41' },
          { name: 'Vermelho', value: '#df0000' },
          { name: 'Laranja Schön', value: '#ff520d' },
          { name: 'Amarelo Schön', value: '#ffe600' },
          { name: 'Branco', value: '#ffffff' },
        ],
        ribbonColors: [
          { name: 'Pink Schön', value: '#ef2f92' },
          { name: 'Verde Schön', value: '#b8f24a' },
          { name: 'Preto', value: '#101010' },
          { name: 'Branco off', value: '#f7f5ef' },
          { name: 'Laranja Schön', value: '#ff681f' },
          { name: 'Azul marinho', value: '#172849' },
          { name: 'Bordô', value: '#68192c' },
          { name: 'Dourado', value: '#c6a15b' },
          { name: 'Prata', value: '#c8c8c8' },
        ],
        labelColors: [
          { name: 'Verde Schön', value: '#b8f24a' },
          { name: 'Pink Schön', value: '#ef2f92' },
          { name: 'Bordô', value: '#68192c' },
          { name: 'Laranja Schön', value: '#ff681f' },
          { name: 'Azul marinho', value: '#172849' },
          { name: 'Branco off', value: '#f7f5ef' },
          { name: 'Preto', value: '#101010' },
        ],
        sizes: ['PP', 'P', 'M', 'G', 'GG', 'XG', 'EXG', 'EXGG'],
        models: [
          {
            name: 'Classic',
            pockets: '2 bolsos',
            desc: 'Linha objetiva, com corte limpo e bolsos essenciais para uma rotina mais leve.',
            topPrice: 'R$ 83',
            bottomPrice: 'R$ 104',
            setPrice: 'R$ 187',
          },
          {
            name: 'Max',
            pockets: '6 bolsos',
            desc: 'Mais funcionalidade no dia a dia, com bolsos laterais e proposta tipo jogger.',
            topPrice: 'R$ 100',
            bottomPrice: 'R$ 120',
            setPrice: 'R$ 220',
          },
          {
            name: 'Premier',
            pockets: '9 bolsos',
            desc: 'Modelo mais completo da linha, com mais bolsos, abertura lateral e acabamento funcional.',
            topPrice: 'R$ 117',
            bottomPrice: 'R$ 137',
            setPrice: 'R$ 254',
          },
        ],
      },
    },
    about: {
      title: 'A Marca',
      eyebrow: 'Origem e presença',
      intro:
        'A Maçaroca nasce do encontro entre criação autoral, atendimento próximo e produção com intenção. A Schön Medical amplia esse olhar para a rotina de quem precisa vestir conforto, praticidade e presença todos os dias.',
      pillars: [
        {
          title: 'Criação autoral',
          desc: 'Peças pensadas para carregar identidade, movimento e um jeito próprio de ocupar o mundo.',
        },
        {
          title: 'Olhar sob medida',
          desc: 'A conversa, as medidas e a rotina de quem veste orientam cada decisão de criação.',
        },
        {
          title: 'Presença no vestir',
          desc: 'A roupa como linguagem: confortável, elegante e feita para fortalecer quem usa.',
        },
      ],
      values: [
        { label: '01', title: 'Pequenas produções, mais intenção.' },
        { label: '02', title: 'Atendimento próximo, sem pressa.' },
        { label: '03', title: 'Moda e rotina com a mesma dignidade.' },
      ],
      manifestoLabel: 'Manifesto',
      macarocaTitle: 'A Essência Maçaroca',
      macarocaP1:
        'A Maçaroca é a marca principal: um espaço de criação para peças femininas autorais, pensadas para vestir corpo, presença e identidade sem apagar a liberdade de quem usa.',
      macarocaP2:
        'A produção em pequena escala permite um olhar mais próximo para medidas, tecido, acabamento e intenção. Cada pedido começa com conversa, não com pressa: primeiro entendemos a mulher, depois pensamos a peça.',
      macarocaCta: 'Ver catálogo',
      evolutionLabel: 'Evolução',
      schonTitle: 'A Linha Schön Medical',
      schonP1:
        'A Schön Medical surgiu como uma extensão natural da Maçaroca para o universo da saúde. O mercado abraçou a ideia, e a marca passou a olhar com mais cuidado para profissionais que passam horas trabalhando com a mesma roupa.',
      schonP2:
        'A proposta é simples e forte: se a roupa acompanha jornadas longas, ela precisa oferecer qualidade, praticidade, comodidade e uma forma mais elegante de se mover no trabalho. Não é sobre vestir apenas uma profissão; é sobre vestir uma rotina com respeito.',
      schonCta: 'Conhecer Schön Medical',
      quoteLabel: 'Síntese',
      quoteTitle: 'O Encontro Entre o Estilo e a Profissão',
      quote:
        'Da criação autoral ao uniforme de trabalho, a proposta é a mesma: vestir com cuidado, presença e poder.',
      catalogCta: 'Explorar catálogo',
      contactCta: 'Começar atendimento',
    },
    contact: {
      title: 'Contato',
      eyebrow: 'Atendimento',
      intro:
        'Um primeiro contato para entender sua rotina, suas medidas e o que a roupa precisa comunicar antes mesmo de ser vestida.',
      infoTitle: 'Informações',
      whatsapp: 'WhatsApp',
      email: 'E-mail',
      hours: 'Horário de Atendimento',
      social: 'Redes Sociais',
      chooseLabel: 'Atendimento direto',
      chooseTitle: 'Escolha seu atendimento',
      chooseText:
        'Fale com a Maçaroca pelo canal mais próximo de você. Atendemos pedidos individuais, peças sob demanda e equipes.',
      serviceItems: [
        {
          title: 'Sob medida',
          desc: 'Orientação de medidas para peças com melhor caimento e intenção.',
        },
        {
          title: 'Sob demanda',
          desc: 'Produção alinhada a cores, prazos, rotina e finalidade de uso.',
        },
        {
          title: 'Equipes',
          desc: 'Atendimento para pedidos individuais ou composição de grupos.',
        },
      ],
      formLabel: 'Pedido personalizado',
      formTitle: 'Comece seu atendimento',
      formIntro:
        'Conte o que você procura com calma. A partir daqui, seguimos pelo WhatsApp com orientação de medidas, possibilidades de tecido, cores e próximos passos.',
      responseTitle: 'Resposta personalizada',
      responseText:
        'Cada mensagem é lida com atenção para entender a necessidade real do pedido.',
      destinationText: 'Brasil ou Paraguai, conforme a sua preferência.',
      name: 'Nome Completo',
      namePlaceholder: 'Como devemos chamar você?',
      country: 'País do WhatsApp',
      countryPlaceholder: 'Selecione o país',
      phone: 'Telefone / WhatsApp',
      phonePlaceholder: '{{ddi}} + número com DDD',
      phonePlaceholderOther: '+ código do país + número',
      interest: 'Assunto de Interesse',
      interestPlaceholder: 'Selecione o assunto',
      options: ['Maçaroca', 'Schön Medical', 'Pedido personalizado', 'Orçamento para equipe', 'Outro'],
      message: 'Mensagem',
      messagePlaceholder: 'Conte o que você procura, para qual ocasião ou rotina...',
      sendTo: 'Enviar para',
      submit: 'Enviar para WhatsApp',
      formMessageLabels: {
        greeting: 'Olá, meu nome é',
        country: 'País do WhatsApp',
        phone: 'Telefone',
        interest: 'Interesse',
        message: 'Mensagem',
      },
    },
    notFound: {
      title: '404',
      text: 'Oops! Página não encontrada',
      back: 'Voltar para o início',
    },
  },
  es: {
    nav: {
      home: 'Inicio',
      collections: 'Colecciones',
      schon: 'Schön Medical',
      about: 'Sobre',
      contact: 'Contacto',
    },
    common: {
      whatsapp: 'Hablar por WhatsApp',
      chooseService: 'Elige la atención',
      chooseServiceText: 'Selecciona el país para iniciar la conversación por WhatsApp.',
      brasil: 'Brasil',
      paraguai: 'Paraguay',
      consult: 'Consultar',
      selectLanguage: 'Seleccionar idioma',
      instagram: 'Instagram',
    },
    footer: {
      description:
        'Moda de autor para mujeres que ocupan su propio espacio con elegancia, presencia y libertad.',
      navigation: 'Navegación',
      support: 'Soporte',
      exchanges: 'Cambios y Entregas',
      privacy: 'Política de Privacidad',
      talkToUs: 'Habla con Nosotros',
      contact: 'Contacto',
      rights: 'Todos los derechos reservados.',
    },
    contactInfo: {
      businessHours: 'Lunes a viernes, de 7h a 18h',
      locationTitle: 'ATENCIÓN ONLINE',
      locationCity: 'Base en Asunción, PY',
      locationDescription: 'Atención personalizada por Instagram, WhatsApp y e-mail.',
    },
    whatsapp: {
      defaultMessage:
        'Hola, vengo del sitio web de Maçaroca y me gustaría recibir atención personalizada.',
      productMessage:
        'Hola, tengo interés en {{product}}, de {{brand}}. Me gustaría consultar disponibilidad, medidas y valores.',
      schonMessage:
        'Hola, vengo del sitio web y me gustaría consultar un scrub de Schön Medical. ¿Me puedes orientar sobre modelos, medidas, colores y plazo?',
    },
    home: {
      heroAlt: 'Maçaroca Fashion',
      srTitle: 'Maçaroca y Schön Medical - moda de autor y scrubs a pedido',
      heroText:
        'Moda de autor y scrubs a pedido para quienes entienden que vestir bien también es ocupar el mundo con presencia.',
      seeCatalog: 'Ver Catálogo',
      whatsapp: 'Hablar por WhatsApp',
      knowSchon: 'Conocer Schön Medical',
      macarocaText:
        'Piezas femeninas de autor, creadas en pequeña escala para vestir cuerpo, gesto y personalidad con naturalidad.',
      consultPieces: 'Consultar Piezas',
      schonText:
        'Scrubs completos y personalizados para rutinas intensas, con comodidad, precisión e imagen profesional.',
      knowLine: 'Conocer la Línea',
      requestBudget: 'Pedir Presupuesto',
      trust: [
        'Atención a medida',
        'Producción a pedido',
        'Orientación de medidas',
        'Pedidos individuales y equipos',
      ],
      manifestoLabel: 'Manifiesto',
      manifestoTitle: 'La Ropa como Expresión',
      manifestoText:
        'Maçaroca nace de la ropa como lenguaje: creación de autor, atención cercana y producción a pedido. Schön Medical lleva esa mirada al universo de la salud, donde comodidad, calidad y presencia también importan.',
      features: [
        {
          title: 'Producción a pedido',
          desc: 'Cada pieza nace con intención: tejido, medida, plazo y finalidad se piensan pedido a pedido.',
        },
        {
          title: 'Presencia al vestir',
          desc: 'De la pieza de autor al scrub, el foco es unir estética, comodidad e identidad en una misma experiencia.',
        },
        {
          title: 'Atención directa',
          desc: 'La conversación empieza por WhatsApp, con orientación sobre medidas, colores, plazos y posibilidades.',
        },
      ],
    },
    catalog: {
      title: 'Catálogo',
      eyebrow: 'Curaduría',
      statusLabel: 'Línea en presentación',
      note: 'Curaduría inicial',
      availabilityLabel: 'Disponible a consultar',
      viewDetails: 'Ver detalles',
      buildSchon: 'Arma tu Schön',
      intro:
        'Una curaduría inicial para presentar los dos caminos de la marca: creación de autor Maçaroca y scrubs Schön Medical a pedido.',
      empty: 'No se encontró ninguna pieza para esta categoría.',
      seeAll: 'Ver todas las piezas',
      products: {
        macaroca: {
          name: 'Maçaroca',
          category: 'Piezas de autor a consultar',
          price: 'Disponible a consultar',
          description:
            'Creaciones femeninas a pedido, pensadas desde la intención, las medidas y la presencia.',
          sizes: ['A medida'],
          details: ['Creación de autor', 'Disponible a consultar', 'Atención cercana'],
        },
        scrub: {
          name: 'Schön Medical',
          category: 'Scrubs a pedido',
          price: 'Desde Gs. 180.000',
          description:
            'Scrubs completos para la rutina profesional, con orientación de medidas, colores y modelos.',
          details: ['Colores personalizables', 'Pedidos individuales y equipos', 'Vista previa'],
        },
      },
    },
    schon: {
      sideLabel: 'Schön Medical',
      title: 'Schön Medical by Maçaroca',
      tagline: 'Viste comodidad.\nTransmite confianza.',
      intro:
        'Scrubs a pedido para profesionales que necesitan comodidad, movimiento y una imagen a la altura de su rutina.',
      priceText: 'Desde Gs. 180.000',
      requestBudget: 'Solicitar presupuesto',
      valueLabel: 'Precisión, comodidad y presencia',
      whyTitle: '¿Por qué elegir Schön?',
      whyText:
        'Una línea creada para transformar el uniforme en presencia profesional: funcional, elegante y hecha para acompañar largas jornadas.',
      values: [
        {
          title: 'Comodidad en la rutina',
          desc: 'Moldería pensada para movimiento, guardias, atenciones y jornadas que exigen constancia.',
        },
        {
          title: 'Imagen profesional',
          desc: 'Scrubs con visual limpio y firme, alineados a la autoridad de quien los viste.',
        },
        {
          title: 'Pedidos individuales o para equipos',
          desc: 'Atención para profesionales, duplas, equipos, clínicas y consultorios.',
        },
        {
          title: 'Terminación funcional',
          desc: 'Modelos con bolsillos, cortes y detalles pensados para acompañar la rutina con practicidad.',
        },
      ],
      processTitle: 'Cómo funciona el pedido',
      processText:
        'La atención ocurre por WhatsApp para alinear medidas, modelos, colores y plazo.',
      steps: [
        {
          title: '1. Conversa inicial',
          desc: 'Informas talle, color deseado y si el pedido es individual o para equipo.',
        },
        {
          title: '2. Medidas y detalles',
          desc: 'Alineamos medidas, calce, modelo y detalles importantes para el uso diario.',
        },
        {
          title: '3. Producción a pedido',
          desc: 'Con el pedido confirmado, combinamos plazo, pago y seguimiento de la producción.',
        },
      ],
      ctaTitle: 'Tu rutina también merece vestir presencia.',
      ctaText:
        'Habla por WhatsApp para consultar valores, medidas, colores disponibles y modelos.',
      talkToConsultant: 'Hablar con una Consultora',
      customizer: {
        eyebrow: 'Arma tu Schön',
        title: 'Arma tu scrub antes del presupuesto',
        intro:
          'Elige colores, talles de blusa y pantalón, modelo de bolsillos, cintas y etiqueta. Al final, envía la composición lista para recibir un presupuesto.',
        previewLabel: 'Vista previa',
        previewTitle: 'Tu composición',
        previewDisclaimer: 'Vista ilustrativa',
        previewNote:
          'La vista previa es una referencia visual; nuestro equipo confirma calce, medidas y disponibilidad de colores durante la atención.',
        summaryLabel: 'Resumen de la composición',
        finalTitle: 'Composición lista',
        finalText:
          'Al enviar, nuestro equipo recibe tus elecciones y continúa la atención por WhatsApp para confirmar medidas, plazo y valor.',
        submit: 'Enviar para presupuesto',
        submitWithPreview: 'Enviar composición por WhatsApp',
        messageTitle: 'Hola, me gustaría un presupuesto Schön Medical con esta composición:',
        messageFooter: '¿Podrían orientarme sobre valores, medidas y plazo?',
        downloadPreview: 'Descargar vista',
        downloadNote: 'Vista previa para presupuesto. Valores y plazos sujetos a confirmación.',
        labels: {
          topColor: 'Color de la blusa',
          bottomColor: 'Color del pantalón',
          ribbonColor: 'Color de las cintas',
          labelColor: 'Color de la etiqueta',
          topSize: 'Talle de blusa',
          bottomSize: 'Talle de pantalón',
          model: 'Modelo',
          topPrice: 'Blusa',
          bottomPrice: 'Pantalón',
          totalPrice: 'Conjunto',
        },
        steps: {
          topColor: 'Color de la parte superior',
          bottomColor: 'Color de la parte inferior',
          ribbonColor: 'Color de las cintas',
          labelColor: 'Color de la etiqueta',
          topSize: 'Talle de blusa',
          bottomSize: 'Talle de pantalón',
          model: 'Modelo y bolsillos',
        },
        topColors: [
          { name: 'Bordó', value: '#8c124b' },
          { name: 'Lila', value: '#b477c8' },
          { name: 'Azul profundo', value: '#07066f' },
          { name: 'Negro', value: '#050505' },
          { name: 'Pink Schön', value: '#d80b8c' },
          { name: 'Lavanda claro', value: '#ddc8f5' },
          { name: 'Azul claro', value: '#94c6f2' },
          { name: 'Verde agua', value: '#a9efe2' },
          { name: 'Rosa bebé', value: '#f5a9d8' },
          { name: 'Rosa blush', value: '#f2d2dc' },
          { name: 'Coral suave', value: '#ff9aa0' },
          { name: 'Verde oliva', value: '#3d5b41' },
          { name: 'Rojo', value: '#df0000' },
          { name: 'Naranja Schön', value: '#ff520d' },
          { name: 'Amarillo Schön', value: '#ffe600' },
          { name: 'Blanco', value: '#ffffff' },
        ],
        bottomColors: [
          { name: 'Bordó', value: '#8c124b' },
          { name: 'Lila', value: '#b477c8' },
          { name: 'Azul profundo', value: '#07066f' },
          { name: 'Negro', value: '#050505' },
          { name: 'Pink Schön', value: '#d80b8c' },
          { name: 'Lavanda claro', value: '#ddc8f5' },
          { name: 'Azul claro', value: '#94c6f2' },
          { name: 'Verde agua', value: '#a9efe2' },
          { name: 'Rosa bebé', value: '#f5a9d8' },
          { name: 'Rosa blush', value: '#f2d2dc' },
          { name: 'Coral suave', value: '#ff9aa0' },
          { name: 'Verde oliva', value: '#3d5b41' },
          { name: 'Rojo', value: '#df0000' },
          { name: 'Naranja Schön', value: '#ff520d' },
          { name: 'Amarillo Schön', value: '#ffe600' },
          { name: 'Blanco', value: '#ffffff' },
        ],
        ribbonColors: [
          { name: 'Pink Schön', value: '#ef2f92' },
          { name: 'Verde Schön', value: '#b8f24a' },
          { name: 'Negro', value: '#101010' },
          { name: 'Blanco off', value: '#f7f5ef' },
          { name: 'Naranja Schön', value: '#ff681f' },
          { name: 'Azul marino', value: '#172849' },
          { name: 'Bordó', value: '#68192c' },
          { name: 'Dorado', value: '#c6a15b' },
          { name: 'Plata', value: '#c8c8c8' },
        ],
        labelColors: [
          { name: 'Verde Schön', value: '#b8f24a' },
          { name: 'Pink Schön', value: '#ef2f92' },
          { name: 'Bordó', value: '#68192c' },
          { name: 'Naranja Schön', value: '#ff681f' },
          { name: 'Azul marino', value: '#172849' },
          { name: 'Blanco off', value: '#f7f5ef' },
          { name: 'Negro', value: '#101010' },
        ],
        sizes: ['PP', 'P', 'M', 'G', 'GG', 'XG', 'EXG', 'EXGG'],
        models: [
          {
            name: 'Classic',
            pockets: '2 bolsillos',
            desc: 'Línea objetiva, con corte limpio y bolsillos esenciales para una rutina más ligera.',
            topPrice: 'Gs. 80.000',
            bottomPrice: 'Gs. 100.000',
            setPrice: 'Gs. 180.000',
          },
          {
            name: 'Max',
            pockets: '6 bolsillos',
            desc: 'Más funcionalidad para el día a día, con bolsillos laterales y propuesta tipo jogger.',
            topPrice: 'Gs. 100.000',
            bottomPrice: 'Gs. 120.000',
            setPrice: 'Gs. 220.000',
          },
          {
            name: 'Premier',
            pockets: '9 bolsillos',
            desc: 'Modelo más completo de la línea, con más bolsillos, abertura lateral y acabado funcional.',
            topPrice: 'Gs. 120.000',
            bottomPrice: 'Gs. 140.000',
            setPrice: 'Gs. 260.000',
          },
        ],
      },
    },
    about: {
      title: 'La Marca',
      eyebrow: 'Origen y presencia',
      intro:
        'Maçaroca nace del encuentro entre creación de autor, atención cercana y producción con intención. Schön Medical amplía esa mirada hacia la rutina de quienes necesitan vestir comodidad, practicidad y presencia todos los días.',
      pillars: [
        {
          title: 'Creación de autor',
          desc: 'Piezas pensadas para cargar identidad, movimiento y una forma propia de ocupar el mundo.',
        },
        {
          title: 'Mirada a medida',
          desc: 'La conversación, las medidas y la rutina de quien viste orientan cada decisión de creación.',
        },
        {
          title: 'Presencia al vestir',
          desc: 'La ropa como lenguaje: cómoda, elegante y hecha para fortalecer a quien la usa.',
        },
      ],
      values: [
        { label: '01', title: 'Pequeñas producciones, más intención.' },
        { label: '02', title: 'Atención cercana, sin prisa.' },
        { label: '03', title: 'Moda y rutina con la misma dignidad.' },
      ],
      manifestoLabel: 'Manifiesto',
      macarocaTitle: 'La Esencia Maçaroca',
      macarocaP1:
        'Maçaroca es la marca principal: un espacio de creación para piezas femeninas de autor, pensadas para vestir cuerpo, presencia e identidad sin apagar la libertad de quien las usa.',
      macarocaP2:
        'La producción en pequeña escala permite una mirada más cercana sobre medidas, tejido, terminación e intención. Cada pedido empieza con conversación, no con prisa: primero entendemos a la mujer, después pensamos la pieza.',
      macarocaCta: 'Ver catálogo',
      evolutionLabel: 'Evolución',
      schonTitle: 'La Línea Schön Medical',
      schonP1:
        'Schön Medical nació como una extensión natural de Maçaroca para el universo de la salud. El mercado abrazó la idea, y la marca pasó a mirar con más cuidado a profesionales que pasan horas trabajando con la misma ropa.',
      schonP2:
        'La propuesta es simple y fuerte: si la ropa acompaña jornadas largas, necesita ofrecer calidad, practicidad, comodidad y una forma más elegante de moverse en el trabajo. No se trata solo de vestir una profesión; se trata de vestir una rutina con respeto.',
      schonCta: 'Conocer Schön Medical',
      quoteLabel: 'Síntesis',
      quoteTitle: 'El Encuentro Entre el Estilo y la Profesión',
      quote:
        'De la creación de autor al uniforme de trabajo, la propuesta es la misma: vestir con cuidado, presencia y poder.',
      catalogCta: 'Explorar catálogo',
      contactCta: 'Comenzar atención',
    },
    contact: {
      title: 'Contacto',
      eyebrow: 'Atención',
      intro:
        'Un primer contacto para entender tu rutina, tus medidas y lo que la ropa debe comunicar antes incluso de ser vestida.',
      infoTitle: 'Información',
      whatsapp: 'WhatsApp',
      email: 'E-mail',
      hours: 'Horario de Atención',
      social: 'Redes Sociales',
      chooseLabel: 'Atención directa',
      chooseTitle: 'Elige tu atención',
      chooseText:
        'Habla con Maçaroca por el canal más cercano a ti. Atendemos pedidos individuales, piezas a medida y equipos.',
      serviceItems: [
        {
          title: 'A medida',
          desc: 'Orientación de medidas para piezas con mejor calce e intención.',
        },
        {
          title: 'Por demanda',
          desc: 'Producción alineada a colores, plazos, rutina y finalidad de uso.',
        },
        {
          title: 'Equipos',
          desc: 'Atención para pedidos individuales o composición de grupos.',
        },
      ],
      formLabel: 'Pedido personalizado',
      formTitle: 'Comienza tu atención',
      formIntro:
        'Cuéntanos con calma qué estás buscando. Desde aquí seguimos por WhatsApp con orientación de medidas, posibilidades de tela, colores y próximos pasos.',
      responseTitle: 'Respuesta personalizada',
      responseText:
        'Cada mensaje se lee con atención para entender la necesidad real del pedido.',
      destinationText: 'Brasil o Paraguay, según tu preferencia.',
      name: 'Nombre Completo',
      namePlaceholder: '¿Cómo debemos llamarte?',
      country: 'País de WhatsApp',
      countryPlaceholder: 'Selecciona el país',
      phone: 'Teléfono / WhatsApp',
      phonePlaceholder: '{{ddi}} + número local',
      phonePlaceholderOther: '+ código del país + número',
      interest: 'Asunto de Interés',
      interestPlaceholder: 'Selecciona el asunto',
      options: ['Maçaroca', 'Schön Medical', 'Pedido personalizado', 'Presupuesto para equipo', 'Otro'],
      message: 'Mensaje',
      messagePlaceholder: 'Cuéntanos qué buscas, para qué ocasión o rutina...',
      sendTo: 'Enviar a',
      submit: 'Enviar por WhatsApp',
      formMessageLabels: {
        greeting: 'Hola, mi nombre es',
        country: 'País de WhatsApp',
        phone: 'Teléfono',
        interest: 'Interés',
        message: 'Mensaje',
      },
    },
    notFound: {
      title: '404',
      text: 'Oops! Página no encontrada',
      back: 'Volver al inicio',
    },
  },
  en: {
    nav: {
      home: 'Home',
      collections: 'Collections',
      schon: 'Schön Medical',
      about: 'About',
      contact: 'Contact',
    },
    common: {
      whatsapp: 'Chat on WhatsApp',
      chooseService: 'Choose service',
      chooseServiceText: 'Select the country to start the conversation on WhatsApp.',
      brasil: 'Brazil',
      paraguai: 'Paraguay',
      consult: 'Ask',
      selectLanguage: 'Select language',
      instagram: 'Instagram',
    },
    footer: {
      description:
        'Authorial fashion for women who occupy their own space with elegance, presence and freedom.',
      navigation: 'Navigation',
      support: 'Support',
      exchanges: 'Exchanges and Deliveries',
      privacy: 'Privacy Policy',
      talkToUs: 'Contact Us',
      contact: 'Contact',
      rights: 'All rights reserved.',
    },
    contactInfo: {
      businessHours: 'Monday to Friday, 7 AM to 6 PM',
      locationTitle: 'ONLINE SERVICE',
      locationCity: 'Based in Asunción, PY',
      locationDescription: 'Personalized service through Instagram, WhatsApp and e-mail.',
    },
    whatsapp: {
      defaultMessage:
        'Hello, I came from the Maçaroca website and would like personalized assistance.',
      productMessage:
        'Hello, I am interested in {{product}}, by {{brand}}. I would like to check availability, measurements and prices.',
      schonMessage:
        'Hello, I came from the website and would like to ask about a Schön Medical scrub. Could you guide me through models, measurements, colors and timing?',
    },
    home: {
      heroAlt: 'Maçaroca Fashion',
      srTitle: 'Maçaroca and Schön Medical - authorial fashion and custom scrubs',
      heroText:
        'Authorial fashion and made-to-order scrubs for those who know that dressing well is also a way of taking up space.',
      seeCatalog: 'View Catalog',
      whatsapp: 'Chat on WhatsApp',
      knowSchon: 'Discover Schön Medical',
      macarocaText:
        'Authorial womenswear created in small scale to dress the body, the gesture and the personality with ease.',
      consultPieces: 'Ask About Pieces',
      schonText:
        'Complete, personalized scrubs for intense routines, designed with comfort, precision and professional presence.',
      knowLine: 'Discover the Line',
      requestBudget: 'Request Quote',
      trust: [
        'Tailored service',
        'Made-to-order production',
        'Measurement guidance',
        'Individual and team orders',
      ],
      manifestoLabel: 'Manifesto',
      manifestoTitle: 'Clothing as Expression',
      manifestoText:
        'Maçaroca begins with clothing as language: authorial creation, close service and made-to-order production. Schön Medical carries that vision into the health universe, where comfort, quality and presence matter too.',
      features: [
        {
          title: 'Made to order',
          desc: 'Every piece begins with intention: fabric, measurements, timing and purpose are considered order by order.',
        },
        {
          title: 'Presence in dressing',
          desc: 'From the authorial piece to the scrub, the focus is to bring aesthetics, comfort and identity into one experience.',
        },
        {
          title: 'Direct service',
          desc: 'The conversation starts on WhatsApp, with guidance on measurements, colors, timing and possibilities.',
        },
      ],
    },
    catalog: {
      title: 'Catalog',
      eyebrow: 'Curation',
      statusLabel: 'Line preview',
      note: 'Initial curation',
      availabilityLabel: 'Available on request',
      viewDetails: 'View details',
      buildSchon: 'Build your Schön',
      intro:
        'An initial curation presenting the two paths of the brand: Maçaroca authorial creation and made-to-order Schön Medical scrubs.',
      empty: 'No pieces found for this category.',
      seeAll: 'See all pieces',
      products: {
        macaroca: {
          name: 'Maçaroca',
          category: 'Authorial pieces on request',
          price: 'Available on request',
          description:
            'Made-to-order womenswear designed from intention, measurements and presence.',
          sizes: ['Made to measure'],
          details: ['Authorial creation', 'Available on request', 'Close service'],
        },
        scrub: {
          name: 'Schön Medical',
          category: 'Made-to-order scrubs',
          price: 'From US$ 37',
          description:
            'Complete scrubs for professional routines, with measurement, color and model guidance.',
          details: ['Customizable colors', 'Individual and team orders', 'Visual preview'],
        },
      },
    },
    schon: {
      sideLabel: 'Schön Medical',
      title: 'Schön Medical by Maçaroca',
      tagline: 'Wear comfort.\nTransmit confidence.',
      intro:
        'Made-to-order scrubs for professionals who need comfort, movement and an image worthy of their routine.',
      priceText: 'From US$ 37',
      requestBudget: 'Request quote',
      valueLabel: 'Precision, comfort and presence',
      whyTitle: 'Why choose Schön?',
      whyText:
        'A line created to turn uniforms into professional presence: functional, elegant and made for long workdays.',
      values: [
        {
          title: 'Comfort in routine',
          desc: 'Fit designed for movement, shifts, appointments and routines that demand consistency.',
        },
        {
          title: 'Professional image',
          desc: 'Scrubs with a clean, grounded look, aligned with the authority of the person wearing them.',
        },
        {
          title: 'Individual or team orders',
          desc: 'Service for professionals, pairs, teams, clinics and offices.',
        },
        {
          title: 'Functional finishing',
          desc: 'Models with pockets, cuts and details designed to support routine with practicality.',
        },
      ],
      processTitle: 'How ordering works',
      processText:
        'Service happens through WhatsApp to align measurements, models, colors and timing.',
      steps: [
        {
          title: '1. Initial conversation',
          desc: 'You share size, desired color and whether the order is individual or for a team.',
        },
        {
          title: '2. Measurements and details',
          desc: 'We align measurements, fit, model and the details that matter for daily use.',
        },
        {
          title: '3. Made-to-order production',
          desc: 'Once confirmed, we arrange timing, payment and production follow-up.',
        },
      ],
      ctaTitle: 'Your routine deserves to dress with presence too.',
      ctaText:
        'Chat on WhatsApp to check prices, measurements, available colors and models.',
      talkToConsultant: 'Talk to a Consultant',
      customizer: {
        eyebrow: 'Build your Schön',
        title: 'Build your scrub before the quote',
        intro:
          'Choose colors, top and pants sizes, pocket model, ribbons and label. At the end, send the complete composition to receive a quote.',
        previewLabel: 'Visual preview',
        previewTitle: 'Your composition',
        previewDisclaimer: 'Illustrative preview',
        previewNote:
          'The preview is a visual reference; our team confirms fit, measurements and color availability during service.',
        summaryLabel: 'Composition summary',
        finalTitle: 'Composition ready',
        finalText:
          'When you send it, our team receives your choices and continues the service on WhatsApp to confirm measurements, timing and price.',
        submit: 'Send for quote',
        submitWithPreview: 'Send composition on WhatsApp',
        messageTitle: 'Hello, I would like a Schön Medical quote with this composition:',
        messageFooter: 'Could you guide me on prices, measurements and timing?',
        downloadPreview: 'Download preview',
        downloadNote: 'Visual preview for quote. Prices and timing subject to confirmation.',
        labels: {
          topColor: 'Top color',
          bottomColor: 'Pants color',
          ribbonColor: 'Ribbon color',
          labelColor: 'Label color',
          topSize: 'Top size',
          bottomSize: 'Pants size',
          model: 'Model',
          topPrice: 'Top/shirt',
          bottomPrice: 'Pants',
          totalPrice: 'Set',
        },
        steps: {
          topColor: 'Top color',
          bottomColor: 'Bottom color',
          ribbonColor: 'Ribbon color',
          labelColor: 'Label color',
          topSize: 'Top size',
          bottomSize: 'Pants size',
          model: 'Model and pockets',
        },
        topColors: [
          { name: 'Burgundy', value: '#8c124b' },
          { name: 'Lilac', value: '#b477c8' },
          { name: 'Deep blue', value: '#07066f' },
          { name: 'Black', value: '#050505' },
          { name: 'Schön Pink', value: '#d80b8c' },
          { name: 'Light lavender', value: '#ddc8f5' },
          { name: 'Light blue', value: '#94c6f2' },
          { name: 'Mint', value: '#a9efe2' },
          { name: 'Baby pink', value: '#f5a9d8' },
          { name: 'Blush pink', value: '#f2d2dc' },
          { name: 'Soft coral', value: '#ff9aa0' },
          { name: 'Olive green', value: '#3d5b41' },
          { name: 'Red', value: '#df0000' },
          { name: 'Schön Orange', value: '#ff520d' },
          { name: 'Schön Yellow', value: '#ffe600' },
          { name: 'White', value: '#ffffff' },
        ],
        bottomColors: [
          { name: 'Burgundy', value: '#8c124b' },
          { name: 'Lilac', value: '#b477c8' },
          { name: 'Deep blue', value: '#07066f' },
          { name: 'Black', value: '#050505' },
          { name: 'Schön Pink', value: '#d80b8c' },
          { name: 'Light lavender', value: '#ddc8f5' },
          { name: 'Light blue', value: '#94c6f2' },
          { name: 'Mint', value: '#a9efe2' },
          { name: 'Baby pink', value: '#f5a9d8' },
          { name: 'Blush pink', value: '#f2d2dc' },
          { name: 'Soft coral', value: '#ff9aa0' },
          { name: 'Olive green', value: '#3d5b41' },
          { name: 'Red', value: '#df0000' },
          { name: 'Schön Orange', value: '#ff520d' },
          { name: 'Schön Yellow', value: '#ffe600' },
          { name: 'White', value: '#ffffff' },
        ],
        ribbonColors: [
          { name: 'Schön Pink', value: '#ef2f92' },
          { name: 'Schön Green', value: '#b8f24a' },
          { name: 'Black', value: '#101010' },
          { name: 'Off white', value: '#f7f5ef' },
          { name: 'Schön Orange', value: '#ff681f' },
          { name: 'Navy blue', value: '#172849' },
          { name: 'Burgundy', value: '#68192c' },
          { name: 'Gold', value: '#c6a15b' },
          { name: 'Silver', value: '#c8c8c8' },
        ],
        labelColors: [
          { name: 'Schön Green', value: '#b8f24a' },
          { name: 'Schön Pink', value: '#ef2f92' },
          { name: 'Burgundy', value: '#68192c' },
          { name: 'Schön Orange', value: '#ff681f' },
          { name: 'Navy blue', value: '#172849' },
          { name: 'Off white', value: '#f7f5ef' },
          { name: 'Black', value: '#101010' },
        ],
        sizes: ['PP', 'P', 'M', 'G', 'GG', 'XG', 'EXG', 'EXGG'],
        models: [
          {
            name: 'Classic',
            pockets: '2 pockets',
            desc: 'A clean, direct line with essential pockets for a lighter routine.',
            topPrice: 'US$ 16',
            bottomPrice: 'US$ 21',
            setPrice: 'US$ 37',
          },
          {
            name: 'Max',
            pockets: '6 pockets',
            desc: 'More functionality for everyday use, with side pockets and a jogger proposal.',
            topPrice: 'US$ 20',
            bottomPrice: 'US$ 24',
            setPrice: 'US$ 44',
          },
          {
            name: 'Premier',
            pockets: '9 pockets',
            desc: 'The most complete model in the line, with more pockets, side opening and functional finishing.',
            topPrice: 'US$ 23',
            bottomPrice: 'US$ 27',
            setPrice: 'US$ 50',
          },
        ],
      },
    },
    about: {
      title: 'The Brand',
      eyebrow: 'Origin and presence',
      intro:
        'Maçaroca is born from authorial creation, close service and intentional production. Schön Medical expands that vision into the routine of people who need to wear comfort, practicality and presence every day.',
      pillars: [
        {
          title: 'Authorial creation',
          desc: 'Pieces designed to carry identity, movement and a personal way of occupying the world.',
        },
        {
          title: 'Measured attention',
          desc: 'The conversation, measurements and routine of the wearer guide every creative decision.',
        },
        {
          title: 'Presence in dressing',
          desc: 'Clothing as language: comfortable, elegant and made to strengthen the person wearing it.',
        },
      ],
      values: [
        { label: '01', title: 'Small productions, more intention.' },
        { label: '02', title: 'Close service, never rushed.' },
        { label: '03', title: 'Fashion and routine with the same dignity.' },
      ],
      manifestoLabel: 'Manifesto',
      macarocaTitle: 'The Essence of Maçaroca',
      macarocaP1:
        'Maçaroca is the main brand: a creative space for authorial womenswear, designed to dress the body, presence and identity without erasing the freedom of the person wearing it.',
      macarocaP2:
        'Small-scale production allows a closer eye on measurements, fabric, finishing and intention. Every order begins with conversation, not haste: first we understand the woman, then we think about the piece.',
      macarocaCta: 'View catalog',
      evolutionLabel: 'Evolution',
      schonTitle: 'The Schön Medical Line',
      schonP1:
        'Schön Medical emerged as a natural extension of Maçaroca into the health universe. The market embraced the idea, and the brand began looking more carefully at professionals who spend hours working in the same clothes.',
      schonP2:
        'The proposal is simple and strong: if clothing accompanies long workdays, it should offer quality, practicality, comfort and a more elegant way to move at work. It is not only about dressing a profession; it is about dressing a routine with respect.',
      schonCta: 'Discover Schön Medical',
      quoteLabel: 'Essence',
      quoteTitle: 'Where Style Meets Profession',
      quote:
        'From authorial creation to work uniforms, the proposal is the same: dressing with care, presence and power.',
      catalogCta: 'Explore catalog',
      contactCta: 'Start service',
    },
    contact: {
      title: 'Contact',
      eyebrow: 'Service',
      intro:
        'A first conversation to understand your routine, your measurements and what the garment should communicate before it is even worn.',
      infoTitle: 'Information',
      whatsapp: 'WhatsApp',
      email: 'E-mail',
      hours: 'Service Hours',
      social: 'Social Media',
      chooseLabel: 'Direct service',
      chooseTitle: 'Choose your service',
      chooseText:
        'Speak with Maçaroca through the channel closest to you. We serve individual orders, made-to-order pieces and teams.',
      serviceItems: [
        {
          title: 'Measured',
          desc: 'Measurement guidance for pieces with better fit and intention.',
        },
        {
          title: 'On demand',
          desc: 'Production aligned with colors, timing, routine and purpose of use.',
        },
        {
          title: 'Teams',
          desc: 'Service for individual orders or coordinated group requests.',
        },
      ],
      formLabel: 'Personalized order',
      formTitle: 'Start your service',
      formIntro:
        'Tell us calmly what you are looking for. From here, we continue on WhatsApp with measurement guidance, fabric possibilities, colors and next steps.',
      responseTitle: 'Personalized response',
      responseText:
        'Every message is read carefully to understand the real need behind the order.',
      destinationText: 'Brazil or Paraguay, according to your preference.',
      name: 'Full Name',
      namePlaceholder: 'How should we call you?',
      country: 'WhatsApp country',
      countryPlaceholder: 'Select country',
      phone: 'Phone / WhatsApp',
      phonePlaceholder: '{{ddi}} + local number',
      phonePlaceholderOther: '+ country code + number',
      interest: 'Subject of Interest',
      interestPlaceholder: 'Select the subject',
      options: ['Maçaroca', 'Schön Medical', 'Custom order', 'Team quote', 'Other'],
      message: 'Message',
      messagePlaceholder: 'Tell us what you are looking for, and for which occasion or routine...',
      sendTo: 'Send to',
      submit: 'Send to WhatsApp',
      formMessageLabels: {
        greeting: 'Hello, my name is',
        country: 'WhatsApp country',
        phone: 'Phone',
        interest: 'Interest',
        message: 'Message',
      },
    },
    notFound: {
      title: '404',
      text: 'Oops! Page not found',
      back: 'Back to home',
    },
  },
} as const

type LanguageContextValue = {
  language: Language
  setLanguage: (language: Language) => void
  t: (typeof translations)[Language]
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

function getInitialLanguage(): Language {
  if (typeof window === 'undefined') return 'pt'
  const saved = window.localStorage.getItem(STORAGE_KEY) as Language | null
  return saved && ['pt', 'es', 'en'].includes(saved) ? saved : 'pt'
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage)

  const setLanguage = (nextLanguage: Language) => {
    setLanguageState(nextLanguage)
    window.localStorage.setItem(STORAGE_KEY, nextLanguage)
  }

  useEffect(() => {
    document.documentElement.lang = language === 'pt' ? 'pt-BR' : language === 'es' ? 'es-PY' : 'en'
  }, [language])

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: translations[language],
    }),
    [language],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used inside LanguageProvider')
  }
  return context
}
