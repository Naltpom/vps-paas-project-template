# VPS MCP PaaS - Template Repository Implementation Status

**Date**: 2025-11-09
**Context**: Transition from Claude CLI generation to GitHub template-based workflow

---

## ✅ COMPLETED

### 1. Template Repository Created (100%)

**Location**: `/home/ubuntu/templates/vps-paas-project-template/`

**Structure complète** (~35 fichiers):

```
vps-paas-project-template/
├── backend/                    # Express.js + TypeScript
│   ├── src/
│   │   ├── index.ts           # Entry point (Express server)
│   │   ├── config/
│   │   │   └── environment.ts # Zod validation
│   │   ├── routes/
│   │   │   ├── health.ts      # /health endpoint (HEALTHCHECK)
│   │   │   └── api.ts         # API routes
│   │   ├── middleware/
│   │   │   ├── error-handler.ts
│   │   │   └── logger.ts
│   │   └── utils/
│   ├── tests/
│   ├── Dockerfile             # Multi-stage, Alpine, non-root
│   ├── .dockerignore
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── frontend/                   # React + Vite
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx            # Connects to backend API
│   │   ├── index.css
│   │   ├── App.css
│   │   ├── components/
│   │   ├── pages/
│   │   └── lib/
│   ├── public/
│   ├── Dockerfile             # Multi-stage: Vite build + Nginx
│   ├── nginx.conf             # Security headers, SPA routing
│   ├── .dockerignore
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   └── index.html
│
├── scripts/
│   └── customize-template.sh  # Replace {{placeholders}}
│
├── .github/
│   └── workflows/             # (empty, to be added later)
│
├── docker-compose.yml         # Dev: backend + frontend + postgres
├── README.md                  # Full documentation
├── LICENSE                    # MIT
└── .gitignore
```

**Placeholders utilisés**:
- `{{PROJECT_NAME}}` → Nom du projet
- `{{DESCRIPTION}}` → Description du projet

**Features Backend**:
- ✅ Express.js + TypeScript
- ✅ Zod pour validation env vars
- ✅ Health check `/health` (required for Docker HEALTHCHECK)
- ✅ Error handling middleware
- ✅ Request logging
- ✅ Security: Helmet, CORS
- ✅ PostgreSQL ready (pg client)
- ✅ Dockerfile multi-stage (Node 22 Alpine, non-root)

**Features Frontend**:
- ✅ React 18 + Vite
- ✅ TypeScript
- ✅ API client pre-configured
- ✅ Nginx avec security headers (CSP, HSTS, X-Frame-Options)
- ✅ SPA routing (try_files fallback)
- ✅ Gzip compression
- ✅ Dockerfile multi-stage (Vite build + Nginx Alpine)

**DevOps**:
- ✅ docker-compose.yml pour dev local (backend + frontend + postgres)
- ✅ Dockerfiles optimisés production
- ✅ Health checks configurés
- ✅ Script de customization

**Script de génération**: `/home/ubuntu/templates/generate-template-files.sh`

---

## 🎯 TODO - PHASE B: Push Template sur GitHub

### Réponses aux questions:
- **Username GitHub**: `Naltpom`
- **Visibility template**: Public ✅
- **Créer repo pour chaque projet**: Oui, toujours en **private** ✅
- **Garder frontend toujours**: Oui, même si pas utilisé ✅

### Étapes:

**1. Init Git et premier commit** (30s)
```bash
cd /home/ubuntu/templates/vps-paas-project-template

git init
git add .
git commit -m "Initial commit: VPS PaaS Production-Ready Template

Features:
- Backend: Express.js + TypeScript + PostgreSQL
- Frontend: React + Vite + Nginx
- Security: Helmet, CORS, non-root containers, read-only FS
- DevOps: Multi-stage Dockerfiles, docker-compose
- Health checks and monitoring ready
- Customization script with placeholders
"
```

**2. Créer repo GitHub** (1min)
```bash
# Via GitHub CLI (recommandé si installé sur VPS)
gh repo create Naltpom/vps-paas-project-template \
  --public \
  --description "Production-ready fullstack template for VPS MCP PaaS deployment" \
  --source=. \
  --push

# OU manuellement:
# 1. Créer repo via https://github.com/new
#    - Owner: Naltpom
#    - Name: vps-paas-project-template
#    - Public
#    - NO README, NO .gitignore, NO LICENSE (already exist)
# 2. Puis:
git remote add origin git@github.com:Naltpom/vps-paas-project-template.git
git branch -M main
git push -u origin main
```

