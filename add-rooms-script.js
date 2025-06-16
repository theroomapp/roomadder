// Auto-add rooms script for The Room app
// Run with: node add-rooms-script.js

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// You'll need to download your service account key from Firebase Console
// Go to: Project Settings > Service Accounts > Generate new private key
const serviceAccount = require('./service-account-key.json'); // You need to add this file

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'the-room-92cdd'
});

const db = admin.firestore();

// Room data for all the requested venues
const roomsToAdd = [
  // LA Venues
  {
    title: "Belles",
    description: "Trendy cocktail bar and restaurant in West Hollywood with craft cocktails and elevated dining",
    location: new admin.firestore.GeoPoint(34.0902, -118.3584), // West Hollywood
    images: [
      "https://img1.wsimg.com/isteam/ip/150f0619-4048-4b53-9edc-370665efc875/500x500.jpg",
      "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800"
    ]
  },
  {
    title: "Victorian",
    description: "Historic Victorian-style venue with classic cocktails and vintage atmosphere",
    location: new admin.firestore.GeoPoint(34.0522, -118.2437), // Downtown LA
    images: [
      "https://i.pinimg.com/originals/aa/3e/7c/aa3e7cddc0e38b52805ac26ae8691e60.jpg",
      "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=800"
    ]
  },
  {
    title: "The Lincoln",
    description: "Upscale gastropub with craft beers, artisanal cocktails, and modern American cuisine",
    location: new admin.firestore.GeoPoint(34.0928, -118.3287), // Beverly Hills area
    images: [
      "https://static.timeout.com/images/344912/640/360/image.jpg",
      "https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=800"
    ]
  },
  {
    title: "Bungalow",
    description: "Beachside cocktail lounge in Santa Monica with ocean views and tropical vibes",
    location: new admin.firestore.GeoPoint(34.0195, -118.4912), // Santa Monica
    images: [
      "https://assets.infatuation.com/image/upload/t_500x500/lowboyjk2.jpg",
      "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800"
    ]
  },
  {
    title: "Buffalo Club",
    description: "Historic private club turned public venue with classic cocktails and elegant dining",
    location: new admin.firestore.GeoPoint(34.0522, -118.2587), // Downtown LA
    images: [
      "https://static.tastingpage.com/uploads/2014/04/The-Buffalo-Club.jpg",
      "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800"
    ]
  },
  {
    title: "Little Friend",
    description: "Intimate cocktail bar with creative drinks and cozy atmosphere",
    location: new admin.firestore.GeoPoint(34.0736, -118.2594), // Silver Lake/Echo Park area
    images: [
      "https://assets.infatuation.com/image/upload/t_500x500/littlefriend.jpg",
      "https://images.unsplash.com/photo-1559329007-40df8213c93b?w=800"
    ]
  },
  {
    title: "Gran Blanco",
    description: "Modern Mexican restaurant and tequila bar with elevated cuisine and craft cocktails",
    location: new admin.firestore.GeoPoint(34.0522, -118.2465), // Arts District, Downtown LA
    images: [
      "https://assets.infatuation.com/image/upload/t_500x500/granblanco.jpg",
      "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800"
    ]
  },
  {
    title: "Not No Bar",
    description: "Hidden speakeasy-style bar with craft cocktails and intimate setting",
    location: new admin.firestore.GeoPoint(34.0736, -118.2594), // Echo Park/Silver Lake
    images: [
      "https://images.unsplash.com/photo-1566417109360-85b8c0079e3d?w=800",
      "https://images.unsplash.com/photo-1569949381669-ecf31ae8e613?w=800"
    ]
  },
  
  // Indianapolis Venue
  {
    title: "Pacers Arena",
    description: "Gainbridge Fieldhouse - Home of the Indiana Pacers with sports bars and dining options",
    location: new admin.firestore.GeoPoint(39.7640, -86.1555), // Indianapolis
    images: [
      "https://assets.simpleviewinc.com/simpleview/image/upload/c_fill,f_jpg,h_640,q_65,w_960/v1/clients/indy/Gainbridge_3_eaa63752-375c-45e7-b0ce-77c1fb473aeb.jpg",
      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800"
    ]
  }
];

// Function to add all rooms to Firestore
async function addRoomsToDatabase() {
  console.log('🚀 Starting to add rooms to The Room database...');
  
  try {
    const batch = db.batch();
    
    for (let i = 0; i < roomsToAdd.length; i++) {
      const room = roomsToAdd[i];
      const roomRef = db.collection('rooms').doc(); // Auto-generate ID
      
      const roomData = {
        ...room,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        status: 'active',
        addedBy: 'admin-script'
      };
      
      batch.set(roomRef, roomData);
      console.log(`📍 Queued: ${room.title} at (${room.location.latitude}, ${room.location.longitude})`);
    }
    
    // Commit the batch
    await batch.commit();
    
    console.log('✅ Successfully added all rooms to the database!');
    console.log(`📊 Total rooms added: ${roomsToAdd.length}`);
    
    // List all added rooms
    console.log('\n🏠 Added rooms:');
    roomsToAdd.forEach((room, index) => {
      console.log(`${index + 1}. ${room.title} - ${room.description.substring(0, 50)}...`);
    });
    
  } catch (error) {
    console.error('❌ Error adding rooms:', error);
    process.exit(1);
  }
}

// Run the script
addRoomsToDatabase()
  .then(() => {
    console.log('\n🎉 All done! The rooms should now appear in your app.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }); 