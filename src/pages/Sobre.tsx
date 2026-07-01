import { Reveal } from '@/components/Reveal'
import logoMacaroca from '@/assets/macaroca-editado-40689.png'

export default function Sobre() {
  return (
    <div className="w-full pt-32 pb-24 bg-background min-h-screen flex-1">
      <div className="container max-w-5xl">
        <Reveal>
          <div className="text-center mb-24 flex flex-col items-center">
            <h1 className="text-4xl md:text-6xl font-serif mb-8 uppercase tracking-wider">
              A Marca
            </h1>
            <div className="w-16 h-[1px] bg-foreground mx-auto mb-12" />
            <div className="h-24 md:h-32 overflow-hidden flex items-center justify-center">
              <img
                src={logoMacaroca}
                alt="Maçaroca"
                className="h-48 md:h-64 w-auto object-contain invert mix-blend-multiply opacity-90 max-w-none"
              />
            </div>
          </div>
        </Reveal>

        <div className="space-y-32">
          {/* Section 1 */}
          <Reveal delay={100} className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="order-2 md:order-1">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4 block">
                Manifesto
              </span>
              <h2 className="text-3xl md:text-4xl font-serif mb-8 leading-tight">
                A Essência Maçaroca
              </h2>
              <div className="space-y-6 text-muted-foreground font-light leading-relaxed text-lg">
                <p>
                  Maçaroca não é apenas sobre vestir, é sobre sentir. Nossas criações nascem do
                  desejo profundo de oferecer à mulher contemporânea peças que abraçam sua
                  individualidade e celebram sua liberdade em todos os movimentos.
                </p>
                <p>
                  Com um olhar atento ao design autoral, cada coleção é desenvolvida com tecidos
                  fluidos, cortes precisos e uma paleta de cores que evoca sofisticação. Acreditamos
                  no consumo consciente e na moda com propósito, onde a qualidade supera a
                  efemeridade das tendências passageiras.
                </p>
              </div>
            </div>
            <div className="order-1 md:order-2 aspect-[4/5] bg-muted relative overflow-hidden group">
              <img
                src="https://img.usecurling.com/p/800/1000?q=fashion%20designer%20studio"
                alt="Studio Maçaroca"
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
            </div>
          </Reveal>

          {/* Section 2 */}
          <Reveal delay={200} className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="aspect-[4/5] bg-muted relative overflow-hidden group">
              <img
                src="https://img.usecurling.com/p/800/1000?q=doctor%20portrait%20elegant"
                alt="Profissional Schön"
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4 block">
                Evolução
              </span>
              <h2 className="text-3xl md:text-4xl font-serif mb-8 leading-tight">
                A Linha Schön Medical
              </h2>
              <div className="space-y-6 text-muted-foreground font-light leading-relaxed text-lg">
                <p>
                  Reconhecendo a necessidade das mulheres na área da saúde por roupas de trabalho
                  que refletissem sua excelência técnica, criamos a Schön Medical. Uma extensão
                  natural da nossa paixão por vestir mulheres com elegância.
                </p>
                <p>
                  Schön (do alemão, "Belo") traduz nossa missão de levar beleza, conforto e uma
                  imagem de autoridade irretocável para médicas, dentistas e enfermeiras. Aplicamos
                  a expertise de modelagem da Maçaroca em scrubs e jalecos que performam
                  perfeitamente durante longos plantões, sem nunca perder o encanto.
                </p>
              </div>
            </div>
          </Reveal>

          {/* Quote Section */}
          <Reveal delay={300} className="relative py-24 text-center">
            <div className="absolute inset-0 bg-secondary/10 skew-y-2 transform -z-10" />
            <div className="max-w-3xl mx-auto px-6">
              <h3 className="text-3xl md:text-4xl font-serif mb-8 leading-tight text-foreground">
                O Encontro Entre o Estilo e a Profissão
              </h3>
              <p className="text-muted-foreground font-light text-xl leading-relaxed">
                "Seja em um evento especial com um vestido Maçaroca, ou no seu consultório com um
                scrub Schön Medical, nossa promessa é uma só: revelar você, em sua melhor e mais
                autêntica versão."
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  )
}
