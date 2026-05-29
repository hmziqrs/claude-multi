import { useState, useEffect, useCallback } from "react";
import type { Instance } from "@/config";
import type { MigrationMeta } from "@/config";
import {
  runHealthChecks,
  loadHealthStatus,
  saveHealthStatus,
  dismissIssue as dismissIssueAction,
  dismissAllIssues as dismissAllIssuesAction,
  type HealthIssue,
} from "@/health";

export function useHealthCheck(
  instances: Instance[],
  migrationStatus: MigrationMeta | null,
  instanceMigrationVersion?: string,
) {
  const [issues, setIssues] = useState<HealthIssue[]>([]);
  const [checking, setChecking] = useState(false);

  const runChecks = useCallback(() => {
    setChecking(true);
    try {
      const found = runHealthChecks(instances, migrationStatus, instanceMigrationVersion);
      const previous = loadHealthStatus();

      // Merge: carry forward dismissed state
      const dismissedMap = new Map(
        previous.issues.filter(i => i.dismissed).map(i => [i.id, true]),
      );
      const merged = found.map(issue => ({
        ...issue,
        dismissed: dismissedMap.has(issue.id) ? true : issue.dismissed,
      }));

      saveHealthStatus({
        lastChecked: new Date().toISOString(),
        issues: merged,
      });

      setIssues(merged.filter(i => !i.resolved && !i.dismissed));
    } catch {
      // Health check failure is non-fatal
    } finally {
      setChecking(false);
    }
  }, [instances, migrationStatus, instanceMigrationVersion]);

  useEffect(() => {
    runChecks();
  }, [runChecks]);

  const dismiss = useCallback((id: string) => {
    dismissIssueAction(id);
    setIssues(prev => prev.filter(i => i.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    dismissAllIssuesAction();
    setIssues([]);
  }, []);

  const retry = useCallback(() => {
    runChecks();
  }, [runChecks]);

  return { issues, checking, runChecks, dismiss, dismissAll, retry };
}
