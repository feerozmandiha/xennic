'use client';

import { useState } from 'react';
import { Upload, FileText, Loader2, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api/client';
import { useToast } from '@/stores/toast.store';

export function KnowledgeImportPanel({ onImported }: { onImported?: (id: string) => void }) {
  const toast = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setResult(null);
    try {
      const form = new FormData();
      form.append('file', file);
      // Try knowledge-factory upload
      const res = await apiClient.post<{ success: boolean; data: { id: string; status: string } }>(
        '/knowledge-factory/documents/upload',
        form,
      );
      setResult(res.data);
      toast.success('سند آپلود شد و در صف پردازش قرار گرفت');
      if (onImported && res.data?.id) onImported(res.data.id);
    } catch (e: any) {
      // Fallback: try storage upload then create knowledge draft
      try {
        const form2 = new FormData();
        form2.append('file', file);
        const up = await apiClient.post<any>('/storage/upload', form2);
        toast.success('فایل ذخیره شد، حالا می‌توانی مقاله بسازی');
        setResult({ id: up.data?.id, status: 'stored' });
      } catch {
        toast.error(e?.message ?? 'خطا در آپلود');
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Upload className="h-4 w-4" /> وارد کردن مقاله از سند
          <Badge variant="outline" className="text-[10px]">
            <Sparkles className="h-3 w-3 mr-1" /> AI Pipeline
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-xl border-2 border-dashed p-8 text-center hover:border-primary/50 transition-colors">
          <FileText className="h-10 w-10 mx-auto text-muted-foreground opacity-30 mb-3" />
          <p className="text-sm font-medium">PDF، DOCX، TXT یا تصویر را بکش و رها کن</p>
          <p className="text-[11px] text-muted-foreground mt-1">
            حداکثر 50MB — پردازش خودکار با Knowledge Factory
          </p>

          <input
            type="file"
            accept=".pdf,.docx,.txt,.png,.jpg,.jpeg"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="hidden"
            id="knowledge-import-file"
          />
          <label
            htmlFor="knowledge-import-file"
            className="mt-4 inline-flex h-9 px-4 rounded-xl border bg-card hover:bg-secondary text-xs font-medium cursor-pointer items-center justify-center"
          >
            انتخاب فایل
          </label>

          {file && (
            <div className="mt-4 p-3 rounded-xl bg-secondary/50 text-xs flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="h-4 w-4" /> {file.name} ({(file.size / 1024 / 1024).toFixed(2)}{' '}
                MB)
              </span>
              <Button size="sm" onClick={handleUpload} disabled={uploading}>
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}{' '}
                آپلود
              </Button>
            </div>
          )}
        </div>

        {result && (
          <div className="rounded-xl border bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 p-3 flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-emerald-800 dark:text-emerald-300">
                سند با موفقیت ثبت شد
              </p>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono">
                ID: {result.id} • Status: {result.status}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                پس از پردازش (classify → parse → chunk → embed → publish) به صورت مقاله پیش‌نویس
                درمی‌آید.
              </p>
            </div>
          </div>
        )}

        <div className="rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 p-3 flex gap-2">
          <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
          <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
            این بخش به Knowledge Factory متصل است. اگر سرویس‌های Python خاموش باشند، فایل فقط ذخیره
            می‌شود و باید دستی مقاله بسازی. برای فعال‌سازی:{' '}
            <code>docker compose up -d engineering-service ai-service</code>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
