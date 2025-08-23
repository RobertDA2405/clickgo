// scripts/e2e_create_order.js
// Simulate an end-to-end checkout: create custom token, exchange for idToken, POST to createOrderHttp
const admin = require('firebase-admin');

admin.initializeApp();

(async () => {
  try {
    const uid = 'e2e-test-' + Date.now();
    console.log('Using UID:', uid);
    const customToken = await admin.auth().createCustomToken(uid);

    const apiKey = 'AIzaSyA9yLXADpsnYUif1tD8DPAiHWGVdK9dDho'; // from firebase config in repo

    // Exchange custom token for an ID token
    const signRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: customToken, returnSecureToken: true }),
    });

    const signJson = await signRes.json();
    if (!signRes.ok) {
      console.error('Failed to exchange custom token:', signRes.status, signJson);
      process.exit(1);
    }

    const idToken = signJson.idToken;
    console.log('Obtained idToken (len):', idToken?.length || 0);

    const payload = {
      items: [
        { productId: 'TEST-PROD-E2E', nombre: 'Producto E2E', precio: 1, cantidad: 1 }
      ],
      envio: { tipo: 'estandar' },
      direccionEnvio: { direccion: 'Calle Falsa 123' },
      metodoPagoSimulado: { metodo: 'contraentrega' }
    };

    const url = 'https://us-central1-clickgo-digital.cloudfunctions.net/createOrderHttp';
    console.log('Posting to', url);

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
      },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Response body:', text);
  } catch (err) {
    console.error('E2E script error:', err);
    process.exit(1);
  }
})();
