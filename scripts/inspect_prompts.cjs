const fs = require('fs');

const content = fs.readFileSync('C:\\Users\\MS Emon\\OneDrive\\Desktop\\Solar Workshop Prompt Pack V2.html', 'utf8');

function cleanHtmlText(html) {
  return html
    .replace(/<span class="h">/g, '')
    .replace(/<\/span>/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#x2F;/g, '/')
    .replace(/&#x60;/g, '`')
    .replace(/\r\n/g, '\n');
}

// Find all pre.prompt
const preRegex = /<pre class="prompt"[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/pre>/g;
let match;
const prompts = [];
while ((match = preRegex.exec(content)) !== null) {
  const id = match[1];
  const raw = match[2];
  const cleaned = cleanHtmlText(raw);
  prompts.push({ id, cleaned });
  console.log(`Prompt ID: ${id}, length: ${cleaned.length}`);
}

// Check if master prompt matches current AGENTS.md
const currentAgentsMd = fs.readFileSync('c:\\Users\\MS Emon\\OneDrive\\Desktop\\Commander Ayaan\\AGENTS.md', 'utf8').replace(/\r\n/g, '\n');
const masterPrompt = prompts.find(p => p.id === 'txt-master');

if (masterPrompt) {
  const masterText = masterPrompt.cleaned.trim();
  const currentText = currentAgentsMd.trim();
  console.log('Master prompt length:', masterText.length);
  console.log('Current AGENTS.md length:', currentText.length);
  console.log('Are they identical?:', masterText === currentText);
  if (masterText !== currentText) {
    // Find where they differ
    let diffIdx = 0;
    while (diffIdx < masterText.length && diffIdx < currentText.length && masterText[diffIdx] === currentText[diffIdx]) {
      diffIdx++;
    }
    console.log(`Diff at index ${diffIdx}:`);
    console.log('Master:', JSON.stringify(masterText.substring(diffIdx, diffIdx + 60)));
    console.log('Current:', JSON.stringify(currentText.substring(diffIdx, diffIdx + 60)));
  }
}

// Save Phase 1 prompt to docs/PHASE-1-SPEC.md or inspect it
const phase1 = prompts.find(p => p.id === 'txt-p1' || p.id.includes('1'));
if (phase1) {
  console.log(`Found Phase 1 prompt: ${phase1.id}`);
  fs.writeFileSync('c:\\Users\\MS Emon\\OneDrive\\Desktop\\Commander Ayaan\\docs\\PHASE-1-PROMPT.md', phase1.cleaned);
}
