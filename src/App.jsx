import { useEffect, useMemo, useState } from 'react'
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import './App.css'

GlobalWorkerOptions.workerSrc = pdfjsWorker

const themes = {
  light: {
    name: 'Light',
    accent: '#6366f1',
    background: '#f6f7fb',
    surface: '#ffffff',
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    border: '#e2e8f0',
    muted: '#f1f5f9',
    success: '#10b981',
    warning: '#f59e0b',
  },
  dark: {
    name: 'Midnight',
    accent: '#22d3ee',
    background: '#0b1220',
    surface: '#0f172a',
    textPrimary: '#e2e8f0',
    textSecondary: '#cbd5e1',
    border: '#1e293b',
    muted: '#0b1324',
    success: '#34d399',
    warning: '#fbbf24',
  },
  dusk: {
    name: 'Dusk',
    accent: '#a855f7',
    background: '#0f172a',
    surface: '#111827',
    textPrimary: '#e5e7eb',
    textSecondary: '#c4c6d5',
    border: '#1f2937',
    muted: '#131c2d',
    success: '#8bffbd',
    warning: '#f59e0b',
  },
}

const translations = {
  en: {
    title: 'ParseIQ',
    subtitle: 'Upload PDFs and get instant insights',
    uploadCta: 'Upload PDF',
    dropHint: 'Drop a PDF or click to browse',
    lastUpdated: 'Last processed',
    extracted: 'Extracted text',
    summary: 'Auto summary',
    keywords: 'Keywords',
    insights: 'Insights panel',
    insightsHeader: 'Insights panel',
    language: 'Language',
    theme: 'Theme',
    mockNote: 'Local PDF parsing + heuristic summarization',
    start: 'Re-run analysis',
    sentiment: 'Sentiment',
    risk: 'Risk',
    coverage: 'Coverage',
    readiness: 'Readiness',
    realtimeStatus: 'Realtime status',
    docSize: 'Document size',
    docSizeDetail: (words) => `${words} words · est. ${Math.max(1, Math.ceil(words / 220))} min read`,
    riskPosture: 'Risk posture',
    governance: 'Governance & data',
    coverageHint: 'Tokens scanned',
    sentimentHint: 'Local heuristic',
    riskHintShort: 'Compact doc',
    riskHintLong: 'Long doc',
    readinessHint: 'Based on doc length',
    concise: 'Concise',
    long: 'Long',
    low: 'Low',
    medium: 'Medium',
    attention: 'Attention',
    good: 'Good',
    addDetail: 'Add detail',
    noRisk: 'No explicit risk language detected; consider adding contingencies.',
    hasRisk: 'Risk considerations are present; ensure mitigation owners are defined.',
    hasGov: 'Mentions governance/data topics; good for compliance readiness.',
    noGov: 'Add governance and data stewardship notes for clarity.',
  },
  es: {
    title: 'ParseIQ',
    subtitle: 'Sube PDFs y obtén insights al instante',
    uploadCta: 'Subir PDF',
    dropHint: 'Suelta un PDF o haz clic para elegir',
    lastUpdated: 'Último proceso',
    extracted: 'Texto extraído',
    summary: 'Resumen automático',
    keywords: 'Palabras clave',
    insights: 'Hallazgos',
    insightsHeader: 'Panel de hallazgos',
    language: 'Idioma',
    theme: 'Tema',
    mockNote: 'Parseo local de PDF + resumen heurístico',
    start: 'Reprocesar análisis',
    sentiment: 'Sentimiento',
    risk: 'Riesgo',
    coverage: 'Cobertura',
    readiness: 'Preparación',
    realtimeStatus: 'Estado en vivo',
    docSize: 'Tamaño del documento',
    docSizeDetail: (words) => `${words} palabras · est. ${Math.max(1, Math.ceil(words / 220))} min de lectura`,
    riskPosture: 'Postura de riesgo',
    governance: 'Gobernanza y datos',
    coverageHint: 'Tokens escaneados',
    sentimentHint: 'Heurística local',
    riskHintShort: 'Documento compacto',
    riskHintLong: 'Documento largo',
    readinessHint: 'Basado en la longitud',
    concise: 'Conciso',
    long: 'Extenso',
    low: 'Bajo',
    medium: 'Medio',
    attention: 'Atención',
    good: 'Bueno',
    addDetail: 'Añadir detalle',
    noRisk: 'No se detecta lenguaje de riesgo; considera agregar contingencias.',
    hasRisk: 'Hay menciones de riesgo; asegúrate de definir responsables y mitigación.',
    hasGov: 'Hay menciones de gobernanza/datos; bueno para preparación de cumplimiento.',
    noGov: 'Agrega notas de gobernanza y stewardship de datos para mayor claridad.',
  },
}

