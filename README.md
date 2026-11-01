# React Native Bug-Fixing Project Ideas

Ten bug-fixing projects for React Native. Each one has a ready task description (Domain, Goal, Starting Materials, Steps, Deliverable) and six planted bugs, each with a small fix, sized for about 30 minutes.

**How to use this file:** pick one idea, copy its task description into your Google Doc, and give the idea number to the generator prompt (`GENERATOR_PROMPT.md`) to produce the buggy code, the working code, the steps file and the epilogue.

**Project setup:** Expo and TypeScript, started with `npx expo start`. Each project is two files: `App.tsx` and one component file. Every file is `.tsx`.

## The ten ideas

| # | Idea | Bugs |
|---|---|---|
| 1 | Expense tracker with category filter and budget | 6 |
| 2 | Habit tracker with streaks | 6 |
| 3 | Quiz app with score and timer | 6 |
| 4 | Stopwatch with laps | 6 |
| 5 | Two-tab app that loses its state | 6 |
| 6 | Product catalog with search, sort and favorites | 6 |
| 7 | Chat screen | 6 |
| 8 | Paginated feed with pull-to-refresh | 6 |
| 9 | Settings and profile with saved preferences | 6 |
| 10 | Shopping cart with coupon, tax and shipping | 6 |

---

## 1. Expense tracker with category filter and budget

**Domain / Role:** Mobile App Development, React Native Engineer

**Goal / Request:** Fix an expense tracker. Amounts should add up correctly, the category filter should show only matching expenses, the total should follow the filter, new expenses should keep their decimals, deleting should remove only the chosen expense, and the budget bar should never overflow.

**Starting Materials:** A small Expo and TypeScript app (`index.tsx` and `ExpenseRow.tsx`) containing sample expenses, category chips (All, Food, Transport, Bills), an add-expense form, delete buttons, a total, and a monthly budget bar. It has several bugs.

**Steps:**
1. Open the task instructions in Google Docs using Firefox.
2. Inspect the expense state, the filter logic and the total calculation in Visual Studio Code.
3. Fix how amounts are stored and read.
4. Fix the category filter and the total.
5. Fix adding and deleting expenses and the budget bar.
6. Run the app with `npx expo start` in the Terminal and test each category, adding amounts with decimals, deleting, and going over budget in the iOS Simulator.

**Deliverable:** An expense tracker whose list, total and budget bar always match each other.

**Planted bugs:**

| # | Step | Bug | What you see | Fix |
|---|---|---|---|---|
| 1 | 3 | Amounts are kept as text, so they are joined instead of added | Total shows 105 instead of 15 | Store the amount as a number (`Number(text)`) |
| 2 | 3 | The add form reads the amount as a whole number | Entering 12.50 saves 12 | Use `parseFloat` instead of `parseInt` |
| 3 | 4 | The category filter compares "food" with "Food" | The Food chip shows nothing | Lowercase both sides before comparing |
| 4 | 4 | The total is calculated from all expenses, not the filtered list | Filter to Food and the total does not change | Reduce over the filtered list |
| 5 | 5 | A new expense gets `length + 1` as its id | After a delete, two items share an id and the wrong one is removed | Use `Date.now().toString()` as the id |
| 6 | 5 | The budget bar width is not capped at 100% | Going over budget makes the bar spill outside its container | `Math.min(percent, 100)` |

---

## 2. Habit tracker with streaks

**Domain / Role:** Mobile App Development, React Native Engineer

**Goal / Request:** Fix the streak counter in a habit tracker. Marking a habit done today should add one to its streak, tapping twice on the same day should not count twice, a missed day should reset the streak, and the "done today" label should be correct.

**Starting Materials:** A small Expo and TypeScript app (`App.tsx` and `HabitCard.tsx`) containing three habits, each with a Done button, a streak count and the date it was last completed, plus a "pretend it's tomorrow" button for testing. It has several bugs.

**Steps:**
1. Open the task instructions in Google Docs using Firefox.
2. Inspect the completion handler and the date logic in Visual Studio Code.
3. Fix how dates are compared.
4. Fix the streak rules.
5. Fix the date handling and the "done today" label.
6. Run the app with `npx expo start` in the Terminal and test completing a habit, tapping twice, skipping a day and moving to the next day in the iOS Simulator.

