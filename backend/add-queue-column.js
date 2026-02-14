const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addQueueNumberColumn() {
  try {
    console.log('Adding queue_number column to visits table...');
    
    await prisma.$executeRaw`
      ALTER TABLE visits ADD COLUMN IF NOT EXISTS queue_number VARCHAR(20)
    `;
    
    console.log('✅ queue_number column added successfully!');
    
    // Verify it was added
    const columns = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'visits' AND column_name = 'queue_number'
    `;
    
    if (columns.length > 0) {
      console.log('✅ Verified: queue_number column exists in database');
    } else {
      console.log('❌ Error: queue_number column was not added');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addQueueNumberColumn();