const navItems = [
  { id: 'overview', label: { en: 'Overview', es: 'Resumen' } },
  { id: 'documents', label: { en: 'Documents', es: 'Documentos' } },
  { id: 'insights', label: { en: 'Insights', es: 'Hallazgos' } },
]

const mockExtracted =
  'The document outlines a multi-quarter AI initiative with phased deployment, clear governance, and a strong focus on human-in-the-loop validation. Key priorities include model safety, explainability, and an experimentation sandbox that ships weekly improvements. The rollout plan balances velocity with compliance, adding automated red-teaming and continuous monitoring.'

const mockSummary = {
  en: 'This PDF proposes a staged AI delivery roadmap with weekly shipping cadence, built-in guardrails, and a governance pod that signs off each milestone. The team prioritizes responsible AI, telemetry, and experiment-driven releases.',
  es: 'Este PDF propone una hoja de ruta de IA por etapas con entregas semanales, protecciones incorporadas y un equipo de gobierno que aprueba cada hito. El enfoque prioriza IA responsable, telemetría y lanzamientos basados en experimentos.',
}

const mockKeywords = {
  en: ['Responsible AI', 'Governance', 'Telemetry', 'Rollout', 'Guardrails'],
  es: ['IA responsable', 'Gobernanza', 'Telemetría', 'Despliegue', 'Controles'],
}

const mockInsights = [
  {
    title: 'Impact on operations',
    detail: 'Phased rollout minimizes disruption; weekly shipping keeps stakeholders aligned.',
    score: 'Low risk',
    tone: 'positive',
  },
  {
    title: 'Data governance',
    detail: 'Requires clear ownership of monitoring and rapid rollback playbooks.',
    score: 'Medium risk',
    tone: 'neutral',
  },
  {
    title: 'Change management',
    detail: 'Human-in-the-loop steps add confidence but need training budget and time.',
    score: 'Attention',
    tone: 'warning',
  },
]

const stopwords = {
  en: [
    'the',
    'and',
    'of',
    'to',
    'in',
    'a',
    'for',
    'is',
    'on',
    'with',
    'this',
    'that',
    'by',
    'as',
    'it',
    'are',
    'be',
    'from',
    'at',
    'or',
    'an',
    'we',
    'our',
    'their',
  ],
  es: [
    'el',
    'la',
    'los',
    'las',
    'y',
    'de',
    'del',
    'para',
    'en',
    'un',
    'una',
    'por',
    'con',
    'que',
    'es',
    'son',
    'se',
    'a',
    'o',
    'su',
    'sus',
    'nuestro',
    'nuestra',
  ],
}

const wordCount = (text = '') => text.split(/\s+/).filter(Boolean).length

const summarizeText = (text, language) => {
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)

  if (!sentences.length) return language === 'es' ? 'No se encontró texto en el PDF.' : 'No text detected in the PDF.'

  const summarySentences = sentences.slice(0, 3).join(' ')
  return summarySentences.length > 240 ? `${summarySentences.slice(0, 240)}…` : summarySentences
}

const extractKeywordsFromText = (text, language) => {
  const cleaned = text.toLowerCase().replace(/[^a-záéíóúüñ0-9\s]/gi, ' ')
  const words = cleaned.split(/\s+/).filter(Boolean)
  const banned = stopwords[language] || []

  const freq = words.reduce((acc, word) => {
    if (banned.includes(word)) return acc
    acc[word] = (acc[word] || 0) + 1
    return acc
  }, {})

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([word]) => word.length > 1 ? word[0].toUpperCase() + word.slice(1) : word)
}

  const deriveInsights = (text, lang) => {
  const wc = wordCount(text)
  const mentionsRisk = /risk|riesgo/i.test(text)
  const mentionsGovernance = /governance|compliance|gobernanza/i.test(text)
  const mentionsData = /data|datos|privacy|seguridad/i.test(text)

  return [
    {
      titleKey: 'docSize',
      detail: wc,
      scoreKey: wc > 8000 ? 'long' : 'concise',
      tone: wc > 8000 ? 'warning' : 'neutral',
    },
    {
      titleKey: 'riskPosture',
      detailKey: mentionsRisk ? 'hasRisk' : 'noRisk',
      scoreKey: mentionsRisk ? 'attention' : 'low',
      tone: mentionsRisk ? 'warning' : 'positive',
    },
    {
      titleKey: 'governance',
      detailKey: mentionsGovernance || mentionsData ? 'hasGov' : 'noGov',
      scoreKey: mentionsGovernance || mentionsData ? 'good' : 'addDetail',
      tone: mentionsGovernance || mentionsData ? 'positive' : 'neutral',
    },
  ]
}