**Deliverable:** A habit list whose streaks and labels follow the calendar days correctly.

**Planted bugs:**

| # | Step | Bug | What you see | Fix |
|---|---|---|---|---|
| 1 | 3 | Full timestamps are compared instead of calendar days | A second tap on the same day counts as a new day | Compare year, month and day (or `toDateString()`) |
| 2 | 3 | The "yesterday" check is off by one | Completing on consecutive days resets the streak to 1 | The gap in days must equal 1 |
| 3 | 4 | The streak never resets after a missed day | After skipping days the streak keeps climbing | Set the streak back to 1 when the gap is more than one day |
| 4 | 4 | A second tap on the same day adds to the streak again | Streak goes up by 2 in one day | Return early if the habit is already done today |
| 5 | 5 | "Today" is changed in place (or saved once and reused) | Other habits' dates shift, or the day never advances after "pretend it's tomorrow" | Copy the date (`new Date(base)`) before changing it |
| 6 | 5 | The "Done today" label uses a different comparison from the handler | A habit completed yesterday shows "Done today" | Reuse the same-day helper |

---

## 3. Quiz app with score and timer

**Domain / Role:** Mobile App Development, React Native Engineer

**Goal / Request:** Fix a quiz app. Correct answers should score one point, each question should score only once, the last question should end the quiz, the percentage should be right, Restart should reset everything, and the timer should stop when the quiz ends.

**Starting Materials:** A small Expo and TypeScript app (`App.tsx` and `QuestionCard.tsx`) containing five multiple-choice questions, a countdown timer, a Next button, and a results screen with a Restart button. It has several bugs.

**Steps:**
1. Open the task instructions in Google Docs using Firefox.
2. Inspect the answer handler, the score state and the timer in Visual Studio Code.
3. Fix the answer check and the scoring.
4. Fix the Next button and the results.
5. Fix Restart and the timer.
6. Run the app with `npx expo start` in the Terminal and test a perfect run, a partial run, a zero run, a restart and leaving the quiz in the iOS Simulator.

**Deliverable:** A quiz whose score, results and timer always match what the player did.

**Planted bugs:**

| # | Step | Bug | What you see | Fix |
|---|---|---|---|---|
| 1 | 3 | The answer check compares the option text with the correct index | Correct answers are marked wrong | Compare the selected index with `correctIndex` |
| 2 | 3 | Tapping an option twice scores twice | The score goes up by 2 for one question | Ignore taps once the question is answered |
| 3 | 4 | Next on the last question goes past the end of the list | App crashes on the last question (`undefined`) | Show the results when the index is the last one |
| 4 | 4 | The percentage divides by the wrong number | Results show 120% or NaN | Divide by `questions.length` |
| 5 | 5 | Restart resets only some of the state | The old answer stays highlighted and the score carries on | Reset every state field in one function |
| 6 | 5 | The timer keeps running after the quiz ends or the screen closes | The countdown continues, with a warning in the console | `clearInterval` when finished and in the effect cleanup |

---

## 4. Stopwatch with laps

**Domain / Role:** Mobile App Development, React Native Engineer

**Goal / Request:** Fix a stopwatch. Start should begin counting once, Pause should stop at the current time, Resume should continue from there, Reset should clear the time and the laps, and the time should be shown as 00:00.00.

**Starting Materials:** A small Expo and TypeScript app (`App.tsx` and `LapList.tsx`) containing a time display, Start/Pause and Reset buttons, and a list of recorded laps. It has several bugs.

**Steps:**
1. Open the task instructions in Google Docs using Firefox.
2. Inspect the timer state and the start, pause and reset handlers in Visual Studio Code.
3. Fix Start and Pause.
4. Fix the time updates and the display format.
5. Fix Reset and the clean-up.
6. Run the app with `npx expo start` in the Terminal and test starting, tapping Start twice, pausing, resuming, resetting and leaving the screen in the iOS Simulator.

