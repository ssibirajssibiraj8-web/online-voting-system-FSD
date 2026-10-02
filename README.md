# TN VoteSecure 2026
### Tamil Nadu Assembly Election 2026 — Secure Online Voting Simulation

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115%2B-009688.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19%20%7C%20Vite-61DAFB.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6.svg)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-Aesthetics%20Engine-38B2AC.svg)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-gold.svg)](LICENSE)

---

## ⚠️ Mandatory Educational Simulation Disclaimer
> **TN VoteSecure 2026** is an independent educational software project. It is not an official website, application, or voting system of the Election Commission of India or the Government of Tamil Nadu.
>
> Historical election information is provided for educational and demonstration purposes and should be verified against official Election Commission of India sources.

---

## 🏛️ 1. Project Overview & Election Model

**TN VoteSecure 2026** models the 17th Tamil Nadu Legislative Assembly Election across all **234 Assembly Constituencies**.

### Constitutional Assembly Election Model
In an Indian Legislative Assembly election:
- Citizens vote for candidates contesting their respective Assembly Constituencies.
- The resulting Assembly composition (majority threshold of 118 seats out of 234) determines government formation.
- Citizens **do not** directly vote for the Chief Minister. Major political leaders contest individual constituencies as MLAs while serving as "Major CM-facing political figures".

### Key Election Dates
- **Total Assembly Constituencies:** 234
- **Statewide Polling Phase:** Single Phase
- **Polling Date:** 23 April 2026
- **Counting Date:** 4 May 2026
- **Authoritative Data Source:** Election Commission of India (ECI)

---

## 📊 2. Dual Dataset Architecture: Official vs. Simulation

To prevent confusing real historical election facts with application test votes, the platform enforces strict structural separation between two concepts:

| Dimension | `officialElectionResult` | `simulationVoteResult` |
| :--- | :--- | :--- |
| **Data Nature** | Official ECI 2026 Tamil Nadu returns | User-submitted demonstration ballots |
| **Mutability** | **Read-Only Reference** | **Dynamic Live Ledger** |
| **Total Seats** | 234 Legislative Assembly seats | Per-constituency demo turnout |
| **Storage** | Hardcoded ECI record & API | `VoteBallot` & `VoteParticipation` DB |
| **UI Tab** | Tab 1: "Official 2026 Results" | Tab 2: "Project Simulation Results" |

### Official 2026 Tamil Nadu Assembly Seat Distribution (ECI)
Total Seats: **234** | Simple Majority Threshold: **118**

```
TVK    : 108  (Tamilaga Vettri Kazhagam — Whistle) [Single Largest Party]
DMK    : 59   (Dravida Munnetra Kazhagam — Rising Sun)
ADMK   : 47   (All India Anna Dravida Munnetra Kazhagam — Two Leaves)
INC    : 5    (Indian National Congress — Hand)
PMK    : 4    (Pattali Makkal Katchi — Mango)
IUML   : 2    (Indian Union Muslim League — Ladder)
CPI    : 2    (Communist Party of India — Ears of Corn and Sickle)
VCK    : 2    (Viduthalai Chiruthaigal Katchi — Pot)
CPI(M) : 2    (Communist Party of India [Marxist] — Hammer & Sickle)
BJP    : 1    (Bharatiya Janata Party — Lotus)
DMDK   : 1    (Desiya Murpokku Dravida Kazhagam — Murasu)
AMMK   : 1    (Amma Makkal Munnettra Kazhagam — Pressure Cooker)
-------------------------------------------------------------------
TOTAL  : 234 Seats
```

---

## 🌟 3. Major CM-Facing Political Figures

Candidate information is curated from official Form 7A nominations and Form 26 candidate affidavits:

1. **M. K. Stalin**
   - **Party:** Dravida Munnetra Kazhagam (DMK)
   - **Role:** Party leader / Chief Ministerial figure
   - **Constituency:** Kolathur (#13, Chennai)

2. **C. Joseph Vijay (Vijay)**
   - **Party:** Tamilaga Vettri Kazhagam (TVK)
   - **Role:** Political leader / Chief Ministerial figure
   - **Constituency:** Vikravandi (#75, Viluppuram)

3. **Edappadi K. Palaniswami**
   - **Party:** All India Anna Dravida Munnetra Kazhagam (AIADMK/ADMK)
   - **Role:** Chief Ministerial figure
   - **Constituency:** Edappadi (#86, Salem)

4. **Seeman (Senthamizhan Seeman)**
   - **Party:** Naam Tamilar Katchi (NTK)
   - **Role:** Chief Ministerial figure
   - **Constituency:** Thiruvaiyaru (#173, Thanjavur)

5. **K. Annamalai**
   - **Party:** Bharatiya Janata Party (BJP)
   - **Role:** State Leader / Alliance figure
   - **Constituency:** Coimbatore (South) (#120)

6. **Udhayanidhi Stalin**
   - **Party:** Dravida Munnetra Kazhagam (DMK)
   - **Role:** Deputy Chief Minister / Key Leadership figure
   - **Constituency:** Chepauk-Thiruvallikeni (#19, Chennai)

---

## 🔐 4. Cryptographic Ballot Decoupling & Privacy Model

To eliminate the risk of a voter's ballot being connected to their identity, the architecture completely divorces voter eligibility from ballot recording:

```
                            ┌────────────────────────────┐
                            │    Voter Casts Ballot      │
                            └─────────────┬──────────────┘
                                          │
                        Atomic DB Transaction (SERIALIZABLE)
                                          │
                    ┌─────────────────────┴─────────────────────┐
                    ▼                                           ▼
         ┌─────────────────────┐                     ┌─────────────────────┐
         │  VoteParticipation  │                     │     VoteBallot      │
         ├─────────────────────┤                     ├─────────────────────┤
         │ • election_id       │                     │ • election_id       │
         │ • voter_id          │                     │ • candidate_id      │
         │ • constituency_id   │                     │ • receipt_code      │
         │ • cast_at           │                     │ • receipt_hash      │
         │ [UQ(voter,election)]│                     │ • cast_at           │
         └─────────────────────┘                     │ (ZERO user_id link!)│
         (Strict Double-Voting                       └─────────────────────┘
              Prevention)                                       │
                                                                ▼
                                                     Public Receipt Verifier
                                                    (/api/voting/verify-receipt)
```

1. **VoteParticipation Table:** Confirms that elector `voter_id` participated in `election_id`. Enforced by a unique database constraint `UNIQUE(voter_id, election_id, constituency_id)`.
2. **VoteBallot Table:** Anonymously stores `candidate_id`, `receipt_code` (e.g. `SIM-XXXXXXXX`), and SHA-256 hash. Contains **no reference** to user identity.
3. **Double-Voting Prevention:** Submissions occur in an ACID transaction. Concurrent multi-tab attempts fail safely with HTTP 409 Conflict.

---

## 🛠️ 5. Technology Stack

### Frontend
- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Vanilla CSS + Tailwind CSS
- **Component Primitives:** Accessible custom UI primitives (Dialogs, Buttons, Badges, Selects, Skeletons)
- **Data Visualizations:** Recharts (Seat distribution Bar Chart, Party share Donut Chart)
- **Icons:** Lucide React
- **Themes:** Dual-mode engine supporting dark mode and light mode with ambient geometric SVG guilloche backgrounds.

### Backend
- **Engine:** Python 3.12+ / 3.14 with FastAPI
- **ORM & Data Layer:** SQLAlchemy 2.0
- **Validation:** Pydantic V2 schemas
- **Authentication:** JWT access tokens, refresh token rotation, Argon2id & bcrypt password hashing
- **Security Middleware:** IP hashing, sliding-window rate limiting, HTTP-Only cookies

### Database
- **SQLite:** Zero-setup local development fallback (`voting.db`)
- **PostgreSQL:** Production containerized database

---

## 🚀 6. Installation & Quick Start

### 1. Prerequisites
- Node.js 18+ and npm
- Python 3.12+

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python -m app.utils.seed
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open **http://localhost:5174** in your browser.

### 4. Running Automated Tests
```bash
cd backend
pytest -v
```

---

## 🧭 7. Project Routes Sitemap

| URL Route | Description |
| :--- | :--- |
| `/` | Landing page with 4 CTA buttons, 4 key stats, and Section 45 cards |
| `/elections` | Elections catalog (Tamil Nadu Assembly 2026 & Lok Sabha 2024) |
| `/elections/:idOrSlug` | Constituency browser, candidate affidavits, and leader showcase |
| `/election/2026` | Direct alias for Tamil Nadu 2026 Assembly election overview |
| `/election/2026/candidates` | Candidate directory with affidavits and search |
| `/election/2026/parties` | Political party directory and symbol references |
| `/election/2026/constituencies` | Assembly constituency directory across 38 districts |
| `/results` | Dual-tab results: Official 2026 ECI returns vs Simulation votes |
| `/security` | Public Security Center, Privacy Architecture, and Threat Model |
| `/sources` | ECI data source attribution and strict data integrity standards |
| `/verify` | Public cryptographic SIM-receipt audit verification tool |
| `/login` & `/register` | Voter registration and session authentication |
| `/voter/dashboard` | Voter personal status and constituency ballot eligibility |
| `/admin/dashboard` | Administrative analytics and election governance |

---

## 📄 8. License & Attribution
- **Authoritative Data Source:** Election Commission of India (ECI)
- **Delimitation Gazette:** Delimitation Order of Assembly & Parliamentary Constituencies
- **Software License:** MIT License — Educational and Academic Demonstration Use Only.
