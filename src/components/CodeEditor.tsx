import { useEffect, useRef } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { keymap } from '@codemirror/view';
import { indentWithTab } from '@codemirror/commands';
import { Prec, type Extension } from '@codemirror/state';
import { oneDark } from '@codemirror/theme-one-dark';

interface CodeEditorProps {
  value: string;
  onChange: (code: string) => void;
  /** Language support extension, e.g. python() or javascript(). */
  language: Extension;
  /** Invoked on Ctrl/Cmd+Enter. */
  onRun?: () => void;
  ariaLabel?: string;
}

const sizing = EditorView.theme({
  '&': { fontSize: '14px', borderRadius: '0.5rem', overflow: 'hidden' },
  '.cm-scroller': {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
    minHeight: '16rem',
    maxHeight: '32rem',
  },
});

/**
 * Thin CodeMirror 6 wrapper. The view is created once; external `value`
 * changes (loading an example, reset) are diffed in, and edits flow out
 * through `onChange`.
 */
export default function CodeEditor({ value, onChange, language, onRun, ariaLabel }: CodeEditorProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const onRunRef = useRef(onRun);
  onChangeRef.current = onChange;
  onRunRef.current = onRun;

  useEffect(() => {
    if (!hostRef.current) return;
    const view = new EditorView({
      doc: value,
      parent: hostRef.current,
      extensions: [
        // Highest precedence so Mod-Enter wins over the default newline binding.
        Prec.highest(
          keymap.of([
            {
              key: 'Mod-Enter',
              run: () => {
                onRunRef.current?.();
                return true;
              },
            },
          ]),
        ),
        basicSetup,
        keymap.of([indentWithTab]),
        language,
        oneDark,
        sizing,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) onChangeRef.current(update.state.doc.toString());
        }),
      ],
    });
    viewRef.current = view;
    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // The view is intentionally created exactly once per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Push external value changes (example loaded, reset) into the editor.
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current !== value) {
      view.dispatch({ changes: { from: 0, to: current.length, insert: value } });
    }
  }, [value]);

  return <div ref={hostRef} aria-label={ariaLabel ?? 'Code editor'} className="text-left" />;
}
