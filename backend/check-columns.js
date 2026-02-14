const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkColumns() {
  try {
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'visits' 
      ORDER BY ordinal_position
    `;
    
    console.log('Visits table columns:');
    columns.forEach(c => console.log(`- ${c.column_name}: ${c.data_type}`));
    
    const hasQueueNumber = columns.some(c => c.column_name === 'queue_number');
    console.log(`\nqueue_number column exists: ${hasQueueNumber}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkColumns();
