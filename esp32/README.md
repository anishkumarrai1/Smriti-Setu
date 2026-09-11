# SMRITI-SETU ESP32 Hardware Integration Guide (Step 4)

## 📌 ESP32 Pinout Mapping
- **RED Button**: `GPIO 25` (`D25`)
- **GREEN Button**: `GPIO 14` (`D14`)
- **BLUE Button**: `GPIO 27` (`D27`)
- **YELLOW Button**: `GPIO 26` (`D26`)

*(Pin Mode: `INPUT_PULLUP` — Pressed = `LOW`, Released = `HIGH`)*

---

## ⚙️ Configuration Setup
Before uploading `esp32_game_controller.ino` using Arduino IDE:

1. Open `esp32_game_controller/esp32_game_controller.ino`.
2. Update the configuration constants at the top of the file:

```cpp
const char* WIFI_SSID     = "Your_WiFi_SSID";
const char* WIFI_PASSWORD = "Your_WiFi_Password";
const char* SERVER_HOST   = "192.168.1.100"; // Local IP address of host PC
const int   SERVER_PORT   = 5000;            // Express backend port
const char* DEVICE_ID     = "ESP32-NER-GW-001";
```

---

## 🚀 Flashing Instructions
1. Connect your ESP32 board to your PC via USB Type-C.
2. Select **ESP32 Dev Module** in Arduino IDE.
3. Select the COM Port corresponding to your ESP32.
4. Click **Upload**.
5. Open Serial Monitor at **115200 baud**.

---

## 🧪 Testing Verification Protocol
1. Start Backend: `npm run dev --prefix backend`
2. Start Frontend: `npm run dev --prefix frontend`
3. Open Frontend: `http://localhost:3000/smriti-setu/`
4. Expand **Hardware Test Panel** (bottom right floating button).
5. Press physical buttons on ESP32:
   - Press **RED (D25)** → Verified event received in Hardware Test Panel.
   - Press **GREEN (D14)** → Verified event received in Hardware Test Panel.
   - Press **BLUE (D27)** → Verified event received in Hardware Test Panel.
   - Press **YELLOW (D26)** → Verified event received in Hardware Test Panel.
