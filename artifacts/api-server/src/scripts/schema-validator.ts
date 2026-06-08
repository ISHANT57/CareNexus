import { prisma } from "../lib/prisma.js";
import { mysqlPool } from "../lib/mysql.js";

async function getPostgresTables() {
  const result: any[] = await prisma.$queryRaw`
    SELECT table_name, column_name, data_type 
    FROM information_schema.columns 
    WHERE table_schema = 'public'
    ORDER BY table_name, column_name;
  `;
  return result;
}

async function getMysqlTables() {
  const [result]: any = await mysqlPool.execute(`
    SELECT table_name, column_name, data_type 
    FROM information_schema.columns 
    WHERE table_schema = DATABASE()
    ORDER BY table_name, column_name;
  `);
  return result;
}

async function validateSchema() {
  console.log("Starting Schema Validation...");
  const pgCols = await getPostgresTables();
  const myCols = await getMysqlTables();

  const pgMap = new Map();
  for (const row of pgCols) {
    if (!pgMap.has(row.table_name)) pgMap.set(row.table_name, new Map());
    pgMap.get(row.table_name).set(row.column_name, row.data_type);
  }

  const myMap = new Map();
  for (const row of myCols) {
    if (!myMap.has(TABLE_NAME_MAPPING(row.table_name))) myMap.set(TABLE_NAME_MAPPING(row.table_name), new Map());
    myMap.get(TABLE_NAME_MAPPING(row.table_name)).set(row.column_name, row.data_type);
  }

  let driftDetected = false;

  for (const [table, cols] of pgMap.entries()) {
    // Ignore internal prisma/drizzle tables
    if (table.startsWith('_') || table === 'database_sync_audit') continue;
    
    if (!myMap.has(table)) {
      console.error(`[DRIFT] Table missing in MySQL: ${table}`);
      driftDetected = true;
      continue;
    }
    const mysqlCols = myMap.get(table);
    for (const [col, _type] of cols.entries()) {
      if (!mysqlCols.has(col)) {
        console.error(`[DRIFT] Column missing in MySQL: ${table}.${col}`);
        driftDetected = true;
      }
    }
  }

  if (driftDetected) {
    console.error("\n❌ Schema Drift Detected!");
    process.exit(1);
  } else {
    console.log("✅ Schema Validation Passed. No drift detected.");
    process.exit(0);
  }
}

// Map MySQL table names if needed (e.g. they might be perfectly matching if we used Prisma @@map)
function TABLE_NAME_MAPPING(name: string) {
  return name; 
}

validateSchema().catch(err => {
  console.error("Failed to run schema validation:", err);
  process.exit(1);
});
