// Mock code execution service for testing when Judge0 is not available

class MockCodeExecutionService {
  /**
   * Mock code execution
   */
  async executeCode(code, language, stdin = '') {
    // Simulate execution delay
    await this.sleep(1000 + Math.random() * 1000);

    // Mock different outcomes based on code content
    if (code.includes('error') || code.includes('throw')) {
      return {
        status: 'Runtime Error',
        stdout: '',
        stderr: 'Mock runtime error occurred',
        compile_output: '',
        time: 0.1,
        memory: 1024,
        exit_code: 1,
      };
    }

    if (code.includes('infinite') || code.includes('while(true)')) {
      return {
        status: 'Time Limit Exceeded',
        stdout: '',
        stderr: 'Time limit exceeded',
        compile_output: '',
        time: 2.0,
        memory: 2048,
        exit_code: -1,
      };
    }

    // Generate mock output based on language
    let mockOutput = this.generateMockOutput(code, language, stdin);

    return {
      status: 'Accepted',
      stdout: mockOutput,
      stderr: '',
      compile_output: '',
      time: 0.1 + Math.random() * 0.5,
      memory: 1024 + Math.random() * 1024,
      exit_code: 0,
    };
  }

  /**
   * Mock execution with test cases
   */
  async executeWithTestCases(code, language, testCases) {
    const results = [];
    let passedCount = 0;

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];

      // Simulate some test cases passing and some failing
      const shouldPass = Math.random() > 0.3; // 70% pass rate

      const result = await this.executeCode(code, language, testCase.input);

// Mock the output to match expecte