**3. Activer Template Repository** (30s)
```bash
# Via GitHub CLI
gh repo edit Naltpom/vps-paas-project-template --template

# OU manuellement:
# GitHub → Settings → Template repository ☑️
```

**4. Ajouter topics** (optionnel mais recommandé)
```bash
gh repo edit Naltpom/vps-paas-project-template \
  --add-topic nodejs,typescript,react,vite,express,docker,paas,template,fullstack
```

---

## 🎯 TODO - PHASE C: Modifier create-project.ts

### Architecture du nouveau workflow

**AVANT (actuel)**:
```
User: create-project "My Blog"
  ↓ (10 minutes, imprévisible)
Claude CLI génère code depuis scratch
  ↓
Code créé dans /home/ubuntu/apps/{slug}
  ↓
User: init-server {slug}
  ↓
Déploiement
```

**APRÈS (nouveau)**:
```
User: create-project "My Blog"
  ↓ (30 secondes, prévisible)
1. Clone template depuis GitHub
2. Customize placeholders
3. Git init nouveau projet
4. (Optionnel) Créer repo GitHub private pour ce projet
  ↓
Code prêt dans /home/ubuntu/apps/{slug}
  ↓
User: init-server {slug}
  ↓
Déploiement
```

### Modifications à apporter dans `/home/ubuntu/apps/vps-mcp-paas/src/mcp/tools/create-project.ts`

**1. Ajouter nouveau paramètre dans inputSchema**:

```typescript
inputSchema: {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      description: 'Project name (required)',
    },
    description: {
      type: 'string',
      description: 'Project description (optional)',
    },
    needs_database: {
      type: 'string',
      enum: ['postgres', 'mysql', 'mongodb'],
      description: 'Database type if needed (optional)',
    },
    // NOUVEAU
    use_template: {
      type: 'boolean',
      description: 'Use GitHub template repository (default: true). Set false for legacy Claude CLI generation.',
      default: true,
    },
    create_github_repo: {
      type: 'boolean',
      description: 'Auto-create private GitHub repository for this project (default: true)',
      default: true,
    },
  },
  required: ['name'],
}
```

**2. Modifier la logique handleCreateProject()**:

