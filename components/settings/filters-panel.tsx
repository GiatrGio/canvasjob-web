"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Lightbulb, Plus, Star, Trash2, X } from "lucide-react";
import { api } from "@/lib/api/client";
import { ApiError } from "@/lib/api/core";
import {
  FILTER_TEXT_MAX,
  MAX_FILTERS_PER_PROFILE,
  MAX_PROFILES_PER_USER,
  PROFILE_NAME_MAX,
  STARTER_PROFILE_NAME,
  type FilterKind,
  type FilterOut,
  type FilterProfileOut,
  type FilterProfileWithFilters,
} from "@/lib/types";
import { NewFilterDraft } from "@/components/settings/new-filter-draft";

// ---------------------------------------------------------------------------
// Sortable wrapper — exposes drag listeners so the row can attach them to a
// dedicated handle instead of the whole row (preserves clicks on inputs).
// ---------------------------------------------------------------------------

function SortableRow({
  id,
  children,
}: {
  id: string;
  children: (handleProps: {
    attributes: ReturnType<typeof useSortable>["attributes"];
    listeners: ReturnType<typeof useSortable>["listeners"];
  }) => React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      {children({ attributes, listeners })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Profiles editor (two-pane container)
// ---------------------------------------------------------------------------

// Mutators apply server responses to local state instead of refetching the
// whole list — keeps the UI mounted across CRUD actions, no flash of the
// "Loading…" placeholder. `refresh` is still used for the initial load and
// as a safety net if a mutation puts state in an unknown shape.
interface Mutators {
  addProfile: (p: FilterProfileOut) => void;
  updateProfile: (p: FilterProfileOut) => void;
  deleteProfile: (id: string) => void;
  activateProfile: (id: string) => void;
  addFilter: (profileId: string, f: FilterOut) => void;
  updateFilter: (f: FilterOut) => void;
  deleteFilter: (profileId: string, filterId: string) => void;
  reorderFilters: (profileId: string, ordered: FilterOut[]) => void;
}

export function FiltersPanel() {
  const [profiles, setProfiles] = useState<FilterProfileWithFilters[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const list = await api.profiles.list();
      list.sort((a, b) => a.position - b.position);
      setProfiles(list);
      setSelectedId((prev) => {
        if (prev && list.some((p) => p.id === prev)) return prev;
        return list.find((p) => p.is_active)?.id ?? list[0]?.id ?? null;
      });
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const mutators = useMemo<Mutators>(
    () => ({
      addProfile: (p) => setProfiles((prev) => [...prev, { ...p, filters: [] }]),
      updateProfile: (p) =>
        setProfiles((prev) => prev.map((x) => (x.id === p.id ? { ...x, ...p } : x))),
      deleteProfile: (id) => {
        setProfiles((prev) => prev.filter((p) => p.id !== id));
        setSelectedId((prevSel) => {
          if (prevSel !== id) return prevSel;
          const remaining = profiles.filter((p) => p.id !== id);
          return remaining.find((p) => p.is_active)?.id ?? remaining[0]?.id ?? null;
        });
      },
      activateProfile: (id) =>
        setProfiles((prev) => prev.map((p) => ({ ...p, is_active: p.id === id }))),
      addFilter: (profileId, f) =>
        setProfiles((prev) =>
          prev.map((p) => (p.id === profileId ? { ...p, filters: [...p.filters, f] } : p)),
        ),
      updateFilter: (f) =>
        setProfiles((prev) =>
          prev.map((p) =>
            p.id === f.profile_id
              ? { ...p, filters: p.filters.map((x) => (x.id === f.id ? f : x)) }
              : p,
          ),
        ),
      deleteFilter: (profileId, filterId) =>
        setProfiles((prev) =>
          prev.map((p) =>
            p.id === profileId
              ? { ...p, filters: p.filters.filter((f) => f.id !== filterId) }
              : p,
          ),
        ),
      reorderFilters: (profileId, ordered) =>
        setProfiles((prev) =>
          prev.map((p) =>
            p.id === profileId
              ? { ...p, filters: ordered.map((f, i) => ({ ...f, position: i })) }
              : p,
          ),
        ),
    }),
    [profiles],
  );

  const selected = useMemo(
    () => profiles.find((p) => p.id === selectedId) ?? null,
    [profiles, selectedId],
  );

  async function handleProfileDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = profiles.findIndex((p) => p.id === active.id);
    const newIndex = profiles.findIndex((p) => p.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const reordered = arrayMove(profiles, oldIndex, newIndex);
    setProfiles(reordered);
    try {
      await api.profiles.reorder({ ids: reordered.map((p) => p.id) });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : String(err));
      await refresh();
    }
  }

  if (loading) {
    return <div className="py-12 text-sm text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-[16rem_1fr]">
      {/* Left pane — profiles */}
      <aside className="flex flex-col">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">
            Job Profiles{" "}
            <span className="font-normal text-muted-foreground">
              ({profiles.length}/{MAX_PROFILES_PER_USER})
            </span>
          </h2>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleProfileDragEnd}
        >
          <SortableContext
            items={profiles.map((p) => p.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {profiles.map((p) => (
                <SortableRow key={p.id} id={p.id}>
                  {({ attributes, listeners }) => (
                    <ProfileCard
                      profile={p}
                      isSelected={p.id === selectedId}
                      canDelete={profiles.length > 1}
                      onSelect={() => setSelectedId(p.id)}
                      mutators={mutators}
                      onError={setError}
                      dragAttributes={attributes}
                      dragListeners={listeners}
                    />
                  )}
                </SortableRow>
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <div className="mt-4">
          <NewProfileButton
            disabled={profiles.length >= MAX_PROFILES_PER_USER}
            mutators={mutators}
            onError={setError}
          />
        </div>

        {error && (
          <p className="mt-4 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}
      </aside>

      {/* Right pane — filters */}
      <section className="min-w-0 md:border-l md:pl-6">
        {selected ? (
          <FilterEditor profile={selected} mutators={mutators} onError={setError} />
        ) : (
          <p className="text-sm text-muted-foreground">No profile selected.</p>
        )}
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Profile card (left pane)
// ---------------------------------------------------------------------------

function ProfileCard({
  profile,
  isSelected,
  canDelete,
  onSelect,
  mutators,
  onError,
  dragAttributes,
  dragListeners,
}: {
  profile: FilterProfileWithFilters;
  isSelected: boolean;
  canDelete: boolean;
  onSelect: () => void;
  mutators: Mutators;
  onError: (msg: string) => void;
  dragAttributes: ReturnType<typeof useSortable>["attributes"];
  dragListeners: ReturnType<typeof useSortable>["listeners"];
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(profile.name);

  useEffect(() => setDraft(profile.name), [profile.name]);

  async function rename() {
    const t = draft.trim();
    setEditing(false);
    if (!t || t === profile.name) {
      setDraft(profile.name);
      return;
    }
    try {
      const updated = await api.profiles.update(profile.id, { name: t });
      mutators.updateProfile(updated);
    } catch (err) {
      onError(err instanceof ApiError ? err.message : String(err));
      setDraft(profile.name);
    }
  }

  async function activate(e: React.MouseEvent) {
    e.stopPropagation();
    if (profile.is_active) return;
    try {
      await api.profiles.activate(profile.id);
      mutators.activateProfile(profile.id);
    } catch (err) {
      onError(err instanceof ApiError ? err.message : String(err));
    }
  }

  async function remove(e: React.MouseEvent) {
    e.stopPropagation();
    if (!canDelete) return;
    if (!confirm(`Delete profile "${profile.name}" and all its filters?`)) return;
    try {
      await api.profiles.delete(profile.id);
      mutators.deleteProfile(profile.id);
    } catch (err) {
      onError(err instanceof ApiError ? err.message : String(err));
    }
  }

  const baseClasses =
    "group relative flex cursor-pointer items-center gap-2 rounded-lg bg-card px-3 py-2.5 text-card-foreground transition-colors";
  const stateClasses = isSelected
    ? "border border-primary shadow-sm"
    : "border hover:bg-accent hover:text-accent-foreground";

  return (
    <div className={`${baseClasses} ${stateClasses}`} onClick={onSelect}>
      {/* Drag handle — visible on hover */}
      <button
        {...dragAttributes}
        {...dragListeners}
        onClick={(e) => e.stopPropagation()}
        className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 cursor-grab p-1 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
        title="Drag to reorder"
        aria-label="Drag to reorder"
      >
        <GripVertical size={14} />
      </button>

      <button
        onClick={activate}
        disabled={profile.is_active}
        className="-m-0.5 shrink-0 rounded p-0.5 transition-colors disabled:cursor-default"
        title={profile.is_active ? "Active profile" : "Click to activate"}
        aria-label={profile.is_active ? "Active profile" : "Activate this profile"}
        aria-pressed={profile.is_active}
      >
        <Star
          size={18}
          className={
            profile.is_active
              ? "fill-primary text-primary"
              : "text-muted-foreground hover:text-primary"
          }
        />
      </button>

      {editing ? (
        <input
          autoFocus
          value={draft}
          maxLength={PROFILE_NAME_MAX}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={rename}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            if (e.key === "Enter") rename();
            if (e.key === "Escape") {
              setDraft(profile.name);
              setEditing(false);
            }
          }}
          className="min-w-0 flex-1 rounded-md border border-input bg-background px-1 py-0.5 text-sm outline-none focus:ring-2 focus:ring-ring/20"
        />
      ) : (
        <span
          onDoubleClick={(e) => {
            e.stopPropagation();
            setEditing(true);
          }}
          className={`min-w-0 flex-1 truncate text-sm ${
            isSelected ? "font-medium text-foreground" : "text-muted-foreground"
          }`}
          title="Double-click to rename"
        >
          {profile.name}
        </span>
      )}

      {canDelete && (
        <button
          onClick={remove}
          className="-m-1 shrink-0 p-1 text-muted-foreground hover:text-destructive"
          title="Delete profile"
          aria-label="Delete profile"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}

function NewProfileButton({
  disabled,
  mutators,
  onError,
}: {
  disabled: boolean;
  mutators: Mutators;
  onError: (msg: string) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const t = name.trim();
    if (!t || disabled) return;
    try {
      const created = await api.profiles.create({ name: t });
      setName("");
      setShowForm(false);
      mutators.addProfile(created);
    } catch (err) {
      onError(err instanceof ApiError ? err.message : String(err));
    }
  }

  if (disabled) {
    return (
      <p className="text-center text-xs text-muted-foreground">
        Profile limit reached ({MAX_PROFILES_PER_USER})
      </p>
    );
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="flex w-full items-center justify-center gap-1.5 rounded-md py-2 text-sm font-medium text-primary transition-colors hover:bg-accent"
      >
        <Plus size={16} /> Add New Profile
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="flex gap-2">
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={PROFILE_NAME_MAX}
        placeholder="Profile name"
        onBlur={() => {
          if (!name.trim()) setShowForm(false);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setName("");
            setShowForm(false);
          }
        }}
        className="min-w-0 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/20"
      />
      <button
        type="submit"
        disabled={!name.trim()}
        className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        Add
      </button>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Filter editor (right pane)
// ---------------------------------------------------------------------------

// Dismissal is per-browser, like the rest of this one-off nudge — there's no
// server-side flag for it. (In the extension this lived in chrome.storage.)
const STARTER_BANNER_KEY = "canvasjob:starter-banner-dismissed";

function StarterBanner() {
  // Hidden until we've confirmed the flag is unset, to avoid a flash on
  // instances where it was already dismissed.
  const [show, setShow] = useState(false);
  useEffect(() => {
    setShow(window.localStorage.getItem(STARTER_BANNER_KEY) !== "true");
  }, []);

  if (!show) return null;
  return (
    <div className="mb-4 flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
      <Lightbulb size={16} className="mt-0.5 shrink-0 text-primary" />
      <div className="flex-1 text-foreground">
        <span className="font-medium">These are starter examples.</span>{" "}
        <span className="text-muted-foreground">
          Edit, reorder, or delete them — then add your own to make this profile yours.
        </span>
      </div>
      <button
        onClick={() => {
          setShow(false);
          window.localStorage.setItem(STARTER_BANNER_KEY, "true");
        }}
        className="-m-1 shrink-0 rounded p-1 text-muted-foreground hover:text-foreground"
        title="Dismiss"
        aria-label="Dismiss starter banner"
      >
        <X size={14} />
      </button>
    </div>
  );
}

function FilterEditor({
  profile,
  mutators,
  onError,
}: {
  profile: FilterProfileWithFilters;
  mutators: Mutators;
  onError: (msg: string) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const filters = useMemo(
    () => [...profile.filters].sort((a, b) => a.position - b.position),
    [profile.filters],
  );

  const [localOrder, setLocalOrder] = useState<FilterOut[] | null>(null);
  const [addingFilter, setAddingFilter] = useState(false);
  const display = localOrder ?? filters;
  const isStarter = profile.name === STARTER_PROFILE_NAME;

  useEffect(() => setLocalOrder(null), [profile.filters]);
  useEffect(() => setAddingFilter(false), [profile.id]);

  async function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = display.findIndex((f) => f.id === active.id);
    const newIndex = display.findIndex((f) => f.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const reordered = arrayMove(display, oldIndex, newIndex);
    setLocalOrder(reordered);
    try {
      await api.filters.reorder(profile.id, { ids: reordered.map((f) => f.id) });
      mutators.reorderFilters(profile.id, reordered);
    } catch (err) {
      onError(err instanceof ApiError ? err.message : String(err));
      setLocalOrder(null);
    }
  }

  function add() {
    if (display.length >= MAX_FILTERS_PER_PROFILE || addingFilter) return;
    setAddingFilter(true);
  }

  async function createDraftFilter(text: string, kind: FilterKind | undefined) {
    try {
      const created = await api.filters.create(profile.id, {
        text,
        // Omit when undefined so the backend uses its own default (criterion).
        ...(kind ? { kind } : {}),
      });
      setAddingFilter(false);
      mutators.addFilter(profile.id, created);
    } catch (err) {
      onError(err instanceof ApiError ? err.message : String(err));
    }
  }

  const visibleCount = display.length + (addingFilter ? 1 : 0);
  const atLimit = display.length >= MAX_FILTERS_PER_PROFILE;

  return (
    <div>
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-base font-semibold text-foreground">
          {profile.name} Profile Filters
        </h2>
        <span className="text-sm text-muted-foreground">
          {visibleCount} / {MAX_FILTERS_PER_PROFILE} filters
        </span>
      </div>

      {isStarter && <StarterBanner />}

      {display.length === 0 && (
        <div className="mb-4 rounded-lg border border-dashed px-6 py-10 text-center text-sm text-muted-foreground">
          No filters yet. Add one below — for example, <em>Must be fully remote</em>.
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={display.map((f) => f.id)} strategy={verticalListSortingStrategy}>
          <div className="mb-4 space-y-3">
            {display.map((f) => (
              <SortableRow key={f.id} id={f.id}>
                {({ attributes, listeners }) => (
                  <FilterCard
                    filter={f}
                    mutators={mutators}
                    onError={onError}
                    dragAttributes={attributes}
                    dragListeners={listeners}
                  />
                )}
              </SortableRow>
            ))}
            {addingFilter && (
              <NewFilterDraft
                onConfirm={createDraftFilter}
                onCancel={() => setAddingFilter(false)}
              />
            )}
          </div>
        </SortableContext>
      </DndContext>

      <button
        onClick={add}
        disabled={atLimit || addingFilter}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-primary py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Plus size={18} />
        {addingFilter
          ? "Confirm the new filter"
          : atLimit
            ? "Filter limit reached"
            : "Add New Filter"}
      </button>
    </div>
  );
}

function FilterCard({
  filter,
  mutators,
  onError,
  dragAttributes,
  dragListeners,
}: {
  filter: FilterOut;
  mutators: Mutators;
  onError: (msg: string) => void;
  dragAttributes: ReturnType<typeof useSortable>["attributes"];
  dragListeners: ReturnType<typeof useSortable>["listeners"];
}) {
  const [text, setText] = useState(filter.text);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => setText(filter.text), [filter.text]);

  // Auto-grow textarea to fit its content.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [text]);

  async function commitText() {
    const t = text.trim();
    if (!t) {
      setText(filter.text);
      return;
    }
    if (t === filter.text) return;
    try {
      const updated = await api.filters.update(filter.id, { text: t });
      mutators.updateFilter(updated);
    } catch (err) {
      onError(err instanceof ApiError ? err.message : String(err));
      setText(filter.text);
    }
  }

  async function toggle(enabled: boolean) {
    try {
      const updated = await api.filters.update(filter.id, { enabled });
      mutators.updateFilter(updated);
    } catch (err) {
      onError(err instanceof ApiError ? err.message : String(err));
    }
  }

  async function remove() {
    if (!confirm("Delete this filter?")) return;
    try {
      await api.filters.delete(filter.id);
      mutators.deleteFilter(filter.profile_id, filter.id);
    } catch (err) {
      onError(err instanceof ApiError ? err.message : String(err));
    }
  }

  return (
    <div className="group relative flex items-start gap-3 rounded-lg border bg-card p-3 text-card-foreground transition-colors hover:bg-accent/40">
      {/* Drag handle — appears on hover */}
      <button
        {...dragAttributes}
        {...dragListeners}
        className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 cursor-grab p-1 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
        title="Drag to reorder"
        aria-label="Drag to reorder"
      >
        <GripVertical size={14} />
      </button>

      {/* Custom-styled checkbox */}
      <label className="mt-1.5 inline-flex shrink-0 cursor-pointer">
        <input
          type="checkbox"
          checked={filter.enabled}
          onChange={(e) => toggle(e.target.checked)}
          className="peer sr-only"
        />
        <span className="flex h-5 w-5 items-center justify-center rounded border border-input bg-background transition-colors peer-checked:border-primary peer-checked:bg-primary">
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-3.5 w-3.5 text-primary-foreground opacity-0 peer-checked:opacity-100"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </label>

      {/* Multi-line text input */}
      <div className="min-w-0 flex-1">
        <textarea
          ref={textareaRef}
          value={text}
          maxLength={FILTER_TEXT_MAX}
          rows={1}
          onChange={(e) => setText(e.target.value)}
          onBlur={commitText}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              (e.target as HTMLTextAreaElement).blur();
            }
          }}
          className="w-full resize-none overflow-hidden rounded-md border border-input bg-background px-3 py-2 text-sm leading-relaxed outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20"
        />
        <div className="mt-1 text-right text-xs text-muted-foreground">
          {text.length} / {FILTER_TEXT_MAX}
        </div>
      </div>

      {/* Delete with icon + label */}
      <button
        onClick={remove}
        className="flex shrink-0 flex-col items-center gap-0.5 px-2 py-1 text-muted-foreground hover:text-destructive"
        title="Delete filter"
        aria-label="Delete filter"
      >
        <Trash2 size={18} />
        <span className="text-xs">Delete</span>
      </button>
    </div>
  );
}
