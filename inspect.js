const admin = require('firebase-admin');
const serviceAccount = require('./firebase-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function inspect() {
  const snapshot = await db.collection('quotes').limit(2).get();
  snapshot.forEach(doc => {
    console.log(doc.id, '=>', doc.data());
  });
}

inspect().catch(console.error);
