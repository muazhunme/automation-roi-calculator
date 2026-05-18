const taskProfiles = {
  invoice: {
    solution: "Invoice automation + approval workflow",
    fit: 0.78,
    timeline: "4-6 weeks",
    keywords: "high-volume, repetitive, finance-sensitive",
  },
  crm: {
    solution: "CRM workflow automation",
    fit: 0.68,
    timeline: "3-5 weeks",
    keywords: "customer-facing, repetitive, visibility-driven",
  },
  reporting: {
    solution: "Reporting automation",
    fit: 0.72,
    timeline: "2-4 weeks",
    keywords: "recurring, data-heavy, dashboard-ready",
  },
  approval: {
    solution: "Approval workflow automation",
    fit: 0.7,
    timeline: "3-5 weeks",
    keywords: "multi-step, rules-based, handoff-heavy",
  },
  contract: {
    solution: "Contract automation",
    fit: 0.62,
    timeline: "5-8 weeks",
    keywords: "document-heavy, date-sensitive, risk-aware",
  },
  dataEntry: {
    solution: "RPA or system integration",
    fit: 0.74,
    timeline: "3-6 weeks",
    keywords: "repetitive, manual, error-prone",
  },
  customerEmails: {
    solution: "AI support bot + workflow routing",
    fit: 0.58,
    timeline: "4-7 weeks",
    keywords: "language-based, high-touch, response-driven",
  },
  complianceEvidence: {
    solution: "Compliance evidence automation",
    fit: 0.65,
    timeline: "5-8 weeks",
    keywords: "audit-ready, deadline-driven, documentation-heavy",
  },
};

const areaWeights = {
  finance: 8,
  sales: 6,
  hr: 4,
  operations: 7,
  support: 5,
  compliance: 8,
};

const levelWeights = {
  low: 3,
  medium: 8,
  high: 14,
};

const clarityWeights = {
  clear: 12,
  partial: 6,
  unclear: -8,
};

const toolWeights = {
  single: 3,
  few: 8,
  many: 10,
};

const judgementWeights = {
  low: 12,
  medium: 3,
  high: -12,
};

const industryWeights = {
  accounting: { finance: 8, compliance: 5, operations: 2 },
  healthcare: { compliance: 8, support: 4, operations: 3 },
  retail: { operations: 7, sales: 5, finance: 3 },
  saas: { support: 7, sales: 5, reporting: 4 },
  education: { operations: 5, compliance: 4, support: 4 },
  logistics: { operations: 9, compliance: 3, finance: 2 },
  realEstate: { sales: 6, compliance: 5, finance: 3 },
};

export const sampleScenarios = [
  {
    name: "Invoice processing",
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
    industry: "accounting",
    errorFrequency: "medium",
    processClarity: "clear",
    toolComplexity: "few",
    judgementLevel: "low",
    urgency: "high",
  },
  {
    name: "Sales CRM updates",
    businessArea: "sales",
    taskType: "crm",
    hoursPerWeek: 9,
    hourlyCost: 32,
    overheadPercent: 25,
    monthlyAutomationTco: 250,
    errorCost: 35,
    opportunityValuePercent: 20,
    annualVolumeGrowth: 20,
    peopleInvolved: 5,
    weeklyVolume: 140,
    industry: "saas",
    errorFrequency: "low",
    processClarity: "partial",
    toolComplexity: "few",
    judgementLevel: "medium",
    urgency: "medium",
  },
  {
    name: "Compliance evidence",
    businessArea: "compliance",
    taskType: "complianceEvidence",
    hoursPerWeek: 18,
    hourlyCost: 48,
    overheadPercent: 35,
    monthlyAutomationTco: 650,
    errorCost: 120,
    opportunityValuePercent: 30,
    annualVolumeGrowth: 10,
    peopleInvolved: 4,
    weeklyVolume: 60,
    industry: "healthcare",
    errorFrequency: "high",
    processClarity: "partial",
    toolComplexity: "many",
    judgementLevel: "medium",
    urgency: "high",
  },
];

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function scoreVolume(volume) {
  if (volume >= 250) return 12;
  if (volume >= 100) return 9;
  if (volume >= 40) return 6;
  return 3;
}

