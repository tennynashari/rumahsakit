require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('Testing database connection...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL);
    
    const count = await prisma.user.count();
    console.log('✅ Database connected successfully!');
    console.log('User count:', count);
    
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Full error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

testConnection();
