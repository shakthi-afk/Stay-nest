import React, { useState } from 'react'

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80'

export function ImageWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [didError, setDidError] = useState(false)

  const handleError = () => {
    if (!didError) {
      setDidError(true)
    }
  }

  const { src, alt, style, className, ...rest } = props

  return (
    <img
      src={didError ? FALLBACK_IMAGE : src}
      alt={alt}
      className={className}
      style={style}
      {...rest}
      onError={handleError}
    />
  )
}
