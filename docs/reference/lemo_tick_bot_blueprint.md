# 🧠 Deriv Tick Bot Blueprint — *LemoTick by LemoTech Innovations*

## 📘 Overview
LemoTick is a fully modular, production-ready automated trading bot built for the **Deriv API**. It connects to live tick streams, generates trading signals based on indicators (EMA, RSI, Bollinger Bands), and executes trades with complete risk management and logging.

This document includes the **architecture, API payloads, folder structure, and full roadmap** (epics + user stories + phases).

---

## 🧩 Folder Structure — High-Level
```
LemoTick/
│
├── 📁 src/
│   ├── main.py
│   ├── config.py
│   ├── stream_handler.py
│   ├── strategy_engine.py
│   ├── trade_executor.py
│   ├── risk_manager.py
│   ├── logger.py
│   ├── data_recorder.py
│   ├── utils/
│   │   ├── indicators.py
│   │   └── helpers.py
│
├── 📁 config/
│   ├── settings.yaml
│   ├── credentials.env
│   └── docker.env
│
├── 📁 data/
│   ├── ticks/
│   ├── trades/
│   └── backtests/
│
├── 📁 tests/
│   ├── test_stream.py
│   ├── test_strategy.py
│   ├── test_trade_executor.py
│
├── 📁 docker/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── requirements.txt
│
├── 📁 docs/
│   ├── README.md
│   ├── setup_guide.md
│   └── architecture.md
│
├── 📁 logs/
│   ├── runtime.log
│   └── error.log
│
├── .gitignore
├── requirements.txt
├── LICENSE
└── README.md
```

---

## ⚙️ Deriv API Integration (Proposals + Buy Logic)

### 🎯 Proposal Payload (example: Rise/Fall contract)
```json
{
  "proposal": 1,
  "amount": 1.0,
  "basis": "stake",
  "contract_type": "CALL",
  "currency": "USD",
  "duration": 1,
  "duration_unit": "t",
  "symbol": "R_100"
}
```

### 💰 Buy Payload
```json
{
  "buy": "PROPOSAL_ID",
  "price": 1.0
}
```

The bot will:
1. Stream ticks via `ticks_history` and `ticks`.
2. Send `proposal` when a valid signal is generated.
3. Execute `buy` using the returned `proposal_id`.
4. Track contract via `proposal_open_contract`.

---

## 🧱 Roadmap — From Scratch to Deployment

### 🚀 **Epic 1: Core Bot Infrastructure**
**Goal:** Build foundation for the LemoTick bot engine.

#### User Stories:
1. As a developer, I can connect to the **Deriv WebSocket API** and stream ticks.
2. As a system, I can log ticks into local CSV files for analysis.
3. As a system, I can handle disconnects and reconnect automatically.
4. As a developer, I can manage API credentials securely from `.env`.

#### Deliverables:
- `stream_handler.py` implemented
- WebSocket reconnection logic
- Secure `.env` loading

---

### 📊 **Epic 2: Strategy Engine & Signal Generation**
**Goal:** Implement and validate trading logic.

#### User Stories:
1. As a trader, I can define indicator combinations (EMA, RSI, Bollinger).
2. As a developer, I can plug in and test different signal conditions easily.
3. As a bot, I can emit a clear BUY/SELL/NONE decision per tick.

#### Deliverables:
- `strategy_engine.py` with plug-and-play logic
- `utils/indicators.py` for technical calculations
- Basic backtesting framework

---

### 💸 **Epic 3: Trade Execution Engine**
**Goal:** Integrate proposal + buy API logic.

#### User Stories:
1. As a bot, I can send `proposal` payloads based on generated signals.
2. As a system, I can execute a `buy` trade after validating proposal response.
3. As a trader, I can view trade logs, IDs, and outcomes.

#### Deliverables:
- `trade_executor.py` with error handling
- Full buy/sell JSON payloads tested
- Trade log stored under `/data/trades/`

---

### ⚖️ **Epic 4: Risk & Session Management**
**Goal:** Control risk, avoid overtrading.

#### User Stories:
1. As a user, I can set max daily loss, profit target, and cooldown.
2. As a bot, I stop trading when risk limits are hit.
3. As a developer, I can easily tune parameters in `settings.yaml`.

#### Deliverables:
- `risk_manager.py` with stop-loss logic
- Session profit/loss tracking
- Cooldown between trades

---

### 📦 **Epic 5: Data Recording & Analytics**
**Goal:** Record performance data for analysis.

#### User Stories:
1. As a system, I can record all ticks, signals, and trades to CSV.
2. As a developer, I can generate simple trade performance summaries.

#### Deliverables:
- `data_recorder.py`
- CSV logging and summary function

---

### 🧪 **Epic 6: Testing and Simulation**
**Goal:** Build confidence with unit tests and backtesting.

#### User Stories:
1. As a developer, I can simulate past tick data for testing.
2. As a bot, I can replay data to validate signal accuracy.

#### Deliverables:
- `tests/test_stream.py`, `tests/test_strategy.py`
- Backtest results saved under `/data/backtests/`

---

### 🐳 **Epic 7: Dockerization & Deployment**
**Goal:** Run LemoTick in a containerized environment.

#### User Stories:
1. As a DevOps engineer, I can run the bot with Docker Compose.
2. As a developer, I can manage `.env` and config mounts easily.

#### Deliverables:
- `docker/Dockerfile`
- `docker-compose.yml`
- `docker.env`

---

### 📈 **Epic 8: Monitoring & Dashboard (Future)**
**Goal:** Create a simple UI for real-time monitoring.

#### User Stories:
1. As a trader, I can view live ticks, signals, and trades visually.
2. As a system, I can send status updates to a dashboard.

#### Deliverables:
- Optional React/FastAPI dashboard
- Real-time updates via WebSocket

---

## 🧭 Project Phases Summary

| Phase | Focus | Key Deliverables |
|--------|--------|------------------|
| **Phase 1** | Setup + WebSocket | Base structure, tick streaming |
| **Phase 2** | Strategy + Signals | EMA/RSI/Bollinger logic |
| **Phase 3** | Execution + Risk | Proposal/buy flow, risk manager |
| **Phase 4** | Data + Testing | Record trades, simulate runs |
| **Phase 5** | Deployment | Docker + Compose + Logs |
| **Phase 6** | Monitoring | Dashboard + Visualization |

---

## 🧰 Recommended Tools
| Purpose | Tool |
|----------|------|
| IDE | VS Code (preferred) or PyCharm |
| API Testing | Postman or REST Client (VS Code plugin) |
| Deployment | Docker, Docker Compose |
| Monitoring | Grafana (optional future add-on) |
| Logging | Python `logging` + rotating file handler |

---

### 🏁 Final Notes
- Project name: **LemoTick**  
- Company: **LemoTech Innovations**  
- Stack: Python + Deriv API + Docker  
- Version Control: GitHub (Private recommended)

This roadmap and structure serve as your **official project blueprint** for LemoTick — ensuring scalability, modularity, and professional-grade maintainability.