**Deliverable:** A stopwatch that counts accurately and responds correctly to every control.

**Planted bugs:**

| # | Step | Bug | What you see | Fix |
|---|---|---|---|---|
| 1 | 3 | Tapping Start twice creates two timers | The time runs at double speed | Clear or guard the existing interval before `setInterval` |
| 2 | 3 | Pause does not stop the timer | The time keeps counting while paused | `clearInterval` on pause |
| 3 | 4 | The time never moves past the first tick | The display is stuck at 00:00.01 | A stale value inside `setInterval`: use `setTime(t => t + 10)` |
| 4 | 4 | The time is not padded | It shows 1:5.7 instead of 01:05.70 | `padStart(2, '0')` |
| 5 | 5 | Reset leaves the laps and the time | Old laps stay in the list after Reset | Reset the time and the laps array together |
| 6 | 5 | The timer runs after leaving the screen | A warning appears and the timer is never freed | Return a cleanup function from `useEffect` |

---

## 5. Two-tab app that loses its state

**Domain / Role:** Mobile App Development, React Native Engineer

**Goal / Request:** Fix a two-tab notes app (Notes and Settings). Typed text and notes should still be there after switching tabs, the active tab should be highlighted correctly, and the badge on the Notes tab should show the right number of notes.

**Starting Materials:** A small Expo and TypeScript app (`App.tsx` and `NotesScreen.tsx`) containing a simple tab bar, a notes input and list with a delete button, a badge on the Notes tab, and a settings screen. It has several bugs.

**Steps:**
1. Open the task instructions in Google Docs using Firefox.
2. Inspect how the tabs are switched and where the state is stored in Visual Studio Code.
3. Fix the lost state and the tab highlight.
4. Fix the badge and the delete.
5. Fix adding notes.
6. Run the app with `npx expo start` in the Terminal and test switching tabs repeatedly, adding blank and normal notes, and deleting notes in the iOS Simulator.

**Deliverable:** A two-tab app that keeps its data when switching tabs and shows an accurate badge.

**Planted bugs:**

| # | Step | Bug | What you see | Fix |
|---|---|---|---|---|
| 1 | 3 | The notes screen holds its own state and is rebuilt on every switch | Typed text and notes disappear when you change tab | Lift the state to the parent, or keep both screens mounted |
| 2 | 3 | The active tab highlight uses the wrong index | The wrong tab is highlighted | Compare `activeTab === tab.key` |
| 3 | 4 | The badge shows a saved count that is never updated | The badge stays at the old number | Use `notes.length` |
| 4 | 4 | Delete removes by position | The wrong note is removed after the list changes | Filter by `id` |
| 5 | 5 | Blank notes can be added | Empty cards appear in the list | Trim the text and return if it is empty |
| 6 | 5 | The input is not cleared after adding | The old text stays in the field | `setText('')` |

---

## 6. Product catalog with search, sort and favorites

**Domain / Role:** Mobile App Development, React Native Engineer

**Goal / Request:** Fix a product catalog. Search should ignore letter case, sorting should not break the list, favorites should stay on the right product, search and the category filter should work together, and the result count should be correct.

**Starting Materials:** A small Expo and TypeScript app (`App.tsx` and `ProductCard.tsx`) containing a list of products with a heart button, a search field, category chips and a sort button. It has several bugs.

**Steps:**
1. Open the task instructions in Google Docs using Firefox.
2. Inspect the search, sort and favorites logic in Visual Studio Code.
3. Fix the search and the sorting.
4. Fix the favorites and the combined filters.
5. Fix the result count and clearing the search.
6. Run the app with `npx expo start` in the Terminal and test searching in different cases, sorting, favoriting after a sort, combining filters and clearing the search in the iOS Simulator.

**Deliverable:** A catalog where the list, favorites and count always match the search and sort.

**Planted bugs:**

