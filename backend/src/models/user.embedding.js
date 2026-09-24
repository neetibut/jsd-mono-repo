import { User } from "./user.model.js";
import { embedText, GEMINI_EMBEDDING_DIMS } from "../services/gemini.client.js";

// The user fields that are baked into the embedding text below. Any update
// touching one of these makes the stored vector stale.
export const EMBEDDED_FIELDS = ["username", "email", "role", "position"];

export const buildUserEmbeddingText = (userDoc) => {
  const username = userDoc?.username ? String(userDoc.username).trim() : "";
  const email = userDoc?.email ? String(userDoc.email).trim() : "";
  const role = userDoc?.role ? String(userDoc.role).trim() : "user";
  const position = userDoc?.position ? String(userDoc.position).trim() : "";

  // The Position line is omitted when empty rather than emitted blank: an
  // empty label adds no signal to the vector, and skipping it keeps the text
  // byte-identical to the pre-position format, so users without a position
  // do not need re-embedding.
  return [
    "User profile:",
    `Username: ${username}`,
    `Email: ${email}`,
    `Role: ${role}`,
    ...(position ? [`Position: ${position}`] : []),
  ].join("\n");
};

// Synchronous path: produce a READY embedding subdocument, or throw.
// Used by user creation, which must not persist a user without a vector.
// Errors from embedText carry their own status (429/502/504) and propagate.
export const buildUserEmbedding = async (fields) => {
  const vector = await embedText({ text: buildUserEmbeddingText(fields) });
  const now = new Date();

  return {
    status: "READY",
    vector,
    dims: GEMINI_EMBEDDING_DIMS,
    attempts: 1,
    lastAttemptAt: now,
    updatedAt: now,
    lastError: null,
  };
};

const embedUserById = async (userId) => {
  if (!userId) {
    const err = new Error("userId is required");
    err.name = "ValidationError";
    err.status = 400;
    throw err;
  }

  // Mark as processing (best-effort). We don't fail if this doesn't match.
  await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        "embedding.status": "PROCESSING",
        "embedding.lastAttemptAt": new Date(),
      },
      $inc: { "embedding.attempts": 1 },
    },
    { new: false },
  );

  try {
    const user = await User.findById(userId).select(
      `${EMBEDDED_FIELDS.join(" ")} embedding.status`,
    );

    if (!user) {
      const err = new Error("User not found");
      err.name = "NotFoundError";
      err.status = 404;
      throw err;
    }

    const text = buildUserEmbeddingText(user);
    const vector = await embedText({ text });

    await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          "embedding.status": "READY",
          "embedding.vector": vector,
          "embedding.dims": GEMINI_EMBEDDING_DIMS,
          "embedding.updatedAt": new Date(),
          "embedding.lastError": null,
        },
      },
      { new: false },
    );

    return { ok: true };
  } catch (err) {
    const message = String(err?.message || "Embedding failed").slice(0, 500);

    await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          "embedding.status": "FAILED",
          "embedding.lastError": message,
        },
      },
      { new: false },
    );

    return { ok: false, error: message };
  }
};

export const queueEmbedUserById = (userId) => {
  setImmediate(() => {
    embedUserById(userId).catch((err) => {
      console.error("Async user embedding failed", {
        userId,
        message: err?.message,
      });
    });
  });
};
