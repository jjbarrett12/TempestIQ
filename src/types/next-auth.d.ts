import 'next-auth'

declare module 'next-auth' {
  interface User {
    id?: string
    email?: string | null
    name?: string | null
    customerId?: string
  }
  interface Session {
    user: {
      id?: string
      email?: string | null
      name?: string | null
      image?: string | null
      customerId?: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    customerId?: string
  }
}
