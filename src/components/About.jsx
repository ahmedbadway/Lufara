import { useRef, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'

const STATS = [
  { value: 25, suffix: '+', key: 'stat_years' },
  { value: 100, suffix: '%', key: 'stat_natural' },
  { value: 2, suffix: '', key: 'stat_countries' },
]

function AnimatedCounter({ target, suffix, inView }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!inView) return
    let frame
    const duration = 1400
    const start = performance.now()
    // Spring-ish easing: overshoot slightly then settle.
    const step = (now) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 4)
      setCount(Math.round(eased * target))
      if (progress < 1) frame = requestAnimationFrame(step)
    }

    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [inView, target])

  return (
    <motion.span
      initial={{ scale: 0.85 }}
      animate={inView ? { scale: 1 } : { scale: 0.85 }}
      transition={{ type: 'spring', stiffness: 180, damping: 12 }}
      className="inline-block text-secondary text-4xl md:text-5xl font-bold font-playfair"
    >
      {count}{suffix}
    </motion.span>
  )
}

function LeafDecoration() {
  return (
    <svg
      className="absolute -bottom-10 start-1/2 -translate-x-1/2 opacity-[0.06] pointer-events-none"
      width="220"
      height="220"
      viewBox="0 0 100 100"
      fill="none"
    >
      <path
        d="M50 5 C25 20, 10 50, 50 95 C90 50, 75 20, 50 5Z"
        fill="#6B8F71"
      />
      <path d="M50 25 L50 85" stroke="#6B8F71" strokeWidth="1" />
      <path d="M50 40 C40 35, 32 42, 35 50" stroke="#6B8F71" strokeWidth="0.8" fill="none" />
      <path d="M50 55 C60 50, 68 57, 65 65" stroke="#6B8F71" strokeWidth="0.8" fill="none" />
    </svg>
  )
}

function GoldSeparator({ inView, orientation = 'vertical' }) {
  const vertical = orientation === 'vertical'
  return (
    <svg
      className={vertical ? 'hidden md:block w-px h-64' : 'block md:hidden w-24 h-px'}
      viewBox={vertical ? '0 0 1 256' : '0 0 96 1'}
      preserveAspectRatio="none"
    >
      <motion.line
        x1={vertical ? 0.5 : 0}
        y1={vertical ? 0 : 0.5}
        x2={vertical ? 0.5 : 96}
        y2={vertical ? 256 : 0.5}
        stroke="#C4A962"
        strokeOpacity="0.6"
        strokeWidth={vertical ? 1 : 1}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: inView ? 1 : 0 }}
        transition={{ duration: 1.2, ease: 'easeInOut', delay: 0.3 }}
      />
    </svg>
  )
}

function StoryLines({ story, inView }) {
  // Split story into sentences/lines and fade each one in with a stagger.
  const lines = story.split(/(?<=[\.\!\؟])\s+/).filter(Boolean)
  return (
    <div className="space-y-2">
      {lines.map((line, i) => (
        <motion.p
          key={i}
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.5, delay: 0.25 + i * 0.1, ease: 'easeOut' }}
          className="font-kufi text-slate leading-relaxed text-base md:text-lg"
        >
          {line}
        </motion.p>
      ))}
    </div>
  )
}

export default function About() {
  const { t } = useTranslation()
  const sectionRef = useRef(null)
  const statsRef = useRef(null)
  const storyRef = useRef(null)
  const statsInView = useInView(statsRef, { once: true, amount: 0.4 })
  const storyInView = useInView(storyRef, { once: true, amount: 0.3 })

  // Slow vertical parallax on the background gradient (0.3x scroll feel).
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })
  const bgY = useTransform(scrollYProgress, [0, 1], [-60, 60])

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative py-20 md:py-28 px-6 overflow-hidden bg-cream"
    >
      <motion.div
        aria-hidden
        style={{
          y: bgY,
          background: 'linear-gradient(to bottom, #FAF7F2, #F0EBE1)',
        }}
        className="absolute inset-x-0 -top-20 -bottom-20 pointer-events-none"
      />

      <LeafDecoration />

      <div className="relative max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row gap-14 md:gap-20 items-center">
          <motion.div
            ref={statsRef}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-10 md:w-2/5"
          >
            {STATS.map(({ value, suffix, key }) => (
              <div key={key} className="text-center md:text-start">
                <AnimatedCounter
                  target={value}
                  suffix={suffix}
                  inView={statsInView}
                />
                <p className="font-kufi text-primary text-sm mt-1">
                  {t(`about.${key}`)}
                </p>
              </div>
            ))}
          </motion.div>

          <GoldSeparator inView={statsInView} orientation="vertical" />
          <GoldSeparator inView={statsInView} orientation="horizontal" />

          <motion.div
            ref={storyRef}
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="md:w-3/5"
          >
            <h2 className="font-kufi text-3xl md:text-4xl font-bold text-primary mb-6">
              {t('about.title')}
            </h2>
            <StoryLines story={t('about.story')} inView={storyInView} />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
