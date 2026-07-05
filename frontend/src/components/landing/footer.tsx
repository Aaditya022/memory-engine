'use client'

import { Logo } from '@/components/shared/logo'

const brand = '#4F8BFF'

export function Footer() {
  return (
    <footer className="max-w-6xl mx-auto px-6 py-16 border-t border-white/[0.06]">
      <div className="grid md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5">
            <Logo className="w-[200px] h-[200px] text-white/80" />
          </div>
          <p className="mt-2 text-sm text-white/40 max-w-xs leading-relaxed">
            Enterprise Memory Platform · Powered by Cognee. Your organization&apos;s collective intelligence, always accessible.
          </p>
          <div className="flex items-center gap-3 mt-6">
            <a href="#" className="w-9 h-9 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center hover:bg-white/[0.1] hover:border-white/20 transition-all group" aria-label="GitHub">
              <svg className="w-4 h-4 text-white/40 group-hover:text-white/70 transition-colors" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            </a>
            <a href="#" className="w-9 h-9 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center hover:bg-white/[0.1] hover:border-white/20 transition-all group" aria-label="LinkedIn">
              <svg className="w-4 h-4 text-white/40 group-hover:text-white/70 transition-colors" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
            <a href="#" className="w-9 h-9 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center hover:bg-white/[0.1] hover:border-white/20 transition-all group" aria-label="X (Twitter)">
              <svg className="w-4 h-4 text-white/40 group-hover:text-white/70 transition-colors" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="#" className="w-9 h-9 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center hover:bg-white/[0.1] hover:border-white/20 transition-all group" aria-label="Email">
              <svg className="w-4 h-4 text-white/40 group-hover:text-white/70 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/></svg>
            </a>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold tracking-wider text-white/50 mb-4">Product</h4>
          <ul className="space-y-2.5">
            {['Features', 'Pricing', 'Security', 'API', 'Status', 'Changelog'].map(link => (
              <li key={link}>
                <a href="#" className="text-sm text-white/40 hover:text-white/80 transition-colors">{link}</a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold tracking-wider text-white/50 mb-4">Company</h4>
          <ul className="space-y-2.5">
            {['About', 'Blog', 'Careers', 'Press', 'Contact', 'Documentation'].map(link => (
              <li key={link}>
                <a href="#" className="text-sm text-white/40 hover:text-white/80 transition-colors">{link}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-white/[0.06]">
        <p className="text-sm text-white/25">&copy; 2026 Memory Engine. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <a href="#" className="text-sm text-white/30 hover:text-white/60 transition-colors">Privacy</a>
          <a href="#" className="text-sm text-white/30 hover:text-white/60 transition-colors">Terms</a>
          <a href="#" className="text-sm text-white/30 hover:text-white/60 transition-colors">Cookies</a>
          <a href="#" className="text-sm text-white/30 hover:text-white/60 transition-colors">DPA</a>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-white/[0.06] flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-white/25">Stay updated with product updates and enterprise AI insights.</p>
        <div className="flex gap-2">
          <input
            type="email"
            placeholder="you@company.com"
            className="bg-white/[0.05] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/30 transition-all duration-300 focus:outline-none focus:border-[#4F8BFF]/50 w-56"
          />
          <button
            className="text-white rounded-lg px-5 py-2.5 text-sm font-medium hover:shadow-[0_0_20px_rgba(79,139,255,0.2)] active:scale-[0.97] transition-all duration-300"
            style={{ backgroundColor: brand }}
          >
            Subscribe
          </button>
        </div>
      </div>
    </footer>
  )
}
