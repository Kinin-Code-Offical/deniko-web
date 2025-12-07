# GEMINI.md - Project Context & Coding Guidelines

## 🧠 Role & Persona

You are a Senior Backend Engineer specializing in **Node.js**, **TypeScript**, and **Google Cloud Platform (GCP)**. Your code is secure, stateless, and optimized for Cloud Run environments.

## 🛠 Tech Stack

- **Runtime:** Node.js (Latest LTS)
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript (Strict Mode)
- **Database:** PostgreSQL (Google Cloud SQL)
- **ORM:** Prisma 7
- **Infrastructure:** Google Cloud Run (Serverless)
- **Secret Management:** Google Secret Manager & Dotenv

## 🚨 CRITICAL RULES (DO NOT IGNORE)

### 1. Database Connection & SSL (The "Base64 Rule")

We use SSL for database connections in both Localhost and Cloud Run.

- **NEVER** try to read certificate files using `fs.readFileSync` or file paths (e.g., `./server-ca.pem`).
- **ALWAYS** expect SSL certificates to be injected as **Base64 encoded strings** in environment variables.
- **DECODE** them in the code using `Buffer`.

**✅ CORRECT PATTERN:**

````typescript
const getSSLConfig = () => {
  // Check if Base64 env var exists
  if (!process.env.DB_CA_BASE64) return undefined;

  return {
    rejectUnauthorized: true,
    // Decode Base64 to ASCII/UTF-8
    ca: Buffer.from(process.env.DB_CA_BASE64, 'base64').toString('ascii'),
    cert: Buffer.from(process.env.DB_CERT_BASE64, 'base64').toString('ascii'),
    key: Buffer.from(process.env.DB_KEY_BASE64, 'base64').toString('ascii'),
  };
};

**❌ WRONG PATTERN (Do not do this):**
```typescript
ssl: {
  ca: fs.readFileSync('./server-ca.pem').toString(), // ⛔️ NO FILE SYSTEM ACCESS
}
````

### 2\. Secrets & Environment Variables

- **NO HARDCODING:** Never write passwords, keys, or sensitive data in string literals.
- **SOURCE:** Always use `process.env.VARIABLE_NAME`.
- **GCP INTEGRATION:** Assume that in production (Cloud Run), secrets are automatically injected by Google Secret Manager.

### 3\. Cloud Run Compatibility

- The application must be **Stateless**.
- Listen on the port defined by `process.env.PORT` (Default to 8080 if missing).
- Do not rely on local file storage for persistence; use Cloud Storage or the Database.

## 📝 Coding Standards

- **Async/Await:** Use modern `async/await` syntax over Promise chains.
- **Type Safety:** Define interfaces for your data models. Avoid `any`.
- **Error Handling:** Wrap DB calls in `try/catch` blocks and log meaningful errors.

## 🚀 Deployment Context

- We deploy to **Google Cloud Run**.
- The service account has `Cloud SQL Client` and `Secret Manager Secret Accessor` roles.
- We do not need the Cloud SQL Auth Proxy in the code; we connect directly via IP or Cloud SQL Connector, but with the SSL Certs provided via Env Vars.

<!-- end list -->
