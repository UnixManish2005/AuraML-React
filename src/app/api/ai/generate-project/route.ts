// ============================================================
// AI PROJECT GENERATOR API
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { generateText, AI_SYSTEM_PROMPTS } from "@/lib/ai/provider";

function buildPrompt(project: {
  title: string;
  category: string;
  difficulty: string;
  tech: string[];
}) {
  const techJson = JSON.stringify(project.tech);

  // Build the prompt using string concatenation — avoids backtick-inside-template-literal errors
  return (
    "Generate a complete project blueprint for: \"" + project.title + "\"\n" +
    "Category: " + project.category + "\n" +
    "Difficulty: " + project.difficulty + "\n" +
    "Tech Stack: " + project.tech.join(", ") + "\n\n" +
    "Return ONLY valid JSON (no markdown fences, no extra text) in this exact format:\n" +
    "{\n" +
    "  \"title\": \"" + project.title + "\",\n" +
    "  \"overview\": \"3-4 sentence description explaining the problem, approach, and impact\",\n" +
    "  \"techStack\": " + techJson + ",\n" +
    "  \"structure\": \"project_root/\\n├── data/\\n│   ├── raw/\\n│   └── processed/\\n├── notebooks/\\n│   └── exploration.ipynb\\n├── src/\\n│   ├── __init__.py\\n│   ├── model.py\\n│   ├── train.py\\n│   └── evaluate.py\\n├── models/\\n├── app/\\n│   └── main.py\\n├── requirements.txt\\n└── README.md\",\n" +
    "  \"readme\": \"# " + project.title + "\\n\\n## Overview\\n[Description]\\n\\n## Features\\n- Feature 1\\n- Feature 2\\n\\n## Installation\\npip install -r requirements.txt\\n\\n## Usage\\n[Instructions]\\n\\n## Results\\n[Expected outcomes]\",\n" +
    "  \"guide\": [\n" +
    "    {\"step\": \"Step 1: Setup & Data Collection\", \"description\": \"Install dependencies and collect/load your dataset\"},\n" +
    "    {\"step\": \"Step 2: Exploratory Data Analysis\", \"description\": \"Understand data shape, distributions, and correlations\"},\n" +
    "    {\"step\": \"Step 3: Data Preprocessing\", \"description\": \"Handle missing values, encode categoricals, scale features\"},\n" +
    "    {\"step\": \"Step 4: Model Building\", \"description\": \"Train and compare candidate models\"},\n" +
    "    {\"step\": \"Step 5: Evaluation & Tuning\", \"description\": \"Measure performance metrics and tune hyperparameters\"},\n" +
    "    {\"step\": \"Step 6: Deployment\", \"description\": \"Wrap the model in an API or Streamlit app and deploy\"}\n" +
    "  ],\n" +
    "  \"keyFiles\": [\n" +
    "    {\"name\": \"src/model.py\", \"purpose\": \"Core ML model class and training logic\"},\n" +
    "    {\"name\": \"src/data_preprocessing.py\", \"purpose\": \"Data cleaning and feature engineering pipeline\"},\n" +
    "    {\"name\": \"src/train.py\", \"purpose\": \"Training script with hyperparameter configuration\"},\n" +
    "    {\"name\": \"app/main.py\", \"purpose\": \"FastAPI or Streamlit application entry point\"},\n" +
    "    {\"name\": \"notebooks/exploration.ipynb\", \"purpose\": \"EDA and experimentation notebook\"}\n" +
    "  ]\n" +
    "}"
  );
}

const FALLBACK_RESULT = {
  title: "Project Blueprint",
  overview:
    "AI generation failed. Please check your GEMINI_API_KEY or OPENROUTER_API_KEY in .env.local and try again.",
  techStack: ["Python", "Scikit-learn", "Pandas"],
  structure: "project/\n├── src/\n├── data/\n├── notebooks/\n└── README.md",
  readme: "# Project\n\nAdd your README here.",
  guide: [
    {
      step: "Setup",
      description: "Install dependencies: pip install -r requirements.txt",
    },
  ],
  keyFiles: [{ name: "src/model.py", purpose: "Core model logic" }],
};

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { project } = await req.json();
    if (!project?.title) {
      return NextResponse.json(
        { error: "Project details required" },
        { status: 400 }
      );
    }

    const raw = await generateText(
      buildPrompt(project),
      AI_SYSTEM_PROMPTS.projectGenerator
    );

    // Strip any markdown fences the model may have added
    const cleaned = raw
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    const result = JSON.parse(cleaned);
    return NextResponse.json({ result });
  } catch (error) {
    console.error("[PROJECT GENERATOR]", error);
    return NextResponse.json({ result: FALLBACK_RESULT });
  }
}