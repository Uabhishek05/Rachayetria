import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCatalogData } from '@/hooks/useCatalogData';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export function ReadingPage() {
  const params = useParams();
  const [fontSize, setFontSize] = useState(18);
  const [fontFamily, setFontFamily] = useState('Merriweather, Georgia, serif');
  const [selectedParagraph, setSelectedParagraph] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [paragraphComments, setParagraphComments] = useState<Record<number, string[]>>({});
  const [progress, setProgress] = useState(24);
  const [pdfPage, setPdfPage] = useState(1);
  const [pdfZoom, setPdfZoom] = useState(110);
  const [pdfTotalPages, setPdfTotalPages] = useState<number>(0);
  const [pdfLoadError, setPdfLoadError] = useState<string | null>(null);
  const { books, loading } = useCatalogData();

  const chapter = useMemo(() => {
    if (books.length === 0) {
      return undefined;
    }
    const book = books.find((item) => item.id === params.bookId) ?? books[0];
    if (!book || book.chapters.length === 0) {
      return undefined;
    }
    return book.chapters.find((item) => item.id === params.chapterId) ?? book.chapters[0];
  }, [books, params.bookId, params.chapterId]);
  const hasPdf = Boolean(chapter?.pdfUrl);

  useEffect(() => {
    setProgress(24);
    setPdfZoom(110);
    setPdfPage(chapter?.pdfStartPage ?? 1);
    setPdfTotalPages(0);
    setPdfLoadError(null);
  }, [chapter?.id, chapter?.pdfStartPage]);

  if (loading) {
    return <div className="p-4 text-sm text-gray-500 md:p-6">Loading chapter...</div>;
  }

  if (!chapter) {
    return <div className="p-4 text-sm text-gray-500 md:p-6">Chapter not found.</div>;
  }

  const addComment = () => {
    if (selectedParagraph === null || comment.trim().length === 0) {
      return;
    }
    setParagraphComments((prev) => ({
      ...prev,
      [selectedParagraph]: [...(prev[selectedParagraph] ?? []), comment],
    }));
    setComment('');
  };

  return (
    <div className="mx-auto max-w-5xl p-4 md:p-6">
      <header className="sticky top-16 z-10 mb-5 rounded-2xl border border-slate-200 bg-white/95 p-3 backdrop-blur dark:border-slate-700 dark:bg-slate-900/95 md:top-20">
        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto_auto] md:items-center">
          <p className="text-sm font-semibold dark:text-slate-100">{chapter.title}</p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Font size</span>
            <input
              type="range"
              min={14}
              max={24}
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
            />
          </div>
          <select
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="Merriweather, Georgia, serif">Merriweather</option>
            <option value="Georgia, serif">Georgia</option>
            <option value="Inter, sans-serif">Inter</option>
          </select>
          <div className="max-w-full">
            <p className="text-xs text-slate-500 dark:text-slate-400">Progress {progress}%</p>
            <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 md:w-40">
              <div className="h-full rounded-full bg-primary" style={{ width: progress + '%' }} />
            </div>
          </div>
        </div>
      </header>

      <article className="space-y-4 rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-900 md:p-6">
        {chapter.pdfUrl ? (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={chapter.pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
              >
                Open PDF in new tab
              </a>
              <a
                href={chapter.pdfUrl}
                download
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Download PDF
              </a>
              <div className="ml-auto flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  className="px-3 py-2 text-xs"
                  onClick={() => {
                    setPdfPage((page) => Math.max(1, page - 1));
                    setProgress((p) => Math.min(100, p + 1));
                  }}
                >
                  Prev page
                </Button>
                <label className="text-xs text-slate-500 dark:text-slate-400">
                  Page
                  <input
                    type="number"
                    min={1}
                    value={pdfPage}
                    onChange={(e) => setPdfPage(Math.max(1, Number(e.target.value || 1)))}
                    className="ml-2 w-20 rounded-lg border border-slate-300 px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-900"
                  />
                </label>
                <Button
                  type="button"
                  className="px-3 py-2 text-xs"
                  onClick={() => {
                    setPdfPage((page) => {
                      if (pdfTotalPages > 0) {
                        return Math.min(pdfTotalPages, page + 1);
                      }
                      return page + 1;
                    });
                    setProgress((p) => Math.min(100, p + 1));
                  }}
                >
                  Next page
                </Button>
                <Button type="button" className="px-3 py-2 text-xs" onClick={() => setPdfZoom((z) => Math.max(50, z - 10))}>
                  A-
                </Button>
                <span className="text-xs text-slate-500 dark:text-slate-400">{pdfZoom}%</span>
                <Button type="button" className="px-3 py-2 text-xs" onClick={() => setPdfZoom((z) => Math.min(200, z + 10))}>
                  A+
                </Button>
              </div>
            </div>
            <div className="min-h-[70vh] overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/60">
              {pdfLoadError ? (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
                  PDF failed to render in-app: {pdfLoadError}
                </div>
              ) : null}
              <Document
                key={chapter.id}
                file={chapter.pdfUrl}
                onLoadSuccess={({ numPages }) => {
                  setPdfTotalPages(numPages);
                  setPdfPage((currentPage) => Math.min(Math.max(1, currentPage), numPages));
                }}
                onLoadError={(error) => {
                  setPdfLoadError(error.message);
                }}
                loading={<p className="text-sm text-slate-500 dark:text-slate-400">Loading PDF...</p>}
                error=""
                className="mx-auto w-fit"
              >
                <Page
                  pageNumber={pdfPage}
                  scale={pdfZoom / 100}
                  renderTextLayer
                  renderAnnotationLayer
                  loading={<p className="text-sm text-slate-500 dark:text-slate-400">Rendering page...</p>}
                  className="shadow-sm"
                />
              </Document>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {pdfTotalPages > 0 ? `Page ${pdfPage} of ${pdfTotalPages}` : 'Preparing pages...'}
            </p>
          </div>
        ) : null}

        {chapter.content.map((paragraph, idx) => (
          <div
            key={idx.toString()}
            className={[
              'cursor-pointer rounded-xl px-2 py-1 transition',
              selectedParagraph === idx ? 'bg-primary/10' : 'hover:bg-slate-100 dark:hover:bg-slate-800',
            ].join(' ')}
            onClick={() => {
              setSelectedParagraph(idx);
              setProgress((p) => Math.min(100, p + 8));
            }}
          >
            <p style={{ fontFamily, fontSize }} className="font-serif leading-relaxed text-gray-700 dark:text-slate-200">
              {paragraph}
            </p>
            {(paragraphComments[idx] ?? []).map((note, noteIdx) => (
              <p key={note + noteIdx.toString()} className="mt-2 rounded-lg bg-slate-50 p-2 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                Note: {note}
              </p>
            ))}
          </div>
        ))}
        {chapter.content.length === 0 && !chapter.pdfUrl ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">No chapter content available yet.</p>
        ) : null}
      </article>

      <aside className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <p className="text-sm font-semibold dark:text-slate-100">Paragraph Comments and Highlights</p>
        <p className="mb-3 mt-1 text-xs text-slate-500 dark:text-slate-400">Tap any paragraph above to add contextual feedback.</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            placeholder={
              chapter.content.length === 0
                ? 'No text paragraphs in this chapter'
                : selectedParagraph === null
                  ? 'Select paragraph first'
                  : 'Add comment to selected paragraph'
            }
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={selectedParagraph === null || chapter.content.length === 0}
          />
          <Button onClick={addComment} className="sm:w-auto" disabled={selectedParagraph === null || chapter.content.length === 0}>
            Post
          </Button>
        </div>
      </aside>
    </div>
  );
}
