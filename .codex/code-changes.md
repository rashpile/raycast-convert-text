# Code Changes

## convert-text.tsx: Implement script execution and result handling

- Added imports for `execFile` and `promisify`, and defined `execFileAsync` to promisify `execFile`.
- Replaced placeholder comment with logic to execute the external `/path/deeptranslate` script, passing the selected text as an argument.
- Captured `stdout` and `stderr`, threw an error if `stderr` was present.
- Trimmed the translated output, logged it to the console, copied it to the clipboard, and displayed a success HUD notification.
  - Handled errors by logging them and displaying a failure HUD notification.

## src/convert-text.tsx: Display translation result in Detail

- Added `useState` hook to track `translation` state in the `Command` component.
- Modified `translate()` to return the translated text (or empty string on failure).
- Updated `useEffect` to invoke `translate()` and store its result in state.
- Changed the `Detail` component's `markdown` prop to render `translation` instead of the static `hello` value.

## src/convert-text.tsx: Load translation and rephrase on demand

- Removed pre-fetch logic and `translation` state from the `Command` component.
- Introduced `TranslationDetail` and `RephraseDetail` components that fetch and render their content when mounted.
 - Updated `Command` to push to these detail views only when the user clicks the corresponding list item.

## src/convert-text.tsx: DRY refactor translate and rephrase

- Introduced `runAction` helper to encapsulate:
  - Retrieving selected text (`getQuery`)
  - Executing external scripts
  - Handling `stdout`/`stderr` and trimming output
  - Copying result to clipboard
  - Unified error handling for command and query failures
- Simplified `translate()` and `rephrase()` to single-line wrappers calling `runAction` with their script paths and action names.
  - Simplified `translate()` and `rephrase()` to single-line wrappers calling `runAction` with their script paths and action names.

## src/convert-text.tsx: Show original and converted text in detail views

- Changed `runAction` to return an object `{ original, converted }` instead of a single string.
- Updated `translate()` and `rephrase()` signatures to reflect the new return type.
- Updated `TranslationDetail` to destructure `{ original, converted }` and display both sections:
  - `## From` shows the original selected or clipboard text.
  - `## To` shows the translated text.
- Updated `RephraseDetail` similarly to show the original and rephrased text.
- Removed the placeholder `todo add from` line.

## src/convert-text.tsx.tsx: Add Copy to Clipboard actions in detail views

- Added `converted` state in both `TranslationDetail` and `RephraseDetail` to store the result text.
- Extended `<Detail>` components with an `actions` prop containing `Action.CopyToClipboard`:
  - In `TranslationDetail`, copy translated text via "Copy Translation" action.
  - In `RephraseDetail`, copy rephrased text via "Copy Rephrase" action.

## make plugin configurable via actions.yml

- Added `js-yaml` dependency for YAML parsing.
- Loaded actions configuration from `actions.yml` at runtime.
- Refactored `src/convert-text.tsx` to dynamically render commands based on configuration.
- Removed static Translate/Rephrase components and functions.
- Introduced generic `ActionDetail` component to handle any configured action.
- Created `actions.yml` in `environment.supportPath` if missing, with default header.
- When no actions are configured (empty file), added a "Configure Commands" placeholder item to open `actions.yml`.


## src/convert-text.tsx: Add numeric shortcuts and include all actions in panel

- Imported `Keyboard` from `@raycast/api`.
- Declared `numberShortcuts: Keyboard.KeyEquivalent[]` mapping digits "1"–"9" to key equivalents.
- Updated each `<List.Item>`'s `ActionPanel` to render all configured actions:
  - Mapped over `actionsConfig` to render an `<Action.Push>` for every action.
  - Assigned `shortcut` prop to each `<Action.Push>` using the corresponding digit from `numberShortcuts`.
  - Removed the single-action panel in favor of listing all actions per item, ensuring all shortcuts (1–9) are always active.

## src/convert-text.tsx: Add Configure Actions UI

- Added `ConfigureForm` component presenting a form to input `name`, `title`, and `script`.
- Imported `Form`, `showToast`, and `Toast` from `@raycast/api` to handle form rendering and feedback.
- Added `Configure Actions` list item at the end of the command list, launching the form via `<Action.Push>`.
- On submission, reads `actions.yml`, appends the new action, writes updated YAML back, and displays a toast indicating success or failure.

## src/convert-text.tsx: Show shortcut hints in action list

- Updated each action `List.Item` to include its numeric shortcut in square brackets (e.g., `[1]`) after the title.
- Used the existing `numberShortcuts` array to fetch the correct hint, omitting hints for indexes ≥ 9.
