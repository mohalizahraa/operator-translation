# Windows GPU scheduling — canonical translation runner policy

Applies to the **two Windows self-hosted runners** on Mohammed's **single** RTX 4070 PC. This is a local execution rule for the translation/Workbench repo, not a general Operator change.

## Non-negotiable invariant

At most **one GPU-heavy translation/OCR/model process group** may run on this Windows host at any instant, regardless of which runner starts it. Both runner processes share the same physical RTX 4070. Do **not** assume two GitHub runners imply two GPUs, and do **not** rely on human reminders.

Any Windows job, Codex command or local script that uses CUDA, PaddleOCR GPU, Surya GPU, Ollama GPU, or another GPU-intensive translation workload **must invoke the executable through** `workbench/scripts/with-exclusive-gpu.ps1` **for the entire GPU-intensive stage**. It uses the fixed machine-wide mutex `Global\OperatorTranslationGpuHeavy` and fails closed if the lock cannot be acquired. It releases the lock on normal completion, failure, or process exit. The other runner may do CPU-only work while the GPU is occupied.

Example from the repo root, in a **Windows PowerShell** session:

```powershell
pwsh -NoProfile -File workbench/scripts/with-exclusive-gpu.ps1 -Executable python -CommandArguments @('-m', 'your_ocr_module')
```

In a GitHub Actions `shell: pwsh` step, prefer PowerShell array binding:

```powershell
& ./workbench/scripts/with-exclusive-gpu.ps1 -Executable 'python' -CommandArguments @('-m','your_ocr_module')
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
```

Never put GPU-heavy commands before or after the lock wrapper within the same GPU stage. Do not replace the fixed mutex name with a task-specific name. Do not swallow lock errors, bypass it for benchmarks, or mark lock failure as successful work. Guard the complete process tree (OCR workers/child processes must exit before the wrapper returns).

## Enforcement

- `workbench/AGENTS.md` routes Codex to this rule for translation work.
- `workbench/scripts/check-gpu-concurrency.mjs` scans the repository's Windows GitHub workflow definitions for GPU commands and rejects any workflow that fails to call the wrapper. It also requires the shared policy to remain reachable.
- `workbench/scripts/gpu-lock-smoke.mjs` starts two separate Windows processes and proves their protected tasks cannot overlap (run in Windows CI).
- A Windows manual smoke workflow exercises the host lock and, separately, tests whether `nvidia-smi` runs through it.
- Leave existing Mac-only Apple Vision/PDFKit jobs on macOS; never automatically reroute them to Windows.
- No paid GitHub-hosted runners or paid APIs. Prefer local tools; confirm license and benchmark quality before adopting GPU OCR as the production source.

## Scope and limitations

This guarantees exclusivity only among workloads that use this exact lock **on the same Windows PC**. It cannot stop unrelated games or applications, jobs on other devices, or manual GPU commands that bypass this rule. Do not falsely claim a machine-level GPU quota. If a new workflow runs a GPU workload indirectly, mark it `# GPU_HEAVY` and wrap its command so the workflow guard catches it. Do not use GitHub Actions concurrency groups as the sole guard: a newer pending job may replace a previously pending job, losing queued work.
