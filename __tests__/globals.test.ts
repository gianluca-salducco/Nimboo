import fs from "fs";
import path from "path";

const css = fs.readFileSync(path.join(__dirname, "../app/globals.css"), "utf-8");
const wizardSrc = fs.readFileSync(path.join(__dirname, "../components/WizardForm.tsx"), "utf-8");
const recPageSrc = fs.readFileSync(path.join(__dirname, "../app/recommendation/page.tsx"), "utf-8");

function bodyBlock(src: string): string {
  return src.match(/body\s*\{([^}]*)\}/)?.[1] ?? "";
}

test("globals.css: body has cream background-color", () => {
  expect(bodyBlock(css)).toMatch(/background-color\s*:\s*#FAF7F2/);
});

test("globals.css: body has grain texture via background-image", () => {
  expect(bodyBlock(css)).toMatch(/background-image\s*:/);
});

test("WizardForm: outer container has no bare bg-white override", () => {
  // bg-white/60 on the textarea is fine; a bare bg-white on a main container would override the global body background
  const outerContainerLine = wizardSrc.match(/className="[^"]*min-h-screen[^"]*"/)?.[0] ?? "";
  expect(outerContainerLine).not.toMatch(/\bbg-white\b(?!\/)/);
});

test("recommendation page: outer container has no bare bg-white override", () => {
  const outerContainerLine = recPageSrc.match(/className="[^"]*min-h-screen[^"]*"/)?.[0] ?? "";
  expect(outerContainerLine).not.toMatch(/\bbg-white\b(?!\/)/);
});
