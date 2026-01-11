# Currency Conversion Logic Documentation

## Overview
This document explains the currency conversion logic used to convert all prices to INR (Indian Rupees) throughout the application.

## Data Structure

### How Prices Are Stored

1. **In Database (GraphQL Schema):**
   - Prices are stored as **cents** (integers)
   - Example: `priceCents: 10000` = $100.00 or ₹100.00

2. **In Frontend (TypeScript Types):**
   - Room prices are converted to **currency units** (decimals)
   - Example: `room.totalPrice: 100.50` = $100.50 or ₹100.50
   - This conversion happens in `lib/transformers/hotel.ts`:
     ```typescript
     pricePerNight: currentRate.priceCents / 100  // Converts cents to currency units
     ```

## Conversion Logic

### Step-by-Step Process

#### 1. **Get Exchange Rate** (`getExchangeRateToINR`)
```typescript
// Example: Convert USD to INR
// Rate: 1 USD = 83.5 INR
const rate = await getExchangeRateToINR('USD')  // Returns 83.5
```

**API Used:**
- Primary: `https://api.exchangerate.host/latest?base=USD&symbols=INR`
- Fallback: ExchangeRate-API (if primary fails)

**Caching:**
- Exchange rates are cached for **1 hour** to reduce API calls
- Cache key: `{CURRENCY}_INR` (e.g., `USD_INR`)

#### 2. **Convert Price** (`convertCentsToINR`)
```typescript
// Example: Convert $100.00 (USD) to INR
// Input: amountCents = 10000 (cents), fromCurrency = 'USD'

// Step 1: Get exchange rate
const rate = 83.5  // 1 USD = 83.5 INR

// Step 2: Multiply cents by rate
const inrCents = 10000 * 83.5 = 835000 cents

// Step 3: Round to nearest cent
const rounded = Math.round(835000) = 835000 cents

// Result: ₹8350.00 (835000 / 100)
```

**Formula:**
```
INR_Cents = USD_Cents × Exchange_Rate
INR_Amount = Math.round(INR_Cents) / 100
```

### 3. **Component Usage**

#### RoomSelector Component:
```typescript
// Input: room.totalPrice = 100.50 (USD currency units)
// Input: room.pricePerNight = 50.25 (USD currency units)

// Step 1: Convert to cents
const totalPriceCents = Math.round(100.50 * 100) = 10050 cents
const pricePerNightCents = Math.round(50.25 * 100) = 5025 cents

// Step 2: Convert to INR cents
const convertedTotal = await convertCentsToINR(10050, 'USD')
// = Math.round(10050 * 83.5) = 839175 cents

const convertedPerNight = await convertCentsToINR(5025, 'USD')
// = Math.round(5025 * 83.5) = 419588 cents

// Step 3: Convert back to currency units for display
const totalPriceINR = 839175 / 100 = ₹8391.75
const pricePerNightINR = 419588 / 100 = ₹4195.88
```

## Accuracy Analysis

### ✅ **What's Correct:**

1. **Precision Preservation:**
   - We work with cents (integers) during conversion to avoid floating-point errors
   - Rounding happens only at the final step

2. **Exchange Rate Source:**
   - Uses real-time exchange rates from reliable APIs
   - Rates are cached to reduce API calls

3. **Error Handling:**
   - Falls back to cached rate if API fails
   - Falls back to original price if all conversions fail

### ⚠️ **Potential Issues:**

1. **Rounding at Cents Level:**
   ```typescript
   // Current: Math.round(amountCents * rate)
   // Example: 100.50 USD × 83.5 = 8391.75 INR
   // But if we have 100.51 USD:
   // 10051 cents × 83.5 = 839258.5 cents
   // Math.round(839258.5) = 839259 cents = ₹8392.59
   // This is correct! ✅
   ```

2. **Double Conversion Risk:**
   ```typescript
   // If room.totalPrice is already in INR but we treat it as USD:
   // 100 INR × 83.5 = 8350 INR (WRONG! Should be 100 INR)
   // 
   // Solution: We check currency code first:
   if (fromCurrency.toUpperCase() === 'INR') {
     return amountCents  // No conversion needed ✅
   }
   ```

3. **Exchange Rate Accuracy:**
   - Free APIs may have slight delays (15-60 minutes)
   - Rates are cached for 1 hour, so they may not be real-time
   - For production, consider using a paid API with real-time rates

## Example Calculations

### Example 1: USD to INR
```
Input: $100.00 USD
Exchange Rate: 1 USD = 83.5 INR

Calculation:
1. Convert to cents: 100.00 × 100 = 10000 cents
2. Apply rate: 10000 × 83.5 = 835000 cents
3. Round: Math.round(835000) = 835000 cents
4. Convert to currency: 835000 / 100 = ₹8350.00

Result: ₹8350.00 ✅
```

### Example 2: EUR to INR
```
Input: €85.50 EUR
Exchange Rate: 1 EUR = 90.2 INR

Calculation:
1. Convert to cents: 85.50 × 100 = 8550 cents
2. Apply rate: 8550 × 90.2 = 771210 cents
3. Round: Math.round(771210) = 771210 cents
4. Convert to currency: 771210 / 100 = ₹7712.10

Result: ₹7712.10 ✅
```

### Example 3: Already INR
```
Input: ₹5000.00 INR
Exchange Rate: N/A (same currency)

Calculation:
1. Check currency: 'INR' === 'INR' → return early
2. No conversion needed

Result: ₹5000.00 ✅
```

## Testing the Accuracy

To verify accuracy, you can test with known exchange rates:

```typescript
// Test 1: USD to INR (rate ≈ 83.5)
const usdAmount = 100.00
const expectedINR = 8350.00
const actualINR = await convertCentsToINR(usdAmount * 100, 'USD') / 100
// Should be approximately 8350.00 (within 0.01% due to rate fluctuations)

// Test 2: EUR to INR (rate ≈ 90.2)
const eurAmount = 100.00
const expectedINR = 9020.00
const actualINR = await convertCentsToINR(eurAmount * 100, 'EUR') / 100
// Should be approximately 9020.00
```

## Recommendations for Production

1. **Use a Paid API** for real-time rates (e.g., ExchangeRate-API paid tier)
2. **Add Rate Validation** to ensure rates are within expected ranges
3. **Log Conversions** for auditing purposes
4. **Add Unit Tests** to verify conversion accuracy
5. **Consider Historical Rates** if needed for past transactions

## Current Implementation Status

✅ **Working Correctly:**
- Conversion logic is mathematically sound
- Handles edge cases (INR to INR, missing rates)
- Caching reduces API calls
- Error handling prevents app crashes

⚠️ **Could Be Improved:**
- Use more reliable/real-time exchange rate source
- Add validation for rate ranges
- Add logging for debugging
- Consider using a dedicated currency conversion service

