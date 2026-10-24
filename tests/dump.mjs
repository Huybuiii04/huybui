import { readFileSync } from 'node:fs'
const j = JSON.parse(readFileSync('D:/ielts/debai/task1/IELTS_Task1_7_Types_70_Prompts.json', 'utf8'))
for (const [i, p] of j.prompts.entries()) {
  console.log(`${i + 1}|${p.id}|${p.type}|${p.source === 'Cambridge Original' ? 'CAM' : 'NEW'}|${p.title}|${p.prompt.slice(0, 95)}`)
}
