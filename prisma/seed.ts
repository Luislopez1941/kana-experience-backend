import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create roles first
  console.log('📋 Creating roles...');

  // Super Admin Role
  const superAdminRole = await prisma.role.upsert({
    where: { name: 'SUPER_ADMIN' },
    update: {},
    create: {
      name: 'SUPER_ADMIN',
      description: 'Full system access with all permissions',
      permissions: ['*'], // All permissions
    },
  });

  // Admin Role
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      description: 'Administrative access with limited permissions',
      permissions: ['users.read', 'users.create', 'users.update'],
    },
  });

  

  // User Role
  const userRole = await prisma.role.upsert({
    where: { name: 'USER' },
    update: {},
    create: {
      name: 'USER',
      description: 'Regular user with basic permissions',
      permissions: ['profile.read', 'profile.update'],
    },
  });

  console.log('✅ Roles created/updated successfully');

  // Check if super admin already exists
  const existingSuperAdmin = await prisma.user.findFirst({
    where: {
      role: {
        name: 'SUPER_ADMIN',
      },
    },
  });

  if (existingSuperAdmin) {
    console.log('✅ Super admin already exists, skipping creation');
  } else {
    // Hash password for super admin
    const hashedPassword = await bcrypt.hash('SuperAdmin123!', 10);

    // Create super admin
    const superAdmin = await prisma.user.create({
      data: {
        email: 'superadmin@kana-experience.com',
        password: hashedPassword,
        firstName: 'Super',
        lastName: 'Admin',
        roleId: superAdminRole.id,
        phoneNumber: '+1234567890',
      },
    });

    console.log('✅ Super admin created successfully:', {
      id: superAdmin.id,
      email: superAdmin.email,
      role: superAdminRole.name,
    });
  }

  // Check if admin user already exists
  const existingAdmin = await prisma.user.findFirst({
    where: {
      email: 'admin@kana-experience.com',
    },
  });

  if (existingAdmin) {
    console.log('✅ Admin user already exists, skipping creation');
  } else {
    // Create a regular admin user
    const adminPassword = await bcrypt.hash('Admin123!', 10);
    const admin = await prisma.user.create({
      data: {
        email: 'admin@kana-experience.com',
        password: adminPassword,
        firstName: 'Admin',
        lastName: 'User',
        roleId: adminRole.id,
        phoneNumber: '+1234567891',
      },
    });

    console.log('✅ Admin user created successfully:', {
      id: admin.id,
      email: admin.email,
      role: adminRole.name,
    });
  }

  // Check if regular user already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      email: 'user@kana-experience.com',
    },
  });

  if (existingUser) {
    console.log('✅ Regular user already exists, skipping creation');
  } else {
    // Create a regular user
    const userPassword = await bcrypt.hash('User123!', 10);
    const user = await prisma.user.create({
      data: {
        email: 'user@kana-experience.com',
        password: userPassword,
        firstName: 'Regular',
        lastName: 'User',
        roleId: userRole.id,
        phoneNumber: '+1234567892',
      },
    });

    console.log('✅ Regular user created successfully:', {
      id: user.id,
      email: user.email,
      role: userRole.name,
    });
  }

  // Check if Angel Lara already exists
  const existingAngelLara = await prisma.user.findFirst({
    where: {
      email: 'angellara@kanaexperience.com',
    },
  });

  if (existingAngelLara) {
    console.log('✅ Angel Lara already exists, skipping creation');
  } else {
    // Create Angel Lara user
    const angelPassword = await bcrypt.hash('Lara2025', 10);
    const angelLara = await prisma.user.create({
      data: {
        email: 'angellara@kanaexperience.com',
        password: angelPassword,
        firstName: 'Angel',
        lastName: 'Lara',
        roleId: adminRole.id,
        phoneNumber: '+1234567893',
      },
    });

    console.log('✅ Angel Lara created successfully:', {
      id: angelLara.id,
      email: angelLara.email,
      role: adminRole.name,
    });
  }

  // Create states
  console.log('📋 Creating states...');
  
  const states = [
    'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas',
    'Chihuahua', 'Ciudad de México', 'Coahuila', 'Colima', 'Durango',
    'Estado de México', 'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco',
    'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca',
    'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa',
    'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz',
    'Yucatán', 'Zacatecas'
  ];

  for (const stateName of states) {
    await prisma.state.upsert({
      where: { name: stateName },
      update: {},
      create: { name: stateName },
    });
  }

  console.log('✅ States created/updated successfully');

  // Create municipalities for Quintana Roo (Cancún)
  console.log('📋 Creating municipalities for Quintana Roo...');
  
  const quintanaRoo = await prisma.state.findUnique({
    where: { name: 'Quintana Roo' },
  });

  if (quintanaRoo) {
    const municipalities = [
      'Benito Juárez', 'Cozumel', 'Felipe Carrillo Puerto', 'Isla Mujeres',
      'José María Morelos', 'Lázaro Cárdenas', 'Othón P. Blanco', 'Solidaridad',
      'Tulum'
    ];

    for (const municipalityName of municipalities) {
      await prisma.municipality.upsert({
        where: { 
          id: -1 // This will never match, so it will always create
        },
        update: {},
        create: { 
          name: municipalityName,
          stateId: quintanaRoo.id
        },
      });
    }

    console.log('✅ Municipalities for Quintana Roo created/updated successfully');
  }

  console.log('🎉 Seed completed successfully!');
  console.log('\n📋 Default users:');
  console.log('Super Admin: superadmin@kana-experience.com / SuperAdmin123!');
  console.log('Admin: admin@kana-experience.com / Admin123!');
  console.log('User: user@kana-experience.com / User123!');
  console.log('Angel Lara: angellara@kanaexperience.com / Lara2025');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 