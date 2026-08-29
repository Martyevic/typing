import { Button } from 'antd';
import originalFirebase from 'firebase';
import { FormattedMessage } from 'gatsby-plugin-intl';
import React, { useState, useEffect, useRef } from 'react';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';

import { Layout, SEO } from '@components';
import {
  ROUTE_PATH_TYPEWRITER,
  ROUTE_PATH_PRIVACY_POLICY,
  ROUTE_PATH_TERMS_OF_USE,
} from '@routes';
import useFirebase from '@utils/useFirebase';

// --- FORDÍTOTT CAPTCHA KOMPONENS ---
const ReverseCaptcha: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const targetText = 'A gyors barna róka átugorja a lusta kutyát.';
  const [inputVal, setInputVal] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMsg, setModalMsg] = useState('');
  const slowTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputVal(val);

    if (!startTime && val.length > 0) {
      setStartTime(Date.now());

      slowTimerRef.current = setTimeout(() => {
        alert("Jól van menjél, látom neked való ez az oldal 😂\n\nÜdv a ManoNeten!");
        onSuccess();
      }, 5000);
    }

    if (val.trim() === targetText) {
      if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
      validate(val, startTime || Date.now());
    }
  };

  const validate = (text: string, start: number) => {
    const timeInSeconds = (Date.now() - start) / 1000;
    const wordsTyped = text.length / 5;
    const wpm = (wordsTyped / timeInSeconds) * 60;

    if (wpm > 100) {
      setModalMsg(
        `Mérési eredményed: ${Math.round(wpm)} WPM! ⚡️\n\nTesó, te már tudsz gépelni. Ne hazudjunk egymásnak: nem tanulni jöttél, csak le akartad mérni a WPM-edet a CAPTCHA-n.`
      );
      setShowModal(true);
    } else {
      alert(`Sikeres belépés! (${Math.round(wpm)} WPM) Üdv a ManoNeten!`);
      onSuccess();
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
      <div
        style={{
          background: '#18181b',
          color: '#fff',
          padding: '24px',
          borderRadius: '12px',
          maxWidth: '420px',
          width: '100%',
          border: '1px solid #27272a',
          boxSizing: 'border-box',
        }}
      >
        <h3 style={{ marginTop: 0, color: '#fff' }}>Fordított reCAPTCHA ⌨️</h3>
        <p style={{ color: '#a1a1aa' }}>Írd be a lenti szöveget a belépéshez:</p>
        <div
          style={{
            background: '#09090b',
            padding: '12px',
            borderLeft: '3px solid #00f0ff',
            margin: '12px 0',
            fontWeight: 500,
            color: '#fff',
          }}
        >
          {targetText}
        </div>
        <input
          type="text"
          value={inputVal}
          onChange={handleInputChange}
          placeholder="Kezdj el gépelni..."
          style={{
            width: '100%',
            padding: '12px',
            background: '#09090b',
            border: '1px solid #3f3f46',
            color: '#fff',
            borderRadius: '6px',
            boxSizing: 'border-box',
            marginBottom: '12px',
            outline: 'none',
          }}
          autoComplete="off"
        />
        <button
          type="button"
          onClick={() => validate(inputVal, startTime || Date.now())}
          style={{
            width: '100%',
            padding: '12px',
            background: '#00f0ff',
            border: 'none',
            color: '#000',
            fontWeight: 'bold',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Bejelentkezés
        </button>
      </div>

      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            style={{
              background: '#18181b',
              border: '1px solid #00f0ff',
              padding: '28px',
              borderRadius: '16px',
              maxWidth: '380px',
              textAlign: 'center',
              color: '#fff',
            }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🤖🛑</div>
            <h3 style={{ color: '#fff' }}>Állj, állj, állj!</h3>
            <p style={{ whiteSpace: 'pre-line', color: '#d4d4d8' }}>{modalMsg}</p>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                marginTop: '20px',
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setInputVal('');
                  setStartTime(null);
                }}
                style={{
                  background: '#27272a',
                  color: '#a1a1aa',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                Igazad van, kávézom egyet ☕️
              </button>
              <button
                type="button"
                onClick={onSuccess}
                style={{
                  background: '#00f0ff',
                  color: '#000',
                  fontWeight: 'bold',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                Nem baj, menőzni szeretnék! 😎
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- BEJELENTKEZÉSI OLDAL ---
const LoginPage = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isCaptchaPassed, setIsCaptchaPassed] = useState(false);

  const firebase = useFirebase();

  useEffect(() => {
    if (!firebase) return;
    // @ts-ignore
    return firebase.auth().onAuthStateChanged((user: any) => {
      setIsSignedIn(!!user);
    });
  }, [firebase]);

  function getContent() {
    if (firebase) {
      if (isSignedIn) {
        return (
          <div className="login__form">
            {
              // @ts-ignore
              renderProfile(firebase.auth().currentUser)
            }
            <Button
              onClick={
                // @ts-ignore
                () => firebase.auth().signOut()
              }
            >
              <FormattedMessage id="site.logout" defaultMessage="Sign-out" />
            </Button>
          </div>
        );
      } else {
        if (!isCaptchaPassed) {
          return <ReverseCaptcha onSuccess={() => setIsCaptchaPassed(true)} />;
        }

        const uiConfig = {
          signInFlow: 'popup',
          signInOptions: [
            originalFirebase.auth.EmailAuthProvider.PROVIDER_ID,
            originalFirebase.auth.GoogleAuthProvider.PROVIDER_ID,
            originalFirebase.auth.FacebookAuthProvider.PROVIDER_ID,
          ],
          signInSuccessUrl: ROUTE_PATH_TYPEWRITER,
          tosUrl: ROUTE_PATH_TERMS_OF_USE,
          privacyPolicyUrl: ROUTE_PATH_PRIVACY_POLICY,
        };
        return (
          <div>
            <StyledFirebaseAuth
              uiConfig={uiConfig}
              firebaseAuth={
                // @ts-ignore
                firebase.auth()
              }
            />
          </div>
        );
      }
    }
  }

  return (
    <Layout className="login">
      <SEO />
      <section className="loginForm__section">
        <div className="container">
          <h2 className="login__title">
            <FormattedMessage id="site.login" defaultMessage="Login" />
          </h2>
          <div>{getContent()}</div>
        </div>
      </section>
    </Layout>
  );
};

export default LoginPage;