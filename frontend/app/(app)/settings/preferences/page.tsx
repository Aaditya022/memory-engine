'use client'

import { useState } from 'react'
import { useTheme } from 'next-themes'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { Moon, Sun, Monitor } from 'lucide-react'

export default function PreferencesPage() {
  const { theme, setTheme } = useTheme()
  const [compact, setCompact] = useState(false)

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">Preferences</h1>
        <p className="text-muted-foreground">Customize your experience</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Choose your preferred theme</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={theme}
            onValueChange={setTheme}
            className="grid grid-cols-3 gap-4"
          >
            <Label
              htmlFor="light"
              className="flex flex-col items-center gap-2 rounded-lg border p-4 cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5"
            >
              <RadioGroupItem value="light" id="light" className="sr-only" />
              <Sun className="h-8 w-8" />
              <span className="text-sm font-medium">Light</span>
            </Label>
            <Label
              htmlFor="dark"
              className="flex flex-col items-center gap-2 rounded-lg border p-4 cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5"
            >
              <RadioGroupItem value="dark" id="dark" className="sr-only" />
              <Moon className="h-8 w-8" />
              <span className="text-sm font-medium">Dark</span>
            </Label>
            <Label
              htmlFor="system"
              className="flex flex-col items-center gap-2 rounded-lg border p-4 cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5"
            >
              <RadioGroupItem value="system" id="system" className="sr-only" />
              <Monitor className="h-8 w-8" />
              <span className="text-sm font-medium">System</span>
            </Label>
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Layout</CardTitle>
          <CardDescription>Adjust the interface density</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="compact" className="font-medium">Compact mode</Label>
              <p className="text-sm text-muted-foreground">Reduce spacing for a denser view</p>
            </div>
            <Switch id="compact" checked={compact} onCheckedChange={setCompact} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
