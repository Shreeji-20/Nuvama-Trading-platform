# StrategiesFilter - Quick Reference

## 🎯 Quick Overview

A powerful filtering component with **9 filter options** to help you find strategies quickly.

---

## 🔍 Filter Options

### 1. **Search Text** (NEW)

- **Type**: Text Input
- **Searches**: Strategy Name OR Strategy ID
- **Usage**: Type any part of the name or ID
- **Example**: Type "scalp" to find all strategies with "scalp" in the name

### 2. **Symbol**

- **Type**: Dropdown
- **Options**: NIFTY, BANKNIFTY, FINNIFTY, SENSEX
- **Usage**: Filter strategies trading specific symbols
- **Example**: Select "NIFTY" to see only NIFTY strategies

### 3. **Tag**

- **Type**: Dropdown (Dynamic)
- **Options**: All available strategy tags
- **Usage**: Filter by strategy tag
- **Example**: Select "Hedging" to see hedging strategies

### 4. **Status**

- **Type**: Dropdown
- **Options**: Running, Paused, Stopped
- **Usage**: Filter by trading status
- **Example**: Select "Running" to see active strategies

### 5. **Execution Mode** (NEW)

- **Type**: Dropdown
- **Options**: Live Mode, Simulation Mode
- **Usage**: Separate live trading from testing
- **Example**: Select "Simulation Mode" to see test strategies

### 6. **Underlying** (NEW)

- **Type**: Dropdown
- **Options**: Spot, Futures
- **Usage**: Filter by underlying asset type
- **Example**: Select "Futures" to see futures-based strategies

### 7. **Min Lots** (NEW)

- **Type**: Number Input
- **Usage**: Show strategies with at least this many lots
- **Example**: Enter "5" to see strategies trading 5+ lots

### 8. **Max Lots** (NEW)

- **Type**: Number Input
- **Usage**: Show strategies with at most this many lots
- **Example**: Enter "10" to see strategies trading ≤10 lots

### 9. **Selected Only**

- **Type**: Checkbox
- **Usage**: Show only strategies marked for trading
- **Example**: Check to see your selected strategies

---

## 📊 Filter Summary

The component displays real-time statistics:

- **Showing**: Current filtered count / Total strategies
- **Selected**: Number of strategies selected for trading
- **Running**: Number of strategies currently running
- **Live Mode**: Number of strategies in live trading mode

---

## 🎨 Visual Indicators

- **🟦 Active Badge**: Shows when any filter is active
- **🔵 Count Badges**: Color-coded statistics
  - Blue: Filtered count
  - Green: Selected count
  - Emerald: Running count
  - Purple: Live Mode count

---

## ⚡ Quick Actions

### Clear All Filters

Click the "Clear All" button to reset all filters at once.

### Multiple Filters

All filters work together with AND logic:

- Example: Symbol="NIFTY" + Status="Running" + Min Lots="5"
  - Result: Shows only NIFTY strategies that are running with 5+ lots

---

## 💡 Common Use Cases

### Find a Specific Strategy

```
✅ Use: Search Text
📝 Type: Strategy name or ID
⚡ Result: Instant match
```

### Review Test Strategies

```
✅ Use: Execution Mode = "Simulation Mode"
⚡ Result: Only test strategies
```

### Find High-Volume Strategies

```
✅ Use: Min Lots = "10"
⚡ Result: Strategies with 10+ lots
```

### Check Active Trades

```
✅ Use: Status = "Running"
⚡ Result: Only actively trading strategies
```

### Find Symbol-Specific Strategies

```
✅ Use: Symbol = "BANKNIFTY"
⚡ Result: Only BANKNIFTY strategies
```

### Futures vs Spot Strategies

```
✅ Use: Underlying = "Futures" or "Spot"
⚡ Result: Strategies by underlying type
```

### Review Selected Strategies

```
✅ Use: Selected Only checkbox
⚡ Result: Only selected strategies
```

### Complex Filter Example

```
✅ Symbol: "NIFTY"
✅ Execution Mode: "Live Mode"
✅ Status: "Running"
✅ Min Lots: "5"
⚡ Result: Live NIFTY strategies, running, with 5+ lots
```

---

## 🎯 Pro Tips

1. **Start Broad, Then Narrow**: Begin with one filter, then add more
2. **Use Search First**: Fastest way to find specific strategies
3. **Check Statistics**: Filter summary shows impact in real-time
4. **Combine Filters**: Don't be afraid to use multiple filters
5. **Clear Regularly**: Use "Clear All" to start fresh

---

## 🚀 Performance

- ⚡ **Instant Results**: No API calls, client-side filtering
- 🎯 **Real-time**: Updates as you type/select
- 📱 **Responsive**: Works on all screen sizes
- 🌙 **Dark Mode**: Full dark mode support

---

## 🔧 Technical Details

### Filter Logic

All filters use AND logic. A strategy must match ALL active filters to appear in results.

### Data Sources

- **Strategies**: From main strategies array
- **Tags**: From availableTags array
- **Symbols**: From symbolOptions array
- **Status**: From strategyStatus object

### State Management

Filters are stored in a single `FilterOptions` object for efficient state management.

---

## 📖 Related Documentation

- **Full Documentation**: See `StrategiesFilter.README.md`
- **Implementation Details**: See `FILTER_EXTRACTION_SUMMARY.md`
- **Comparison**: See `BEFORE_AFTER_COMPARISON.md`

---

## 🆘 Troubleshooting

### No Results After Filtering

1. Check "Active" badge to confirm filters are applied
2. Review each active filter
3. Try "Clear All" and start over
4. Check if strategies exist for your criteria

### Search Not Working

1. Make sure you're typing in the search box (top of filter card)
2. Search is case-insensitive
3. Searches both strategy name AND strategy ID

### Statistics Not Updating

1. Statistics update automatically
2. If issues persist, refresh the page
3. Check browser console for errors

---

## 🎉 Success Metrics

After using the filter:

- ✅ Reduced time to find strategies
- ✅ Better strategy organization
- ✅ Easier to manage multiple strategies
- ✅ Quick identification of issues
- ✅ Improved workflow efficiency

---

**Need Help?** Check the full documentation in `StrategiesFilter.README.md`
