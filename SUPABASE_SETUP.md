# Configuración de Supabase + PostgreSQL

## 🚀 **Configuración del Backend con Supabase**

### **1. Variables de Entorno (.env)**

```bash
# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Supabase Configuration
SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"
SUPABASE_SERVICE_ROLE_KEY="[YOUR-SERVICE-ROLE-KEY]"

# App Configuration
PORT=3005
JWT_SECRET="your-jwt-secret-key"
JWT_EXPIRES_IN="7d"
```

### **2. Obtener Credenciales de Supabase**

1. **Ve a [supabase.com](https://supabase.com)**
2. **Crea un nuevo proyecto** o selecciona uno existente
3. **Ve a Settings > API**
4. **Copia las credenciales:**
   - `Project URL` → `SUPABASE_URL`
   - `anon public` → `SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY`

### **3. Configurar Base de Datos**

#### **Opción A: Usar Prisma (Recomendado)**
```bash
# Generar cliente de Prisma
npx prisma generate

# Sincronizar schema con Supabase
npx prisma db push

# O crear migración
npx prisma migrate dev --name init
```

#### **Opción B: Usar Supabase Client directamente**
```typescript
// En tu servicio
async findAll(): Promise<ApiResponse<Yacht[]>> {
  try {
    // Usar Prisma (principal)
    const yachts = await this.prisma.yacht.findMany({
      include: {
        yachtCategory: true,
        images: true,
        characteristics: true,
      },
      orderBy: { name: 'asc' },
    });
    
    return {data: yachts, status: 'success', message: 'Embarcaciones obtenidas correctamente'};
  } catch (error) {
    // Fallback a Supabase si Prisma falla
    const { data, error: supabaseError } = await this.supabase
      .getClient()
      .from('Yacht')
      .select(`
        *,
        yachtCategory (*),
        images (*),
        characteristics (*)
      `)
      .order('name', { ascending: true });
    
    if (supabaseError) throw supabaseError;
    
    return {data: data, status: 'success', message: 'Embarcaciones obtenidas correctamente'};
  }
}
```

### **4. Ventajas de esta Configuración Híbrida**

✅ **Prisma**: ORM robusto, tipado fuerte, migraciones automáticas
✅ **Supabase**: Autenticación, real-time, storage, edge functions
✅ **PostgREST**: API REST automática para consultas simples
✅ **Flexibilidad**: Puedes usar ambos según la necesidad

### **5. Estructura de la Base de Datos**

Tu schema actual incluye:
- **Yacht**: Con campo `pricing` (JSON) para precios por hora
- **Tour**: Con campo `pricing` (JSON) para precios por persona
- **Relaciones**: Categorías, imágenes, características
- **PostgreSQL**: Soporte nativo para JSON, arrays, etc.

### **6. Ejemplo de Uso del Campo Pricing**

```typescript
// Crear yacht con precios por hora
const yachtData = {
  name: "Yacht de Lujo",
  capacity: 10,
  length: "15m",
  location: "Puerto Cancún",
  description: "Yacht de lujo para paseos turísticos",
  pricing: [
    { hour: "09:00", price: 150.00 },
    { hour: "14:00", price: 200.00 },
    { hour: "18:00", price: 180.00 }
  ],
  yachtCategoryId: 1
};

// Crear tour con precios por persona
const tourData = {
  name: "Tour Isla Mujeres",
  description: "Tour a la hermosa Isla Mujeres",
  pricing: [
    { personas: 1, precio: 100.00 },
    { personas: 2, precio: 180.00 },
    { personas: 3, precio: 250.00 }
  ],
  tourCategoryId: 1
};
```

### **7. Comandos Útiles**

```bash
# Generar cliente de Prisma
npm run db:generate

# Sincronizar base de datos
npm run db:push

# Crear migración
npm run db:migrate

# Ejecutar seeds
npm run db:seed

# Iniciar en desarrollo
npm run start:dev
```

### **8. Próximos Pasos**

1. **Configura las variables de entorno** con tus credenciales de Supabase
2. **Ejecuta `npx prisma db push`** para sincronizar el schema
3. **Prueba la conexión** ejecutando la aplicación
4. **Implementa autenticación** usando Supabase Auth si lo necesitas
5. **Configura storage** para las imágenes si quieres usar Supabase Storage

## 🎯 **Beneficios de esta Configuración**

- **Escalabilidad**: PostgreSQL en Supabase es muy escalable
- **Real-time**: Puedes implementar actualizaciones en tiempo real
- **Autenticación**: Sistema de auth robusto integrado
- **Storage**: Almacenamiento de archivos en la nube
- **Edge Functions**: Funciones serverless para lógica compleja
- **Dashboard**: Interfaz web para administrar la base de datos 