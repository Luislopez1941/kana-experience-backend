// Script para crear los buckets necesarios para la aplicación
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan variables de entorno SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAppBuckets() {
  try {
    console.log('🚀 Creando buckets para la aplicación...');
    
    // Buckets que necesitamos
    const buckets = [
      {
        name: 'yachts',
        description: 'Imágenes de yates y embarcaciones'
      },
      {
        name: 'clubs',
        description: 'Imágenes de clubes y establecimientos'
      },
      {
        name: 'tours',
        description: 'Imágenes de tours y excursiones'
      }
    ];
    
    // Verificar buckets existentes
    const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Error al listar buckets:', listError);
      return;
    }
    
    const existingBucketNames = existingBuckets.map(b => b.name);
    console.log('📦 Buckets existentes:', existingBucketNames);
    
    // Crear buckets que no existen
    for (const bucket of buckets) {
      if (existingBucketNames.includes(bucket.name)) {
        console.log(`✅ Bucket '${bucket.name}' ya existe`);
        continue;
      }
      
      console.log(`🆕 Creando bucket: ${bucket.name}`);
      const { data: newBucket, error: createError } = await supabase.storage.createBucket(bucket.name, {
        public: true,
        fileSizeLimit: 52428800, // 50MB
        allowedMimeTypes: ['image/*']
      });
      
      if (createError) {
        console.error(`❌ Error al crear bucket '${bucket.name}':`, createError);
        continue;
      }
      
      console.log(`✅ Bucket '${bucket.name}' creado exitosamente`);
    }
    
    // Listar todos los buckets al final
    console.log('\n📋 Resumen de buckets:');
    const { data: finalBuckets } = await supabase.storage.listBuckets();
    finalBuckets.forEach(bucket => {
      console.log(`  - ${bucket.name} (${bucket.public ? 'Público' : 'Privado'})`);
    });
    
    console.log('\n🎉 ¡Buckets creados exitosamente!');
    console.log('\n📝 Próximos pasos:');
    console.log('1. Ve a Storage > Policies en tu dashboard de Supabase');
    console.log('2. Crea políticas de seguridad para cada bucket');
    console.log('3. Prueba tu aplicación NestJS');
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar creación de buckets
createAppBuckets(); 