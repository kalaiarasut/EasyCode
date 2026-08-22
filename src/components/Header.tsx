"use client";
import React, { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { useSession, signOut } from 'next-auth/react';

import NavDropdown from './NavDropdown';
import { Button } from './ui/button';
import Link from 'next/link';
import NavLinks from './NavLinks';
import NavRunButtonsContainer from './NavRunButtonsContainer';
import { usePathname } from 'next/navigation';

export default function Header() {
  const [mounted, setMounted] = useState<boolean>(false);
  const { theme, setTheme, systemTheme } = useTheme();
  const { data: session, status } = useSession();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (theme && systemTheme) {
      setTheme(systemTheme);
    }
  }, [mounted]);

  // this line help us to avoid theme hydration error
  if (!mounted) {
    return null;
  }

  // If on home, auth pages, or problem workspace, render dedicated layout
  if (
    pathname === "/" ||
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up") ||
    pathname.startsWith("/forget-password") ||
    pathname.startsWith("/verify") ||
    pathname.startsWith("/problem/")
  ) {
    return null;
  }

  return (
    <header className='w-full h-12 border-b-2 flex items-center justify-between px-8 relative z-30'>
        <Link href="/" className="flex items-center hover:opacity-85 transition-opacity">
          {(theme === "dark") ? <img src="/navLogo dark.png" alt="EasyCode" className='h-6' /> : <img src="/navLogo light.png" alt="EasyCode" className='h-6' />}
        </Link>
        {pathname.startsWith("/problem/")? <NavRunButtonsContainer theme={theme} session={session} /> : <NavLinks theme={theme} session={session} pathname={pathname} />}
      <div className="flex items-center gap-4">
        {!session && <div className='flex gap-4 items-center'>
          <Link href="/sign-up">
            <Button variant="outline" className='cursor-pointer font-semibold'>Sign up</Button>
          </Link>
          <p>or</p>
          <Link href="/sign-in">
            <Button variant="outline" className='cursor-pointer font-semibold'>Sign in</Button>
          </Link>
        </div>}
        {session && <NavDropdown session={session} signOut={signOut} theme={theme} />}
      </div>
    </header>
  )
}