| # | Step | Bug | What you see | Fix |
|---|---|---|---|---|
| 1 | 3 | Search is case sensitive | "phone" does not match "Phone Case" | Lowercase both sides |
| 2 | 3 | Sorting changes the original list | Clearing the sort does not restore the order | Sort a copy: `[...items].sort(...)` |
| 3 | 4 | Favorites are stored by position | After sorting, the wrong heart is lit | Store a set of ids |
| 4 | 4 | Search and the category filter cancel each other | Choosing a category wipes the search | Apply both conditions in one filter |
| 5 | 5 | The result count shows the total | "5 results" while 2 are shown | Use `visible.length` |
| 6 | 5 | The filtered result is saved over the full list | Clearing the search does not bring products back | Derive the visible list instead of storing it |

---

## 7. Chat screen

**Domain / Role:** Mobile App Development, React Native Engineer

**Goal / Request:** Fix a chat screen. Empty messages should not be sent, the input should clear after sending, messages should appear in order with the newest at the bottom, the list should scroll to the newest message, and the time should be shown correctly.

**Starting Materials:** A small Expo and TypeScript app (`App.tsx` and `MessageBubble.tsx`) containing a message list, a text input with a Send button, timestamps on each message, and an unread count. It has several bugs.

**Steps:**
1. Open the task instructions in Google Docs using Firefox.
2. Inspect the send handler, the message list and the timestamps in Visual Studio Code.
3. Fix sending.
4. Fix the order and the scrolling.
5. Fix the timestamps and the unread count.
6. Run the app with `npx expo start` in the Terminal and test sending empty and normal messages, sending many messages, and the unread count in the iOS Simulator.

**Deliverable:** A chat screen that sends, orders, scrolls and labels messages correctly.

**Planted bugs:**

| # | Step | Bug | What you see | Fix |
|---|---|---|---|---|
| 1 | 3 | Empty and whitespace-only messages can be sent | Blank bubbles appear | Trim the text and return if it is empty |
| 2 | 3 | The input is not cleared after sending | The sent text stays in the field | `setText('')` |
| 3 | 4 | New messages are added at the top | The conversation reads upside down | Append: `[...prev, message]` |
| 4 | 4 | The list does not scroll to the newest message | New messages appear out of view | `flatListRef.scrollToEnd()` after adding |
| 5 | 5 | Timestamps are not padded | It shows 9:5 instead of 09:05 | `padStart(2, '0')` |
| 6 | 5 | The unread count includes your own messages and never resets | The badge goes up when you send, and stays up | Count only messages from others and reset on open |

---

## 8. Paginated feed with pull-to-refresh

**Domain / Role:** Mobile App Development, React Native Engineer

**Goal / Request:** Fix a paginated feed. Load More should add the next page once without duplicates, a loading spinner should always stop, pull-to-refresh should start again from page one, and the feed should know when there is no more data.

**Starting Materials:** A small Expo and TypeScript app (`App.tsx` and `FeedItem.tsx`) containing a fake paged data source (20 items, 5 per page), a list with a Load More button, and pull-to-refresh. It has several bugs.

**Steps:**
1. Open the task instructions in Google Docs using Firefox.
2. Inspect the page state and the load and refresh handlers in Visual Studio Code.
3. Fix the page number and the list updates.
4. Fix the spinner and the stale responses.
5. Fix refresh and the end of the data.
6. Run the app with `npx expo start` in the Terminal and test loading every page, a failed load, refreshing in the middle of the list, and reaching the end in the iOS Simulator.

**Deliverable:** A feed that loads each page once, in order, and stops at the end.

**Planted bugs:**

| # | Step | Bug | What you see | Fix |
|---|---|---|---|---|
| 1 | 3 | The page number is off by one | The same items appear twice, or an item is skipped | Request `page + 1` and increase the page after a successful load |
| 2 | 3 | A new page replaces the list | The earlier items disappear | `[...prev, ...newItems]` |
| 3 | 4 | The spinner stays on after an error | The spinner never stops | Turn it off in `finally` |
| 4 | 4 | An old response overwrites a newer one | Fast taps show stale data | Check a request id before saving the result |
| 5 | 5 | Pull-to-refresh does not reset | The refresh adds the same page again | Reset the page to 1 and clear the list first |
| 6 | 5 | The end of the data is never detected | Load More stays forever and fires repeatedly | Stop when a page has fewer items than the page size |

