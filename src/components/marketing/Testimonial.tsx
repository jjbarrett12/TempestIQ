interface TestimonialProps {
  name: string
  role: string
  company: string
  content: string
  avatar?: string
}

export function Testimonial({ name, role, company, content }: TestimonialProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
          {name.charAt(0)}
        </div>
        <div className="ml-4">
          <div className="font-semibold text-gray-900">{name}</div>
          <div className="text-sm text-gray-600">{role}, {company}</div>
        </div>
      </div>
      <p className="text-gray-700 italic">"{content}"</p>
    </div>
  )
}
