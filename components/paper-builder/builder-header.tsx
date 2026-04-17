import * as React from "react"

import { PaperDocument, normalizeDocument } from "@/lib/paper-builder";
import {
  RiCheckboxCircleLine,
  RiCodeSSlashLine,
  RiFileUploadLine,
  RiSparkling2Line
} from "@remixicon/react";

import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";


export function BuilderHeader({
  document,
  setDocument,
  showHeaderActions,
  importJson,
  setImportJson,
}: {
  document: PaperDocument,
  setDocument: (document: PaperDocument) => void,
  showHeaderActions: boolean,
  importJson: string,
  setImportJson: (importJson: string) => void,
}) {

  const [isCopied, setIsCopied] = React.useState(false)
  const [isImportOpen, setIsImportOpen] = React.useState(false)


  const copyJson = React.useCallback(() => {
    if (!document) return
    navigator.clipboard.writeText(JSON.stringify(document, null, 2))
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }, [document])

  const handleImport = React.useCallback(() => {
    try {
      const parsed = JSON.parse(importJson)
      setDocument(normalizeDocument(parsed as PaperDocument))
      // setIsImportOpen(false)
      setImportJson("")
    } catch {
      alert("Invalid JSON format. Please check your input.")
    }
  }, [importJson, setDocument])

  return (<div className="rounded-[32px] border border-white/70 bg-white/85 p-6 shadow-[0_25px_80px_rgba(15,23,42,0.08)] backdrop-blur">
    <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold tracking-[0.22em] text-emerald-700 uppercase">
          <RiSparkling2Line className="size-4" />
          Canvas Builder
        </div>
        <textarea
          value={document.title}
          onChange={(event) =>
            setDocument({ ...document, title: event.target.value })
          }
          className="mt-6 min-h-28 w-full rounded-[28px] border border-slate-200 bg-slate-50 px-5 py-4 text-sm leading-7 text-slate-700 transition outline-none focus:border-emerald-500"
          placeholder="Add overall instructions for students"
        />

        <Input
          value={document.subtitle}
          onChange={(event) =>
            setDocument({ ...document, subtitle: event.target.value })
          }
          className="mt-2 h-10 border-0 px-0 text-slate-500 shadow-none focus-visible:ring-0 md:text-lg"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-3 xl:w-[420px]">
        <label className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
          Duration
          <Input
            value={document.duration}
            onChange={(event) =>
              setDocument({ ...document, duration: event.target.value })
            }
            className="mt-2 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
          />
        </label>
        <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
          Sections
          <div className="mt-2 text-2xl font-semibold text-slate-900">
            {
              document.blocks.filter(
                (block) => block.type === "section"
              ).length
            }
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
          Questions
          <div className="mt-2 text-2xl font-semibold text-slate-900">
            {
              document.blocks.filter(
                (block) => block.type !== "section"
              ).length
            }
          </div>
        </div>
      </div>
    </div>

    <textarea
      value={document.instructions}
      onChange={(event) =>
        setDocument({ ...document, instructions: event.target.value })
      }
      className="mt-6 min-h-28 w-full rounded-[28px] border border-slate-200 bg-slate-50 px-5 py-4 text-sm leading-7 text-slate-700 transition outline-none focus:border-emerald-500"
      placeholder="Add overall instructions for students"
    />

    {showHeaderActions ? (
      <div className="mt-6 flex flex-wrap gap-3">
        <Button
          variant="outline"
          onClick={copyJson}
          className="min-w-[124px]"
        >
          {isCopied ? (
            <>
              <RiCheckboxCircleLine className="size-4 text-emerald-500" />
              Copied!
            </>
          ) : (
            <>
              <RiCodeSSlashLine className="size-4" />
              Copy JSON
            </>
          )}
        </Button>

        <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
          <DialogTrigger
            render={
              <Button variant="outline">
                <RiFileUploadLine className="size-4" />
                Import JSON
              </Button>
            }
          />
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Import Paper JSON</DialogTitle>
              <DialogDescription>
                Paste the JSON content of a paper to load it into the
                builder. This will overwrite your current work.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              <textarea
                value={importJson}
                onChange={(e) => setImportJson(e.target.value)}
                placeholder='{ "title": "Paper Title", ... }'
                className="min-h-[300px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-xs text-slate-700 transition outline-none focus:border-emerald-500"
              />
            </div>
            <DialogFooter>
              <Button
                variant="ghost"
                onClick={() => setIsImportOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleImport}
                disabled={!importJson.trim()}
              >
                Load Paper
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    ) : null}
  </div>)
}