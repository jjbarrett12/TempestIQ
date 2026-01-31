import Link from 'next/link'
import Image from 'next/image'

export default function SimplePage() {
  return (
    <html>
      <body style={{ padding: '50px', fontFamily: 'Arial' }}>
        <Link href="/marketing" style={{ display: 'inline-block', marginBottom: 24 }}>
          <Image src="/TempestIQ logo transparent.png" alt="TempestIQ" width={120} height={32} className="h-8 w-auto object-contain" />
        </Link>
        <h1>✅ Server is Running!</h1>
        <p>If you see this, Next.js is working.</p>
        <p>Port: 3005</p>
        <p>Time: {new Date().toLocaleString()}</p>
      </body>
    </html>
  )
}
