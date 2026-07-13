# Chatbot Workflow & Architecture

This document details the end-to-end workflow of the RAG (Retrieval-Augmented Generation) AI Financial chatbot, illustrating how data is processed, indexed, retrieved, and generation-guided using Google's Gemini models and MongoDB Atlas Vector Search.

---

## 1. High-Level Architecture Diagram

```mermaid
graph TD
    User([User]) <--> Frontend[Vite React Frontend]
    Frontend <--> Express[Express.js Backend Server]
    Express <--> MongoDB[(MongoDB Atlas Cluster)]
    Express <--> Gemini[Google Gemini APIs]

    subgraph "Vector Search Indexing"
        MongoDB -- Vector Search Index --> AtlasSearch[Atlas Vector Search Index]
    end
```

---

## 2. Pipeline A: Transaction Event & Embedding Pipeline
Whenever an income or expense is added (via UI or bulk Excel upload), the transaction is formatted, embedded, and indexed.

### Workflow Sequence
```mermaid
sequenceDiagram
    autonumber
    actor User as User
    participant FE as React Frontend
    participant BE as Express Backend
    participant DB as MongoDB Database
    participant Gem as Gemini Embedding API (gemini-embedding-001)

    User->>FE: Adds Income or Expense
    FE->>BE: POST /api/v1/expenses or /api/v1/incomes
    BE->>DB: Save transaction details (without embedding)
    DB-->>BE: Saved document returned
    BE-->>FE: HTTP 201 Created (Instant User Feedback)

    Note over BE,Gem: Background Fire-and-Forget Process Starts

    rect rgb(240, 248, 255)
        BE->>BE: Format transaction string: <br/> "TYPE | DATE | CATEGORY/SOURCE | AMOUNT | ICON"
        BE->>Gem: Generate 768-dim Embedding Vector
        Gem-->>BE: Return Vector Array (768 Floats)
        BE->>DB: Update document by ID (Add 'embedding' field)
        DB->>DB: MongoDB Atlas indexes vector automatically
    end
```

### Key Technical Details
* **Standardized Format**: Transaction objects are formatted into a simple, predictable text signature before embedding, e.g.:
  `EXPENSE | 2026-07-13 | food | 500 | 🍔`
* **Output Dimensionality**: The `gemini-embedding-001` model normally outputs $3072$-dimension vectors. We restrict this to **`768`** dimensions using `outputDimensionality: 768` to matches the configuration of the search index in MongoDB Atlas.

---

## 3. Pipeline B: RAG Query & Chat Retrieval Pipeline
When a user asks a question in the chat interface, the system retrieves relevant transactions and feeds them to Gemini.

### Workflow Sequence
```mermaid
sequenceDiagram
    autonumber
    actor User as User
    participant FE as React Frontend
    participant BE as Express Backend
    participant GemE as Gemini Embedding API
    participant DB as MongoDB Atlas
    participant GemL as Gemini LLM (gemini-3.5-flash)

    User->>FE: Types "How can I save more?"
    FE->>BE: POST /api/v1/chat/message (Body: message, history)
    
    BE->>GemE: Embed User Message (768 dimensions)
    GemE-->>BE: Returns Query Vector
    
    alt Vector Search Success
        BE->>DB: Aggregate $vectorSearch (Filter by userId)
        DB-->>BE: Returns Top Relevant Transactions
    else Vector Search Index Building / Empty
        BE->>DB: Fallback: Fetch last 30 days of raw transactions
        DB-->>BE: Returns Recent Transactions list
    end

    BE->>BE: Calculate statistics (Total Income, Total Expenses, Current Balance)
    BE->>BE: Compile System Prompt (Rules: Currency formatting, strict context-only answers)
    
    BE->>GemL: Generate Content (System Prompt + History + Context + Query)
    GemL-->>BE: Context-grounded analysis response
    BE-->>FE: HTTP 200 (JSON Reply)
    FE-->>User: Displays message response
```

### Core Safeguards & Optimizations
1. **Pre-Filtering**: The `$vectorSearch` stage incorporates a strict `{ userId: userIdObj }` pre-filter. Because this field is defined as a `filter` type in the MongoDB index, Atlas restricts vector candidate selection strictly to the current user's records before checking cosine similarity.
2. **Indian Rupees Format**: The system prompt instructs Gemini to formulate numbers in Indian numbering system formatting (e.g., $1,00,000$ instead of $100,000$) and always prefix transactions and totals with the Indian Rupee sign (**₹**).
3. **Accuracy Fallback**: If the vector search yields no results or is unavailable, the fallback standard query retrieves 30 days of recent transactions. This ensures the model remains grounded in actual account statistics, rather than hallucinating account totals.
