'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Edit3, Calculator, Save, X, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { manageKnowledgeApi, Formula } from '@/features/knowledge/lib/manage-api';
import { useToast } from '@/stores/toast.store';
import katex from 'katex';

const CALCULATOR_OPTIONS = [
  'cable-sizing',
  'cable-voltage-drop',
  'transformer-sizing',
  'motor-current',
  'grounding-earth-resistance',
  'protection-mcb-selection',
  'pq-power-factor-correction',
];

export function FormulasManagerModern({ articleId }: { articleId: string }) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Formula | null>(null);
  const [latex, setLatex] = useState('');
  const [descFa, setDescFa] = useState('');
  const [calcType, setCalcType] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['knowledge', articleId, 'formulas'],
    queryFn: () => manageKnowledgeApi.listFormulas(articleId).then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      manageKnowledgeApi.createFormula(articleId, {
        latex,
        descriptionFa: descFa,
        calculatorType: calcType || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge', articleId, 'formulas'] });
      toast.success('فرمول اضافه شد');
      setLatex('');
      setDescFa('');
      setCalcType('');
      setShowForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: () => {
      if (!editing) throw new Error('no editing');
      return manageKnowledgeApi.updateFormula(articleId, editing.id, {
        latex,
        descriptionFa: descFa,
        calculatorType: calcType || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge', articleId, 'formulas'] });
      toast.success('به‌روزرسانی شد');
      setEditing(null);
      setShowForm(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => manageKnowledgeApi.deleteFormula(articleId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge', articleId, 'formulas'] });
      toast.success('حذف شد');
    },
  });

  const formulas = data ?? [];

  const renderLatex = (tex: string) => {
    try {
      return { __html: katex.renderToString(tex, { throwOnError: false, displayMode: true }) };
    } catch {
      return { __html: `<code>${tex}</code>` };
    }
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-sm flex items-center gap-2">
          <Calculator className="h-4 w-4" /> فرمول‌ها
          <Badge variant="secondary" className="text-[10px]">
            {formulas.length}
          </Badge>
        </CardTitle>
        <Button size="sm" variant="outline" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4" /> افزودن
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {showForm && (
          <div className="rounded-xl border bg-muted/20 p-4 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium">
                {editing ? 'ویرایش فرمول' : 'فرمول جدید (LaTeX)'}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowForm(false);
                  setEditing(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Input
              value={latex}
              onChange={(e) => setLatex(e.target.value)}
              placeholder="مثلا: V = I \times R"
              dir="ltr"
            />
            {latex && (
              <div
                className="rounded-lg border bg-card p-3"
                dangerouslySetInnerHTML={renderLatex(latex)}
              />
            )}
            <Input
              value={descFa}
              onChange={(e) => setDescFa(e.target.value)}
              placeholder="توضیح فارسی فرمول"
            />
            <select
              value={calcType}
              onChange={(e) => setCalcType(e.target.value)}
              className="w-full h-9 rounded-xl border bg-background px-3 text-sm"
            >
              <option value="">بدون اتصال به محاسبه</option>
              {CALCULATOR_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => (editing ? updateMutation.mutate() : createMutation.mutate())}
                disabled={!latex.trim() || createMutation.isPending || updateMutation.isPending}
              >
                <Save className="h-4 w-4" /> ذخیره
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditing(null);
                }}
              >
                لغو
              </Button>
            </div>
          </div>
        )}

        {isLoading ? (
          <p className="text-xs text-muted-foreground">در حال بارگذاری...</p>
        ) : formulas.length === 0 ? (
          <div className="text-center py-6">
            <Calculator className="h-8 w-8 mx-auto text-muted-foreground opacity-20 mb-2" />
            <p className="text-xs text-muted-foreground">
              هنوز فرمولی ثبت نشده — فرمول LaTeX اضافه کنید
            </p>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center justify-center gap-1">
              <Sparkles className="h-3 w-3" /> فرمول‌ها به صورت خودکار با استاندارد نمایش داده
              می‌شوند
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {formulas.map((f) => (
              <div
                key={f.id}
                className="rounded-xl border p-3 group hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div
                      className="bg-card rounded-lg border p-2 mb-2"
                      dangerouslySetInnerHTML={renderLatex(f.latex)}
                    />
                    {f.description_fa && (
                      <p className="text-xs text-muted-foreground">{f.description_fa}</p>
                    )}
                    <div className="flex gap-1 mt-2">
                      {f.calculator_type && (
                        <Badge variant="outline" className="text-[10px] font-mono">
                          {f.calculator_type}
                        </Badge>
                      )}
                      <Badge variant="secondary" className="text-[10px]">
                        #{f.sort_order}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setEditing(f);
                        setLatex(f.latex);
                        setDescFa(f.description_fa ?? '');
                        setCalcType(f.calculator_type ?? '');
                        setShowForm(true);
                      }}
                      className="w-7 h-7 rounded-lg border bg-card hover:bg-secondary flex items-center justify-center"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('حذف شود؟')) deleteMutation.mutate(f.id);
                      }}
                      className="w-7 h-7 rounded-lg border bg-card hover:bg-red-50 text-red-500 flex items-center justify-center"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
