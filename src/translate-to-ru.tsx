import { ActionPanel, Detail, List, Action, Icon, getSelectedText, Clipboard } from "@raycast/api";
import { execFile } from "child_process";
import { useEffect, useState } from "react";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

const Command = () => (
  <List>
    <List.Item
      icon={Icon.Bird}
      title="Translate"
      actions={
        <ActionPanel>
          <Action.Push title="Show Translation" target={<TranslationDetail />} />
        </ActionPanel>
      }
    />
    <List.Item
      icon={Icon.Bird}
      title="Rephrase"
      actions={
        <ActionPanel>
          <Action.Push title="Show Rephrase" target={<RephraseDetail />} />
        </ActionPanel>
      }
    />
  </List>
);

async function translate(): Promise<string> {
  return runAction("translate", "/Users/pkoptilin/workspace/bin/deeptranslate");
}

async function rephrase(): Promise<string> {
  return runAction("rephrase", "/Users/pkoptilin/workspace/raycast/deep-translate-en-en.sh");
}

async function runAction(action: string, script: string): Promise<string> {
  try {
    const selectedText = await getQuery();

    try {
      const { stdout, stderr } = await execFileAsync(script, [selectedText]);
      if (stderr) {
        throw new Error(stderr);
      }
      const translated = stdout.trim();
      console.log(translated);
      await Clipboard.copy(translated);
      return translated;
    } catch (error) {
      console.error(error);
      return "⚠️ Failed to " + action + ": " + selectedText;
    }
  } catch (error) {
    console.log(error);
    return "Cannot Quick Open, message: " + error;
  }
}

async function getQuery() {
  let selectedText = (await getSelectedText()).trim();
  if (selectedText.length === 0) {
    selectedText = (await Clipboard.readText()) || "";
    console.log(selectedText);
  }
  return selectedText.trim();
}

// Detail view for translation; loads content on demand
const TranslationDetail = () => {
  const [markdown, setMarkdown] = useState<string>("Loading...");
  useEffect(() => {
    (async () => {
      const result = await translate();
      setMarkdown(`# Translate
## From
todo add from
## To
${result}`);
    })();
  }, []);
  return <Detail navigationTitle="Translation" markdown={markdown} />;
};

// Detail view for rephrase; loads content on demand
const RephraseDetail = () => {
  const [markdown, setMarkdown] = useState<string>("Loading...");
  useEffect(() => {
    (async () => {
      const result = await rephrase();
      setMarkdown(`# ${result}`);
    })();
  }, []);
  return <Detail navigationTitle="Rephrase" markdown={markdown} />;
};

export default Command;