---

## 9. Settings and profile with saved preferences

**Domain / Role:** Mobile App Development, React Native Engineer

**Goal / Request:** Fix a settings screen. The toggles should match their saved state, Save should store the values, saved values should be there on the next launch, a blank name should be rejected, and Reset should clear the fields.

**Starting Materials:** A small Expo and TypeScript app (`App.tsx` and `SettingsForm.tsx`) containing a profile name field, a notifications toggle, a dark mode toggle, Save and Reset buttons, and the local storage package already installed. It has several bugs.

**Steps:**
1. Open the task instructions in Google Docs using Firefox.
2. Inspect the toggles, the save and load logic and the validation in Visual Studio Code.
3. Fix the toggles and the saving.
4. Fix the loading and the validation.
5. Fix Reset and the saved theme.
6. Run the app with `npx expo start` in the Terminal and test toggling, saving, closing and reopening the app, a blank name and Reset in the iOS Simulator.

**Deliverable:** A settings screen whose controls and saved values always match.

**Planted bugs:**

| # | Step | Bug | What you see | Fix |
|---|---|---|---|---|
| 1 | 3 | A toggle is bound to the opposite value | The switch shows OFF while the setting is on | `value={enabled}` (not `!enabled`) |
| 2 | 3 | Save and load use different storage keys | Saved values never come back | Use one shared key constant |
| 3 | 4 | Saved values are read after the first screen is drawn | The screen flashes the defaults before the saved values | Show a loading state until the read finishes |
| 4 | 4 | The name validation allows a blank name | A name of spaces is saved | Trim before checking |
| 5 | 5 | Reset leaves the text field as it was | The old name stays on screen | Reset the state that the field's `value` is bound to |
| 6 | 5 | The saved dark mode is not applied on launch | The app opens light even when dark was saved | Read the saved theme when the provider starts |

---

## 10. Shopping cart with coupon, tax and shipping

**Domain / Role:** Mobile App Development, React Native Engineer

**Goal / Request:** Fix a shopping cart. Quantities should not go below one, subtotals and the total should always match, a coupon should apply only once and before tax, free shipping should apply at the right amount, and money should be shown with two decimals.

**Starting Materials:** A small Expo and TypeScript app (`App.tsx` and `CartRow.tsx`) containing sample products with quantity controls, a coupon field, a tax line, a shipping line, and a total. It has several bugs.

**Steps:**
1. Open the task instructions in Google Docs using Firefox.
2. Inspect the quantity handlers and the price calculations in Visual Studio Code.
3. Fix the quantities and the subtotal.
4. Fix the coupon and the tax.
5. Fix the shipping rule and the rounding.
6. Run the app with `npx expo start` in the Terminal and test quantities, applying a coupon twice, totals around the free-shipping amount, and the decimals in the iOS Simulator.

**Deliverable:** A cart whose lines, discounts, tax, shipping and total remain accurate.

**Planted bugs:**

| # | Step | Bug | What you see | Fix |
|---|---|---|---|---|
| 1 | 3 | Quantity can fall below one | Quantities of 0 and -1 appear | `Math.max(1, quantity - 1)` |
| 2 | 3 | The subtotal is a saved value that goes stale | The subtotal does not change when the quantity changes | Calculate it from price times quantity |
| 3 | 4 | The coupon can be applied twice | The discount doubles | Ignore the coupon if it is already applied |
| 4 | 4 | The discount is taken after tax | The total is a little too high | Discount the subtotal first, then calculate the tax |
| 5 | 5 | The free-shipping rule uses `>` instead of `>=` | A cart of exactly 50.00 is charged shipping | Use `>= 50` |
| 6 | 5 | Money shows floating-point noise | Totals like 13.049999999999999 | `toFixed(2)`, or work in cents |

---

## Notes

- **Six bugs, small fixes.** Every fix is one line or one small change, so the whole project fits in about 30 minutes.
- **The bugs are ordered by task step.** Steps 3, 4 and 5 each cover two bugs, so you can skip one or two and still complete every step.
- **Some bugs hide others.** Fix them in order and test after each one.