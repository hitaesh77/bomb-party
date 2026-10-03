import type { Metadata, Viewport } from 'next';
import './globals.css';
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#f5f2e9' };
export const metadata: Metadata = { title: 'Bomb Party — Think fast. Pass faster.', description: 'One prompt. A ticking bomb. A room full of friends. An instant in-person party game.' };
export default function RootLayout({ children }: {
    children: React.ReactNode;
}) { return <html lang="en"><body>{children}</body></html>; }