function scoreHours(hours) {
  if (hours >= 25) return 16;
  if (hours >= 12) return 12;
  if (hours >= 6) return 8;
  return 4;
}

function classifyScore(score) {
  if (score >= 86) return "Strong automation priority";
  if (score >= 80) return "High priority";
  if (score >= 62) return "Strong candidate";
  if (score >= 45) return "Moderate candidate";
  return "Low priority";
}

function classifyRoi(monthlySaving) {
  if (monthlySaving >= 3000) return "Very high";
  if (monthlySaving >= 1200) return "High";
  if (monthlySaving >= 500) return "Medium";
  return "Low";
}

function errorRate(errorFrequency) {
  if (errorFrequency === "high") return 0.08;
  if (errorFrequency === "medium") return 0.035;
  return 0.012;
}

function industryBoost(input) {
  const profile = industryWeights[input.industry] || {};
  return profile[input.businessArea] || 0;
}

function classifyConfidence(input) {
  let confidence = 86;

  if (input.processClarity === "partial") confidence -= 14;
  if (input.processClarity === "unclear") confidence -= 28;
  if (input.toolComplexity === "many") confidence -= 12;
  if (input.judgementLevel === "high") confidence -= 16;
  if (input.weeklyVolume < 10) confidence -= 10;

  confidence = clamp(confidence, 20, 95);

  if (confidence >= 78) return { score: confidence, label: "High" };
  if (confidence >= 55) return { score: confidence, label: "Medium" };
  return { score: confidence, label: "Low" };
}

function classifyMatrix(impact, effort) {
  if (impact >= 65 && effort < 55) {
    return {
      quadrant: "Quick win",
      explanation: "High value with manageable delivery effort.",
    };
  }

  if (impact >= 65 && effort >= 55) {
    return {
      quadrant: "Strategic project",
      explanation: "Worth considering, but it needs planning and stakeholder support.",
    };
  }

  if (impact < 65 && effort < 55) {
    return {
      quadrant: "Optional improvement",
      explanation: "Could help, but it may not be the first automation priority.",
    };
  }

  return {
    quadrant: "Avoid for now",
    explanation: "Low value compared with the delivery effort.",
  };
}

function classifyComplexity(input, effortScore) {
  if (effortScore >= 72 || input.toolComplexity === "many" || input.judgementLevel === "high") {
    return "High complexity";
  }

  if (effortScore >= 48 || input.processClarity === "partial") {
    return "Medium complexity";
  }

  return "Low complexity";
}

function estimateBuildCost(complexity) {
  if (complexity === "High complexity") return 12000;
  if (complexity === "Medium complexity") return 6500;
  return 2500;
}

function buildPayback(netMonthlyBenefit, buildCost) {
  if (netMonthlyBenefit < 100) {
    return {
      months: null,
      label: "Not meaningful yet",
      explanation: "The estimated net monthly benefit is too low to justify a build-cost payback estimate.",
    };
  }

  const months = buildCost / netMonthlyBenefit;
  return {
    months: Number(months.toFixed(1)),
    label: `${months.toFixed(1)} months`,
    explanation: `Estimated build-cost band is $${buildCost.toLocaleString()}, so payback is about ${months.toFixed(1)} months using net monthly benefit after TCO.`,
  };
}

function buildRoadmap(score) {
  if (score < 45) {
    return [
      "Document the process steps and decision points.",
      "Standardise inputs, files, and handoffs.",
      "Measure volume and errors for two to four weeks.",
      "Reassess automation once the workflow is stable.",
    ];
  }

  if (score < 62) {
    return [
      "Map the current workflow and remove avoidable manual steps.",
      "Clean up data quality and ownership issues.",
      "Confirm expected savings with stakeholders.",
      "Build a small prototype only after the process is clearer.",
    ];
  }

  return [
    "Run discovery and confirm automation scope.",
    "Map exceptions, data sources, and approval rules.",
    "Build a prototype with sample process data.",
    "Test exceptions, launch, and monitor performance.",
  ];
}

