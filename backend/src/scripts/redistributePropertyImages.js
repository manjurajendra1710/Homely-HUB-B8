// api.pexels.com is currently network-blocked here, so we can't fetch new
// photos. This instead redistributes the photos ALREADY stored across all
// properties so duplicates are minimized (each photo reused at most once,
// vs. up to 6 properties sharing one before) and spread away from
// properties in the same state where possible.
// Run with: node src/scripts/redistributePropertyImages.js
import "dotenv/config";
import dns from "dns";
import mongoose from "mongoose";
import { Property } from "../Models/propertyModel.js";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const IMAGES_PER_PROPERTY = 6;

const shuffle = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected");

  const properties = await Property.find({});
  console.log(`Found ${properties.length} properties`);

  // Build the master pool of unique photos currently in the DB.
  const poolById = new Map();
  properties.forEach((property) => {
    (property.images || []).forEach((image) => {
      const id = image.public_id;
      if (!id || poolById.has(id)) return;
      poolById.set(id, { public_id: image.public_id, url: image.url });
    });
  });

  const pool = Array.from(poolById.values()).map((photo) => ({
    photo,
    usageCount: 0,
    usedByStates: new Set()
  }));

  console.log(`Unique photos in pool: ${pool.length}`);
  console.log(
    `Slots needed: ${properties.length * IMAGES_PER_PROPERTY} (${
      properties.length * IMAGES_PER_PROPERTY - pool.length > 0
        ? properties.length * IMAGES_PER_PROPERTY - pool.length
        : 0
    } unavoidable reuses given the current pool size)`
  );

  // Process properties in random order so any unavoidable reuse isn't
  // systematically dumped on whichever property happens to be last.
  const order = shuffle(properties);

  for (const property of order) {
    const state = (property.address?.state || "").toLowerCase();

    const ranked = [...pool].sort((a, b) => {
      if (a.usageCount !== b.usageCount) return a.usageCount - b.usageCount;
      const aSameState = a.usedByStates.has(state) ? 1 : 0;
      const bSameState = b.usedByStates.has(state) ? 1 : 0;
      if (aSameState !== bSameState) return aSameState - bSameState;
      return Math.random() - 0.5;
    });

    const chosen = ranked.slice(0, IMAGES_PER_PROPERTY);
    chosen.forEach((entry) => {
      entry.usageCount += 1;
      entry.usedByStates.add(state);
    });

    const images = chosen.map((entry) => entry.photo);

    await Property.updateOne({ _id: property._id }, { $set: { images } });
    console.log(`Updated "${property.propertyName}" (${images.length} images)`);
  }

  const reused = pool.filter((entry) => entry.usageCount > 1);
  console.log(
    `Done. ${reused.length} photos ended up reused (max reuse: ${Math.max(
      ...pool.map((e) => e.usageCount)
    )}x).`
  );

  await mongoose.disconnect();
};

run().catch((error) => {
  console.error("Redistribution failed:", error);
  process.exit(1);
});
