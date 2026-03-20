import React, { useEffect, useState } from 'react';

const GoogleOAuthCallbackPage: React.FC = () => {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const finishLogin = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const state = params.get('state');
      const oauthError = params.get('error');

      if (oauthError) {
        setError(oauthError);
        return;
      }

      if (!code || !state) {
        setError('Missing Google OAuth response.');
        return;
      }

      try {
        const response = await fetch('/api/auth/google/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ code, state }),
        });

        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(payload?.error || 'Google sign-in failed');
        }

        window.location.replace(payload.redirect || '/editor');
      } catch (callbackError) {
        setError(callbackError instanceof Error ? callbackError.message : 'Google sign-in failed');
      }
    };

    finishLogin();
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0a0a0a',
      color: '#fff',
      padding: '24px',
    }}>
      <div style={{
        maxWidth: '420px',
        width: '100%',
        backgroundColor: '#111',
        border: '1px solid #1f1f1f',
        borderRadius: '16px',
        padding: '32px',
        textAlign: 'center',
      }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '12px' }}>
          {error ? 'Sign-In Failed' : 'Signing you in...'}
        </h1>
        <p style={{ color: '#9ca3af', lineHeight: 1.6 }}>
          {error || 'Completing Google authentication and preparing your Vadeo session.'}
        </p>
        {error ? (
          <a
            href="/signin"
            style={{
              marginTop: '20px',
              display: 'inline-block',
              color: '#fff',
              textDecoration: 'underline',
            }}
          >
            Return to sign in
          </a>
        ) : null}
      </div>
    </div>
  );
};

export default GoogleOAuthCallbackPage;
