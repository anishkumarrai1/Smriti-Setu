import http from 'http';
import app from '../app';

interface TestResult {
  endpoint: string;
  method: string;
  status: number;
  passed: boolean;
  notes: string;
}

const results: TestResult[] = [];

// Helper to make local HTTP requests to a target port
function request(
  port: number,
  path: string,
  method: string = 'GET',
  body?: any,
  headers: Record<string, string> = {}
): Promise<{ status: number; data: any; headers: http.IncomingHttpHeaders }> {
  return new Promise((resolve, reject) => {
    const jsonBody = body ? JSON.stringify(body) : undefined;
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-Platform-Region': 'North-Eastern-Region-India',
          ...(jsonBody ? { 'Content-Length': Buffer.byteLength(jsonBody) } : {}),
          ...headers,
        },
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          let parsed: any;
          try {
            parsed = JSON.parse(raw);
          } catch {
            parsed = raw;
          }
          resolve({ status: res.statusCode || 0, data: parsed, headers: res.headers });
        });
      }
    );

    req.on('error', reject);
    if (jsonBody) req.write(jsonBody);
    req.end();
  });
}

// Check if port 5000 is already active
function checkServerRunning(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port,
        path: '/api/health',
        method: 'GET',
        timeout: 1000,
      },
      (res) => {
        resolve(res.statusCode === 200);
      }
    );
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    req.end();
  });
}

