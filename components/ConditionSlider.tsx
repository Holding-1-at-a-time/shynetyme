'use client'

import * as React from 'react'
import * as SliderPrimitive from '@radix-ui/react-slider'

import { cn } from '@/lib/utils'

interface ConditionSliderProps {
  label: string
  value: number
  onChange: (value: number) => void
}

export function ConditionSlider({ label, value, onChange }: ConditionSliderProps) {
  const getColor = (value: number) => {
    if (value < 33) return 'bg-red-500'
    if (value < 66) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <SliderPrimitive.Root
        className="relative flex items-center select-none touch-none w-full h-5"
        value={[value]}
        onValueChange={(newValue) => onChange(newValue[0])}
        max={100}
        step={1}
      >
        <SliderPrimitive.Track className="bg-slate-100 relative grow rounded-full h-2">
          <SliderPrimitive.Range className={`absolute h-full rounded-full ${getColor(value)}`} />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          className="block w-5 h-5 bg-white shadow-lg rounded-full hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        />
      </SliderPrimitive.Root>
      <div className="flex justify-between text-xs text-gray-500">
        <span>Very Dirty</span>
        <span>Clean</span>
      </div>
    </div>
  )
}
