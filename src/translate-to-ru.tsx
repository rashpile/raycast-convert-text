import { ActionPanel, Detail, List, Action, Icon, getSelectedText, showHUD, Clipboard } from "@raycast/api";
// import * as fs from "fs";
import { execFile } from "child_process";
import { useEffect, useRef, useState } from "react";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

const Command = () => {
  const hasRunRef = useRef(false);
  const rephrasal = "TODO";
  const [translation, setTranslation] = useState<string>("");
  useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    (async () => {
      const result = await translate();
      if (result) {
        setTranslation(result);
      }
    })();
  }, []);

  return (
    <List>
      <List.Item
        icon={Icon.Bird}
        title="Translate"
        actions={
          <ActionPanel>
            <Action.Push title="Show Translation" target={<Detail markdown={`# ${translation}`} />} />
          </ActionPanel>
        }
      />
      <List.Item
        icon={Icon.Bird}
        title="Rephrase"
        actions={
          <ActionPanel>
            <Action.Push title="Show Rephrase" target={<Detail markdown={`# ${rephrasal}`} />} />
          </ActionPanel>
        }
      />
    </List>
  );
};

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

export default Command;

// export { Command };

// export default function Command() {
//   return (
//     <List>
//       <List.Item
//         icon={Icon.Bird}
//         title="Greeting!"
//         actions={
//           <ActionPanel>
//             <Action.Push title="Show Details" target={<Detail markdown="# Hey! 👋" />} />
//           </ActionPanel>
//         }
//       />
//       <List.Item
//         icon={Icon.Bird}
//         title="Hello"
//         actions={
//           <ActionPanel>
//             <Action.Push title="Show Details" target={<Detail markdown="# Hello! 👋" />} />
//           </ActionPanel>
//         }
//       />
//     </List>
//   );
// }
