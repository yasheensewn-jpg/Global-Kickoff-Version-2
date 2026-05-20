const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function deleteGhostPlayers() {
  const collectionRef = db.collection('users');
  let totalDeleted = 0;

  console.log('Fetching all document references (including missing documents with subcollections)...');

  try {
    // listDocuments() returns all documents, even if they only exist because of subcollections
    const documentRefs = await collectionRef.listDocuments();
    
    // Filter for those starting with 'player_'
    const ghostRefs = documentRefs.filter(ref => ref.id.startsWith('player_'));
    
    console.log(`Found ${ghostRefs.length} 'player_' ghost document(s).`);

    // We must use recursiveDelete to delete the document AND its subcollections (like gameData)
    // To do this efficiently, we can chunk them, but recursiveDelete handles its own chunking per document.
    for (const ref of ghostRefs) {
      await db.recursiveDelete(ref);
      totalDeleted++;
      if (totalDeleted % 10 === 0) {
        console.log(`Recursively deleted ${totalDeleted}/${ghostRefs.length} ghost accounts...`);
      }
    }

    console.log(`Cleanup complete! Total "player_" ghost documents (and their subcollections) successfully deleted: ${totalDeleted}`);
  } catch (error) {
    console.error("An error occurred during cleanup:", error);
  }
}

deleteGhostPlayers();
