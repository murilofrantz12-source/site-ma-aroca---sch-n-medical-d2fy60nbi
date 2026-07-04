import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Layout from '@/components/Layout'
import { LanguageProvider } from '@/lib/i18n'
import { SEO } from '@/components/SEO'

const Index = lazy(() => import('@/pages/Index'))
const Colecoes = lazy(() => import('@/pages/Colecoes'))
const SchonMedical = lazy(() => import('@/pages/SchonMedical'))
const Sobre = lazy(() => import('@/pages/Sobre'))
const Contato = lazy(() => import('@/pages/Contato'))
const NotFound = lazy(() => import('@/pages/NotFound'))

function ScrollToHash() {
  const location = useLocation()

  useEffect(() => {
    if (!location.hash) return

    const id = decodeURIComponent(location.hash.slice(1))
    const timeout = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)

    return () => window.clearTimeout(timeout)
  }, [location.hash, location.pathname])

  return null
}

function PageFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-background px-6 text-center">
      <div>
        <span className="mx-auto mb-5 block h-px w-16 bg-foreground/30" />
        <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
          Maçaroca + Schön Medical
        </p>
      </div>
    </div>
  )
}

const App = () => (
  <BrowserRouter>
    <LanguageProvider>
      <SEO />
      <ScrollToHash />
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/colecoes" element={<Colecoes />} />
            <Route path="/schon-medical" element={<SchonMedical />} />
            <Route path="/sobre" element={<Sobre />} />
            <Route path="/contato" element={<Contato />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </LanguageProvider>
  </BrowserRouter>
)

export default App
