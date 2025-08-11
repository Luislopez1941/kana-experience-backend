// Script para probar conexión a la base de datos
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

async function testConnection() {
  console.log('🚀 Probando conexión a la base de datos...');
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  });

  try {
    // Intentar conectar con timeout
    const connectionPromise = prisma.$connect();
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout: 30 segundos')), 30000);
    });

    await Promise.race([connectionPromise, timeoutPromise]);
    
    console.log('✅ Conexión exitosa!');
    
    // Probar una consulta simple
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Consulta de prueba exitosa:', result);
    
    await prisma.$disconnect();
    console.log('✅ Desconexión exitosa');
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    
    if (error.message.includes('Timeout')) {
      console.log('\n💡 El pooler de Supabase no es compatible con Prisma');
      console.log('💡 Soluciones:');
      console.log('   1. Usar prisma db push en lugar de migrate');
      console.log('   2. Obtener URL de conexión directa sin pooler');
      console.log('   3. Crear usuario específico para migraciones');
    }
  }
}

testConnection(); 