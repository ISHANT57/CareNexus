import { mysqlPool } from "../lib/mysql.js";

async function verify() {
  console.log("Checking Pragati in MySQL...");
  const [rows]: any = await mysqlPool.execute('SELECT * FROM patients WHERE nhsNumber = ?', ['0000000002']);
  console.log(JSON.stringify(rows[0], null, 2));
  process.exit(0);
}

verify().catch(err => {
  console.error(err);
  process.exit(1);
});
