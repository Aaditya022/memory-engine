'use client'

import { FileDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'

interface ExportButtonProps {
  data: Record<string, unknown>[]
  filename?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'icon'
}

export function ExportButton({ data, filename = 'export', variant = 'outline', size = 'sm' }: ExportButtonProps) {
  function exportCSV() {
    if (data.length === 0) {
      toast.error('No data to export')
      return
    }
    const headers = Object.keys(data[0])
    const csv = [
      headers.join(','),
      ...data.map((row) =>
        headers
          .map((h) => {
            const val = String(row[h] ?? '')
            return val.includes(',') || val.includes('"') ? `"${val.replace(/"/g, '""')}"` : val
          })
          .join(',')
      ),
    ].join('\n')

    download(csv, `${filename}.csv`, 'text/csv')
    toast.success('Exported as CSV')
  }

  function exportJSON() {
    const json = JSON.stringify(data, null, 2)
    download(json, `${filename}.json`, 'application/json')
    toast.success('Exported as JSON')
  }

  function download(content: string, filename: string, mime: string) {
    const blob = new Blob([content], { type: mime })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size}>
          <FileDown className="mr-1.5 h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportCSV}>Export as CSV</DropdownMenuItem>
        <DropdownMenuItem onClick={exportJSON}>Export as JSON</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
