# Deriv Real-Time Integration Guide

## 🎯 Overview

This document explains the complete real-time data flow from Deriv's trading platform through to the frontend dashboard. This enables investors to see live market data, trade updates, and portfolio performance in real-time.

## 📊 Architecture

```
Deriv WebSocket API
        ↓
   Bot (Python)
        ↓
  Backend (.NET) ← SignalR Hub
        ↓
  Frontend (React)
```

## 🔧 Components

### 1. **Bot Layer** (Python)

**File:** `bot/src/integrations/backend_client.py`

The bot receives real-time data from Deriv and pushes it to the backend:

- `push_tick_update()` - Market price updates
- `push_trade_opened()` - New trade notifications
- `push_trade_closed()` - Closed trade notifications  
- `push_portfolio_update()` - Portfolio performance updates
- `push_balance_update()` - Account balance updates

### 2. **Backend Layer** (.NET)

#### **SignalR Hub**
**File:** `backend/API/Hubs/TradingHub.cs`

Manages WebSocket connections with frontend clients:
- Handles investor connections/disconnections
- Manages portfolio subscriptions
- Groups clients for targeted broadcasts

#### **Broadcast Service**
**File:** `backend/API/Services/TradingBroadcastService.cs`

Broadcasts real-time updates to connected clients via SignalR:
- `BroadcastTickUpdate()` - Sends tick data to all clients
- `BroadcastTradeOpened()` - Notifies investor of new trade
- `BroadcastTradeClosed()` - Notifies investor of closed trade
- `BroadcastPortfolioUpdate()` - Updates portfolio metrics
- `BroadcastAccountBalance()` - Updates account balance

#### **Webhook Controller**
**File:** `backend/API/Controllers/DerivWebhookController.cs`

Receives data from the bot and triggers broadcasts:

**Endpoints:**
- `POST /api/derivwebhook/tick` - Receive tick updates
- `POST /api/derivwebhook/trade/opened` - Receive trade opened
- `POST /api/derivwebhook/trade/closed` - Receive trade closed
- `POST /api/derivwebhook/portfolio/update` - Receive portfolio updates
- `POST /api/derivwebhook/balance` - Receive balance updates

### 3. **Frontend Layer** (React)

#### **Trading Service**
**File:** `frontend/src/services/tradingService.ts`

SignalR client that connects to the TradingHub:
- Manages WebSocket connection
- Handles automatic reconnection
- Provides event subscription methods
- Manages portfolio subscriptions

#### **React Hook**
**File:** `frontend/src/hooks/useTradingUpdates.ts`

Provides easy-to-use React hooks:
- `useTradingUpdates()` - Main hook for real-time data
- `useTradingCallbacks()` - Custom callback hook

#### **Live Trading Widget**
**File:** `frontend/src/features/dashboard/components/LiveTradingWidget.tsx`

Visual component that displays real-time data:
- Connection status indicator
- Latest tick prices with mini chart
- Account balance updates
- Recent trade notifications
- Portfolio performance metrics

## 🚀 Usage

### Backend Setup

1. **TradingHub is automatically configured** in `Program.cs`:
```csharp
app.MapHub<TradingHub>("/tradingHub");
```

2. **Service registration**:
```csharp
builder.Services.AddSingleton<ITradingBroadcastService, TradingBroadcastService>();
```

### Bot Integration

To push data from the bot to the backend:

```python
# Initialize backend client
backend_client = BackendClient(config.get('backend', {}))
await backend_client.connect()

# Push tick update
await backend_client.push_tick_update(
    symbol="R_100",
    price=1234.56,
    timestamp=int(time.time())
)

# Push trade opened
await backend_client.push_trade_opened({
    'investorId': 'investor-id',
    'portfolioId': 'portfolio-uuid',
    'tradeId': 'trade-id',
    'symbol': 'R_100',
    'direction': 'CALL',
    'stake': 10.0,
    'status': 'OPEN',
    'timestamp': datetime.utcnow().isoformat()
})

# Push balance update
await backend_client.push_balance_update(
    investor_id='investor-id',
    balance=1000.50,
    currency='USD'
)
```

### Frontend Usage

#### **Option 1: Use the Hook**
```typescript
import { useTradingUpdates } from '@/hooks/useTradingUpdates'

function MyComponent() {
  const {
    isConnected,
    latestTick,
    latestTrade,
    portfolioUpdate,
    balance,
    subscribeToPortfolio
  } = useTradingUpdates()

  // Subscribe to specific portfolio
  useEffect(() => {
    if (portfolioId) {
      subscribeToPortfolio(portfolioId)
    }
  }, [portfolioId, subscribeToPortfolio])

  return (
    <div>
      {isConnected && <p>Connected!</p>}
      {latestTick && <p>Price: {latestTick.price}</p>}
    </div>
  )
}
```

#### **Option 2: Use Custom Callbacks**
```typescript
import { useTradingCallbacks } from '@/hooks/useTradingUpdates'

function MyComponent() {
  useTradingCallbacks({
    onTickUpdate: (tick) => {
      console.log('New tick:', tick.price)
    },
    onTradeOpened: (trade) => {
      toast.success(`Trade opened: ${trade.symbol}`)
    },
    onTradeClosed: (trade) => {
      const profit = trade.profit || 0
      toast.info(`Trade closed: ${profit > 0 ? 'Profit' : 'Loss'} $${Math.abs(profit)}`)
    },
    onBalanceUpdate: (balance) => {
      console.log('New balance:', balance.balance)
    }
  })

  return <div>...</div>
}
```

