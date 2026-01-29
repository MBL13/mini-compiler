import * as fs from "fs";
import * as path from "path";

export class Preprocessor {
  private defines = new Map<string, string>();
  private includedFiles = new Set<string>();

  constructor(private includeDirs: string[] = []) {}

  processFile(filePath: string): string {
    const abs = path.resolve(filePath);
    const baseDir = path.dirname(abs);

    if (this.includedFiles.has(abs)) {
      return ""; 
    }
    this.includedFiles.add(abs);

    let src = fs.readFileSync(abs, "utf-8");

    src = this.removeComments(src);

    const lines = src.split(/\r?\n/);
    const output: string[] = [];

    for (let line of lines) {
      line = line.trim();

      const inc = line.match(/^#include\s+["<](.+)[">]$/);
      if (inc && inc[1]) {
      const includePath = this.resolveInclude(inc[1], baseDir);
      output.push(this.processFile(includePath));
      continue;
      }

      const def = line.match(/^#define\s+(\w+)\s+(.*)$/);
      if (def && def[1] && def[2] !== undefined) {
      this.defines.set(def[1], def[2]);
      continue;
      }

      line = this.applyDefines(line);

      if (line.length > 0) {
        output.push(line);
      }
    }

    return output.join("\n");
  }

  private removeComments(src: string): string {
    src = src.replace(/\/\/.*$/gm, "");
    src = src.replace(/\/\*[\s\S]*?\*\//g, "");
    return src;
  }

  private applyDefines(line: string): string {
    for (const [key, value] of this.defines) {
      const re = new RegExp(`\\b${key}\\b`, "g");
      line = line.replace(re, value);
    }
    return line;
  }

  private resolveInclude(name: string, baseDir: string): string {
    const local = path.join(baseDir, name);
    if (fs.existsSync(local)) return local;

    for (const dir of this.includeDirs) {
      const guess = path.join(dir, name);
      if (fs.existsSync(guess)) return guess;
    }

    throw new Error(`Arquivo incluído não encontrado: ${name}`);
  }
}
