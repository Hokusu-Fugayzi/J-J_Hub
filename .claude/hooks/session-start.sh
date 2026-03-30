#!/bin/bash
# Creates a task on the J&J Hub board when a Claude Code session starts

API_URL="http://localhost:3001"
API_KEY="jj_dev_key_2026"

# Read session info from stdin
INPUT=$(cat)
SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // "unknown"')
CWD=$(echo "$INPUT" | jq -r '.cwd // "unknown"')

# Extract just the project folder name from cwd
PROJECT=$(basename "$CWD")

# Create a task on the board
curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -d "$(jq -n \
    --arg title "Claude session: $PROJECT" \
    --arg desc "Session $SESSION_ID in $CWD" \
    --arg sid "$SESSION_ID" \
    '{
      title: $title,
      description: $desc,
      status: "in-progress",
      priority: "medium",
      assigned_to: "both",
      project_id: null,
      sprint_id: null,
      due_date: null
    }')" \
  "$API_URL/api/tasks" > /dev/null 2>&1

exit 0
