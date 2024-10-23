import React from 'react'

interface InputProps {
  label: string
  type: string
  value: string | number
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
}

export function Input({ label, type, value, onChange }: InputProps) {
  return (
    <div className="flex flex-col">
      <label className="mb-1 font-medium">{label}</label>
      {type === 'textarea' ? (
        <textarea
          value={value as string}
          onChange={onChange}
          className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      )}
    </div>
  )
}
