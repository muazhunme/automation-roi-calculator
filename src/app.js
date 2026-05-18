import { calculateAutomationCase, sampleScenarios } from "./scoring.js";

const form = document.querySelector("#auditForm");
const resetButton = document.querySelector("#resetButton");
const printButton = document.querySelector("#printButton");
const sampleGrid = document.querySelector("#sampleGrid");

const fields = [
  "businessArea",
  "taskType",
  "hoursPerWeek",
  "hourlyCost",
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
    businessArea: formData.get("businessArea"),
    taskType: formData.get("taskType"),
    hoursPerWeek: Number(formData.get("hoursPerWeek")),
    hourlyCost: Number(formData.get("hourlyCost")),
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

function money(value) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
  }).format(value);
}

function renderResults(result) {
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
  document.querySelector("#yearlySaving").textContent = money(result.yearlySaving);
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

  const riskList = document.querySelector("#riskList");
  riskList.replaceChildren(
    ...result.risks.map((risk) => {
      const item = document.createElement("li");
      item.textContent = risk;
      return item;
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
}

function calculateAndRender() {
  renderResults(calculateAutomationCase(readForm()));
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
  writeForm(sampleScenarios[0]);
  calculateAndRender();
});

printButton.addEventListener("click", () => {
  calculateAndRender();
  window.print();
});

renderSamples();
writeForm(sampleScenarios[0]);
calculateAndRender();
