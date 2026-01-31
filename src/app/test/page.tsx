import Link from 'next/link'
import Image from 'next/image'

export default function TestPage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <Link href="/marketing" className="inline-block mb-4">
        <Image src="/TempestIQ logo transparent.png" alt="TempestIQ" width={120} height={32} className="h-8 w-auto object-contain" />
      </Link>
      <h1>✅ Next.js is Working!</h1>
      <p>If you can see this, the server is running correctly.</p>
      <p>Try visiting: <a href="/marketing">/marketing</a></p>
    </div>
  )
}
