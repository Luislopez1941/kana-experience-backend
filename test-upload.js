// Script de prueba para Supabase Storage
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan variables de entorno SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testStorage() {
  try {
    console.log('🚀 Probando Supabase Storage...');
    
    // 1. Verificar buckets existentes
    console.log('\n📦 Verificando buckets...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Error al listar buckets:', bucketsError);
      return;
    }
    
    console.log('✅ Buckets encontrados:', buckets.map(b => b.name));
    
    // 2. Crear bucket de prueba si no existe
    const bucketName = 'test-upload';
    const bucketExists = buckets.find(b => b.name === bucketName);
    
    if (!bucketExists) {
      console.log(`\n🆕 Creando bucket de prueba: ${bucketName}`);
      const { data: newBucket, error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 52428800, // 50MB
        allowedMimeTypes: ['image/*']
      });
      
      if (createError) {
        console.error('❌ Error al crear bucket:', createError);
        return;
      }
      
      console.log('✅ Bucket creado exitosamente');
    } else {
      console.log(`✅ Bucket ${bucketName} ya existe`);
    }
    
    // 3. Probar upload de imagen de prueba
    console.log('\n📤 Probando upload de imagen...');
    const testImage = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
    
    const fileName = `test-${Date.now()}.png`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, testImage, {
        contentType: 'image/png',
        upsert: false
      });
    
    if (uploadError) {
      console.error('❌ Error al hacer upload:', uploadError);
      return;
    }
    
    console.log('✅ Upload exitoso:', uploadData);
    
    // 4. Obtener URL pública
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);
    
    console.log('🔗 URL pública:', urlData.publicUrl);
    
    // 5. Listar archivos en el bucket
    console.log('\n📋 Listando archivos en el bucket...');
    const { data: files, error: listError } = await supabase.storage
      .from(bucketName)
      .list();
    
    if (listError) {
      console.error('❌ Error al listar archivos:', listError);
      return;
    }
    
    console.log('✅ Archivos en el bucket:', files.map(f => f.name));
    
    // 6. Eliminar archivo de prueba
    console.log('\n🗑️ Eliminando archivo de prueba...');
    const { error: deleteError } = await supabase.storage
      .from(bucketName)
      .remove([fileName]);
    
    if (deleteError) {
      console.error('❌ Error al eliminar archivo:', deleteError);
      return;
    }
    
    console.log('✅ Archivo eliminado exitosamente');
    
    console.log('\n🎉 ¡Prueba completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar prueba
testStorage(); 