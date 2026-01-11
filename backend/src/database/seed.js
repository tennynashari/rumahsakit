const bcrypt = require('bcryptjs');
const prisma = require('./prisma');

async function main() {
  console.log('🌱 Starting database seed...');

  try {
    // Create admin user
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@hospital.com' },
      update: {},
      create: {
        name: 'System Administrator',
        email: 'admin@hospital.com',
        password: hashedPassword,
        role: 'ADMIN',
        department: 'Administration',
        phone: '+1234567890'
      }
    });

    console.log('✅ Admin user created:', adminUser.email);

    // Create sample users
    const sampleUsers = [
      {
        name: 'Dr. John Smith',
        email: 'john.smith@hospital.com',
        password: hashedPassword,
        role: 'DOCTOR',
        department: 'Cardiology',
        phone: '+1234567891'
      },
      {
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@hospital.com',
        password: hashedPassword,
        role: 'DOCTOR',
        department: 'Pediatrics',
        phone: '+1234567892'
      },
      {
        name: 'Nurse Mary Wilson',
        email: 'mary.wilson@hospital.com',
        password: hashedPassword,
        role: 'NURSE',
        department: 'General Ward',
        phone: '+1234567893'
      },
      {
        name: 'Reception Staff',
        email: 'reception@hospital.com',
        password: hashedPassword,
        role: 'FRONT_DESK',
        department: 'Front Office',
        phone: '+1234567894'
      },
      {
        name: 'Pharmacy Staff',
        email: 'pharmacy@hospital.com',
        password: hashedPassword,
        role: 'PHARMACY',
        department: 'Pharmacy',
        phone: '+1234567895'
      }
    ];

    for (const userData of sampleUsers) {
      const user = await prisma.user.upsert({
        where: { email: userData.email },
        update: {},
        create: userData
      });
      console.log(`✅ User created: ${user.name} (${user.role})`);
    }

    // Create sample medicines
    const sampleMedicines = [
      {
        name: 'Paracetamol',
        description: 'Pain reliever and fever reducer',
        unit: 'Tablet',
        price: 5.00
      },
      {
        name: 'Amoxicillin',
        description: 'Antibiotic for bacterial infections',
        unit: 'Capsule',
        price: 12.50
      },
      {
        name: 'Omeprazole',
        description: 'Proton pump inhibitor for acid reflux',
        unit: 'Capsule',
        price: 8.75
      },
      {
        name: 'Metformin',
        description: 'Medication for type 2 diabetes',
        unit: 'Tablet',
        price: 15.25
      }
    ];

    for (const medicineData of sampleMedicines) {
      const medicine = await prisma.medicine.create({
        data: medicineData
      });

      // Create a batch for each medicine
      await prisma.medicineBatch.create({
        data: {
          medicineId: medicine.id,
          batchNo: `BATCH-${Date.now()}-${medicine.id}`,
          stock: Math.floor(Math.random() * 100) + 50,
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
        }
      });

      console.log(`✅ Medicine created: ${medicine.name}`);
    }

    // Create sample patients
    const samplePatients = [
      {
        name: 'Michael Anderson',
        dateOfBirth: new Date('1985-03-15'),
        gender: 'MALE',
        phone: '+1234567901',
        address: '123 Oak Street, New York, NY 10001',
        emergencyContact: {
          name: 'Sarah Anderson',
          phone: '+1234567902',
          email: 'sarah.anderson@email.com',
          bloodType: 'A+',
          allergies: 'Penicillin'
        }
      },
      {
        name: 'Emily Williams',
        dateOfBirth: new Date('1990-07-22'),
        gender: 'FEMALE',
        phone: '+1234567903',
        address: '456 Pine Avenue, Brooklyn, NY 11201',
        emergencyContact: {
          name: 'James Williams',
          phone: '+1234567904',
          email: 'james.williams@email.com',
          bloodType: 'B+',
          allergies: 'None'
        }
      },
      {
        name: 'David Brown',
        dateOfBirth: new Date('1978-11-08'),
        gender: 'MALE',
        phone: '+1234567905',
        address: '789 Maple Road, Manhattan, NY 10002',
        emergencyContact: {
          name: 'Lisa Brown',
          phone: '+1234567906',
          email: 'lisa.brown@email.com',
          bloodType: 'O+',
          allergies: 'Sulfa drugs'
        }
      },
      {
        name: 'Jennifer Davis',
        dateOfBirth: new Date('1995-05-30'),
        gender: 'FEMALE',
        phone: '+1234567907',
        address: '321 Elm Street, Queens, NY 11354',
        emergencyContact: {
          name: 'Robert Davis',
          phone: '+1234567908',
          email: 'robert.davis@email.com',
          bloodType: 'AB+',
          allergies: 'Latex'
        }
      },
      {
        name: 'Christopher Miller',
        dateOfBirth: new Date('1982-09-12'),
        gender: 'MALE',
        phone: '+1234567909',
        address: '654 Cedar Lane, Bronx, NY 10451',
        emergencyContact: {
          name: 'Amanda Miller',
          phone: '+1234567910',
          email: 'amanda.miller@email.com',
          bloodType: 'A-',
          allergies: 'Aspirin, Ibuprofen'
        }
      }
    ];

    for (const patientData of samplePatients) {
      // Generate MRN
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const prefix = `MRN${year}${month}${day}`;
      
      const lastPatient = await prisma.patient.findFirst({
        where: {
          medicalRecordNo: {
            startsWith: prefix
          }
        },
        orderBy: {
          medicalRecordNo: 'desc'
        }
      });

      let sequence = 1;
      if (lastPatient) {
        const lastSequence = parseInt(lastPatient.medicalRecordNo.slice(-3));
        sequence = lastSequence + 1;
      }

      const medicalRecordNo = `${prefix}${String(sequence).padStart(3, '0')}`;

      const patient = await prisma.patient.create({
        data: {
          medicalRecordNo,
          ...patientData
        }
      });
      console.log(`✅ Patient created: ${patient.name} (${patient.medicalRecordNo})`);
    }

    // Create sample visits
    // Get first patient and doctors
    const firstPatients = await prisma.patient.findMany({ take: 5 });
    const doctors = await prisma.user.findMany({
      where: { role: 'DOCTOR' },
      take: 2
    });

    if (firstPatients.length > 0 && doctors.length > 0) {
      // Generate visits with queue numbers for today
      const today = new Date();
      const year = today.getFullYear().toString().slice(-2);
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const datePrefix = `${year}${month}${day}`;

      const sampleVisits = [
        {
          patientId: firstPatients[0].id,
          doctorId: doctors[0].id,
          visitType: 'OUTPATIENT',
          scheduledAt: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0),
          queueNumber: `${datePrefix}-001`,
          status: 'SCHEDULED',
          notes: 'Regular checkup appointment'
        },
        {
          patientId: firstPatients[1].id,
          doctorId: doctors[1].id,
          visitType: 'OUTPATIENT',
          scheduledAt: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 30),
          queueNumber: `${datePrefix}-002`,
          status: 'SCHEDULED',
          notes: 'Follow-up consultation'
        },
        {
          patientId: firstPatients[2].id,
          doctorId: doctors[0].id,
          visitType: 'OUTPATIENT',
          scheduledAt: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0),
          queueNumber: `${datePrefix}-003`,
          status: 'IN_PROGRESS',
          notes: 'General consultation'
        },
        {
          patientId: firstPatients[3].id,
          doctorId: doctors[1].id,
          visitType: 'OUTPATIENT',
          scheduledAt: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 30),
          queueNumber: `${datePrefix}-004`,
          status: 'SCHEDULED',
          notes: 'Routine health screening'
        },
        {
          patientId: firstPatients[4].id,
          doctorId: doctors[0].id,
          visitType: 'OUTPATIENT',
          scheduledAt: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 0),
          queueNumber: `${datePrefix}-005`,
          status: 'SCHEDULED',
          notes: 'Medical consultation'
        },
        // Yesterday's visits
        {
          patientId: firstPatients[0].id,
          doctorId: doctors[0].id,
          visitType: 'OUTPATIENT',
          scheduledAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 14, 30),
          queueNumber: `${year}${month}${String(today.getDate() - 1).padStart(2, '0')}-001`,
          status: 'COMPLETED',
          notes: 'Completed consultation'
        },
        {
          patientId: firstPatients[2].id,
          doctorId: doctors[1].id,
          visitType: 'EMERGENCY',
          scheduledAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 16, 45),
          queueNumber: `${year}${month}${String(today.getDate() - 1).padStart(2, '0')}-002`,
          status: 'COMPLETED',
          notes: 'Emergency visit - resolved'
        }
      ];

      for (const visitData of sampleVisits) {
        const visit = await prisma.visit.create({
          data: visitData
        });
        console.log(`✅ Visit created: ${visit.queueNumber} - ${visit.visitType} - Patient ID ${visit.patientId}`);
      }

      // Create sample medical records
      const completedVisits = await prisma.visit.findMany({
        where: { status: 'COMPLETED' },
        include: { patient: true, doctor: true }
      });

      if (completedVisits.length > 0) {
        // Create additional visits for medical records without existing visits
        const additionalVisit1 = await prisma.visit.create({
          data: {
            patientId: firstPatients[2].id,
            doctorId: doctors[0].id,
            visitType: 'OUTPATIENT',
            scheduledAt: new Date('2025-12-30T10:00:00'),
            status: 'COMPLETED',
            notes: 'Diabetes consultation and diagnosis'
          }
        });

        const additionalVisit2 = await prisma.visit.create({
          data: {
            patientId: firstPatients[3].id,
            doctorId: doctors[1].id,
            visitType: 'OUTPATIENT',
            scheduledAt: new Date('2025-12-28T15:30:00'),
            status: 'COMPLETED',
            notes: 'Gastroenterology consultation for GERD'
          }
        });

        const sampleRecords = [
          {
            patientId: completedVisits[0].patientId,
            doctorId: completedVisits[0].doctorId,
            visitId: completedVisits[0].id,
            diagnosisCode: 'J06.9',
            symptoms: 'Patient complains of sore throat, runny nose, mild fever (38.2°C), and body aches for the past 3 days. No cough or difficulty breathing.',
            diagnosis: 'Acute upper respiratory tract infection, unspecified. Common cold symptoms with mild fever.',
            treatment: 'Advised rest and increased fluid intake. Symptomatic treatment with paracetamol for fever and pain.',
            prescription: 'Paracetamol 500mg - Take 1 tablet every 6 hours as needed for fever/pain (max 4 tablets/day)\nVitamin C 1000mg - Take 1 tablet daily\nRest for 3-5 days'
          },
          {
            patientId: completedVisits[1].patientId,
            doctorId: completedVisits[1].doctorId,
            visitId: completedVisits[1].id,
            diagnosisCode: 'I20.9',
            symptoms: 'Chest pain radiating to left arm, shortness of breath, sweating, and nausea. Symptoms started 2 hours ago during physical activity.',
            diagnosis: 'Angina pectoris, unspecified. Suspected coronary artery disease. ECG shows ST-segment changes.',
            treatment: 'Immediate oxygen therapy, aspirin administered. Patient stabilized and referred to cardiology for further evaluation. Cardiac enzyme tests ordered.',
            prescription: 'Aspirin 100mg - Take 1 tablet daily\nAtenolol 50mg - Take 1 tablet daily in the morning\nIsosorbide dinitrate 5mg - Take as needed for chest pain (sublingual)\nFollow-up appointment with cardiologist in 1 week'
          },
          {
            patientId: firstPatients[2].id,
            doctorId: doctors[0].id,
            visitId: additionalVisit1.id,
            diagnosisCode: 'E11.9',
            symptoms: 'Increased thirst, frequent urination, unexplained weight loss (5kg in 2 months), fatigue, and blurred vision.',
            diagnosis: 'Type 2 diabetes mellitus without complications. Fasting blood glucose: 186 mg/dL, HbA1c: 8.2%',
            treatment: 'Started on oral hypoglycemic medication. Dietary counseling provided. Recommended lifestyle modifications including regular exercise and low-carb diet.',
            prescription: 'Metformin 500mg - Take 1 tablet twice daily with meals\nGlibenclamide 5mg - Take 1 tablet before breakfast\nMonitor blood glucose levels daily (fasting and post-meal)\nSchedule follow-up in 2 weeks'
          },
          {
            patientId: firstPatients[3].id,
            doctorId: doctors[1].id,
            visitId: additionalVisit2.id,
            diagnosisCode: 'K21.9',
            symptoms: 'Burning sensation in chest and throat, especially after meals and when lying down. Occasional regurgitation of food. Symptoms worsening over past month.',
            diagnosis: 'Gastro-esophageal reflux disease (GERD) without esophagitis. No alarm symptoms present.',
            treatment: 'Lifestyle modifications advised: avoid trigger foods, eat smaller meals, avoid lying down after eating. Elevate head of bed. Started on proton pump inhibitor.',
            prescription: 'Omeprazole 20mg - Take 1 capsule 30 minutes before breakfast\nGaviscon - Take 10ml after meals and at bedtime as needed\nAvoid spicy foods, caffeine, and alcohol\nFollow-up in 4 weeks if symptoms persist'
          }
        ];

        for (const recordData of sampleRecords) {
          const record = await prisma.medicalRecord.create({
            data: recordData
          });
          console.log(`✅ Medical record created: Patient ID ${record.patientId} - ${record.diagnosisCode}`);
        }
      }
    }

    // Create sample rooms
    const roomTypes = ['SINGLE', 'DOUBLE', 'ICU', 'EMERGENCY'];
    for (let i = 1; i <= 20; i++) {
      const room = await prisma.room.create({
        data: {
          roomNumber: `R${i.toString().padStart(3, '0')}`,
          roomType: roomTypes[Math.floor(Math.random() * roomTypes.length)],
          capacity: Math.floor(Math.random() * 3) + 1,
          pricePerDay: (Math.floor(Math.random() * 200) + 100),
          floor: Math.floor(i / 10) + 1,
          description: `Room ${i} - Standard hospital room`
        }
      });
      console.log(`✅ Room created: ${room.roomNumber}`);
    }

    // Create sample billings
    const allVisits = await prisma.visit.findMany({
      where: { status: 'COMPLETED' },
      include: { patient: true }
    });

    if (allVisits.length > 0) {
      const sampleBillings = [
        {
          patientId: allVisits[0].patientId,
          visitId: allVisits[0].id,
          items: [
            { description: 'Doctor Consultation Fee', quantity: 1, unitPrice: 150.00, amount: 150.00 },
            { description: 'Lab Tests - Blood Work', quantity: 1, unitPrice: 75.00, amount: 75.00 },
            { description: 'Paracetamol 500mg', quantity: 20, unitPrice: 5.00, amount: 100.00 }
          ],
          subtotal: 325.00,
          tax: 32.50,
          discount: 0,
          total: 357.50,
          status: 'PAID',
          paidAt: new Date('2026-01-02T15:00:00')
        },
        {
          patientId: allVisits[1].patientId,
          visitId: allVisits[1].id,
          items: [
            { description: 'Emergency Consultation', quantity: 1, unitPrice: 300.00, amount: 300.00 },
            { description: 'ECG Test', quantity: 1, unitPrice: 100.00, amount: 100.00 },
            { description: 'Cardiac Enzyme Tests', quantity: 1, unitPrice: 200.00, amount: 200.00 },
            { description: 'Aspirin 100mg', quantity: 30, unitPrice: 3.50, amount: 105.00 },
            { description: 'Atenolol 50mg', quantity: 30, unitPrice: 4.00, amount: 120.00 }
          ],
          subtotal: 825.00,
          tax: 82.50,
          discount: 50.00,
          total: 857.50,
          status: 'PARTIALLY_PAID',
          paidAt: null
        },
        {
          patientId: firstPatients[2].id,
          visitId: additionalVisit1.id,
          items: [
            { description: 'Diabetes Consultation', quantity: 1, unitPrice: 175.00, amount: 175.00 },
            { description: 'Fasting Blood Glucose Test', quantity: 1, unitPrice: 50.00, amount: 50.00 },
            { description: 'HbA1c Test', quantity: 1, unitPrice: 85.00, amount: 85.00 },
            { description: 'Metformin 500mg', quantity: 60, unitPrice: 15.25, amount: 915.00 },
            { description: 'Glibenclamide 5mg', quantity: 30, unitPrice: 8.50, amount: 255.00 }
          ],
          subtotal: 1480.00,
          tax: 148.00,
          discount: 100.00,
          total: 1528.00,
          status: 'UNPAID',
          paidAt: null
        },
        {
          patientId: firstPatients[3].id,
          visitId: additionalVisit2.id,
          items: [
            { description: 'Gastroenterology Consultation', quantity: 1, unitPrice: 200.00, amount: 200.00 },
            { description: 'Endoscopy Examination', quantity: 1, unitPrice: 450.00, amount: 450.00 },
            { description: 'Omeprazole 20mg', quantity: 30, unitPrice: 8.75, amount: 262.50 }
          ],
          subtotal: 912.50,
          tax: 91.25,
          discount: 0,
          total: 1003.75,
          status: 'PAID',
          paidAt: new Date('2025-12-28T16:00:00')
        },
        {
          patientId: firstPatients[0].id,
          visitId: null,
          items: [
            { description: 'Annual Health Checkup Package', quantity: 1, unitPrice: 500.00, amount: 500.00 },
            { description: 'Complete Blood Count', quantity: 1, unitPrice: 80.00, amount: 80.00 },
            { description: 'Chest X-Ray', quantity: 1, unitPrice: 120.00, amount: 120.00 },
            { description: 'Urinalysis', quantity: 1, unitPrice: 45.00, amount: 45.00 }
          ],
          subtotal: 745.00,
          tax: 74.50,
          discount: 75.00,
          total: 744.50,
          status: 'UNPAID',
          paidAt: null
        }
      ];

      for (const billingData of sampleBillings) {
        const billing = await prisma.billing.create({
          data: billingData
        });
        console.log(`✅ Billing created: Patient ID ${billing.patientId} - ${billing.status} - ${billing.total}`);
      }
    }

    console.log('🎉 Database seeded successfully!');
    console.log('\n📋 Default Login Credentials:');
    console.log('Email: admin@hospital.com');
    console.log('Password: password123');

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