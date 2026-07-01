import { Reveal } from '@/components/Reveal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Instagram, Mail, MapPin, Phone } from 'lucide-react'
import { useState } from 'react'

export default function Contato() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    interest: '',
    message: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const text = `Olá, meu nome é ${formData.name}.\nTelefone: ${formData.phone}\nInteresse: ${formData.interest}\n\nMensagem:\n${formData.message}`
    window.open(`https://wa.me/5511999999999?text=${encodeURIComponent(text)}`, '_blank')
  }

  return (
    <div className="w-full pt-32 pb-24 bg-background min-h-screen flex-1">
      <div className="container max-w-6xl">
        <Reveal>
          <div className="text-center mb-20">
            <h1 className="text-4xl md:text-6xl font-serif mb-6 uppercase tracking-wider">
              Contato
            </h1>
            <p className="text-muted-foreground font-light max-w-2xl mx-auto text-lg">
              Estamos aqui para ajudar você a encontrar a peça perfeita. Fale conosco para dúvidas,
              pedidos especiais ou agendamentos.
            </p>
          </div>
        </Reveal>

        <div className="grid lg:grid-cols-5 gap-12 lg:gap-20">
          <Reveal delay={100} className="lg:col-span-2">
            <div className="bg-secondary/20 p-10 h-full flex flex-col justify-center border border-border/50">
              <h2 className="text-2xl font-serif mb-10 text-foreground">Informações</h2>

              <div className="space-y-10">
                <div className="flex items-start space-x-5">
                  <Phone className="w-6 h-6 mt-1 text-foreground/60" strokeWidth={1.5} />
                  <div>
                    <h3 className="font-medium mb-2 uppercase tracking-wider text-xs">
                      WhatsApp / Telefone
                    </h3>
                    <p className="text-muted-foreground font-light text-sm">(11) 99999-9999</p>
                    <p className="text-muted-foreground font-light text-sm mt-1">
                      Segunda a Sexta, das 9h às 18h
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-5">
                  <Mail className="w-6 h-6 mt-1 text-foreground/60" strokeWidth={1.5} />
                  <div>
                    <h3 className="font-medium mb-2 uppercase tracking-wider text-xs">E-mail</h3>
                    <p className="text-muted-foreground font-light text-sm">
                      contato@macaroca.com.br
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-5">
                  <MapPin className="w-6 h-6 mt-1 text-foreground/60" strokeWidth={1.5} />
                  <div>
                    <h3 className="font-medium mb-2 uppercase tracking-wider text-xs">Ateliê</h3>
                    <p className="text-muted-foreground font-light text-sm">São Paulo, SP</p>
                    <p className="text-muted-foreground font-light text-sm mt-1 italic">
                      Atendimento presencial apenas com hora marcada
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-16 pt-8 border-t border-border/50">
                <h3 className="font-medium mb-6 uppercase tracking-wider text-xs">Redes Sociais</h3>
                <div className="flex space-x-4">
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noreferrer"
                    className="w-12 h-12 rounded-full border border-border bg-background flex items-center justify-center hover:bg-foreground hover:text-background transition-all duration-300"
                  >
                    <Instagram className="w-5 h-5" strokeWidth={1.5} />
                  </a>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={200} className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-8 lg:p-8">
              <h2 className="text-3xl font-serif mb-10 text-foreground">Envie uma Mensagem</h2>

              <div className="grid sm:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-xs font-medium uppercase tracking-widest text-foreground/80">
                    Nome Completo
                  </label>
                  <Input
                    required
                    placeholder="Como devemos chamá-la?"
                    className="rounded-none bg-transparent border-b border-t-0 border-x-0 border-border focus-visible:ring-0 focus-visible:border-foreground px-0 h-12 text-base font-light shadow-none"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-medium uppercase tracking-widest text-foreground/80">
                    Telefone / WhatsApp
                  </label>
                  <Input
                    required
                    type="tel"
                    placeholder="(00) 00000-0000"
                    className="rounded-none bg-transparent border-b border-t-0 border-x-0 border-border focus-visible:ring-0 focus-visible:border-foreground px-0 h-12 text-base font-light shadow-none"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-medium uppercase tracking-widest text-foreground/80">
                  Assunto de Interesse
                </label>
                <Select
                  required
                  value={formData.interest}
                  onValueChange={(v) => setFormData({ ...formData, interest: v })}
                >
                  <SelectTrigger className="rounded-none bg-transparent border-b border-t-0 border-x-0 border-border focus:ring-0 px-0 h-12 text-base font-light shadow-none">
                    <SelectValue placeholder="Selecione o assunto" />
                  </SelectTrigger>
                  <SelectContent className="rounded-none font-light">
                    <SelectItem value="macaroca">Comprar peças Maçaroca</SelectItem>
                    <SelectItem value="schon">Comprar uniformes Schön Medical</SelectItem>
                    <SelectItem value="personalizado">
                      Pedido Personalizado / Vestir Equipe
                    </SelectItem>
                    <SelectItem value="outros">Dúvidas Gerais / Outros Assuntos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3 pt-4">
                <label className="text-xs font-medium uppercase tracking-widest text-foreground/80">
                  Mensagem
                </label>
                <Textarea
                  required
                  placeholder="Conte-nos como podemos ajudar..."
                  className="rounded-none bg-transparent border border-border focus-visible:ring-0 focus-visible:border-foreground min-h-[160px] resize-none p-4 text-base font-light shadow-none"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full md:w-auto rounded-none uppercase tracking-widest mt-8 px-12 h-14 text-xs font-medium"
              >
                Enviar para WhatsApp
              </Button>
            </form>
          </Reveal>
        </div>
      </div>
    </div>
  )
}
