"use client"

import { useRef } from "react"
import { RiImageAddLine } from "@remixicon/react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Input } from "../ui/input"

async function fileToDataUrl(file: File): Promise<string> {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

interface DiagramFieldProps {
  value?: string | null
  onChange: (nextValue: string | null) => void
}

export function DiagramField({ value, onChange }: DiagramFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (!file) return
    onChange(await fileToDataUrl(file))
    event.target.value = ""
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <RiImageAddLine className="size-4" />
          Diagram
        </div>
        {value ? (
          <Button variant="ghost" size="sm" onClick={() => onChange(null)}>
            Remove
          </Button>
        ) : null}
      </div>
      <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm text-slate-600 transition hover:border-emerald-400">
        <RiImageAddLine className="size-4" />
        Upload diagram
        <Input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </label>
      {value ? (
        <img
          src={value}
          alt="Question diagram"
          className="mt-4 max-h-64 w-full rounded-2xl border border-slate-200 bg-white object-contain"
        />
      ) : null}
    </div>
  )
}
