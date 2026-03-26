# LARK – Emergency Detection Simulation

A browser-based simulation of the **LARK ESP32 Smartwatch Emergency Detection System**. This project demonstrates how a wearable device can detect and respond to life-threatening scenarios in real time — no hardware required.

![Status](https://img.shields.io/badge/status-simulation-blue)
![Stack](https://img.shields.io/badge/stack-HTML%20%7C%20CSS%20%7C%20JS-orange)

---

## 🚀 Features

### Sensor Controls
Three interactive sliders simulate real-time sensor data:

| Sensor       | Range     | Unit |
|-------------|----------|------|
| Heart Rate   | 0 – 140   | BPM  |
| Motion       | 0 – 100   | —    |
| Noise Level  | 0 – 120   | dB   |

### Emergency Scenarios

| Scenario             | Trigger Conditions                                      |
|---------------------|---------------------------------------------------------|
| 🫀 **Cardiac Arrest** | Heart rate = 0 **and** motion ≥ 70 (fall detected)      |
| 💥 **Accident**       | Motion ≥ 70 **and** abnormal HR (<50 or >120) **and** noise > 85 dB |
| ⚠️ **Physical Threat** | Heart rate > 120                                         |

### Response Actions
Each scenario triggers a **15-second countdown** followed by automated emergency responses:

- 📞 Emergency guardian call
- 🏥 Medical service notification
- 📍 GPS coordinates broadcast
- 🔔 Nearby LARK device alerts
- 📹 Live camera feed activation (accident & threat scenarios)
- 🚔 Police dispatch (accident & threat scenarios)

### Additional Features
- **Threat prompt** — "Are you safe?" dialog with keyboard shortcuts (`S` = safe, `H` = help)
- **Audio alarms** — Web Audio API-powered alert tones
- **Countdown ring** — Animated SVG countdown with urgency escalation
- **Responsive design** — Works on desktop and mobile
- **Dark glassmorphism UI** — Modern, premium visual design

---

## 📁 Project Structure

```
LARK_simulation/
├── index.html   # Dashboard layout, alert overlays, threat prompt
├── style.css    # Dark theme, glassmorphism, animations
├── script.js    # Scenario detection, countdowns, audio, UI logic
└── README.md    # This file
```

---

## 🛠️ Getting Started

1. **Clone or download** this repository.
2. **Open `index.html`** in any modern browser — no build step or server required.

```bash
# Or serve locally with any static server
npx serve .
```

---

## 🎮 How to Use

1. Adjust the **Heart Rate**, **Motion**, and **Noise Level** sliders.
2. When sensor values match a scenario's trigger conditions, an emergency alert fires.
3. During the **15-second countdown**, press **CANCEL** to abort.
4. If a **Physical Threat** is detected, respond with **"I'm Safe"** or **"Need Help"**.
5. After the countdown, view the simulated emergency actions.
6. Press **RESET SYSTEM** to return to monitoring mode.

---

## 🧰 Tech Stack

- **HTML5** — Semantic markup with SVG icons
- **CSS3** — Custom properties, glassmorphism, keyframe animations
- **Vanilla JavaScript** — IIFE module, Web Audio API, DOM manipulation
- **Google Fonts** — Inter typeface

---

## 📄 License

This project is for educational and demonstration purposes.
