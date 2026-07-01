import { Reveal } from '@/components/Reveal'
import { Button } from '@/components/ui/button'
import { HeartPulse, Shirt, Users, Highlighter } from 'lucide-react'
import schonIcon from '@/assets/s-correto-4afa7.png'
import schonWordmark from '@/assets/so-by-macaroca-logo-peq-editado-4f9ae.png'
import schonImage from '@/assets/1ac556d2-00cd-49ab-86f8-bdd7aa54daec-fe795.jpg'

export default function SchonMedical() {
  const handleWhatsApp = () => {
    const text = `Olá, gostaria de solicitar um orçamento da Schön Medical para scrubs/uniformes profissionais.`
    window.open(`https://wa.me/5544999881151?text=${encodeURIComponent(text)}`, '_blank')
  }

  return (
    <div className="w-full flex-1">
      {/* Hero */}
      <section className="bg-secondary/30 pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            <Reveal className="max-w-2xl z-10 relative">
              <div className="mb-6 flex items-center space-x-4">
                <img src={schonIcon} alt="Schön Icon" className="w-10 h-10 object-contain" />
                <span className="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground block">
                  Linha Profissional
                </span>
              </div>

              <div className="mb-8 -ml-2">
                <img
                  src={schonWordmark}
                  alt="Schön Medical by Maçaroca"
                  className="h-20 sm:h-24 lg:h-28 w-auto object-contain drop-shadow-sm"
                />
              </div>

              <h1 className="sr-only">Schön Medical by Maçaroca</h1>
              <p className="text-2xl md:text-3xl font-serif text-foreground mb-6 leading-tight">
                Vista conforto.
                <br /> Transmita confiança.
              </p>

              <p className="text-lg text-muted-foreground font-light mb-10 leading-relaxed max-w-xl">
                Scrubs e roupas profissionais para mulheres da saúde que buscam conforto, elegância
                e presença no dia a dia.
              </p>

              <Button
                size="lg"
                onClick={handleWhatsApp}
                className="rounded-none uppercase tracking-widest bg-[#2c3e50] hover:bg-[#1a252f] text-white px-8 h-14 text-xs"
              >
                Solicitar orçamento
              </Button>
            </Reveal>

            <Reveal
              delay={200}
              className="relative flex items-center justify-center lg:justify-end"
            >
              <div className="relative w-full max-w-[500px] aspect-[4/5] overflow-hidden bg-muted border border-border/50 shadow-xl">
                <img
                  src={schonImage}
                  alt="Profissional de Saúde com Schön Medical"
                  className="w-full h-full object-cover object-[center_20%] transition-transform duration-1000 hover:scale-105"
                />
              </div>
            </Reveal>
          </div>
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
          <Reveal className="max-w-3xl mx-auto flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-white mb-10 flex items-center justify-center overflow-hidden shadow-lg">
              <img src={schonIcon} alt="Schön Icon" className="w-12 h-12 object-contain" />
            </div>
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