function buildDecision(score, input, matrix) {
  if (score < 45) return "Do not automate yet";
  if (input.processClarity === "unclear") return "Document process first";
  if (input.toolComplexity === "many" && score < 72) return "Integrate systems first";
  if (input.judgementLevel === "high") return "Use AI decision support";
  if (score < 62) return "Improve workflow first";
  if (matrix.quadrant === "Quick win") return "Automate now";
  return "Plan as a strategic automation project";
}

function buildReasonCodes(input, monthlySaving, automationFitScore, businessValueScore) {
  const reasons = [];

  if (automationFitScore >= 70) reasons.push("Strong fit: the task is repeatable and rule-friendly.");
  if (businessValueScore >= 65) reasons.push("High value: the process has enough cost, volume, or urgency.");
  if (monthlySaving >= 1200) reasons.push("Strong savings: estimated monthly capacity saving is meaningful.");
  if (input.judgementLevel === "high") reasons.push("Caution: high human judgement reduces full automation fit.");
  if (input.processClarity === "unclear") reasons.push("Blocker: the workflow is unclear or changes often.");
  if (input.toolComplexity === "many") reasons.push("Integration risk: many disconnected systems are involved.");
  if (input.weeklyVolume < 20) reasons.push("Low volume: automation may not pay back quickly.");
  if (input.errorFrequency === "high") reasons.push("Quality driver: frequent errors increase improvement value.");
  if (input.overheadPercent >= 25) reasons.push("Burdened labour: overhead makes manual work more expensive than base hourly cost.");
  if (input.annualVolumeGrowth >= 15) reasons.push("Scaling upside: growing volume increases the long-term automation case.");

  return reasons;
}

function buildPreparationChecklist(input) {
  const checklist = [
    "Name one process owner.",
    "Document the current workflow from start to finish.",
    "Record current weekly volume, time spent, and error examples.",
    "Define the success metric for automation.",
  ];

  if (input.processClarity !== "clear") checklist.push("Standardise inputs and decision rules.");
  if (input.toolComplexity !== "single") checklist.push("List every system, file, and handoff used in the process.");
  if (input.judgementLevel !== "low") checklist.push("Separate rule-based steps from human judgement steps.");
  if (input.errorFrequency !== "low") checklist.push("Collect common exception and error cases.");

  return checklist;
}

function firstAutomationFeature(taskType) {
  const features = {
    invoice: "Duplicate invoice detection and approval routing",
    crm: "Automatic lead follow-up reminders and missing-field alerts",
    reporting: "Scheduled report refresh with variance highlights",
    approval: "Approval routing with overdue reminders",
    contract: "Renewal date extraction and alerting",
    dataEntry: "Structured form capture with validation checks",
    customerEmails: "Email classification and response routing",
    complianceEvidence: "Evidence request tracking with deadline reminders",
  };

  return features[taskType];
}

function requiredInputs(taskType) {
  const shared = ["process owner", "sample records", "exception examples", "success metric"];
  const taskInputs = {
    invoice: ["sample invoices", "approval rules", "supplier list", "duplicate examples"],
    crm: ["CRM field list", "lead stages", "follow-up rules", "sample leads"],
    reporting: ["source files", "KPI definitions", "refresh schedule", "report examples"],
    approval: ["approver roles", "approval thresholds", "handoff rules", "escalation rules"],
    contract: ["sample contracts", "renewal clauses", "key date rules", "risk categories"],
    dataEntry: ["input forms", "validation rules", "target system fields", "common errors"],
    customerEmails: ["sample emails", "response categories", "routing rules", "escalation examples"],
    complianceEvidence: ["control list", "evidence types", "owners", "audit deadlines"],
  };

  return [...taskInputs[taskType], ...shared];
}

function readinessChecklist(input) {
  return [
    { label: "Process is documented", done: input.processClarity === "clear" },
    { label: "Inputs are standardised", done: input.processClarity !== "unclear" },
    { label: "Data is accessible", done: input.toolComplexity !== "many" },
    { label: "Exceptions are known", done: input.errorFrequency !== "high" },
    { label: "Human judgement is limited", done: input.judgementLevel === "low" },
    { label: "Volume is worth improving", done: input.weeklyVolume >= 20 || input.hoursPerWeek >= 5 },
  ];
}

