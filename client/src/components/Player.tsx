'use client'

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  Ban,
  Check,
  Gauge,
  Maximize,
  Minimize,
  Pause,
  PictureInPicture2,
  Play,
  RotateCcw,
  RotateCw,
  Volume1,
  Volume2,
  VolumeX,
} from 'lucide-react'
import type Hls from 'hls.js'
import type { Episode } from '@/types'

interface Props {
  episode: Episode
  title: string
  poster?: string

  startAt?: number

  onTimeUpdate?: (info: { time: number; duration: number }) => void

  onEnded?: () => void
}

type Mode = 'auto' | 'm3u8' | 'embed'

export interface PlayerHandle {
  seekTo: (time: number) => void
  play: () => void
}

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2]
const SEEK_STEP = 10
const HIDE_CONTROLS_MS = 2800

function fmt(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const s = Math.floor(seconds % 60)
  const m = Math.floor((seconds / 60) % 60)
  const h = Math.floor(seconds / 3600)
  const pad = (n: number) => String(n).padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`
}

const Player = forwardRef<PlayerHandle, Props>(function Player(
  { episode, title, poster, startAt = 0, onTimeUpdate, onEnded },
  ref,
) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const hideTimer = useRef<number | undefined>(undefined)
  const hlsRef = useRef<Hls | null>(null)

  const [mode, setMode] = useState<Mode>('auto')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const [blocked, setBlocked] = useState(false)

  const [playing, setPlaying] = useState(false)
  const [started, setStarted] = useState(false)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)
  const [buffered, setBuffered] = useState(0)
  const [volume, setVolume] = useState(1)
  const [muted, setMuted] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [fullscreen, setFullscreen] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [controlsVisible, setControlsVisible] = useState(true)
  const [scrubbing, setScrubbing] = useState<number | null>(null)
  const [pip, setPip] = useState(false)

  const m3u8 = episode.link_m3u8
  const embed = episode.link_embed
  const showEmbed = mode === 'embed' || (!m3u8 && !!embed)

  const tryPlay = useCallback(async (): Promise<boolean> => {
    const video = videoRef.current
    if (!video) return false
    try {
      await video.play()
      setBlocked(false)
      return true
    } catch (err) {
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        setBlocked(true)
      } else if (err instanceof DOMException && err.name === 'AbortError') {
        return false
      } else {
        setError('Không phát được tập này. Thử chuyển sang nguồn Embed.')
        setLoading(false)
      }
      return false
    }
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video || showEmbed || !m3u8) return

    let cancelled = false

    setError(null)
    setBlocked(false)
    setLoading(true)
    setStarted(false)
    setPlaying(false)
    setCurrent(0)
    setDuration(0)
    setBuffered(0)

    hlsRef.current?.destroy()
    hlsRef.current = null

    const canNativeHls = video.canPlayType('application/vnd.apple.mpegurl') === 'probably'

    const onLoadedMetadata = () => {
      const d = video.duration || 0
      setDuration(d)

      if (startAt > 0 && Number.isFinite(startAt) && startAt < d * 0.97) {
        video.currentTime = startAt
        setCurrent(startAt)
      }
      setLoading(false)
    }
    const onError = () => {
      setError('Không phát được tập này. Thử chuyển sang nguồn Embed.')
      setLoading(false)
    }
    video.addEventListener('loadedmetadata', onLoadedMetadata)
    video.addEventListener('error', onError)

    void (async () => {
      if (!canNativeHls) {
        const { default: Hls } = await import('hls.js')
        if (cancelled) return
        if (Hls.isSupported()) {
          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90,
            maxBufferLength: 30,
          })
          hlsRef.current = hls
          hls.loadSource(m3u8)
          hls.attachMedia(video)
          hls.on(Hls.Events.ERROR, (_evt, data) => {
            if (!data.fatal) return
            if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad()
            } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError()
            } else {
              setError('Không phát được nguồn HLS này.')
              setLoading(false)
            }
          })
          return
        }

        if (!cancelled) setMode('embed')
        return
      }

      video.src = m3u8
    })()

    return () => {
      cancelled = true
      video.removeEventListener('loadedmetadata', onLoadedMetadata)
      video.removeEventListener('error', onError)
      hlsRef.current?.destroy()
      hlsRef.current = null
    }
  }, [m3u8, showEmbed, startAt])

  useEffect(() => {
    setMode('auto')
    setError(null)
    setBlocked(false)
    setShowSettings(false)
  }, [episode.slug || episode.name])

  const wasPlayingRef = useRef(false)
  const userPausedRef = useRef(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const mark = () => {
      if (!video.paused && !video.ended) wasPlayingRef.current = true
    }

    video.addEventListener('playing', mark)

    const onOnline = () => {
      const el = videoRef.current
      if (!el) return
      if (!wasPlayingRef.current || userPausedRef.current) return
      if (!el.paused || el.ended) return
      void tryPlay()
    }

    window.addEventListener('online', onOnline)
    return () => {
      video.removeEventListener('playing', mark)
      window.removeEventListener('online', onOnline)
    }
  }, [tryPlay])

  const handlePause = useCallback(() => {
    const video = videoRef.current
    if (video?.ended) wasPlayingRef.current = false
    setPlaying(false)
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const onTime = () => {
      if (!scrubbing) setCurrent(video.currentTime)
      if (video.buffered.length) {
        setBuffered(video.buffered.end(video.buffered.length - 1))
      }
      onTimeUpdate?.({ time: video.currentTime, duration: video.duration || 0 })
    }
    const onPlay = () => {
      setPlaying(true)
      setStarted(true)
      setLoading(false)
    }
    const onPause = () => handlePause()
    const onWaiting = () => setLoading(true)
    const onPlaying = () => setLoading(false)
    const onVolume = () => {
      setVolume(video.volume)
      setMuted(video.muted)
    }
    const onRate = () => setSpeed(video.playbackRate)
    const onEnd = () => {
      setPlaying(false)
      onEnded?.()
    }
    const onMeta = () => setDuration(video.duration || 0)

    video.addEventListener('timeupdate', onTime)
    video.addEventListener('progress', onTime)
    video.addEventListener('play', onPlay)
    video.addEventListener('pause', onPause)
    video.addEventListener('waiting', onWaiting)
    video.addEventListener('playing', onPlaying)
    video.addEventListener('volumechange', onVolume)
    video.addEventListener('ratechange', onRate)
    video.addEventListener('ended', onEnd)
    video.addEventListener('loadedmetadata', onMeta)
    return () => {
      video.removeEventListener('timeupdate', onTime)
      video.removeEventListener('progress', onTime)
      video.removeEventListener('play', onPlay)
      video.removeEventListener('pause', onPause)
      video.removeEventListener('waiting', onWaiting)
      video.removeEventListener('playing', onPlaying)
      video.removeEventListener('volumechange', onVolume)
      video.removeEventListener('ratechange', onRate)
      video.removeEventListener('ended', onEnd)
      video.removeEventListener('loadedmetadata', onMeta)
    }
  }, [showEmbed, scrubbing, onTimeUpdate, onEnded])

  useEffect(() => {
    const onFs = () => setFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onFs)
    return () => document.removeEventListener('fullscreenchange', onFs)
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (video && 'pictureInPictureEnabled' in document) {
      const onPip = () => setPip(document.pictureInPictureElement === video)
      video.addEventListener('enterpictureinpicture', onPip)
      video.addEventListener('leavepictureinpicture', onPip)
      return () => {
        video.removeEventListener('enterpictureinpicture', onPip)
        video.removeEventListener('leavepictureinpicture', onPip)
      }
    }
  }, [showEmbed])

  const togglePlay = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      userPausedRef.current = false
      void tryPlay()
    } else {
      userPausedRef.current = true
      setBlocked(false)
      video.pause()
    }
  }, [tryPlay])

  const seekBy = useCallback((delta: number) => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = Math.min(Math.max(video.currentTime + delta, 0), video.duration || 0)
  }, [])

  const seekTo = useCallback((time: number) => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = Math.min(Math.max(time, 0), video.duration || 0)
  }, [])

  const setVol = useCallback((v: number) => {
    const video = videoRef.current
    if (!video) return
    video.volume = v
    if (v > 0) video.muted = false
  }, [])

  const toggleMute = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
  }, [])

  const changeSpeed = useCallback((rate: number) => {
    const video = videoRef.current
    if (!video) return
    video.playbackRate = rate
  }, [])

  useImperativeHandle(
    ref,
    () => ({
      seekTo: (time: number) => {
        const video = videoRef.current
        if (!video) return
        video.currentTime = Math.min(Math.max(time, 0), video.duration || 0)
        setCurrent(video.currentTime)
      },
      play: () => {
        void tryPlay()
      },
    }),
    [tryPlay],
  )

  const toggleFullscreen = useCallback(() => {
    const el = wrapRef.current
    if (!el) return
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined)
    else void el.requestFullscreen().catch(() => undefined)
  }, [])

  const togglePip = useCallback(async () => {
    const video = videoRef.current
    if (!video || !('requestPictureInPicture' in video)) return
    try {
      if (document.pictureInPictureElement) await document.exitPictureInPicture()
      else await video.requestPictureInPicture()
    } catch {}
  }, [])

  const bumpControls = useCallback(() => {
    setControlsVisible(true)
    window.clearTimeout(hideTimer.current)
    hideTimer.current = window.setTimeout(() => {
      const video = videoRef.current
      if (video && !video.paused && !showSettings) setControlsVisible(false)
    }, HIDE_CONTROLS_MS)
  }, [showSettings])

  useEffect(() => {
    const video = videoRef.current
    if (!video || video.paused) return
    bumpControls()
    return () => window.clearTimeout(hideTimer.current)
  }, [playing, showSettings])

  useEffect(() => {
    const bump = () => bumpControls()
    const el = wrapRef.current
    if (!el) return
    el.addEventListener('mousemove', bump)
    el.addEventListener('touchstart', bump, { passive: true })
    return () => {
      el.removeEventListener('mousemove', bump)
      el.removeEventListener('touchstart', bump)
    }
  }, [bumpControls])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return
      }
      const key = e.key.toLowerCase()

      if (key === ' ' || key === 'k') {
        e.preventDefault()
        togglePlay()
      } else if (key === 'arrowright') {
        e.preventDefault()
        seekBy(SEEK_STEP)
      } else if (key === 'arrowleft') {
        e.preventDefault()
        seekBy(-SEEK_STEP)
      } else if (key === 'arrowup') {
        e.preventDefault()
        setVol(Math.min(videoRef.current?.volume ?? 1, 1) + 0.1)
      } else if (key === 'arrowdown') {
        e.preventDefault()
        setVol(Math.max((videoRef.current?.volume ?? 1) - 0.1, 0))
      } else if (key === 'm') {
        toggleMute()
      } else if (key === 'f') {
        toggleFullscreen()
      } else if (key === 'i') {
        void togglePip()
      } else if (key === 'j') {
        seekBy(-SEEK_STEP)
      } else if (key === 'l') {
        seekBy(SEEK_STEP)
      } else if (key === 'home') {
        seekTo(0)
      } else if (key === 'end') {
        seekTo(duration)
      } else if (key === '>') {
        const i = SPEEDS.indexOf(speed)
        changeSpeed(SPEEDS[Math.min(i + 1, SPEEDS.length - 1)])
      } else if (key === '<') {
        const i = SPEEDS.indexOf(speed)
        changeSpeed(SPEEDS[Math.max(i - 1, 0)])
      }
      bumpControls()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [
    togglePlay,
    seekBy,
    seekTo,
    setVol,
    toggleMute,
    toggleFullscreen,
    togglePip,
    changeSpeed,
    duration,
    speed,
    bumpControls,
  ])

  const progress = duration > 0 ? (scrubbing ?? current) / duration : 0
  const bufferedPct = duration > 0 ? Math.min(buffered / duration, 1) : 0
  const isLive = !Number.isFinite(duration) || duration === 0
  const displayTime = scrubbing ?? current

  const barRef = useRef<HTMLDivElement>(null)
  const dragValueRef = useRef<number | null>(null)

  const timeFromClientX = useCallback(
    (clientX: number) => {
      const bar = barRef.current?.getBoundingClientRect()
      if (!bar || bar.width <= 0 || !duration) return null
      const ratio = Math.min(Math.max((clientX - bar.left) / bar.width, 0), 1)
      return ratio * duration
    },
    [duration],
  )

  const applyScrubTime = useCallback((time: number) => {
    dragValueRef.current = time
    setScrubbing(time)

    const video = videoRef.current
    if (video && Number.isFinite(video.duration) && video.duration > 0) {
      video.currentTime = Math.min(time, video.duration)
    }
  }, [])

  const beginScrub = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!duration) return
      e.preventDefault()
      e.stopPropagation()
      const time = timeFromClientX(e.clientX)
      if (time === null) return
      applyScrubTime(time)
      bumpControls()
    },
    [duration, timeFromClientX, applyScrubTime, bumpControls],
  )

  const moveScrub = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (dragValueRef.current === null) return
      e.preventDefault()
      const time = timeFromClientX(e.clientX)
      if (time !== null) applyScrubTime(time)
    },
    [timeFromClientX, applyScrubTime],
  )

  const endScrub = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (dragValueRef.current === null) return
    e.preventDefault()
    e.stopPropagation()
    dragValueRef.current = null
    setScrubbing(null)
  }, [])

  const cancelScrub = useCallback(() => {
    dragValueRef.current = null
    setScrubbing(null)
  }, [])

  const volumeIcon = useMemo(() => {
    if (muted || volume === 0) return 'mute'
    if (volume < 0.4) return 'low'
    if (volume < 0.7) return 'mid'
    return 'high'
  }, [muted, volume])

  return (
    <div className="space-y-3">
      <div
        ref={wrapRef}
        onDoubleClick={toggleFullscreen}
        onMouseEnter={() => setControlsVisible(true)}
        className="group/player relative aspect-video w-full select-none overflow-hidden rounded-card border border-white/[0.07] bg-black shadow-lift"
      >
        {showEmbed ? (
          embed ? (
            <iframe
              key={embed}
              src={embed}
              title={title}
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
              allowFullScreen
              referrerPolicy="origin"
              className="absolute inset-0 h-full w-full border-0"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center">
              <Ban className="h-7 w-7 text-ink-faint" />
              <p className="text-sm text-ink-muted">Tập này chưa có nguồn phát.</p>
            </div>
          )
        ) : (
          <>
            <div
              onClick={togglePlay}
              className="absolute inset-0"
              role="button"
              tabIndex={-1}
              aria-label={playing ? 'Tạm dừng' : 'Phát'}
            />
            <video
              ref={videoRef}
              playsInline
              preload="metadata"
              poster={poster}
              className="absolute inset-0 h-full w-full bg-black"
              onClick={togglePlay}
            />

            {loading && started && (
              <div className="pointer-events-none absolute inset-0 grid place-items-center">
                <div className="h-11 w-11 animate-spin rounded-full border-[3px] border-white/15 border-t-accent" />
              </div>
            )}

            {!started && !loading && !error && (
              <button
                type="button"
                onClick={togglePlay}
                aria-label="Phát"
                className="absolute inset-0 grid place-items-center"
              >
                <span className="grid h-[72px] w-[72px] place-items-center rounded-full bg-black/45 text-white shadow-lift backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-accent hover:text-white">
                  <Play className="ml-1 h-7 w-7" fill="currentColor" />
                </span>
              </button>
            )}

            {blocked && !error && (
              <div className="absolute inset-0 grid place-items-center bg-black/55 px-6 backdrop-blur-[2px]">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="group flex flex-col items-center gap-3"
                >
                  <span className="grid h-[72px] w-[72px] place-items-center rounded-full bg-accent text-white transition-transform duration-300 group-hover:scale-105">
                    <Play className="ml-1 h-7 w-7" fill="currentColor" />
                  </span>
                  <span className="text-center text-sm font-medium text-white">
                    Bấm để tiếp tục xem
                  </span>
                  <span className="max-w-xs text-center text-[11.5px] text-white/60">
                    Kết nối mạng vừa thay đổi nên trình duyệt dừng phát. Tập vẫn giữ
                    nguyên vị trí.
                  </span>
                </button>
              </div>
            )}

            {error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/70 px-6 text-center">
                <p className="text-sm text-ink">{error}</p>
                {m3u8 && embed && (
                  <button
                    type="button"
                    onClick={() => setMode((current) => (current === 'embed' ? 'm3u8' : 'embed'))}
                    className="btn-ghost"
                  >
                    Thử nguồn {(mode as Mode) === 'embed' ? 'HLS' : 'Embed'}
                  </button>
                )}
              </div>
            )}

            {!error && (
              <div
                className={`absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/90 via-black/55 to-transparent px-3 pb-2.5 pt-10 transition-opacity duration-300 sm:px-4 ${
                  controlsVisible || !playing ? 'opacity-100' : 'pointer-events-none opacity-0'
                }`}
              >
                <div
                  ref={barRef}
                  className="group/bar relative h-4 cursor-pointer touch-none select-none"
                  onPointerDown={beginScrub}
                  onPointerMove={moveScrub}
                  onPointerUp={endScrub}
                  onPointerCancel={cancelScrub}
                >
                  <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/20">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-white/25"
                      style={{ width: `${bufferedPct * 100}%` }}
                    />
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-accent"
                      style={{ width: `${Math.min(progress, 1) * 100}%` }}
                    />
                  </div>
                  <div
                    className="pointer-events-none absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent opacity-0 transition-opacity group-hover/bar:opacity-100"
                    style={{ left: `${Math.min(progress, 1) * 100}%` }}
                  />
                </div>

                <div className="flex items-center gap-1 sm:gap-2">
                  <ControlBtn onClick={togglePlay} label={playing ? 'Tạm dừng' : 'Phát'}>
                    {playing ? <Pause className="h-[18px] w-[18px]" fill="currentColor" /> : (
                      <Play className="ml-0.5 h-[18px] w-[18px]" fill="currentColor" />
                    )}
                  </ControlBtn>

                  <ControlBtn onClick={() => seekBy(-SEEK_STEP)} label="Lùi 10 giây" className="hidden sm:grid">
                    <RotateCcw className="h-[18px] w-[18px]" />
                  </ControlBtn>
                  <ControlBtn onClick={() => seekBy(SEEK_STEP)} label="Tiến 10 giây" className="hidden sm:grid">
                    <RotateCw className="h-[18px] w-[18px]" />
                  </ControlBtn>

                  <div className="group/vol flex items-center">
                    <ControlBtn onClick={toggleMute} label="Tắt tiếng">
                      {volumeIcon === 'mute' ? (
                        <VolumeX className="h-[18px] w-[18px]" />
                      ) : volumeIcon === 'low' ? (
                        <Volume1 className="h-[18px] w-[18px]" />
                      ) : (
                        <Volume2 className="h-[18px] w-[18px]" />
                      )}
                    </ControlBtn>
                    <div className="hidden w-0 overflow-hidden transition-all duration-300 group-hover/vol:w-20 sm:block">
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={muted ? 0 : volume}
                        onChange={(e) => setVol(Number(e.target.value))}
                        aria-label="Âm lượng"
                        className="h-1 w-full cursor-pointer accent-accent"
                      />
                    </div>
                  </div>

                  <span className="ml-1 whitespace-nowrap font-mono text-[11.5px] tabular-nums text-white/85 sm:text-xs">
                    {fmt(displayTime)}{' '}
                    <span className="text-white/45">/ {isLive ? '—' : fmt(duration)}</span>
                  </span>

                  <div className="ml-auto flex items-center gap-1">
                    <div className="relative">
                      <ControlBtn
                        onClick={() => setShowSettings((v) => !v)}
                        label="Cài đặt"
                        active={showSettings || speed !== 1}
                      >
                        <Gauge className="h-[18px] w-[18px]" />
                      </ControlBtn>
                      {showSettings && (
                        <div className="absolute bottom-11 right-0 w-52 overflow-hidden rounded-xl border border-white/10 bg-base-900/95 shadow-lift backdrop-blur-xl">
                          <div className="border-b border-white/[0.07] px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
                            Tốc độ
                          </div>
                          {SPEEDS.map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => changeSpeed(s)}
                              className={`flex w-full items-center justify-between px-3 py-1.5 text-sm transition-colors hover:bg-white/[0.07] ${
                                speed === s ? 'text-accent' : 'text-ink-muted'
                              }`}
                            >
                              {s}x
                              {speed === s && <Check className="h-3.5 w-3.5" />}
                            </button>
                          ))}
                          {m3u8 && embed && (
                            <>
                              <div className="mt-1 border-t border-white/[0.07] px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
                                Nguồn phát
                              </div>
                              {(['auto', 'm3u8', 'embed'] as Mode[]).map((m) => (
                                <button
                                  key={m}
                                  type="button"
                                  onClick={() => setMode(m)}
                                  className={`flex w-full items-center justify-between px-3 py-1.5 text-sm transition-colors hover:bg-white/[0.07] ${
                                    mode === m ? 'text-accent' : 'text-ink-muted'
                                  }`}
                                >
                                  {m === 'auto' ? 'Tự động' : m === 'm3u8' ? 'HLS' : 'Embed'}
                                  {mode === m && <Check className="h-3.5 w-3.5" />}
                                </button>
                              ))}
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    <ControlBtn
                      onClick={() => void togglePip()}
                      label="Hình trong hình"
                      active={pip}
                      className="hidden sm:grid"
                    >
                      <PictureInPicture2 className="h-[18px] w-[18px]" />
                    </ControlBtn>
                    <ControlBtn onClick={toggleFullscreen} label="Toàn màn hình">
                      {fullscreen ? <Minimize className="h-[18px] w-[18px]" /> : <Maximize className="h-[18px] w-[18px]" />}
                    </ControlBtn>
                  </div>
                </div>
              </div>
            )}

            {scrubbing !== null && (
              <div className="pointer-events-none absolute right-4 top-4 rounded-lg bg-black/70 px-2.5 py-1 font-mono text-xs text-white backdrop-blur">
                {fmt(scrubbing)}
              </div>
            )}
          </>
        )}
      </div>

      <div className="space-y-2">
        {error && <p className="text-[11px] text-accent">{error}</p>}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-ink-faint">
          <span className="mr-0.5 hidden font-medium text-ink-faint/80 sm:inline">Phím tắt:</span>
          <Shortcut keys={['J', '←']} hint="Lùi 10s" />
          <Shortcut keys={['L', '→']} hint="Tiến 10s" />
          <Shortcut keys={['Space']} hint="Phát / dừng" />
          <Shortcut keys={['F']} hint="Toàn màn hình" />
          <Shortcut keys={['M']} hint="Tắt tiếng" />
          <Shortcut keys={['I']} hint="Hình trong hình" />
          <Shortcut keys={['0–9']} hint={`Tốc độ ${speed}x`} />
        </div>
      </div>
    </div>
  )
})

export default Player

function Shortcut({ keys, hint }: { keys: string[]; hint: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.07] bg-white/[0.03] px-2 py-1">
      {keys.map((k) => (
        <kbd
          key={k}
          className="min-w-[18px] rounded border border-white/12 bg-base-800/80 px-1 py-px text-center font-mono text-[10px] font-medium text-ink-muted"
        >
          {k}
        </kbd>
      ))}
      <span className="text-ink-faint">{hint}</span>
    </span>
  )
}

function ControlBtn({
  children,
  onClick,
  label,
  className = '',
  active,
}: {
  children: React.ReactNode
  onClick: () => void
  label: string
  className?: string
  active?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`grid h-9 w-9 place-items-center rounded-full text-white/90 transition-colors hover:bg-white/15 hover:text-white ${
        active ? 'text-accent' : ''
      } ${className}`}
    >
      {children}
    </button>
  )
}
