"""
export_training_data.py
-----------------------
Export successful ARCHON builds from Supabase as a JSONL fine-tuning dataset.

Usage:
    python scripts/export_training_data.py

Output:
    archon_training.jsonl  — ready for OpenAI / HuggingFace fine-tuning

Requirements:
    - .env with SUPABASE_URL and SUPABASE_KEY set
    - At least 500 rows with PASS feedback in code_memory table
"""

import json
import sys
import os

# Allow running from project root
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.memory.supabase_memory import supabase

# ── 1. Check dataset size ─────────────────────────────────────────────────────
result = supabase.table("code_memory") \
    .select("id, task, attempts, efficiency_score, feedback") \
    .execute()
data = result.data

total        = len(data)
single_shot  = sum(1 for r in data if r["attempts"] == 1)
passed       = sum(1 for r in data if "PASS" in (r.get("feedback") or ""))
high_quality = sum(1 for r in data if (r.get("efficiency_score") or 0) > 0.7)

print(f"Total runs:         {total}")
print(f"1-attempt (best):   {single_shot}")
print(f"Critic PASS:        {passed}")
print(f"High efficiency:    {high_quality}")
print(f"Ready to fine-tune: {'YES' if passed >= 500 else f'NO — need {500 - passed} more'}")
print()

if passed < 500:
    print("Collect more runs before fine-tuning. Exiting.")
    sys.exit(0)

# ── 2. Export JSONL ───────────────────────────────────────────────────────────
full_result = supabase.table("code_memory") \
    .select("task, code, feedback, attempts, efficiency_score") \
    .order("efficiency_score", desc=True) \
    .execute()

examples = []
for row in full_result.data:
    if not row["code"] or not row["task"]:
        continue
    if "PASS" not in (row.get("feedback") or ""):
        continue

    examples.append({
        "messages": [
            {
                "role": "system",
                "content": (
                    "You are an expert software engineer. "
                    "Write complete, production-quality code files. "
                    "No placeholders, no TODO comments, no truncation. "
                    "Return ONLY the file code."
                )
            },
            {
                "role": "user",
                "content": f"Task: {row['task']}\n\nGenerate the complete file:"
            },
            {
                "role": "assistant",
                "content": row["code"]
            }
        ]
    })

output_path = "archon_training.jsonl"
with open(output_path, "w") as f:
    for ex in examples:
        f.write(json.dumps(ex) + "\n")

print(f"Exported {len(examples)} training examples -> {output_path}")
print("Next step: run scripts/fine_tune.py on a RunPod A100 GPU.")