```typescript
export async function handleCreateProject(args: any): Promise<any> {
  // ... existing guard code ...

  try {
    // ================================================================
    // Create execution steps (différents selon mode)
    // ================================================================
    const stepNames = args.use_template !== false
      ? [
          'Validate input parameters',
          'Create project in database',
          'Clone template repository',
          'Customize template',
          'Remove frontend (if needed)',
          'Initialize git repository',
          'Create GitHub repository (optional)',
          'Update project metadata',
          'Finalize execution',
        ]
      : [
          // ... existing Claude CLI steps (legacy fallback)
          'Validate input parameters',
          'Create project in database',
          'Generate project structure',
          'Generate code with Claude CLI',
          'Update project metadata',
          'Finalize execution',
        ];

    await ExecutionStepModel.createSteps(execution.id, stepNames);

    // ... existing Step 1 & 2 (validation + DB creation) ...

    const slug = result.project.slug;
    projectDir = `/home/ubuntu/apps/${slug}`;

    // ================================================================
    // MODE A: Template-based (NEW - DEFAULT)
    // ================================================================
    if (args.use_template !== false) {

      // ================================================================
      // Step 3: Clone template repository
      // ================================================================
      await ExecutionStepModel.startStep(execution.id, 'Clone template repository');

      console.log(`📦 Cloning template repository for: ${slug}`);

      await execAsync(
        `git clone git@github.com:Naltpom/vps-paas-project-template.git ${projectDir}`,
        { timeout: 60000 }
      );

      // Remove .git directory (fresh start for new project)
      await execAsync(`rm -rf ${projectDir}/.git`);

      await ExecutionStepModel.completeStep(
        execution.id,
        'Clone template repository',
        `Template cloned to ${projectDir}`
      );

      // ================================================================
      // Step 4: Customize template
      // ================================================================
      await ExecutionStepModel.startStep(execution.id, 'Customize template');

      console.log(`🔧 Customizing template with project details...`);

      const description = args.description || 'A modern Node.js application';

      await execAsync(
        `cd ${projectDir} && ./scripts/customize-template.sh "${args.name}" "${description}"`,
        { timeout: 30000 }
      );

      await ExecutionStepModel.completeStep(
        execution.id,
        'Customize template',
        `Template customized with name="${args.name}"`
      );

      // ================================================================
      // Step 5: Remove frontend (if needed) - SKIPPED (always keep)
      // ================================================================
      await ExecutionStepModel.completeStep(
        execution.id,
        'Remove frontend (if needed)',
        'Frontend kept (always included)'
      );

      // ================================================================
      // Step 6: Initialize git repository
      // ================================================================
      await ExecutionStepModel.startStep(execution.id, 'Initialize git repository');

      console.log(`🔧 Initializing git for new project...`);

      await execAsync(
        `cd ${projectDir} && git init && git add . && git commit -m "Initial commit from template"`,
        { timeout: 30000 }
      );

      await ExecutionStepModel.completeStep(
        execution.id,
        'Initialize git repository',
        'Git repository initialized'
      );

      // ================================================================
      // Step 7: Create GitHub repository (optional)
      // ================================================================
      await ExecutionStepModel.startStep(execution.id, 'Create GitHub repository (optional)');

      let githubRepoUrl = null;

      if (args.create_github_repo !== false) {
        console.log(`🐙 Creating private GitHub repository: ${slug}...`);

        try {
          const { stdout } = await execAsync(
            `cd ${projectDir} && gh repo create Naltpom/${slug} --private --source=. --push`,
            { timeout: 60000 }
          );

          githubRepoUrl = `https://github.com/Naltpom/${slug}`;
          console.log(`✅ GitHub repository created: ${githubRepoUrl}`);

          await ExecutionStepModel.completeStep(
            execution.id,
            'Create GitHub repository (optional)',
            `GitHub repo created: ${githubRepoUrl}`
          );
        } catch (ghError) {
          console.warn('⚠️  GitHub repo creation failed (non-blocking):', ghError);
          await ExecutionStepModel.completeStep(
            execution.id,
            'Create GitHub repository (optional)',
            'GitHub repo creation skipped (error occurred)'
          );
        }
      } else {
        await ExecutionStepModel.completeStep(
          execution.id,
          'Create GitHub repository (optional)',
          'GitHub repo creation skipped (disabled)'
        );
      }

      // ================================================================
      // Step 8: Update project metadata
      // ================================================================
      await ExecutionStepModel.startStep(execution.id, 'Update project metadata');

      await ProjectModel.update(result.project.id, {
        github_url: githubRepoUrl || undefined,
        metadata: {
          code_generated: true,
          generation_mode: 'template',
          template_source: 'https://github.com/Naltpom/vps-paas-project-template',
          github_repo_url: githubRepoUrl,
          generated_at: new Date().toISOString(),
          project_path: projectDir,
        },
      });

      await ExecutionStepModel.completeStep(
        execution.id,
        'Update project metadata',
        'Project metadata updated with template source'
      );

    }
    // ================================================================
    // MODE B: Claude CLI generation (LEGACY FALLBACK)
    // ================================================================
    else {
      // ... existing code for Claude CLI generation ...
      // Keep existing implementation as fallback
    }

    // ================================================================
    // Step 9: Finalize execution
    // ================================================================
    await ExecutionStepModel.startStep(execution.id, 'Finalize execution');

    const urls = await ProjectUrlModel.findByProjectId(result.project.id);

    await AgentExecutionModel.saveResult(execution.id, {
      project_id: result.project.id,
      slug: result.project.slug,
      status: result.project.status,
      project_path: projectDir,
      code_generated: true,
      source: args.use_template !== false ? 'template' : 'claude-generation',
      template_url: args.use_template !== false
        ? 'https://github.com/Naltpom/vps-paas-project-template'
        : null,
      github_repo_url: result.project.github_url || null,
    });

    await ExecutionStepModel.completeStep(
      execution.id,
      'Finalize execution',
      `Project ${result.project.slug} created successfully`
    );

    return {
      success: true,
      message: args.use_template !== false
        ? 'Project created from template successfully'
        : 'Project generated with Claude CLI successfully',
      data: {
        id: result.project.id,
        name: result.project.name,
        slug: result.project.slug,
        status: result.project.status,
        project_path: projectDir,
        code_generated: true,
        generation_mode: args.use_template !== false ? 'template' : 'claude-generation',
        template_source: args.use_template !== false
          ? 'https://github.com/Naltpom/vps-paas-project-template'
          : null,
        github_repo_url: result.project.github_url || null,
        urls: urls.map(u => ({
          type: u.url_type,
          url: u.url,
          is_primary: u.is_primary,
        })),
        primary_url: result.defaultUrl,
        next_step: 'Use init-server tool to build Docker image and deploy this project to VPS',
      },
    };
  } catch (error) {
    // ... existing error handling ...
  }
}
```

**3. Ajouter github_repo_url à la base de données** (si pas déjà fait):

```sql
ALTER TABLE projects ADD COLUMN IF NOT EXISTS github_url TEXT;
```

**4. Rebuild container après modifications**:

```bash
cd /home/ubuntu/apps/vps-mcp-paas
docker compose down
docker compose up --build -d
```

---

## 🧪 TODO - PHASE D: Testing

### Test 1: Création projet avec template
```bash
curl -X POST http://localhost:3201/execute \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "create-project",
      "arguments": {
        "name": "Test Blog",
        "description": "Un blog de test",
        "use_template": true,
        "create_github_repo": true
      }
    }
  }'
