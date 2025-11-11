import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProgressBar from './ProgressBar';
import StepList, { Step } from './StepList';
import Confetti from './Confetti';
import { TerminalViewer } from './TerminalViewer';
import { PROJECT_CONFIG, isConfigured } from '../config/project';

type PageStatus = 'building' | 'finalizing' | 'launching' | 'live' | 'error' | 'offline';
type ViewMode = 'steps' | 'logs';

export function BuildingPage() {
  const { name: projectName, description, prompt, createdAt, slug, executionId, mcpApiUrl } = PROJECT_CONFIG;
  const [progress, setProgress] = useState(0);
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState('');
  const [eta, setEta] = useState('');
  const [status, setStatus] = useState<PageStatus>('building');
  const [showConfetti, setShowConfetti] = useState(false);
  const [healthCheckFailed, setHealthCheckFailed] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('steps');

  const projectUrl = `https://${slug}.vps.naltpom.fr`;

  // SSE для real-time progress
  useEffect(() => {
    if (!executionId || !mcpApiUrl) return;

    const eventSource = new EventSource(
      `${mcpApiUrl}/api/executions/${executionId}/stream`
    );

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'progress') {
          setProgress(data.percentage || 0);
          setCurrentStep(data.current_step || '');
          setEta(data.eta_human || '');
        }

        if (data.type === 'steps') {
          setSteps(data.steps || []);
        }

        if (data.type === 'complete') {
          setProgress(100);
          setStatus('finalizing');
          setTimeout(() => {
            setStatus('launching');
            startHealthCheck();
          }, 2000);
        }

        if (data.type === 'error') {
          setStatus('error');
        }
      } catch (err) {
        console.error('Error parsing SSE data:', err);
      }
    };

    eventSource.onerror = () => {
      console.error('SSE connection error');
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [executionId, mcpApiUrl]);

  // Health check для проверки когда site up
  const startHealthCheck = () => {
    let attempts = 0;
    const maxAttempts = 60; // 2 minutes max

    const interval = setInterval(async () => {
      attempts++;

      try {
        const response = await fetch(`${projectUrl}/health`, {
          method: 'GET',
          cache: 'no-cache',
        });

        if (response.ok) {
          clearInterval(interval);
          setStatus('live');
          setShowConfetti(true);

          // Auto-reload after 3 seconds
          setTimeout(() => {
            window.location.href = projectUrl;
          }, 3000);
        }
      } catch (err) {
        if (attempts >= maxAttempts) {
          clearInterval(interval);
          setStatus('error');
          setHealthCheckFailed(true);
        }
      }
    }, 2000); // Check every 2 seconds
  };

  // Периодический ping если container down
  useEffect(() => {
    if (status !== 'offline') return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${projectUrl}/health`);
        if (response.ok) {
          window.location.reload();
        }
      } catch (err) {
        // Still offline
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [status, projectUrl]);

  const statusMessages = {
    building: 'Construction en cours',
    finalizing: 'Finalisation...',
    launching: 'Le site se lance...',
    live: 'Site lancé !',
    error: 'Erreur lors de la construction',
    offline: 'Site temporairement indisponible',
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl space-y-8 relative z-10"
      >
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.div
            className="inline-block text-6xl mb-4"
            animate={{
              rotate: status === 'building' ? 360 : 0,
            }}
            transition={{
              duration: 2,
              repeat: status === 'building' ? Infinity : 0,
              ease: 'linear',
            }}
          >
            🚧
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-bold text-gradient">
            {projectName}
          </h1>

          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            {description}
          </p>

          {prompt && isConfigured(prompt) && (
            <div className="mt-4 max-w-2xl mx-auto bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
              <p className="text-sm text-gray-400 mb-2">📝 Prompt utilisateur :</p>
              <p className="text-sm text-gray-300 whitespace-pre-wrap text-left">{prompt}</p>
            </div>
          )}

          <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mt-4">
            <span>🕐</span>
            <span>Créé le {isConfigured(createdAt) ? new Date(createdAt).toLocaleString('fr-FR') : 'En cours...'}</span>
          </div>
        </div>

        {/* Status message */}
        <motion.div
          key={status}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-lg font-medium text-blue-300">
            {statusMessages[status]}
          </p>
          {eta && status === 'building' && (
            <p className="text-sm text-gray-400 mt-1">Temps restant estimé : {eta}</p>
          )}
        </motion.div>

        {/* Progress bar */}
        {status !== 'live' && status !== 'error' && (
          <ProgressBar percentage={progress} />
        )}

        {/* Toggle Steps / Logs */}
        {status === 'building' && isConfigured(executionId) && (
          <div className="flex justify-center gap-2">
            <button
              onClick={() => setViewMode('steps')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                viewMode === 'steps'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              📊 Étapes
            </button>
            <button
              onClick={() => setViewMode('logs')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                viewMode === 'logs'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              📜 Logs
            </button>
          </div>
        )}

        {/* Steps list */}
        {viewMode === 'steps' && steps.length > 0 && status === 'building' && (
          <StepList steps={steps} />
        )}

        {/* Terminal Viewer (Logs) */}
        {viewMode === 'logs' && status === 'building' && isConfigured(executionId) && (
          <div className="w-full max-w-4xl mx-auto">
            <TerminalViewer />
          </div>
        )}

        {/* Call to action buttons */}
        <AnimatePresence>
          {status === 'live' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center space-y-4"
            >
              <motion.a
                href={projectUrl}
                className="inline-block px-8 py-4 bg-gradient-to-r from-blue-500 to-violet-500 rounded-full font-semibold text-white shadow-lg hover:shadow-xl transition-shadow"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🚀 Voir le site
              </motion.a>

              <p className="text-sm text-gray-400">
                Redirection automatique dans 3 secondes...
              </p>
            </motion.div>
          )}

          {status === 'offline' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center space-y-4"
            >
              <p className="text-yellow-400">
                Le serveur est temporairement indisponible
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                🔄 Recharger la page
              </button>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center space-y-4"
            >
              <p className="text-red-400">
                {healthCheckFailed
                  ? 'Le site ne répond pas après 2 minutes'
                  : 'Une erreur est survenue lors de la construction'}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                🔄 Réessayer
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Current step indicator */}
        {currentStep && status === 'building' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-sm text-gray-400"
          >
            {currentStep}
          </motion.div>
        )}
      </motion.div>

      {/* Confetti animation */}
      {showConfetti && <Confetti />}
    </div>
  );
}
