'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { io, type Socket } from 'socket.io-client'

export interface DrawEvent {
  number: number
  sequence: number
}

export interface WinnerEvent {
  participantName: string
  cartonRef: string
}

export interface UseTirageResult {
  drawn: number[]
  current: number | null
  animKey: number
  winner: WinnerEvent | null
  connected: boolean
  clearWinner: () => void
}

/**
 * S'abonne aux événements Socket.io d'un tirage en cours.
 * Émet `join:tirage` au serveur pour rejoindre la room dédiée.
 */
export function useTirage(tirageId: string, initialDrawn: number[]): UseTirageResult {
  const [drawn,     setDrawn]     = useState<number[]>(initialDrawn)
  const [current,   setCurrent]   = useState<number | null>(initialDrawn[initialDrawn.length - 1] ?? null)
  const [animKey,   setAnimKey]   = useState(0)
  const [winner,    setWinner]    = useState<WinnerEvent | null>(null)
  const [connected, setConnected] = useState(false)

  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    const socket = io({ path: '/socket.io', transports: ['websocket', 'polling'] })
    socketRef.current = socket

    socket.on('connect',    () => setConnected(true))
    socket.on('disconnect', () => setConnected(false))

    socket.emit('join:tirage', tirageId)

    socket.on('draw', (event: DrawEvent) => {
      setDrawn(prev => [...prev, event.number])
      setCurrent(event.number)
      setAnimKey(k => k + 1)
    })

    socket.on('winner', (event: WinnerEvent) => {
      setWinner(event)
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [tirageId])

  const clearWinner = useCallback(() => setWinner(null), [])

  return { drawn, current, animKey, winner, connected, clearWinner }
}
