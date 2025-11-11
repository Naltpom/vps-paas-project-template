/**
 * Project Configuration
 * These values are injected by the customize-template script
 */

export const PROJECT_CONFIG = {
  name: '{{PROJECT_NAME}}',
  description: '{{DESCRIPTION}}',
  prompt: '{{PROMPT}}',
  slug: '{{SLUG}}',
  createdAt: '{{CREATED_AT}}',
  executionId: '{{EXECUTION_ID}}',
  mcpApiUrl: '{{MCP_API_URL}}',
};

/**
 * Check if a config value has been replaced (not a placeholder)
 */
export const isConfigured = (value: string): boolean => {
  return Boolean(value && !value.startsWith('{{') && !value.endsWith('}}'));
};

/**
 * Check if the project is in building mode
 */
export const isBuilding = (): boolean => {
  return isConfigured(PROJECT_CONFIG.executionId);
};
