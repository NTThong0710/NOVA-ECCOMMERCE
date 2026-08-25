const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.qcketqdrqkvgekmgviil:Thong+0917374532@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres'
});

async function run() {
  await client.connect();
  const adminResult = await client.query("UPDATE users SET role = 'ADMIN' WHERE username = 'thongnguyen07102004@gmail.com' OR email = 'thongnguyen07102004@gmail.com'");
  console.log(`Updated ${adminResult.rowCount} rows to ADMIN.`);
  await client.end();
}

run();
