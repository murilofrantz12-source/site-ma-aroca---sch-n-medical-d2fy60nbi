import { Link } from 'react-router-dom'
import { Reveal } from '@/components/Reveal'
import { Button } from '@/components/ui/button'
import { HeartPulse, Shirt, Users, Highlighter } from 'lucide-react'
import schonIcon from '@/assets/s-correto-4afa7.png'
import schonWordmark from '@/assets/so-by-macaroca-logo-peq-editado-4f9ae.png'
import schonImage from '@/assets/1ac556d2-00cd-49ab-86f8-bdd7aa54daec-fe795.jpg'

const WHATSAPP_URL =
  'https://wa.me/5544999881151?text=Ol%C3%A1%2C%20vim%20pelo%20site%20da%20Ma%C3%A7aroca%20e%20gostaria%20de%20receber%20um%20atendimento%20personalizado.'

export default function SchonMedical() {
  const handleWhatsApp = () => {
    window.open(WHATSAPP_URL, '_blank')
  }

  return (
    <div className="w-full flex-1">
      {/* Full-width Hero */}
      <section className="relative w-full min-h-[70vh] lg:min-h-[85vh] bg-[#2c3e50] flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0">
          <img
            src={schonImage}
            alt=""
            className="w-full h-full object-cover object-[center_20%] opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#2c3e50]/70 via-[#2c3e50]/50 to-[#2c3e50]/90" />
        </div>
        <div className="container relative z-10 text-center py-20 flex flex-col items-center">
          <Reveal className="flex flex-col items-center max-w-3xl">
            <Link to="/" className="inline-block mb-8 hover:opacity-80 transition-opacity">
              <img
                src={schonIcon}
                alt="Schön Medical"
                className="w-16 h-16 md:w-20 md:h-20 mx-auto object-contain"
              />
            </Link>
            <Link
              to="/"
              className="inline-block mb-10 w-full max-w-xl md:max-w-2xl hover:opacity-80 transition-opacity"
            >
              <img
                src={schonWordmark}
                alt="Schön Medical by Maçaroca"
                className="w-full h-auto object-contain drop-shadow-lg"
              />
            </Link>
            <h1 className="sr-only">Schön Medical by Maçaroca</h1>
            <p className="text-2xl md:text-4xl font-serif text-white mb-6 leading-tight">
              Vista conforto.
              <br /> Transmita confiança.
            </p>
            <p className="text-base md:text-lg text-white/80 font-light mb-10 leading-relaxed max-w-xl">
              Scrubs e roupas profissionais para mulheres da saúde que buscam conforto, elegância e
              presença no dia a dia.
            </p>
            <Button
              size="lg"
              onClick={handleWhatsApp}
              className="rounded-none uppercase tracking-widest bg-white text-[#2c3e50] hover:bg-white/90 px-8 h-14 text-xs"
            >
              Solicitar orçamento
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
          <Reveal className="max-w-3xl mx-auto flex flex-col items-center">
            <Link to="/" className="mb-10 hover:opacity-80 transition-opacity">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center overflow-hidden shadow-lg mx-auto">
                <img src={schonIcon} alt="Schön Medical" className="w-12 h-12 object-contain" />
              </div>
            </Link>
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
