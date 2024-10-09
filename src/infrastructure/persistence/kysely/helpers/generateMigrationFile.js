/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");

const generateFile = () => {
  const migrationName = process.argv[2];
  if (!migrationName) {
    console.error("Error: Please provide a migration name.");
    process.exit(1);
  }

  const timestamp = new Date()
    .toISOString()
    .replace(/[-T:.Z]/g, "")
    .slice(0, 14);

  const fileName = `${timestamp}-${migrationName}.ts`;

  const fileContent = `import { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Add migration logic here
}

export async function down(db: Kysely<any>): Promise<void> {
  // Add rollback logic here
}
`;

  const migrationsFolder = path.join(__dirname, "../migrations");

  if (!fs.existsSync(migrationsFolder)) {
    fs.mkdirSync(migrationsFolder, { recursive: true });
  }

  fs.writeFileSync(path.join(migrationsFolder, fileName), fileContent);

  console.log(`Migration file created: ${fileName}`);
};

generateFile();
// 20241008155952-add-consumablesArrivingDate-to-patients
