/*
 * (C) Copyright 2026- ECMWF and individual contributors.
 *
 * This software is licensed under the terms of the Apache Licence Version 2.0
 * which can be obtained at http://www.apache.org/licenses/LICENSE-2.0.
 * In applying this licence, ECMWF does not waive the privileges and immunities
 * granted to it by virtue of its status as an intergovernmental organisation nor
 * does it submit to any jurisdiction.
 */

/**
 * Glyph display utilities for parsing and rendering ${...} expressions.
 *
 * The substitution body can contain pipe-style filters, function calls and
 * string literals (e.g. `${func("a}b") | filter(2)}`), so a regex isn't
 * enough — we run a small scanner that tracks string-literal state and
 * matches `}` only outside of quoted segments.
 */

export interface GlyphSegment {
  text: string
  isGlyph: boolean
}

export interface GlyphSpan {
  /** Index of `$` in the original string. */
  start: number
  /** Exclusive end — one past the closing `}`. */
  end: number
}

/**
 * Find all `${...}` substitution spans in `text`. String literals inside the
 * body (single- or double-quoted, with backslash escapes) are honoured so a
 * `}` inside a string does NOT close the substitution. Unterminated `${`
 * substitutions are skipped.
 */
export function findGlyphSpans(text: string): Array<GlyphSpan> {
  const spans: Array<GlyphSpan> = []
  let i = 0
  while (i < text.length) {
    if (text[i] === '$' && text[i + 1] === '{') {
      const start = i
      let j = i + 2
      let inString: '"' | "'" | null = null
      while (j < text.length) {
        const c = text[j]!
        if (inString) {
          if (c === '\\' && j + 1 < text.length) {
            j += 2
            continue
          }
          if (c === inString) inString = null
          j++
          continue
        }
        if (c === '"' || c === "'") {
          inString = c
          j++
          continue
        }
        if (c === '}') {
          spans.push({ start, end: j + 1 })
          i = j + 1
          break
        }
        j++
      }
      // Unterminated `${...}` — bail out of the outer loop too; nothing past
      // here can be a span anchored before the unterminated one.
      if (j >= text.length) return spans
      continue
    }
    i++
  }
  return spans
}

/**
 * Split a config value into segments of plain text and glyph references.
 *
 * Example: "/data/${runId}/output" → [
 *   { text: "/data/", isGlyph: false },
 *   { text: "${runId}", isGlyph: true },
 *   { text: "/output", isGlyph: false },
 * ]
 */
export function parseGlyphSegments(value: string): Array<GlyphSegment> {
  const segments: Array<GlyphSegment> = []
  let lastIndex = 0
  for (const span of findGlyphSpans(value)) {
    if (span.start > lastIndex) {
      segments.push({ text: value.slice(lastIndex, span.start), isGlyph: false })
    }
    segments.push({ text: value.slice(span.start, span.end), isGlyph: true })
    lastIndex = span.end
  }
  if (lastIndex < value.length) {
    segments.push({ text: value.slice(lastIndex), isGlyph: false })
  }
  return segments
}

/**
 * Check if a value contains any glyph references.
 */
export function containsGlyphs(value: string): boolean {
  return findGlyphSpans(value).length > 0
}

/**
 * Extract the inner expression from a `${...}` reference.
 *
 * For a plain reference like `${runId}` this is the variable name; for a
 * Jinja expression like `${var | sub_days(2)}` it's the full body. Callers
 * that need just the leading variable name should parse further.
 */
export function extractGlyphKey(ref: string): string {
  return ref.slice(2, -1)
}
