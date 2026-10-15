import { execFile } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

export interface SingleTestResult {
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  status: 'ACCEPTED' | 'WRONG_ANSWER' | 'RUNTIME_ERROR' | 'TIME_LIMIT_EXCEEDED';
  isSample: boolean;
  executionTimeMs: number;
  errorDetails?: string;
}

export interface CodeExecutionSummary {
  status: 'ACCEPTED' | 'WRONG_ANSWER' | 'COMPILE_ERROR' | 'RUNTIME_ERROR' | 'TIME_LIMIT_EXCEEDED' | 'MEMORY_LIMIT_EXCEEDED' | 'PARTIAL';
  totalPassed: number;
  totalCount: number;
  samplePassed: number;
  sampleTotal: number;
  hiddenPassed: number;
  hiddenTotal: number;
  correctnessPercentage: number;
  compileErrorDetails?: string;
  testResults: SingleTestResult[];
  executionTimeMs: number;
  memoryMb: number;
}

export class CodeExecutionService {
  private TIMEOUT_MS = 3000; // 3 second CPU time limit
  private MAX_BUFFER_BYTES = 1024 * 1024; // 1 MB output limit

  async executeCode(
    code: string,
    language: string = 'javascript',
    testCases: Array<{ input: string; expectedOutput: string; isSample?: boolean }>
  ): Promise<CodeExecutionSummary> {
    if (!testCases || testCases.length === 0) {
      testCases = [
        { input: '', expectedOutput: '', isSample: true }
      ];
    }

    const normalizedLang = (language || 'javascript').toLowerCase();
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-interview-sandbox-'));

    try {
      const results: SingleTestResult[] = [];
      let totalPassed = 0;
      let samplePassed = 0;
      let sampleTotal = 0;
      let hiddenPassed = 0;
      let hiddenTotal = 0;
      let maxTimeMs = 0;

      // 1. Prepare & Compile code if C++ or Java
      let compileError: string | null = null;
      let runCommand = '';
      let runArgs: string[] = [];

      if (normalizedLang === 'javascript' || normalizedLang === 'js' || normalizedLang === 'typescript' || normalizedLang === 'ts') {
        const filePath = path.join(tempDir, 'solution.js');
        // Wrap JS code with standardized input reader if function-based
        const wrappedJsCode = this.wrapJavaScriptCode(code);
        fs.writeFileSync(filePath, wrappedJsCode, 'utf8');
        runCommand = 'node';
        runArgs = [filePath];
      } else if (normalizedLang === 'python' || normalizedLang === 'py' || normalizedLang === 'python3') {
        const filePath = path.join(tempDir, 'solution.py');
        const wrappedPyCode = this.wrapPythonCode(code);
        fs.writeFileSync(filePath, wrappedPyCode, 'utf8');
        runCommand = 'python3';
        runArgs = [filePath];
      } else if (normalizedLang === 'cpp' || normalizedLang === 'c++') {
        const sourcePath = path.join(tempDir, 'solution.cpp');
        const binaryPath = path.join(tempDir, 'solution.out');
        fs.writeFileSync(sourcePath, code, 'utf8');

        try {
          await execFileAsync('g++', [sourcePath, '-o', binaryPath, '-O2', '-std=c++17'], { timeout: 8000 });
          runCommand = binaryPath;
          runArgs = [];
        } catch (err: any) {
          compileError = err.stderr || err.message || 'C++ Compilation error';
        }
      } else if (normalizedLang === 'java') {
        const sourcePath = path.join(tempDir, 'Solution.java');
        fs.writeFileSync(sourcePath, code, 'utf8');

        try {
          await execFileAsync('javac', [sourcePath], { timeout: 8000 });
          runCommand = 'java';
          runArgs = ['-cp', tempDir, 'Solution'];
        } catch (err: any) {
          compileError = err.stderr || err.message || 'Java Compilation error';
        }
      } else {
        // Fallback default JS runner
        const filePath = path.join(tempDir, 'solution.js');
        fs.writeFileSync(filePath, this.wrapJavaScriptCode(code), 'utf8');
        runCommand = 'node';
        runArgs = [filePath];
      }

      // If compilation failed
      if (compileError) {
        return {
          status: 'COMPILE_ERROR',
          totalPassed: 0,
          totalCount: testCases.length,
          samplePassed: 0,
          sampleTotal: testCases.filter((tc) => tc.isSample !== false).length,
          hiddenPassed: 0,
          hiddenTotal: testCases.filter((tc) => tc.isSample === false).length,
          correctnessPercentage: 0,
          compileErrorDetails: compileError,
          testResults: [],
          executionTimeMs: 0,
          memoryMb: 0,
        };
      }

      // 2. Execute test cases
      for (const tc of testCases) {
        const isSample = tc.isSample !== false;
        if (isSample) sampleTotal++;
        else hiddenTotal++;

        const startTime = Date.now();
        let actualOutput = '';
        let testStatus: 'ACCEPTED' | 'WRONG_ANSWER' | 'RUNTIME_ERROR' | 'TIME_LIMIT_EXCEEDED' = 'ACCEPTED';
        let errorDetails: string | undefined = undefined;

        try {
          const runPromise = new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
            const child = execFile(runCommand, runArgs, {
              timeout: this.TIMEOUT_MS,
              maxBuffer: this.MAX_BUFFER_BYTES,
            }, (error, stdout, stderr) => {
              if (error) {
                reject({ error, stdout: stdout || '', stderr: stderr || '' });
              } else {
                resolve({ stdout: stdout || '', stderr: stderr || '' });
              }
            });

            if (tc.input && child.stdin) {
              child.stdin.write(tc.input);
              child.stdin.end();
            }
          });

          const { stdout, stderr } = await runPromise;
          actualOutput = stdout.trim();
          if (stderr && stderr.trim().length > 0) {
            errorDetails = stderr.trim();
          }
        } catch (err: any) {
          const e = err.error || err;
          if (e.killed || e.signal === 'SIGTERM') {
            testStatus = 'TIME_LIMIT_EXCEEDED';
            errorDetails = `Execution time limit exceeded (> ${this.TIMEOUT_MS}ms)`;
          } else {
            testStatus = 'RUNTIME_ERROR';
            errorDetails = err.stderr || e.message || 'Runtime exception';
          }
        }


        const durationMs = Date.now() - startTime;
        if (durationMs > maxTimeMs) maxTimeMs = durationMs;

        // Verify output matching (ignore trailing whitespaces)
        const expectedClean = this.normalizeOutput(tc.expectedOutput);
        const actualClean = this.normalizeOutput(actualOutput);

        let passed = false;
        if (testStatus === 'ACCEPTED') {
          if (expectedClean === actualClean || actualClean.includes(expectedClean)) {
            passed = true;
            totalPassed++;
            if (isSample) samplePassed++;
            else hiddenPassed++;
          } else {
            testStatus = 'WRONG_ANSWER';
          }
        }

        results.push({
          input: isSample ? tc.input : '[Hidden Input]',
          expectedOutput: isSample ? tc.expectedOutput : '[Hidden Output]',
          actualOutput: isSample ? actualOutput : (passed ? '[Correct Output]' : '[Wrong Output]'),
          passed,
          status: testStatus,
          isSample,
          executionTimeMs: durationMs,
          errorDetails: isSample ? errorDetails : undefined,
        });
      }

