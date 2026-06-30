import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import {
  Dices,
  Copy,
  Check,
  RotateCcw,
  Sun,
  Moon,
  Info,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const VOWELS = new Set(["a", "e", "i", "o", "u"]);
const CONSONANTS = "bcdfghjklmnpqrstvwxyz".split("");
const ALL_LETTERS = "abcdefghijklmnopqrstuvwxyz".split("");

// Weighted letter frequency (roughly based on English)
const LETTER_WEIGHTS: Record<string, number> = {
  a: 8, b: 2, c: 3, d: 4, e: 12, f: 2, g: 2, h: 5, i: 7, j: 1,
  k: 1, l: 4, m: 3, n: 7, o: 8, p: 2, q: 0.5, r: 6, s: 6, t: 9,
  u: 3, v: 1, w: 2, x: 0.5, y: 2, z: 0.5,
};

function weightedRandomLetter(pool: string[]): string {
  const weights = pool.map((l) => LETTER_WEIGHTS[l] || 1);
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < pool.length; i++) {
    r -= weights[i];
    if (r <= 0) return pool[i];
  }
  return pool[pool.length - 1];
}

function generateName(
  minLen: number,
  maxLen: number,
  maxConsonants: number,
  startLetter: string | null,
  endLetter: string | null
): string {
  // Ensure minimum length accommodates start + end letter constraints
  const effectiveMin = Math.max(
    minLen,
    (startLetter ? 1 : 0) + (endLetter ? 1 : 0)
  );
  const effectiveMax = Math.max(maxLen, effectiveMin);

  const len =
    effectiveMin +
    Math.floor(Math.random() * (effectiveMax - effectiveMin + 1));
  const letters: string[] = [];
  let consonantStreak = 0;

  // How many middle letters to generate (excluding forced start/end)
  const middleCount =
    len - (startLetter ? 1 : 0) - (endLetter ? 1 : 0);

  // Place start letter
  if (startLetter) {
    letters.push(startLetter);
    consonantStreak = VOWELS.has(startLetter) ? 0 : 1;
  }

  // Generate middle letters
  for (let i = 0; i < middleCount; i++) {
    // If we're about to place the last middle letter and endLetter is a consonant,
    // check if we need to insert a vowel to avoid violating the consonant rule
    const isLastMiddle = i === middleCount - 1;
    const endIsConsonant = endLetter && !VOWELS.has(endLetter);

    const mustVowel = consonantStreak >= maxConsonants;
    // Also force vowel if next-to-last and end letter would create a violation
    const mustVowelForEnd =
      isLastMiddle && endIsConsonant && consonantStreak >= maxConsonants - 1;
    const preferVowel =
      !startLetter && i === 0 && Math.random() < 0.55;

    if (mustVowel || mustVowelForEnd || preferVowel) {
      const vowelArr = ALL_LETTERS.filter((l) => VOWELS.has(l));
      letters.push(weightedRandomLetter(vowelArr));
      consonantStreak = 0;
    } else {
      const letter = weightedRandomLetter(ALL_LETTERS);
      if (VOWELS.has(letter)) {
        consonantStreak = 0;
      } else {
        consonantStreak++;
      }
      letters.push(letter);
    }
  }

  // Place end letter
  if (endLetter) {
    letters.push(endLetter);
  }

  // Capitalize first letter
  return letters[0].toUpperCase() + letters.slice(1).join("");
}

