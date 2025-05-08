# Code Changes

## translate-to-ru.ts: Implement script execution and result handling

- Added imports for `execFile` and `promisify`, and defined `execFileAsync` to promisify `execFile`.
- Replaced placeholder comment with logic to execute the external `/Users/pkoptilin/workspace/bin/deeptranslate` script, passing the selected text as an argument.
- Captured `stdout` and `stderr`, threw an error if `stderr` was present.
- Trimmed the translated output, logged it to the console, copied it to the clipboard, and displayed a success HUD notification.
- Handled errors by logging them and displaying a failure HUD notification.