const formatBytes = (bytes) => {
  if (!bytes) return '—'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)))
  return `${(bytes / 1024 ** i).toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

function App() {
  const [language, setLanguage] = useState('en')
  const [theme, setTheme] = useState('light')
  const [activeNav, setActiveNav] = useState('overview')
  const [fileName, setFileName] = useState('Product Strategy Brief.pdf')
  const [isLoading, setIsLoading] = useState(false)
  const [extracted, setExtracted] = useState(mockExtracted)
  const [summary, setSummary] = useState(mockSummary.en)
  const [keywords, setKeywords] = useState(mockKeywords.en)
  const [insights, setInsights] = useState(mockInsights)
  const [meta, setMeta] = useState({
    pages: 12,
    tokens: 8140,
    size: '2.1 MB',
    updated: '2m ago',
  })
  const [error, setError] = useState('')

  const t = translations[language]
  const currentTheme = themes[theme]

  useEffect(() => {
    if (!navItems.find((n) => n.id === activeNav)) {
      setActiveNav('overview')
    }
  }, [activeNav])

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--bg', currentTheme.background)
    root.style.setProperty('--surface', currentTheme.surface)
    root.style.setProperty('--border', currentTheme.border)
    root.style.setProperty('--text', currentTheme.textPrimary)
    root.style.setProperty('--text-muted', currentTheme.textSecondary)
    root.style.setProperty('--muted', currentTheme.muted)
    root.style.setProperty('--accent', currentTheme.accent)
    root.style.setProperty('--success', currentTheme.success)
    root.style.setProperty('--warning', currentTheme.warning)
  }, [currentTheme])

  const stats = useMemo(() => {
    const coverage = Math.min(100, Math.round((meta.tokens / 12000) * 100))
    const sentimentSignal = keywords.length ? Math.min(30, keywords.length * 3) : 6
    const risk = meta.pages > 25 ? translations[language].medium : translations[language].low
    const readiness = meta.tokens > 6500 ? (language === 'es' ? 'Revisión necesaria' : 'Needs review') : (language === 'es' ? 'Listo para lanzamiento' : 'Launch-ready')

    return [
      { label: t.sentiment, value: `+${sentimentSignal}`, hint: t.sentimentHint },
      { label: t.risk, value: risk, hint: meta.pages > 25 ? t.riskHintLong : t.riskHintShort },
      { label: t.coverage, value: `${coverage}%`, hint: t.coverageHint },
      { label: t.readiness, value: readiness, hint: t.readinessHint },
    ]
  }, [language, meta.pages, meta.tokens, keywords.length, t])

  const refreshFromText = (text, pages = meta.pages, tokens = meta.tokens, size = meta.size) => {
    const safeText = text?.trim() ? text : mockExtracted
    const computedTokens = tokens || wordCount(safeText)

    setExtracted(safeText)
    setSummary(summarizeText(safeText, language))
    setKeywords(extractKeywordsFromText(safeText, language))
    setInsights(deriveInsights(safeText, language))
    setMeta({
      pages: pages || 1,
      tokens: computedTokens,
      size,
      updated: 'just now',
    })
  }

  useEffect(() => {
    refreshFromText(extracted, meta.pages, meta.tokens, meta.size)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language])

  const extractTextFromPdf = async (file) => {
    const buffer = await file.arrayBuffer()
    const pdf = await getDocument({ data: buffer }).promise
    let text = ''

    for (let i = 1; i <= pdf.numPages; i += 1) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      const pageText = content.items
        .map((item) => (typeof item.str === 'string' ? item.str : ''))
        .join(' ')
      text += `${pageText}\n`
    }

    return { text: text.trim(), pages: pdf.numPages, tokens: wordCount(text) }
  }

  const handleUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setError('')
    setFileName(file.name)
    setIsLoading(true)

    try {
      const parsed = await extractTextFromPdf(file)
      refreshFromText(parsed.text, parsed.pages, parsed.tokens, formatBytes(file.size))
    } catch (err) {
      console.error(err)
      setError('PDF processing failed. Try another file or check the console for details.')
      refreshFromText(mockExtracted)
    } finally {
      setIsLoading(false)
    }
  }

  const runAnalysis = () => {
    setIsLoading(true)
    setTimeout(() => {
      refreshFromText(extracted || mockExtracted)
      setIsLoading(false)
    }, 800)
  }

  const uploadSection = (
    <section className="grid two">
      <div className="card upload-card">
        <div className="upload-header">
          <div>
            <p className="eyebrow">{t.uploadCta}</p>
            <h3>{fileName}</h3>
            <p className="hint">{t.dropHint}</p>
          </div>
          <label className="upload-btn">
            <input type="file" accept="application/pdf" onChange={handleUpload} />
            {t.uploadCta}
          </label>
        </div>

        <div className="upload-meta">
          <div>
            <p className="eyebrow">Pages</p>
            <p className="stat">{meta.pages}</p>
          </div>
          <div>
            <p className="eyebrow">Tokens</p>
            <p className="stat">{meta.tokens.toLocaleString()}</p>
          </div>
          <div>
            <p className="eyebrow">ETA</p>
            <p className="stat">{isLoading ? 'Crunching…' : '~8s'}</p>
          </div>
          <div>
            <p className="eyebrow">Size</p>
            <p className="stat">{meta.size}</p>
          </div>
        </div>

        <div className="note">
          <p className="hint">{t.mockNote}</p>
        </div>
      </div>

      <div className="card highlight">
        <p className="eyebrow">{t.realtimeStatus}</p>
        <div className="status-row">
          {stats.map((item) => (
            <div key={item.label} className="status-tile">
              <p className="muted">{item.label}</p>
              <h4>{item.value}</h4>
              <p className="hint">{item.hint}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )

  const extractedSection = (
    <div className="card">
      <div className="card-header">
        <p className="eyebrow">{t.extracted}</p>
      </div>
      {isLoading ? <div className="skeleton block" /> : <p className="body">{extracted}</p>}
    </div>
  )

  const summarySection = (
    <div className="card">
      <div className="card-header">
        <p className="eyebrow">{t.summary}</p>
      </div>
      {isLoading ? (
        <>
          <div className="skeleton line" />
          <div className="skeleton line" />
          <div className="skeleton line short" />
        </>
      ) : (
        <p className="body">{summary}</p>
      )}

      <div className="keywords">
        <p className="eyebrow">{t.keywords}</p>
        {isLoading ? (
          <div className="chip-row wrap">
            {Array.from({ length: 4 }).map((_, idx) => (
              <span key={idx} className="chip chip-skeleton skeleton" />
            ))}
          </div>
        ) : (
          <div className="chip-row wrap">
            {keywords.map((word) => (
              <span key={word} className="chip chip-active">
                {word}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  const insightsSection = (
      <div className="card">
      <div className="card-header">
        <p className="eyebrow">{t.insightsHeader}</p>
      </div>
      <div className="insights">
        {(isLoading ? Array.from({ length: 3 }).map((_, i) => i) : insights).map((item, idx) => (
          <div key={idx} className="insight">
            {isLoading ? (
              <div className="skeleton line" />
            ) : (
              <>
                <div className="insight-head">
                  <h4>
                    {item.titleKey ? translations[language][item.titleKey] : item.title}
                  </h4>
                  <span className={`pill tone-${item.tone}`}>
                    {item.scoreKey ? translations[language][item.scoreKey] : item.score}
                  </span>
                </div>
                <p className="muted">
                  {item.detailKey
                    ? translations[language][item.detailKey]
                    : typeof item.detail === 'number'
                      ? translations[language].docSizeDetail(item.detail)
                      : item.detail}
      </p>
    </>
            )}
          </div>
        ))}
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeNav) {
      case 'documents':
        return (
          <>
            {uploadSection}
            <section className="grid two">
              {extractedSection}
              {summarySection}
            </section>
          </>
        )
      case 'insights':
        return (
          <>
            <section className="grid two">
              <div className="card highlight">
                <p className="eyebrow">{language === 'es' ? 'Estado analítico' : 'Analytic status'}</p>
                <div className="status-row">
                  {stats.map((item) => (
                    <div key={item.label} className="status-tile">
                      <p className="muted">{item.label}</p>
                      <h4>{item.value}</h4>
                      <p className="hint">{item.hint}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card">
                <p className="eyebrow">{language === 'es' ? 'Hallazgos clave' : 'Key findings'}</p>
                <ul className="list">
                  <li>
                    {language === 'es'
                      ? 'Cobertura: verificamos tokens, longitud y presencia de riesgo/gobernanza.'
                      : 'Coverage: we check tokens, length, and presence of risk/governance language.'}
                  </li>
                  <li>
                    {language === 'es'
                      ? 'Señal de riesgo: baja si el texto es corto y sin menciones de riesgo explícito.'
                      : 'Risk signal: low when the doc is short and lacks explicit risk mentions.'}
                  </li>
                  <li>
                    {language === 'es'
                      ? 'Preparación: advierte “Needs review” cuando el documento es extenso.'
                      : 'Readiness: warns “Needs review” when the document is long.'}
                  </li>
                </ul>
              </div>
            </section>
            <section className="grid three">
              {insightsSection}
              <div className="card">
              <p className="eyebrow">{language === 'es' ? 'Oportunidades' : 'Opportunities'}</p>
                <ul className="list">
                  <li>
                    {language === 'es'
                      ? 'Añade propietarios y métricas para cada hito crítico.'
                      : 'Add owners and metrics to each critical milestone.'}
                  </li>
                  <li>
                    {language === 'es'
                      ? 'Define un playbook de reversión y señales de activación.'
                      : 'Define a rollback playbook and trigger signals.'}
                  </li>
                  <li>
                    {language === 'es'
                      ? 'Incluye sección de privacidad/datos si el PDF no la menciona.'
                      : 'Include a privacy/data section if the PDF omits it.'}
                  </li>
                </ul>
              </div>
              <div className="card">
                <p className="eyebrow">{language === 'es' ? 'Acciones sugeridas' : 'Suggested actions'}</p>
                <ul className="list">
                  <li>
                    {language === 'es'
                      ? 'Resumir a <300 palabras para ejecutivos.'
                      : 'Condense to <300 words for executives.'}
                  </li>
                  <li>
                    {language === 'es'
                      ? 'Añadir sección de riesgos con responsables y SLA de mitigación.'
                      : 'Add a risk section with owners and mitigation SLAs.'}
                  </li>
                  <li>
                    {language === 'es'
                      ? 'Marcar dependencias críticas y fechas de corte.'
                      : 'Mark critical dependencies and cutover dates.'}
                  </li>
                </ul>
              </div>
            </section>
          </>
        )
      default: // Overview
        return (
          <>
            {uploadSection}
            {error && <div className="error">{error}</div>}
            <section className="grid three">
              {extractedSection}
              {summarySection}
              {insightsSection}
            </section>
          </>
        )
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="badge">
            <img src="/vite.svg" alt="ParseIQ logo" className="badge-icon" />
          </div>
          <div>

            <h1>ParseIQ</h1>
          </div>
        </div>

        <div className="nav">
          {navItems.map((item) => {
            const label = item.label[language]
            return (
              <button
                key={item.id}
                className={`nav-item ${activeNav === item.id ? 'active' : ''}`}
                onClick={() => setActiveNav(item.id)}
              >
                <span className="dot" />
                {label}
              </button>
            )
          })}
        </div>

        <div className="sidebar-panel">
          <p className="eyebrow">{t.language}</p>
          <div className="chip-row">
            <button
              className={`chip ${language === 'en' ? 'chip-active' : ''}`}
              onClick={() => setLanguage('en')}
            >
              EN
            </button>
            <button
              className={`chip ${language === 'es' ? 'chip-active' : ''}`}
              onClick={() => setLanguage('es')}
            >
              ES
            </button>
          </div>
          <p className="eyebrow">{t.theme}</p>
          <div className="chip-row">
            {Object.keys(themes).map((key) => (
              <button
                key={key}
                className={`chip ${theme === key ? 'chip-active' : ''}`}
                onClick={() => setTheme(key)}
              >
                {themes[key].name}
              </button>
            ))}
          </div>
          <div className="sidebar-footer">
            <p className="eyebrow">{t.mockNote}</p>
          </div>
        </div>
      </aside>

      <main className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">{t.subtitle}</p>
            <h2>{t.title}</h2>
          </div>
          <div className="actions">
            <button className="ghost" onClick={runAnalysis}>
              {t.start}
            </button>
            <div className="pill">
              {t.lastUpdated}: {meta.updated}
            </div>
          </div>
        </header>

        {error && <div className="error">{error}</div>}
        {renderContent()}
      </main>
    </div>
  )
}

export default App
