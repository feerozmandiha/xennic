'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Edit3, Lightbulb, Save, X, Layers } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { manageKnowledgeApi, Example } from '@/features/knowledge/lib/manage-api';
import { useToast } from '@/stores/toast.store';

export function ExamplesManagerModern({ articleId }: { articleId: string }) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Example | null>(null);
  const [titleFa, setTitleFa] = useState('');
  const [difficulty, setDifficulty] = useState('basic');
  const [calcType, setCalcType] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['knowledge', articleId, 'examples'],
    queryFn: () => manageKnowledgeApi.listExamples(articleId).then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      manageKnowledgeApi.createExample(articleId, {
        titleFa,
        difficulty,
        calculatorType: calcType || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge', articleId, 'examples'] });
      toast.success('مثال اضافه شد');
      setTitleFa('');
      setShowForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: () => {
      if (!editing) throw new Error('no editing');
      return manageKnowledgeApi.updateExample(articleId, editing.id, {
        titleFa,
        difficulty,
        calculatorType: calcType || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge', articleId, 'examples'] });
      toast.success('به‌روزرسانی شد');
      setEditing(null);
      setShowForm(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => manageKnowledgeApi.deleteExample(articleId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge', articleId, 'examples'] });
      toast.success('حذف شد');
    },
  });

  const examples = data ?? [];

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-sm flex items-center gap-2">
          <Lightbulb className="h-4 w-4" /> مثال‌های محاسباتی
          <Badge variant="secondary" className="text-[10px]">
            {examples.length}
          </Badge>
        </CardTitle>
        <Button size="sm" variant="outline" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4" /> افزودن
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {showForm && (
          <div className="rounded-xl border bg-muted/20 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium">{editing ? 'ویرایش مثال' : 'مثال جدید'}</p>
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
              value={titleFa}
              onChange={(e) => setTitleFa(e.target.value)}
              placeholder="عنوان مثال فارسی"
            />
            <div className="grid grid-cols-2 gap-2">
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="h-9 rounded-xl border bg-background px-3 text-sm"
              >
                <option value="basic">ساده</option>
                <option value="intermediate">متوسط</option>
                <option value="advanced">پیشرفته</option>
              </select>
              <Input
                value={calcType}
                onChange={(e) => setCalcType(e.target.value)}
                placeholder="نوع محاسبه"
              />
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => (editing ? updateMutation.mutate() : createMutation.mutate())}
                disabled={!titleFa.trim()}
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
        ) : examples.length === 0 ? (
          <div className="text-center py-6">
            <Layers className="h-8 w-8 mx-auto text-muted-foreground opacity-20 mb-2" />
            <p className="text-xs text-muted-foreground">هنوز مثالی ثبت نشده</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {examples.map((ex) => (
              <div key={ex.id} className="rounded-xl border p-3 group hover:border-primary/30">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">{ex.title_fa}</p>
                    <div className="flex gap-1 mt-1">
                      <Badge variant="secondary" className="text-[10px]">
                        {ex.difficulty}
                      </Badge>
                      {ex.calculator_type && (
                        <Badge variant="outline" className="text-[10px] font-mono">
                          {ex.calculator_type}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => {
                        setEditing(ex);
                        setTitleFa(ex.title_fa);
                        setDifficulty(ex.difficulty);
                        setCalcType(ex.calculator_type ?? '');
                        setShowForm(true);
                      }}
                      className="w-7 h-7 rounded-lg border bg-card hover:bg-secondary flex items-center justify-center"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('حذف؟')) deleteMutation.mutate(ex.id);
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
