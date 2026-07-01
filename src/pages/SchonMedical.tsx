import { Reveal } from '@/components/Reveal'
import { Button } from '@/components/ui/button'
import { HeartPulse, Shirt, Users, Highlighter } from 'lucide-react'

export default function SchonMedical() {
  const handleWhatsApp = () => {
    const text = `Olá, gostaria de solicitar um orçamento da Schön Medical para scrubs/uniformes profissionais.`
    window.open(`https://wa.me/5511999999999?text=${encodeURIComponent(text)}`, '_blank')
  }

  return (
    <div className="w-full flex-1">
      {/* Hero */}
      <section className="bg-secondary/30 py-32 lg:py-40">
        <div className="container">
          <Reveal className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground mb-6 block">
              Linha Profissional
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-foreground leading-[1.1] mb-8">
              Schön Medical
              <br />
              <span className="text-muted-foreground">Vista conforto. Transmita confiança.</span>
            </h1>
            <p className="text-lg text-muted-foreground font-light mb-10 leading-relaxed max-w-xl">
              Scrubs e roupas profissionais para mulheres da saúde que buscam conforto, elegância e
              presença no dia a dia.
            </p>
            <Button
              size="lg"
              onClick={handleWhatsApp}
              className="rounded-none uppercase tracking-widest bg-[#2c3e50] hover:bg-[#1a252f] text-white px-8 h-14 text-xs"
            >
              Solicitar orçamento da Schön Medical
            </Button>
          </Reveal>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-32 lg:py-40 bg-background">
        <div className="container">
          <Reveal>
            <div className="text-center mb-20 flex flex-col items-center">
              <h2 className="text-3xl md:text-5xl font-serif mb-6 text-foreground">
                Por que escolher a Schön?
              </h2>
              <p className="text-muted-foreground font-light max-w-2xl mx-auto text-lg">
                Desenhamos cada detalhe pensando na sua rotina, unindo tecidos tecnológicos,
                modelagem impecável e personalização exclusiva.
              </p>
            </div>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: HeartPulse,
                title: 'Conforto para longas jornadas',
                desc: 'Tecidos com elastano e toque macio que acompanham perfeitamente seus movimentos.',
              },
              {
                icon: Shirt,
                title: 'Imagem profissional',
                desc: 'Cortes inspirados na alfaiataria que elevam sua autoridade sem perder a feminilidade.',
              },
              {
                icon: Users,
                title: 'Pedidos individuais ou para equipes',
                desc: 'Atendemos desde peças únicas até a padronização completa de clínicas e hospitais.',
              },
              {
                icon: Highlighter,
                title: 'Personalização (bordados)',
                desc: 'Seu nome e especialidade bordados com extrema perfeição, cuidado e requinte.',
              },
            ].map((prop, i) => (
              <Reveal
                key={i}
                delay={i * 100}
                className="text-center p-8 bg-secondary/5 border border-border/50 hover:border-[#2c3e50]/30 transition-colors group"
              >
                <div className="w-16 h-16 mx-auto bg-secondary rounded-full flex items-center justify-center mb-8 shadow-sm text-[#2c3e50] group-hover:scale-110 transition-transform duration-300">
                  <prop.icon className="w-8 h-8" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-serif mb-4 text-foreground">{prop.title}</h3>
                <p className="text-muted-foreground text-sm font-light leading-relaxed">
                  {prop.desc}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 lg:py-40 bg-[#2c3e50] text-white text-center">
        <div className="container relative z-10">
          <Reveal className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-serif mb-8 leading-tight">
              Pronta para transformar sua imagem profissional?
            </h2>
            <p className="text-white/80 font-light mb-12 text-lg leading-relaxed">
              Entre em contato conosco pelo WhatsApp para consultar nosso catálogo completo, tabela
              de medidas e opções exclusivas de personalização.
            </p>
            <Button
              size="lg"
              variant="outline"
              onClick={handleWhatsApp}
              className="rounded-none border-white text-white hover:bg-white hover:text-[#2c3e50] uppercase tracking-widest bg-transparent h-14 px-10 text-xs"
            >
              Falar com Consultora
            </Button>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
