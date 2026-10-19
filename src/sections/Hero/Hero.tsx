import { useState } from 'react'
import './Hero.css'

export default function Hero() {
  const [mediaError, setMediaError] = useState(false)

  return (
    <section className="hero" id="experience" aria-labelledby="experience-title">
      <video
        className="hero-video"
        src="/media/headphones-floating.mp4"
        autoPlay
        muted
        playsInline
        loop
        preload="metadata"
        disablePictureInPicture
        aria-label="AURA HX-01 headphones floating in soft studio light"
        onError={() => setMediaError(true)}
      />
      <div className="hero-overlay" aria-hidden="true" />
      <header className="hero-top">
        <nav className="hero-nav" aria-label="HX-01 product navigation">
          <a className="hero-brand" href="#experience" aria-label="AURA home">AURA</a>
          <span className="hero-model">HX-01</span>
          <div className="hero-nav-links">
            <a href="#hero-specifications">SOUND</a>
            <a href="#hero-comfort">COMFORT</a>
            <a href="#experience-title">DESIGN</a>
            <span className="hero-buy">BUY <span aria-hidden="true">↗</span></span>
          </div>
        </nav>
        <p className="hero-specifications" id="hero-specifications">
          WIRELESS OVER-EAR / HX-01<br />ADAPTIVE ANC / 40H BATTERY
        </p>
      </header>
      <div className="hero-copy">
        <p className="hero-eyebrow">AURA / HX-01</p>
        <h1 id="experience-title">WEIGHTLESS<br />BY DESIGN</h1>
        <p className="hero-body" id="hero-comfort">Built for long listening.<br />Balanced for effortless comfort.</p>
      </div>
      {mediaError && <p className="hero-status" role="status">Video unavailable. Please reload to try again.</p>}
    </section>
  )
}
