import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();
const { FieldValue } = admin.firestore;

export const helloWorld = functions.region('asia-northeast1').https.onRequest((request, response) => {
  response.send('Hello from Firebase!');
});

export const getUsers = functions.region('asia-northeast1').https.onRequest((request, response) => {
  const userCollection = db.collection('users');
  userCollection
    .where('twitter_access_token', '>', '')
    .get()
    .then(snapshot => {
      const users = [] as any[];

      snapshot.forEach(doc => {
        users.push(doc.data());
      });

      response.json({ users });
    })
    .catch(err => {
      console.log('Error getting documents', err);
    });
});

export const updateGitHubUser = functions.region('asia-northeast1').https.onCall((data: any, context: any) => {
  const { github_access_token, github_user_name } = data;
  const { uid } = context.auth;

  const userCollection = db.collection('users');
  const userData = {
    uid,
    github_access_token,
    github_user_name,
    update_at: FieldValue.serverTimestamp(),
  };

  userCollection
    .doc(uid)
    .set(userData, { merge: true })
    .catch(err => {
      throw new functions.https.HttpsError('internal', 'Failed to set user', err);
    });

  return { uid, github_access_token, github_user_name };
});

export const updateTwitterUser = functions.region('asia-northeast1').https.onCall((data: any, context: any) => {
  const { twitter_access_token, twitter_access_token_secret, twitter_screen_name } = data;
  const { uid } = context.auth;

  const userCollection = db.collection('users');
  const userData = {
    uid,
    twitter_access_token,
    twitter_access_token_secret,
    twitter_screen_name,
    update_at: FieldValue.serverTimestamp(),
  };

  userCollection
    .doc(uid)
    .set(userData, { merge: true })
    .catch(err => {
      throw new functions.https.HttpsError('internal', 'Failed to set user', err);
    });

  return { uid, twitter_access_token, twitter_access_token_secret, twitter_screen_name };
});

export const deleteTwitterUser = functions.region('asia-northeast1').https.onCall((data, context: any) => {
  const { uid } = context.auth;
  const userCollection = db.collection('users');
  userCollection
    .doc(uid)
    .update({
      twitter_access_token: FieldValue.delete(),
      twitter_access_token_secret: FieldValue.delete(),
      twitter_screen_name: FieldValue.delete(),
      update: FieldValue.serverTimestamp(),
    })
    .catch(err => {
      throw new functions.https.HttpsError('internal', 'Failed to delete twitter', err);
    });
});
