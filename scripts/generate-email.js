#!/usr/bin/env node
/**
 * generate-email.js
 * Reads reports/cucumber-report.json and writes reports/email-body.html
 */

const fs   = require('fs');
const path = require('path');

const reportPath = path.resolve(__dirname, '../reports/cucumber-report.json');
const outputPath = path.resolve(__dirname, '../reports/email-body.html');

if (!fs.existsSync(reportPath)) {
  console.error('cucumber-report.json not found');
  process.exit(1);
}

const features = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

let totalPassed = 0, totalFailed = 0, totalSkipped = 0;

function scenarioStatus(scenario) {
  const steps = scenario.steps || [];
  if (steps.some(s => s.result && s.result.status === 'failed'))   return 'failed';
  if (steps.some(s => s.result && s.result.status === 'skipped'))  return 'skipped';
  if (steps.every(s => s.result && s.result.status === 'passed'))  return 'passed';
  return 'skipped';
}

const featureRows = features.map(feature => {
  const scenarios = (feature.elements || []).filter(e => e.type === 'scenario');
  const rows = scenarios.map(sc => {
    const status = scenarioStatus(sc);
    if (status === 'passed')  totalPassed++;
    else if (status === 'failed') totalFailed++;
    else totalSkipped++;

    const icon  = status === 'passed' ? '✅' : status === 'failed' ? '❌' : '⏭️';
    const color = status === 'passed' ? '#d4edda' : status === 'failed' ? '#f8d7da' : '#fff3cd';
    const text  = status === 'passed' ? '#155724' : status === 'failed' ? '#721c24' : '#856404';
    return `
      <tr style="background:${color}; color:${text};">
        <td style="padding:8px 12px; border-bottom:1px solid #dee2e6;">${icon} ${sc.name}</td>
        <td style="padding:8px 12px; border-bottom:1px solid #dee2e6; text-align:center; font-weight:bold; text-transform:uppercase; font-size:12px;">${status}</td>
      </tr>`;
  }).join('');

  const featurePassed = scenarios.filter(sc => scenarioStatus(sc) === 'passed').length;
  const featureFailed = scenarios.filter(sc => scenarioStatus(sc) === 'failed').length;
  const headerColor   = featureFailed > 0 ? '#dc3545' : '#28a745';

  return `
    <div style="margin-bottom:24px; border-radius:8px; overflow:hidden; box-shadow:0 2px 4px rgba(0,0,0,0.1);">
      <div style="background:${headerColor}; color:white; padding:10px 16px; font-weight:bold; font-size:15px;">
        📋 ${feature.name}
        <span style="float:right; font-size:13px; font-weight:normal;">
          ✅ ${featurePassed} passed &nbsp;|&nbsp; ❌ ${featureFailed} failed
        </span>
      </div>
      <table style="width:100%; border-collapse:collapse; background:white;">
        <thead>
          <tr style="background:#f8f9fa;">
            <th style="padding:8px 12px; text-align:left; border-bottom:2px solid #dee2e6; font-size:13px;">Scenario</th>
            <th style="padding:8px 12px; text-align:center; border-bottom:2px solid #dee2e6; font-size:13px; width:100px;">Result</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}).join('');

const total    = totalPassed + totalFailed + totalSkipped;
const pct      = total > 0 ? Math.round((totalPassed / total) * 100) : 0;
const pctColor = pct >= 90 ? '#28a745' : pct >= 70 ? '#ffc107' : '#dc3545';
const runDate  = new Date().toLocaleString('es-BO', { timeZone: 'America/La_Paz' });
const statusBanner = totalFailed === 0
  ? '<div style="background:#28a745; color:white; padding:12px; border-radius:6px; text-align:center; font-size:18px; font-weight:bold; margin-bottom:20px;">🎉 ALL TESTS PASSED</div>'
  : `<div style="background:#dc3545; color:white; padding:12px; border-radius:6px; text-align:center; font-size:18px; font-weight:bold; margin-bottom:20px;">⚠️ ${totalFailed} TEST(S) FAILED</div>`;

const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; background:#f4f6f9; margin:0; padding:0;">
  <div style="max-width:700px; margin:0 auto; padding:24px;">

    <!-- Header -->
    <div style="background:linear-gradient(135deg, #2d5016 0%, #4a7c25 100%); color:white; padding:24px; border-radius:10px 10px 0 0; text-align:center;">
      <h1 style="margin:0; font-size:24px; letter-spacing:2px;">🦕 CRETASSIC HOSTAL</h1>
      <p style="margin:6px 0 0; font-size:14px; opacity:0.8;">E2E Test Report — ${runDate}</p>
    </div>

    <!-- Summary -->
    <div style="background:white; padding:20px; border-left:1px solid #dee2e6; border-right:1px solid #dee2e6;">
      ${statusBanner}
      <div style="display:flex; gap:12px; text-align:center;">
        <div style="flex:1; background:#d4edda; border-radius:8px; padding:16px;">
          <div style="font-size:32px; font-weight:bold; color:#155724;">${totalPassed}</div>
          <div style="font-size:13px; color:#155724;">PASSED</div>
        </div>
        <div style="flex:1; background:#f8d7da; border-radius:8px; padding:16px;">
          <div style="font-size:32px; font-weight:bold; color:#721c24;">${totalFailed}</div>
          <div style="font-size:13px; color:#721c24;">FAILED</div>
        </div>
        <div style="flex:1; background:#e2e3e5; border-radius:8px; padding:16px;">
          <div style="font-size:32px; font-weight:bold; color:#383d41;">${total}</div>
          <div style="font-size:13px; color:#383d41;">TOTAL</div>
        </div>
        <div style="flex:1; background:#cce5ff; border-radius:8px; padding:16px;">
          <div style="font-size:32px; font-weight:bold; color:${pctColor};">${pct}%</div>
          <div style="font-size:13px; color:#004085;">PASS RATE</div>
        </div>
      </div>
    </div>

    <!-- Feature Results -->
    <div style="background:white; padding:20px; border:1px solid #dee2e6; border-top:none; border-radius:0 0 10px 10px;">
      <h2 style="margin:0 0 16px; font-size:16px; color:#343a40;">Test Results by Feature</h2>
      ${featureRows}
    </div>

    <!-- Footer -->
    <div style="text-align:center; padding:16px; font-size:12px; color:#6c757d;">
      Generated by GitHub Actions CI/CD Pipeline
    </div>
  </div>
</body>
</html>`;

fs.writeFileSync(outputPath, html, 'utf8');
console.log(`Email report generated: ${outputPath}`);
console.log(`Summary: ${totalPassed} passed, ${totalFailed} failed, ${total} total (${pct}%)`);
process.exit(totalFailed > 0 ? 1 : 0);
