export interface MockResponse<T> {
  data: T;
  isMock: true;
}

export const MOCK_DATA = {
  gapAnalysis: {
    coreIntent: "Implement efficient PostgreSQL connection pooling in a serverless Node.js environment.",
    knowns: ["Node.js", "PostgreSQL", "Serverless functions", "High concurrency"],
    unknowns: ["Specific serverless provider (AWS Lambda, Vercel, etc.)", "Current pooling library being used", "Database size and connection limits"],
    actionPlan: 'hybrid',
    searchQueries: [
      "postgresql connection pooling serverless nodejs best practices",
      "pg-pool vs prisma accelerate for serverless postgres",
      "aws lambda postgres connection exhaustion solutions"
    ]
  },
  searchResults: [
    {
      url: "https://aws.amazon.com/blogs/database/managing-postgresql-connections-lambda/",
      title: "Managing PostgreSQL Connections in AWS Lambda",
      content: "In serverless environments, traditional pooling doesn't work because functions are stateless. Use a proxy like RDS Proxy or PgBouncer to manage connections centrally."
    },
    {
      url: "https://prisma.io/docs/guides/database/connection-pooling",
      title: "Prisma Connection Pooling",
      content: "Prisma Accelerate provides a global database proxy that handles connection pooling for serverless functions, preventing 'too many clients' errors."
    }
  ],
  synthesis: {
    answer: "For serverless Node.js microservices, traditional in-app connection pooling (like pg-pool) is ineffective because each function instance creates its own connection. The recommended approach is using a database proxy.",
    code: "const { Pool } = require('pg');\n// Use a proxy URL instead of direct DB URL\nconst pool = new Pool({\n  connectionString: process.env.DATABASE_PROXY_URL,\n});",
    references: ["AWS RDS Proxy", "PgBouncer", "Prisma Accelerate"]
  }
};
