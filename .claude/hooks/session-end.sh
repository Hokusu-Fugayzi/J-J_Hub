#!/bin/bash
# Marks the Claude session task as done when the session ends

API_URL="http://localhost:3001"
API_KEY="jj_dev_key_2026"

# Read session info from stdin
INPUT=$(cat)
SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // "unknown"')

# Find the task matching this session
TASKS=$(curl -s -H "Authorization: Bearer $API_KEY" "$API_URL/api/tasks?status=in-progress")

# Find task with matching session ID in description
TASK_ID=$(echo "$TASKS" | jq -r --arg sid "$SESSION_ID" '.[] | select(.description | contains($sid)) | .id' 2>/dev/null | head -1)

if [ -n "$TASK_ID" ] && [ "$TASK_ID" != "null" ]; then
  curl -s -X PATCH \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $API_KEY" \
    -d '{"status": "done"}' \
    "$API_URL/api/tasks/$TASK_ID" > /dev/null 2>&1
fi

exit 0
