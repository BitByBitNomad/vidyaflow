import './globals.css';
import { AuthProvider } from '../lib/auth-context';
import Navbar from '../components/Navbar';

export const metadata = {
  title: 'VidyaFlow: Quiz-Based Learning & Analytics Platform',
  description: 'AI-powered quiz learning and analytics platform engineered by BitByBitNomad. Featuring PostgreSQL row-level locking, Redis write-through leaderboards, and real-time accuracy analytics.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-slate-50 text-slate-900">
      <body className="bg-slate-50 text-slate-900 min-h-screen flex flex-col selection:bg-brand selection:text-white font-sans antialiased">
        <AuthProvider>
          {/* Top Announcement Ribbon */}
          <div className="bg-white border-b border-slate-200 text-xs text-slate-600 py-2 px-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
            <div className="page-wrap flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-semibold text-slate-900">VidyaFlow Platform</span>
                <span className="text-slate-300">&bull;</span>
                <span className="text-slate-500">Intelligent Quiz-Based Learning &amp; Real-Time Analytics</span>
              </div>
              <div className="hidden sm:flex items-center space-x-3 text-xs text-slate-500">
                <span className="inline-flex items-center space-x-1.5 font-medium text-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand"></span>
                  <span>Engineered by BitByBitNomad</span>
                </span>
                <span className="text-slate-300">|</span>
                <span className="font-medium text-emerald-700">System Online</span>
              </div>
            </div>
          </div>

          <Navbar />

          <main className="flex-1 w-full">
            {children}
          </main>

          {/* Clean Footer */}
          <footer className="border-t border-slate-200 bg-white py-8 text-xs text-slate-500">
            <div className="page-wrap flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                  <span>VidyaFlow Platform</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                    Engineered by BitByBitNomad
                  </span>
                </div>
                <p className="text-slate-500 max-w-md">
                  A production-grade quiz-based learning and analytics platform featuring PostgreSQL row-level locking, Redis write-through leaderboards, and role-based access control.
                </p>
              </div>

              <div className="text-xs text-slate-400 md:text-right space-y-1">
                <div className="font-medium text-slate-700">
                  VidyaFlow &bull; All Rights Reserved
                </div>
                <div className="text-slate-400 font-mono text-[11px]">
                  Full-Stack Assessment Platform &bull; Built by BitByBitNomad
                </div>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
