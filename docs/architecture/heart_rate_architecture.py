from graphviz import Digraph

# ---------------------------------------------------------
# HCDD 412 - Medical Heart Rate Calculator
# Week 6 Architecture Diagram
# ---------------------------------------------------------

dot = Digraph(
    "Heart_Rate_Calculator_Architecture",
    filename="heart_rate_architecture",
    format="pdf",
)

# Overall diagram settings
dot.attr(
    rankdir="TB",
    splines="spline",
    nodesep="0.55",
    ranksep="0.75",
    pad="0.4",
    bgcolor="white",
    label="Web-Based Medical Heart Rate Calculator\nSystem Architecture",
    labelloc="t",
    fontsize="22",
    fontname="Arial Bold",
)

# Default node style
dot.attr(
    "node",
    shape="box",
    style="rounded,filled",
    fillcolor="white",
    fontname="Arial",
    fontsize="11",
    margin="0.18,0.12",
)

# Default arrow style
dot.attr(
    "edge",
    fontname="Arial",
    fontsize="9",
    arrowsize="0.8",
)

# =========================================================
# USER
# =========================================================

dot.node(
    "user",
    "USER",
    shape="oval",
)

# =========================================================
# MICROSOFT AZURE HOSTED APPLICATION
# =========================================================

with dot.subgraph(name="cluster_azure") as azure:
    azure.attr(
        label="MICROSOFT AZURE — HOSTING ENVIRONMENT",
        style="rounded",
        penwidth="2",
        fontsize="15",
        fontname="Arial Bold",
        margin="22",
    )

    # Frontend
    azure.node(
        "frontend",
        """WEB INTERFACE / FRONTEND
Name Input
Age Input
Gender Selection
Calculate Heart Rate Button
Reset / Clear Button""",
    )

    # Validation
    azure.node(
        "validation",
        """INPUT VALIDATION
Check Required Fields
Validate Age
Validate Name & Gender
Reject Invalid Values
Display Error Messages""",
    )

    # Backend
    azure.node(
        "backend",
        """BACKEND / APPLICATION LOGIC
Node.js
Python 3.14
Receives Validated Input
Sends Data to Calculation Functions""",
    )

    # Calculation engine
    azure.node(
        "calculator",
        """HEART RATE CALCULATION ENGINE
Maximum Heart Rate = 220 - Age
Moderate Zone = 50% - 70%
Vigorous Zone = 70% - 85%""",
    )

    # Results
    azure.node(
        "results",
        """RESULTS / DASHBOARD
Maximum Heart Rate
Moderate Heart Rate Zone
Vigorous Heart Rate Zone
Explanation / Feedback
Medical Disclaimer""",
    )

# =========================================================
# MAIN APPLICATION FLOW
# =========================================================

dot.edge(
    "user",
    "frontend",
    label=" Name / Age / Gender ",
)

dot.edge(
    "frontend",
    "validation",
    label=" User Input ",
)

dot.edge(
    "validation",
    "backend",
    label=" Valid Input ",
)

dot.edge(
    "backend",
    "calculator",
    label=" Process Data ",
)

dot.edge(
    "calculator",
    "results",
    label=" Calculated Results ",
)

# =========================================================
# DEVELOPMENT / AI SECTION
# =========================================================

with dot.subgraph(name="cluster_development") as dev:
    dev.attr(
        label="DEVELOPMENT, AI & CI/CD",
        style="rounded",
        fontsize="15",
        fontname="Arial Bold",
        margin="22",
    )

    # AI component
    dev.node(
        "copilot",
        """AI INTEGRATION POINT
GitHub Copilot
Code Assistance
Code Suggestions
Test Generation Assistance
Development Support
Human Verification Required""",
        style="rounded,dashed,filled",
        penwidth="2",
    )

    # Fallback
    dev.node(
        "manual",
        """FALLBACK PATH
MANUAL DEVELOPMENT
If Copilot is unavailable
or a suggestion is rejected:
Developer manually writes
or reviews the code""",
        style="rounded,filled",
    )

    # Development team
    dev.node(
        "team",
        """DEVELOPMENT TEAM
Eric
Timothy
Giovanni
Erika""",
    )

    # GitHub
    dev.node(
        "github",
        """GITHUB REPOSITORY
Source Code
Branches
Version Control""",
    )

    # GitHub Actions
    dev.node(
        "actions",
        """GITHUB ACTIONS
Automated Testing
Continuous Integration
Continuous Deployment
Triggered by Commit / Push""",
    )

    # Azure deployment
    dev.node(
        "azuredeploy",
        """MICROSOFT AZURE
Application Deployment
Hosting Environment""",
    )

# =========================================================
# AI / DEVELOPMENT FLOW
# =========================================================

dot.edge(
    "copilot",
    "team",
    label=" AI-Assisted Development ",
    style="dashed",
)

dot.edge(
    "copilot",
    "manual",
    label=" Unavailable / Suggestion Rejected ",
    style="dashed",
)

dot.edge(
    "manual",
    "team",
    label=" Manual Review / Coding ",
)

dot.edge(
    "team",
    "github",
    label=" Commit / Push ",
)

dot.edge(
    "github",
    "actions",
    label=" Code Change ",
)

dot.edge(
    "actions",
    "azuredeploy",
    label=" Test & Deploy ",
)

# Show connection between deployment pipeline
# and the hosted application
dot.edge(
    "azuredeploy",
    "backend",
    label=" Deploy Application ",
    style="dashed",
)

# =========================================================
# API CONTRACT
# =========================================================

dot.node(
    "api",
    """API CONTRACT
POST /api/heart-rate

REQUEST
name: string
age: integer
gender: string

RESPONSE — 200
maximumHeartRate: number
moderateZone: string
vigorousZone: string

ERROR — 400
Invalid User Input""",
    shape="note",
    style="filled",
    fontsize="10",
)

dot.edge(
    "backend",
    "api",
    style="dotted",
    arrowhead="none",
    minlen="0",
    tailport="e",
    headport="w",
)

# =========================================================
# LEGEND
# =========================================================

dot.node(
    "legend",
    """LEGEND
Solid Arrow = Application / Development Flow
Dashed Box = AI / External Boundary
Dashed Arrow = AI or Deployment Interaction
Dotted Line = Documentation / API Contract""",
    shape="note",
    fontsize="9",
)

# =========================================================
# EXPORT
# =========================================================

dot.render(cleanup=True)

# Also create a PNG for easy viewing
dot.format = "png"

dot.render(
    filename="heart_rate_architecture_preview",
    cleanup=True,
)

print("Diagram created successfully!")
print("PDF: heart_rate_architecture.pdf")
print("PNG: heart_rate_architecture_preview.png")