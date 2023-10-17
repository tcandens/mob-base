import z from 'zod'

const signupSchema = z.object({
  email: z.string(),
  password: z.string()
})

const loginSchema = signupSchema.extend({})

type SignupInput = z.infer<typeof signupSchema>
type LoginInput = z.infer<typeof loginSchema>

const host = import.meta.env.VITE_API_HOST || window.location.host

export function signup(input: SignupInput) {
  const url = new URL('/api/auth/signup', host)
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(input)
  })
}

export function login(input: LoginInput) {
  const url = new URL('/api/auth/login', host)
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(input)
  })
}
