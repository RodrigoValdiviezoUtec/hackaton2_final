import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getSectorStory } from '../services/sectors.service'
import { getApiErrorMessage } from '../services/http'
import type { SectorStoryResponse } from '../types/api'
import { ErrorState, Spinner } from '../components/ui'

// Mapeo de tokens de color a clases de Tailwind (gradientes, bordes, sombras y texto)
const COLOR_THEMES: Record<string, {
  bg: string
  text: string
  border: string
  glow: string
  progressBg: string
  accent: string
}> = {
  emerald: {
    bg: 'from-emerald-950/20 to-slate-950',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    glow: 'shadow-emerald-500/20',
    progressBg: 'bg-emerald-500',
    accent: 'bg-emerald-400/20 text-emerald-300',
  },
  rose: {
    bg: 'from-rose-950/20 to-slate-950',
    text: 'text-rose-400',
    border: 'border-rose-500/30',
    glow: 'shadow-rose-500/20',
    progressBg: 'bg-rose-500',
    accent: 'bg-rose-400/20 text-rose-300',
  },
  red: {
    bg: 'from-red-950/20 to-slate-950',
    text: 'text-red-400',
    border: 'border-red-500/30',
    glow: 'shadow-red-500/20',
    progressBg: 'bg-red-500',
    accent: 'bg-red-400/20 text-red-300',
  },
  indigo: {
    bg: 'from-indigo-950/20 to-slate-950',
    text: 'text-indigo-400',
    border: 'border-indigo-500/30',
    glow: 'shadow-indigo-500/20',
    progressBg: 'bg-indigo-500',
    accent: 'bg-indigo-400/20 text-indigo-300',
  },
  blue: {
    bg: 'from-blue-950/20 to-slate-950',
    text: 'text-blue-400',
    border: 'border-blue-500/30',
    glow: 'shadow-blue-500/20',
    progressBg: 'bg-blue-500',
    accent: 'bg-blue-400/20 text-blue-300',
  },
  amber: {
    bg: 'from-amber-950/20 to-slate-950',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    glow: 'shadow-amber-500/20',
    progressBg: 'bg-amber-500',
    accent: 'bg-amber-400/20 text-amber-300',
  },
  purple: {
    bg: 'from-purple-950/20 to-slate-950',
    text: 'text-purple-400',
    border: 'border-purple-500/30',
    glow: 'shadow-purple-500/20',
    progressBg: 'bg-purple-500',
    accent: 'bg-purple-400/20 text-purple-300',
  },
  cyan: {
    bg: 'from-cyan-950/20 to-slate-950',
    text: 'text-cyan-400',
    border: 'border-cyan-500/30',
    glow: 'shadow-cyan-500/20',
    progressBg: 'bg-cyan-500',
    accent: 'bg-cyan-400/20 text-cyan-300',
  },
}

const DEFAULT_THEME = {
  bg: 'from-slate-900/20 to-slate-950',
  text: 'text-slate-400',
  border: 'border-slate-800',
  glow: 'shadow-slate-500/10',
  progressBg: 'bg-emerald-500',
  accent: 'bg-slate-800 text-slate-300',
}

