import { useState, useCallback } from "react"

interface GeolocationPosition {
  latitude: number
  longitude: number
  accuracy?: number
}

interface UseGeolocationOptions {
  enableHighAccuracy?: boolean
  timeout?: number
  maximumAge?: number
  onSuccess?: (position: GeolocationPosition) => void
  onError?: (error: GeolocationPositionError) => void
}

interface GeolocationPositionError {
  code: number
  message: string
}

export function useGeolocation({
  enableHighAccuracy = true,
  timeout = 10000,
  maximumAge = 60000,
  onSuccess,
  onError,
}: UseGeolocationOptions = {}) {
  const [position, setPosition] = useState<GeolocationPosition | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const isSupported =
    typeof navigator !== "undefined" && "geolocation" in navigator

  const getCurrentPosition = useCallback(() => {
    if (!isSupported) {
      setError("Geolocation is not supported in this browser")
      return
    }

    setIsLoading(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newPosition: GeolocationPosition = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        }
        setPosition(newPosition)
        setIsLoading(false)
        if (onSuccess) {
          onSuccess(newPosition)
        }
      },
      (err: GeolocationPositionError) => {
        let errorMessage = "Location timeout"
        if (err.code === 1) {
          errorMessage = "Permission denied - Please enable location access"
        } else if (err.code === 2) {
          errorMessage = "Location unavailable"
        }
        setError(errorMessage)
        setIsLoading(false)
        if (onError) {
          onError(err)
        }
      },
      {
        enableHighAccuracy,
        timeout,
        maximumAge,
      },
    )
  }, [isSupported, enableHighAccuracy, timeout, maximumAge, onSuccess, onError])

  const getAddressFromCoordinates = useCallback(
    async (lat: number, lng: number): Promise<string | null> => {
      try {
        return `${lat},${lng}`
      } catch {
        return null
      }
    },
    [],
  )

  return {
    position,
    error,
    isLoading,
    isSupported,
    getCurrentPosition,
    getAddressFromCoordinates,
  }
}
