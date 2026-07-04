import { useLocation, Link } from 'react-router-dom'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/lib/i18n'

const NotFound = () => {
  const location = useLocation()
  const { t } = useLanguage()

  useEffect(() => {
    console.error('Erro 404: O usuário tentou acessar uma rota inexistente:', location.pathname)
  }, [location.pathname])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background flex-1">
      <div className="text-center px-4">
        <h1 className="text-6xl md:text-8xl font-serif mb-6 text-foreground">
          {t.notFound.title}
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground font-light mb-10">
          {t.notFound.text}
        </p>
        <Button asChild size="lg" className="rounded-none uppercase tracking-widest px-8">
          <Link to="/">{t.notFound.back}</Link>
        </Button>
      </div>
    </div>
  )
}

export default NotFound
