import mongoose from "mongoose";
const mongoDb =
  "mongodb+srv://jyothiss3kvj:random%40123JJ@cluster0.0gpgpqu.mongodb.net/";
const connectDb = async () => {
  const db = await mongoose.connect(mongoDb);
  console.log("connection establoished", db.connection.host);
  return db;
};

export default connectDb;
