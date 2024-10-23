import React from 'react'

interface StepperProps {
  currentStep: number
  totalSteps: number
}

export function Stepper({ currentStep, totalSteps }: StepperProps) {
  return (
    <div className="flex items-center space-x-4">
      {Array.from({ length: totalSteps }, (_, index) => (
        <div key={index} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep > index ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700'
            }`}
          >
            {index + 1}
          </div>
          {index < totalSteps - 1 && <div className="w-10 h-1 bg-gray-300 mx-2"></div>}
        </div>
      ))}
    </div>
  )
}
