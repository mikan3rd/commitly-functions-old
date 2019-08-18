import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

export const helloWorld = functions.region('asia-northeast1').https.onRequest((request, response) => {
  response.send('Hello from Firebase!');
});

export const updateGitHubUser = functions.region('asia-northeast1').https.onCall((data: any, context: any) => {
  const { github_access_token, github_user_name } = data;
  const { uid } = context.auth;

  const userCollection = db.collection('users');
  const userData = {
    uid,
    github_access_token,
    github_user_name,
    update_at: admin.firestore.FieldValue.serverTimestamp(),
  };

  userCollection
    .doc(uid)
    .set(userData, { merge: true })
    .catch(err => {
      throw new functions.https.HttpsError('internal', 'Failed set user', err);
    });

  return { uid, github_access_token, github_user_name };
});
