import { calculateAutomationCase, sampleScenarios } from "./scoring.js";

const form = document.querySelector("#auditForm");
const resetButton = document.querySelector("#resetButton");
const printButton = document.querySelector("#printButton");
const sampleGrid = document.querySelector("#sampleGrid");
const pageTabs = document.querySelectorAll(".page-tab");
const pages = document.querySelectorAll(".page");

const fields = [
  "industry",
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

function reportTimestamp() {
  return new Intl.DateTimeFormat("en-AU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date());
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
  ].forEach((selector) => {
    document.querySelector(selector).replaceChildren();
  });

  document.querySelector("#firstFeature").textContent = "No first feature selected yet.";
  document.querySelector("#confidenceExplanation").textContent = "No confidence explanation yet.";
  document.querySelector(
    "#reportWatermark"
  ).textContent = `Generated by muazhunme · Business Automation ROI Calculator · ${reportTimestamp()}`;
}

function renderResults(result) {
  document.querySelector("#decisionTitle").textContent = result.decision;
  document.querySelector(
    "#automationStyle"
  ).textContent = `${result.automationStyle} · ${result.complexity}`;
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
  document.querySelector(
    "#reportWatermark"
  ).textContent = `Generated by muazhunme · Business Automation ROI Calculator · ${reportTimestamp()}`;
}

function calculateAndRender() {
  const input = readForm();

  if (!hasCompleteInput(input)) {
    renderEmptyState();
    return;
  }

  renderResults(calculateAutomationCase(input));
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
        writeForm(scenario);
        calculateAndRender();
      });
      return button;
    })
  );
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  calculateAndRender();
});

resetButton.addEventListener("click", () => {
  clearForm();
  renderEmptyState();
});

printButton.addEventListener("click", () => {
  calculateAndRender();
  window.print();
});

pageTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const pageName = tab.dataset.page;

    pageTabs.forEach((pageTab) => {
      pageTab.classList.toggle("active", pageTab === tab);
    });

    pages.forEach((page) => {
      page.classList.toggle("active", page.id === `${pageName}Page`);
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});

renderSamples();
writeForm(sampleScenarios[0]);
calculateAndRender();