export function SectorStoryPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [story, setStory] = useState<SectorStoryResponse | null>(null)
  const [loadState, setLoadState] = useState<'loading' | 'error' | 'ready'>('loading')
  const [loadError, setLoadError] = useState('')
  const [activeStageIndex, setActiveStageIndex] = useState(0)
  const [scrollProgress, setScrollProgress] = useState(0)

  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const containerRef = useRef<HTMLDivElement | null>(null)

  // Carga de datos de la API
  const load = useCallback(() => {
    if (!id) return
    setLoadState('loading')
    getSectorStory(id)
      .then((data) => {
        // Ordenar las etapas según 'order' por seguridad
        data.stages.sort((a, b) => a.order - b.order)
        setStory(data)
        setLoadState('ready')
      })
      .catch((err) => {
        setLoadError(getApiErrorMessage(err, 'Error al cargar la historia del sector'))
        setLoadState('error')
      })
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  // Manejar el progreso global del scroll
  useEffect(() => {
    const handleScroll = () => {
      const doc = document.documentElement
      const scrollVal = window.scrollY
      const heightVal = doc.scrollHeight - window.innerHeight
      if (heightVal > 0) {
        setScrollProgress(scrollVal / heightVal)
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // IntersectionObserver para detectar etapa activa en scroll
  useEffect(() => {
    if (loadState !== 'ready' || !story?.stages.length) return

    const observers = cardRefs.current.map((card, index) => {
      if (!card) return null
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveStageIndex(index)
          }
        },
        {
          // Activa la etapa cuando cruza el 40% - 60% de la ventana
          rootMargin: '-40% 0px -40% 0px',
          threshold: 0.1,
        }
      )
      observer.observe(card)
      return observer
    })

    return () => {
      observers.forEach((obs) => obs?.disconnect())
    }
  }, [loadState, story])

  // Navegación con View Transition API
  const handleBack = () => {
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        navigate('/dashboard')
      })
    } else {
      navigate('/dashboard')
    }
  }

  // Soporte para navegación accesible por teclado
  const handleCardFocus = (index: number) => {
    const card = cardRefs.current[index]
    if (card) {
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      card.scrollIntoView({
        behavior: prefersReduced ? 'auto' : 'smooth',
        block: 'center',
      })
      setActiveStageIndex(index)
    }
  }

  if (loadState === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <Spinner label="Cargando historia de exploración" />
      </div>
    )
  }

  if (loadState === 'error') {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 bg-slate-950 min-h-screen flex items-center justify-center">
        <ErrorState message={loadError} onRetry={load} />
      </div>
    )
  }

  if (!story || !story.stages.length) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 bg-slate-950 min-h-screen flex flex-col justify-center text-center">
        <p className="text-slate-400">Este sector no tiene etapas de exploración programadas.</p>
        <button type="button" onClick={handleBack} className="mt-4 text-emerald-400 hover:underline">
          Volver al Dashboard
        </button>
      </div>
    )
  }

  const activeStage = story.stages[activeStageIndex]
  const currentTheme = COLOR_THEMES[activeStage.colorToken] || DEFAULT_THEME

  return (
    <div
      ref={containerRef}
      className={`min-h-screen bg-gradient-to-b ${currentTheme.bg} transition-colors duration-1000 ease-in-out text-slate-100`}
    >
      {/* Barra de progreso superior */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1.5 bg-slate-900/60 backdrop-blur-sm">
        <div
          className={`h-full ${currentTheme.progressBg} transition-all duration-300 ease-out`}
          style={{ width: `${scrollProgress * 100}%` }}
        />
      </div>

      {/* Header fijo */}
      <header className="fixed top-2 left-0 right-0 z-40">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3 bg-slate-950/80 backdrop-blur-md rounded-full border border-slate-800/80 shadow-lg max-w-[90%] md:max-w-[80%]">
          <div>
            <span className="text-xs font-semibold tracking-wider text-emerald-400 uppercase">
              Sector {story.sector.climate.replace('_', ' ')}
            </span>
            <h1 className="text-sm md:text-base font-bold text-slate-100">{story.sector.name}</h1>
          </div>
          <button
            type="button"
            onClick={handleBack}
            className="text-xs md:text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors bg-slate-900/80 border border-slate-800 rounded-full px-4 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-400"
          >
            ← Salir
          </button>
        </div>
      </header>

      {/* Grid del Scrollytelling.
          Mobile: flex-col para que <main> sea el bloque contenedor del sticky y el
          visual quede fijo arriba mientras la narrativa scrollea debajo.
          Desktop: grid de 2 columnas con el visual sticky en la columna derecha. */}
      <main className="mx-auto max-w-6xl px-4 pt-24 pb-16 flex flex-col gap-6 lg:grid lg:grid-cols-12 lg:gap-8 lg:items-start relative">

        {/* LADO IZQUIERDO: Narrativa interactiva (Scrollable) */}
        <section className="order-2 lg:order-none lg:col-span-7 space-y-[45vh] my-[20vh] relative z-10">
          {story.stages.map((stage, index) => {
            const isActive = index === activeStageIndex
            const stageTheme = COLOR_THEMES[stage.colorToken] || DEFAULT_THEME
            return (
              <div
                key={stage.id}
                ref={(el) => { cardRefs.current[index] = el }}
                tabIndex={0}
                onFocus={() => handleCardFocus(index)}
                className={`outline-none transition-all duration-700 transform ${
                  isActive
                    ? 'opacity-100 scale-100 translate-y-0'
                    : 'opacity-30 scale-95 translate-y-4 filter blur-[1px]'
                }`}
              >
                <div
                  className={`rounded-2xl border ${
                    isActive ? stageTheme.border : 'border-slate-800/60'
                  } bg-slate-900/80 backdrop-blur-md p-6 md:p-8 shadow-xl ${
                    isActive ? `shadow-2xl ${stageTheme.glow}` : 'shadow-none'
                  } transition-all duration-700 focus-within:ring-2 focus-within:ring-emerald-400`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        isActive ? stageTheme.accent : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      Etapa 0{stage.order + 1}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      Progreso: {Math.round(stage.progress * 100)}%
                    </span>
                  </div>

                  <h2 className="text-xl md:text-2xl font-semibold mb-3 tracking-tight text-slate-100">
                    {stage.title}
                  </h2>

                  <p className="text-sm md:text-base text-slate-300 leading-relaxed font-normal">
                    {stage.narrative}
                  </p>

                  <div className="mt-6 flex flex-wrap gap-2 text-xs">
                    <span className="bg-slate-950/60 border border-slate-800 rounded px-2.5 py-1 text-slate-400">
                      Evento Dominante: <strong className="text-slate-200">{stage.dominantEvent}</strong>
                    </span>
                    <span className="bg-slate-950/60 border border-slate-800 rounded px-2.5 py-1 text-slate-400">
                      Asset: <code className="text-emerald-400 font-mono">{stage.assetKey}</code>
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </section>

        {/* LADO DERECHO (desktop) / SUPERIOR (mobile): Visualización persistente sticky */}
        <section className="order-1 lg:order-none lg:col-span-5 sticky top-20 lg:top-24 self-start space-y-4 w-full relative z-30">
          
          {/* Tarjeta Visual de Clima y Narración */}
          <div
            className={`rounded-2xl border ${currentTheme.border} bg-slate-900/90 backdrop-blur-md p-6 shadow-2xl transition-all duration-700 overflow-hidden relative`}
          >
            {/* Fondo visual procedimental simulando el clima */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <ClimateBackground climate={story.sector.climate} assetKey={activeStage.assetKey} />
            </div>

            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                  Visualización Activa
                </span>
                <span className={`text-xs font-mono font-bold ${currentTheme.text}`}>
                  {activeStageIndex + 1} / {story.stages.length}
                </span>
              </div>

              {/* Contenedor Visual Generado Procedimentalmente */}
              <div className="h-44 md:h-52 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center relative overflow-hidden group shadow-inner">
                {/* Animación del motor de historias visuales */}
                <StoryVisualizer
                  climate={story.sector.climate}
                  assetKey={activeStage.assetKey}
                  color={activeStage.colorToken}
                />
                
                {/* Overlay de información del evento */}
                <div className="absolute bottom-2 left-2 right-2 bg-slate-900/90 backdrop-blur-sm border border-slate-800 rounded-md p-2 text-center">
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest block">
                    Evento Registrado
                  </span>
                  <span className="text-xs font-bold text-slate-200">
                    {activeStage.dominantEvent}
                  </span>
                </div>
              </div>

              {/* Panel de Métricas de la Etapa */}
              <div className="space-y-3 pt-2">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block">
                  Métricas de Estabilidad de la Etapa
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <MetricCard
                    label="Estabilidad"
                    value={`${activeStage.metrics.stability}%`}
                    colorClass={
                      activeStage.metrics.stability > 70
                        ? 'text-emerald-400'
                        : activeStage.metrics.stability > 40
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }
                  />
                  <MetricCard
                    label="Energía"
                    value={`${activeStage.metrics.energy}%`}
                    colorClass="text-indigo-400"
                  />
                  <MetricCard
                    label="Alertas"
                    value={activeStage.metrics.alerts}
                    colorClass={activeStage.metrics.alerts > 5 ? 'text-red-400 animate-pulse' : 'text-slate-300'}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Indicaciones de Navegación */}
          <div className="hidden lg:block rounded-xl border border-slate-800/80 bg-slate-900/40 p-4 text-center text-xs text-slate-500">
            Haz scroll para avanzar en la historia o navega usando <kbd className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 text-slate-400">Tab</kbd> y <kbd className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 text-slate-400">Shift+Tab</kbd>.
          </div>
        </section>

      </main>
    </div>
  )
}

function MetricCard({ label, value, colorClass }: { label: string; value: string | number; colorClass: string }) {
  return (
    <div className="bg-slate-950/80 border border-slate-850/80 rounded-xl p-3 text-center">
      <span className="text-[10px] text-slate-500 block mb-0.5 uppercase">{label}</span>
      <span className={`text-sm md:text-base font-bold ${colorClass}`}>{value}</span>
    </div>
  )
}

// Background decorativo de Clima en CSS
function ClimateBackground({ climate }: { climate: string; assetKey: string }) {
  const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const animationClass = isReduced ? '' : 'animate-[pulse_4s_infinite]'

  if (climate === 'PIXEL_FOREST') {
    return (
      <div className={`w-full h-full bg-emerald-900/10 ${animationClass}`}
        style={{ backgroundImage: 'radial-gradient(circle, #10b981 1px, transparent 1px)', backgroundSize: '16px 16px' }}
      />
    )
  }
  if (climate === 'NEON_CAVE') {
    return (
      <div className={`w-full h-full bg-purple-900/10 ${animationClass}`}
        style={{ backgroundImage: 'linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px)', backgroundSize: '100% 8px' }}
      />
    )
  }
  if (climate === 'CLOUD_AQUARIUM') {
    return (
      <div className={`w-full h-full bg-cyan-900/10 ${animationClass}`}
        style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.15), transparent 60%)' }}
      />
    )
  }
  // RETRO_ARCADE o fallbacks
  return (
    <div className={`w-full h-full bg-amber-900/10 ${animationClass}`}
      style={{
        backgroundImage: 'linear-gradient(90deg, rgba(245, 158, 11, 0.05) 1px, transparent 1px), linear-gradient(rgba(245, 158, 11, 0.05) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    />
  )
}

// Visualizador de estado procedimental de las etapas
function StoryVisualizer({ climate, color }: { climate: string; assetKey: string; color: string }) {
  const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const themeColors: Record<string, string> = {
    emerald: '#10b981', rose: '#f43f5e', red: '#ef4444', indigo: '#6366f1',
    blue: '#3b82f6', amber: '#f59e0b', purple: '#8b5cf6', cyan: '#06b6d4',
  }
  const colorHex = themeColors[color] || '#10b981'

  // Si reduced-motion está activo, eliminamos todas las clases de animación.
  const animGrid = isReduced ? '' : 'animate-[pulse_3s_infinite_alternate]'
  const animCircle = isReduced ? '' : 'animate-[ping_4s_infinite]'
  const animFloating = isReduced ? '' : 'animate-[bounce_2s_infinite]'

  // Representaciones lúdicas según el clima y asset
  if (climate === 'PIXEL_FOREST') {
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Cuadrículas de píxeles decorativos */}
        <div className={`absolute inset-0 flex flex-wrap gap-1 p-4 opacity-25 ${animGrid}`}>
          {Array.from({ length: 48 }).map((_, i) => (
            <div key={i} className="w-3.5 h-3.5 rounded-sm" style={{ backgroundColor: colorHex }} />
          ))}
        </div>
        <div className={`w-12 h-12 rounded-lg relative flex items-center justify-center shadow-lg border-2 ${animFloating}`}
          style={{ borderColor: colorHex, backgroundColor: `${colorHex}15` }}>
          <div className="w-6 h-6 rounded-md" style={{ backgroundColor: colorHex }} />
          <div className="absolute -top-1 -right-1 w-3 h-3 rotate-45" style={{ backgroundColor: colorHex }} />
        </div>
      </div>
    )
  }

  if (climate === 'NEON_CAVE') {
    return (
      <div className="relative w-full h-full flex items-center justify-center bg-slate-950">
        {/* Línea de scanline de cueva de neón */}
        <div className="absolute inset-x-0 h-0.5 opacity-40 shadow-[0_0_8px_#8b5cf6]" style={{ backgroundColor: colorHex, top: '45%' }} />
        {/* Círculo pulsante de neón */}
        <div className={`absolute w-20 h-20 rounded-full border-2 opacity-30 ${animCircle}`} style={{ borderColor: colorHex, boxShadow: `0 0 15px ${colorHex}` }} />
        <div className={`w-10 h-10 rounded-full border-4 shadow-lg ${animFloating}`} style={{ borderColor: colorHex, backgroundColor: '#020617', boxShadow: `0 0 20px ${colorHex}` }} />
      </div>
    )
  }

  if (climate === 'CLOUD_AQUARIUM') {
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Representación de burbujas/ondas flotando */}
        <div className="absolute inset-0 flex justify-around items-end opacity-20 p-2">
          <div className={`w-3 h-3 rounded-full ${isReduced ? '' : 'animate-[bounce_3s_infinite]'}`} style={{ backgroundColor: colorHex }} />
          <div className={`w-5 h-5 rounded-full ${isReduced ? '' : 'animate-[bounce_4s_infinite]'}`} style={{ backgroundColor: colorHex }} />
          <div className={`w-2 h-2 rounded-full ${isReduced ? '' : 'animate-[bounce_2s_infinite]'}`} style={{ backgroundColor: colorHex }} />
        </div>
        <div className={`w-16 h-8 rounded-full border-2 flex items-center justify-center ${animFloating}`}
          style={{ borderColor: colorHex, backgroundColor: `${colorHex}10` }}>
          <div className="w-10 h-4 rounded-full" style={{ backgroundColor: colorHex }} />
        </div>
      </div>
    )
  }

  // RETRO_ARCADE
  return (
    <div className="relative w-full h-full flex items-center justify-center bg-slate-950">
      {/* Rejilla de perspectiva retro 3D */}
      <div className={`absolute inset-0 border-t-2 opacity-20 flex justify-between ${animGrid}`} style={{ borderColor: colorHex }}>
        <div className="w-0.5 h-full bg-gradient-to-b from-transparent to-slate-900" style={{ backgroundColor: colorHex }} />
        <div className="w-0.5 h-full bg-gradient-to-b from-transparent to-slate-900" style={{ backgroundColor: colorHex }} />
        <div className="w-0.5 h-full bg-gradient-to-b from-transparent to-slate-900" style={{ backgroundColor: colorHex }} />
      </div>
      {/* Triángulo arcade clásico */}
      <div className={`w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-b-[35px] filter drop-shadow-[0_0_8px_rgba(245,158,11,0.5)] ${animFloating}`}
        style={{ borderBottomColor: colorHex }}
      />
    </div>
  )
}
