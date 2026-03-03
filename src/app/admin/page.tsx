'use client';

import { useEffect, useState } from 'react';
import { signIn, useSession, signOut } from 'next-auth/react';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  const [useLocal, setUseLocal] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Use local TinaCMS in development, TinaCloud in production
    setUseLocal(process.env.NODE_ENV === 'development');
  }, []);

  if (status === 'loading' || !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-4">Content Manager</h1>
          <p className="text-gray-600 mb-6">Sign in to access the content management system</p>
          <button
            onClick={() => signIn('github')}
            className="bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 px-6 rounded-lg inline-flex items-center gap-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            Sign in with GitHub
          </button>
        </div>
      </div>
    );
  }

  const clientId = process.env.NEXT_PUBLIC_TINA_CLIENT_ID || '955ce474-fa38-4f65-aef1-b68ce2ff97ff';
  const branch = process.env.GITHUB_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || process.env.HEAD || 'main';
  const isDev = process.env.NODE_ENV === 'development';

  // In production, redirect to TinaCloud
  if (!isDev) {
    useEffect(() => {
      window.location.href = `https://app.tina.io/cms/${clientId}/${branch}`;
    }, []);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Opening TinaCloud...</p>
        </div>
      </div>
    );
  }

  // Development mode - show instructions
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <h1 className="font-semibold text-lg">Resh Community CMS</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {session.user?.name || session.user?.email}
          </span>
          <button onClick={() => signOut()} className="text-sm text-gray-600 hover:text-gray-900">
            Sign out
          </button>
        </div>
      </div>

      <div className="p-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
          <h2 className="text-xl font-bold mb-4">Development Mode</h2>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-yellow-900 mb-2">Run TinaCMS Dev Server</h3>
            <p className="text-yellow-800 text-sm mb-4">
              To use the CMS locally, run the dev server:
            </p>
            <code className="text-sm bg-yellow-100 px-2 py-1 rounded block">
              npm run dev
            </code>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">Access TinaCMS</h3>
            <p className="text-blue-800 text-sm mb-4">
              Once the dev server is running, the CMS will be available at:
            </p>
            <a
              href="http://localhost:4001"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              http://localhost:4001
            </a>
            <p className="text-blue-800 text-xs mt-2">
              Note: The TinaCMS dev server runs on port 4001
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Direct TinaCloud Access</h3>
            <p className="text-gray-700 text-sm mb-2">
              You can also access TinaCloud directly:
            </p>
            <a
              href={`https://app.tina.io/cms/${clientId}/${branch}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline text-sm"
            >
              Open TinaCloud in new tab
            </a>
            <p className="text-gray-500 text-xs mt-2">
              If the page is blank, TinaCloud is still syncing your repository.
            </p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="font-semibold text-purple-900 mb-2">TinaCloud Status</h3>
            <ul className="text-purple-800 text-sm space-y-1">
              <li>✅ Project created</li>
              <li>✅ Repository connected</li>
              <li>⏳ Schema syncing (may take a few minutes)</li>
              <li>⏳ CMS access (after sync completes)</li>
            </ul>
            <p className="text-purple-600 text-xs mt-2">
              If TinaCloud shows a blank page, check the dashboard for any errors.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
