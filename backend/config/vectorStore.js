const { GoogleGenerativeAI } = require("@google/generative-ai");
const mongoose = require("mongoose");
const Expense = require("../models/Expense");
const Income = require("../models/Income");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

// ── Text representation ───────────────────────────────────────────
// Format: "TYPE | DATE | CATEGORY_OR_SOURCE | AMOUNT | DESCRIPTION"
// Consistent format used for BOTH storing and querying
function formatTransactionText(transaction, type) {
  const date = new Date(transaction.date).toISOString().split("T")[0];
  const categoryOrSource =
    type === "expense" ? transaction.category : transaction.source;
  const description = transaction.icon || "";
  return `${type.toUpperCase()} | ${date} | ${categoryOrSource} | ${transaction.amount} | ${description}`.trim();
}

// ── Generate embedding vector ─────────────────────────────────────
async function generateEmbedding(text) {
  const result = await embeddingModel.embedContent({
    content: { parts: [{ text }] },
    outputDimensionality: 768
  });
  return result.embedding.values; // returns number[]
}

// ── Add transaction embedding to MongoDB doc ──────────────────────
// Called fire-and-forget after saving a new transaction
// Updates the saved doc in-place with its embedding vector
async function addTransactionEmbedding(transaction, type) {
  try {
    const text = formatTransactionText(transaction, type);
    const embedding = await generateEmbedding(text);

    const Model = type === "expense" ? Expense : Income;

    await Model.findByIdAndUpdate(transaction._id, { $set: { embedding } });
  } catch (err) {
    // Non-fatal: embedding failure never breaks the main transaction flow
    console.error(`[VectorStore] Failed to embed ${type}:`, err.message);
  }
}

// ── Similarity search via MongoDB Atlas Vector Search ─────────────
// Requires a Vector Search index named "transaction_vector_index"
// on BOTH the incomes and expenses collections
// Index config: { "fields": [{ "type": "vector", "path": "embedding", "numDimensions": 768, "similarity": "cosine" }] }
async function similaritySearch(userId, queryText, k = 10) {
  try {
    const queryEmbedding = await generateEmbedding(queryText);

    const vectorSearchStage = (embedding, userIdObj) => [
      {
        $vectorSearch: {
          index: "transaction_vector_index",
          path: "embedding",
          queryVector: embedding,
          numCandidates: 100,
          limit: k,
          filter: { userId: userIdObj },
        },
      },
      {
        $project: {
          _id: 1,
          category: 1,
          source: 1,
          amount: 1,
          date: 1,
          icon: 1,
          score: { $meta: "vectorSearchScore" },
        },
      },
    ];

    const userIdObj = new mongoose.Types.ObjectId(userId);

    const [expenseResults, incomeResults] = await Promise.all([
      Expense.aggregate(vectorSearchStage(queryEmbedding, userIdObj)),
      Income.aggregate(vectorSearchStage(queryEmbedding, userIdObj)),
    ]);

    // Merge and sort by score descending, take top k overall
    const combined = [
      ...expenseResults.map((r) => ({ ...r, type: "expense" })),
      ...incomeResults.map((r) => ({ ...r, type: "income" })),
    ]
      .sort((a, b) => b.score - a.score)
      .slice(0, k);

    return combined;
  } catch (err) {
    console.error("[VectorStore] Similarity search failed:", err.message);
    return []; // graceful fallback — caller handles empty array
  }
}

// ── Fallback: fetch recent transactions from MongoDB directly ──────
// Used when vector search returns 0 results (e.g. no embeddings yet)
async function fallbackFetchRecentTransactions(userId, days = 30) {
  try {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [expenses, incomes] = await Promise.all([
      Expense.find({ userId, date: { $gte: since } }).sort({ date: -1 }).limit(50),
      Income.find({ userId, date: { $gte: since } }).sort({ date: -1 }).limit(50),
    ]);

    return [
      ...expenses.map((e) => ({ ...e.toObject(), type: "expense" })),
      ...incomes.map((i) => ({ ...i.toObject(), type: "income" })),
    ];
  } catch (err) {
    console.error("[VectorStore] Fallback fetch failed:", err.message);
    return [];
  }
}

// ── Sync existing transactions (on-demand, first chat use) ─────────
// Only embeds transactions that don't already have an embedding field
async function syncUserTransactions(userId, limit = 5) {
  try {
    const [expenses, incomes] = await Promise.all([
      Expense.find({ userId, embedding: { $exists: false } }),
      Income.find({ userId, embedding: { $exists: false } }),
    ]);

    const allUnsynced = [
      ...expenses.map((e) => ({ doc: e, type: "expense" })),
      ...incomes.map((i) => ({ doc: i, type: "income" })),
    ];

    const totalUnsynced = allUnsynced.length;
    if (totalUnsynced === 0) return { synced: 0, remaining: 0 };

    // Slice to the batch limit to process in this request
    const toSync = allUnsynced.slice(0, limit);

    // Process this batch in parallel
    await Promise.all(
      toSync.map(({ doc, type }) => addTransactionEmbedding(doc, type))
    );

    const synced = toSync.length;
    const remaining = totalUnsynced - synced;

    return { synced, remaining };
  } catch (err) {
    console.error("[VectorStore] Sync failed:", err.message);
    return { synced: 0, remaining: 0 };
  }
}

module.exports = {
  addTransactionEmbedding,
  similaritySearch,
  fallbackFetchRecentTransactions,
  syncUserTransactions,
};
