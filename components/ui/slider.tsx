import React from 'react'

interface SliderProps {
  min: number
  max: number
  step?: number
  value: number
  onValueChange: (value: number) => void
  className?: string
}

export function Slider({ min, max, step = 1, value, onValueChange, className }: SliderProps) {
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onValueChange(Number(e.target.value))}
      className={`w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer ${
        disabled ? 'cursor-not-allowed opacity-50' : ''
      } ${className || ''}`}
    />
  )
}