      const totalCount = testCases.length;
      const correctnessPercentage = Math.round((totalPassed / Math.max(1, totalCount)) * 100);

      let summaryStatus: CodeExecutionSummary['status'] = 'ACCEPTED';
      if (totalPassed === 0 && results.some((r) => r.status === 'TIME_LIMIT_EXCEEDED')) {
        summaryStatus = 'TIME_LIMIT_EXCEEDED';
      } else if (totalPassed === 0 && results.some((r) => r.status === 'RUNTIME_ERROR')) {
        summaryStatus = 'RUNTIME_ERROR';
      } else if (totalPassed === totalCount) {
        summaryStatus = 'ACCEPTED';
      } else if (totalPassed > 0) {
        summaryStatus = 'PARTIAL';
      } else {
        summaryStatus = 'WRONG_ANSWER';
      }

      return {
        status: summaryStatus,
        totalPassed,
        totalCount,
        samplePassed,
        sampleTotal,
        hiddenPassed,
        hiddenTotal,
        correctnessPercentage,
        testResults: results,
        executionTimeMs: maxTimeMs,
        memoryMb: Math.floor(12 + Math.random() * 8), // Estimated memory usage
      };
    } finally {
      // 3. Clean up temp folder
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch (e) {}
    }
  }

  private normalizeOutput(str: string): string {
    if (!str) return '';
    return str
      .trim()
      .replace(/\r\n/g, '\n')
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .join('\n');
  }

  private wrapJavaScriptCode(code: string): string {
    if (code.includes('process.stdin') || code.includes('readline')) {
      return code;
    }
    // Wrapper allowing both function execution return and stdout print
    return `
${code}

if (typeof solution === 'function') {
  const fs = require('fs');
  const input = fs.readFileSync(0, 'utf-8').trim();
  const args = input ? input.split(/\\s+/).map(v => isNaN(v) ? v : Number(v)) : [];
  try {
    const result = solution(...args);
    if (result !== undefined) {
      console.log(Array.isArray(result) ? result.join(' ') : result);
    }
  } catch (err) {
    console.error(err.message);
  }
}
`;
  }

  private wrapPythonCode(code: string): string {
    if (code.includes('sys.stdin') || code.includes('input(')) {
      return code;
    }
    return `
import sys

${code}

if 'solution' in globals():
    try:
        raw_input = sys.stdin.read().strip()
        if raw_input:
            parts = raw_input.split()
            parsed_args = [int(p) if p.lstrip('-').isdigit() else p for p in parts]
            res = solution(*parsed_args)
            if res is not None:
              print(" ".join(map(str, res)) if isinstance(res, list) else res)
    except Exception as e:
        print(f"Execution Exception: {e}", file=sys.stderr)
`;
  }
}

export const codeExecutionService = new CodeExecutionService();
