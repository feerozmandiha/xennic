'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import {
  BookKey,
  CheckCircle2,
  ChevronLeft,
  GitBranch,
  FolderTree,
  Network,
  Plus,
  Shapes,
  Tags,
} from 'lucide-react';
import { knowledgeApi } from './knowledge-api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { KnowledgeQueryState, InlineError } from './knowledge-query-state';
import type {
  NodeClassification,
  Ontology,
  OntologyClass,
  TaxonomyGroup,
} from './knowledge-intelligence.types';

export function KnowledgeOntologyWorkspace() {
  const [ontologies, setOntologies] = useState<Ontology[]>([]);
  const [hierarchy, setHierarchy] = useState<TaxonomyGroup[]>([]);
  const [selectedOntology, setSelectedOntology] = useState<Ontology | null>(null);
  const [classes, setClasses] = useState<OntologyClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [classesLoading, setClassesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [registering, setRegistering] = useState(false);
  const [ontologyForm, setOntologyForm] = useState({
    name: '',
    slug: '',
    version: '1.0.0',
    description: '',
  });
  const [nodeId, setNodeId] = useState('');
  const [classUri, setClassUri] = useState('');
  const [classifying, setClassifying] = useState(false);
  const [classification, setClassification] = useState<NodeClassification | null>(null);

  const loadWorkspace = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ontologyData, hierarchyData] = await Promise.all([
        knowledgeApi.get<Ontology[]>('/knowledge-intelligence/ontologies'),
        knowledgeApi.get<TaxonomyGroup[]>('/knowledge-intelligence/taxonomy/hierarchy'),
      ]);
      setOntologies(ontologyData);
      setHierarchy(hierarchyData);
      setSelectedOntology((current) =>
        current
          ? (ontologyData.find((ontology) => ontology.id === current.id) ?? ontologyData[0] ?? null)
          : (ontologyData[0] ?? null),
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : 'دریافت هستی‌شناسی‌ها ناموفق بود.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const loadClasses = useCallback(async (ontologyId: string) => {
    setClassesLoading(true);
    setActionError(null);
    try {
      const data = await knowledgeApi.get<OntologyClass[]>(
        `/knowledge-intelligence/ontologies/${encodeURIComponent(ontologyId)}/classes`,
      );
      setClasses(data);
      setClassUri((current) => current || data[0]?.uri || '');
    } catch (requestError) {
      setActionError(
        requestError instanceof Error ? requestError.message : 'دریافت کلاس‌ها ناموفق بود.',
      );
      setClasses([]);
    } finally {
      setClassesLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadWorkspace();
  }, [loadWorkspace]);

  useEffect(() => {
    if (selectedOntology) void loadClasses(selectedOntology.id);
    else setClasses([]);
  }, [loadClasses, selectedOntology]);

  const handleRegister = async (event: FormEvent) => {
    event.preventDefault();
    const payload = {
      name: ontologyForm.name.trim(),
      slug: ontologyForm.slug.trim(),
      version: ontologyForm.version.trim(),
      description: ontologyForm.description.trim() || undefined,
    };
    if (!payload.name || !payload.slug || !payload.version) {
      setActionError('نام، شناسه کوتاه و نسخه الزامی است.');
      return;
    }
    setRegistering(true);
    setActionError(null);
    try {
      const created = await knowledgeApi.post<Ontology>(
        '/knowledge-intelligence/ontologies',
        payload,
      );
      setOntologyForm({ name: '', slug: '', version: '1.0.0', description: '' });
      await loadWorkspace();
      setSelectedOntology(created);
    } catch (requestError) {
      setActionError(
        requestError instanceof Error ? requestError.message : 'ثبت هستی‌شناسی ناموفق بود.',
      );
    } finally {
      setRegistering(false);
    }
  };

  const handleClassify = async () => {
    if (!nodeId.trim() || !classUri) return;
    setClassifying(true);
    setActionError(null);
    setClassification(null);
    try {
      const result = await knowledgeApi.post<NodeClassification | null>(
        `/knowledge-intelligence/taxonomy/classify/${encodeURIComponent(nodeId.trim())}`,
        { classUri },
      );
      if (!result) {
        setActionError('گره یا کلاس انتخاب‌شده پیدا نشد.');
      } else {
        setClassification(result);
      }
    } catch (requestError) {
      setActionError(
        requestError instanceof Error ? requestError.message : 'طبقه‌بندی گره ناموفق بود.',
      );
    } finally {
      setClassifying(false);
    }
  };

  const selectedHierarchy = useMemo(
    () => hierarchy.find((group) => group.ontology.id === selectedOntology?.id),
    [hierarchy, selectedOntology],
  );

  if (loading && ontologies.length === 0) return <KnowledgeQueryState kind="loading" />;
  if (error && ontologies.length === 0) {
    return (
      <KnowledgeQueryState kind="error" description={error} onRetry={() => void loadWorkspace()} />
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <Summary label="هستی‌شناسی فعال" value={ontologies.length} icon={BookKey} />
        <Summary
          label="کلاس‌های ساختاری"
          value={hierarchy.reduce((sum, group) => sum + group.classes.length, 0)}
          icon={Shapes}
        />
        <Summary
          label="درخت‌های دامنه"
          value={hierarchy.filter((group) => group.classes.length > 0).length}
          icon={FolderTree}
        />
      </div>

      {actionError ? <InlineError message={actionError} /> : null}
      {classification ? (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-3 text-sm text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="size-5 shrink-0" />
          گره با موفقیت در کلاس «{classification.label}» طبقه‌بندی شد.
        </div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(300px,0.65fr)_minmax(0,1.35fr)]">
        <div className="space-y-5">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <BookKey className="size-5 text-violet-600" />
                دفتر هستی‌شناسی‌ها
              </CardTitle>
              <CardDescription>نسخه‌های فعال در فضای کاری</CardDescription>
            </CardHeader>
            <CardContent>
              {ontologies.length === 0 ? (
                <KnowledgeQueryState kind="empty" compact title="هستی‌شناسی فعالی ثبت نشده است" />
              ) : (
                <div className="space-y-2">
                  {ontologies.map((ontology) => (
                    <button
                      key={ontology.id}
                      type="button"
                      onClick={() => setSelectedOntology(ontology)}
                      className={`w-full rounded-xl border p-3 text-start transition hover:border-primary/30 hover:bg-muted/30 ${selectedOntology?.id === ontology.id ? 'border-primary bg-primary/5' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{ontology.name}</p>
                          <p
                            className="mt-1 truncate font-mono text-[11px] text-muted-foreground"
                            dir="ltr"
                          >
                            {ontology.slug}@{ontology.version}
                          </p>
                        </div>
                        <ChevronLeft className="mt-1 size-4 shrink-0 text-muted-foreground" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Plus className="size-5 text-emerald-600" />
                ثبت هستی‌شناسی
              </CardTitle>
              <CardDescription>یک نام و نسخه یکتا برای فضای کاری تعریف کنید.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-3" onSubmit={(event) => void handleRegister(event)}>
                <Field label="نام">
                  <Input
                    value={ontologyForm.name}
                    onChange={(event) =>
                      setOntologyForm((current) => ({ ...current, name: event.target.value }))
                    }
                    placeholder="مدل دامنه برق قدرت"
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="شناسه کوتاه">
                    <Input
                      dir="ltr"
                      value={ontologyForm.slug}
                      onChange={(event) =>
                        setOntologyForm((current) => ({ ...current, slug: event.target.value }))
                      }
                      placeholder="power-domain"
                    />
                  </Field>
                  <Field label="نسخه">
                    <Input
                      dir="ltr"
                      value={ontologyForm.version}
                      onChange={(event) =>
                        setOntologyForm((current) => ({ ...current, version: event.target.value }))
                      }
                      placeholder="1.0.0"
                    />
                  </Field>
                </div>
                <Field label="توضیح (اختیاری)">
                  <textarea
                    value={ontologyForm.description}
                    onChange={(event) =>
                      setOntologyForm((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                    rows={3}
                    className="w-full resize-y rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                    placeholder="دامنه و هدف این مدل مفهومی"
                  />
                </Field>
                <Button type="submit" className="w-full gap-2" disabled={registering}>
                  <Plus className={registering ? 'size-4 animate-pulse' : 'size-4'} />
                  ثبت در دفتر
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-5">
          {!selectedOntology ? (
            <KnowledgeQueryState
              kind="empty"
              icon={GitBranch}
              title="هستی‌شناسی انتخاب نشده است"
              description="یک مدل موجود را انتخاب یا مدل جدیدی ثبت کنید."
            />
          ) : (
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <CardTitle>{selectedOntology.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {selectedOntology.description || 'برای این هستی‌شناسی توضیحی ثبت نشده است.'}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" dir="ltr">
                      v{selectedOntology.version}
                    </Badge>
                    <Badge>فعال</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {classesLoading ? (
                  <KnowledgeQueryState kind="loading" compact />
                ) : classes.length === 0 ? (
                  <KnowledgeQueryState
                    kind="empty"
                    compact
                    title="این هستی‌شناسی کلاسی ندارد"
                    description="API جاری ایجاد کلاس را ارائه نمی‌کند؛ کلاس‌ها باید از فرایند بارگذاری مدل دامنه ایجاد شوند."
                  />
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {classes.map((ontologyClass) => {
                      const parent = classes.find((item) => item.id === ontologyClass.parentId);
                      return (
                        <button
                          key={ontologyClass.id}
                          type="button"
                          onClick={() => setClassUri(ontologyClass.uri)}
                          className={`rounded-xl border p-3 text-start transition hover:border-primary/30 ${classUri === ontologyClass.uri ? 'border-primary bg-primary/5' : ''}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold">
                                {ontologyClass.label}
                              </p>
                              <p
                                className="mt-1 truncate font-mono text-[11px] text-muted-foreground"
                                dir="ltr"
                              >
                                {ontologyClass.uri}
                              </p>
                            </div>
                            {ontologyClass.isAbstract ? (
                              <Badge variant="outline">انتزاعی</Badge>
                            ) : null}
                          </div>
                          {parent ? (
                            <p className="mt-2 text-xs text-muted-foreground">
                              زیرمجموعه: {parent.label}
                            </p>
                          ) : (
                            <p className="mt-2 text-xs text-muted-foreground">کلاس ریشه</p>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Tags className="size-5 text-blue-600" />
                طبقه‌بندی گره گراف
              </CardTitle>
              <CardDescription>
                یک گره را به کلاس مدل مفهومی منتخب متصل کنید؛ انتخاب کلاس از فهرست بالا هم ممکن است.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Field label="شناسه گره">
                <Input
                  dir="ltr"
                  value={nodeId}
                  onChange={(event) => setNodeId(event.target.value)}
                  placeholder="graph node UUID"
                  className="font-mono text-xs"
                />
              </Field>
              <Field label="کلاس هستی‌شناسی">
                <select
                  value={classUri}
                  onChange={(event) => setClassUri(event.target.value)}
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">یک کلاس انتخاب کنید</option>
                  {classes.map((ontologyClass) => (
                    <option key={ontologyClass.id} value={ontologyClass.uri}>
                      {ontologyClass.label} — {ontologyClass.uri}
                    </option>
                  ))}
                </select>
              </Field>
              <Button
                onClick={() => void handleClassify()}
                disabled={!nodeId.trim() || !classUri || classifying}
                className="w-full gap-2"
              >
                <Network className={classifying ? 'size-4 animate-pulse' : 'size-4'} />
                ثبت طبقه‌بندی
              </Button>
            </CardContent>
          </Card>

          {selectedHierarchy && selectedHierarchy.classes.length > 0 ? (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <FolderTree className="size-5 text-amber-600" />
                  نمای سلسله‌مراتبی دامنه
                </CardTitle>
                <CardDescription>ریشه‌ها و شمار زیرکلاس‌های مستقیم</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {selectedHierarchy.classes
                  .filter((ontologyClass) => !ontologyClass.parentId)
                  .map((root) => (
                    <div
                      key={root.id}
                      className="flex items-center justify-between gap-3 rounded-xl border p-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{root.label}</p>
                        <p
                          className="mt-1 truncate font-mono text-[11px] text-muted-foreground"
                          dir="ltr"
                        >
                          {root.uri}
                        </p>
                      </div>
                      <Badge variant="secondary">
                        {selectedHierarchy.classes
                          .filter((item) => item.parentId === root.id)
                          .length.toLocaleString('fa-IR')}{' '}
                        زیرکلاس
                      </Badge>
                    </div>
                  ))}
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Summary({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof BookKey;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <span className="grid size-10 place-items-center rounded-xl bg-violet-500/10 text-violet-700 dark:text-violet-300">
          <Icon className="size-5" />
        </span>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="mt-1 text-xl font-black">{value.toLocaleString('fa-IR')}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
