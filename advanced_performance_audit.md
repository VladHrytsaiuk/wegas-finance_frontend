# Advanced Performance Audit - Phase 2

This audit identifies critical performance bottlenecks in the React frontend, focusing on unnecessary re-renders, expensive computations, and bundle size.

## 1. MISSED LIST MEMOIZATION

### File: `src/components/accounts/AccountCard.tsx`
**Problem:** The component is not wrapped in `React.memo`.
**Code:**
```tsx
export const AccountCard = ({ account, skin }: AccountCardProps) => { ... }
```
**Impact:** In `AccountsGrid.tsx`, every single `AccountCard` re-renders whenever the search query or filter changes in the parent `Accounts.tsx` page, even if the account data itself remains the same.

### File: `src/components/goals/GoalCard.tsx`
**Problem:** Missing `React.memo` and receiving non-memoized `handlers` object.
**Code:**
```tsx
export default function GoalCard({ goal, t, handlers }: GoalCardProps) { ... }
```
**Impact:** The `handlers` object is redefined on every render of `Goals.tsx`. This bypasses any potential memoization and forces all Goal cards to re-render constantly.

### File: `src/components/utility/UtilityMeterCard.tsx`
**Problem:** Missing `React.memo` and receiving multiple inline arrow functions from `Utility.tsx`.
**Code:**
```tsx
<UtilityMeterCard
  key={meter.id}
  meter={meter}
  onClick={() => navigate(`/utility/${meter.id}`)}
  onEdit={() => { ... }}
  onPay={() => { ... }}
  onAddReading={() => { ... }}
/>
```
**Impact:** Parent re-renders (e.g., during filtering) force all meter cards to re-render because the function props are never referentially equal.

---

## 2. FORM STATE INEFFICIENCY

### File: `src/hooks/Accounts/useAccountForm.ts`
**Problem:** Standard `useState` for every input field in a large form.
**Code:**
```tsx
const [name, setName] = useState("");
const [balance, setBalance] = useState("");
// ... 10+ other states
```
**Impact:** Every keystroke in the "Name" or "Balance" fields triggers a full re-render of `AccountFormContent`, which includes complex sub-components like `SkinSelector` and `BaseSelect`. This leads to input lag on slower devices.

### File: `src/hooks/Transactions/useTransactionForm.ts`
**Problem:** Excessive state updates during complex transaction entry.
**Code:**
```tsx
const [note, setNote] = useState(...);
const [amountStr, setAmountStr] = useState(...);
```
**Impact:** Similar to the Account form, but exacerbated by the `ItemsTable` and `AssetSelector` which are also part of the same render tree.

---

## 3. EXPENSIVE COMPUTATIONS

### File: `src/hooks/Goals/useGoalsFilter.ts`
**Problem:** `sortOptions` redefined on every render.
**Code:**
```tsx
const sortOptions = [
  { value: "deadline-asc", label: t("goals_debts:goals.sort_deadline_asc", "...") },
  // ...
];
```
**Impact:** Unnecessary object allocation and potential re-renders of the `TableToolbar` component which consumes this array.

### File: `src/hooks/Utility/useUtilityFilters.ts`
**Problem:** `sortOptions` missing `useMemo`.
**Code:**
```tsx
const sortOptions = [
  { value: "group-asset", label: "По нерухомості" },
  // ...
];
```
**Impact:** Same as above; forces children to re-process the options list.

---

## 4. ROUTE-BASED CODE SPLITTING

### File: `src/App.tsx`
**Problem:** All pages and modals are imported statically at the top of the file.
**Code:**
```tsx
import Dashboard from "./pages/dashboard/Dashboard";
import Accounts from "./pages/accounts/Accounts";
import Transactions from "./pages/transactions/Transactions";
// ... 20+ other static imports
```
**Impact:** The initial Javascript bundle contains the code for every single page in the application. Users must download and parse the entire app before they can see the Login screen or Dashboard, significantly increasing Time to Interactive (TTI).

---

## RECOMMENDATIONS
1. **Apply `React.memo`** to all card-like components (`AccountCard`, `GoalCard`, `UtilityMeterCard`).
2. **Use `useCallback`** for event handlers passed to memoized components.
3. **Wrap static arrays** (like `sortOptions`) in `useMemo`.
4. **Implement `React.lazy` and `Suspense`** in `App.tsx` for all main routes to enable chunking.
5. **Consider Uncontrolled Components** or `react-hook-form` for high-frequency inputs to decouple keystrokes from the main render cycle.
