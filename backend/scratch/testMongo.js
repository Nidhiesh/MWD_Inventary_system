const mongoose = require('mongoose');

const uris = [
  // 1. Password as Nidhiesh@2006, URL encoded to Nidhiesh%402006 (no brackets)
  "mongodb+srv://Nidhiesh:Nidhiesh%402006@inventary.brd1fpx.mongodb.net/?appName=Inventary",
  // 2. Password with literal brackets, URL encoded to %3CNidhiesh%402006%3E
  "mongodb+srv://Nidhiesh:%3CNidhiesh%402006%3E@inventary.brd1fpx.mongodb.net/?appName=Inventary",
  // 3. Password as Nidhiesh@2006 without URL encoding
  "mongodb+srv://Nidhiesh:Nidhiesh@2006@inventary.brd1fpx.mongodb.net/?appName=Inventary",
  // 4. Literal brackets without URL encoding
  "mongodb+srv://Nidhiesh:<Nidhiesh@2006>@inventary.brd1fpx.mongodb.net/?appName=Inventary"
];

const testConnection = async () => {
  for (let i = 0; i < uris.length; i++) {
    console.log(`Testing URI #${i + 1}...`);
    try {
      // Create a separate connection instance
      const conn = await mongoose.connect(uris[i], {
        serverSelectionTimeoutMS: 5000 // 5 seconds timeout
      });
      console.log(`SUCCESS for URI #${i + 1}! Connected host: ${conn.connection.host}`);
      await mongoose.disconnect();
      process.exit(0);
    } catch (err) {
      console.log(`FAILED for URI #${i + 1}: ${err.message}`);
    }
  }
  console.log('All connection variations failed.');
  process.exit(1);
};

testConnection();
