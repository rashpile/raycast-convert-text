# PaKo Convert Text (Raycast Extension)

A configurable Raycast extension for converting and transforming selected text using external scripts.

## Features

- Dynamically load commands from a YAML configuration file (`actions.yml`).
- Auto-creates `actions.yml` in the Raycast support path if missing.
- Displays a “Configure Commands” placeholder when no commands are defined.
- Generic detail view to show original and converted text, with copy-to-clipboard.

## Installation

1. Clone or copy this extension to your Raycast extensions directory.
2. Run `npm install` to install dependencies.
3. Use `npm run dev` to start in development mode, or `npm run build` to package.

## Configuration

The extension uses a YAML file named `actions.yml` to define available commands. This file is located at:

```
<Raycast Support Path>/actions.yml
```


### actions.yml format

Add one or more actions under the `actions` key. Each action must include:

- `name`: a unique identifier for the command
- `title`: the display name shown in the list
- `script`: the absolute path to the executable or script (must accept the selected text as its first argument)

Example:

```yaml
actions:
  - name: translate
    title: Translate Text
    script: /usr/local/bin/deeptranslate
  - name: rephrase
    title: Rephrase Text
    script: ~/scripts/rephrase.sh
```

After saving your changes, the extension list will update to show the new commands.

## Usage

1. Select or copy text in any application.
2. Trigger the “Convert Text” command in Raycast.
3. Choose one of your configured actions.
4. View the converted output and copy it to the clipboard if desired.

## Development

- Dependency: `js-yaml` is used for parsing the YAML config.
- The config file is stored under `environment.supportPath` (Raycast’s support directory).

## License

MIT
