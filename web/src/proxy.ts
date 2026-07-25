import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET;

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const isAccountRoute = pathname.startsWith('/account');
  const isAdminRoute = pathname.startsWith('/admin');

  if (!isAccountRoute && !isAdminRoute) {
    return NextResponse.next({ request });
  }

  const token = request.cookies.get('auth_token')?.value;

  if (!token || !JWT_SECRET) {
    const login = new URL('/login', request.url);
    login.searchParams.set('next', pathname);
    return NextResponse.redirect(login);
  }

  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    if (isAdminRoute) {
      const role = payload.role as string | undefined;
      if (role !== 'staff' && role !== 'super_admin') {
        return NextResponse.redirect(new URL('/account', request.url));
      }
    }

    return NextResponse.next({ request });
  } catch {
    const login = new URL('/login', request.url);
    login.searchParams.set('next', pathname);
    return NextResponse.redirect(login);
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};