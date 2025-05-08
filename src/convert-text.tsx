import { ActionPanel, Detail, List, Action, Icon, getSelectedText, Clipboard } from "@raycast/api";
import { execFile } from "child_process";
import { useEffect, useState, useRef } from "react";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

const Command = () => (
  <List>
    <List.Item
      icon={Icon.Book}
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

async function translate(): Promise<{ original: string; converted: string }> {
  console.log("run translate");

  return runAction("translate", "/Users/pkoptilin/workspace/bin/deeptranslate");
}

async function rephrase(): Promise<{ original: string; converted: string }> {
  console.log("run rephrase");

  return runAction("rephrase", "/Users/pkoptilin/workspace/raycast/pako-rephrase.sh");
}

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

// Detail view for translation; loads content on demand
const TranslationDetail = () => {
  const [markdown, setMarkdown] = useState<string>("Loading...");
  const [converted, setConverted] = useState<string>("");
  const hasRun = useRef(false);
  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;
    (async () => {
      const { original, converted: result } = await translate();
      setConverted(result);
      setMarkdown(
        `# Translate
## From
${original}
## To
${result}`,
      );
    })();
  }, []);
  return (
    <Detail
      navigationTitle="Translation"
      markdown={markdown}
      actions={
        <ActionPanel>
          <Action.CopyToClipboard title="Copy Translation" content={converted} />
        </ActionPanel>
      }
    />
  );
};

// Detail view for rephrase; loads content on demand
const RephraseDetail = () => {
  const [markdown, setMarkdown] = useState<string>("Loading...");
  const [converted, setConverted] = useState<string>("");
  const hasRun = useRef(false);
  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;
    (async () => {
      const { original, converted: result } = await rephrase();
      setConverted(result);
      setMarkdown(
        `# Rephrase
## From
${original}
## To
${result}`,
      );
    })();
  }, []);
  return (
    <Detail
      navigationTitle="Rephrase"
      markdown={markdown}
      actions={
        <ActionPanel>
          <Action.CopyToClipboard title="Copy Rephrase" content={converted} />
        </ActionPanel>
      }
    />
  );
};

export default Command;
