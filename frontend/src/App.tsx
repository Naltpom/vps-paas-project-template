import BuildingPage from './components/BuildingPage';
import './App.css';

// Configuration injectée par customize-template.sh
const PROJECT_CONFIG = {
  name: '{{PROJECT_NAME}}',
  description: '{{DESCRIPTION}}',
  createdAt: '{{CREATED_AT}}',
  slug: '{{SLUG}}',
  executionId: '{{EXECUTION_ID}}',
  mcpApiUrl: '{{MCP_API_URL}}',
};

function App() {
  // Si execution ID est présent et non vide (pas un placeholder), montrer BuildingPage
  const isBuilding = PROJECT_CONFIG.executionId &&
                     PROJECT_CONFIG.executionId !== '{{EXECUTION_ID}}' &&
                     PROJECT_CONFIG.executionId !== '';

  if (isBuilding) {
    return (
      <BuildingPage
        projectName={PROJECT_CONFIG.name}
        description={PROJECT_CONFIG.description}
        createdAt={PROJECT_CONFIG.createdAt}
        slug={PROJECT_CONFIG.slug}
        executionId={PROJECT_CONFIG.executionId}
        mcpApiUrl={PROJECT_CONFIG.mcpApiUrl}
      />
    );
  }

  // Fallback : application normale (après que Claude a construit)
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold text-gradient">
          {PROJECT_CONFIG.name}
        </h1>
        <p className="text-xl text-gray-300">
          {PROJECT_CONFIG.description}
        </p>
        <p className="text-gray-400">
          🎉 Votre application est prête !
        </p>
      </div>
    </div>
  );
}

export default App;
