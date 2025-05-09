import { ActionPanel, Detail, List, Action, getSelectedText, Clipboard, Icon, environment, Keyboard, Form, showToast, Toast } from "@raycast/api";
import { execFile } from "child_process";
import { useEffect, useState, useRef } from "react";
import { promisify } from "util";
import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";

const execFileAsync = promisify(execFile);

// Load actions from configuration file
type ActionConfig = {
  name: string;
  title: string;
  script: string;
};

const configPath = path.resolve(process.cwd(), environment.supportPath + "/actions.yml");
let actionsConfig: ActionConfig[] = [];
// Ensure config file exists
if (!fs.existsSync(configPath)) {
  fs.writeFileSync(
    configPath,
    "actions:\n#  - name: translate\n#    title: Translate Text\n#    script: /path/to/translate\n",
    "utf8",
  );
}
try {
  const fileContents = fs.readFileSync(configPath, "utf8");
  const parsed = yaml.load(fileContents) as { actions: ActionConfig[] };
  if (parsed && Array.isArray(parsed.actions)) {
    actionsConfig = parsed.actions;
  } else {
    console.error("Invalid actions.yml format");
  }
} catch (error) {
  console.error("Failed to load actions.yml:", error);
}

// Numeric shortcuts for actions: "1" => first action, etc.
const numberShortcuts: Keyboard.KeyEquivalent[] = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

const Command = () => (
  <List>
    {actionsConfig.length === 0 && (
      <List.Item
        key="open-config"
        title="Configure Commands"
        accessoryTitle="No commands configured"
        icon={Icon.Gear}
        actions={
          <ActionPanel>
            <Action.Open title="Open actions.yml" target={configPath} />
          </ActionPanel>
        }
      />
    )}
    {actionsConfig.map((action) => (
      <List.Item
        key={action.name}
        title={action.title}
        icon={Icon.Book}
        actions={
          <ActionPanel>
            {actionsConfig.map((act, idx) => (
              <Action.Push
                key={act.name}
                title={`Show ${act.title}`}
                target={<ActionDetail action={act} />}
                shortcut={
                  idx < numberShortcuts.length
                    ? { modifiers: [], key: numberShortcuts[idx] }
                    : undefined
                }
              />
            ))}
          </ActionPanel>
        }
      />
    ))}
    <List.Item
      key="configure-actions"
      title="Configure Actions"
      icon={Icon.Gear}
      actions={
        <ActionPanel>
          <Action.Push title="Configure Actions" target={<ConfigureForm />} />
        </ActionPanel>
      }
    />
  </List>
);

async function runAction(action: string, script: string): Promise<{ original: string; converted: string }> {
  try {
    const selectedText = await getQuery();

    try {
      const { stdout, stderr } = await execFileAsync(script, [selectedText]);
      if (stderr) {
        throw new Error(stderr);
      }
      const converted = stdout.trim();
      console.log(selectedText);
      console.log(converted);
      //await Clipboard.copy(converted);
      return { original: selectedText, converted };
    } catch (error) {
      console.error(error);
      return {
        original: selectedText,
        converted: "⚠️ Failed to " + action + ": " + selectedText,
      };
    }
  } catch (error) {
    console.log(error);
    return {
      original: "",
      converted: "Cannot Quick Open, message: " + error,
    };
  }
}

async function getQuery() {
  let selectedText = (await getSelectedText()).trim();
  if (selectedText.length === 0) {
    selectedText = (await Clipboard.readText()) || "";
    // console.log(selectedText);
  }
  return selectedText.trim();
}

// Generic detail view for actions
const ActionDetail = ({ action }: { action: ActionConfig }) => {
  const [markdown, setMarkdown] = useState<string>("Loading...");
  const [converted, setConverted] = useState<string>("");
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;
    (async () => {
      const { original, converted: result } = await runAction(action.name, action.script);
      setConverted(result);
      setMarkdown(`# ${action.title}\n\n## From\n${original}\n\n## To\n${result}`);
    })();
  }, []);

  return (
    <Detail
      navigationTitle={action.title}
      markdown={markdown}
      actions={
        <ActionPanel>
          <Action.CopyToClipboard title={`Copy ${action.title}`} content={converted} />
        </ActionPanel>
      }
    />
  );
};

// Component for adding new actions via form
const ConfigureForm = () => {
  const handleSubmit = async (values: { name: string; title: string; script: string }) => {
    try {
      const fileContents = fs.readFileSync(configPath, "utf8");
      const parsed = yaml.load(fileContents) as { actions: ActionConfig[] };
      const actionsArray = parsed && Array.isArray(parsed.actions) ? parsed.actions : [];
      actionsArray.push(values);
      const newYaml = yaml.dump({ actions: actionsArray });
      fs.writeFileSync(configPath, newYaml, "utf8");
      await showToast(Toast.Style.Success, "Action added");
    } catch (error) {
      console.error(error);
      await showToast(Toast.Style.Failure, "Failed to add action", String(error));
    }
  };

  return (
    <Form
      navigationTitle="Configure Actions"
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Add Action" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField id="name" title="Name" placeholder="Unique action key" />
      <Form.TextField id="title" title="Title" placeholder="Displayed action title" />
      <Form.TextField id="script" title="Script" placeholder="/path/to/script" />
    </Form>
  );
};

export default Command;
