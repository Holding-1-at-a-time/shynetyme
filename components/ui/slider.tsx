import React from 'react'

interface SliderProps {
  min: number
  max: number
  step?: number
  value: number
  onValueChange: (value: number) => void
  disabled?: boolean
}

export function Slider({ min, max, step = 1, value, onValueChange, disabled = false }: SliderProps) {
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onValueChange(Number(e.target.value))}
      disabled={disabled}
      className={`w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer ${
        disabled ? 'cursor-not-allowed opacity-50' : ''
      }`}
    />
  )
}
