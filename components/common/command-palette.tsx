"use client"

import * as React from "react"
import { SearchIcon } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"

import { navItems } from "@/lib/nav"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  const tag = target.tagName
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT"
}

export function CommandPalette() {
  const router = useRouter()
  const pathname = usePathname()

  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [activeIndex, setActiveIndex] = React.useState(0)
  const inputRef = React.useRef<HTMLInputElement | null>(null)

  const items = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return navItems
    return navItems.filter((item) => {
      return item.title.toLowerCase().includes(q) || item.href.toLowerCase().includes(q)
    })
  }, [query])

  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (open) return

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setOpen(true)
        return
      }

      if (e.key === "/" && !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
        if (isEditableTarget(e.target)) return
        e.preventDefault()
        setOpen(true)
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [open])

  React.useEffect(() => {
    if (!open) return
    setQuery("")
    setActiveIndex(0)

    const t = window.setTimeout(() => {
      inputRef.current?.focus()
    }, 0)

    return () => {
      window.clearTimeout(t)
    }
  }, [open])

  React.useEffect(() => {
    setActiveIndex(0)
  }, [query])

  function navigate(href: string) {
    setOpen(false)
    router.push(href)
  }

  function onInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, Math.max(0, items.length - 1)))
      return
    }

    if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
      return
    }

    if (e.key === "Enter") {
      e.preventDefault()
      const item = items[activeIndex]
      if (item) navigate(item.href)
    }
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-2"
        aria-label="快速跳转"
      >
        <SearchIcon />
        <span className="hidden sm:inline">快速跳转</span>
        <span className="hidden md:inline text-muted-foreground">/</span>
        <kbd className="hidden md:inline rounded-md border bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
          Ctrl K
        </kbd>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 sm:max-w-xl" showCloseButton>
          <div className="border-b p-4">
            <DialogTitle className="sr-only">快速跳转</DialogTitle>
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onInputKeyDown}
              placeholder="输入页面名称或路径，例如：学生 / /students"
            />
          </div>

          <ScrollArea className="max-h-[60vh]">
            <div className="p-2">
              <div
                role="listbox"
                aria-label="搜索结果"
                className="space-y-1"
              >
                {items.length === 0 ? (
                  <div className="px-3 py-10 text-center text-sm text-muted-foreground">无匹配结果</div>
                ) : (
                  items.map((item, idx) => {
                    const Icon = item.icon
                    const active = idx === activeIndex
                    const current = pathname === "/" ? item.href === "/" : pathname.startsWith(item.href)

                    return (
                      <button
                        key={item.href}
                        type="button"
                        role="option"
                        aria-selected={active}
                        className={cn(
                          "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm",
                          active ? "bg-accent" : "hover:bg-accent/60"
                        )}
                        onMouseEnter={() => setActiveIndex(idx)}
                        onClick={() => navigate(item.href)}
                      >
                        <Icon className="size-4" />
                        <div className="flex-1">
                          <div className={cn("font-medium", current ? "text-primary" : undefined)}>
                            {item.title}
                          </div>
                          <div className="text-xs text-muted-foreground">{item.href}</div>
                        </div>
                      </button>
                    )
                  })
                )}
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  )
}
