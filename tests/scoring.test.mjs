import assert from "node:assert/strict";
import { calculateAutomationCase, sampleScenarios } from "../src/scoring.js";

const base = {
  city: "sydney",
  industry: "accounting",
  businessArea: "finance",
  taskType: "invoice",
  hoursPerWeek: 12,
  hourlyCost: 35,
  overheadPercent: 30,
  monthlyAutomationTco: 350,
  errorCost: 45,
  opportunityValuePercent: 25,
  annualVolumeGrowth: 15,
  peopleInvolved: 3,
  weeklyVolume: 80,
  errorFrequency: "medium",
  processClarity: "clear",
  toolComplexity: "few",
  judgementLevel: "low",
  urgency: "high",
};

function calculate(overrides = {}) {
  return calculateAutomationCase({ ...base, ...overrides });
}

{
  const result = calculate();
  assert.equal(result.currency, "AUD");
  assert.equal(result.cityLabel, "Sydney");
  assert.ok(result.readinessScore < 90);
  assert.ok(result.monthlySaving > 0);
  assert.ok(result.assumptions.some((item) => item.includes("Australia")));
  assert.ok(result.stakeholderReview.length >= 4);
  assert.equal(result.riskRange.length, 3);
  assert.ok(result.riskRange[0].monthlySaving <= result.riskRange[1].monthlySaving);
  assert.ok(result.riskRange[2].monthlySaving >= result.riskRange[1].monthlySaving);
}

{
  const result = calculate({
    hoursPerWeek: 80,
    weeklyVolume: 2000,
    hourlyCost: 80,
    overheadPercent: 60,
    monthlyAutomationTco: 100,
    errorCost: 500,
    opportunityValuePercent: 80,
    annualVolumeGrowth: 80,
    peopleInvolved: 20,
    errorFrequency: "high",
    processClarity: "partial",
    toolComplexity: "many",
    judgementLevel: "medium",
  });
  assert.ok(result.readinessScore <= 82);
  assert.notEqual(result.readinessScore, 100);
}

{
  const result = calculate({
    hoursPerWeek: 80,
    weeklyVolume: 2000,
    hourlyCost: 80,
    overheadPercent: 60,
    monthlyAutomationTco: 100,
    errorCost: 500,
    opportunityValuePercent: 80,
    annualVolumeGrowth: 80,
    peopleInvolved: 20,
    errorFrequency: "medium",
    processClarity: "clear",
    toolComplexity: "single",
    judgementLevel: "low",
  });
  assert.ok(result.readinessScore <= 97);
  assert.notEqual(result.readinessScore, 100);
}

{
  const result = calculate({
    hoursPerWeek: 1,
    weeklyVolume: 1,
    monthlyAutomationTco: 3000,
    urgency: "low",
  });
  assert.notEqual(result.solution, "Invoice automation + approval workflow");
  assert.match(result.summary, /not strong enough|weak|monitor|not the best/i);
}

{
  const result = calculate({
    processClarity: "unclear",
    hoursPerWeek: 30,
    weeklyVolume: 500,
  });
  assert.equal(result.decision, "Document process first");
  assert.equal(result.solution, "Document process before automation");
}

{
  const result = calculate({
    judgementLevel: "high",
    processClarity: "clear",
    toolComplexity: "single",
    hoursPerWeek: 30,
    weeklyVolume: 500,
  });
  assert.equal(result.decision, "Use AI decision support");
  assert.equal(result.solution, "Use AI decision support");
}

{
  const result = calculate({
    monthlyAutomationTco: 50000,
  });
  assert.ok(result.monthlySaving < 0);
  assert.equal(result.payback.label, "Not meaningful yet");
}

for (const scenario of sampleScenarios) {
  const result = calculateAutomationCase(scenario);
  assert.equal(result.currency, "AUD");
  assert.ok(Number.isFinite(result.readinessScore));
  assert.ok(result.assumptions.length > 0);
}

console.log("Scoring tests passed");
