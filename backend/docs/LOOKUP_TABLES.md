# Lookup Tables Documentation

## Overview

Lookup tables have been implemented to replace hardcoded enum values with database-backed reference data. This provides better maintainability, descriptions, and the ability to manage reference data without code changes.

## Implementation Date
November 15, 2025

---

## Database Tables Created

All lookup tables inherit from a base structure with the following fields:
- `Id` (int, manually assigned to match enum values)
- `Name` (string, max 50 chars)
- `Description` (string, max 200 chars, nullable)
- `IsActive` (bool, defaults to true)
- `DisplayOrder` (int, for UI sorting)

### Complete List of Lookup Tables

| Table Name | Enum Source | Record Count | Purpose |
|------------|-------------|--------------|---------|
| `InvestorStatusLookup` | `InvestorStatus` | 8 | Investor account statuses |
| `UserRoleLookup` | `UserRole` | 5 | User role types (RBAC) |
| `PortfolioStatusLookup` | `PortfolioStatus` | 4 | Portfolio statuses |
| `RiskLevelLookup` | `RiskLevel` | 3 | Risk profile levels |
| `TradeTypeLookup` | `TradeType` | 4 | Order types (Market, Limit, Stop, etc.) |
| `TradeDirectionLookup` | `TradeDirection` | 2 | Buy/Sell direction |
| `TradeStatusLookup` | `TradeStatus` | 4 | Trade execution statuses |
| `TransactionTypeLookup` | `TransactionType` | 5 | Transaction types |
| `TransactionStatusLookup` | `TransactionStatus` | 4 | Transaction processing statuses |
| `NotificationTypeLookup` | `NotificationType` | 10 | Notification categories |
| `NotificationPriorityLookup` | `NotificationPriority` | 4 | Notification priorities |
| `DocumentTypeLookup` | `KYCDocumentType` | 6 | KYC document types |
| `DocumentStatusLookup` | `KYCDocumentStatus` | 5 | Document verification statuses |
| `SARStatusLookup` | `SARStatus` | 6 | Suspicious Activity Report statuses |
| `FeeTypeLookup` | `FeeType` | 4 | Fee categories |
| `FeeStatusLookup` | `FeeStatus` | 4 | Fee processing statuses |

---

## API Endpoints

### Get All Lookups (Single Request)
```http
GET /api/Lookups/all
```

Returns all active lookup values in a single response. Perfect for initializing frontend dropdown caches.

**Response Example:**
```json
{
  "investorStatuses": [
    { "id": 0, "name": "Pending", "description": "Account pending activation" },
    { "id": 1, "name": "Active", "description": "Active investor account" },
    ...
  ],
  "userRoles": [...],
  "portfolioStatuses": [...],
  // ... all other lookup types
}
```

### Individual Lookup Endpoints

Each lookup table has its own endpoint:

```http
GET /api/Lookups/investor-statuses
GET /api/Lookups/user-roles
GET /api/Lookups/portfolio-statuses
GET /api/Lookups/risk-levels
GET /api/Lookups/trade-types
GET /api/Lookups/trade-directions
GET /api/Lookups/trade-statuses
GET /api/Lookups/transaction-types
GET /api/Lookups/transaction-statuses
GET /api/Lookups/notification-types
GET /api/Lookups/notification-priorities
GET /api/Lookups/document-types
GET /api/Lookups/document-statuses
GET /api/Lookups/sar-statuses
GET /api/Lookups/fee-types
GET /api/Lookups/fee-statuses
```

---

## Technical Details

### Entity Configuration

All lookup tables are configured with:
- **Manual ID assignment**: `.ValueGeneratedNever()` to allow ID values starting from 0
- **Seeded data**: Pre-populated with enum values and descriptions
- **Indexed**: Primary key on `Id` field

### Code Generation Strategy

IDs are manually assigned to match the integer values of their corresponding enums. This ensures:
1. Easy mapping between enum values and lookup table IDs
2. No need for complex conversion logic
3. Backward compatibility with existing code using enums

### Example: InvestorStatus

```csharp
// Enum (still exists in code for type safety)
public enum InvestorStatus
{
    Pending = 0,
    Active = 1,
    Suspended = 2,
    Closed = 3,
    KYCRequired = 4,
    KYCPending = 5,
    KYCApproved = 6,
    KYCDenied = 7
}

// Lookup Table (database)
InvestorStatusLookup
- Id: 0, Name: "Pending", Description: "Account pending activation"
- Id: 1, Name: "Active", Description: "Active investor account"
- ...
```

---

## Benefits

### 1. **Descriptive Information**
Each lookup value includes a human-readable description, making it easier for users to understand options without referring to documentation.

### 2. **UI-Friendly**
- `DisplayOrder` field allows custom sorting for dropdowns
- `IsActive` flag enables soft deletion of deprecated values
- Descriptions can be displayed as tooltips

### 3. **Maintainability**
- Add new values without code changes (for extensible enums)
- Update descriptions without redeployment
- Deactivate obsolete values without breaking existing data

### 4. **Internationalization Ready**
The structure supports future localization by adding language-specific description columns.

