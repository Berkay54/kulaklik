import './Hero.css'

const chapters = [
  {
    eyebrow: 'AURA / HX-01',
    heading: <>DESIGNED AS ONE</>,
    body: 'A unified acoustic system engineered for balance, comfort and silence.',
  },
  {
    eyebrow: 'INTERNAL ARCHITECTURE',
    heading: <>PRECISION IN<br />EVERY LAYER</>,
    body: 'Drivers, acoustic chambers and structural components aligned with purpose.',
  },
  {
    eyebrow: 'ADAPTIVE ACOUSTICS',
    heading: <>CONTROL THE NOISE</>,
    body: 'Integrated electronics continuously shape the listening environment around you.',
  },
  {
    eyebrow: 'ENGINEERING',
    heading: <>EVERY COMPONENT.<br />PURPOSEFULLY PLACED.</>,
    body: 'A complete system reduced to its essential parts.',
  },
]

export default function Hero() {
  return (
    <div className="editorial-column">
      <div className="chapter-copy">
        {chapters.map((chapter, index) => (
          <div className="experience-caption" key={chapter.eyebrow} aria-hidden={index !== 0}>
            <p className="eyebrow">{chapter.eyebrow}</p>
            {index === 0
              ? <h1 id="experience-title">{chapter.heading}</h1>
              : <h2>{chapter.heading}</h2>}
            <p className="chapter-body">{chapter.body}</p>
          </div>
        ))}
      </div>
      <p className="scroll-cue">SCROLL TO DISCOVER <span aria-hidden="true">&#8595;</span></p>
    </div>
  )
}
