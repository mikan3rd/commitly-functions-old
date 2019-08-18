import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const helloWorld = functions.region('asia-northeast1').https.onRequest((request, response) => {
  response.send('Hello from Firebase!');
});

export const testFunction = functions.region('asia-northeast1').https.onCall((data: any, context: any) => {
  const { github_access_token, github_user_name } = data;
  const { uid } = context.auth;
  return { uid, github_access_token, github_user_name };
});
