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