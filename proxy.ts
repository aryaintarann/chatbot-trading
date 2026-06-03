import { NextResponse, type NextRequest } from 'next/server'

const PERSONAL_USER_ID = process.env.PERSONAL_USER_ID ?? '00000000-0000-0000-0000-000000000001'

export function proxy(request: NextRequest) {
  const response = NextResponse.next({ request })

  const isApiProtected = ['/api/analyze', '/api/signals', '/api/chat'].some(
    p => request.nextUrl.pathname.startsWith(p)
  )

  if (isApiProtected) {
    response.headers.set('x-user-id', PERSONAL_USER_ID)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons|screenshots|sw.js|manifest.json|api/price).*)',
  ],
}
