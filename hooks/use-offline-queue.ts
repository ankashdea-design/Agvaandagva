"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { bulkApplyToClass, updateAttendance, updateReportField, updateActivity } from "@/app/teacher/actions";

type QueueJob =
  | ({ type: "bulk" } & Parameters<typeof bulkApplyToClass>[0])
  | ({ type: "attendance" } & Parameters<typeof updateAttendance>[0])
  | ({ type: "field" } & Parameters<typeof updateReportField>[0])
  | ({ type: "activity" } & Parameters<typeof updateActivity>[0]);

const STORAGE_KEY = "kindercare_offline_queue_v1";

function loadQueue(): QueueJob[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as QueueJob[]) : [];
  } catch {
    return [];
  }
}

function saveQueue(jobs: QueueJob[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
}

/**
 * Queues edits made while offline (in localStorage, keyed to this device)
 * and flushes them in order the moment the browser regains connectivity.
 * Because every write is an upsert keyed by (child_id, report_date), a
 * later queued write always wins over an earlier one for the same field —
 * last-write-wins conflict resolution.
 */
export function useOfflineQueue() {
  const [pendingCount, setPendingCount] = useState(0);
  const syncing = useRef(false);

  useEffect(() => {
    setPendingCount(loadQueue().length);
  }, []);

  const flush = useCallback(async () => {
    if (syncing.current) return;
    syncing.current = true;
    try {
      let jobs = loadQueue();
      while (jobs.length > 0) {
        const job = jobs[0];
        try {
          if (job.type === "bulk") await bulkApplyToClass(job);
          if (job.type === "attendance") await updateAttendance(job);
          if (job.type === "field") await updateReportField(job);
          if (job.type === "activity") await updateActivity(job);
        } catch {
          // Leave remaining jobs queued and stop; will retry on next online event.
          break;
        }
        jobs = jobs.slice(1);
        saveQueue(jobs);
        setPendingCount(jobs.length);
      }
    } finally {
      syncing.current = false;
    }
  }, []);

  useEffect(() => {
    window.addEventListener("online", flush);
    if (navigator.onLine) flush();
    return () => window.removeEventListener("online", flush);
  }, [flush]);

  const enqueue = useCallback((job: QueueJob) => {
    const jobs = [...loadQueue(), job];
    saveQueue(jobs);
    setPendingCount(jobs.length);
  }, []);

  return { enqueue, pendingCount, flush };
}
