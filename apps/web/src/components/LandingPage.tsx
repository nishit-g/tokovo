import {
  BookOpen,
  Camera,
  Code2,
  Film,
  GitBranch,
  Globe2,
  Play,
  Smartphone,
  Volume2,
} from "lucide-react";
import Link from "next/link";

const steps = [
  {
    icon: Code2,
    label: "Generate",
    title: "Prompt the episode",
    body: "Start with a premise, characters, tone, platform, duration, and story arc. AI can draft the phone-native scene instead of a blank timeline.",
  },
  {
    icon: Camera,
    label: "Direct",
    title: "Control the whole stage",
    body: "Choose devices, chats, feeds, DMs, notifications, captions, camera moves, sound, voice, backgrounds, and pacing.",
  },
  {
    icon: Film,
    label: "Render",
    title: "Export the show",
    body: "Preview, refine, and render vertical episodes for Shorts, Reels, TikTok, and serialized phone-screen formats.",
  },
];

const stats = [
  ["AI", "native studio"],
  ["Many", "devices"],
  ["Camera", "directed"],
  ["Sound", "handled"],
];

const capabilities = [
  "AI can generate scripts, branches, captions, translations, and variants on top of a controlled phone-native stage",
  "Simulated phone OS surfaces cover one or many devices, chats, feeds, DMs, notifications, calls, keyboard, and lockscreen",
  "Camera, sound, voice, backgrounds, overlays, and render output are declared in code instead of fixed by hand later",
  "Deterministic rendering keeps every episode editable, reviewable, and repeatable",
];

const stageLayers = [
  {
    icon: Smartphone,
    label: "Multi-device",
    body: "Stage parallel phones, split pacing, app switches, OS chrome, and screen recordings.",
  },
  {
    icon: Camera,
    label: "Camera",
    body: "Focus cinematic subjects, track live UI motion, cut between app surfaces, and direct reveals.",
  },
  {
    icon: Volume2,
    label: "Sound",
    body: "Use audio tracks, procedural sound effects, background music, and generated voice layers.",
  },
];

const contentFormats = [
  {
    number: "01",
    title: "Serialized phone drama",
    body: "Recurring manager, family, friendship, dating, and creator stories built for 30–60 second episodes and cliffhangers.",
    example:
      "A new manager joins the team group while private chats reveal who actually hired them.",
  },
  {
    number: "02",
    title: "Topical original fiction",
    body: "Original characters react to matches, launches, public events, and cultural moments while they are still relevant.",
    example:
      "Four friends watch a final from different cities; one private message reveals somebody already knows the result.",
  },
  {
    number: "03",
    title: "Mystery and investigation",
    body: "Deleted messages, unknown callers, location drops, recordings, and conflicting posts become narrative evidence.",
    example:
      "A journalist receives a location pin while a second phone races to delete the source.",
  },
  {
    number: "04",
    title: "Comedy and satire",
    body: "Corporate absurdity, family-group rituals, autocorrect chaos, fandom, and internet culture told through behavior.",
    example:
      "A team spends all night on a “minor wording change” that the founder replaces with one emoji.",
  },
  {
    number: "05",
    title: "Story-native promotion",
    body: "Products, bookings, launches, orders, and recommendations enter the story only when they create conflict or payoff.",
    example: "A restaurant booking link meant to repair an argument becomes the emotional reveal.",
  },
  {
    number: "06",
    title: "Commentary and reconstruction",
    body: "Visualize how a rumor, outage, launch, or public story moved across private conversations and public surfaces.",
    example:
      "The original message, cropped repost, notification spike, and ignored correction unfold in sequence.",
  },
  {
    number: "07",
    title: "Education through consequence",
    body: "Teach scams, finance, cybersecurity, workplace behavior, history, or language through decisions instead of slides.",
    example:
      "A delivery scam travels from notification to family chat to banking alert, exposing the moment it could be stopped.",
  },
  {
    number: "08",
    title: "Multi-perspective anthology",
    body: "Show the same event across several phones, with each device revealing information the other characters do not know.",
    example:
      "A resignation reads as courage, betrayal, opportunity, and family gossip on four different devices.",
  },
];

