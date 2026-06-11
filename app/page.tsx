import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background p-10">
      {/* Brand */}
      <div className="mb-10 flex items-center gap-3">
        <span className="text-2xl font-extrabold tracking-tight">
          DTEK<span className="text-teal">Core</span>
        </span>
        <Badge variant="outline" className="mono text-[10px] tracking-widest text-mute">
          DTMP
        </Badge>
      </div>

      {/* Color tokens */}
      <Card className="mb-6 max-w-2xl border-white/[0.06] bg-surface">
        <CardHeader>
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-mute">
            Design Tokens — Цвета
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {[
              { name: 'teal', bg: '#2dd4bf', dark: true },
              { name: 'lime', bg: '#5fcf80', dark: true },
              { name: 'amber', bg: '#f5c451', dark: true },
              { name: 'orange', bg: '#f59145', dark: true },
              { name: 'crit', bg: '#f0566d', dark: false },
              { name: 'info', bg: '#5b9bf5', dark: false },
              { name: 'surface', bg: '#0f141c', dark: false },
              { name: 'surface-2', bg: '#141b25', dark: false },
            ].map((t) => (
              <div key={t.name} className="flex flex-col gap-1">
                <div
                  className="h-10 w-24 rounded-dtek-sm"
                  style={{ background: t.bg }}
                />
                <span className="mono text-[10px] text-mute">{t.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Typography */}
      <Card className="mb-6 max-w-2xl border-white/[0.06] bg-surface">
        <CardHeader>
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-mute">
            Typography
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-3xl font-extrabold tracking-tight">Manrope 800 — заголовок</p>
          <p className="font-semibold text-dim">Manrope 600 — подзаголовок</p>
          <p className="text-sm text-mute">Manrope 400 — основной текст, 14px</p>
          <Separator className="my-2 bg-white/[0.06]" />
          <p className="mono text-sm text-teal">JetBrains Mono — 0x2DD4BF score:74</p>
        </CardContent>
      </Card>

      {/* Buttons */}
      <Card className="mb-6 max-w-2xl border-white/[0.06] bg-surface">
        <CardHeader>
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-mute">
            Shadcn/UI Components
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button className="bg-teal text-[#04211d] hover:bg-teal/90">Primary</Button>
          <Button variant="outline" className="border-teal/30 text-teal hover:bg-teal/10">
            Outline
          </Button>
          <Button variant="ghost" className="text-dim hover:text-foreground">
            Ghost
          </Button>
          <Button variant="destructive">Destructive</Button>
          <Badge className="bg-teal/[.13] text-teal">Active</Badge>
          <Badge variant="outline" className="border-white/10 text-dim">
            Neutral
          </Badge>
          <Badge className="bg-crit/[.13] text-crit">Critical</Badge>
        </CardContent>
      </Card>

      <p className="mono text-xs text-mute">S01-T003 complete · Tailwind 3 + Shadcn/UI + DTEK tokens</p>
    </main>
  );
}
