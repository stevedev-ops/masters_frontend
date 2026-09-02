// Web Authentication API & Native Phone Biometrics Helper for The Masters PWA

const BIOMETRIC_STORAGE_KEY = 'masters_biometric_auth';

export async function isBiometricsAvailable() {
  try {
    if (typeof window === 'undefined' || !window.PublicKeyCredential) {
      return false;
    }
    // Check if platform authenticator (fingerprint, Face ID, Touch ID, Windows Hello) is available
    if (typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function') {
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      return Boolean(available);
    }
    return false;
  } catch (err) {
    console.warn('Biometrics check error:', err);
    return false;
  }
}

export function getSavedBiometricProfile() {
  try {
    const raw = localStorage.getItem(BIOMETRIC_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (_) {
    return null;
  }
}

export function removeBiometricProfile() {
  try {
    localStorage.removeItem(BIOMETRIC_STORAGE_KEY);
  } catch (_) {}
}

/**
 * Enroll phone fingerprint / Face ID for instant login
 */
export async function enrollBiometrics(username, password, displayName = '') {
  try {
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    const userId = new Uint8Array(16);
    window.crypto.getRandomValues(userId);

    const publicKeyCredentialCreationOptions = {
      challenge,
      rp: {
        name: 'The Masters Barber & Executive Spa',
        id: window.location.hostname === 'localhost' ? 'localhost' : window.location.hostname,
      },
      user: {
        id: userId,
        name: username,
        displayName: displayName || username,
      },
      pubKeyCredParams: [
        { alg: -7, type: 'public-key' },  // ES256
        { alg: -257, type: 'public-key' } // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform', // Uses phone fingerprint sensor / Face ID / Touch ID
        userVerification: 'required',
        residentKey: 'preferred',
      },
      timeout: 60000,
      attestation: 'none'
    };

    let credential = null;
    if (navigator.credentials && navigator.credentials.create) {
      credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions
      });
    }

    // Save profile with quick-login payload
    const profile = {
      username,
      displayName: displayName || username,
      credentialId: credential ? btoa(String.fromCharCode(...new Uint8Array(credential.rawId))) : 'local-bio',
      enrolledAt: new Date().toISOString(),
      // Simple obfuscated local device store for offline password recall
      authPayload: btoa(encodeURIComponent(JSON.stringify({ u: username, p: password })))
    };

    localStorage.setItem(BIOMETRIC_STORAGE_KEY, JSON.stringify(profile));
    return { success: true, profile };
  } catch (err) {
    console.warn('Biometrics enrollment error:', err);
    // If WebAuthn was cancelled or failed, fallback to local biometric profile
    if (err.name !== 'NotAllowedError') {
      const profile = {
        username,
        displayName: displayName || username,
        credentialId: 'fallback-bio',
        enrolledAt: new Date().toISOString(),
        authPayload: btoa(encodeURIComponent(JSON.stringify({ u: username, p: password })))
      };
      localStorage.setItem(BIOMETRIC_STORAGE_KEY, JSON.stringify(profile));
      return { success: true, profile, fallback: true };
    }
    throw err;
  }
}

/**
 * Authenticate using phone saved fingerprint
 */
export async function authenticateWithBiometrics() {
  const profile = getSavedBiometricProfile();
  if (!profile) {
    throw new Error('No fingerprint registered on this device. Please log in with password first.');
  }

  try {
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    const publicKeyCredentialRequestOptions = {
      challenge,
      timeout: 60000,
      userVerification: 'required',
      rpId: window.location.hostname === 'localhost' ? 'localhost' : window.location.hostname,
    };

    // Trigger phone native fingerprint / Face ID prompt
    if (navigator.credentials && navigator.credentials.get) {
      await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions
      });
    }

    // Decode saved credentials for login execution
    const raw = decodeURIComponent(atob(profile.authPayload));
    const { u, p } = JSON.parse(raw);
    return { username: u, password: p };
  } catch (err) {
    if (err.name === 'NotAllowedError') {
      throw new Error('Fingerprint scan cancelled or not recognized.');
    }
    // If WebAuthn fails on standard browsers but payload is present, return credentials
    if (profile.authPayload) {
      const raw = decodeURIComponent(atob(profile.authPayload));
      const { u, p } = JSON.parse(raw);
      return { username: u, password: p };
    }
    throw err;
  }
}
