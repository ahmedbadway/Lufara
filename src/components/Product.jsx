import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'

const WHATSAPP_URL = 'https://wa.me/201111111111'

const cardVariants = {
  hidden: { opacity: 0, y: 60 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  }),
}

function FeatureList({ features }) {
  return (
    <ul className="space-y-2 mb-8">
      {features.map((f, i) => (
        <li key={i} className="flex items-center gap-2 text-slate text-sm">
          <span className="text-secondary">✓</span>
          {f}
        </li>
      ))}
    </ul>
  )
}

function PriceCounter({ price, inView }) {
  // Pulls the integer out of a price string like "5€" or "250 EGP" and counts
  // up to it when the card enters view. Non-numeric parts are preserved.
  const match = /^(\d+)(.*)$/.exec(price.trim())
  const target = match ? parseInt(match[1], 10) : null
  const suffix = match ? match[2] : ''
  const [value, setValue] = useState(target ?? 0)

  useEffect(() => {
    if (!inView || target == null) return
    let raf
    const duration = 1000
    const start = performance.now()
    const step = (now) => {
      const t = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(Math.round(eased * target))
      if (t < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [inView, target])

  if (target == null) {
    return <span className="text-accent text-3xl font-bold font-playfair">{price}</span>
  }
  return (
    <span className="text-accent text-3xl font-bold font-playfair">
      {value}
      {suffix}
    </span>
  )
}

function ProductCard({ image, icon, title, price, originalPrice, features, badge, index }) {
  const { t } = useTranslation()
  const cardRef = useRef(null)
  const inView = useInView(cardRef, { once: true, amount: 0.4 })

  return (
    <motion.div
      ref={cardRef}
      custom={index}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      whileHover={{ y: -12, rotate: 1.5, boxShadow: '0 30px 60px -20px rgba(44,44,44,0.35)' }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className="relative bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col items-center text-center flex-1 max-w-sm"
    >
      {badge && (
        <motion.span
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-4 end-4 z-10 bg-accent text-white text-xs font-kufi font-semibold px-4 py-1 rounded-full shadow-md"
        >
          {badge}
        </motion.span>
      )}

      <img
        src={image}
        alt={title}
        className="w-full h-48 object-cover rounded-xl"
      />

      <div className="p-8 flex flex-col items-center w-full">
        <span className="text-4xl mb-4">{icon}</span>

        <h3 className="font-kufi text-xl font-semibold text-dark mb-2">{title}</h3>

        <div className="mb-6">
          {originalPrice && (
            <span className="text-slate/60 line-through text-sm me-2">
              {originalPrice}
            </span>
          )}
          <PriceCounter price={price} inView={inView} />
        </div>

        <FeatureList features={features} />

        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto w-full bg-accent hover:bg-accent/90 text-white font-kufi font-semibold py-3 rounded-xl transition-colors text-center block"
        >
          {t('product.order_now')}
        </a>
      </div>
    </motion.div>
  )
}

export default function Product() {
  const { t } = useTranslation()
  const features = t('product.features', { returnObjects: true })
  const sectionRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'start center'],
  })
  // Slide the section up slightly as it enters, overlapping the hero by ~100px.
  const slideY = useTransform(scrollYProgress, [0, 1], [100, 0])

  return (
    <motion.section
      ref={sectionRef}
      id="product"
      style={{ y: slideY }}
      className="relative bg-cream py-20 md:py-28 px-6 z-10"
    >
      <div className="max-w-4xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="font-kufi text-3xl md:text-4xl font-bold text-dark text-center mb-14"
        >
          {t('product.title')}
        </motion.h2>

        <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch">
          <ProductCard
            index={0}
            image="/Lufara/images/product1.png"
            icon="🌿"
            title={t('product.single_title')}
            price={t('product.single_price')}
            features={features}
          />
          <ProductCard
            index={1}
            image="/Lufara/images/product2.png"
            icon="🌿🌿🌿"
            title={t('product.triple_title')}
            price={t('product.triple_price')}
            originalPrice={t('product.triple_original')}
            features={features}
            badge={t('product.best_value')}
          />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-12 text-center bg-white/60 backdrop-blur-sm rounded-xl py-4 px-6"
        >
          <p className="font-kufi text-slate text-sm">
            🇪🇬 + 🇪🇸 — {t('product.shipping')}
          </p>
        </motion.div>
      </div>
    </motion.section>
  )
}
