const bcrypt = require('bcryptjs');
const prisma = require('./prisma');

async function main() {
  console.log('🌱 Memulai seeding database...');

  try {
    // Buat user admin
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@klinik.com' },
      update: {},
      create: {
        name: 'Administrator Sistem',
        email: 'admin@klinik.com',
        password: hashedPassword,
        role: 'ADMIN',
        department: 'Administrasi',
        phone: '+6281234567890'
      }
    });

    console.log('✅ User admin dibuat:', adminUser.email);

    // Buat user contoh
    const sampleUsers = [
      {
        name: 'dr. Ahmad Hidayat, Sp.PD',
        email: 'ahmad.hidayat@klinik.com',
        password: hashedPassword,
        role: 'DOCTOR',
        department: 'Penyakit Dalam',
        phone: '+6281234567891'
      },
      {
        name: 'dr. Siti Nurhaliza, Sp.A',
        email: 'siti.nurhaliza@klinik.com',
        password: hashedPassword,
        role: 'DOCTOR',
        department: 'Anak',
        phone: '+6281234567892'
      },
      {
        name: 'dr. Budi Santoso, Sp.OG',
        email: 'budi.santoso@klinik.com',
        password: hashedPassword,
        role: 'DOCTOR',
        department: 'Obstetri & Ginekologi',
        phone: '+6281234567893'
      },
      {
        name: 'dr. Rina Kusuma, Sp.JP',
        email: 'rina.kusuma@klinik.com',
        password: hashedPassword,
        role: 'DOCTOR',
        department: 'Jantung dan Pembuluh Darah',
        phone: '+6281234567894'
      },
      {
        name: 'Dewi Lestari, S.Kep',
        email: 'dewi.lestari@klinik.com',
        password: hashedPassword,
        role: 'NURSE',
        department: 'Perawat Umum',
        phone: '+6281234567895'
      },
      {
        name: 'Ani Wijaya, S.Kep',
        email: 'ani.wijaya@klinik.com',
        password: hashedPassword,
        role: 'NURSE',
        department: 'Perawat IGD',
        phone: '+6281234567896'
      },
      {
        name: 'Rudi Hartono',
        email: 'rudi.hartono@klinik.com',
        password: hashedPassword,
        role: 'FRONT_DESK',
        department: 'Pendaftaran',
        phone: '+6281234567897'
      },
      {
        name: 'Sari Indah, S.Farm',
        email: 'sari.indah@klinik.com',
        password: hashedPassword,
        role: 'PHARMACY',
        department: 'Apotek',
        phone: '+6281234567898'
      }
    ];

    for (const userData of sampleUsers) {
      const user = await prisma.user.upsert({
        where: { email: userData.email },
        update: {},
        create: userData
      });
      console.log(`✅ User dibuat: ${user.name} (${user.role})`);
    }

    // Buat obat-obatan contoh
    const sampleMedicines = [
      {
        name: 'Paracetamol 500mg',
        description: 'Pereda nyeri dan penurun demam',
        unit: 'Tablet',
        price: 5000
      },
      {
        name: 'Amoxicillin 500mg',
        description: 'Antibiotik untuk infeksi bakteri',
        unit: 'Kapsul',
        price: 8500
      },
      {
        name: 'Omeprazole 20mg',
        description: 'Obat maag dan asam lambung',
        unit: 'Kapsul',
        price: 12000
      },
      {
        name: 'Metformin 500mg',
        description: 'Obat diabetes tipe 2',
        unit: 'Tablet',
        price: 15000
      },
      {
        name: 'Antasida DOEN',
        description: 'Menetralkan asam lambung',
        unit: 'Tablet',
        price: 3500
      },
      {
        name: 'CTM 4mg',
        description: 'Obat alergi (antihistamin)',
        unit: 'Tablet',
        price: 2500
      },
      {
        name: 'Vitamin B Complex',
        description: 'Suplemen vitamin B kompleks',
        unit: 'Tablet',
        price: 6000
      },
      {
        name: 'Ibuprofen 400mg',
        description: 'Pereda nyeri dan anti inflamasi',
        unit: 'Tablet',
        price: 7500
      },
      {
        name: 'Salbutamol Inhaler',
        description: 'Obat asma (bronkodilator)',
        unit: 'Inhaler',
        price: 45000
      },
      {
        name: 'Amlodipine 5mg',
        description: 'Obat hipertensi',
        unit: 'Tablet',
        price: 18000
      }
    ];

    for (const medicineData of sampleMedicines) {
      const medicine = await prisma.medicine.create({
        data: medicineData
      });

      // Buat batch untuk setiap obat
      await prisma.medicineBatch.create({
        data: {
          medicineId: medicine.id,
          batchNo: `BATCH-${Date.now()}-${medicine.id}`,
          stock: Math.floor(Math.random() * 150) + 100,
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 tahun dari sekarang
        }
      });

      console.log(`✅ Obat dibuat: ${medicine.name}`);
    }

    // Buat ruangan contoh
    const roomTypes = ['SINGLE', 'DOUBLE', 'ICU', 'EMERGENCY'];
    const roomNames = ['VIP', 'Kelas 1', 'Kelas 2', 'Kelas 3', 'ICU', 'IGD'];
    
    for (let i = 1; i <= 20; i++) {
      const roomType = roomTypes[Math.floor(Math.random() * roomTypes.length)];
      const room = await prisma.room.create({
        data: {
          roomNumber: `R${i.toString().padStart(3, '0')}`,
          roomType: roomType,
          capacity: roomType === 'ICU' ? 1 : (roomType === 'SINGLE' ? 1 : Math.floor(Math.random() * 3) + 2),
          pricePerDay: roomType === 'ICU' ? 1500000 : (roomType === 'SINGLE' ? 750000 : (Math.floor(Math.random() * 200000) + 300000)),
          floor: Math.floor(i / 5) + 1,
          description: `Ruangan ${roomNames[Math.floor(Math.random() * roomNames.length)]}`
        }
      });
      console.log(`✅ Ruangan dibuat: ${room.roomNumber}`);
    }

    console.log('🎉 Database berhasil di-seed!');
    console.log('\n📋 Kredensial Login Default:');
    console.log('Email: admin@klinik.com');
    console.log('Password: admin123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
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