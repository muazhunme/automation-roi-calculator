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

export const sampleScenarios = [
  {
    name: "Invoice processing",
    businessArea: "finance",
    taskType: "invoice",
    hoursPerWeek: 12,
    hourlyCost: 35,
    peopleInvolved: 3,
    weeklyVolume: 80,
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
    peopleInvolved: 5,
    weeklyVolume: 140,
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
    peopleInvolved: 4,
    weeklyVolume: 60,
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
  const weeklyCost = input.hoursPerWeek * input.hourlyCost;
  const monthlyCost = weeklyCost * 4.33;
  const peopleScore = clamp(input.peopleInvolved * 2, 2, 10);

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
        scoreVolume(input.weeklyVolume) +
        scoreHours(input.hoursPerWeek) +
        peopleScore +
        Math.min(monthlyCost / 55, 24),
      0,
      100
    )
  );

  const rawScore =
    profile.fit * 24 +
    areaWeights[input.businessArea] +
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
  const monthlySaving = Math.round(monthlyCost * readinessFactor);
  const yearlySaving = monthlySaving * 12;
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
    matrix,
    scoreLabel: classifyScore(readinessScore),
    solution: recommendation.solution,
    monthlyCost: Math.round(monthlyCost),
    monthlySaving,
    yearlySaving,
    estimatedHoursSaved,
    roiCategory: classifyRoi(monthlySaving),
    timeline: profile.timeline,
    roadmap: buildRoadmap(readinessScore),
    risks: buildRisks(input),
    summary: recommendation.summary,
  };
}
