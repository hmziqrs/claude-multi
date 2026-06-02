---
title: "A/B Test AI Providers on the Same Codebase"
description: "Run the same prompt through GLM, DeepSeek, and MiniMax in parallel. Score them on correctness, speed, and cost. Pick the winner based on data, not marketing."
difficulty: "Advanced"
timeRequired: "15 min"
prerequisites:
  - "claude-multi installed"
  - "API keys for at least three providers (GLM, DeepSeek, MiniMax)"
  - "A codebase to test against"
  - "A list of test prompts relevant to your project"
relatedProviders:
  - "GLM"
  - "DeepSeek"
  - "MiniMax"
order: 6
---

Every provider claims to be the best at coding. The only way to know which one handles your codebase is to test them yourself. This guide shows you how to run a structured A/B test across multiple providers using claude-multi.

## Step 1: Create test instances

Create one instance per provider. Use a `test-` prefix to keep them separate from your daily drivers:

```bash
claude-multi
# Add new instance: test-glm     (template: glm)
# Add new instance: test-deepseek (template: deepseek)
# Add new instance: test-minimax  (template: minimax)
```

Enable auto-sync on all three so they share your plugins and MCP servers:

```bash
claude-multi
# Pick: Toggle auto-sync
# Select: test-glm, test-deepseek, test-minimax
```

## Step 2: Define your test prompts

Create a file with prompts that represent your actual workload. Use your real codebase, not toy problems.

```bash
cat > ~/test-prompts.txt << 'EOF'
1. "refactor the auth module to use JWTs instead of sessions"
2. "write integration tests for the payment flow"
3. "find the race condition in src/workers/queue.ts"
4. "optimize the database queries in the reporting endpoint"
5. "add OpenTelemetry tracing to the API layer"
EOF
```

Pick 5-10 prompts that cover the range of tasks you do regularly. Include some easy ones (refactoring, testing) and some hard ones (debugging, architecture).

## Step 3: Run the benchmark

Open three terminals (or use tmux panes). Run each prompt through each provider:

### Prompt 1

```bash
# Terminal 1
time claude-test-glm -p "refactor the auth module to use JWTs instead of sessions"

# Terminal 2
time claude-test-deepseek -p "refactor the auth module to use JWTs instead of sessions"

# Terminal 3
time claude-test-minimax -p "refactor the auth module to use JWTs instead of sessions"
```

Record the wall-clock time for each. Repeat for every prompt in your list.

## Step 4: Build a scoring sheet

Use this structure to track results:

| Prompt | Provider | Correct? | Depth (1-5) | Speed (s) | Tokens | Notes |
|--------|----------|----------|-------------|-----------|--------|-------|
| Refactor auth | GLM | Y/N | | | | |
| Refactor auth | DeepSeek | Y/N | | | | |
| Refactor auth | MiniMax | Y/N | | | | |

### Scoring criteria

| Criterion | What to check |
|-----------|--------------|
| **Correctness** | Does the code compile? Do tests pass? |
| **Depth** | Does it find the root cause or just patch the symptom? |
| **Speed** | Wall-clock time from the `time` command |
| **Cost** | Token count multiplied by per-token price |
| **Context handling** | Does it understand your project structure? |
| **Follow-up quality** | Ask a clarifying question. Is the follow-up useful? |

## Step 5: Analyze results

### Per-prompt winner

For each prompt, identify which provider performed best. You might find that different providers win on different task types. DeepSeek might be faster on refactoring, while GLM might be better at debugging.

### Aggregate scores

Sum the depth scores and average the speeds across all prompts. Calculate total cost using each provider's pricing page.

### The decision

Pick your primary provider based on:

1. **Correctness is non-negotiable**. If a provider produces wrong code, it is out.
2. **Weight by task frequency**. If you do more refactoring than debugging, weight the refactoring scores higher.
3. **Factor in cost**. A provider that is 10% worse but 50% cheaper might be the right daily driver.

## Step 6: Clean up or keep

Remove the test instances if you are done:

```bash
claude-multi
# Pick: Remove instance
# Select: test-glm
# Select: test-deepseek
# Select: test-minimax
```

Or keep them around for quarterly re-testing. Provider quality changes over time. What was best in January might not be best in June.

## Automating the benchmark

For repeated testing, wrap the process in a script:

```bash
#!/bin/bash
# benchmark.sh
PROVIDERS=("test-glm" "test-deepseek" "test-minimax")
PROMPT="$1"

for p in "${PROVIDERS[@]}"; do
  echo "=== $p ==="
  time "claude-$p" -p "$PROMPT" 2>&1 | tee "/tmp/bench-${p}.txt"
  echo ""
done
```

Run it:

```bash
chmod +x benchmark.sh
./benchmark.sh "find unused exports in src/"
```

Compare the output files in `/tmp/bench-*.txt`.

## Next steps

- [Cut your bill with provider routing](/guides/cost-optimization/)
- [Get a second opinion from a different model](/guides/switch-providers/)
