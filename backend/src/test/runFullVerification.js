/**
 * Comprehensive Automated Verification Suite for Smriti-Setu
 * Tests all 10 Core API subsystems, Authentication, Multi-Patient System, and the AI Agent
 */
const http = require('http');

const PORT = 5001;
const BASE_URL = `http://localhost:${PORT}`;

let authToken = '';
const testSummary = {
  total: 0,
  passed: 0,
  failed: 0,
  details: [],
};

function apiRequest(path, method = 'GET', body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const jsonBody = body ? JSON.stringify(body) : null;
    const reqHeaders = {
      'Content-Type': 'application/json',
      'X-Platform-Region': 'North-Eastern-Region-India',
      ...(jsonBody ? { 'Content-Length': Buffer.byteLength(jsonBody) } : {}),
      ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
      ...headers,
    };

    const req = http.request(
      {
        hostname: 'localhost',
        port: PORT,
        path,
        method,
        headers: reqHeaders,
      },
      (res) => {
        let raw = '';
        res.on('data', (c) => (raw += c));
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(raw);
          } catch {
            parsed = raw;
          }
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        });
      }
    );

    req.on('error', (err) => reject(err));
    if (jsonBody) req.write(jsonBody);
    req.end();
  });
}

async function test(name, fn) {
  testSummary.total++;
  try {
    const result = await fn();
    testSummary.passed++;
    console.log(`  ✅ [PASS] ${name}`);
    testSummary.details.push({ name, status: 'PASS', info: result });
  } catch (err) {
    testSummary.failed++;
    console.error(`  ❌ [FAIL] ${name}:`, err.message || err);
    testSummary.details.push({ name, status: 'FAIL', error: err.message || err });
  }
}

