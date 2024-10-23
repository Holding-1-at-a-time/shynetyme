import { api } from '@/convex/_generated/api'
import { useMutation, useQuery } from 'convex/react'
import Image from 'next/image'
import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
interface ImageUploadProps {
  images: string[]
  onChange: (images: string[]) => void
}

export function ImageUpload({ images, onChange }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const generateUploadUrl = useMutation(api.files.generateUploadUrl)
  const getImageUrl = useQuery(api.files.getImageUrl)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsUploading(true)
    const newImages = []

    for (const file of acceptedFiles) {
      const uploadUrl = await generateUploadUrl({ contentType: file.type })
      const result = await fetch(uploadUrl, {
        method: 'POST',
        body: file,
        headers: { 'Content-Type': file.type },
      })

      if (result.ok) {
        const { storageId } = await result.json()
        newImages.push(storageId)
      } else {
        console.error('Upload failed:', await result.text())
      }
    }

    onChange([...images, ...newImages])
    setIsUploading(false)
  }, [images, onChange, generateUploadUrl])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  return (
    <div>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
      >
        <input {...getInputProps()} />
        <p>{isUploading ? 'Uploading...' : 'Drag & drop images here, or click to select files'}</p>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-4">
        {images.map((storageId, index) => {
          const imageUrl = getImageUrl({ storageId })
          return (
            <div key={index} className="relative">
              {imageUrl && (
                <Image
                  src={imageUrl}
                  alt={`Uploaded image ${index + 1}`}
                  width={100}
                  height={100}
                  className="object-cover rounded-lg"
                />
              )}
              <button
                onClick={() => onChange(images.filter((_, i) => i !== index))}
                className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
              >
                ×
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}