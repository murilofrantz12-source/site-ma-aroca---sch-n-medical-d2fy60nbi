import { useLocation, Link } from 'react-router-dom'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

const NotFound = () => {
  const location = useLocation()

  useEffect(() => {
    console.error('Erro 404: O usuário tentou acessar uma rota inexistente:', location.pathname)
  }, [location.pathname])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background flex-1">
      <div className="text-center px-4">
        <h1 className="text-6xl md:text-8xl font-serif mb-6 text-foreground">404</h1>
        <p className="text-xl md:text-2xl text-muted-foreground font-light mb-10">
          Ops! A página que você procura não existe.
        </p>
        <Button asChild size="lg" className="rounded-none uppercase tracking-widest px-8">
          <Link to="/">Voltar para o Início</Link>
        </Button>
      </div>
    </div>
  )
}

export default NotFound
