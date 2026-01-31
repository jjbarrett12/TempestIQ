import { redirect } from 'next/navigation'

export default function Home() {
  // Redirect to marketing page
  redirect('/marketing')
}
