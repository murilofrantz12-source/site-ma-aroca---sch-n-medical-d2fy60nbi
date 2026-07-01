import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/Reveal'
import logoMacaroca from '@/assets/macaroca-editado-40689.png'
import heroBg from '@/assets/captura-de-tela-2026-07-01-as-09.23.26-ea69b.png'

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
            <div className="h-40 sm:h-56 md:h-72 overflow-hidden flex items-center justify-center">
              <img
                src={logoMacaroca}
                alt="Maçaroca - Você tem o poder"
                className="h-[300px] sm:h-[450px] md:h-[550px] w-auto object-contain mix-blend-screen drop-shadow-2xl max-w-none"
              />
            </div>
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
                    'https://wa.me/5511999999999?text=Ol%C3%A1%2C%20gostaria%20de%20saber%20mais%20sobre%20a%20Ma%C3%A7aroca.',
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

      {/* Brand Cards */}
      <section className="py-32 lg:py-40 bg-background flex-shrink-0">
        <div className="container grid md:grid-cols-2 gap-8 lg:gap-12">
          <Reveal delay={100} className="group relative aspect-[3/4] overflow-hidden bg-muted">
            <img
              src={heroBg}
              alt="Maçaroca"
              className="w-full h-full object-cover object-[center_15%] md:object-center transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 flex flex-col justify-end p-8 sm:p-12 transition-opacity">
              <h2 className="text-3xl md:text-4xl font-serif text-white mb-4">Maçaroca</h2>
              <p className="text-white/80 font-light mb-8 max-w-sm leading-relaxed">
                Vestidos, macacões, conjuntos e peças exclusivas com estilo, leveza e presença.
              </p>
              <Button
                asChild
                variant="link"
                className="text-white p-0 h-auto justify-start uppercase tracking-widest text-xs hover:no-underline group/btn"
              >
                <Link to="/colecoes" className="flex items-center gap-2">
                  Ver Coleção
                  <span className="transition-transform group-hover/btn:translate-x-1">&rarr;</span>
                </Link>
              </Button>
            </div>
          </Reveal>

          <Reveal delay={200} className="group relative aspect-[3/4] overflow-hidden bg-muted">
            <img
              src="https://img.usecurling.com/p/800/1000?q=medical%20scrub%20professional%20woman&seed=schon"
              alt="Schön Medical"
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 sm:p-12 transition-opacity">
              <h2 className="text-3xl md:text-4xl font-serif text-white mb-4">Schön Medical</h2>
              <p className="text-white/80 font-light mb-8 max-w-sm leading-relaxed">
                Scrubs e roupas profissionais para mulheres da saúde que buscam conforto, elegância
                e confiança.
              </p>
              <Button
                asChild
                variant="link"
                className="text-white p-0 h-auto justify-start uppercase tracking-widest text-xs hover:no-underline group/btn"
              >
                <Link to="/schon-medical" className="flex items-center gap-2">
                  Conhecer a Linha
                  <span className="transition-transform group-hover/btn:translate-x-1">&rarr;</span>
                </Link>
              </Button>
            </div>
          </Reveal>
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
