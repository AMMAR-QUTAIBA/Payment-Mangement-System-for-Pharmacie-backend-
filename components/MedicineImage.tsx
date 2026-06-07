'use client'

type Props = {
  src: string
  alt: string
  style?: React.CSSProperties
  fallbackStyle?: React.CSSProperties
}

export default function MedicineImage({ src, alt, style, fallbackStyle }: Props) {
  return (
   
    <img
      src={src}
      alt={alt}
      style={style}
      onError={(e) => {
        const target = e.target as HTMLImageElement
        target.style.display = 'none'
        const parent = target.parentElement
        if (parent) {
          const fallback = document.createElement('span')
          fallback.textContent = '💊'
          fallback.style.cssText = 'font-size:48px;opacity:0.4'
          Object.assign(fallback.style, fallbackStyle)
          parent.appendChild(fallback)
        }
      }}
    />
  )
}
