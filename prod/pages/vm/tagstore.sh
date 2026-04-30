#!/bin/sh
# tagstore.sh — read/write GitHub Issues as tag storage from inside the VM
REPO="teslasolar/instantvm"
LABEL="instantvm"
API="https://api.github.com/repos/$REPO/issues"

echo "=== InstantVM Tag Store ==="
echo "Repo: $REPO"
echo ""

# Read tags
echo "Fetching tags..."
wget -qO- "$API?labels=$LABEL&per_page=20&state=open" 2>/dev/null | \
  grep -o '"title":"[^"]*"' | sed 's/"title":"//;s/"//' | while read t; do
    echo "  tag: $t"
  done

echo ""
echo "Commands:"
echo "  read          - list all tags"
echo "  get <id>      - read tag value"
echo "  set <id> <v>  - write tag (needs GH_TOKEN)"
echo "  status        - VM status"
echo "  exit          - quit"
echo ""

while true; do
  printf "instantvm> "
  read cmd arg1 arg2

  case "$cmd" in
    read)
      wget -qO- "$API?labels=$LABEL&per_page=50&state=open" 2>/dev/null | \
        grep -o '"title":"[^"]*"' | sed 's/"title":"//;s/"//' | while read t; do
          echo "  $t"
        done
      ;;
    get)
      wget -qO- "$API?labels=$LABEL&per_page=50&state=open" 2>/dev/null | \
        grep -A5 "\"title\":\"$arg1\"" | head -10
      ;;
    set)
      if [ -z "$GH_TOKEN" ]; then echo "Set GH_TOKEN first"; continue; fi
      wget -qO- --header="Authorization: token $GH_TOKEN" \
        --header="Content-Type: application/json" \
        --post-data="{\"title\":\"$arg1\",\"body\":\"\`\`\`json\n{\\\"value\\\":\\\"$arg2\\\",\\\"ts\\\":\\\"$(date)\\\"}\n\`\`\`\",\"labels\":[\"$LABEL\"]}" \
        "$API" 2>/dev/null | grep -o '"number":[0-9]*'
      echo "  saved"
      ;;
    status)
      echo "  VM: running"
      echo "  OS: $(uname -a 2>/dev/null || echo 'unknown')"
      echo "  Mem: $(free 2>/dev/null | head -2 | tail -1 || echo 'n/a')"
      ;;
    exit|quit)
      echo "Bye"
      break
      ;;
    *)
      echo "  unknown: $cmd"
      ;;
  esac
done
