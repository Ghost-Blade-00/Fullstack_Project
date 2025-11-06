import mongoose from "mongoose";

let bucket = null;

export const initGrid = (connection) => {
  bucket = new mongoose.mongo.GridFSBucket(connection.db, { bucketName: "attachments" });
};

export const getGridBucket = () => {
  if (!bucket) throw new Error("GridFS bucket not initialized");
  return bucket;
};
