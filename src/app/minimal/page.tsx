import Link from 'next/link'
import Image from 'next/image'

export default function Minimal() {
  return (
    <div style={{ padding: '50px', fontFamily: 'Arial' }}>
      <Link href="/" className="inline-block mb-6">
        <Image src="/TempestIQ logo transparent.png" alt="TempestIQ" width={1200} height={320} className="h-[320px] w-auto object-contain" />
      </Link>
      <h1>✅ Minimal Test Page</h1>
      <p>If you see this, Next.js is working!</p>
      <p>Server is running on port 3005</p>
    </div>
  )
}