// Letter picker component
function LetterPicker({
  label,
  value,
  onChange,
  testIdPrefix,
}: {
  label: string;
  value: string | null;
  onChange: (v: string | null) => void;
  testIdPrefix: string;
}) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        {value && (
          <button
            data-testid={`${testIdPrefix}-clear`}
            onClick={() => onChange(null)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-1">
        {ALL_LETTERS.map((letter) => {
          const isSelected = value === letter;
          const isVowel = VOWELS.has(letter);
          return (
            <button
              key={letter}
              data-testid={`${testIdPrefix}-${letter}`}
              onClick={() => onChange(isSelected ? null : letter)}
              className={`
                w-7 h-7 rounded-md flex items-center justify-center text-xs font-mono font-semibold
                transition-all duration-150 cursor-pointer
                ${
                  isSelected
                    ? "bg-primary text-primary-foreground ring-2 ring-primary/30 scale-110"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                }
              `}
            >
              {letter.toUpperCase()}
            </button>
          );
        })}
      </div>
      {value ? (
        <p className="text-xs text-muted-foreground">
          All names will {label === 'Starts With' ? 'start' : 'end'} with <span className="font-mono font-semibold text-primary">{value.toUpperCase()}</span>
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">Click a letter to filter, or leave empty for any</p>
      )}
    </div>
  );
}

function LetterGrid() {
  return (
    <div className="grid grid-cols-13 gap-1" data-testid="letter-grid">
      {ALL_LETTERS.map((letter) => (
        <div
          key={letter}
          className={`
            w-7 h-7 rounded-md flex items-center justify-center text-xs font-mono font-semibold
            transition-colors duration-150
            ${
              VOWELS.has(letter)
                ? "bg-primary/15 text-primary dark:bg-primary/20 dark:text-primary"
                : "bg-muted text-muted-foreground"
            }
          `}
        >
          {letter.toUpperCase()}
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const [minLetters, setMinLetters] = useState(3);
  const [maxLetters, setMaxLetters] = useState(8);
  const [wordCount, setWordCount] = useState(12);
  const [maxConsonants, setMaxConsonants] = useState(2);
  const [startLetter, setStartLetter] = useState<string | null>(null);
  const [endLetter, setEndLetter] = useState<string | null>(null);
  const [generatedNames, setGeneratedNames] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isDark, setIsDark] = useState(
    () => window.matchMedia("(prefers-color-scheme: dark)").matches
  );
  const { toast } = useToast();

  const toggleDark = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      return next;
    });
  }, []);

  // Initialize dark mode class
  useMemo(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const handleGenerate = useCallback(() => {
    const names: string[] = [];
    for (let i = 0; i < wordCount; i++) {
      names.push(
        generateName(minLetters, maxLetters, maxConsonants, startLetter, endLetter)
      );
    }
    setGeneratedNames(names);
    setCopiedIndex(null);
  }, [minLetters, maxLetters, wordCount, maxConsonants, startLetter, endLetter]);

  const handleCopy = useCallback(
    (name: string, index: number) => {
      navigator.clipboard.writeText(name).then(() => {
        setCopiedIndex(index);
        toast({ title: "Copied", description: `"${name}" copied to clipboard` });
        setTimeout(() => setCopiedIndex(null), 1500);
      });
    },
    [toast]
  );

  const handleCopyAll = useCallback(() => {
    const text = generatedNames.join("\n");
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "All copied",
        description: `${generatedNames.length} names copied to clipboard`,
      });
    });
  }, [generatedNames, toast]);

  const handleReset = useCallback(() => {
    setMinLetters(3);
    setMaxLetters(8);
    setWordCount(12);
    setMaxConsonants(2);
    setStartLetter(null);
    setEndLetter(null);
    setGeneratedNames([]);
    setCopiedIndex(null);
  }, []);

  // Active filter summary
  const activeFilters: string[] = [];
  if (startLetter) activeFilters.push(`Starts: ${startLetter.toUpperCase()}`);
  if (endLetter) activeFilters.push(`Ends: ${endLetter.toUpperCase()}`);

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Header */}
      <header className="border-b border-border/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Dices className="w-4 h-4 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-bold tracking-tight" data-testid="text-app-title">
              NameForge
            </h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDark}
            data-testid="button-theme-toggle"
            className="rounded-full"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Alphabet reference */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Alphabet
            </h2>
            <div className="flex items-center gap-2 ml-auto">
              <Badge variant="secondary" className="text-xs font-mono gap-1">
                <span className="w-2 h-2 rounded-full bg-primary inline-block" />
                Vowels
              </Badge>
              <Badge variant="secondary" className="text-xs font-mono gap-1">
                <span className="w-2 h-2 rounded-full bg-muted-foreground/40 inline-block" />
                Consonants
              </Badge>
            </div>
          </div>
          <LetterGrid />
        </section>

        {/* Controls */}
        <Card className="p-5 sm:p-6 space-y-6 border-border/60" data-testid="card-controls">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Generator Settings
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Min letters */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="min-letters" className="text-sm font-medium">
                  Min Letters
                </Label>
                <span
                  className="text-sm font-mono font-semibold text-primary tabular-nums"
                  data-testid="text-min-letters"
                >
                  {minLetters}
                </span>
              </div>
              <Slider
                id="min-letters"
                data-testid="slider-min-letters"
                min={1}
                max={20}
                step={1}
                value={[minLetters]}
                onValueChange={([v]) => {
                  setMinLetters(v);
                  if (v > maxLetters) setMaxLetters(v);
                }}
              />
            </div>

            {/* Max letters */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="max-letters" className="text-sm font-medium">
                  Max Letters
                </Label>
                <span
                  className="text-sm font-mono font-semibold text-primary tabular-nums"
                  data-testid="text-max-letters"
                >
                  {maxLetters}
                </span>
              </div>
              <Slider
                id="max-letters"
                data-testid="slider-max-letters"
                min={1}
                max={20}
                step={1}
                value={[maxLetters]}
                onValueChange={([v]) => {
                  setMaxLetters(v);
                  if (v < minLetters) setMinLetters(v);
                }}
              />
            </div>

            {/* Word count */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="word-count" className="text-sm font-medium">
                  Words to Generate
                </Label>
                <span
                  className="text-sm font-mono font-semibold text-primary tabular-nums"
                  data-testid="text-word-count"
                >
                  {wordCount}
                </span>
              </div>
              <Slider
                id="word-count"
                data-testid="slider-word-count"
                min={1}
                max={100}
                step={1}
                value={[wordCount]}
                onValueChange={([v]) => setWordCount(v)}
              />
            </div>

            {/* Max consonants */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="max-consonants" className="text-sm font-medium">
                  Max Consonants
                </Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-56 text-xs">
                    Maximum consecutive consonants allowed before a vowel is forced.
                    Lower values produce more pronounceable names.
                  </TooltipContent>
                </Tooltip>
                <span
                  className="text-sm font-mono font-semibold text-primary tabular-nums ml-auto"
                  data-testid="text-max-consonants"
                >
                  {maxConsonants}
                </span>
              </div>
              <Slider
                id="max-consonants"
                data-testid="slider-max-consonants"
                min={1}
                max={6}
                step={1}
                value={[maxConsonants]}
                onValueChange={([v]) => setMaxConsonants(v)}
              />
              <div className="flex justify-between text-xs text-muted-foreground font-mono">
                <span>1 (smooth)</span>
                <span>6 (rough)</span>
              </div>
            </div>
          </div>

          {/* Separator */}
          <div className="border-t border-border/60" />

          {/* Start / End letter pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <LetterPicker
              label="Starts With"
              value={startLetter}
              onChange={setStartLetter}
              testIdPrefix="start-letter"
            />
            <LetterPicker
              label="Ends With"
              value={endLetter}
              onChange={setEndLetter}
              testIdPrefix="end-letter"
            />
          </div>

          {/* Active filter badges */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2" data-testid="active-filters">
              {activeFilters.map((f) => (
                <Badge key={f} variant="secondary" className="font-mono text-xs gap-1">
                  {f}
                </Badge>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              onClick={handleGenerate}
              data-testid="button-generate"
              className="gap-2 font-semibold"
              size="lg"
            >
              <Dices className="w-4 h-4" />
              Generate Names
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              data-testid="button-reset"
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
          </div>
        </Card>

        {/* Generated names */}
        {generatedNames.length > 0 && (
          <section className="space-y-4" data-testid="section-results">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Generated Names
                <Badge variant="secondary" className="ml-2 font-mono text-xs">
                  {generatedNames.length}
                </Badge>
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyAll}
                data-testid="button-copy-all"
                className="gap-1.5 text-xs"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy All
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {generatedNames.map((name, i) => (
                <button
                  key={`${name}-${i}`}
                  data-testid={`button-name-${i}`}
                  onClick={() => handleCopy(name, i)}
                  className={`
                    group relative px-3 py-2.5 rounded-lg border
                    text-left font-medium text-sm
                    transition-all duration-150 cursor-pointer
                    hover:border-primary/40 hover:bg-primary/5
                    active:scale-[0.98]
                    ${
                      copiedIndex === i
                        ? "border-primary/40 bg-primary/5"
                        : "border-border/60 bg-card"
                    }
                  `}
                >
                  <span className="font-mono tracking-wide">{name}</span>
                  <span
                    className={`
                      absolute right-2 top-1/2 -translate-y-1/2 
                      transition-opacity duration-150
                      ${copiedIndex === i ? "opacity-100" : "opacity-0 group-hover:opacity-60"}
                    `}
                  >
                    {copiedIndex === i ? (
                      <Check className="w-3.5 h-3.5 text-primary" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                  </span>
                  <span className="block text-xs text-muted-foreground font-mono mt-0.5">
                    {name.length} letters
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {generatedNames.length === 0 && (
          <div
            className="flex flex-col items-center justify-center py-16 text-center space-y-3"
            data-testid="section-empty"
          >
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
              <Dices className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Adjust the settings above and hit Generate to create random
              pronounceable names.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
