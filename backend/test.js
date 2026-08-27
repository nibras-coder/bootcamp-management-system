const API_URL = 'http://localhost:5000/api';
let studentToken, adminToken, mentorToken;

async function request(endpoint, options = {}) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  let data;
  try { data = await res.json(); } catch(e) {}
  if (!res.ok) {
    const error = new Error(data?.message || res.statusText);
    error.status = res.status;
    error.response = { status: res.status, data };
    throw error;
  }
  return { status: res.status, data };
}

async function runTests() {
  console.log("Starting Auth Tests...");
  let passed = 0;
  let failed = 0;

  const assert = (condition, msg) => {
    if (condition) {
      console.log(`[PASS] ${msg}`);
      passed++;
    } else {
      console.error(`[FAIL] ${msg}`);
      failed++;
    }
  };

  const studentData = {
    name: `Test Student ${Date.now()}`,
    email: `student${Date.now()}@gmail.com`,
    password: "password123",
    confirmPassword: "password123",
    gender: "Male"
  };

  try {
    // 1. Register Student
    const regRes = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(studentData)
    });
    assert(regRes.status === 201 && regRes.data.user.role === 'student', "Student registration succeeds");

    // 2. Duplicate Registration
    try {
      await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(studentData)
      });
      assert(false, "Duplicate registration should fail");
    } catch (e) {
      assert(e.response && e.response.status === 400, "Duplicate registration fails with 400");
    }

    // 3. Login Student
    const loginRes = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: studentData.email,
        password: studentData.password
      })
    });
    assert(loginRes.status === 200 && loginRes.data.token, "Student login succeeds");
    studentToken = loginRes.data.token;

    // 4. Student Auth Matrix
    const stuHeader = { Authorization: `Bearer ${studentToken}` };
    
    // Student hitting student route
    try {
      const res = await request('/student/dashboard', { headers: stuHeader });
      assert(res.status === 200, "Student accessing student route succeeds");
    } catch(e) { assert(false, "Student accessing student route failed: " + e.message); }

    // Student hitting mentor route
    try {
      await request('/mentor/dashboard', { headers: stuHeader });
      assert(false, "Student accessing mentor route should fail");
    } catch(e) { assert(e.response.status === 403, "Student accessing mentor route returns 403"); }

    // Student hitting admin route
    try {
      await request('/users', { headers: stuHeader });
      assert(false, "Student accessing admin route should fail");
    } catch(e) { assert(e.response.status === 403, "Student accessing admin route returns 403"); }

    // 5. Admin Login (admin@gmail.com elevates role automatically)
    let adminData = {
      name: "Admin User",
      email: "admin@gmail.com",
      password: "password123",
      confirmPassword: "password123",
      gender: "Male"
    };

    // register admin just in case it doesn't exist
    try { 
      await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(adminData)
      }); 
    } catch(e) {}
    
    const adminLoginRes = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: adminData.email,
        password: adminData.password
      })
    });
    assert(adminLoginRes.status === 200 && adminLoginRes.data.user.role === 'admin', "Admin login auto-elevates and succeeds");
    adminToken = adminLoginRes.data.token;
    const adminHeader = { Authorization: `Bearer ${adminToken}` };

    // 6. Admin Auth Matrix
    try {
      const res = await request('/users', { headers: adminHeader });
      assert(res.status === 200, "Admin accessing admin route succeeds");
    } catch(e) { assert(false, "Admin accessing admin route failed: " + e.message); }

    try {
      await request('/mentor/dashboard', { headers: adminHeader });
      assert(false, "Admin accessing mentor route should fail (if strictly mentor)");
    } catch(e) { assert(e.response.status === 403, "Admin accessing mentor route returns 403"); }

    // 7. Admin Create Mentor
    const mentorData = {
      name: `Test Mentor ${Date.now()}`,
      email: `mentor${Date.now()}@gmail.com`,
      password: "password123",
      role: "mentor"
    };
    
    const mentorCreateRes = await request('/users', {
      method: 'POST',
      headers: adminHeader,
      body: JSON.stringify(mentorData)
    });
    assert(mentorCreateRes.status === 201 && mentorCreateRes.data.user.role === 'mentor', "Admin can create mentor");

    // 8. Mentor Login
    const mentorLoginRes = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: mentorData.email,
        password: mentorData.password
      })
    });
    assert(mentorLoginRes.status === 200, "Mentor login succeeds");
    mentorToken = mentorLoginRes.data.token;
    const mentorHeader = { Authorization: `Bearer ${mentorToken}` };

    // 9. Mentor Auth Matrix
    try {
      const res = await request('/mentor/dashboard', { headers: mentorHeader });
      assert(res.status === 200, "Mentor accessing mentor route succeeds");
    } catch(e) { assert(false, "Mentor accessing mentor route failed: " + e.message); }

    try {
      await request('/student/dashboard', { headers: mentorHeader });
      assert(false, "Mentor accessing student route should fail");
    } catch(e) { assert(e.response.status === 403, "Mentor accessing student route returns 403"); }

    try {
      await request('/users', { headers: mentorHeader });
      assert(false, "Mentor accessing admin route should fail");
    } catch(e) { assert(e.response.status === 403, "Mentor accessing admin route returns 403"); }

  } catch (e) {
    console.error("Test execution failed:", e.message);
  }

  console.log(`\nTests Completed. Passed: ${passed}, Failed: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
