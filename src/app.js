import { calculateAutomationCase, sampleScenarios } from "./scoring.js";

const form = document.querySelector("#auditForm");
const resetButton = document.querySelector("#resetButton");
const printButton = document.querySelector("#printButton");
const saveScenarioButton = document.querySelector("#saveScenarioButton");
const heroSampleButton = document.querySelector("#heroSampleButton");
const sampleGrid = document.querySelector("#sampleGrid");
const savedScenarioGrid = document.querySelector("#savedScenarioGrid");
const dataImportFile = document.querySelector("#dataImportFile");
const loadSampleDataButton = document.querySelector("#loadSampleDataButton");
const applyImportButton = document.querySelector("#applyImportButton");
const clearImportButton = document.querySelector("#clearImportButton");
const importResults = document.querySelector("#importResults");
const pageTabs = document.querySelectorAll(".page-tab");
const pages = document.querySelectorAll(".page");
const savedScenarioKey = "automationRoiSavedScenarios";
let importedEstimates = null;
let latestImportMessage = "";

const fields = [
  "industry",
  "city",
  "businessArea",
  "taskType",
  "hoursPerWeek",
  "hourlyCost",
  "overheadPercent",
  "monthlyAutomationTco",
  "errorCost",
  "opportunityValuePercent",
  "annualVolumeGrowth",
  "peopleInvolved",
  "weeklyVolume",
  "errorFrequency",
  "processClarity",
  "toolComplexity",
  "judgementLevel",
  "urgency",
];

function readForm() {
  const formData = new FormData(form);

  return {
    industry: formData.get("industry"),
    city: formData.get("city"),
    businessArea: formData.get("businessArea"),
    taskType: formData.get("taskType"),
    hoursPerWeek: Number(formData.get("hoursPerWeek")),
    hourlyCost: Number(formData.get("hourlyCost")),
    overheadPercent: Number(formData.get("overheadPercent")),
    monthlyAutomationTco: Number(formData.get("monthlyAutomationTco")),
    errorCost: Number(formData.get("errorCost")),
    opportunityValuePercent: Number(formData.get("opportunityValuePercent")),
    annualVolumeGrowth: Number(formData.get("annualVolumeGrowth")),
    peopleInvolved: Number(formData.get("peopleInvolved")),
    weeklyVolume: Number(formData.get("weeklyVolume")),
    errorFrequency: formData.get("errorFrequency"),
    processClarity: formData.get("processClarity"),
    toolComplexity: formData.get("toolComplexity"),
    judgementLevel: formData.get("judgementLevel"),
    urgency: formData.get("urgency"),
  };
}

function writeForm(values) {
  fields.forEach((field) => {
    form.elements[field].value = values[field];
  });
}

function clearForm() {
  fields.forEach((field) => {
    form.elements[field].value = "";
  });
}

function hasCompleteInput(input) {
  return Object.values(input).every((value) => value !== "" && Number.isNaN(value) === false);
}