function buildRisksWithSeverity(input) {
  const risks = [];

  if (input.processClarity === "unclear") {
    risks.push({ severity: "High", text: "Process is unclear or changes often." });
  }

  if (input.toolComplexity === "many") {
    risks.push({ severity: "High", text: "Many disconnected tools may require integration planning." });
  }

  if (input.judgementLevel === "high") {
    risks.push({ severity: "High", text: "Human judgement is high, so full automation may create quality risk." });
  }

  if (input.weeklyVolume < 20 && input.hoursPerWeek < 5) {
    risks.push({ severity: "Medium", text: "Low volume may weaken the automation business case." });
  }

  if (input.errorFrequency === "high") {
    risks.push({ severity: "Medium", text: "Frequent errors mean exception handling must be designed carefully." });
  }

  if (risks.length === 0) {
    risks.push({ severity: "Low", text: "No major delivery risks detected for discovery." });
  }

  return risks;
}

function buildWorkflow(taskType) {
  const workflows = {
    invoice: {
      manual: ["Receive invoice", "Enter details", "Check duplicate", "Ask manager", "Update records"],
      automated: ["Capture invoice", "Extract fields", "Detect duplicate", "Route approval", "Export result"],
    },
    crm: {
      manual: ["Receive lead", "Search CRM", "Update fields", "Set reminder", "Follow up"],
      automated: ["Capture lead", "Validate fields", "Score lead", "Create task", "Trigger follow-up"],
    },
    reporting: {
      manual: ["Download data", "Clean sheet", "Update formulas", "Create charts", "Send report"],
      automated: ["Pull data", "Validate columns", "Refresh KPIs", "Generate summary", "Publish report"],
    },
    approval: {
      manual: ["Submit request", "Message approver", "Wait", "Chase update", "Record decision"],
      automated: ["Submit form", "Route approver", "Send reminder", "Capture decision", "Update status"],
    },
    contract: {
      manual: ["Open contract", "Find dates", "Check clauses", "Set reminder", "Email owner"],
      automated: ["Upload contract", "Extract dates", "Flag clauses", "Create reminder", "Notify owner"],
    },
    dataEntry: {
      manual: ["Read source", "Copy values", "Paste into system", "Check errors", "Submit"],
      automated: ["Capture input", "Validate fields", "Sync system", "Flag exceptions", "Submit clean record"],
    },
    customerEmails: {
      manual: ["Read email", "Classify request", "Draft response", "Assign owner", "Track status"],
      automated: ["Classify email", "Suggest response", "Route owner", "Create ticket", "Track SLA"],
    },
    complianceEvidence: {
      manual: ["List controls", "Ask owners", "Collect files", "Check gaps", "Build audit pack"],
      automated: ["Map controls", "Request evidence", "Track uploads", "Flag gaps", "Generate pack"],
    },
  };

  return workflows[taskType];
}

function buildOpportunityBacklog(input, decision, feature) {
  return [
    { type: "Quick win", item: feature },
    { type: "Control", item: "Add validation and exception tracking" },
    { type: "Reporting", item: "Create a dashboard for savings, errors, and process volume" },
    {
      type: "Next step",
      item:
        decision === "Automate now"
          ? "Build a small proof of concept"
          : "Complete readiness checklist before build work",
    },
  ];
}

function chooseAutomationStyle(input) {
  if (input.toolComplexity === "many") return "System integration";
  if (input.judgementLevel === "high") return "AI decision support";
  if (input.taskType === "reporting") return "Dashboard/reporting automation";
  if (input.taskType === "approval") return "Workflow automation";
  if (input.taskType === "customerEmails") return "AI assistant + routing";
  if (input.taskType === "dataEntry") return "RPA or form automation";
  return "Workflow automation";
}