```

Vérifier:
- ✅ Template cloné dans /home/ubuntu/apps/test-blog-xxx
- ✅ Placeholders remplacés
- ✅ Git initialisé
- ✅ Repo GitHub créé en private
- ✅ Code pushed sur GitHub

### Test 2: Déploiement
```bash
curl -X POST http://localhost:3201/execute \
  -d '{
    "method": "tools/call",
    "params": {
      "name": "init-server",
      "arguments": {
        "slug": "test-blog-xxx"
      }
    }
  }'
```

Vérifier:
- ✅ Docker build backend réussit
- ✅ Docker build frontend réussit
- ✅ Containers démarrent
- ✅ Health checks passent
- ✅ Nginx configuré
- ✅ SSL certificat créé
- ✅ Site accessible via https://test-blog-xxx.vps.naltpom.fr

### Test 3: Legacy fallback (Claude CLI)
```bash
curl -X POST http://localhost:3201/execute \
  -d '{
    "method": "tools/call",
    "params": {
      "name": "create-project",
      "arguments": {
        "name": "Legacy Test",
        "use_template": false
      }
    }
  }'
```

---

## 📋 Checklist complète

### Phase B: GitHub Template
- [ ] Git init dans template
- [ ] Premier commit
- [ ] Créer repo GitHub Naltpom/vps-paas-project-template
- [ ] Push vers GitHub
- [ ] Activer "Template repository"
- [ ] Ajouter topics

### Phase C: Code Integration
- [ ] Ajouter paramètre `use_template` dans inputSchema
- [ ] Ajouter paramètre `create_github_repo` dans inputSchema
- [ ] Implémenter logique template-based (Mode A)
- [ ] Garder logique Claude CLI (Mode B - fallback)
- [ ] Ajouter colonne `github_url` en base (si pas déjà fait)
- [ ] Update description du tool
- [ ] Rebuild container Docker MCP

### Phase D: Testing
- [ ] Test création projet avec template
- [ ] Test déploiement projet template
- [ ] Test GitHub repo auto-creation
- [ ] Test legacy fallback (Claude CLI)
- [ ] Test end-to-end complet

---

## 🚀 Avantages de cette approche

**Template vs Claude CLI**:
- ⚡ **30 secondes** vs 10 minutes
- ✅ **Structure garantie** vs imprévisible
- 🔒 **Testé et sécurisé** vs à valider à chaque fois
- 📦 **Git history** dès le départ
- 🔄 **Mises à jour possibles** (git pull upstream)
- 💰 **Moins de consommation API Claude**
- 🐛 **Debugging plus facile** (structure connue)

**Workflow production-ready**:
- ✅ Backend + Frontend toujours présents
- ✅ Repo GitHub private auto-créé pour chaque projet
- ✅ Git initialisé dès la création
- ✅ Structure standardisée et documentée
- ✅ Fallback sur Claude CLI si besoin

---

## 📝 Notes importantes

1. **SSH GitHub déjà configuré sur VPS** ✅
2. **GitHub CLI (`gh`)** doit être installé sur VPS pour auto-création repos
3. **Template public** pour faciliter clonage
4. **Repos projets en private** pour sécurité
5. **Frontend toujours inclus** même si pas utilisé (pas de suppression)
6. **Fallback Claude CLI** disponible si template ne convient pas

---

## 🔗 Liens

- Template (à créer): https://github.com/Naltpom/vps-paas-project-template
- Documentation MCP PaaS: /home/ubuntu/apps/vps-mcp-paas/README.md
- Diagnostic actuel: /home/ubuntu/apps/vps-mcp-paas/DIAGNOSTIC.md

---

## ⏭️ Prochaines sessions

**Session suivante** :
1. Exécuter Phase B (push template GitHub)
2. Exécuter Phase C (modifier create-project.ts)
3. Rebuild container
4. Tests

**Commande de reprise rapide** :
```bash
# Vérifier template
ls -la /home/ubuntu/templates/vps-paas-project-template/

# Reprendre Phase B
cd /home/ubuntu/templates/vps-paas-project-template
git init
# ... suite du plan
```