### 5. **Audit Trail**
Database-backed lookups can be extended with audit fields (CreatedAt, ModifiedAt, etc.) if needed.

---

## Frontend Integration Guide

### React/TypeScript Example

```typescript
// Type definitions
interface LookupValue {
  id: number;
  name: string;
  description: string;
}

interface AllLookups {
  investorStatuses: LookupValue[];
  userRoles: LookupValue[];
  portfolioStatuses: LookupValue[];
  // ... other lookup types
}

// Fetch all lookups on app initialization
const fetchLookups = async (): Promise<AllLookups> => {
  const response = await fetch('http://localhost:5000/api/Lookups/all');
  return response.json();
};

// Store in context/redux for app-wide access
const LookupsContext = React.createContext<AllLookups | null>(null);

// Use in components
const InvestorStatusDropdown = () => {
  const lookups = useContext(LookupsContext);
  
  return (
    <select>
      {lookups?.investorStatuses.map(status => (
        <option key={status.id} value={status.id} title={status.description}>
          {status.name}
        </option>
      ))}
    </select>
  );
};
```

---

## Database Migration

**Migration Name:** `20251115111524_AddLookupTables`

### Applied Changes:
1. Created 16 lookup tables with base schema
2. Seeded all tables with initial data
3. Configured manual ID assignment for all tables

### Rollback Instructions:
```bash
cd backend/API
dotnet ef database update <previous-migration-name> --project ../Infrastructure --startup-project .
```

---

## Best Practices

### For Developers:

1. **Keep Enums in Code**: Don't remove the enum definitions. They provide type safety and IntelliSense in C# code.

2. **Sync Enum Changes**: If you add a new enum value, remember to also insert it into the corresponding lookup table.

3. **Use Lookups for UI Only**: Business logic should continue using enums. Lookups are primarily for UI dropdowns and display purposes.

4. **Cache Lookups**: Frontend applications should fetch and cache all lookups on startup rather than requesting them repeatedly.

### For Frontend:

1. **Single Request**: Use `/api/Lookups/all` to fetch all lookup data in one request during app initialization.

2. **Display Descriptions**: Show descriptions as tooltips or help text to improve UX.

3. **Respect IsActive**: Only display lookup values where `IsActive = true`.

4. **Sort by DisplayOrder**: Use the `DisplayOrder` field for consistent ordering across the application.

---

## Adding New Lookup Tables

If you need to add a new lookup table in the future:

1. **Create the entity** in `Core/Entities/LookupTables.cs`:
```csharp
public class MyNewLookup : LookupBase { }
```

2. **Add to DbContext** in `Infrastructure/Data/ApplicationDbContext.cs`:
```csharp
public DbSet<MyNewLookup> MyNewLookup { get; set; }
```

3. **Configure and seed** in `ApplicationDbContext.OnModelCreating`:
```csharp
modelBuilder.Entity<MyNewLookup>().Property(e => e.Id).ValueGeneratedNever();
modelBuilder.Entity<MyNewLookup>().HasData(
    new MyNewLookup { Id = 0, Name = "Value1", Description = "...", DisplayOrder = 1 },
    // ... more values
);
```

4. **Create migration**:
```bash
dotnet ef migrations add AddMyNewLookup --project ../Infrastructure --startup-project .
```

5. **Update API** in `API/Controllers/LookupsController.cs`:
```csharp
[HttpGet("my-new-lookup")]
public async Task<IActionResult> GetMyNewLookup() { ... }
```

---

## Related Files

- **Entity Definitions**: `backend/Core/Entities/LookupTables.cs`
- **DbContext Configuration**: `backend/Infrastructure/Data/ApplicationDbContext.cs` (lines 238-377)
- **API Controller**: `backend/API/Controllers/LookupsController.cs`
- **Migration**: `backend/Infrastructure/Migrations/20251115111524_AddLookupTables.cs`

---

## Testing

### Test All Lookups Endpoint:
```bash
curl http://localhost:5000/api/Lookups/all | jq
```

### Test Individual Endpoints:
```bash
curl http://localhost:5000/api/Lookups/investor-statuses | jq
curl http://localhost:5000/api/Lookups/trade-types | jq
```

### Verify Data in Database:
```sql
SELECT * FROM "InvestorStatusLookup";
SELECT * FROM "TradeTypeLookup";
-- etc.
```

---

## Future Enhancements

Potential improvements for future consideration:

1. **Localization**: Add language-specific columns for multi-language support
2. **Admin UI**: Create an admin interface to manage lookup values
3. **Caching**: Implement Redis caching for lookup data
4. **Versioning**: Track changes to lookup values over time
5. **Custom Fields**: Allow adding custom metadata to specific lookup types
6. **API Filtering**: Add query parameters for filtering (e.g., `?active=true`, `?orderBy=name`)

---

## Summary

✅ **16 lookup tables created**  
✅ **All tables seeded with initial data**  
✅ **API endpoints available for all lookups**  
✅ **IDs aligned with enum values for easy mapping**  
✅ **Frontend-friendly structure with descriptions and display order**  

The lookup tables are now ready for use across the application!

