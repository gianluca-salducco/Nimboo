export default function Footer() {
  return (
    <footer className="w-full border-t border-black/5 px-6 py-6 mt-auto">
      <div className="max-w-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center">
        <p className="font-body text-xs text-ink-muted/70">
          © {new Date().getFullYear()} Nimboo. Fatto con cura.
        </p>
        <div className="flex items-center gap-4">
          <a
            href="/privacy"
            className="font-body text-xs text-ink-muted/70 hover:text-terracotta transition-colors"
          >
            Privacy policy
          </a>
          <span className="text-ink-muted/30 text-xs">·</span>
          <a
            href="/cookie"
            className="font-body text-xs text-ink-muted/70 hover:text-terracotta transition-colors"
          >
            Cookie policy
          </a>
        </div>
      </div>
    </footer>
  )
}
