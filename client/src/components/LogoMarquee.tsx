const LOGOS = [
  { src: '/logos/netflix.svg', name: 'Netflix' },
  { src: '/logos/hbomax.svg', name: 'HBO Max' },
  { src: '/logos/max.svg', name: 'Max' },
  { src: '/logos/paramountplus.svg', name: 'Paramount+' },
  { src: '/logos/crunchyroll.svg', name: 'Crunchyroll' },
  { src: '/logos/mubi.svg', name: 'MUBI' },
  { src: '/logos/apple.svg', name: 'Apple TV' },
  { src: '/logos/sony.svg', name: 'Sony' },
  { src: '/logos/fox.svg', name: 'FOX' },
  { src: '/logos/imdb.svg', name: 'IMDb' },
]

function Row({ hidden }: { hidden?: boolean }) {
  const list = [...LOGOS, ...LOGOS, ...LOGOS]

  return (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {list.map((l, i) => (

        <li key={`${l.src}-${i}`} className="flex w-[84px] shrink-0 items-center justify-center sm:w-[96px]">
          <img
            src={l.src}
            alt={hidden ? undefined : l.name}
            loading="lazy"
            decoding="async"

            className="h-6 w-auto max-w-full opacity-45 transition-opacity duration-300 hover:opacity-80 sm:h-7"
            style={{ filter: 'brightness(0) invert(1)' }}
          />
        </li>
      ))}
    </ul>
  )
}

export default function LogoMarquee() {
  return (
    <section className="border-y border-white/[0.06] bg-base-900/40 py-9 sm:py-11">
      <div className="container-app">
        <p className="mb-7 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-faint">
          Kho phim từ các nguồn uy tín
        </p>
      </div>

      <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_12%,#000_88%,transparent)]">
        <div className="flex w-max animate-marquee hover:[animation-play-state:paused] motion-reduce:animate-none">
          <Row />
          <Row hidden />
        </div>
      </div>
    </section>
  )
}