#### **Option 3: Use the Pre-built Widget**
```typescript
import { LiveTradingWidget } from '@/features/dashboard/components/LiveTradingWidget'

function DashboardPage() {
  return (
    <div>
      <LiveTradingWidget />
    </div>
  )
}
```

## 📡 Data Flow Example

### 1. **Tick Update Flow**

```
1. Deriv sends tick via WebSocket → Bot receives
2. Bot processes tick → Calls backend_client.push_tick_update()
3. Backend receives POST /api/derivwebhook/tick
4. TradingBroadcastService broadcasts via SignalR
5. Frontend TradingService receives "ReceiveTickUpdate" event
6. React components update with new tick data
7. LiveTradingWidget displays new price and chart
```

### 2. **Trade Opened Flow**

```
1. Bot executes trade on Deriv
2. Bot calls backend_client.push_trade_opened()
3. Backend receives POST /api/derivwebhook/trade/opened
4. TradingBroadcastService broadcasts to:
   - Specific investor group
   - Portfolio subscribers
   - All trades group (admin)
5. Frontend receives "ReceiveTradeOpened" event
6. Components show notification and update trade list
```

## 🔒 Security

- **Authentication**: TradingHub requires JWT authentication
- **Authorization**: Investors only see their own data (via groups)
- **Bot → Backend**: Should use API key authentication (TODO)
- **CORS**: Configured for localhost development

## 🧪 Testing

### Test Real-Time Connection

1. **Start Backend**:
```bash
cd backend/API
dotnet run
```

2. **Start Frontend**:
```bash
cd frontend
npm run dev
```

3. **Start Bot**:
```bash
cd bot
python run_bot.py
```

4. **Check Connection**:
   - Open browser DevTools → Network → WS
   - Should see connection to `/tradingHub`
   - Status should show "Connected" in Live Trading Widget

### Test Data Flow

Send test data from bot:
```python
import asyncio
from integrations.backend_client import BackendClient

async def test():
    client = BackendClient({'backend_url': 'http://localhost:5000'})
    await client.connect()
    
    # Test tick update
    await client.push_tick_update('R_100', 1234.56, int(time.time()))
    
    await client.disconnect()

asyncio.run(test())
```

## 📝 Configuration

### Backend Configuration (`appsettings.json`)

SignalR is automatically configured. No additional settings needed.

### Frontend Configuration (`constants.ts`)

```typescript
export const SIGNALR_HUB_URL = import.meta.env.VITE_SIGNALR_HUB_URL || 'https://localhost:7001'
```

### Bot Configuration (`config/settings.yaml`)

Add backend configuration:
```yaml
backend:
  backend_url: http://localhost:5000
  backend_api_key: your-api-key-here  # Optional
```

## 🐛 Troubleshooting

### Connection Issues

**Problem**: Frontend shows "Disconnected"

**Solutions**:
1. Check backend is running
2. Verify CORS settings in `Program.cs`
3. Check JWT token is valid
4. Check browser console for errors

### Data Not Updating

**Problem**: Widget shows "Connected" but no data

**Solutions**:
1. Verify bot is running and connected to Deriv
2. Check bot logs for errors pushing to backend
3. Verify backend webhook endpoints are receiving data
4. Check SignalR broadcast logs in backend

### Authorization Errors

**Problem**: 401 Unauthorized on SignalR connection

**Solutions**:
1. Ensure user is logged in
2. Check JWT token in localStorage
3. Verify token hasn't expired
4. Check TradingHub has `[Authorize]` attribute

## 🎨 Customization

### Add New Real-Time Events

1. **Add method to `BackendClient.py`**:
```python
async def push_custom_event(self, data: Dict[str, Any]) -> bool:
    async with self.session.post('/api/derivwebhook/custom', json=data) as response:
        return response.status == 200
```

2. **Add endpoint to `DerivWebhookController.cs`**:
```csharp
[HttpPost("custom")]
public async Task<IActionResult> ReceiveCustomEvent([FromBody] CustomRequest request)
{
    await _broadcastService.BroadcastCustomEvent(request);
    return Ok();
}
```

3. **Add broadcast method to `TradingBroadcastService.cs`**:
```csharp
public async Task BroadcastCustomEvent(object data)
{
    await _hubContext.Clients.All.SendAsync("ReceiveCustomEvent", data);
}
```

4. **Handle in frontend `tradingService.ts`**:
```typescript
this.connection.on('ReceiveCustomEvent', (data) => {
  console.log('Custom event:', data)
  // Handle event
})
```

## 📚 Related Documentation

- [SignalR Documentation](https://learn.microsoft.com/en-us/aspnet/core/signalr/)
- [Deriv WebSocket API](https://api.deriv.com/)
- [Bot Integration Guide](./BOT_MANAGEMENT_SYSTEM.md)

## ✅ Summary

The real-time integration is now complete:

- ✅ Bot pushes data to backend
- ✅ Backend broadcasts via SignalR
- ✅ Frontend connects and displays live data
- ✅ Auto-reconnection on disconnect
- ✅ Secure (JWT authentication)
- ✅ Scalable (SignalR groups)
- ✅ User-friendly (Live Trading Widget)

Your frontend is now fully integrated with Deriv for real-time trading updates! 🎉

