const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.qcketqdrqkvgekmgviil:Thong+0917374532@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres'
});

async function run() {
  await client.connect();
  const result = await client.query("UPDATE users SET role = 'CUSTOMER' WHERE role = 'USER'");
  console.log(`Updated ${result.rowCount} rows to CUSTOMER.`);
  
  // Update one user to ADMIN for testing
  const adminResult = await client.query("UPDATE users SET role = 'ADMIN' WHERE username = 'admin' OR id = 1");
  console.log(`Updated ${adminResult.rowCount} rows to ADMIN.`);
  
  await client.end();
}

run();
