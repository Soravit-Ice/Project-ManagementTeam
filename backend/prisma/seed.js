import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminEmail = 'admin@example.com';
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('admin123', 12);
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        name: 'Admin User',
        firstName: 'Admin',
        lastName: 'User',
        level: 'Manager',
        dailyRate: 2000,
        accountType: 'ADMINISTRATOR',
        verified: true,
      },
    });
    console.log('✅ Admin user created:', admin.email);
  } else {
    console.log('ℹ️  Admin user already exists');
  }

  // Create sample employee
  const employeeEmail = 'employee@example.com';
  const existingEmployee = await prisma.user.findUnique({
    where: { email: employeeEmail },
  });

  if (!existingEmployee) {
    const passwordHash = await bcrypt.hash('employee123', 12);
    const employee = await prisma.user.create({
      data: {
        email: employeeEmail,
        passwordHash,
        name: 'John Doe',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '0812345678',
        gender: 'MALE',
        level: 'Senior',
        dailyRate: 1500,
        accountType: 'EMPLOYEE',
        verified: true,
      },
    });
    console.log('✅ Employee user created:', employee.email);
  } else {
    console.log('ℹ️  Employee user already exists');
  }

  // Create sample projects
  const users = await prisma.user.findMany();
  if (users.length > 0) {
    const projectCount = await prisma.project.count();
    if (projectCount === 0) {
      const admin = users.find((u) => u.accountType === 'ADMINISTRATOR') || users[0];
      await prisma.project.createMany({
        data: [
          {
            name: 'Website Redesign',
            description: 'Redesign company website',
            status: 'ACTIVE',
            creatorId: admin.id,
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-06-30'),
            internalCost: 500000,
          },
          {
            name: 'Mobile App Development',
            description: 'Build iOS and Android app',
            status: 'ACTIVE',
            creatorId: admin.id,
            startDate: new Date('2024-02-01'),
            endDate: new Date('2024-12-31'),
            internalCost: 1000000,
          },
          {
            name: 'Marketing Campaign',
            description: 'Q1 Marketing campaign',
            status: 'LOCKED',
            creatorId: admin.id,
            startDate: new Date('2024-01-15'),
            endDate: new Date('2024-03-31'),
            internalCost: 250000,
          },
        ],
      });
      console.log('✅ Sample projects created');
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
