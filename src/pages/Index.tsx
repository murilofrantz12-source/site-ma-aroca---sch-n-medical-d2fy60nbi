import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/Reveal'
import logoMacaroca from '@/assets/macaroca-editado-40689.png'
import heroBg from '@/assets/captura-de-tela-2026-07-01-as-09.23.26-ea69b.png'
import macarocaBg from '@/assets/captura-de-tela-2026-07-01-as-09.26.51-5292d.png'
import schonBg from '@/assets/1ac556d2-00cd-49ab-86f8-bdd7aa54daec-fe795.jpg'

export default function Index() {
  return (
    <div className="w-full flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="relative h-screen w-full overflow-hidden flex-shrink-0">
        <div className="absolute inset-0">
          <img
            src={heroBg}
            alt="Maçaroca Fashion"
            className="w-full h-full object-cover object-[center_15%] md:object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/70 transition-colors" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center text-center p-6 mt-16">
          <Reveal className="max-w-4xl space-y-8 flex flex-col items-center">
            <Link
              to="/"
              className="h-40 sm:h-56 md:h-72 overflow-hidden flex items-center justify-center hover:opacity-80 transition-opacity"
            >
              <img
                src={logoMacaroca}
                alt="Maçaroca - Você tem o poder"
                className="h-[300px] sm:h-[450px] md:h-[550px] w-auto object-contain mix-blend-screen drop-shadow-2xl max-w-none"
              />
            </Link>
            <h1 className="sr-only">Maçaroca - Você tem o poder de vestir presença</h1>
            <p className="text-base md:text-lg text-white/90 font-light max-w-2xl mx-auto drop-shadow leading-relaxed">
              Criações femininas com alma. Peças autorais para mulheres que desejam se sentir
              elegantes, livres e únicas.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
              <Button
                asChild
                size="lg"
                className="rounded-none bg-white text-black hover:bg-white/90 text-xs tracking-widest uppercase px-8 h-12"
              >
                <Link to="/colecoes">Conhecer Coleções</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-none border-white text-white hover:bg-white hover:text-black text-xs tracking-widest uppercase px-8 h-12 bg-transparent backdrop-blur-sm"
                onClick={() =>
                  window.open(
                    'https://wa.me/5544999881151?text=Ol%C3%A1%2C%20vim%20pelo%20site%20da%20Ma%C3%A7aroca%20e%20gostaria%20de%20receber%20um%20atendimento%20personalizado.',
                    '_blank',
                  )
                }
              >
                Falar pelo WhatsApp
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-none border-white text-white hover:bg-white hover:text-black text-xs tracking-widest uppercase px-8 h-12 bg-transparent backdrop-blur-sm"
              >
                <Link to="/schon-medical">Conhecer Schön Medical</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Brands Editorial Section */}
      <section className="py-24 lg:py-32 bg-background flex-shrink-0 flex flex-col gap-24 lg:gap-32">
        {/* Maçaroca */}
        <div className="container">
          <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-center">
            <Reveal className="order-1 aspect-[4/5] lg:aspect-[3/4] overflow-hidden bg-muted">
              <img
                src={macarocaBg}
                alt="Maçaroca"
                className="w-full h-full object-cover object-[center_15%] md:object-center transition-transform duration-1000 hover:scale-105"
              />
            </Reveal>
            <Reveal delay={100} className="order-2 flex flex-col justify-center items-start">
              <h2 className="text-4xl md:text-5xl font-serif text-foreground mb-6">Maçaroca</h2>
              <p className="text-muted-foreground font-light mb-8 max-w-md leading-relaxed text-lg">
                Vestidos, macacões, conjuntos e peças exclusivas com estilo, leveza e presença.
              </p>
              <Button
                asChild
                size="lg"
                className="rounded-none uppercase tracking-widest px-8 h-14 text-xs"
              >
                <Link to="/colecoes">Ver Coleção</Link>
              </Button>
            </Reveal>
          </div>
        </div>

        {/* Schön Medical */}
        <div className="container">
          <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-center">
            <Reveal className="order-2 md:order-1 flex flex-col justify-center items-start">
              <h2 className="text-4xl md:text-5xl font-serif text-foreground mb-6">
                Schön Medical
              </h2>
              <p className="text-muted-foreground font-light mb-8 max-w-md leading-relaxed text-lg">
                Scrubs e roupas profissionais para mulheres da saúde que buscam conforto, elegância
                e confiança.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Button
                  asChild
                  size="lg"
                  className="rounded-none uppercase tracking-widest px-8 h-14 text-xs bg-[#2c3e50] hover:bg-[#1a252f] text-white w-full sm:w-auto"
                >
                  <Link to="/schon-medical">Conhecer a Linha</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() =>
                    window.open(
                      'https://wa.me/5544999881151?text=Ol%C3%A1%2C%20vim%20pelo%20site%20da%20Ma%C3%A7aroca%20e%20gostaria%20de%20receber%20um%20atendimento%20personalizado.',
                      '_blank',
                    )
                  }
                  className="rounded-none border-[#2c3e50] text-[#2c3e50] hover:bg-[#2c3e50] hover:text-white uppercase tracking-widest px-8 h-14 text-xs w-full sm:w-auto"
                >
                  Solicitar Orçamento
                </Button>
              </div>
            </Reveal>
            <Reveal
              delay={100}
              className="order-1 md:order-2 aspect-[4/5] lg:aspect-[3/4] overflow-hidden bg-muted"
            >
              <img
                src={schonBg}
                alt="Schön Medical"
                className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* Institutional Introduction */}
      <section className="py-32 lg:py-40 bg-secondary/30 flex-shrink-0">
        <div className="container max-w-5xl text-center">
          <Reveal>
            <span className="text-foreground/60 uppercase tracking-[0.2em] text-xs font-medium block mb-6">
              Manifesto
            </span>
            <h2 className="text-3xl md:text-5xl font-serif mb-8 text-foreground leading-tight">
              A Roupa como
              <br className="md:hidden" /> Expressão
            </h2>
            <p className="text-base md:text-lg text-muted-foreground font-light max-w-3xl mx-auto leading-relaxed mb-20">
              A Maçaroca nasce para mulheres que enxergam a roupa como uma extensão da própria
              identidade. Nossa curadoria e criação buscam valorizar o corpo feminino através de
              cortes impecáveis, tecidos fluidos e um design que transita perfeitamente entre o
              conforto absoluto e a elegância inquestionável.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-12 md:gap-8 text-left">
            {[
              {
                title: 'Peças autorais',
                desc: 'Design exclusivo que valoriza sua singularidade e estilo próprio com autenticidade.',
              },
              {
                title: 'Estilo com movimento',
                desc: 'Modelagens fluidas pensadas para acompanhar você com leveza em todos os momentos.',
              },
              {
                title: 'Atendimento premium',
                desc: 'Consultoria dedicada para ajudar você a encontrar a peça perfeita para o seu biotipo.',
              },
            ].map((feature, i) => (
              <Reveal
                key={i}
                delay={i * 150}
                className="bg-background p-8 lg:p-10 border border-border/50 shadow-sm hover:shadow-elevation transition-all duration-300 group"
              >
                <div className="w-12 h-12 border border-foreground/20 flex items-center justify-center mb-8 rounded-full group-hover:border-foreground transition-colors">
                  <div className="w-1.5 h-1.5 bg-foreground rounded-full" />
                </div>
                <h3 className="text-xl font-serif mb-4 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground font-light text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
