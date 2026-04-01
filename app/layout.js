import './globals.css';
import Link from 'next/link';
import { headers } from 'next/headers';
import { Plus } from 'lucide-react';
import LogoutButton from '@/components/LogoutButton';

export const metadata = {
  title: 'Humanities Quotes - Timeless Thoughts',
  description: 'Upload and read timeless thoughts and quotes.',
};

export default async function RootLayout({ children }) {
  let isLoggedIn = false;
  try {
    const headersList = await headers();
    isLoggedIn = !!headersList.get('x-user-username');
  } catch (err) {}

  return (
    <html lang="en">
      <body>
        <div className="night-sky">
          <div className="stars"></div>
          <div className="moon"></div>
        </div>
        <header className="top-header">
          <Link href="/">Reflections & Wisdom</Link>
          <div className="nav-actions">
            {isLoggedIn && <LogoutButton />}
          </div>
        </header>
        <main className="main-container">
          {children}
        </main>
        {isLoggedIn && (
          <Link href="/upload" className="fab-button" aria-label="Upload Quote">
            <Plus size={28} />
          </Link>
        )}
      </body>
    </html>
  );
}
