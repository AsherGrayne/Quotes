const admin = require('firebase-admin');
const mongoose = require('mongoose');
const serviceAccount = require('./firebase-key.json');

const MONGODB_URI = "mongodb+srv://praticks2003_db_user:s1t1EqtIuqbbxWub@quotes1.2wcuked.mongodb.net/Fathema_Maam_Quotes?retryWrites=true&w=majority";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const QuoteSchema = new mongoose.Schema({
  text: String,
  author: String,
  category: { type: String, default: "Education" },
  likes: { type: [String], default: [] },
}, { timestamps: true });

const Quote = mongoose.models.Quote || mongoose.model("Quote", QuoteSchema, "quotes");

async function migrate() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB.");

  console.log("Fetching quotes from Firestore...");
  const snapshot = await db.collection('quotes').get();
  
  if (snapshot.empty) {
    console.log("No matching documents found in Firestore.");
    return;
  }

  let count = 0;
  for (const doc of snapshot.docs) {
    const data = doc.data();
    
    // Map Firestore fields to our MongoDB schema defensively
    const text = data.text || data.quote || data.content || "";
    const author = data.author || data.user || data.name || "Anonymous";
    const category = data.category || "Education";
    const likes = Array.isArray(data.likes) ? data.likes : [];
    
    let createdAt = new Date();
    if (data.createdAt) {
      if (data.createdAt.toDate) {
        createdAt = data.createdAt.toDate(); // Firestore Timestamp
      } else {
        createdAt = new Date(data.createdAt); // String or numeric
      }
    }

    if (!text.trim()) continue; // skip empty

    const newQuote = new Quote({
      text,
      author,
      category,
      likes,
      createdAt,
    });

    try {
      await newQuote.save();
      count++;
    } catch (err) {
      console.error(`Failed to migrate quote: ${text.substring(0, 20)}...`, err);
    }
  }

  console.log(`Successfully migrated ${count} quotes to MongoDB!`);
  mongoose.disconnect();
  process.exit(0);
}

migrate().catch(err => {
  console.error("Migration Error:", err);
  process.exit(1);
});
