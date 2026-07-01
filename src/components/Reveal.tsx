import { useRef, useEffect, useState, HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface RevealProps extends HTMLAttributes<HTMLDivElement> {
  animation?: string
  delay?: number
}

export function Reveal({
  children,
  className,
  animation = 'animate-fade-in-up',
  delay = 0,
  ...props
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const currentRef = ref.current
    if (!currentRef) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(currentRef)
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' },
    )

    observer.observe(currentRef)

    return () => {
      if (currentRef) observer.unobserve(currentRef)
    }
  }, [])

  return (
    <div
      ref={ref}
      className={cn('opacity-0', isVisible && animation, className)}
      style={{ animationDelay: `${delay}ms` }}
      {...props}
    >
      {children}
    </div>
  )
}
