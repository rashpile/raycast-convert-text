import { ActionPanel, Detail, List, Action, Icon, getSelectedText, showHUD, Clipboard } from "@raycast/api";
// import * as fs from "fs";
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
  try {
    const selectedText = await getQuery();

    try {
      const { stdout, stderr } = await execFileAsync("/Users/pkoptilin/workspace/bin/deeptranslate", [selectedText]);
      if (stderr) {
        throw new Error(stderr);
      }
      const translated = stdout.trim();
      console.log(translated);
      await Clipboard.copy(translated);
      // await showHUD("✅ Translated to Russian and copied to clipboard.");
      return translated;
    } catch (error) {
      console.error(error);
      // await showHUD("⚠️ Failed to translate " + selectedText);
      return "⚠️ Failed to translate " + selectedText;
    }
  } catch (error) {
    console.log(error);
    // await showHUD("Cannot Quick Open, message: " + error);
    return "Cannot Quick Open, message: " + error;
  }
}

async function rephrase(): Promise<string> {
  try {
    const selectedText = await getQuery();

    try {
      const { stdout, stderr } = await execFileAsync("/Users/pkoptilin/workspace/raycast/deep-translate-en-en.sh", [
        selectedText,
      ]);
      if (stderr) {
        throw new Error(stderr);
      }
      const translated = stdout.trim();
      console.log(translated);
      await Clipboard.copy(translated);
      return translated;
    } catch (error) {
      console.error(error);
      return "⚠️ Failed to rephrase " + selectedText;
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
      setMarkdown(`# ${result}`);
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
