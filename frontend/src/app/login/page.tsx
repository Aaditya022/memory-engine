'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers/auth-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Sparkles, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { Logo } from '@/components/shared/logo'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

const formVariants = {
  enter: { opacity: 0, y: 10, filter: 'blur(4px)' },
  center: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -10, filter: 'blur(4px)' },
}

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({
    email: '',
    password: '',
    fullName: '',
    organizationName: '',
  })
  const { login, register } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (isLogin) {
        await login({ email: form.email, password: form.password })
        toast.success('Welcome back')
      } else {
        await register({
          email: form.email,
          password: form.password,
          fullName: form.fullName,
          organizationName: form.organizationName,
        })
        toast.success('Account created')
      }
      router.push('/dashboard')
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Something went wrong'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -30, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary/8 blur-[120px]"
        />
        <motion.div
          animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-indigo-500/8 blur-[100px]"
        />
        <motion.div
          animate={{ x: [0, 20, 0], y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute top-1/3 left-1/2 h-[300px] w-[300px] rounded-full bg-emerald-500/5 blur-[80px]"
        />
      </div>

      <div className="relative flex w-full items-center justify-center p-4 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md"
        >
          <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl p-8 shadow-xl shadow-black/5">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="text-center mb-8"
            >
              <div className="inline-flex items-center justify-center mb-4">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5, type: 'spring' }}
                  className="rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 p-3 ring-1 ring-primary/10 shadow-lg shadow-primary/5"
                >
                  <Logo className="h-[200px] w-[200px] text-primary" />
                </motion.div>
              </div>
              <AnimatePresence mode="wait">
                <motion.div key={isLogin ? 'login' : 'register'}>
                  <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-2xl font-bold tracking-tight"
                  >
                    {isLogin ? 'Welcome back' : 'Create your account'}
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="mt-2 text-sm text-muted-foreground/60"
                  >
                    {isLogin
                      ? 'Enter your credentials to access your workspace'
                      : 'Start your enterprise AI memory journey'}
                  </motion.p>
                </motion.div>
              </AnimatePresence>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={isLogin ? 'login-form' : 'register-form'}
                  variants={formVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                >
                  {!isLogin && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4"
                    >
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground/80">Organization</label>
                        <Input
                          placeholder="Acme Corp"
                          value={form.organizationName}
                          onChange={(e) => setForm((p) => ({ ...p, organizationName: e.target.value }))}
                          required
                          className="h-10 rounded-xl bg-background/50 transition-all duration-300 focus-visible:shadow-lg focus-visible:shadow-primary/5"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground/80">Full Name</label>
                        <Input
                          placeholder="John Doe"
                          value={form.fullName}
                          onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                          required
                          className="h-10 rounded-xl bg-background/50 transition-all duration-300 focus-visible:shadow-lg focus-visible:shadow-primary/5"
                        />
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground/80">Email</label>
                <Input
                  type="email"
                  placeholder="john@company.com"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  required
                  className="h-10 rounded-xl bg-background/50 transition-all duration-300 focus-visible:shadow-lg focus-visible:shadow-primary/5"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground/80">Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                    required
                    className="h-10 rounded-xl bg-background/50 pr-10 transition-all duration-300 focus-visible:shadow-lg focus-visible:shadow-primary/5"
                  />
                  <motion.button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </motion.button>
                </div>
              </div>

              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <Button type="submit" className="w-full h-10 rounded-xl font-medium" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isLogin ? 'Sign in' : 'Create account'}
                  {!loading && <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover/button:translate-x-0.5" />}
                </Button>
              </motion.div>
            </form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-6 text-center"
            >
              <p className="text-sm text-muted-foreground/60">
                {isLogin ? (
                  <>
                    Don&apos;t have an account?{' '}
                    <motion.button
                      onClick={() => setIsLogin(false)}
                      className="font-medium text-primary hover:text-primary/80 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Sign up
                    </motion.button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <motion.button
                      onClick={() => setIsLogin(true)}
                      className="font-medium text-primary hover:text-primary/80 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Sign in
                    </motion.button>
                  </>
                )}
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-8 flex items-center justify-center gap-6 text-xs text-muted-foreground/40"
          >
            <motion.span
              className="flex items-center gap-1.5"
              whileHover={{ scale: 1.05 }}
            >
              <Sparkles className="h-3 w-3" />
              Enterprise AI
            </motion.span>
            <span className="w-px h-3 bg-border" />
            <span>Powered by Memory Engine</span>
            <span className="w-px h-3 bg-border" />
            <span>SOC 2 Compliant</span>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
