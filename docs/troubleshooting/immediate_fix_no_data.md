# Immediate Fix: "No Data" Issue

## 🔧 **Quick Fix for Your Current Panel:**

### **Step 1: Change the Query**
Replace your current query:
```
lemotick_trades_profit_total - lemotick_trades_loss_total
```

**With this simple query:**
```
lemotick_trades_profit_total
```

### **Step 2: Configure Panel Settings**
1. **Click on your "Net P&L" panel** → **Edit**
2. **Go to Panel Options** → **Field** tab
3. **Scroll down to find these settings:**
   - **No value**: Set to `0`
   - **Null value mode**: Set to `Connected`
4. **Click Apply** → **Save Panel**

### **Step 3: Test**
- **Panel should now show `0`** instead of "No data"
- **Once bot trades**: Will show actual profit amount

## 🎯 **Why This Works:**

1. **Simple queries** don't cause regex errors ✅
2. **Panel settings** handle zero values ✅
3. **Shows `0`** instead of "No data" ✅
4. **Will update** when bot starts trading ✅

## 📊 **Expected Results:**

- **Before trades**: Shows `0` ✅
- **After trades**: Shows profit amount ✅
- **No more "No data"** ✅

**This simple approach will fix your "No data" issue immediately!** 🎉
