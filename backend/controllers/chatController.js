const { GoogleGenerativeAI } = require("@google/generative-ai");
const mongoose = require("mongoose");
const Expense = require("../models/Expense");
const Income = require("../models/Income");
const {
  similaritySearch,
  fallbackFetchRecentTransactions,
  syncUserTransactions,
} = require("../config/vectorStore");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ── Format retrieved transactions into readable context block ──────
function buildContextBlock(transactions) {
  if (!transactions || transactions.length === 0) {
    return "No specific transactions found matching this query.";
  }
  return transactions
    .map((t) => {
      const date = new Date(t.date).toISOString().split("T")[0];
      const label = t.type === "expense" ? t.category : t.source;
      return `- [${t.type.toUpperCase()}] ${date} | ${label} | ₹${t.amount}`;
    })
    .join("\n");
}

// ── Get financial summary stats from MongoDB ───────────────────────
async function getFinancialSummary(userId) {
  try {
    const userIdObj = new mongoose.Types.ObjectId(userId);

    const [expenseAgg, incomeAgg] = await Promise.all([
      Expense.aggregate([
        { $match: { userId: userIdObj } },
        { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
      ]),
      Income.aggregate([
        { $match: { userId: userIdObj } },
        { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
      ]),
    ]);

    const totalExpenses = expenseAgg[0]?.total || 0;
    const totalIncome = incomeAgg[0]?.total || 0;
    const balance = totalIncome - totalExpenses;

    return { totalIncome, totalExpenses, balance };
  } catch (err) {
    console.error("[Chat] Financial summary error:", err.message);
    return { totalIncome: 0, totalExpenses: 0, balance: 0 };
  }
}

// ── System prompt ──────────────────────────────────────────────────
function buildSystemPrompt(summary, contextBlock) {
  return `You are Zen Wealth AI, a personal financial advisor. You ONLY analyze and advise based on the user's actual transaction data provided below. Do not use external financial knowledge or make up transactions. If a question cannot be answered from the data provided, say so clearly and politely.

USER FINANCIAL SUMMARY:
- Total Income: ₹${summary.totalIncome}
- Total Expenses: ₹${summary.totalExpenses}  
- Current Balance: ₹${summary.balance}

RELEVANT TRANSACTIONS (retrieved based on your question):
${contextBlock}

RULES:
- Always reference specific transactions from the data above when giving advice.
- Never hallucinate transaction details not present in the data.
- Keep responses concise, clear, and actionable.
- Use Indian Rupee (₹) for all amounts.
- If no relevant data exists, guide the user to add transactions first.`;
}

// ── POST /api/v1/chat/message ──────────────────────────────────────
exports.sendMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { message, history = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    // 1. Sync existing transactions on first use (non-blocking check)
    syncUserTransactions(userId).catch(() => {});

    // 2. Similarity search for relevant transactions
    let relevantTransactions = await similaritySearch(userId, message, 10);

    // 3. Fallback to recent transactions if vector search returned nothing
    if (relevantTransactions.length === 0) {
      relevantTransactions = await fallbackFetchRecentTransactions(userId, 30);
    }

    // 4. Build context and summary
    const [contextBlock, summary] = await Promise.all([
      Promise.resolve(buildContextBlock(relevantTransactions)),
      getFinancialSummary(userId),
    ]);

    // 5. Build system prompt
    const systemPrompt = buildSystemPrompt(summary, contextBlock);

    // 6. Build chat history for Gemini
    // Map frontend history (role: "assistant") to Gemini format (role: "model")
    const geminiHistory = history
      .filter((msg) => msg.role && msg.content)
      .map((msg) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      }));

    // 7. Call Gemini 3.1 Flash Lite (highly available, fast, and stable)
    const model = genAI.getGenerativeModel({
      model: "gemini-3.1-flash-lite",
      systemInstruction: systemPrompt,
    });

    const chat = model.startChat({
      history: geminiHistory,
    });

    const result = await chat.sendMessage(message);
    const responseText = result.response.text();

    res.status(200).json({ reply: responseText });
  } catch (error) {
    console.error("[Chat] sendMessage error:", error);
    
    const errMsg = error.message || "";
    const isRateLimit = 
      error.status === 429 || 
      errMsg.includes("quota") || 
      errMsg.includes("rate limit") || 
      errMsg.includes("RESOURCE_EXHAUSTED") ||
      errMsg.includes("429");

    if (isRateLimit) {
      return res.status(429).json({
        message: "Gemini API rate limit reached. Please wait a few seconds and try again.",
      });
    }

    res.status(500).json({
      message: "AI service temporarily unavailable. Please try again.",
    });
  }
};

// ── POST /api/v1/chat/sync ─────────────────────────────────────────
exports.syncTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await syncUserTransactions(userId);
    res.status(200).json({ message: "Sync complete", ...result });
  } catch (error) {
    console.error("[Chat] sync error:", error.message);
    res.status(500).json({ message: "Sync failed" });
  }
};