async function runTests() {
  process.env.NODE_ENV = 'test';

  const isDevServerRunning = await checkServerRunning(5000);
  let targetPort = 5000;
  let ephemeralServer: http.Server | null = null;

  if (isDevServerRunning) {
    console.log('Detected active server on port 5000. Running tests against running instance...');
  } else {
    console.log('No active server detected on port 5000. Launching ephemeral test server...');
    ephemeralServer = http.createServer(app);
    await new Promise<void>((resolve) => {
      ephemeralServer!.listen(0, '127.0.0.1', () => {
        const addr = ephemeralServer!.address();
        if (typeof addr === 'object' && addr) {
          targetPort = addr.port;
        }
        resolve();
      });
    });
    console.log(`Ephemeral test server listening on http://127.0.0.1:${targetPort}`);
  }

  try {
    console.log('🧪 Starting Backend API Contract Verification...\n');

    // 1. Health Check
    {
      const res = await request(targetPort, '/api/health');
      const pass = res.status === 200 && res.data.status === 'online';
      results.push({
        endpoint: '/api/health',
        method: 'GET',
        status: res.status,
        passed: pass,
        notes: `Server online, region: ${res.data.region}`,
      });
    }

    // 2. Auth Profile (frontend authApi.getProfile)
    {
      const res = await request(targetPort, '/api/auth/profile');
      const pass =
        res.status === 200 &&
        res.data.id === 'pat-ner-001' &&
        res.data.hierarchy?.state === 'Assam';
      results.push({
        endpoint: '/api/auth/profile',
        method: 'GET',
        status: res.status,
        passed: pass,
        notes: `Returns PatientProfile for ${res.data?.name}`,
      });
    }

    // 3. Patient Details (frontend patientApi.getPatientDetails)
    {
      const res = await request(targetPort, '/api/patients/pat-ner-001');
      const pass = res.status === 200 && res.data.name === 'Ranjit Borthakur';
      results.push({
        endpoint: '/api/patients/:patientId',
        method: 'GET',
        status: res.status,
        passed: pass,
        notes: `Returns patient: ${res.data?.name}, Age: ${res.data?.age}`,
      });
    }

    // 4. Update Patient Profile
    {
      const res = await request(targetPort, '/api/patients/pat-ner-001', 'PATCH', {
        elderlyModeEnabled: true,
      });
      const pass = res.status === 200 && res.data.elderlyModeEnabled === true;
      results.push({
        endpoint: '/api/patients/:patientId',
        method: 'PATCH',
        status: res.status,
        passed: pass,
        notes: 'Successfully updated patient profile fields',
      });
    }

    // 5. Activities (frontend activities store)
    {
      const res = await request(targetPort, '/api/activities');
      const pass =
        res.status === 200 &&
        Array.isArray(res.data) &&
        res.data.length === 5 &&
        res.data[0].type &&
        res.data[0].imageUrl;
      results.push({
        endpoint: '/api/activities',
        method: 'GET',
        status: res.status,
        passed: pass,
        notes: `Returned ${res.data.length} activities with full CognitiveActivity schema`,
      });
    }

    // 6. Memories (frontend memoryApi.getMemories)
    {
      const res = await request(targetPort, '/api/memories?patientId=pat-ner-001');
      const pass =
        res.status === 200 &&
        Array.isArray(res.data) &&
        res.data.length >= 5 &&
        res.data[0].story;
      results.push({
        endpoint: '/api/memories?patientId=pat-ner-001',
        method: 'GET',
        status: res.status,
        passed: pass,
        notes: `Returned ${res.data.length} memory entries`,
      });
    }

    // 7. Create Memory (frontend memoryApi.createMemory)
    let createdMemoryId = '';
    {
      const newMemory = {
        patientId: 'pat-ner-001',
        title: 'Kaziranga Safari with Family',
        year: 2012,
        person: 'Ananya & Grandchildren',
        location: 'Kaziranga National Park, Assam',
        category: 'Family',
        story: 'Early morning elephant safari spotting one-horned rhinos in the mist.',
        tags: ['Kaziranga', 'Assam', 'Wildlife'],
      };
      const res = await request(targetPort, '/api/memories', 'POST', newMemory);
      const pass = res.status === 201 && res.data.id && res.data.title === newMemory.title;
      createdMemoryId = res.data.id;
      results.push({
        endpoint: '/api/memories',
        method: 'POST',
        status: res.status,
        passed: pass,
        notes: `Created new memory: ${res.data.id}`,
      });
    }

    // 8. Delete Memory
    if (createdMemoryId) {
      const res = await request(targetPort, `/api/memories/${createdMemoryId}`, 'DELETE');
      const pass = res.status === 200 && res.data.success === true;
      results.push({
        endpoint: '/api/memories/:id',
        method: 'DELETE',
        status: res.status,
        passed: pass,
        notes: `Deleted temporary memory ${createdMemoryId}`,
      });
    }

    // 9. Submit Game Results (frontend gameApi.submitSessionResult)
    {
      const session = {
        id: `sess-test-${Date.now()}`,
        patientId: 'pat-ner-001',
        activityType: 'memory_match',
        timestamp: new Date().toISOString(),
        accuracyPercentage: 95,
        attemptsCount: 4,
        avgResponseTimeMs: 2500,
        completed: true,
        difficultyLevel: 'easy',
        difficultyAdjusted: false,
      };
      const res = await request(targetPort, '/api/results', 'POST', session);
      const pass =
        res.status === 200 &&
        res.data.success === true &&
        typeof res.data.nextDifficulty === 'string';
      results.push({
        endpoint: '/api/results',
        method: 'POST',
        status: res.status,
        passed: pass,
        notes: `Returns { success: true, nextDifficulty: "${res.data.nextDifficulty}" }`,
      });
    }

    // 10. Get Game Sessions History (frontend gameApi.getSessionHistory)
    {
      const res = await request(targetPort, '/api/sessions?patientId=pat-ner-001');
      const pass = res.status === 200 && Array.isArray(res.data) && res.data.length >= 3;
      results.push({
        endpoint: '/api/sessions?patientId=pat-ner-001',
        method: 'GET',
        status: res.status,
        passed: pass,
        notes: `Returned ${res.data.length} historical game sessions`,
      });
    }

    // 11. ESP32 Device Telemetry (frontend deviceApi.getDeviceTelemetry)
    {
      const res = await request(targetPort, '/api/devices/ESP32-NER-GW-042');
      const pass =
        res.status === 200 &&
        res.data.deviceId === 'ESP32-NER-GW-042' &&
        res.data.hardwareModel === 'ESP32-S3-WROOM-1';
      results.push({
        endpoint: '/api/devices/:deviceId',
        method: 'GET',
        status: res.status,
        passed: pass,
        notes: `Device ${res.data.deviceId}, status: ${res.data.status}`,
      });
    }

    // 12. ESP32 Device Events (frontend deviceApi.getDeviceEvents)
    {
      const res = await request(targetPort, '/api/device-events?deviceId=ESP32-NER-GW-042');
      const pass = res.status === 200 && Array.isArray(res.data) && res.data.length >= 3;
      results.push({
        endpoint: '/api/device-events?deviceId=...',
        method: 'GET',
        status: res.status,
        passed: pass,
        notes: `Returned ${res.data.length} telemetry event logs`,
      });
    }

    // 13. Device Actions (LED, Buzzer, Button)
    {
      const res = await request(
        targetPort,
        '/api/devices/ESP32-NER-GW-042/actions',
        'POST',
        {
          actionType: 'led_toggle',
          color: 'yellow',
        }
      );
      const pass = res.status === 200 && res.data.device?.ledColor === 'yellow';
      results.push({
        endpoint: '/api/devices/:deviceId/actions',
        method: 'POST',
        status: res.status,
        passed: pass,
        notes: `Triggered LED action, new color: ${res.data?.device?.ledColor}`,
      });
    }

    // 14. Reminders (frontend reminderApi.getReminders)
    {
      const res = await request(targetPort, '/api/reminders?patientId=pat-ner-001');
      const pass = res.status === 200 && Array.isArray(res.data) && res.data.length >= 4;
      results.push({
        endpoint: '/api/reminders?patientId=pat-ner-001',
        method: 'GET',
        status: res.status,
        passed: pass,
        notes: `Returned ${res.data.length} scheduled reminders`,
      });
    }

    // 15. Update Reminder (frontend reminderApi.updateReminder)
    {
      const res = await request(targetPort, '/api/reminders/rem-1', 'PATCH', {
        state: 'completed',
      });
      const pass = res.status === 200 && res.data.state === 'completed';
      results.push({
        endpoint: '/api/reminders/:id',
        method: 'PATCH',
        status: res.status,
        passed: pass,
        notes: `Updated reminder state to: ${res.data.state}`,
      });
    }

    // 16. Offline Batch Sync (frontend useSyncStore)
    {
      const syncItems = [
        {
          id: `sync-test-1`,
          action: 'create_memory',
          payload: {
            title: 'Offline Garden Walk',
            year: 2026,
            category: 'Family',
            story: 'Walked in the courtyard in the afternoon.',
          },
          createdAt: new Date().toISOString(),
        },
        {
          id: `sync-test-2`,
          action: 'update_reminder',
          payload: {
            id: 'rem-2',
            state: 'completed',
          },
          createdAt: new Date().toISOString(),
        },
      ];
      const res = await request(targetPort, '/api/sync', 'POST', { items: syncItems });
      const pass = res.status === 200 && res.data.processedCount === 2;
      results.push({
        endpoint: '/api/sync',
        method: 'POST',
        status: res.status,
        passed: pass,
        notes: `Processed ${res.data.processedCount} queued offline items`,
      });
    }

    // 17. Healthcare Facilities (frontend portalService & existing API compatibility)
    {
      const res = await request(targetPort, '/api/facilities');
      const pass =
        res.status === 200 &&
        Array.isArray(res.data) &&
        res.data.length >= 11 &&
        res.data[0].stateCode &&
        res.data[0].services;
      results.push({
        endpoint: '/api/facilities',
        method: 'GET',
        status: res.status,
        passed: pass,
        notes: `Returned ${res.data.length} regional healthcare facilities with full schema`,
      });
    }

    // 18. Filtered Facilities (Government Portal Filter)
    {
      const res = await request(
        targetPort,
        '/api/portal/facilities?state=Assam&hasCognitiveOnly=true'
      );
      const pass =
        res.status === 200 &&
        Array.isArray(res.data) &&
        res.data.every((f: any) => f.state === 'Assam' && f.hasCognitiveCare === true);
      results.push({
        endpoint: '/api/portal/facilities?state=...&hasCognitiveOnly=true',
        method: 'GET',
        status: res.status,
        passed: pass,
        notes: `Filtered ${res.data.length} cognitive care facilities in Assam`,
      });
    }

    // 19. NER States (Government Portal)
    {
      const res = await request(targetPort, '/api/portal/states');
      const pass = res.status === 200 && Array.isArray(res.data) && res.data.length === 8;
      results.push({
        endpoint: '/api/portal/states',
        method: 'GET',
        status: res.status,
        passed: pass,
        notes: `Returned all 8 Northeast Indian states: ${res.data.map((s: any) => s.code).join(', ')}`,
      });
    }

    // 20. Portal Services, Programs, Updates, Resources
    {
      const srvRes = await request(targetPort, '/api/portal/services');
      const progRes = await request(targetPort, '/api/portal/programs');
      const updRes = await request(targetPort, '/api/portal/updates');
      const resRes = await request(targetPort, '/api/portal/resources');

      const pass =
        srvRes.status === 200 &&
        progRes.status === 200 &&
        updRes.status === 200 &&
        resRes.status === 200;
      results.push({
        endpoint: '/api/portal/{services,programs,updates,resources}',
        method: 'GET',
        status: 200,
        passed: pass,
        notes: `Services: ${srvRes.data.length}, Programs: ${progRes.data.length}, Updates: ${updRes.data.length}, Resources: ${resRes.data.length}`,
      });
    }

    // 21. Predefined Cognitive Questions
    {
      const res = await request(targetPort, '/api/questions?activityType=picture_recognition');
      const pass =
        res.status === 200 &&
        Array.isArray(res.data) &&
        res.data.length >= 5 &&
        res.data[0].options?.length === 4;
      results.push({
        endpoint: '/api/questions?activityType=picture_recognition',
        method: 'GET',
        status: res.status,
        passed: pass,
        notes: `Returned ${res.data.length} cultural picture recognition questions with choices`,
      });
    }

    // 22. System Status & Module Health
    {
      const res = await request(targetPort, '/api/system/status');
      const pass =
        res.status === 200 &&
        res.data.allModulesConnected === true &&
        res.data.totalModulesCount >= 10;
      results.push({
        endpoint: '/api/system/status',
        method: 'GET',
        status: res.status,
        passed: pass,
        notes: `All ${res.data.totalModulesCount} modular full-stack services operational`,
      });
    }

    // 23. Caregiver Dashboard Summary & Smart Insights
    {
      const res = await request(targetPort, '/api/dashboard/summary/pat-ner-001');
      const pass =
        res.status === 200 &&
        res.data.patientId === 'pat-ner-001' &&
        res.data.stats?.accuracy &&
        typeof res.data.insight === 'string';
      results.push({
        endpoint: '/api/dashboard/summary/:patientId',
        method: 'GET',
        status: res.status,
        passed: pass,
        notes: `Generated caregiver insight: "${res.data.insight?.substring(0, 40)}..."`,
      });
    }

    // 24. Multilingual Translation Text (Bhashini & NER fallback)
    {
      const res = await request(targetPort, '/api/translate/text', 'POST', {
        text: 'memoryMatch',
        targetLanguage: 'as',
      });
      const pass = res.status === 200 && typeof res.data.translated === 'string';
      results.push({
        endpoint: '/api/translate/text',
        method: 'POST',
        status: res.status,
        passed: pass,
        notes: `Assamese translation: "${res.data.translated}" (source: ${res.data.source})`,
      });
    }

    // 25. Multilingual UI Strings
    {
      const res = await request(targetPort, '/api/translate/ui-strings/as');
      const pass =
        res.status === 200 &&
        res.data.strings?.memoryMatch &&
        Array.isArray(res.data.availableLanguages);
      results.push({
        endpoint: '/api/translate/ui-strings/:languageCode',
        method: 'GET',
        status: res.status,
        passed: pass,
        notes: `Returned UI strings for Assamese, ${res.data.availableLanguages.length} languages supported`,
      });
    }

    // 26. Emotion Check-in & Comfort Mode Trigger
    {
      const res = await request(targetPort, '/api/emotion/check-in', 'POST', {
        patientId: 'pat-ner-001',
        mood: 'sad',
      });
      const pass =
        res.status === 200 &&
        res.data.logged === true &&
        res.data.triggerComfortMode === true &&
        res.data.comfortResponse?.message;
      results.push({
        endpoint: '/api/emotion/check-in',
        method: 'POST',
        status: res.status,
        passed: pass,
        notes: `Triggered comfort mode (${res.data.comfortResponse?.type}): "${res.data.comfortResponse?.message}"`,
      });
    }

    // 27. Emotion Trends & Caregiver Alert
    {
      const res = await request(targetPort, '/api/emotion/trend/pat-ner-001');
      const pass =
        res.status === 200 &&
        res.data.patientId === 'pat-ner-001' &&
        Array.isArray(res.data.entries);
      results.push({
        endpoint: '/api/emotion/trend/:patientId',
        method: 'GET',
        status: res.status,
        passed: pass,
        notes: `Trend entries: ${res.data.totalCheckIns}, low mood count: ${res.data.lowMoodCount}`,
      });
    }

    // 28. Life Timeline Anniversaries / Today
    {
      const res = await request(targetPort, '/api/timeline/today/pat-ner-001?windowDays=365');
      const pass =
        res.status === 200 &&
        res.data.patientId === 'pat-ner-001' &&
        Array.isArray(res.data.matchingEvents);
      results.push({
        endpoint: '/api/timeline/today/:patientId',
        method: 'GET',
        status: res.status,
        passed: pass,
        notes: `Found ${res.data.matchingEvents.length} recurring life milestone events`,
      });
    }

    // 29. Life Timeline All Events
    {
      const res = await request(targetPort, '/api/timeline/all/pat-ner-001');
      const pass =
        res.status === 200 &&
        res.data.patientId === 'pat-ner-001' &&
        Array.isArray(res.data.events) &&
        res.data.count >= 2;
      results.push({
        endpoint: '/api/timeline/all/:patientId',
        method: 'GET',
        status: res.status,
        passed: pass,
        notes: `Returned ${res.data.count} chronological timeline events`,
      });
    }

    // 30. Memory Match Game Log Result
    {
      const res = await request(targetPort, '/api/memory-match/log-result', 'POST', {
        patientId: 'pat-ner-001',
        correct: 8,
        total: 8,
        gridSize: 4,
      });
      const pass =
        res.status === 200 &&
        res.data.saved === true &&
        res.data.entry?.accuracy === 100;
      results.push({
        endpoint: '/api/memory-match/log-result',
        method: 'POST',
        status: res.status,
        passed: pass,
        notes: `Saved session result with accuracy: ${res.data.entry?.accuracy}%`,
      });
    }

    // 31. Memory Match History
    {
      const res = await request(targetPort, '/api/memory-match/history/pat-ner-001');
      const pass =
        res.status === 200 &&
        Array.isArray(res.data.sessions) &&
        res.data.totalSessions >= 3;
      results.push({
        endpoint: '/api/memory-match/history/:patientId',
        method: 'GET',
        status: res.status,
        passed: pass,
        notes: `Returned ${res.data.totalSessions} sessions with avg accuracy: ${res.data.averageAccuracy}%`,
      });
    }

    // 32. Photo Puzzle Validation Check
    {
      const res = await request(targetPort, '/api/puzzle/check', 'POST', {
        puzzleId: 'puzzle_demo_01',
        pieceIndex: 0,
        targetRow: 0,
        targetCol: 0,
      });
      const pass = res.status === 200 && res.data.correct === true;
      results.push({
        endpoint: '/api/puzzle/check',
        method: 'POST',
        status: res.status,
        passed: pass,
        notes: `Validated piece placement (correct: ${res.data.correct}, progress: ${res.data.placedCount}/${res.data.totalPieces})`,
      });
    }

    // 33. Routine Recall Quiz Prompt Generator
    {
      const res = await request(
        targetPort,
        '/api/routine/quiz/pat-ner-001?category=breakfast'
      );
      const pass =
        res.status === 200 &&
        res.data.question &&
        Array.isArray(res.data.options) &&
        res.data.options.length >= 3;
      results.push({
        endpoint: '/api/routine/quiz/:patientId',
        method: 'GET',
        status: res.status,
        passed: pass,
        notes: `Generated quiz: "${res.data.question}" with ${res.data.options.length} options`,
      });
    }

    // 34. Routine Recall Daily Routine Logging
    {
      const res = await request(targetPort, '/api/routine/log', 'POST', {
        patientId: 'pat-ner-001',
        date: '2026-09-04',
        breakfast: 'Poha with tea',
        lunch: 'Rice and masor tenga fish',
        activity: 'Evening garden walk',
      });
      const pass = res.status === 200 && res.data.saved === true;
      results.push({
        endpoint: '/api/routine/log',
        method: 'POST',
        status: res.status,
        passed: pass,
        notes: `Logged daily routine meals and activities`,
      });
    }

    // 35. Family Voice Connect Message List
    {
      const res = await request(targetPort, '/api/voice-messages/list/pat-ner-001');
      const pass =
        res.status === 200 &&
        Array.isArray(res.data.messages) &&
        res.data.count >= 2;
      results.push({
        endpoint: '/api/voice-messages/list/:patientId',
        method: 'GET',
        status: res.status,
        passed: pass,
        notes: `Returned ${res.data.count} family voice messages`,
      });
    }

    // 36. Family Voice Connect Audio Playback Stream
    {
      const res = await request(targetPort, '/api/voice-messages/play/1');
      const pass = res.status === 200 && Boolean(res.headers['content-type']?.includes('audio'));
      results.push({
        endpoint: '/api/voice-messages/play/:messageId',
        method: 'GET',
        status: res.status,
        passed: pass,
        notes: `Streamed audio message, content-type: ${res.headers['content-type']}`,
      });
    }

    // 37. Voice Clone Cloned Voice Samples
    {
      const res = await request(targetPort, '/api/voice-clone/samples/pat-ner-001');
      const pass =
        res.status === 200 &&
        Array.isArray(res.data.samples) &&
        res.data.count >= 1;
      results.push({
        endpoint: '/api/voice-clone/samples/:patientId',
        method: 'GET',
        status: res.status,
        passed: pass,
        notes: `Registered cloned voice profiles: ${res.data.samples.map((s: any) => s.familyMemberName).join(', ')}`,
      });
    }

    // 38. Voice Clone Audio Generation
    {
      const res = await request(targetPort, '/api/voice-clone/generate', 'POST', {
        voiceSampleId: 'sample-priya-daughter',
        text: 'Deuta, it is time for your afternoon medicine.',
        language: 'as',
      });
      const pass =
        res.status === 200 &&
        (res.data.generated === true || Boolean(res.headers['content-type']?.includes('audio')));
      results.push({
        endpoint: '/api/voice-clone/generate',
        method: 'POST',
        status: res.status,
        passed: pass,
        notes: `Generated personalized reminder in family voice (${res.data.familyMemberName || 'XTTS'})`,
      });
    }

    // 39. Reminders Today Action
    {
      const res = await request(targetPort, '/api/reminders/today/pat-ner-001');
      const pass = res.status === 200 && Array.isArray(res.data.pending);
      results.push({
        endpoint: '/api/reminders/today/:patientId',
        method: 'GET',
        status: res.status,
        passed: pass,
        notes: `Returned ${res.data.count} pending reminders for today`,
      });
    }

    // 40. Reminders Adherence Rate
    {
      const res = await request(targetPort, '/api/reminders/adherence/pat-ner-001');
      const pass =
        res.status === 200 &&
        typeof res.data.adherenceRate === 'number' &&
        res.data.total > 0;
      results.push({
        endpoint: '/api/reminders/adherence/:patientId',
        method: 'GET',
        status: res.status,
        passed: pass,
        notes: `Adherence rate: ${res.data.adherenceRate}% (${res.data.done}/${res.data.total} completed)`,
      });
    }

    // 41. Reminders Acknowledge Action
    {
      const res = await request(targetPort, '/api/reminders/acknowledge', 'POST', {
        reminderId: 'rem-1',
      });
      const pass = res.status === 200 && res.data.acknowledged === true;
      results.push({
        endpoint: '/api/reminders/acknowledge',
        method: 'POST',
        status: res.status,
        passed: pass,
        notes: `Acknowledged reminder '${res.data.reminder?.id}' successfully`,
      });
    }


    // Print summary
    console.log('\n================== API VERIFICATION SUMMARY ==================');
    let allPassed = true;
    for (const r of results) {
      const statusIcon = r.passed ? '✅ PASS' : '❌ FAIL';
      if (!r.passed) allPassed = false;
      console.log(
        `${statusIcon} [${r.method.padEnd(6)}] ${r.endpoint.padEnd(45)} -> Status ${r.status} | ${r.notes}`
      );
    }
    console.log('==============================================================\n');

    if (allPassed) {
      console.log(`🎉 ALL ${results.length} ENDPOINTS PERFECTLY MATCH THE FRONTEND CONTRACT!`);
      if (ephemeralServer) ephemeralServer.close();
      process.exit(0);
    } else {
      console.error('❌ SOME TESTS FAILED.');
      if (ephemeralServer) ephemeralServer.close();
      process.exit(1);
    }
  } catch (err) {
    if (ephemeralServer) ephemeralServer.close();
    throw err;
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
