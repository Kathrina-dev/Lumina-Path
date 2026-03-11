# Lumina Path 🌙✨  
### Safe Night Navigation for Women

**Lumina Path** is a safety-focused navigation platform designed to help **women travel more confidently at night**. Unlike traditional navigation apps that only prioritize the fastest or shortest route, Lumina Path identifies **safer paths using lighting conditions, crowd density, and safety checkpoints**.

Developed during a **Women’s Day Hackathon**, Lumina Path aims to empower women with tools that support **safer mobility, awareness, and quick access to help when needed**.

---

# 🚨 The Problem

For many women, traveling at night can be stressful and uncertain — especially in unfamiliar areas.

Traditional navigation apps focus only on **distance and travel time**, ignoring factors that directly impact **personal safety**.

Common concerns include:

- Poorly lit streets
- Isolated routes
- Lack of real-time safety awareness
- No way to identify safer checkpoints along the journey

Women often rely on **intuition or guesswork instead of data** when choosing routes at night.

---

# ✨ Our Solution

Lumina Path provides **safety-aware navigation** designed with women’s safety in mind.

Instead of simply showing the fastest route, Lumina Path helps users:

- Avoid poorly lit and isolated streets
- Navigate through **well-lit and more populated areas**
- Identify **critical safety points along their route**
- Access emergency support quickly if needed

Our goal is to make night travel **smarter, safer, and more empowering**.

---

# 🚀 Key Features

## 🛣 Safe Route Navigation
Lumina Path identifies the **safest available route**, prioritizing streets that are better lit and more active instead of simply selecting the fastest path.

---

## 📍 Critical Safety Points
The system highlights **important safety checkpoints along the route**, such as:

- Well-lit streets
- Areas with higher pedestrian activity
- Safer intersections or checkpoints

This helps users stay aware of **safer spaces nearby while traveling**.

---

## 🚨 SOS Emergency Support
A **one-tap SOS button** allows users to quickly initiate an emergency call in unsafe situations.

This feature ensures **immediate access to help when it matters most**.

---

## 📝 Community Safety Reporting
Users can **report unsafe locations or areas of concern**, helping create a **community-driven safety map** that benefits other women.

Collective reporting makes cities **safer through shared awareness**.

---

## ⚙ Route Preference Options
Users can customize how routes are calculated:

- **Safest** – prioritizes safety factors
- **Balanced** – balances safety and travel time
- **Fastest** – shortest travel time

This flexibility allows users to **choose what works best for their situation**.

---

# 🛠 Technology Stack

## Frontend
- **Next.js**
- **React**
- **React Leaflet**
- **OpenStreetMap**

## Backend
- REST APIs for safety data
- Route processing logic
- Safety score calculations

## APIs & Services
- **Browser Geolocation API**
- **OpenStreetMap Map Tiles**

---

# 🏗 Architecture Overview

Lumina Path follows a **client–server architecture**.

1. The **frontend** provides an interactive map interface.
2. When a user selects a route or location, coordinates are sent to the **backend APIs**.
3. The backend performs **safety analysis**, evaluating lighting and crowd conditions.
4. Results are returned as **JSON responses** and visualized on the map.