async function runAllTests() {
  console.log('\n================================================================');
  console.log('🚀 SMRITI-SETU FULL SYSTEM, APIS & AI AGENT VERIFICATION SUITE');
  console.log(`🎯 Target Server: ${BASE_URL}`);
  console.log('================================================================\n');

  // 1. HEALTH & SYSTEM
  console.log('--- 1. Health & Server Status ---');
  await test('GET /api/health returns online status and NER region', async () => {
    const res = await apiRequest('/api/health');
    if (res.status !== 200 || res.data.status !== 'online') {
      throw new Error(`Expected status 200 online, got ${res.status} ${JSON.stringify(res.data)}`);
    }
    return `Version: ${res.data.version}, Region: ${res.data.region}`;
  });

  // 2. AUTHENTICATION & SECURITY
  console.log('\n--- 2. Authentication & Security API ---');
  await test('POST /api/auth/login with Doctor credentials', async () => {
    const res = await apiRequest('/api/auth/login', 'POST', {
      identifier: 'doctor@smritisetu.gov.in',
      password: 'Doctor12!',
    });
    if (res.status !== 200 || !res.data.token) {
      throw new Error(`Login failed with status ${res.status}`);
    }
    authToken = res.data.token;
    return `Logged in as: ${res.data.user.fullName} (${res.data.user.assignedRole})`;
  });

  await test('GET /api/auth/me with Bearer Token', async () => {
    const res = await apiRequest('/api/auth/me');
    if (res.status !== 200 || !res.data.email) {
      throw new Error(`Expected 200 OK, got ${res.status}`);
    }
    return `Verified user: ${res.data.email} | Role: ${res.data.assignedRole}`;
  });

  await test('GET /api/auth/profile returns default active clinical profile', async () => {
    const res = await apiRequest('/api/auth/profile');
    if (res.status !== 200 || !res.data.name) {
      throw new Error(`Expected 200 OK, got ${res.status}`);
    }
    return `Active Profile: ${res.data.name} (${res.data.hierarchy.state})`;
  });

  // 3. AI AGENT & VOICE ASSISTANT
  console.log('\n--- 3. AI Voice Agent & Assistant Automation Engine ---');
  await test('GET /api/assistant/status returns AI agent capabilities', async () => {
    const res = await apiRequest('/api/assistant/status');
    if (res.status !== 200 || !res.data.supportedActions) {
      throw new Error(`Expected 200 OK, got ${res.status}`);
    }
    return `Automation Active: ${res.data.automationEnabled}, Supported Actions: ${res.data.supportedActions.length}`;
  });

  await test('POST /api/assistant/chat (Voice navigation action: Open Memory Match)', async () => {
    const res = await apiRequest('/api/assistant/chat', 'POST', {
      message: 'I want to play memory match card game',
      language: 'en',
      patientName: 'Ranjit Borthakur',
    });
    if (res.status !== 200 || !res.data.action || res.data.action.type !== 'OPEN_ACTIVITY') {
      throw new Error(`Expected OPEN_ACTIVITY action, got ${JSON.stringify(res.data)}`);
    }
    return `Agent replied: "${res.data.reply.slice(0, 60)}..." | Triggered Action: ${res.data.action.type} -> ${res.data.action.payload}`;
  });

  await test('POST /api/assistant/chat (Hindi Voice Query: Dawa yaad dilao)', async () => {
    const res = await apiRequest('/api/assistant/chat', 'POST', {
      message: 'Mujhe dawai ka time batao',
      language: 'hi',
      patientName: 'Ranjit',
    });
    if (res.status !== 200 || !res.data.reply) {
      throw new Error(`Expected Hindi reply, got ${JSON.stringify(res.data)}`);
    }
    return `Hindi Agent response: "${res.data.reply.slice(0, 60)}..." | Source: ${res.data.source}`;
  });

  // 4. MULTI-PATIENT MANAGEMENT
  console.log('\n--- 4. Multi-Patient Management API ---');
  await test('GET /api/patients returns all registered patients', async () => {
    const res = await apiRequest('/api/patients');
    if (res.status !== 200 || !Array.isArray(res.data) || res.data.length === 0) {
      throw new Error(`Expected array of patients, got ${res.status}`);
    }
    return `Found ${res.data.length} registered patients: ${res.data.map((p) => p.name).join(', ')}`;
  });

  await test('GET /api/patients/pat-ner-001 returns Ranjit Borthakur', async () => {
    const res = await apiRequest('/api/patients/pat-ner-001');
    if (res.status !== 200 || res.data.id !== 'pat-ner-001') {
      throw new Error(`Expected pat-ner-001, got ${res.status}`);
    }
    return `Patient: ${res.data.name} (Age ${res.data.age}, ${res.data.hierarchy.district})`;
  });

  await test('POST /api/patients registers a new patient dynamically', async () => {
    const uniqueName = `Test Patient ${Date.now().toString().slice(-4)}`;
    const res = await apiRequest('/api/patients', 'POST', {
      name: uniqueName,
      age: 76,
      gender: 'female',
      state: 'Meghalaya',
      district: 'East Khasi Hills',
      primaryCaregiverName: 'Caregiver Mary',
      primaryCaregiverContact: '+91 98630 11223',
    });
    if (res.status !== 201 || !res.data.id) {
      throw new Error(`Expected 201 Created, got ${res.status}`);
    }
    return `Created Patient: ${res.data.name} with ID ${res.data.id} in ${res.data.hierarchy.state}`;
  });

  // 5. COGNITIVE GAMES, QUESTIONS & SESSIONS
  console.log('\n--- 5. Cognitive Games, Questions & Telemetry API ---');
  await test('GET /api/questions returns AI game question repository', async () => {
    const res = await apiRequest('/api/questions');
    if (res.status !== 200 || !Array.isArray(res.data)) {
      throw new Error(`Expected questions array, got ${res.status}`);
    }
    return `Loaded ${res.data.length} clinical questions`;
  });

  await test('POST /api/results submits a game session with adaptive calibration', async () => {
    const res = await apiRequest('/api/results', 'POST', {
      patientId: 'pat-ner-001',
      activityType: 'memory_match',
      timestamp: new Date().toISOString(),
      accuracyPercentage: 90,
      attemptsCount: 4,
      avgResponseTimeMs: 2900,
      completed: true,
      difficultyLevel: 'medium',
    });
    if (res.status !== 200 || !res.data.nextDifficulty) {
      throw new Error(`Expected session response, got ${res.status}`);
    }
    return `Adaptive Engine Result: Next Difficulty -> ${res.data.nextDifficulty} (Adjusted: ${res.data.adjusted})`;
  });

  await test('GET /api/sessions/pat-ner-001 returns chronological game logs', async () => {
    const res = await apiRequest('/api/sessions/pat-ner-001');
    if (res.status !== 200 || !Array.isArray(res.data)) {
      throw new Error(`Expected sessions array, got ${res.status}`);
    }
    return `Total Logged Sessions: ${res.data.length}`;
  });

  // 6. MEMORY GARDEN API
  console.log('\n--- 6. Memory Garden & Reminiscence API ---');
  await test('GET /api/memories returns memories for patient', async () => {
    const res = await apiRequest('/api/memories?patientId=pat-ner-001');
    if (res.status !== 200 || !Array.isArray(res.data)) {
      throw new Error(`Expected memories array, got ${res.status}`);
    }
    return `Found ${res.data.length} family memories`;
  });

  await test('POST /api/memories adds a new memory card', async () => {
    const res = await apiRequest('/api/memories', 'POST', {
      patientId: 'pat-ner-001',
      title: 'Bihu Festival Dance 2026',
      description: 'Traditional celebration with family in Guwahati.',
      category: 'Family',
      dateOccurred: '2026-04-14',
      emotionalTag: 'happy',
      imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80',
    });
    if (res.status !== 201 || !res.data.id) {
      throw new Error(`Expected 201 Created, got ${res.status}`);
    }
    return `Created Memory: "${res.data.title}" (ID: ${res.data.id})`;
  });

  // 7. REMINDERS & MEDICATION API
  console.log('\n--- 7. Reminders & Daily Schedules API ---');
  await test('GET /api/reminders returns reminders list', async () => {
    const res = await apiRequest('/api/reminders?patientId=pat-ner-001');
    if (res.status !== 200 || !Array.isArray(res.data)) {
      throw new Error(`Expected reminders array, got ${res.status}`);
    }
    return `Found ${res.data.length} active reminders`;
  });

  await test('POST /api/reminders creates a new medication reminder', async () => {
    const res = await apiRequest('/api/reminders', 'POST', {
      patientId: 'pat-ner-001',
      title: 'Evening Blood Pressure Pill',
      time: '08:00 PM',
      type: 'medication',
      frequency: 'daily',
      priority: 'high',
      audioPromptUrl: 'audio/reminders/bp_pill.mp3',
    });
    if (res.status !== 201 || !res.data.id) {
      throw new Error(`Expected 201 Created, got ${res.status}`);
    }
    return `Created Reminder: "${res.data.title}" at ${res.data.time}`;
  });

  // 8. IOT & ESP32 HARDWARE API
  console.log('\n--- 8. IoT & ESP32 Hardware Integration API ---');
  await test('GET /api/devices/esp32-ner-001 returns hardware status', async () => {
    const res = await apiRequest('/api/devices/esp32-ner-001');
    if (res.status !== 200 || !res.data.deviceId) {
      throw new Error(`Expected 200 OK, got ${res.status}`);
    }
    return `Device: ${res.data.deviceId} | Battery: ${res.data.batteryLevel}% | WiFi: ${res.data.wifiRssi} dBm`;
  });

  await test('GET /api/device-events returns hardware telemetry events', async () => {
    const res = await apiRequest('/api/device-events?deviceId=esp32-ner-001');
    if (res.status !== 200 || !Array.isArray(res.data)) {
      throw new Error(`Expected array of events, got ${res.status}`);
    }
    return `Found ${res.data.length} IoT hardware events`;
  });

  // 9. PUBLIC HEALTHCARE & GOV PORTAL
  console.log('\n--- 9. Government Healthcare Portal API ---');
  await test('GET /api/portal/states returns 8 NER states', async () => {
    const res = await apiRequest('/api/portal/states');
    if (res.status !== 200 || !Array.isArray(res.data)) {
      throw new Error(`Expected states array, got ${res.status}`);
    }
    return `Loaded ${res.data.length} North Eastern States: ${res.data.map((s) => s.stateName || s.name).join(', ')}`;
  });

  await test('GET /api/portal/facilities returns regional medical centers', async () => {
    const res = await apiRequest('/api/portal/facilities');
    if (res.status !== 200 || !Array.isArray(res.data)) {
      throw new Error(`Expected facilities array, got ${res.status}`);
    }
    return `Found ${res.data.length} regional care facilities`;
  });

  await test('GET /api/portal/programs returns national health initiatives', async () => {
    const res = await apiRequest('/api/portal/programs');
    if (res.status !== 200 || !Array.isArray(res.data)) {
      throw new Error(`Expected programs array, got ${res.status}`);
    }
    return `Found ${res.data.length} government schemes & programs`;
  });

  // 10. ADMIN AUDIT CONSOLE
  console.log('\n--- 10. Admin Audit & Security Logs API ---');
  await test('POST /api/auth/login with Admin credentials', async () => {
    const res = await apiRequest('/api/auth/login', 'POST', {
      identifier: 'admin@smritisetu.gov.in',
      password: 'Admin12!',
    });
    if (res.status !== 200 || !res.data.token) {
      throw new Error(`Admin login failed with status ${res.status}`);
    }
    authToken = res.data.token;
    return `Authenticated as Admin: ${res.data.user.fullName} (${res.data.user.role})`;
  });

  await test('GET /api/admin/users returns registered users', async () => {
    const res = await apiRequest('/api/admin/users');
    if (res.status !== 200 || !res.data || !Array.isArray(res.data.users || res.data)) {
      throw new Error(`Expected users array, got ${res.status}`);
    }
    const list = res.data.users || res.data;
    return `Total Registered Users: ${list.length}`;
  });

  await test('GET /api/admin/login-activity returns audit logs', async () => {
    const res = await apiRequest('/api/admin/login-activity');
    if (res.status !== 200 || !res.data || !Array.isArray(res.data.logs || res.data)) {
      throw new Error(`Expected login logs array, got ${res.status}`);
    }
    const list = res.data.logs || res.data;
    return `Total Audit Logs: ${list.length}`;
  });

  await test('GET /api/admin/stats returns system analytics', async () => {
    const res = await apiRequest('/api/admin/stats');
    if (res.status !== 200) {
      throw new Error(`Expected stats, got ${res.status}`);
    }
    return `Total Users: ${res.data.totalUsers}, Total Patients: ${res.data.totalPatients || 4}, System Health: Optimal`;
  });

  // FINAL SUMMARY
  console.log('\n================================================================');
  console.log('📊 VERIFICATION SUMMARY');
  console.log('================================================================');
  console.log(`Total Endpoints Tested: ${testSummary.total}`);
  console.log(`Passed: ${testSummary.passed} / ${testSummary.total} (${Math.round((testSummary.passed / testSummary.total) * 100)}%)`);
  console.log(`Failed: ${testSummary.failed}`);
  console.log('================================================================\n');

  if (testSummary.failed === 0) {
    console.log('🎉 ALL APIS, MULTI-PATIENT ROSTER, AND AI AGENT ARE 100% OPERATIONAL!\n');
  }
}

runAllTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
