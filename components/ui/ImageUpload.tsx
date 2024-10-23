import React, { useState, useRef, useEffect } from 'react'
import { CloudUpload } from 'lucide-react'

export interface ImageUploadProps {
  images: string[]
  onChange: (images: string[]) => void
  maxImages?: number
}

export function ImageUpload({ images, onChange, maxImages = 10 }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [objectURLs, setObjectURLs] = useState<string[]>([])

  const handleFilesUpload = (files: FileList) => {
    const newObjectURLs = Array.from(files).map((file) => URL.createObjectURL(file))
    setObjectURLs((prev) => [...prev, ...newObjectURLs])
    onChange([...images, ...newObjectURLs])
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesUpload(e.dataTransfer.files)
      e.dataTransfer.clearData()
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleDelete = (index: number) => {
    const updatedImages = [...images]
    const updatedObjectURLs = [...objectURLs]
    URL.revokeObjectURL(updatedObjectURLs[index])
    updatedImages.splice(index, 1)
    updatedObjectURLs.splice(index, 1)
    setObjectURLs(updatedObjectURLs)
    onChange(updatedImages)
  }

  useEffect(() => {
    return () => {
      objectURLs.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [objectURLs])

  return (
    <div>
      <div
        className="border-dashed border-2 border-gray-400 rounded-md p-6 text-center cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <CloudUpload className="mx-auto mb-4 w-12 h-12 text-gray-500" />
        <p>Drag & drop images here, or click to upload</p>
      </div>
      <input
        type="file"
        accept="image/*"
        multiple
        ref={fileInputRef}
        className="hidden"
        onChange={(e) => {
          if (e.target.files) {
            handleFilesUpload(e.target.files)
          }
        }}
      />
      {images.length > 0 && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((src, index) => (
            <div key={index} className="relative">
              <img src={src} alt={`Uploaded ${index + 1}`} className="w-full h-32 object-cover rounded-md" />
              <button
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                onClick={() => handleDelete(index)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