function buildSensitivity(monthlySaving, readinessFactor, growthMonthlyBenefit) {
  return [
    { label: "Conservative", saving: Math.round(monthlySaving * 0.7), coverage: "Lower adoption" },
    { label: "Expected", saving: monthlySaving, coverage: `${Math.round(readinessFactor * 100)}% coverage` },
    { label: "Scaled volume", saving: Math.round(growthMonthlyBenefit), coverage: "After one year of volume growth" },
  ];
}

function explainConfidence(confidence, input) {
  const reasons = [];
  if (input.processClarity !== "clear") reasons.push("the process is not fully documented");
  if (input.toolComplexity === "many") reasons.push("many systems are involved");
  if (input.judgementLevel !== "low") reasons.push("human judgement affects the estimate");
  if (input.weeklyVolume < 10) reasons.push("volume is low");

  if (reasons.length === 0) {
    return "Confidence is high because the process is clear, repeatable, and has accessible inputs.";
  }

  return `Confidence is ${confidence.label.toLowerCase()} because ${reasons.join(", ")}.`;
}

function buildRecommendation(score, profile, monthlySaving, estimatedHoursSaved) {
  if (score < 45) {
    return {
      solution: "Do not automate yet",
      summary: `This is a ${profile.keywords} process, but the current business case is weak. Automation is not the best next step yet because the expected saving is low or the process is not ready. The better first step is to document the workflow, reduce variation, improve data quality, and revisit automation once the process has more volume or clearer rules.`,
    };
  }

  if (score < 62) {
    return {
      solution: "Improve the process before automation",
      summary: `This is a ${profile.keywords} process with some automation potential, but it needs process improvement before build work starts. The recommended next step is to clarify the workflow, remove avoidable manual steps, and confirm the business case before considering ${profile.solution.toLowerCase()}.`,
    };
  }

  return {
    solution: profile.solution,
    summary: `This is a ${profile.keywords} process. Based on the workload, error level, tool complexity, and process clarity, ${profile.solution.toLowerCase()} is the best-fit recommendation. The estimate suggests about ${estimatedHoursSaved.toLocaleString()} hours saved per month and roughly $${monthlySaving.toLocaleString()} in monthly capacity savings.`,
  };
}

function buildRisks(input) {
  const risks = [];

  if (input.processClarity === "unclear") {
    risks.push("The process should be documented before automation begins.");
  }

  if (input.toolComplexity === "many") {
    risks.push("Disconnected tools may require integration planning before build work.");
  }

  if (input.judgementLevel === "high") {
    risks.push("High human judgement means full automation may be risky; decision support may be safer.");
  }

  if (input.weeklyVolume < 20 && input.hoursPerWeek < 5) {
    risks.push("Low volume may reduce the business case for automation.");
  }

  if (input.errorFrequency === "high") {
    risks.push("High error frequency means testing and exception handling will be important.");
  }

  if (risks.length === 0) {
    risks.push("No major delivery risks detected for an early automation discovery phase.");
  }

  return risks;
}

