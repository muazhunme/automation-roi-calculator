import { calculateAutomationCase, sampleScenarios } from "./scoring.js";

const form = document.querySelector("#auditForm");
const resetButton = document.querySelector("#resetButton");
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
  document.querySelector("#monthlySaving").textContent = money(result.monthlySaving);
  document.querySelector("#hoursSaved").textContent = result.estimatedHoursSaved;
  document.querySelector("#roiCategory").textContent = result.roiCategory;
  document.querySelector("#timeline").textContent = result.timeline;
  document.querySelector("#summaryText").textContent = result.summary;

  const riskList = document.querySelector("#riskList");
  riskList.replaceChildren(
    ...result.risks.map((risk) => {
      const item = document.createElement("li");
      item.textContent = risk;
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
        <small>${scenario.hoursPerWeek} hrs/week · ${scenario.weeklyVolume} items/week</small>
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

renderSamples();
writeForm(sampleScenarios[0]);
calculateAndRender();