function money(value) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
  }).format(value);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function reportTimestamp() {
  return new Intl.DateTimeFormat("en-AU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date());
}

function cityLabel(city) {
  const labels = {
    sydney: "Sydney",
    melbourne: "Melbourne",
    brisbane: "Brisbane",
    perth: "Perth",
    adelaide: "Adelaide",
    canberra: "Canberra",
    hobart: "Hobart",
    darwin: "Darwin",
    goldCoast: "Gold Coast",
    newcastle: "Newcastle",
  };

  return labels[city] || "Australia";
}

function renderList(selector, items, formatter = (item) => item) {
  const list = document.querySelector(selector);
  list.replaceChildren(
    ...items.map((item) => {
      const element = document.createElement("li");
      element.innerHTML = formatter(item);
      return element;
    })
  );
}

function renderEmptyState() {
  document.querySelector("#decisionTitle").textContent = "Ready for assessment";
  document.querySelector("#automationStyle").textContent = "Fill in the form or choose a sample scenario.";
  document.querySelector("#solutionTitle").textContent = "No recommendation yet";
  document.querySelector("#scoreValue").textContent = "--";
  document.querySelector("#scoreLabel").textContent = "Awaiting inputs";
  document.querySelector("#fitScore").textContent = "--";
  document.querySelector("#valueScore").textContent = "--";
  document.querySelector("#confidenceLabel").textContent = "--";
  document.querySelector("#confidenceScore").textContent = "Complete the form to calculate confidence.";
  document.querySelector("#monthlySaving").textContent = "--";
  document.querySelector("#manualCost").textContent = "--";
  document.querySelector("#burdenedHourlyCost").textContent = "--";
  document.querySelector("#laborSavings").textContent = "--";
  document.querySelector("#errorSavings").textContent = "--";
  document.querySelector("#opportunityValue").textContent = "--";
  document.querySelector("#monthlyTco").textContent = "--";
  document.querySelector("#grossBenefit").textContent = "--";
  document.querySelector("#scaledBenefit").textContent = "--";
  document.querySelector("#yearlySaving").textContent = "--";
  document.querySelector("#buildCost").textContent = "--";
  document.querySelector("#complexityLabel").textContent = "--";
  document.querySelector("#paybackPeriod").textContent = "--";
  document.querySelector("#hoursSaved").textContent = "--";
  document.querySelector("#roiCategory").textContent = "--";
  document.querySelector("#timeline").textContent = "--";
  document.querySelector("#summaryText").textContent =
    "Complete the intake form to generate an automation decision, ROI estimate, risks, and roadmap.";
  const importMessage = document.querySelector("#importAppliedMessage");
  importMessage.hidden = latestImportMessage === "";
  importMessage.textContent = latestImportMessage;
  document.querySelector("#matrixText").textContent = "No impact-effort result yet.";
  document.querySelector("#matrixPoint").style.setProperty("--x", "50%");
  document.querySelector("#matrixPoint").style.setProperty("--y", "50%");

  [
    "#reasonList",
    "#riskList",
    "#prepList",
    "#requiredInputsList",
    "#readinessChecklist",
    "#manualWorkflow",
    "#automatedWorkflow",
    "#backlogList",
    "#sensitivityList",
    "#roadmapList",
    "#assumptionList",
    "#stakeholderList",
  ].forEach((selector) => {
    document.querySelector(selector).replaceChildren();
  });
  document.querySelector("#riskRangeGrid").replaceChildren();

  document.querySelector("#firstFeature").textContent = "No first feature selected yet.";
  document.querySelector("#confidenceExplanation").textContent = "No confidence explanation yet.";
  document.querySelector("#printReportTitle").textContent = "Business Automation ROI Report";
  document.querySelector("#printReportMeta").textContent = `Generated by muazhunme - Australia / AUD - ${reportTimestamp()}`;
  document.querySelector(
    "#reportWatermark"
  ).textContent = `Generated by muazhunme - Business Automation ROI Calculator - ${reportTimestamp()}`;
}

function renderResults(result) {
  document.querySelector("#decisionTitle").textContent = result.decision;
  document.querySelector("#automationStyle").textContent = `${result.automationStyle} - ${result.complexity}`;
  document.querySelector("#solutionTitle").textContent = result.solution;
  document.querySelector("#scoreValue").textContent = result.readinessScore;
  document.querySelector("#scoreLabel").textContent = result.scoreLabel;
  document.querySelector("#fitScore").textContent = result.automationFitScore;
  document.querySelector("#valueScore").textContent = result.businessValueScore;
  document.querySelector("#confidenceLabel").textContent = result.confidence.label;
  document.querySelector(
    "#confidenceScore"
  ).textContent = `${result.confidence.score}/100 based on clarity, judgement, and tool complexity.`;
  document.querySelector("#monthlySaving").textContent = money(result.monthlySaving);
  document.querySelector("#manualCost").textContent = money(result.monthlyCost);
  document.querySelector("#burdenedHourlyCost").textContent = money(result.burdenedHourlyCost);
  document.querySelector("#laborSavings").textContent = money(result.laborSavings);
  document.querySelector("#errorSavings").textContent = money(result.errorSavings);
  document.querySelector("#opportunityValue").textContent = money(result.opportunityValue);
  document.querySelector("#monthlyTco").textContent = money(result.monthlyAutomationTco);
  document.querySelector("#grossBenefit").textContent = money(result.grossMonthlyBenefit);
  document.querySelector("#scaledBenefit").textContent = money(result.scaledMonthlyBenefit);
  document.querySelector("#yearlySaving").textContent = money(result.yearlySaving);
  document.querySelector("#buildCost").textContent = money(result.estimatedBuildCost);
  document.querySelector("#complexityLabel").textContent = result.complexity;
  document.querySelector("#paybackPeriod").textContent = result.payback.label;
  document.querySelector("#hoursSaved").textContent = result.estimatedHoursSaved;
  document.querySelector("#roiCategory").textContent = result.roiCategory;
  document.querySelector("#timeline").textContent = result.timeline;
  document.querySelector("#summaryText").textContent = result.summary;
  const importMessage = document.querySelector("#importAppliedMessage");
  importMessage.hidden = latestImportMessage === "";
  importMessage.textContent = latestImportMessage;
  document.querySelector(
    "#matrixText"
  ).textContent = `${result.matrix.quadrant} - ${result.matrix.explanation}`;

  const matrixPoint = document.querySelector("#matrixPoint");
  matrixPoint.style.setProperty("--x", `${result.effortScore}%`);
  matrixPoint.style.setProperty("--y", `${100 - result.businessValueScore}%`);

  renderList("#reasonList", result.reasonCodes);
  renderList("#riskList", result.riskDetails, (risk) => `<strong>${risk.severity}</strong> - ${risk.text}`);
  renderList("#prepList", result.preparationChecklist);
  renderList("#requiredInputsList", result.requiredInputs);
  renderList(
    "#readinessChecklist",
    result.readinessChecklist,
    (item) =>
      `<span class="${item.done ? "check-done" : "check-open"}">${
        item.done ? "Ready" : "Needs work"
      }</span> ${item.label}`
  );
  renderList("#manualWorkflow", result.workflow.manual);
  renderList("#automatedWorkflow", result.workflow.automated);
  renderList("#backlogList", result.opportunityBacklog, (item) => `<strong>${item.type}</strong> - ${item.item}`);
  renderList(
    "#sensitivityList",
    result.sensitivity,
    (item) => `<strong>${item.label}</strong> - ${money(item.saving)} per month (${item.coverage})`
  );
  renderList("#assumptionList", result.assumptions);
  renderList("#stakeholderList", result.stakeholderReview);

  const riskRangeGrid = document.querySelector("#riskRangeGrid");
  riskRangeGrid.replaceChildren(
    ...result.riskRange.map((scenario) => {
      const card = document.createElement("div");
      card.className = "risk-range-card";
      card.innerHTML = `
        <span>${scenario.label}</span>
        <strong>${money(scenario.monthlySaving)} / month</strong>
        <small>${money(scenario.yearlySaving)} yearly saving</small>
        <small>Payback: ${scenario.payback}</small>
        <p>${scenario.note}</p>
      `;
      return card;
    })
  );

  const roadmapList = document.querySelector("#roadmapList");
  roadmapList.replaceChildren(
    ...result.roadmap.map((step) => {
      const item = document.createElement("li");
      item.textContent = step;
      return item;
    })
  );

  document.querySelector("#firstFeature").textContent = result.firstAutomationFeature;
  document.querySelector("#confidenceExplanation").textContent = result.confidenceExplanation;
  document.querySelector("#printReportTitle").textContent = `${result.solution} Report`;
  document.querySelector(
    "#printReportMeta"
  ).textContent = `${cityLabel(result.city)} - AUD - Generated by muazhunme - ${reportTimestamp()}`;
  document.querySelector(
    "#reportWatermark"
  ).textContent = `Generated by muazhunme - Business Automation ROI Calculator - ${cityLabel(
    result.city
  )} / AUD - ${reportTimestamp()}`;
}

function calculateAndRender() {
  const input = readForm();

  if (!hasCompleteInput(input)) {
    renderEmptyState();
    return;
  }

  renderResults(calculateAutomationCase(input));
}

function loadScenario(scenario) {
  latestImportMessage = "";
  writeForm(scenario);
  calculateAndRender();
  showPage("assessment");
}

function renderSamples() {
  sampleGrid.replaceChildren(
    ...sampleScenarios.map((scenario) => {
      const button = document.createElement("button");
      button.className = "sample-card";
      button.type = "button";
      button.innerHTML = `
        <span>${scenario.businessArea}</span>
        <strong>${scenario.name}</strong>
        <small>${scenario.hoursPerWeek} hrs/week &middot; ${scenario.weeklyVolume} items/week</small>
      `;
      button.addEventListener("click", () => {
        loadScenario(scenario);
      });
      return button;
    })
  );
}

function loadSavedScenarios() {
  try {
    return JSON.parse(localStorage.getItem(savedScenarioKey)) || [];
  } catch {
    return [];
  }
}

function storeSavedScenarios(scenarios) {
  localStorage.setItem(savedScenarioKey, JSON.stringify(scenarios));
}

function scenarioName(input) {
  const task = form.elements.taskType.selectedOptions[0]?.textContent || "Automation case";
  return `${cityLabel(input.city)} ${task} - ${reportTimestamp()}`;
}

function renderSavedScenarios() {
  const scenarios = loadSavedScenarios();

  if (scenarios.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-saved";
    empty.textContent = "No saved scenarios yet.";
    savedScenarioGrid.replaceChildren(empty);
    return;
  }

  savedScenarioGrid.replaceChildren(
    ...scenarios.map((scenario) => {
      const card = document.createElement("div");
      card.className = "sample-card saved-card";
      card.innerHTML = `
        <span>${cityLabel(scenario.city)} / AUD</span>
        <strong>${scenario.name}</strong>
        <small>${scenario.hoursPerWeek} hrs/week &middot; ${scenario.weeklyVolume} items/week</small>
        <div class="saved-actions">
          <button type="button" data-action="load">Load</button>
          <button type="button" class="secondary" data-action="delete">Delete</button>
        </div>
      `;
      card.querySelector('[data-action="load"]').addEventListener("click", () => {
        writeForm(scenario);
        calculateAndRender();
      });
      card.querySelector('[data-action="delete"]').addEventListener("click", () => {
        storeSavedScenarios(loadSavedScenarios().filter((item) => item.id !== scenario.id));
        renderSavedScenarios();
      });
      return card;
    })
  );
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && quoted && next === '"') {
      value += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(value.trim());
      value = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(value.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      value = "";
    } else {
      value += char;
    }
  }

  row.push(value.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

function normaliseHeader(header) {
  return header.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

function parseYesNo(value) {
  return ["yes", "y", "true", "1", "rework", "error"].includes(String(value).toLowerCase());
}

function numberFrom(value) {
  return Number(String(value).replace(/[$,\s]/g, "")) || 0;
}

function dateFrom(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function errorFrequencyFromRate(rate) {
  if (rate >= 0.06) return "high";
  if (rate >= 0.025) return "medium";
  return "low";
}

function inferBusinessArea(records) {
  const text = records
    .map((record) => `${record.owner_team || ""} ${record.department || ""} ${record.business_area || ""}`)
    .join(" ")
    .toLowerCase();

  if (text.includes("finance") || text.includes("account")) return "finance";
  if (text.includes("sales")) return "sales";
  if (text.includes("hr") || text.includes("human resource")) return "hr";
  if (text.includes("support") || text.includes("service")) return "support";
  if (text.includes("compliance") || text.includes("audit")) return "compliance";
  if (text.includes("operation")) return "operations";
  return "";
}

function inferTaskType(records) {
  const text = records.map((record) => record.process_type || record.task_type || "").join(" ").toLowerCase();

  if (text.includes("invoice")) return "invoice";
  if (text.includes("crm") || text.includes("lead")) return "crm";
  if (text.includes("report")) return "reporting";
  if (text.includes("approval")) return "approval";
  if (text.includes("contract")) return "contract";
  if (text.includes("data")) return "dataEntry";
  if (text.includes("email")) return "customerEmails";
  if (text.includes("compliance") || text.includes("evidence")) return "complianceEvidence";
  return "";
}

function inferToolComplexity(systemBreakdown) {
  if (systemBreakdown.length === 1 && systemBreakdown[0][0] !== "unspecified") return "single";
  if (systemBreakdown.length >= 2 && systemBreakdown.length <= 3) return "few";
  if (systemBreakdown.length > 3) return "many";
  return "";
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en-AU", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function topEntries(entries, limit = 4) {
  return Object.entries(entries)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
}

function estimateFromCsv(text) {
  const rows = parseCsv(text);
  if (rows.length < 2) throw new Error("The CSV needs a header row and at least one data row.");

  const headers = rows[0].map(normaliseHeader);
  const records = rows.slice(1).map((row) =>
    Object.fromEntries(headers.map((header, index) => [header, row[index] || ""]))
  );
  const validRecords = records.filter((record) => record.process_id || record.date || record.handling_minutes);

  if (validRecords.length === 0) {
    throw new Error("No usable process records were found.");
  }

  const dates = validRecords.map((record) => dateFrom(record.date)).filter(Boolean);
  const firstDate = dates.length ? Math.min(...dates.map((date) => date.getTime())) : Date.now();
  const lastDate = dates.length ? Math.max(...dates.map((date) => date.getTime())) : Date.now();
  const observedDays = Math.max(1, Math.round((lastDate - firstDate) / 86400000) + 1);
  const observedWeeks = Math.max(1, observedDays / 7);
  const totalMinutes = validRecords.reduce((sum, record) => sum + numberFrom(record.handling_minutes), 0);
  const errorRecords = validRecords.filter((record) => parseYesNo(record.error_rework));
  const totalReworkCost = errorRecords.reduce((sum, record) => sum + numberFrom(record.rework_cost), 0);
  const weeklyVolume = Math.round(validRecords.length / observedWeeks);
  const hoursPerWeek = Math.max(1, Math.round((totalMinutes / 60 / observedWeeks) * 10) / 10);
  const errorRate = errorRecords.length / validRecords.length;
  const errorCost = errorRecords.length ? Math.round(totalReworkCost / errorRecords.length) : 0;
  const missingHandling = validRecords.filter((record) => !numberFrom(record.handling_minutes)).length;
  const missingDates = validRecords.length - dates.length;
  const errorTypes = {};
  const systems = {};
  let approvalRequired = 0;

  errorRecords.forEach((record) => {
    const type = record.error_type || "unspecified";
    errorTypes[type] = (errorTypes[type] || 0) + 1;
  });

  validRecords.forEach((record) => {
    const system = record.system_used || "unspecified";
    systems[system] = (systems[system] || 0) + 1;
    if (parseYesNo(record.approval_required)) approvalRequired += 1;
  });

  const dataQuality = [
    {
      label: "Date coverage",
      status: missingDates === 0 ? "Good" : "Review",
      text:
        missingDates === 0
          ? "Every analysed record has a usable date."
          : `${missingDates} records are missing usable dates.`,
    },
    {
      label: "Handling time",
      status: missingHandling === 0 ? "Good" : "Review",
      text:
        missingHandling === 0
          ? "Every analysed record has handling minutes."
          : `${missingHandling} records are missing handling minutes.`,
    },
    {
      label: "Observation window",
      status: observedWeeks >= 4 ? "Good" : "Review",
      text:
        observedWeeks >= 4
          ? "The file covers at least four weeks of activity."
          : "The file covers less than four weeks, so trends may be noisy.",
    },
  ];

  return {
    recordCount: validRecords.length,
    dateRange: `${formatDate(firstDate)} to ${formatDate(lastDate)}`,
    observedWeeks: Math.round(observedWeeks * 10) / 10,
    totalHours: Math.round((totalMinutes / 60) * 10) / 10,
    averageHandlingMinutes: Math.round((totalMinutes / validRecords.length) * 10) / 10,
    weeklyVolume,
    monthlyVolume: Math.round(weeklyVolume * 4.33),
    hoursPerWeek,
    monthlyHours: Math.round(hoursPerWeek * 4.33 * 10) / 10,
    errorCount: errorRecords.length,
    cleanCount: validRecords.length - errorRecords.length,
    errorRate,
    errorFrequency: errorFrequencyFromRate(errorRate),
    errorCost,
    businessArea: inferBusinessArea(validRecords),
    taskType: inferTaskType(validRecords),
    industry: "",
    city: "",
    processClarity: "",
    judgementLevel: "",
    urgency: "",
    totalReworkCost,
    approvalRate: approvalRequired / validRecords.length,
    dataQuality,
    errorBreakdown: topEntries(errorTypes),
    systemBreakdown: topEntries(systems),
    toolComplexity: inferToolComplexity(topEntries(systems)),
    sampleRows: validRecords.slice(0, 5),
  };
}

function renderImportPreview(estimate, fileName) {
  importResults.innerHTML = `
    <div class="section-heading compact">
      <p class="eyebrow">Import preview</p>
      <h2>${escapeHtml(fileName)}</h2>
      <p>These values can auto-fill the assessment form. Review them before using the report for approval.</p>
      <div class="button-row">
        <button type="button" class="view-assessment-button">View updated assessment</button>
      </div>
    </div>
    <div class="metric-grid">
      <div><span>Records analysed</span><strong>${estimate.recordCount}</strong></div>
      <div><span>Date range</span><strong>${estimate.dateRange}</strong></div>
      <div><span>Observed period</span><strong>${estimate.observedWeeks} weeks</strong></div>
      <div><span>Weekly volume</span><strong>${estimate.weeklyVolume}</strong></div>
      <div><span>Monthly volume</span><strong>${estimate.monthlyVolume}</strong></div>
      <div><span>Hours per week</span><strong>${estimate.hoursPerWeek}</strong></div>
      <div><span>Monthly hours</span><strong>${estimate.monthlyHours}</strong></div>
      <div><span>Avg handling time</span><strong>${estimate.averageHandlingMinutes} min</strong></div>
      <div><span>Error rate</span><strong>${Math.round(estimate.errorRate * 1000) / 10}%</strong></div>
      <div><span>Rework records</span><strong>${estimate.errorCount}</strong></div>
      <div><span>Avg rework cost</span><strong>${money(estimate.errorCost)}</strong></div>
      <div><span>Total rework cost</span><strong>${money(estimate.totalReworkCost)}</strong></div>
      <div><span>Approval required</span><strong>${Math.round(estimate.approvalRate * 100)}%</strong></div>
    </div>

    <div class="import-detail-grid">
      <div class="case-guide import-note">
        <h2>Data quality checks</h2>
        <ul>
          ${estimate.dataQuality
            .map((item) => `<li><strong>${item.status}</strong> - ${item.label}: ${item.text}</li>`)
            .join("")}
        </ul>
      </div>
      <div class="case-guide import-note">
        <h2>Error breakdown</h2>
        ${
          estimate.errorBreakdown.length
            ? `<ul>${estimate.errorBreakdown
                .map(([type, count]) => `<li><strong>${escapeHtml(type)}</strong> - ${count} records</li>`)
                .join("")}</ul>`
            : "<p>No rework or error records were found in this file.</p>"
        }
      </div>
      <div class="case-guide import-note">
        <h2>Systems found</h2>
        <ul>
          ${estimate.systemBreakdown
            .map(([system, count]) => `<li><strong>${escapeHtml(system)}</strong> - ${count} records</li>`)
            .join("")}
        </ul>
      </div>
    <div class="case-guide import-note">
      <h2>What will be updated</h2>
      <p>Hours per week, weekly volume, error frequency, and rework cost per error will be filled from the uploaded file. Cost and business-assumption fields are reset to 0 or neutral review defaults so old form values do not mix into the imported assessment.</p>
      <div class="button-row">
        <button type="button" class="view-assessment-button">View updated assessment</button>
      </div>
    </div>
    </div>

    <div class="case-guide import-note">
      <h2>Record preview</h2>
      <div class="import-table-wrap">
        <table class="import-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Process ID</th>
              <th>Minutes</th>
              <th>Rework</th>
              <th>Rework cost</th>
              <th>System</th>
            </tr>
          </thead>
          <tbody>
            ${estimate.sampleRows
              .map(
                (row) => `<tr>
                  <td>${escapeHtml(row.date)}</td>
                  <td>${escapeHtml(row.process_id)}</td>
                  <td>${escapeHtml(row.handling_minutes)}</td>
                  <td>${escapeHtml(row.error_rework)}</td>
                  <td>${money(numberFrom(row.rework_cost))}</td>
                  <td>${escapeHtml(row.system_used || "unspecified")}</td>
                </tr>`
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </div>

    <div class="case-guide import-note">
      <h2>What this still does not know</h2>
      <p>The dataset improves volume, time, and rework assumptions, but a reviewer still needs to confirm labour cost, overhead, automation TCO, implementation cost, process exceptions, and whether the process is actually stable enough to automate.</p>
    </div>
  `;
}

function renderImportError(message) {
  importResults.innerHTML = `
    <div class="case-guide import-note">
      <h2>Import problem</h2>
      <p>${escapeHtml(message)}</p>
    </div>
  `;
}

function showPage(pageName) {
  pageTabs.forEach((pageTab) => {
    pageTab.classList.toggle("active", pageTab.dataset.page === pageName);
  });
  pages.forEach((page) => {
    page.classList.toggle("active", page.id === `${pageName}Page`);
  });
}

function applyImportedEstimates() {
  form.elements.city.value = importedEstimates.city;
  form.elements.industry.value = importedEstimates.industry;
  form.elements.businessArea.value = importedEstimates.businessArea;
  form.elements.taskType.value = importedEstimates.taskType;
  form.elements.hoursPerWeek.value = importedEstimates.hoursPerWeek;
  form.elements.hourlyCost.value = 0;
  form.elements.overheadPercent.value = 0;
  form.elements.monthlyAutomationTco.value = 0;
  form.elements.errorCost.value = importedEstimates.errorCost;
  form.elements.opportunityValuePercent.value = 0;
  form.elements.annualVolumeGrowth.value = 0;
  form.elements.peopleInvolved.value = 0;
  form.elements.weeklyVolume.value = importedEstimates.weeklyVolume;
  form.elements.errorFrequency.value = importedEstimates.errorFrequency;
  form.elements.processClarity.value = importedEstimates.processClarity;
  form.elements.toolComplexity.value = importedEstimates.toolComplexity;
  form.elements.judgementLevel.value = importedEstimates.judgementLevel;
  form.elements.urgency.value = importedEstimates.urgency;
}

function finishDatasetImport(fileName) {
  applyImportButton.disabled = false;
  renderImportPreview(importedEstimates, fileName);
  applyImportedEstimates();
  latestImportMessage = `Dataset values from ${fileName} have been uploaded to the calculator: ${importedEstimates.recordCount} records, ${importedEstimates.hoursPerWeek} hours/week, ${importedEstimates.weeklyVolume} items/week, ${Math.round(
    importedEstimates.errorRate * 1000
  ) / 10}% error rate, and ${money(importedEstimates.errorCost)} average rework cost. Fields not found in the dataset were left blank for review, and other numeric assumptions were reset to 0.`;
  calculateAndRender();
  document.querySelectorAll(".view-assessment-button").forEach((button) => button.addEventListener("click", () => {
    showPage("assessment");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }));
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  calculateAndRender();
});

saveScenarioButton.addEventListener("click", () => {
  const input = readForm();

  if (!hasCompleteInput(input)) {
    renderEmptyState();
    return;
  }

  const scenario = {
    ...input,
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: scenarioName(input),
  };
  storeSavedScenarios([scenario, ...loadSavedScenarios()].slice(0, 8));
  renderSavedScenarios();
  calculateAndRender();
});

dataImportFile.addEventListener("change", async () => {
  const [file] = dataImportFile.files;
  importedEstimates = null;
  applyImportButton.disabled = true;

  if (!file) {
    renderImportError("Choose an Excel-exported CSV file first.");
    return;
  }

  try {
    const text = await file.text();
    importedEstimates = estimateFromCsv(text);
    finishDatasetImport(file.name);
  } catch (error) {
    renderImportError(error.message);
  }
});

loadSampleDataButton.addEventListener("click", async () => {
  try {
    const response = await fetch("./data/sample-australia-invoice-process.csv");
    if (!response.ok) throw new Error("The sample dataset could not be loaded.");
    const text = await response.text();
    importedEstimates = estimateFromCsv(text);
    finishDatasetImport("sample-australia-invoice-process.csv");
  } catch (error) {
    renderImportError(error.message);
  }
});

applyImportButton.addEventListener("click", (event) => {
  event.preventDefault();
  event.stopPropagation();

  if (!importedEstimates) return;

  applyImportedEstimates();
  calculateAndRender();
});

clearImportButton.addEventListener("click", () => {
  dataImportFile.value = "";
  importedEstimates = null;
  latestImportMessage = "";
  applyImportButton.disabled = true;
  importResults.innerHTML = `
    <div class="section-heading compact">
      <p class="eyebrow">Import preview</p>
      <h2>No file imported yet</h2>
      <p>Upload the sample CSV or your own Excel-exported CSV to preview calculated assumptions.</p>
    </div>
  `;
});

resetButton.addEventListener("click", () => {
  clearForm();
  renderEmptyState();
});

printButton.addEventListener("click", () => {
  calculateAndRender();
  window.print();
});

heroSampleButton.addEventListener("click", () => {
  loadScenario(sampleScenarios[0]);
  document.querySelector("#auditForm").scrollIntoView({ behavior: "smooth", block: "start" });
});

pageTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const pageName = tab.dataset.page;
    showPage(pageName);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});

renderSamples();
renderSavedScenarios();
clearForm();
renderEmptyState();
