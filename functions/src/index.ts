import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const helloWorld = functions.region('asia-northeast1').https.onRequest((request, response) => {
  response.send('Hello from Firebase!');
});

export const testFunction = functions.region('asia-northeast1').https.onCall((data, context: any) => {
  const uid = context.auth.uid;
  const name = context.auth.token.name || null;
  const email = context.auth.token.email || null;
  return { uid, name, email };
});
