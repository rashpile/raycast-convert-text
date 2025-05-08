# Code Changes

## translate-to-ru.ts: Implement script execution and result handling

- Added imports for `execFile` and `promisify`, and defined `execFileAsync` to promisify `execFile`.
- Replaced placeholder comment with logic to execute the external `/Users/pkoptilin/workspace/bin/deeptranslate` script, passing the selected text as an argument.
- Captured `stdout` and `stderr`, threw an error if `stderr` was present.
- Trimmed the translated output, logged it to the console, copied it to the clipboard, and displayed a success HUD notification.
  - Handled errors by logging them and displaying a failure HUD notification.

## src/translate-to-ru.tsx: Display translation result in Detail

- Added `useState` hook to track `translation` state in the `Command` component.
- Modified `translate()` to return the translated text (or empty string on failure).
- Updated `useEffect` to invoke `translate()` and store its result in state.
- Changed the `Detail` component's `markdown` prop to render `translation` instead of the static `hello` value.

## src/translate-to-ru.tsx: Load translation and rephrase on demand

- Removed pre-fetch logic and `translation` state from the `Command` component.
- Introduced `TranslationDetail` and `RephraseDetail` components that fetch and render their content when mounted.
 - Updated `Command` to push to these detail views only when the user clicks the corresponding list item.

## src/translate-to-ru.tsx: DRY refactor translate and rephrase

- Introduced `runAction` helper to encapsulate:
  - Retrieving selected text (`getQuery`)
  - Executing external scripts
  - Handling `stdout`/`stderr` and trimming output
  - Copying result to clipboard
  - Unified error handling for command and query failures
- Simplified `translate()` and `rephrase()` to single-line wrappers calling `runAction` with their script paths and action names.