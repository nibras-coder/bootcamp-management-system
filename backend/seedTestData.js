require("dotenv").config();

const dns = require("dns");

// Fix MongoDB Atlas SRV DNS resolution
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const mongoose = require("mongoose");

const User = require("./models/User");
const Batch = require("./models/Batch");
const Assignment = require("./models/Assignment");
const Submission = require("./models/Submission");
const Attendance = require("./models/Attendance");


async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");


    // 1. CLEAR OLD TEST DATA

    await Submission.deleteMany({
      githubUrl: {
        $regex: "github.com/test",
      },
    });

    await Assignment.deleteMany({
      title: {
        $regex: "Test Assignment",
      },
    });

    await Attendance.deleteMany({
      note: "Test attendance data",
    });

    await Batch.deleteMany({
      name: "Test Bootcamp Batch",
    });

    await User.deleteMany({
      email: {
        $in: [
          "mentor@test.com",
          "student1@test.com",
          "student2@test.com",
        ],
      },
    });


    // 2. CREATE MENTOR
    

    const mentor = await User.create({
      name: "Test Mentor",
      email: "mentor@test.com",
      password: "123456",
      role: "mentor",
      gender: "Male",
      isActive: true,
    });

    
    // 3. CREATE STUDENTS
    

    const student1 = await User.create({
      name: "Abdi Student",
      email: "student1@test.com",
      password: "123456",
      role: "student",
      gender: "Male",
      isActive: true,
    });

    const student2 = await User.create({
      name: "Aisha Student",
      email: "student2@test.com",
      password: "123456",
      role: "student",
      gender: "Female",
      isActive: true,
    })
    // 4. CREATE BATCH


    const batch = await Batch.create({
      name: "Test Bootcamp Batch",
      track: "Web Development",
      startDate: new Date("2026-08-01"),
      endDate: new Date("2026-09-01"),
      mentors: [mentor._id],
      students: [student1._id, student2._id],
      isActive: true,
    });

    
    // 5. CONNECT STUDENTS TO BATCH
    

    student1.batch = batch._id;
    student2.batch = batch._id;

    await student1.save();
    await student2.save();

    
    // 6. CREATE ASSIGNMENT
    

    const assignment = await Assignment.create({
      title: "Test Assignment - React Project",

      description:
        "Build a simple React application using components and state.",

      instructions:
        "Create a React project and submit the GitHub repository and live demo.",

      batch: batch._id,

      createdBy: mentor._id,

      startDate: new Date("2026-08-20"),

      deadline: new Date("2026-12-30"),

      maxScore: 100,

      resourceLink:
        "https://react.dev/",

      attachment: {
        fileName: "assignment.pdf",
        fileUrl: "https://example.com/assignment.pdf",
      },
    });

    
    // 7. CREATE SUBMISSION 1


    const submission1 = await Submission.create({
      assignment: assignment._id,

      student: student1._id,

      githubUrl:
        "https://github.com/test/student1-project",

      liveDemoUrl:
        "https://student1-project.vercel.app",

      notes:
        "Completed the React assignment.",

      submittedAt: new Date(),

      status: "Submitted",
    });


    // 8. CREATE SUBMISSION 

    const submission2 = await Submission.create({
      assignment: assignment._id,

      student: student2._id,

      githubUrl:
        "https://github.com/test/student2-project",

      liveDemoUrl:
        "https://student2-project.vercel.app",

      notes:
        "React project completed.",

      submittedAt: new Date(),

      status: "Submitted",
    });

    
    // 9. CREATE ATTENDANCE
    

    await Attendance.create([
      {
        student: student1._id,
        batch: batch._id,
        date: new Date("2026-08-20"),
        status: "Present",
        note: "Test attendance data",
        markedBy: mentor._id,
      },

      {
        student: student2._id,
        batch: batch._id,
        date: new Date("2026-08-20"),
        status: "Late",
        note: "Test attendance data",
        markedBy: mentor._id,
      },
    ]);

    console.log("\n================================");
    console.log("TEST DATA CREATED SUCCESSFULLY");
    console.log("================================\n");

    console.log("MENTOR");
    console.log("Email: mentor@test.com");
    console.log("Password: 123456");

    console.log("\nSTUDENT 1");
    console.log("Email: student1@test.com");
    console.log("Password: 123456");

    console.log("\nSTUDENT 2");
    console.log("Email: student2@test.com");
    console.log("Password: 123456");

    console.log("\nBatch:", batch._id);
    console.log("Assignment:", assignment._id);
    console.log("Submission 1:", submission1._id);
    console.log("Submission 2:", submission2._id);

    await mongoose.disconnect();

    console.log("\nMongoDB disconnected.");
  } catch (error) {
    console.error("SEED ERROR:", error);

    await mongoose.disconnect();

    process.exit(1);
  }
}

seed();