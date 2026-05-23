import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      className="relative flex flex-col items-center justify-center min-h-[80vh] overflow-hidden px-4 text-center"
      style={{ background: '#0d0d0d', color: '#ffffff' }}
    >
      {/* Background glow */}
      <div
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-80 opacity-10 blur-[100px] rounded-full"
        style={{ background: 'var(--brand-primary)' }}
      />
      {/* Dot-grid overlay */}
      <div className="pointer-events-none absolute inset-0 dot-grid-bg opacity-50" />

      <div className="relative animate-fade-in flex flex-col items-center">
        <h1
          className="font-black tracking-tight leading-none"
          style={{ fontSize: 'clamp(6rem, 18vw, 11rem)', color: 'var(--brand-primary)' }}
        >
          404
        </h1>
        <h2 className="text-3xl sm:text-4xl font-black text-white mt-2">Page not found</h2>
        <p className="mt-4 max-w-md text-base leading-relaxed" style={{ color: '#888888' }}>
          The page you are looking for doesn&rsquo;t exist or may have been moved.
          Check the URL, or head back to find the leads you need.
        </p>

        <Link href="/" className="mt-10">
          <button
            className="btn-shimmer btn-primary-hover inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-black text-base border-0"
            style={{
              background: 'var(--brand-primary)',
              color: '#ffffff',
              boxShadow: '0 0 32px var(--brand-primary-glow)',
            }}
          >
            Go Home
          </button>
        </Link>
      </div>
    </div>
  );
}
