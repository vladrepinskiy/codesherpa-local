import { useState, useEffect } from "react";
import { ImportForm } from "./ImportForm";
import { ImportProgress } from "./ImportProgress";
import { ImportStats } from "./ImportStats";
import { ImportErrorDisplay } from "./ImportErrorDisplay";
import { RepositoryImporter as ImporterService } from "../../services/importer";
import type { ImportState } from "../../types/import.types";

export const RepositoryImporter = () => {
  const [state, setState] = useState<ImportState>({ status: "idle" });

  // Warn user if they try to leave during import
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (state.status === "importing") {
        e.preventDefault();
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [state.status]);

  const handleImport = async (repoUrl: string, token?: string) => {
    setState({ status: "idle" });

    const importer = new ImporterService(token, (progress) => {
      setState({ status: "importing", progress });
    });

    const result = await importer.importRepository(repoUrl);

    if (result.success) {
      setState({ status: "success", result });
    } else {
      setState({
        status: "error",
        error: result.error || "Unknown error occurred",
      });
    }
  };

  const handleReset = () => {
    setState({ status: "idle" });
  };

  return (
    <>
      {state.status === "idle" && (
        <ImportForm onImport={handleImport} isImporting={false} />
      )}

      {state.status === "importing" && (
        <>
          <ImportForm onImport={handleImport} isImporting={true} />
          <ImportProgress progress={state.progress} />
        </>
      )}

      {state.status === "success" && (
        <ImportStats stats={state.result.stats} onReset={handleReset} />
      )}

      {state.status === "error" && (
        <ImportErrorDisplay error={state.error} onReset={handleReset} />
      )}
    </>
  );
};
