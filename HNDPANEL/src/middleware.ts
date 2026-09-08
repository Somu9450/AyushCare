import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get('accessToken')?.value;
  const userRole = request.cookies.get('userRole')?.value;

  const isAuthenticated = !!accessToken;

  // Static assets, public files, api routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Alias /doctor/opd or /doctor/dashboard to /doctor
  if (pathname === '/doctor/opd' || pathname === '/doctor/dashboard') {
    return NextResponse.redirect(new URL('/doctor', request.url));
  }

  // Redirect root path '/' to role landing page or login
  if (pathname === '/') {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (userRole === 'hospital_admin') {
      return NextResponse.redirect(new URL('/admin/queue', request.url));
    }
    return NextResponse.redirect(new URL('/doctor', request.url));
  }

  // If visiting login page while authenticated, redirect to role home
  if (pathname === '/login') {
    if (isAuthenticated) {
      if (userRole === 'hospital_admin') {
        return NextResponse.redirect(new URL('/admin/queue', request.url));
      }
      return NextResponse.redirect(new URL('/doctor', request.url));
    }
    return NextResponse.next();
  }

  // Protect Admin routes (/admin/*)
  if (pathname.startsWith('/admin')) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (userRole !== 'hospital_admin') {
      // Doctor attempting to access admin route
      return NextResponse.redirect(new URL('/doctor', request.url));
    }
  }

  // Protect Doctor routes (/doctor/* or /doctor)
  if (pathname.startsWith('/doctor')) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (userRole === 'hospital_admin') {
      // Admin attempting to access doctor route
      return NextResponse.redirect(new URL('/admin/queue', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