export function calculateAutomationCase(input) {
  const profile = taskProfiles[input.taskType];
  const burdenedHourlyCost = input.hourlyCost * (1 + input.overheadPercent / 100);
  const weeklyCost = input.hoursPerWeek * burdenedHourlyCost;
  const monthlyCost = weeklyCost * 4.33;
  const peopleScore = clamp(input.peopleInvolved * 2, 2, 10);
  const industryScore = industryBoost(input);

  const automationFitScore = Math.round(
    clamp(
      profile.fit * 34 +
        clarityWeights[input.processClarity] +
        judgementWeights[input.judgementLevel] +
        toolWeights[input.toolComplexity] +
        scoreVolume(input.weeklyVolume) +
        levelWeights[input.errorFrequency],
      0,
      100
    )
  );

  const businessValueScore = Math.round(
    clamp(
      areaWeights[input.businessArea] +
        levelWeights[input.urgency] +
        industryScore +
        scoreVolume(input.weeklyVolume) +
        scoreHours(input.hoursPerWeek) +
        peopleScore +
        Math.min(monthlyCost / 55, 24) +
        Math.min(input.annualVolumeGrowth / 2, 10),
      0,
      100
    )
  );

  const rawScore =
    profile.fit * 24 +
    areaWeights[input.businessArea] +
    industryScore +
    levelWeights[input.errorFrequency] +
    levelWeights[input.urgency] +
    clarityWeights[input.processClarity] +
    toolWeights[input.toolComplexity] +
    judgementWeights[input.judgementLevel] +
    scoreVolume(input.weeklyVolume) +
    scoreHours(input.hoursPerWeek) +
    peopleScore;

  const readinessScore = Math.round(clamp(rawScore, 0, 100));
  const readinessFactor = clamp(readinessScore / 100, 0.25, 0.85);
  const estimatedHoursSaved = Math.round(input.hoursPerWeek * 4.33 * readinessFactor);
  const laborSavings = Math.round(monthlyCost * readinessFactor);
  const monthlyErrorCount = input.weeklyVolume * 4.33 * errorRate(input.errorFrequency);
  const errorSavings = Math.round(monthlyErrorCount * input.errorCost * readinessFactor);
  const opportunityValue = Math.round(laborSavings * (input.opportunityValuePercent / 100));
  const grossMonthlyBenefit = laborSavings + errorSavings + opportunityValue;
  const monthlySaving = Math.round(grossMonthlyBenefit - input.monthlyAutomationTco);
  const yearlySaving = monthlySaving * 12;
  const scaledMonthlyBenefit = Math.round(
    monthlySaving * (1 + input.annualVolumeGrowth / 100)
  );
  const toolEffort = input.toolComplexity === "many" ? 25 : input.toolComplexity === "few" ? 10 : 3;
  const clarityEffort =
    input.processClarity === "unclear" ? 25 : input.processClarity === "partial" ? 8 : -10;
  const judgementEffort =
    input.judgementLevel === "high" ? 30 : input.judgementLevel === "medium" ? 10 : -10;
  const effortScore = Math.round(
    clamp(35 + toolEffort + clarityEffort + judgementEffort - profile.fit * 15, 0, 100)
  );
  const confidence = classifyConfidence(input);
  const matrix = classifyMatrix(businessValueScore, effortScore);
  const complexity = classifyComplexity(input, effortScore);
  const buildCost = estimateBuildCost(complexity);
  const payback = buildPayback(monthlySaving, buildCost);
  const decision = buildDecision(readinessScore, input, matrix);
  const firstFeature = firstAutomationFeature(input.taskType);
  const automationStyle = chooseAutomationStyle(input);
  const recommendation = buildRecommendation(
    readinessScore,
    profile,
    monthlySaving,
    estimatedHoursSaved
  );

  return {
    readinessScore,
    automationFitScore,
    businessValueScore,
    effortScore,
    confidence,
    confidenceExplanation: explainConfidence(confidence, input),
    matrix,
    scoreLabel: classifyScore(readinessScore),
    decision,
    reasonCodes: buildReasonCodes(input, monthlySaving, automationFitScore, businessValueScore),
    solution: recommendation.solution,
    automationStyle,
    complexity,
    estimatedBuildCost: buildCost,
    payback,
    burdenedHourlyCost: Math.round(burdenedHourlyCost),
    laborSavings,
    errorSavings,
    opportunityValue,
    grossMonthlyBenefit,
    monthlyAutomationTco: input.monthlyAutomationTco,
    scaledMonthlyBenefit,
    monthlyCost: Math.round(monthlyCost),
    monthlySaving,
    yearlySaving,
    estimatedHoursSaved,
    roiCategory: classifyRoi(monthlySaving),
    timeline: profile.timeline,
    roadmap: buildRoadmap(readinessScore),
    preparationChecklist: buildPreparationChecklist(input),
    firstAutomationFeature: firstFeature,
    requiredInputs: requiredInputs(input.taskType),
    readinessChecklist: readinessChecklist(input),
    riskDetails: buildRisksWithSeverity(input),
    workflow: buildWorkflow(input.taskType),
    opportunityBacklog: buildOpportunityBacklog(input, decision, firstFeature),
    sensitivity: buildSensitivity(monthlySaving, readinessFactor, scaledMonthlyBenefit),
    risks: buildRisks(input),
    summary: recommendation.summary,
  };
}
