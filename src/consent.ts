/**
 * Cookie consent state for Microsoft Clarity.
 *
 * The regional default and the initial `consentv2` signal are computed by an
 * inline script in index.html (it has to run before the Clarity tag sets any
 * cookies), which leaves the result on `window.__cookieConsent`. This module is
 * the UI-facing half: it reads that value and pushes later changes to Clarity.
 *
 * @see https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-consent-api-v2
 */
import { useEffect, useState } from 'react';

export type ConsentState = 'granted' | 'denied';

export const CONSENT_STORAGE_KEY = 'cookie-consent';
const CONSENT_EVENT = 'cookie-consent-change';

export interface ConsentInfo {
  state: ConsentState;
  /** The visitor chose this themselves, rather than inheriting the regional default. */
  explicit: boolean;
  /** The visitor's region requires opt-in consent (EEA / UK / CH), so the default is denied. */
  restricted: boolean;
}

declare global {
  interface Window {
    clarity?: (...args: unknown[]) => void;
    __cookieConsent?: ConsentInfo;
  }
}

// Used during the SSG prerender and if the inline script never ran; denying is
// the safe assumption when we can't tell where the visitor is.
const FALLBACK: ConsentInfo = { state: 'denied', explicit: false, restricted: true };

export function readConsent(): ConsentInfo {
  if (typeof window === 'undefined') return FALLBACK;
  return window.__cookieConsent ?? FALLBACK;
}

// Clarity's ad_Storage only controls sharing data with Microsoft Ads. This site
// runs no ads, so it stays denied regardless of what the visitor allows.
function signalClarity(state: ConsentState) {
  window.clarity?.('consentv2', { ad_Storage: 'denied', analytics_Storage: state });
}

function publish(info: ConsentInfo) {
  window.__cookieConsent = info;
  signalClarity(info.state);
  window.dispatchEvent(new Event(CONSENT_EVENT));
}

/** Record an explicit choice; it persists on this device and overrides the regional default. */
export function setConsent(state: ConsentState) {
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, state);
  } catch {
    // private mode / storage disabled — the choice just won't survive a reload
  }
  publish({ ...readConsent(), state, explicit: true });
}

/** Drop the saved choice and fall back to whatever this region defaults to. */
export function resetConsent() {
  try {
    localStorage.removeItem(CONSENT_STORAGE_KEY);
  } catch {
    // ignore
  }
  const { restricted } = readConsent();
  publish({ restricted, explicit: false, state: restricted ? 'denied' : 'granted' });
}

/**
 * Subscribe to the current consent state.
 *
 * The first client render already has the real value, so nothing flashes the
 * fallback. That does mean consent-dependent markup must not be prerendered —
 * both callers only render after the visitor opens something.
 */
export function useConsent(): ConsentInfo {
  const [info, setInfo] = useState<ConsentInfo>(readConsent);

  useEffect(() => {
    const sync = () => setInfo(readConsent());
    sync();
    window.addEventListener(CONSENT_EVENT, sync);
    return () => window.removeEventListener(CONSENT_EVENT, sync);
  }, []);

  return info;
}
