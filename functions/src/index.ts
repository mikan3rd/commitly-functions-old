import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import axios from 'axios';

export type JSObject = { [p: string]: any };

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

export const getLoginUser = functions.region('asia-northeast1').https.onCall((data, context: any) => {
  const { uid } = context.auth;
  const userCollection = db.collection('users');
  return userCollection
    .doc(uid)
    .get()
    .then(doc => {
      const result: any = doc.data();
      const { github_access_token, twitter_access_token, twitter_access_token_secret, ...others } = result;
      return { ...others };
    })
    .catch(err => {
      console.log('Error getting documents', err);
    });
});

export const updateGitHubUser = functions.region('asia-northeast1').https.onCall((data: any, context: any) => {
  const { github_access_token, github_user_name, github_user_id, is_new_user } = data;
  const { uid } = context.auth;

  const userCollection = db.collection('users');
  const userData: JSObject = {
    uid,
    github_access_token,
    github_user_name,
    github_user_id,
    updated_at: FieldValue.serverTimestamp(),
  };

  if (is_new_user) {
    userData['created_at'] = FieldValue.serverTimestamp();
  }

  userCollection
    .doc(uid)
    .set(userData, { merge: true })
    .catch(err => {
      throw new functions.https.HttpsError('internal', 'Failed to set user', err);
    });
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
    updated_at: FieldValue.serverTimestamp(),
  };

  userCollection
    .doc(uid)
    .set(userData, { merge: true })
    .catch(err => {
      throw new functions.https.HttpsError('internal', 'Failed to set user', err);
    });
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
      updated_at: FieldValue.serverTimestamp(),
    })
    .catch(err => {
      throw new functions.https.HttpsError('internal', 'Failed to delete twitter', err);
    });
});

export const getGithubRepositories = functions.region('asia-northeast1').https.onCall(async (data, context: any) => {
  const { uid } = context.auth;
  const userCollection = db.collection('users');

  let github_access_token;
  try {
    const doc = await userCollection.doc(uid).get();
    const result: any = doc.data();
    github_access_token = result.github_access_token;
  } catch (error) {
    return error;
  }

  const url = `${process.env.COMMITLY_ENDPOINT}/github_installation`;
  const params = { github_access_token };
  try {
    const res = await axios.get(url, { params });
    console.log(res.data);
    return res.data;
  } catch (error) {
    console.log(error);
    return error;
  }
});
