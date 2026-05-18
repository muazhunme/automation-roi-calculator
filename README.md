# Business Automation ROI Calculator

A browser-based automation audit tool that estimates whether a manual business process is worth automating.

The project is designed as a practical portfolio piece for automation, CRM, RPA, analytics, and business intelligence roles. It turns process inputs into an automation readiness score, estimated monthly savings, recommended automation type, implementation timeline, and delivery risk flags.

## Why This Project Exists

Automation companies often begin with a discovery or audit phase before recommending RPA, CRM workflows, invoice automation, reporting automation, AI bots, or system integrations.

This project models that early discovery step with transparent, client-side scoring logic.

## Features

- Automation intake form
- Readiness score from 0 to 100
- Separate automation fit and business value scores
- Estimated monthly cost savings
- Estimated yearly savings
- Fully burdened labour cost assumptions
- Total cost of ownership assumptions
- Error and rework savings
- Opportunity value from reallocated time
- Volume scaling forecast
- Estimated hours saved per month
- ROI category
- Impact versus effort matrix
- Confidence score
- Automation Decision Advisor
- Reason codes for every recommendation
- 30-day preparation checklist
- Required data and system inputs
- Automation readiness checklist
- Risk severity levels
- Estimated build complexity
- ROI payback period
- Manual vs automated workflow comparison
- Opportunity backlog
- Industry presets
- AI vs RPA vs integration recommendation
- Sensitivity analysis
- Case study and model explanation pages
- Recommended automation type
- Implementation timeline
- Risk flags
- Suggested implementation roadmap
- Printable assessment report
- Sample business scenarios
- No backend, login, paid API, or database required

## Sample Use Cases

- Invoice processing
- CRM updates
- Weekly reporting
- Approval workflows
- Contract renewal tracking
- Compliance evidence collection
- Manual data entry
- Customer email routing

## Tech Stack

- HTML
- CSS
- JavaScript
- Browser-native ES modules
- Node.js static preview server

## Project Structure

```text
automation-roi-calculator/
  index.html
  styles.css
  server.mjs
  src/
    app.js
    scoring.js
```

## How It Works

The app does not need a dataset. It uses a rules-based scoring model.

The user enters process details such as:

- business area
- task type
- hours spent per week
- hourly cost
- people involved
- weekly process volume
- error frequency
- process clarity
- tool complexity
- urgency
- human judgement required

The scoring engine estimates:

- automation readiness
- automation fit
- business value
- monthly savings
- yearly savings
- hours saved
- ROI category
- recommended solution
- implementation timeline
- impact versus effort category
- confidence level
- suggested roadmap
- delivery risks

## Run Locally

```bash
node server.mjs
```

Then open:

```text
http://127.0.0.1:4173/
```

## Suggested GitHub Repository

```text
muazhunme/automation-roi-calculator
```

Suggested repository description:

```text
A business automation audit tool that estimates ROI, readiness, savings, risks, and best-fit automation options for manual workflows.
```

Suggested topics:

```text
automation, roi-calculator, business-analytics, rpa, crm, javascript, portfolio-project
```

## Portfolio Angle

This project shows:

- business analytics thinking
- automation discovery logic
- dashboard-style UI design
- ROI modelling
- explainable recommendations
- practical product thinking for real companies

## Future Improvements

- Add printable report export
- Add process comparison mode
- Add impact vs effort matrix
- Add saved scenarios with local storage
- Add CSV export
- Add test coverage for scoring logic
- Add a deployment workflow for GitHub Pages
