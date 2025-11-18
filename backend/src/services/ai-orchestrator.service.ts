import { spawn } from 'child_process';
import path from 'path';
import { AppDataSource } from '../config/database';
import { AIInteraction } from '../entities/AIInteraction';

/**
 * AI Orchestrator Service
 * Bridges Node.js to Python ADK for AI processing
 */
export class AIOrchestratorService {
  private pythonPath: string;
  private adkPath: string;

  constructor() {
    // Path to Python ADK directory
    this.adkPath = path.join(__dirname, '../../../adk');
    this.pythonPath = process.env.PYTHON_PATH || 'python3';
  }

  /**
   * Process customer message with AI
   * @param params - Message processing parameters
   * @returns AI response with metadata
   */
  async processMessage(params: {
    customerMessage: string;
    conversationId: string;
    businessId: string;
    customerId: string;
  }): Promise<{
    success: boolean;
    response: string;
    confidence: number;
    toolsUsed: string[];
    processingTimeMs: number;
    modelUsed: string;
    shouldEscalate: boolean;
    error?: string;
  }> {
    const startTime = Date.now();

    try {
      console.log('🤖 Processing message with AI orchestrator...');

      // Call Python ADK
      const result = await this.runPythonADK({
        customer_message: params.customerMessage,
        conversation_id: params.conversationId,
        business_id: params.businessId,
        customer_id: params.customerId,
      });

      const totalTime = Date.now() - startTime;

      console.log(`✅ AI processing complete in ${totalTime}ms`);
      console.log(`   Confidence: ${result.confidence.toFixed(2)}`);
      console.log(`   Tools used: ${result.tools_used.join(', ') || 'none'}`);
      console.log(`   Should escalate: ${result.should_escalate}`);

      // Save AI interaction to database
      await this.logAIInteraction({
        conversationId: params.conversationId,
        customerMessage: params.customerMessage,
        aiResponse: result.response,
        confidenceScore: result.confidence,
        toolsUsed: result.tools_used,
        processingTimeMs: totalTime,
        modelUsed: result.model_used,
        wasEscalated: result.should_escalate,
      });

      return {
        success: result.success,
        response: result.response,
        confidence: result.confidence,
        toolsUsed: result.tools_used,
        processingTimeMs: totalTime,
        modelUsed: result.model_used,
        shouldEscalate: result.should_escalate,
      };
    } catch (error) {
      console.error('❌ Error in AI orchestrator:', error);

      return {
        success: false,
        response:
          "I apologize, but I'm having trouble processing your message right now. Let me connect you with our team.",
        confidence: 0.0,
        toolsUsed: [],
        processingTimeMs: Date.now() - startTime,
        modelUsed: 'error',
        shouldEscalate: true,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Run Python ADK script
   * @param data - Input data for ADK
   * @returns Parsed result from Python
   */
  private async runPythonADK(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const scriptPath = path.join(this.adkPath, 'main.py');

      const python = spawn(this.pythonPath, [
        scriptPath,
        '--action',
        'process_message',
        '--data',
        JSON.stringify(data),
      ]);

      let output = '';
      let errorOutput = '';

      python.stdout.on('data', (data) => {
        output += data.toString();
      });

      python.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      python.on('close', (code) => {
        if (code === 0) {
          try {
            // Extract JSON from output (last line should be JSON)
            const lines = output.trim().split('\n');
            const jsonLine = lines[lines.length - 1];
            const result = JSON.parse(jsonLine);
            resolve(result);
          } catch (error) {
            reject(new Error(`Failed to parse Python output: ${output}`));
          }
        } else {
          reject(
            new Error(`Python process failed with code ${code}: ${errorOutput}`)
          );
        }
      });

      python.on('error', (error) => {
        reject(new Error(`Failed to spawn Python process: ${error.message}`));
      });
    });
  }

  /**
   * Log AI interaction to database for analytics
   */
  private async logAIInteraction(data: {
    conversationId: string;
    customerMessage: string;
    aiResponse: string;
    confidenceScore: number;
    toolsUsed: string[];
    processingTimeMs: number;
    modelUsed: string;
    wasEscalated: boolean;
  }): Promise<void> {
    try {
      const aiInteractionRepo = AppDataSource.getRepository(AIInteraction);

      const interaction = aiInteractionRepo.create({
        conversation_id: data.conversationId,
        customer_message: data.customerMessage,
        ai_response: data.aiResponse,
        confidence_score: data.confidenceScore,
        tools_used: data.toolsUsed,
        processing_time_ms: data.processingTimeMs,
        model_used: data.modelUsed,
        was_escalated: data.wasEscalated,
      });

      await aiInteractionRepo.save(interaction);
    } catch (error) {
      console.error('❌ Error logging AI interaction:', error);
      // Don't throw - logging failure shouldn't break the flow
    }
  }

  /**
   * Check if Python environment is ready
   * @returns true if Python and dependencies are available
   */
  async checkPythonEnvironment(): Promise<boolean> {
    try {
      const python = spawn(this.pythonPath, ['--version']);

      return new Promise((resolve) => {
        python.on('close', (code) => {
          resolve(code === 0);
        });

        python.on('error', () => {
          resolve(false);
        });
      });
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const aiOrchestratorService = new AIOrchestratorService();
