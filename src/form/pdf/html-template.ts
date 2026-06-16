import type { DiscResultDto, DiscScoresDto } from '../dto/disc-result.dto';

// ─── Constants ───────────────────────────────────────────────────────────────

const DIMENSION_COLORS: Record<string, string> = {
  D: '#ef4444',
  I: '#f59e0b',
  S: '#10b981',
  C: '#3b82f6',
};

const DIMENSION_BG: Record<string, string> = {
  D: '#fef2f2',
  I: '#fffbeb',
  S: '#f0fdf4',
  C: '#eff6ff',
};

const DIMENSION_LABELS: Record<string, string> = {
  D: 'Dominant',
  I: 'Influent',
  S: 'Stable',
  C: 'Conforme',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function dimColor(dim: string): string {
  return DIMENSION_COLORS[dim] ?? '#94a3b8';
}

function dimBg(dim: string): string {
  return DIMENSION_BG[dim] ?? '#f8fafc';
}

function dimLabel(dim: string): string {
  return DIMENSION_LABELS[dim] ?? dim;
}

// ─── Logo SVG (adapted for light background) ─────────────────────────────────

const LOGO_SVG = `
<svg viewBox="0 0 180 40" fill="none" xmlns="http://www.w3.org/2000/svg"
     style="height:22px;display:block;flex-shrink:0;">
  <rect x="0"  y="0"  width="12" height="12" rx="4" fill="#ef4444"/>
  <rect x="16" y="0"  width="12" height="12" rx="4" fill="#f59e0b"/>
  <rect x="0"  y="16" width="12" height="12" rx="4" fill="#3b82f6"/>
  <rect x="16" y="16" width="12" height="12" rx="4" fill="#22c55e"/>
  <text x="42" y="23" font-family="Inter,sans-serif" font-size="24"
        font-weight="700" fill="#0f172a">DISC</text>
  <text x="100" y="23" font-family="Inter,sans-serif" font-size="24"
        font-weight="300" fill="#94a3b8">.dev</text>
</svg>`;

// ─── HTML Builders ────────────────────────────────────────────────────────────

function scoreBarHtml(dim: string, score: number, max: number): string {
  const pct = max > 0 ? Math.round((score / max) * 100) : 0;
  const color = dimColor(dim);
  return `
    <div class="score-row">
      <div class="score-label">
        <span class="dim-dot" style="background:${color};"></span>
        <span class="dim-letter" style="color:${color};">${dim}</span>
        <span class="dim-name">${dimLabel(dim)}</span>
      </div>
      <div class="score-track">
        <div class="score-fill" style="width:${pct}%;background:${color};"></div>
      </div>
      <div class="score-value" style="color:${color};">
        ${score}<span class="score-denom"> / ${max}</span>
      </div>
    </div>`;
}

function categoryCardHtml(cat: {
  category: string;
  scores: DiscScoresDto;
  dominant: string;
  total: number;
}): string {
  const dims = Object.entries(cat.scores) as [string, number][];
  const catMax = Math.max(...dims.map(([, v]) => v), 1);
  const dominantColor = dimColor(cat.dominant);

  return `
    <div class="cat-card avoid-break">
      <div class="cat-title">${cat.category}</div>
      <div class="cat-bars">
        ${dims
          .map(
            ([d, v]) => `
          <div class="cat-bar-row">
            <span class="cat-letter" style="color:${dimColor(d)};">${d}</span>
            <div class="cat-track">
              <div class="cat-fill" style="width:${catMax > 0 ? (v / catMax) * 100 : 0}%;background:${dimColor(d)};"></div>
            </div>
            <span class="cat-score">${v}</span>
          </div>`,
          )
          .join('')}
      </div>
      <div class="cat-footer">
        Dominant&nbsp;:&nbsp;<strong style="color:${dominantColor};">${dimLabel(cat.dominant)}</strong>
      </div>
    </div>`;
}

function insightItemHtml(title: string, text: string): string {
  return `
    <li class="insight-item">
      <span class="insight-bullet">▪</span>
      <div>
        <strong class="insight-title">${title}</strong>
        <span class="insight-text">${text}</span>
      </div>
    </li>`;
}

function synergyHtml(
  targetDim: string,
  targetLabel: string,
  concordance: string,
  discordance: string,
  communicationGuide: string[],
): string {
  const color = dimColor(targetDim);

  return `
    <div class="synergy-card avoid-break" style="border-left:3px solid ${color};">
      <div class="synergy-header">
        <div class="synergy-badge" style="background:${color};">${targetDim}</div>
        <div>
          <div class="synergy-dim-name">${targetLabel}</div>
          <div class="synergy-dim-label" style="color:${color};">${dimLabel(targetDim)}</div>
        </div>
      </div>
      <div class="synergy-body">
        <div class="synergy-block">
          <p class="synergy-block-label" style="color:#059669;">Concordance naturelle</p>
          <p class="synergy-block-text">${concordance}</p>
        </div>
        <div class="synergy-block">
          <p class="synergy-block-label" style="color:#dc2626;">Points de friction potentiels</p>
          <p class="synergy-block-text">${discordance}</p>
        </div>
      </div>
      <div class="synergy-guide">
        <p class="synergy-block-label" style="color:${color};">Guide de communication</p>
        <ul class="synergy-tips">
          ${communicationGuide.map((tip) => `<li>${tip}</li>`).join('')}
        </ul>
      </div>
    </div>`;
}

function answerRowHtml(
  questionContent: string,
  optionContent: string,
  dimension: string,
  index: number,
): string {
  const color = dimColor(dimension);
  const bg = dimBg(dimension);
  return `
    <tr>
      <td class="td-num">${index + 1}</td>
      <td class="td-question">${questionContent}</td>
      <td class="td-dim">
        <span class="badge" style="background:${bg};color:${color};border:1px solid ${color}30;">
          ${dimLabel(dimension)}
        </span>
      </td>
      <td class="td-option">${optionContent}</td>
    </tr>`;
}

// ─── CSS ─────────────────────────────────────────────────────────────────────

const CSS = `
  /* ── Reset & Print ── */
  * {
    margin: 0; padding: 0; box-sizing: border-box;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  @page {
    size: A4;
    margin: 16mm 22mm 20mm 22mm;
  }

  body {
    font-family: 'Inter', sans-serif;
    font-size: 10.5px;
    line-height: 1.65;
    color: #1e293b;
    background: #ffffff;
  }

  /* ── Layout helpers ── */
  .page-break  { page-break-before: always; }
  .avoid-break { page-break-inside: avoid; }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }

  /* ── Typography ── */
  .text-muted   { color: #64748b; }
  .text-xs      { font-size: 9px; }
  .font-bold    { font-weight: 700; }

  /* ── Accent stripe (top of document) ── */
  .accent-stripe {
    height: 3px;
    background: linear-gradient(90deg, #ef4444 25%, #f59e0b 25% 50%, #10b981 50% 75%, #3b82f6 75%);
    border-radius: 2px;
    margin-bottom: 18px;
  }

  /* ── Header ── */
  .header {
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid #e2e8f0;
  }
  .header-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
  .header-url {
    font-size: 9.5px;
    color: #94a3b8;
    font-weight: 500;
    letter-spacing: 0.3px;
  }
  .pretitle {
    font-size: 8.5px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: #94a3b8;
    margin-bottom: 8px;
  }
  .profile-badges {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 8px;
  }
  .profile-badge-pill {
    padding: 3px 11px;
    border-radius: 6px;
    font-weight: 800;
    font-size: 14px;
    color: #ffffff;
  }
  .profile-badge-sub {
    font-size: 10px;
    font-weight: 500;
    color: #64748b;
  }
  .header-title {
    font-size: 24px;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.5px;
    line-height: 1.15;
    margin-bottom: 10px;
  }
  .header-desc {
    font-size: 10px;
    color: #475569;
    line-height: 1.7;
    margin-bottom: 14px;
  }
  .header-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    margin-bottom: 14px;
  }
  .header-tag {
    border: 1px solid #cbd5e1;
    color: #64748b;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 8px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    background: #f8fafc;
  }
  .header-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 9px;
    color: #94a3b8;
    padding-top: 12px;
    border-top: 1px solid #f1f5f9;
  }
  .header-meta strong { color: #475569; }

  /* ── Section Titles ── */
  .section-title {
    font-size: 10px;
    font-weight: 800;
    color: #0f172a;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    margin: 22px 0 12px;
    padding-bottom: 7px;
    border-bottom: 1.5px solid #e2e8f0;
  }

  /* ── Badges ── */
  .badge {
    display: inline-flex;
    align-items: center;
    padding: 2px 7px;
    border-radius: 5px;
    font-size: 8px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    white-space: nowrap;
  }

  /* ── Primary / Secondary Cards ── */
  .ps-card {
    display: flex;
    align-items: center;
    gap: 14px;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 14px 16px;
    page-break-inside: avoid;
  }
  .ps-badge {
    width: 38px; height: 38px;
    border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    font-weight: 900; font-size: 17px;
    color: #ffffff;
    flex-shrink: 0;
  }
  .ps-rank {
    font-size: 8px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.5px; margin-bottom: 2px;
  }
  .ps-name   { font-size: 15px; font-weight: 800; color: #0f172a; margin-bottom: 3px; }
  .ps-score  { font-size: 9px; font-weight: 600; }

  /* ── Global Score Bars ── */
  .score-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 9px;
  }
  .score-label {
    display: flex; align-items: center; gap: 6px;
    width: 130px; flex-shrink: 0;
  }
  .dim-dot {
    width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0;
  }
  .dim-letter { font-weight: 700; font-size: 11px; }
  .dim-name   { font-size: 9.5px; color: #64748b; }
  .score-track {
    flex: 1; height: 7px; background: #f1f5f9;
    border-radius: 4px; overflow: hidden;
  }
  .score-fill  { height: 100%; border-radius: 4px; }
  .score-value { font-size: 11px; font-weight: 700; width: 42px; text-align: right; flex-shrink: 0; }
  .score-denom { font-size: 8.5px; color: #cbd5e1; font-weight: 400; }

  /* ── Category Cards ── */
  .cat-card {
    border: 1px solid #e2e8f0; border-radius: 10px;
    padding: 12px 14px;
    display: flex; flex-direction: column;
  }
  .cat-title  { font-size: 9.5px; font-weight: 700; color: #334155; margin-bottom: 10px; line-height: 1.4; }
  .cat-bar-row {
    display: flex; align-items: center;
    gap: 6px; margin-bottom: 6px;
  }
  .cat-letter { font-size: 9px; font-weight: 700; width: 10px; flex-shrink: 0; }
  .cat-track  { flex: 1; height: 5px; background: #f1f5f9; border-radius: 3px; overflow: hidden; }
  .cat-fill   { height: 100%; border-radius: 3px; }
  .cat-score  { font-size: 8.5px; font-weight: 600; color: #94a3b8; width: 12px; text-align: right; }
  .cat-footer {
    margin-top: 10px; padding-top: 8px;
    border-top: 1px dashed #e2e8f0;
    font-size: 8.5px; color: #64748b;
  }

  /* ── Behavioral Insights ── */
  .insight-card {
    border: 1px solid #e2e8f0; border-radius: 10px;
    padding: 14px; page-break-inside: avoid;
  }
  .insight-card h3 { font-size: 10px; font-weight: 800; color: #0f172a; margin-bottom: 10px; }
  .insight-list    { list-style: none; }
  .insight-item {
    display: flex; gap: 7px;
    margin-bottom: 8px; font-size: 9.5px; align-items: flex-start;
  }
  .insight-bullet { flex-shrink: 0; font-size: 8px; margin-top: 2px; }
  .insight-title  { display: block; font-weight: 600; color: #334155; margin-bottom: 1px; }
  .insight-text   { color: #64748b; }

  /* Communication mode d'emploi */
  .comm-card {
    border: 1px solid #e2e8f0; border-radius: 10px;
    padding: 14px; background: #fafafa;
    page-break-inside: avoid; margin-top: 12px;
  }
  .comm-card h3 { font-size: 10px; font-weight: 800; color: #0f172a; margin-bottom: 10px; }
  .comm-grid    { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 20px; }
  .comm-item {
    display: flex; align-items: flex-start; gap: 6px;
    font-size: 9.5px; color: #475569;
  }
  .comm-arrow { color: #3b82f6; font-size: 9px; flex-shrink: 0; margin-top: 1px; }

  /* ── Synergy Cards ── */
  .synergy-card {
    border: 1px solid #e2e8f0; border-radius: 10px;
    padding: 16px; margin-bottom: 10px;
    page-break-inside: avoid;
  }
  .synergy-card:last-child { margin-bottom: 0; }
  .synergy-header {
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 13px;
  }
  .synergy-badge {
    width: 28px; height: 28px; border-radius: 7px;
    display: flex; align-items: center; justify-content: center;
    font-weight: 800; font-size: 13px; color: #ffffff; flex-shrink: 0;
  }
  .synergy-dim-name  { font-size: 12px; font-weight: 700; color: #0f172a; }
  .synergy-dim-label { font-size: 8.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
  .synergy-body {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 14px; margin-bottom: 12px;
  }
  .synergy-block { font-size: 9.5px; }
  .synergy-block-label {
    font-size: 8px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.5px;
    margin-bottom: 4px;
  }
  .synergy-block-text { color: #64748b; line-height: 1.6; }
  .synergy-guide {
    padding-top: 11px;
    border-top: 1px solid #f1f5f9;
  }
  .synergy-tips {
    padding-left: 14px; margin-top: 5px;
  }
  .synergy-tips li { margin-bottom: 3px; font-size: 9.5px; color: #64748b; }

  /* ── Answers Table ── */
  .answers-table { width: 100%; border-collapse: collapse; font-size: 9.5px; }
  .answers-table thead tr {
    background: #f8fafc;
    border-top: 1px solid #e2e8f0;
    border-bottom: 1.5px solid #e2e8f0;
  }
  .answers-table th {
    text-align: left; padding: 8px 10px;
    font-size: 8px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.5px;
    color: #64748b;
  }
  .answers-table td       { padding: 7px 10px; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
  .answers-table tr:nth-child(even) td { background: #fafafa; }
  .td-num      { width: 22px; font-weight: 700; color: #cbd5e1; font-size: 9px; }
  .td-question { width: 34%; font-weight: 600; color: #334155; }
  .td-dim      { width: 84px; }
  .td-option   { color: #64748b; }
`;

// ─── Main Builder ─────────────────────────────────────────────────────────────

export function buildPdfHtml(data: DiscResultDto & { name?: string }): string {
  const {
    name = 'Participant',
    scores,
    primary,
    secondary,
    profile,
    synergies = [],
    total,
    categoryScores = [],
    answers = [],
  } = data;

  const primaryColor = dimColor(primary);
  const secondaryColor = secondary ? dimColor(secondary) : null;
  const maxScore = Math.max(scores.D, scores.I, scores.S, scores.C, 1);
  const profileCode = secondary ? `${primary}${secondary}` : primary;
  const generatedDate = new Date().toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // ── Score bars
  const scoresHtml =
    scoreBarHtml('D', scores.D, maxScore) +
    scoreBarHtml('I', scores.I, maxScore) +
    scoreBarHtml('S', scores.S, maxScore) +
    scoreBarHtml('C', scores.C, maxScore);

  // ── Profile badges (replaces the big colored banner)
  const profileBadgesHtml = `
    <div class="profile-badges">
      <span class="profile-badge-pill" style="background:${primaryColor};">${primary}</span>
      ${secondary ? `<span class="profile-badge-pill" style="background:${secondaryColor};">${secondary}</span>` : ''}
      <span class="profile-badge-sub">
        ${dimLabel(primary)}${secondary ? ` · ${dimLabel(secondary)}` : ''}
      </span>
    </div>`;

  // ── Tags
  const tagsHtml =
    profile.tags
      ?.slice(0, 4)
      ?.map((tag) => `<span class="header-tag">${tag}</span>`)
      .join('') ?? '';

  // ── Primary / Secondary cards
  const psCardsHtml = `
    <div class="grid-2" style="margin-bottom:20px;">
      <div class="ps-card" style="border-left:3px solid ${primaryColor};">
        <div class="ps-badge" style="background:${primaryColor};">${primary}</div>
        <div>
          <div class="ps-rank" style="color:${primaryColor};">Force Primaire</div>
          <div class="ps-name">${dimLabel(primary)}</div>
          <div class="ps-score" style="color:${primaryColor};">
            Score ${scores[primary as keyof typeof scores]} / ${maxScore}
          </div>
        </div>
      </div>
      ${
        secondary
          ? `<div class="ps-card" style="border-left:3px solid ${secondaryColor};">
              <div class="ps-badge" style="background:${secondaryColor};">${secondary}</div>
              <div>
                <div class="ps-rank" style="color:${secondaryColor};">Force Secondaire</div>
                <div class="ps-name">${dimLabel(secondary)}</div>
                <div class="ps-score" style="color:${secondaryColor};">
                  Score ${scores[secondary as keyof typeof scores]} / ${maxScore}
                </div>
              </div>
            </div>`
          : '<div></div>'
      }
    </div>`;

  // ── Category cards
  const categoryHtml =
    categoryScores?.map((cat) => categoryCardHtml(cat)).join('') ?? '';

  // ── Behavioral insights
  const strengthsHtml =
    profile.strengths?.map((s) => insightItemHtml(s.title, s.text)).join('') ??
    '';

  const pitfallsHtml =
    profile.pitfalls?.map((p) => insightItemHtml(p.title, p.text)).join('') ??
    '';

  const commHtml =
    profile.howToCommunicateWithMe
      ?.map(
        (c) => `
        <div class="comm-item">
          <span class="comm-arrow">→</span>
          <span>${c}</span>
        </div>`,
      )
      .join('') ?? '';

  // ── Synergies
  const synergiesHtml =
    synergies
      ?.map((s) =>
        synergyHtml(
          s.targetDimension,
          s.targetLabel,
          s.concordance,
          s.discordance,
          s.communicationGuide,
        ),
      )
      .join('') ?? '';

  // ── Answers table
  const answersHtml =
    answers
      ?.map((a, i) =>
        answerRowHtml(a.questionContent, a.optionContent, a.dimension, i),
      )
      .join('') ?? '';

  // ── Final HTML ──────────────────────────────────────────────────────────────

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
        rel="stylesheet">
  <style>${CSS}</style>
</head>
<body>

  <!-- ── ACCENT STRIPE ── -->
  <div class="accent-stripe"></div>

  <!-- ═══════════════════════════════════════════════════════
       PAGE 1 — Header + Profile overview
  ══════════════════════════════════════════════════════════ -->

  <div class="header avoid-break">
    <div class="header-top">
      ${LOGO_SVG}
    </div>

    <p class="pretitle">Bilan de Personnalité DISC</p>
    ${profileBadgesHtml}
    <h1 class="header-title">${profile.title} - Profil ${profileCode}</h1>
    <p class="header-desc">${profile.description}</p>

    <div class="header-tags">${tagsHtml}</div>

    <div class="header-meta">
      <span>Nom du test&nbsp;: <strong>${name}</strong></span>
      <span>${total} réponses &bull; Le ${generatedDate}</span>
    </div>
  </div>

  <!-- Primary / Secondary -->
  ${psCardsHtml}

  <!-- Global scores -->
  <h2 class="section-title">Répartition Globale des Scores</h2>
  <div style="margin-bottom:0;">${scoresHtml}</div>

  <!-- ═══════════════════════════════════════════════════════
       PAGE 2 — Categories + Behavioral analysis
  ══════════════════════════════════════════════════════════ -->

  ${
    categoryHtml
      ? `<h2 class="section-title">Profil par Contexte d'Action</h2>
         <div class="grid-3" style="margin-bottom:0;">${categoryHtml}</div>`
      : ''
  }

  <h2 class="section-title" style="margin-top:24px;">Analyse Comportementale</h2>
  <div class="grid-2">
    <div class="insight-card">
      <h3 style="color:#059669;">&#9670; Vos Forces Majeures</h3>
      <ul class="insight-list" style="--bullet-color:#10b981;">${strengthsHtml}</ul>
    </div>
    <div class="insight-card">
      <h3 style="color:#dc2626;">&#9670; Pi&egrave;ges &amp; Vigilances</h3>
      <ul class="insight-list" style="--bullet-color:#ef4444;">${pitfallsHtml}</ul>
    </div>
  </div>

  <div class="comm-card">
    <h3 style="color:#1d4ed8;">&#9670; Travailler avec vous &mdash; Mode d&rsquo;emploi</h3>
    <div class="comm-grid">${commHtml}</div>
  </div>

  <!-- ═══════════════════════════════════════════════════════
       PAGE 3 — Synergies
  ══════════════════════════════════════════════════════════ -->

  <h2 class="section-title page-break">Synergies &amp; Interactions</h2>
  <div>${synergiesHtml}</div>

  <!-- ═══════════════════════════════════════════════════════
       PAGE 4+ — Answers detail
  ══════════════════════════════════════════════════════════ -->

  <h2 class="section-title page-break">D&eacute;tail des R&eacute;ponses (${total})</h2>
  <table class="answers-table">
    <thead>
      <tr>
        <th>#</th>
        <th>Contexte / Question</th>
        <th>Axe</th>
        <th>Votre r&eacute;ponse</th>
      </tr>
    </thead>
    <tbody>${answersHtml}</tbody>
  </table>

</body>
</html>`;
}
