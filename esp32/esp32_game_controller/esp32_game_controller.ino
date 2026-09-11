/*
 * SMRITI-SETU Cognitive Gaming Platform — ESP32 Physical Button Controller
 * Firmware Version: v1.0.0-ner-stable
 * 
 * Hardware Pin Mapping:
 * - RED Button    -> GPIO 25 (D25)
 * - GREEN Button  -> GPIO 14 (D14)
 * - BLUE Button   -> GPIO 27 (D27)
 * - YELLOW Button -> GPIO 26 (D26)
 * 
 * Pin Mode: INPUT_PULLUP
 * Active State: LOW (Pressed = LOW, Released = HIGH)
 * 
 * Event Output (JSON via HTTP POST / WebSockets):
 * {
 *   "type": "BUTTON_PRESS",
 *   "button": "RED" | "GREEN" | "BLUE" | "YELLOW",
 *   "deviceId": "ESP32-NER-GW-001",
 *   "timestamp": 1234567890
 * }
 */

#include <WiFi.h>
#include <HTTPClient.h>

// =========================================================================
// CONFIGURATION (UPDATE THESE FOR YOUR NETWORK SETUP)
// =========================================================================
const char* WIFI_SSID     = "Realme P3 5G";       // Your 2.4GHz Wi-Fi SSID
const char* WIFI_PASSWORD = "1234567890-";   // Your Wi-Fi Password
const char* SERVER_HOST   = "10.187.123.2";        // Backend Server IP Address (e.g. PC local IP)
const int   SERVER_PORT   = 5000;                   // Backend Server Port
const char* DEVICE_ID     = "ESP32-NER-GW-001";     // Unique Controller Device ID

// Endpoint path on Smriti-Setu Backend
const char* ACTION_ENDPOINT = "/api/devices/emit-test-button";

// =========================================================================
// WI-FI RECONNECT & TIMEOUT CONFIGURATION
// =========================================================================
const unsigned long WIFI_CONNECT_TIMEOUT_MS    = 12000; // 12s allowed for connection handshake
const unsigned long WIFI_RECONNECT_INTERVAL_MS  = 6000;  // 6s wait between reconnect attempts

// Wi-Fi connection state tracking
bool isWiFiConnecting = false;
unsigned long connectStartMs = 0;
unsigned long lastAttemptMs = 0;

// =========================================================================
// HARDWARE PIN DEFINITIONS
// =========================================================================
const int PIN_RED    = 25; // D25
const int PIN_GREEN  = 14; // D14
const int PIN_BLUE   = 27; // D27
const int PIN_YELLOW = 26; // D26

// Debounce settings
const unsigned long DEBOUNCE_DELAY_MS = 50; // 50ms software debounce

// Structure for Button State Tracking
struct PhysicalButton {
  int pin;
  const char* name;
  bool lastReading;
  bool stableState;
  unsigned long lastDebounceTime;
};

PhysicalButton buttons[] = {
  { PIN_RED,    "RED",    HIGH, HIGH, 0 },
  { PIN_GREEN,  "GREEN",  HIGH, HIGH, 0 },
  { PIN_BLUE,   "BLUE",   HIGH, HIGH, 0 },
  { PIN_YELLOW, "YELLOW", HIGH, HIGH, 0 }
};

const int NUM_BUTTONS = sizeof(buttons) / sizeof(buttons[0]);

// Non-blocking Wi-Fi Connection Manager
void checkWiFiConnection() {
  unsigned long now = millis();

  // 1. If already connected, reset connecting status & log if freshly connected
  if (WiFi.status() == WL_CONNECTED) {
    if (isWiFiConnecting || lastAttemptMs == 0) {
      isWiFiConnecting = false;
      Serial.println("\n[Wi-Fi] 🟢 Connected successfully!");
      Serial.print("[Wi-Fi] IP Address: ");
      Serial.println(WiFi.localIP());
    }
    return;
  }

  // 2. If currently attempting a connection, evaluate non-blocking timeout
  if (isWiFiConnecting) {
    if (now - connectStartMs > WIFI_CONNECT_TIMEOUT_MS) {
      isWiFiConnecting = false;
      lastAttemptMs = now;
      Serial.println("\n[Wi-Fi] ❌ Connection attempt failed (timed out).");
      Serial.printf("[Wi-Fi] Retrying in %lu seconds...\n", WIFI_RECONNECT_INTERVAL_MS / 1000);
      
      // Explicitly disconnect ESP32 station driver to clear stuck connection state
      WiFi.disconnect(true);
    }
    return; // Allow main loop & button scanner to run without blocking
  }

  // 3. If disconnected and retry cooldown interval has elapsed, trigger new attempt
  if (lastAttemptMs == 0 || (now - lastAttemptMs >= WIFI_RECONNECT_INTERVAL_MS)) {
    isWiFiConnecting = true;
    connectStartMs = now;
    lastAttemptMs = now;

    Serial.print("[Wi-Fi] Connecting to: ");
    Serial.println(WIFI_SSID);

    // Reset Station driver before issuing new begin call to prevent "sta is connecting" error
    WiFi.disconnect(true);
    delay(50);
    WiFi.mode(WIFI_STA);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  }
}

