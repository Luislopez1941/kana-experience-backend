# Configuración de Supabase Storage

## 🚀 **Migración de Uploads Locales a Supabase Storage**

### **✅ Cambios Realizados:**

1. **Eliminado sistema de archivos local:**
   - ❌ Carpeta `uploads/` local
   - ❌ Dependencias `sharp` y `fs-extra`
   - ❌ Middleware de archivos estáticos
   - ❌ Métodos de manejo de archivos locales

2. **Implementado Supabase Storage:**
   - ✅ `SupabaseService` con métodos de storage
   - ✅ Upload de imágenes base64 a Supabase
   - ✅ URLs públicas automáticas
   - ✅ Eliminación de archivos remotos

### **🔧 Configuración de Supabase Storage:**

#### **1. Crear Buckets en Supabase:**

Ve a tu proyecto de Supabase → Storage → Create a new bucket

```bash
# Bucket para yachts
Bucket Name: yachts
Public bucket: ✅ (para acceso público a imágenes)
File size limit: 50MB
Allowed MIME types: image/*

# Bucket para tours (si lo necesitas)
Bucket Name: tours
Public bucket: ✅
File size limit: 50MB
Allowed MIME types: image/*
```

#### **2. Configurar Políticas de Seguridad:**

```sql
-- Política para permitir lectura pública de imágenes
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'yachts');

-- Política para permitir uploads autenticados
CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'yachts' AND auth.role() = 'authenticated');

-- Política para permitir eliminación por propietario
CREATE POLICY "Users can delete own images" ON storage.objects
FOR DELETE USING (bucket_id = 'yachts' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### **📁 Estructura de Archivos en Storage:**

```
yachts/
├── yacht_1703123456789_yacht_de_lujo_1.webp
├── yacht_1703123456790_yacht_de_lujo_2.webp
└── yacht_1703123456791_yacht_de_lujo_3.webp

tours/
├── tour_1703123456789_tour_isla_mujeres_1.webp
└── tour_1703123456790_tour_isla_mujeres_2.webp
```

### **🔍 Métodos Disponibles en SupabaseService:**

#### **Upload de Imágenes:**
```typescript
// Upload de imagen base64
const imageUrl = await this.supabase.uploadBase64Image(
  'yachts',           // bucket
  'filename.webp',    // path
  base64String        // base64 data
);

// Upload de buffer
const imageUrl = await this.supabase.uploadImage(
  'yachts',           // bucket
  'filename.webp',    // path
  buffer,             // Buffer
  'image/webp'        // content type
);
```

#### **Eliminación de Imágenes:**
```typescript
// Eliminar imagen
await this.supabase.deleteImage('yachts', 'filename.webp');
```

#### **Generación de Nombres Únicos:**
```typescript
// Generar nombre único
const filename = this.supabase.generateUniqueFileName(
  'original_name.jpg',
  'yacht_'  // prefix opcional
);
// Resultado: yacht_1703123456789_original_name.jpg
```

### **📝 Ejemplo de Uso en YachtService:**

```typescript
// Crear yacht con imágenes
async create(createYachtDto: CreateYachtDto): Promise<ApiResponse<Yacht>> {
  // ... validaciones ...

  // Upload de imágenes a Supabase Storage
  if (createYachtDto.images?.length > 0) {
    const imagePromises = createYachtDto.images.map(async (base64, index) => {
      const filename = this.supabase.generateUniqueFileName(
        `${createYachtDto.name}_${index + 1}.webp`,
        'yacht_'
      );
      
      // Upload a Supabase Storage
      const imageUrl = await this.supabase.uploadBase64Image(
        this.storageBucket,
        filename,
        base64
      );
      
      // Guardar referencia en base de datos
      return this.prisma.yachtImage.create({
        data: { url: imageUrl, yachtId: yacht.id }
      });
    });

    await Promise.all(imagePromises);
  }

  // ... resto del código ...
}
```

### **🎯 Ventajas de Supabase Storage:**

✅ **Escalabilidad**: Sin límites de almacenamiento local
✅ **CDN Global**: Imágenes servidas desde edge locations
✅ **URLs Públicas**: Acceso directo sin middleware
✅ **Seguridad**: Políticas de acceso granulares
✅ **Backup Automático**: Respaldo automático de archivos
✅ **Integración**: Perfecta integración con PostgreSQL

### **⚠️ Consideraciones Importantes:**

1. **Límites de Tamaño**: Configura límites apropiados en el bucket
2. **Tipos de Archivo**: Restringe a tipos de imagen válidos
3. **Políticas de Seguridad**: Implementa políticas apropiadas
4. **Costos**: Monitorea el uso de storage y bandwidth
5. **Backup**: Las imágenes se respaldan automáticamente

### **🚀 Próximos Pasos:**

1. **Configura los buckets** en tu proyecto de Supabase
2. **Implementa las políticas** de seguridad
3. **Prueba el upload** de imágenes
4. **Verifica las URLs públicas** de las imágenes
5. **Monitorea el uso** del storage

### **🔗 Recursos Adicionales:**

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Storage Policies](https://supabase.com/docs/guides/storage/policies)
- [Storage API Reference](https://supabase.com/docs/reference/javascript/storage-createbucket) 