import { Client } from "pg";
import { config as dotenvConfig } from "dotenv";

dotenvConfig({ path: ".env" });

async function checkUser() {
  const emails = ["draberyg@gmail.com", "ilg.yamacgursel@gmail.com"];

  let connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error("DATABASE_URL not found");
    return;
  }

  // Remove sslmode from connection string
  try {
    const urlObj = new URL(connectionString);
    urlObj.searchParams.delete("sslmode");
    connectionString = urlObj.toString();
  } catch (e) {
    console.error("Invalid URL", e);
  }

  const sslConfig = {
    rejectUnauthorized: false,
    ca: process.env.DATABASE_SSL_CA,
    cert: process.env.DATABASE_SSL_CERT,
    key: process.env.DATABASE_SSL_KEY,
  };

  const client = new Client({
    connectionString,
    ssl: sslConfig,
  });

  try {
    await client.connect();
    console.log("Connected to database");

    const countRes = await client.query('SELECT count(*) FROM "User"');
    console.log("Total users in DB:", countRes.rows[0].count);

    for (const email of emails) {
      const res = await client.query(
        'SELECT id, email, "emailVerified", password, "isActive" FROM "User" WHERE email = $1',
        [email]
      );

      if (res.rows.length === 0) {
        console.log("User not found:", email);
      } else {
        const user = res.rows[0];
        console.log("User found:", {
          id: user.id,
          email: user.email,
          emailVerified: user.emailVerified,
          hasPassword: !!user.password,
          isActive: user.isActive,
        });
      }
    }
  } catch (err) {
    console.error("Database error:", err);
  } finally {
    await client.end();
  }
}

checkUser();