// Function to send normalized button press event to backend
void sendButtonPressEvent(const char* buttonName) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[HTTP] Cannot send event: Wi-Fi disconnected");
    return;
  }

  HTTPClient http;
  String url = "http://" + String(SERVER_HOST) + ":" + String(SERVER_PORT) + String(ACTION_ENDPOINT);

  http.begin(url);
  http.addHeader("Content-Type", "application/json");

  // Construct normalized JSON payload
  String payload = "{";
  payload += "\"type\":\"BUTTON_PRESS\",";
  payload += "\"button\":\"" + String(buttonName) + "\",";
  payload += "\"deviceId\":\"" + String(DEVICE_ID) + "\",";
  payload += "\"timestamp\":" + String(millis());
  payload += "}";

  Serial.print("[HTTP] Sending event to ");
  Serial.print(url);
  Serial.print(" -> ");
  Serial.println(payload);

  int httpCode = http.POST(payload);

  if (httpCode > 0) {
    Serial.printf("[HTTP] POST Response code: %d\n", httpCode);
  } else {
    Serial.printf("[HTTP] POST failed, error: %s\n", http.errorToString(httpCode).c_str());
  }

  http.end();
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n========================================================");
  Serial.println(" SMRITI-SETU ESP32 COGNITIVE GAME CONTROLLER FIRMWARE  ");
  Serial.println("========================================================");

  // Configure Button Pins with INPUT_PULLUP
  for (int i = 0; i < NUM_BUTTONS; i++) {
    pinMode(buttons[i].pin, INPUT_PULLUP);
    buttons[i].lastReading = digitalRead(buttons[i].pin);
    buttons[i].stableState = buttons[i].lastReading;
    Serial.printf("[HW] Pin D%d initialized for %s button (INPUT_PULLUP)\n", buttons[i].pin, buttons[i].name);
  }

  // Initialize Wi-Fi Station stack cleanly
  WiFi.persistent(false);
  WiFi.mode(WIFI_STA);
  WiFi.disconnect(true);
  delay(100);

  // Trigger initial Wi-Fi connection
  checkWiFiConnection();
}

void loop() {
  // Maintain Wi-Fi Connection asynchronously
  checkWiFiConnection();

  unsigned long now = millis();

  // Scan physical buttons with software debounce & state-change edge detection
  for (int i = 0; i < NUM_BUTTONS; i++) {
    bool currentReading = digitalRead(buttons[i].pin);

    // Check if raw pin reading changed (bounce or real press)
    if (currentReading != buttons[i].lastReading) {
      buttons[i].lastDebounceTime = now;
    }

    // Process state change after debounce delay
    if ((now - buttons[i].lastDebounceTime) > DEBOUNCE_DELAY_MS) {
      if (currentReading != buttons[i].stableState) {
        buttons[i].stableState = currentReading;

        // Active LOW transition: State changed to LOW means button was pressed!
        if (buttons[i].stableState == LOW) {
          Serial.printf("\n[HW] 🔘 Physical Button Pressed: %s (D%d)\n", buttons[i].name, buttons[i].pin);
          sendButtonPressEvent(buttons[i].name);
        } else {
          Serial.printf("[HW] 🔘 Physical Button Released: %s (D%d)\n", buttons[i].name, buttons[i].pin);
        }
      }
    }

    buttons[i].lastReading = currentReading;
  }

  // Short delay for high-responsiveness loop
  delay(10);
}
