import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';
import { fileURLToPath } from 'url';

interface Issue {
  file: string;
  line: number;
  column: number;
  text: string;
  type: 'StringLiteral' | 'JsxText';
}

export function scanFile(filePath: string, sourceCode?: string): Issue[] {
  const content = sourceCode ?? fs.readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true
  );

  const issues: Issue[] = [];

  function isI18nCall(node: ts.Node): boolean {
    if (ts.isCallExpression(node)) {
      const { expression } = node;
      if (ts.isIdentifier(expression)) {
        return ['t', 'dict'].includes(expression.text);
      }
      if (ts.isPropertyAccessExpression(expression) && (ts.isIdentifier(expression.expression) && expression.expression.text === 'console')) {
        return true;
      }
    }
    return false;
  }

  function isValidAttribute(node: ts.Node): boolean {
    if (ts.isJsxAttribute(node)) {
      const name = node.name.getText();
      // Attributes that usually contain user-visible text
      const textAttributes = ['placeholder', 'alt', 'title', 'aria-label', 'label'];
      return !textAttributes.includes(name);
    }
    return false;
  }

  function visit(node: ts.Node) {
    if (ts.isStringLiteral(node)) {
      const { text, parent } = node;

      // Ignore empty strings
      if (!text.trim()) return;

      // 1. Ignore imports/exports
      if (ts.isImportDeclaration(parent) || ts.isExportDeclaration(parent) || ts.isExternalModuleReference(parent) || ts.isModuleDeclaration(parent)) return;
      if (ts.isLiteralTypeNode(parent)) return; // type T = "literal"

      // 2. Ignore object property keys
      if (ts.isPropertyAssignment(parent) && parent.name === node) return;

      // 3. Ignore specific function calls (t, dict, console)
      // Check if direct parent is call expression (arg) or if it's inside an array/object passed to call
      let current = parent;
      while (current) {
        if (ts.isCallExpression(current)) {
          if (isI18nCall(current)) return;
          // Stop going up if we hit a block or function
          break;
        }
        if (ts.isBlock(current) || ts.isFunctionDeclaration(current) || ts.isArrowFunction(current) || ts.isJsxElement(current)) break;
        current = current.parent;
      }

      // 4. Ignore JSX Attributes that are not text-related
      if (ts.isJsxAttribute(parent)) {
        if (isValidAttribute(parent)) return;
      }

      // 5. Ignore technical strings (simple heuristic: no spaces, snake_case or camelCase)
      // This is risky but often needed. Let's stick to the user requirement: "i18n olmayan string literal"
      // If we are strict, we report everything.
      // Let's report it if it's not excluded above.

      const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
      issues.push({
        file: filePath,
        line: line + 1,
        column: character + 1,
        text: text,
        type: 'StringLiteral'
      });
    } else if (ts.isJsxText(node)) {
      const { text } = node;
      if (text.trim().length > 0) {
        const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
        issues.push({
          file: filePath,
          line: line + 1,
          column: character + 1,
          text: text.trim(),
          type: 'JsxText'
        });
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return issues;
}

function getAllFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
        getAllFiles(filePath, fileList);
      }
    }
    else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

// Main execution if run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const jsonOutput = args.includes('--json');

  const rootDir = process.cwd();
  // Scan app and components folders
  const dirsToScan = [path.join(rootDir, 'app'), path.join(rootDir, 'components')];

  let allIssues: Issue[] = [];

  dirsToScan.forEach(dir => {
    if (fs.existsSync(dir)) {
      const files = getAllFiles(dir);
      files.forEach(file => {
        allIssues = allIssues.concat(scanFile(file));
      });
    }
  });

  if (jsonOutput) {
    console.log(JSON.stringify(allIssues, null, 2));
  }
  else if (allIssues.length > 0) {
    console.log('Hardcoded strings found:');
    allIssues.forEach(issue => {
      console.log(`${issue.file}:${issue.line}:${issue.column} - [${issue.type}] "${issue.text}"`);
    });
    console.log(`\nTotal issues: ${allIssues.length}`);
    process.exit(1);
  }
  else {
    console.log('No hardcoded strings found.');
  }
  if (allIssues.length > 0) {
    process.exit(1);
  }
}