export function LandingPage() {
  return (
    <main className="noise min-h-screen overflow-x-hidden bg-ink text-cream">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-cream/10 bg-ink/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
          <Link href="/" className="font-serif text-2xl text-cream italic">
            tokovo
          </Link>
          <nav className="flex items-center gap-5">
            <a
              href="#showcase"
              className="hidden font-mono text-[11px] tracking-[0.16em] text-cream/55 uppercase transition-colors hover:text-cream md:block"
            >
              Showcase
            </a>
            <a
              href="#formats"
              className="hidden font-mono text-[11px] tracking-[0.16em] text-cream/55 uppercase transition-colors hover:text-cream md:block"
            >
              Formats
            </a>
            <a
              href="#workflow"
              className="hidden font-mono text-[11px] tracking-[0.16em] text-cream/55 uppercase transition-colors hover:text-cream md:block"
            >
              Workflow
            </a>
            <a
              href="https://github.com/nishit-g/tokovo"
              className="inline-flex h-9 w-10 items-center justify-center border border-cream/20 text-cream transition-colors hover:border-copper hover:text-copper-light sm:w-auto sm:gap-2 sm:px-3 sm:font-mono sm:text-[11px] sm:tracking-[0.16em] sm:uppercase"
            >
              <Code2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
          </nav>
        </div>
      </header>

      <section id="showcase" className="relative pt-16">
        <div className="absolute inset-0 opacity-[0.08]">
          <div className="h-full w-full bg-[linear-gradient(90deg,rgba(245,240,232,0.2)_1px,transparent_1px),linear-gradient(rgba(245,240,232,0.16)_1px,transparent_1px)] bg-[size:76px_76px]" />
        </div>

        <div className="relative mx-auto grid min-h-[calc(100vh-64px)] max-w-7xl items-center gap-8 px-5 py-9 lg:grid-cols-[0.98fr_0.92fr] lg:px-8 lg:py-12">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 border border-copper/40 bg-copper/10 px-3 py-1.5">
              <span className="h-1.5 w-1.5 bg-copper-light" />
              <span className="font-mono text-[10px] tracking-[0.16em] text-copper-light uppercase">
                AI-native multi-device phone show studio
              </span>
            </div>

            <h1 className="mt-7 max-w-[21.5rem] font-serif text-[2.7rem] leading-[0.98] text-cream min-[430px]:max-w-[25rem] min-[430px]:text-[3.4rem] sm:max-w-3xl sm:text-[5.4rem] lg:text-[6.45rem] xl:text-[7.15rem]">
              Make shows that happen inside phones.
            </h1>

            <p className="mt-6 max-w-[21.5rem] font-mono text-sm leading-7 text-cream/62 sm:max-w-[34rem]">
              Generate chat dramas, social-feed stories, and phone-screen episodes. Tokovo handles
              the app worlds, multiple devices, camera, sound, voice, and vertical render so the
              show can move from prompt to finished cut without After Effects.
            </p>

            <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap">
              <a
                href="/showcase/launch-clip.mp4"
                className="inline-flex h-12 items-center justify-center gap-2 bg-cream px-5 font-mono text-xs tracking-[0.14em] text-ink uppercase transition-colors hover:bg-copper hover:text-cream"
              >
                <Play className="h-4 w-4" aria-hidden="true" />
                Watch showcase
              </a>
              <a
                href="https://github.com/nishit-g/tokovo#first-10-minutes"
                className="inline-flex h-12 items-center justify-center gap-2 border border-cream/20 px-5 font-mono text-xs tracking-[0.14em] text-cream uppercase transition-colors hover:border-copper hover:text-copper-light"
              >
                <BookOpen className="h-4 w-4" aria-hidden="true" />
                Read the docs
              </a>
            </div>

            <dl className="mt-8 grid max-w-2xl grid-cols-2 border-y border-cream/10 sm:grid-cols-4">
              {stats.map(([value, label]) => (
                <div key={label} className="border-cream/10 py-4 sm:border-r sm:last:border-r-0">
                  <dt className="font-serif text-2xl text-cream">{value}</dt>
                  <dd className="mt-1 font-mono text-[10px] tracking-[0.14em] text-cream/42 uppercase">
                    {label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative mx-auto w-full max-w-[20.75rem] min-[430px]:max-w-[24rem] lg:max-w-[30rem]">
            <div className="absolute top-20 -left-5 hidden h-36 w-px bg-copper/60 lg:block" />
            <div className="absolute -right-5 bottom-16 hidden h-24 w-px bg-cream/25 lg:block" />
            <div className="relative border border-cream/15 bg-black p-2 shadow-[0_24px_120px_rgba(0,0,0,0.55)]">
              <video
                className="aspect-[9/16] w-full bg-charcoal object-cover"
                src="/showcase/launch-clip.mp4"
                poster="/showcase/launch-poster.png"
                preload="none"
                controls
              />
            </div>
            <p className="mt-4 border-l border-copper/60 pl-4 font-mono text-xs leading-6 text-cream/55">
              Rendered from the public{" "}
              <code className="text-cream/75">v2-creator-series-showcase</code> episode.
            </p>
          </div>
        </div>

        <div className="relative border-y border-cream/10 bg-cream text-ink">
          <div className="mx-auto grid max-w-7xl gap-5 px-5 py-6 lg:grid-cols-[0.28fr_1fr] lg:px-8">
            <p className="font-mono text-[10px] tracking-[0.16em] text-ink/45 uppercase">
              Built for
            </p>
            <div className="flex flex-wrap gap-x-8 gap-y-3 font-mono text-sm text-ink/70">
              <span>AI creators</span>
              <span>Multi-device stories</span>
              <span>Chat dramas</span>
              <span>Short-form series</span>
              <span>Phone-screen episodes</span>
            </div>
          </div>
        </div>
      </section>

      <section id="formats" className="border-b border-ink/15 bg-cream py-20 text-ink lg:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid gap-8 border-b border-ink/15 pb-12 lg:grid-cols-[0.42fr_1fr] lg:pb-16">
            <span className="font-mono text-xs tracking-[0.16em] text-copper uppercase">
              What Tokovo can make
            </span>
            <div>
              <h2 className="max-w-4xl font-serif text-4xl leading-[0.98] sm:text-5xl lg:text-7xl">
                The phone is the stage. The format is much bigger than chat videos.
              </h2>
              <p className="mt-7 max-w-2xl font-mono text-sm leading-7 text-ink/60">
                Build entertainment, topical fiction, branded stories, explainers, and regional
                editions across chats, feeds, calls, notifications, recordings, and multiple
                devices.
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2">
            {contentFormats.map((format, index) => (
              <article
                key={format.number}
                className={`grid gap-4 border-b border-ink/15 py-8 lg:grid-cols-[3.5rem_1fr] lg:py-10 ${
                  index % 2 === 0 ? "lg:border-r lg:pr-10" : "lg:pl-10"
                }`}
              >
                <span className="font-mono text-xs text-copper">{format.number}</span>
                <div>
                  <h3 className="font-serif text-3xl leading-none">{format.title}</h3>
                  <p className="mt-4 max-w-xl font-mono text-xs leading-6 text-ink/62">
                    {format.body}
                  </p>
                  <p className="mt-5 border-l border-copper pl-4 font-mono text-xs leading-6 text-ink/48 italic">
                    Example — {format.example}
                  </p>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-12 grid overflow-hidden bg-ink text-cream lg:grid-cols-[0.34fr_1fr]">
            <div className="border-b border-cream/10 p-6 lg:border-r lg:border-b-0 lg:p-8">
              <Globe2 className="h-6 w-6 text-copper-light" aria-hidden="true" />
              <p className="mt-6 font-mono text-[10px] tracking-[0.16em] text-copper-light uppercase">
                Regional editions
              </p>
            </div>
            <div className="p-6 lg:p-8">
              <h3 className="max-w-2xl font-serif text-3xl leading-tight sm:text-4xl">
                One story can become another language, culture, device, and cut.
              </h3>
              <p className="mt-5 max-w-3xl font-mono text-xs leading-6 text-cream/58">
                Adapt dialogue, RTL direction, keyboard script, typography, app and system chrome,
                voice, pacing, and camera framing while preserving the story beats. Current depth
                varies by app: system surfaces cover English, Hindi, Arabic, and Japanese; X covers
                English, Arabic RTL, and Hindi; WhatsApp covers English and Arabic RTL.
              </p>
              <p className="mt-5 font-mono text-[10px] tracking-[0.08em] text-cream/35 uppercase">
                Every language + app combination still requires visual review.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="workflow" className="bg-ink py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.48fr_1fr]">
            <div>
              <span className="font-mono text-xs tracking-[0.16em] text-copper-light uppercase">
                Workflow
              </span>
              <h2 className="mt-5 max-w-xl font-serif text-4xl leading-none text-cream sm:text-5xl lg:text-6xl">
                From prompt to directed phone-native episode.
              </h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {steps.map((item) => (
                <article key={item.title} className="border border-cream/10 p-5">
                  <item.icon className="h-5 w-5 text-copper-light" aria-hidden="true" />
                  <p className="mt-5 font-mono text-[10px] tracking-[0.16em] text-cream/40 uppercase">
                    {item.label}
                  </p>
                  <h3 className="mt-3 font-serif text-2xl leading-tight text-cream">
                    {item.title}
                  </h3>
                  <p className="mt-4 font-mono text-xs leading-6 text-cream/55">{item.body}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-[1fr_0.78fr]">
            <div className="overflow-hidden border border-cream/10 bg-charcoal">
              <div className="flex items-center justify-between gap-4 border-b border-cream/10 px-4 py-3">
                <span className="truncate font-mono text-xs text-cream/55">
                  phone-show.episode.ts
                </span>
                <GitBranch className="h-4 w-4 shrink-0 text-copper-light" aria-hidden="true" />
              </div>
              <pre className="overflow-x-auto p-5 font-mono text-xs leading-7 text-cream/72 sm:p-7">
                <code>{`episode("cold-open", { fps: 30, duration: "45s" })
  .device("creator_phone", "iphone16", {
    app: "app_whatsapp",
    screenRecording: true
  })
  .device("audience_phone", "iphone16", {
    app: "app_x",
    screenRecording: true
  })
  .cinematics(coldOpenCinematics)
  .audio((audio) => {
    audio.span("0s", "45s").bgm("/music/cinematic-ambient.mp3", {
      volume: 0.22,
      fadeIn: "2s",
      fadeOut: "3s"
    })
  })
  .build()`}</code>
              </pre>
            </div>

            <div className="border-l border-cream/10 pl-6">
              <span className="font-mono text-xs tracking-[0.16em] text-copper-light uppercase">
                Whole stage
              </span>
              <div className="mt-6 grid gap-3">
                {stageLayers.map((item) => (
                  <article key={item.label} className="border-t border-cream/10 pt-4">
                    <div className="flex items-center gap-3">
                      <item.icon className="h-4 w-4 text-copper-light" aria-hidden="true" />
                      <h3 className="font-mono text-xs tracking-[0.14em] text-cream/75 uppercase">
                        {item.label}
                      </h3>
                    </div>
                    <p className="mt-3 font-mono text-xs leading-6 text-cream/52">{item.body}</p>
                  </article>
                ))}
              </div>
              <ul className="mt-6 space-y-5">
                {capabilities.map((item) => (
                  <li key={item} className="flex gap-4 border-t border-cream/10 pt-5">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-copper-light" />
                    <p className="font-mono text-sm leading-6 text-cream/62">{item}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="access" className="bg-cream py-20 text-ink lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-[0.9fr_1fr] lg:px-8">
          <div>
            <span className="font-mono text-xs tracking-[0.16em] text-copper uppercase">
              Start here
            </span>
            <h2 className="mt-5 font-serif text-4xl leading-none sm:text-5xl lg:text-6xl">
              Build the studio for phone-native shows.
            </h2>
          </div>
          <div className="self-end">
            <p className="max-w-2xl font-mono text-sm leading-7 text-ink/60">
              Tokovo is public, MIT licensed, and built around structured episode definitions. Run
              the showcase locally, inspect the app simulators, camera, audio, and device systems,
              then wire AI generation on top of the phone-native production engine.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="https://github.com/nishit-g/tokovo"
                className="inline-flex h-12 items-center justify-center gap-2 bg-ink px-5 font-mono text-xs tracking-[0.14em] text-cream uppercase transition-colors hover:bg-copper"
              >
                <Code2 className="h-4 w-4" aria-hidden="true" />
                Open repository
              </a>
              <a
                href="https://github.com/nishit-g/tokovo#first-10-minutes"
                className="inline-flex h-12 items-center justify-center gap-2 border border-ink/20 px-5 font-mono text-xs tracking-[0.14em] text-ink uppercase transition-colors hover:border-copper hover:text-copper"
              >
                <BookOpen className="h-4 w-4" aria-hidden="true" />
                First 10 minutes
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-cream/10 bg-ink py-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <Link href="/" className="font-serif text-xl text-cream/70 italic">
            tokovo
          </Link>
          <div className="flex flex-wrap gap-6">
            <a
              href="/legal/privacy"
              className="font-mono text-xs tracking-[0.14em] text-cream/45 uppercase transition-colors hover:text-cream"
            >
              Privacy
            </a>
            <a
              href="/legal/terms"
              className="font-mono text-xs tracking-[0.14em] text-cream/45 uppercase transition-colors hover:text-cream"
            >
              Terms
            </a>
            <a
              href="mailto:hello@tokovo.io"
              className="font-mono text-xs tracking-[0.14em] text-cream/45 uppercase transition-colors hover:text-cream"
            >
              Contact
            </a>
          </div>
          <span className="font-mono text-xs text-cream/35">Tokovo 2026</span>
        </div>
      </footer>
    </main>
  );
}
