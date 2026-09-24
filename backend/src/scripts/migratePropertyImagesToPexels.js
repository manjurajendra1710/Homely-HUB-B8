// One-off migration: replace blocked images.unsplash.com URLs with Pexels photos.
// Tracks every photo id used across the whole run so no two properties end up
// sharing images (previously properties in the same state/type collided).
// Run with: node src/scripts/migratePropertyImagesToPexels.js
import "dotenv/config";
import dns from "dns";
import mongoose from "mongoose";
import { Property } from "../Models/propertyModel.js";

// This network's default DNS server refuses Node's SRV lookups (needed by
// mongodb+srv:// URIs), so point Node at a public resolver that answers them.
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
const MIN_IMAGES = 6;
const WANT_IMAGES = 8;
const PER_PAGE = 30;

if (!PEXELS_API_KEY) {
  console.error("Missing PEXELS_API_KEY in Backend/.env");
  process.exit(1);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const searchPexels = async (query, perPage) => {
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(
    query
  )}&per_page=${perPage}&orientation=landscape`;

  const res = await fetch(url, {
    headers: { Authorization: PEXELS_API_KEY }
  });

  if (!res.ok) {
    throw new Error(`Pexels API error ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  return data.photos || [];
};

const lastWord = (name) => name.trim().split(/\s+/).pop();

// Pulls candidate photos from increasingly broad queries, skipping any photo
// id already claimed by an earlier property (globalUsedIds), until it has
// WANT_IMAGES unique photos or runs out of queries to try.
const fetchPhotosForProperty = async (property, globalUsedIds) => {
  const typeWord = lastWord(property.propertyName);
  const city = property.address?.city || "";
  const state = property.address?.state || "";

  const queries = [
    `${typeWord} ${city} home`.trim(),
    `${typeWord} ${state} home`.trim(),
    `${property.propertyType} home ${state}`.trim(),
    `${property.propertyType} interior`,
    "vacation home interior",
    "cozy house interior"
  ];

  const picked = [];
  const pickedIds = new Set();

  for (const query of queries) {
    if (picked.length >= WANT_IMAGES) break;

    const photos = await searchPexels(query, PER_PAGE);

    for (const photo of photos) {
      if (picked.length >= WANT_IMAGES) break;
      if (globalUsedIds.has(photo.id) || pickedIds.has(photo.id)) continue;

      picked.push(photo);
      pickedIds.add(photo.id);
    }

    await sleep(250);
  }

  if (picked.length < MIN_IMAGES) {
    throw new Error(
      `Only found ${picked.length} unique images for "${property.propertyName}"`
    );
  }

  return picked;
};

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected");

  const properties = await Property.find({});
  console.log(`Found ${properties.length} properties`);

  const globalUsedIds = new Set();

  for (const property of properties) {
    try {
      const photos = await fetchPhotosForProperty(property, globalUsedIds);

      photos.forEach((photo) => globalUsedIds.add(photo.id));

      const images = photos.map((photo) => ({
        public_id: `pexels_${photo.id}`,
        url: photo.src.large2x || photo.src.large
      }));

      // updateOne (not .save()) so we touch only the images field —
      // this DB has pre-existing unrelated schema mismatches on other
      // fields (enums, maximumGuests) that full-document validation
      // would otherwise reject.
      await Property.updateOne(
        { _id: property._id },
        { $set: { images } }
      );
      console.log(`Updated "${property.propertyName}" (${images.length} images)`);
    } catch (error) {
      console.error(`Failed "${property.propertyName}":`, error.message);
    }

    await sleep(250);
  }

  await mongoose.disconnect();
  console.log("Done");
};

run().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
