// setupFirestore.js
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

// Read JSON file manually
const serviceAccountPath = path.resolve('./serviceAccountKey.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function setupFirestore() {
  try {
    console.log('🌱 Starting Firestore setup with current structure...');

    // ================================
    // 1️⃣ Create Institutions (using "institutions" collection)
    // ================================
    const institutions = [
      {
        name: 'Limkokwing University of Creative Technology',
        email: 'info@limkokwing.ac.ls',
        location: 'Maseru, Lesotho',
        contact: '+266 22317285',
        website: 'https://www.limkokwing.ac.ls',
        createdAt: new Date(),
        role: 'institute',
        status: 'active'
      },
      {
        name: 'National University of Lesotho',
        email: 'admissions@nul.ls',
        location: 'Roma, Maseru',
        contact: '+266 22340601',
        website: 'https://www.nul.ls',
        createdAt: new Date(),
        role: 'institute',
        status: 'active'
      }
    ];

    const institutionIds = [];

    for (const inst of institutions) {
      const instRef = await db.collection('institutions').add(inst);
      institutionIds.push(instRef.id);
      console.log(`✅ Created institution: ${inst.name} (ID: ${instRef.id})`);
    }

    const limkokwingId = institutionIds[0];
    const nulId = institutionIds[1];

    // ================================
    // 2️⃣ Create Faculties (flat structure as per your seed)
    // ================================
    const faculties = [
      // Limkokwing Faculties
      {
        institutionId: limkokwingId,
        name: 'Faculty of ICT',
        description: 'Information and Communication Technology programs',
        createdAt: new Date()
      },
      {
        institutionId: limkokwingId,
        name: 'Faculty of Business',
        description: 'Business and Management programs',
        createdAt: new Date()
      },
      {
        institutionId: limkokwingId,
        name: 'Faculty of Design & Innovation',
        description: 'Creative arts and design programs',
        createdAt: new Date()
      },
      // NUL Faculties
      {
        institutionId: nulId,
        name: 'Faculty of Science & Technology',
        description: 'Science and technology programs',
        createdAt: new Date()
      },
      {
        institutionId: nulId,
        name: 'Faculty of Social Sciences',
        description: 'Social sciences programs',
        createdAt: new Date()
      }
    ];

    const facultyIds = [];

    for (const faculty of faculties) {
      const facultyRef = await db.collection('faculties').add(faculty);
      facultyIds.push(facultyRef.id);
      console.log(`📚 Created faculty: ${faculty.name}`);
    }

    // ================================
    // 3️⃣ Create Courses (flat structure)
    // ================================
    const courses = [
      // Limkokwing Courses
      {
        facultyId: facultyIds[0], // ICT Faculty
        name: 'Software Engineering',
        requirements: 'Mathematics and Science',
        duration: '3 years',
        createdAt: new Date()
      },
      {
        facultyId: facultyIds[0], // ICT Faculty
        name: 'Information Technology',
        requirements: 'Mathematics',
        duration: '3 years',
        createdAt: new Date()
      },
      {
        facultyId: facultyIds[1], // Business Faculty
        name: 'Business Management',
        requirements: 'Any subjects',
        duration: '3 years',
        createdAt: new Date()
      },
      {
        facultyId: facultyIds[2], // Design Faculty
        name: 'Graphic Design',
        requirements: 'Art and Design',
        duration: '3 years',
        createdAt: new Date()
      },
      // NUL Courses
      {
        facultyId: facultyIds[3], // Science Faculty
        name: 'Computer Science',
        requirements: 'Mathematics and Physical Science',
        duration: '4 years',
        createdAt: new Date()
      },
      {
        facultyId: facultyIds[4], // Social Sciences Faculty
        name: 'Economics',
        requirements: 'Mathematics and Economics',
        duration: '4 years',
        createdAt: new Date()
      }
    ];

    for (const course of courses) {
      await db.collection('courses').add(course);
      console.log(`📖 Created course: ${course.name}`);
    }

    // ================================
    // 4️⃣ Create Sample Applications for Testing
    // ================================
    const applications = [
      {
        institutionId: limkokwingId,
        courseId: courses[0].name, // Software Engineering
        studentId: 'student1',
        studentName: 'John Doe',
        studentEmail: 'john.doe@student.ls',
        status: 'pending',
        appliedDate: new Date(),
        createdAt: new Date()
      },
      {
        institutionId: limkokwingId,
        courseId: courses[1].name, // Information Technology
        studentId: 'student2',
        studentName: 'Jane Smith',
        studentEmail: 'jane.smith@student.ls',
        status: 'approved',
        appliedDate: new Date(),
        createdAt: new Date()
      }
    ];

    for (const application of applications) {
      await db.collection('applications').add(application);
      console.log(`📄 Created application: ${application.studentName} - ${application.courseId}`);
    }

    console.log('\n🎉 Firestore setup complete!');
    console.log('📊 Data structure created:');
    console.log(`   - Institutions: ${institutions.length}`);
    console.log(`   - Faculties: ${faculties.length}`);
    console.log(`   - Courses: ${courses.length}`);
    console.log(`   - Applications: ${applications.length}`);
    console.log('\n🔑 Important Institution IDs for testing:');
    console.log(`   - Limkokwing: ${limkokwingId}`);
    console.log(`   - NUL: ${nulId}`);
    console.log('\n🌐 Use these IDs in your frontend URLs:');
    console.log(`   http://localhost:3000/institutes/${limkokwingId}/dashboard`);

  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

setupFirestore();