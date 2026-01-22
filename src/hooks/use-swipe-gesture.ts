import { useEffect, useRef, useState } from 'react'

interface SwipeGestureOptions {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  threshold?: number
  velocityThreshold?: number
}

export function useSwipeGesture({
  onSwipeLeft,
  onSwipeRight,
  threshold = 50,
  velocityThreshold = 0.3,
}: SwipeGestureOptions) {
  const [isSwiping, setIsSwiping] = useState(false)
  const [swipeOffset, setSwipeOffset] = useState(0)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const touchStartTime = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let currentTouchX = 0
    let isHorizontalSwipe = false

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX
      touchStartY.current = e.touches[0].clientY
      touchStartTime.current = Date.now()
      currentTouchX = touchStartX.current
      isHorizontalSwipe = false
      setIsSwiping(false)
      setSwipeOffset(0)
    }

    const handleTouchMove = (e: TouchEvent) => {
      const touchX = e.touches[0].clientX
      const touchY = e.touches[0].clientY
      const deltaX = touchX - touchStartX.current
      const deltaY = touchY - touchStartY.current

      if (!isHorizontalSwipe && Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
        return
      }

      if (!isHorizontalSwipe) {
        isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY)
        if (!isHorizontalSwipe) return
      }

      if (isHorizontalSwipe) {
        e.preventDefault()
        currentTouchX = touchX
        setIsSwiping(true)
        setSwipeOffset(deltaX)
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isHorizontalSwipe) {
        setIsSwiping(false)
        setSwipeOffset(0)
        return
      }

      const deltaX = currentTouchX - touchStartX.current
      const deltaTime = Date.now() - touchStartTime.current
      const velocity = Math.abs(deltaX) / deltaTime

      setIsSwiping(false)
      setSwipeOffset(0)

      if (Math.abs(deltaX) > threshold || velocity > velocityThreshold) {
        if (deltaX > 0 && onSwipeRight) {
          onSwipeRight()
        } else if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft()
        }
      }
    }

    container.addEventListener('touchstart', handleTouchStart, { passive: true })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
    }
  }, [onSwipeLeft, onSwipeRight, threshold, velocityThreshold])

  return {
    containerRef,
    isSwiping,
    swipeOffset,
  }
}
