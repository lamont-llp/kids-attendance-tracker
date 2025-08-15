import { NextResponse } from 'next/server';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';

// This function can be marked `async` if using `await` inside
export async function middleware(request: Request) {
  const { isAuthenticated, getPermission, getUser } = getKindeServerSession();

  // Check if user is authenticated
  if (!(await isAuthenticated())) {
    return NextResponse.redirect(new URL('/api/auth/login', request.url));
  }

  // Get the current path
  const path = new URL(request.url).pathname;

  // Check user permissions
  const user = await getUser();
  const isAdmin = await getPermission('admin');
  const hasCheckInPermission = await getPermission('check-in:kid');

  // If user is on dashboard but only has check-in permission, redirect to kiosk
  if (
    path.startsWith('/dashboard') &&
    hasCheckInPermission &&
    hasCheckInPermission.isGranted &&
    !isAdmin
  ) {
    return NextResponse.redirect(new URL('/kiosk', request.url));
  }

  // If user is on kiosk but has admin permissions, redirect to dashboard
  // if (path.startsWith('/kiosk') && (!hasCheckInPermission || isAdmin)) {
  //     return NextResponse.redirect(new URL('/dashboard', request.url));
  // }
}

// See "Matching Paths" below to learn more
// '/kiosk/:path*', '/kiosk'
export const config = {
  matcher: ['/dashboard/:path*'],
};
