---
name: antislop-copy
description: Cut AI slop from consumer-facing website copy while keeping every fact a visitor needs to understand, trust, compare, or act. Use this whenever the user wants to tighten, clean up, de-slop, audit, shorten, or rewrite copy for a homepage, landing page, feature section, pricing page, about page, services page, FAQ, product page, release post, or page title and meta description, including when they only say the page feels bloated, generic, repetitive, salesy, or AI-written. Not for technical docs, specs, or API references.
---

# antislop-copy

## The law

Maximize decision-useful facts per second of reading. Delete everything else. Never delete a decision-useful fact to save words.

A decision-useful fact is anything a prospective customer uses to understand, trust, compare, or act on the product: what it is, who it's for, what it does and how, what it costs, what it runs on or requires, its limits, proof (numbers with units, names, licenses, links), terms (trials, cancellation, response times, engagement models), and how to start.

Visitors skim, so every sentence without a fact makes the facts harder to find. Search engines don't penalize copy for being AI-written, but they favor pages that give searchers useful, original information. The concrete nouns this skill protects (product categories, technologies, platforms, integrations) are the words people search for, and slogans contain none of them.

Aim for `original page → only the sections that deserve to exist → only the sentences those sections need`. Trimming a few words from every paragraph isn't the goal. Deleting a redundant section usually is.

**Scope.** Marketing and product pages. Don't edit legal text (terms, privacy, license notices, disclaimers) or the wording inside attributed quotes and testimonials. You may cut a whole quote, but never change its words.

## Workflow

Work in this order. Page-level decisions come before sentence edits, because deleting a redundant section saves more reading time than trimming every sentence inside it.

1. **Collect.** Take everything a visitor reads: headings, body text, cards, stat strips, badges, buttons, FAQ, captions, footer tagline, page title, and meta description. If the user provides other pages from the same site, read those too.
2. **Inventory.** Before changing anything, list every decision-useful fact with an ID (F1, F2, ...), its type, and where it appears. Record every conflict, meaning the same attribute given different values in different places (C1, C2, ...). On long pages, group the inventory by section and keep each fact to a few words.
3. **Triage sections.** Give each section one decision: KEEP, MERGE INTO [section], MOVE TO [page] with a link, or DELETE. See "Section rules."
4. **Cut sentences.** In kept sections, apply the deletion test and the patterns below.
5. **Rewrite.** Rewrite only to join surviving facts into plain sentences or to build a heading from the section's own facts. A rewrite never adds information.
6. **Verify.** Run "Before you return."
7. **Report** in the output format.

## The deletion test

Keep a sentence only if removing it would do at least one of these to a first-time visitor:

- make them less sure what the product is, who it's for, or what it does
- take away a fact they need to decide, compare, or act (price, requirement, platform, limit, term, next step)
- take away a concrete reason to trust it (a number with a unit, a name, a license, a stated limitation, a link to proof)
- leave nearby text false, or broader than the source said

If none of these apply, delete it. A true sentence can still fail. When a fact is already on the page, the repeat goes, and the most specific instance stays in the section where visitors look for it.

## Section rules

- **Delete** a section when every fact in it appears elsewhere on the page. Sections that often fail: principles and values blocks, "how we work" blocks that restate the hero, "why choose us" grids, decorative stat strips, closing CTA essays, FAQ entries that restate features.
- **Merge** a section that has only one or two unique facts into the section a visitor would check for them.
- **Move** docs-grade detail (full command references, config snippets, troubleshooting steps, flag lists) off marketing pages. Leave a one-sentence answer and a link to the page that covers it. If no page covers it, or you can't confirm that one does, keep it and flag it with a suggested target, because a move must never lose information.
- **Don't fill design slots.** A card can be a heading and one sentence, or a heading alone when the heading states the fact. Never write a paragraph because the layout has room for one.
- **Trim link scaffolding.** Give each item at most one "learn more" link, pointing at the page with the detail. Cut "related questions" lists that repeat the page's own index.

## Protect

Never delete, soften, or generalize these:

- prices, plans, seats, quotas, trials, cancellation and refund terms
- platforms, operating systems, runtimes, versions, integrations, file formats, requirements
- numbers with units and what they measure; dates; version and release numbers
- commands, paths, and config names on pages whose job is getting someone started
- licenses, open-source status, data handling, privacy and security specifics
- named customers and people, verifiable credentials, links to repos, changelogs, and case studies
- limitations and "doesn't do X" statements, which are rare on AI-written pages and build trust
- for services: remote or on-site, time zones, engagement models, durations, cadence, response times
- the primary action and the contact method
- search terms: category nouns ("invoicing app," "mobile app development") and technology and platform names

## Delete: page and heading patterns

- **Repeated thesis.** The same claim in the hero, the features, the about block, the stats, and the closer. Keep the most specific instance.
- **Beliefs.** "We believe," "we care deeply," "quality isn't an afterthought." Keep policies, because a policy changes what the visitor gets ("no subcontractors," "fixed price only," "we never store card numbers"). Delete attitudes.
- **Slogan headings.** "Clarity by design," "Built for speed," "Where craft meets code." Build the heading from the section's own facts: the feature name, the mechanism, or an outcome with a number. If there's nothing to build from, the section fails the section rules.
- **Slogan tails on category headings.** "Mobile apps that feel at home everywhere." Keep the category noun, since it's the search term, and cut the tail or replace it with a fact from the section.
- **Counted headings.** "Three steps. Tight loop." "Four pillars." Name the content instead. Keep a count only when visitors compare it ("7 integrations").
- **Question headings.** "Tired of chasing payments?" State the answer as a fact.
- **Self-referential FAQ.** A question that quotes the site's own slogan ("What does 'X' mean?") exists to explain the slogan. Delete it along with the slogan and move its facts to the section where they belong.
- **Meta copy and UI narration.** "Explore our features below," "Everything you need to know, in one place," "Pick what you need."
- **Closers.** "Ready to get started?", "The future of X is here," "X, reimagined," summary lines. When the facts end, the section ends. A closing CTA section keeps one line with the action.

## Delete: sentence and word patterns

- **Benefit translation.** A mechanism restated as an abstract benefit ("Spend less time on admin and more on the work you love").
- **Negative parallelism.** "Not just X. Y." "Built for results, not hype." State the positive fact. Keep a "no" or "not" only when it states a limit or difference visitors check ("No account required").
- **Scenario openers.** "It's 2 a.m. and prod is down." Delete them, and never convert one into a story about the company.
- **Founder legend.** "We built the tool we wished existed." Keep a founding reason only if it's specific, and state it once.
- **Fragment runs.** "Fast. Simple. Secure." "Scoped, tested, shipped." Put any facts inside them into one plain sentence and drop the rest.
- **Quips with no fact.** Delete them. A page gets one brand line at most, in the hero, and only if the next sentence says plainly what the product is.
- **Self-grading.** "carefully," "thoughtfully," "rigorously," "world-class," "production-grade." Show the evidence if the page has it. Otherwise delete.
- **Intensifiers of truth.** "real," "actual," "genuine," "truly." On an AI-written page, "real" usually marks a missing fact. Replace it with the specific property the page states ("official," "unmodified," "third-party," "in production") or delete it.
- **Unmeasured quality words.** "seamless," "effortless," "blazing-fast," "robust," "powerful," "intuitive," "sensible defaults." Delete them. If the quality is central to the product (speed for a performance tool), keep the plain word and flag it for a number.
- **Vague quantity.** "countless teams," "most users," "every day." Delete or flag. Idioms and obvious hyperbole aren't frequency claims, so judge by meaning.
- **Absolutes.** "never," "nothing," "zero," "100%," "always." Keep one only when it's literally true as a product guarantee. If the page states the precise version elsewhere (for example, "no telemetry"), use that instead of the absolute ("nothing leaves your device"). If it can't be made precise from the page, flag it.

## Don't create terse slop

Cutting slop tends to produce a second style that's just as easy to spot. Check the output for it.

- No colon reveals ("The result:", "Here's how:", "Three changes:"). Colons are fine for real lists and labels.
- No counted lead-ins unless the count is a fact visitors compare. After cutting list items, recount or drop the count.
- No runs of short sentences for rhythm, and no three-word sentence ending a section. Join related facts.
- No aphorism or tagline as a section ending, and no new closer in place of a deleted one.
- No headings clipped until they're ambiguous. A heading has to read correctly on its own; "One seat per client" reads like a limit even when it wasn't meant as one.
- Keep the site's voice. Solo makers say "I," companies and studios say "we," and the visitor is "you." Never rewrite "we" as "the team" or "[Brand] is built by."
- Don't make the product name the subject of sentence after sentence. Use "it," "we," or an imperative.
- Prefer contractions in consumer copy. If the source never uses them, match it and mention it once as a style note.

## Accuracy rules

These outrank everything else. A shorter page with a false claim is worse than the slop it replaced.

- **Add nothing.** No new fact, number, name, date, event, quote, customer, testimonial, benchmark, or causal claim. Turning a hypothetical scenario into company history adds a fact. So does combining two facts into a claim neither one made.
- **Don't resolve conflicts.** When the page or site gives different values for the same thing, don't pick one and don't dedupe them. Leave both in place, mark each `[CONFLICT C#]`, and list them in the flags.
- **Recount** every list you edited, including counts in headings, stat strips, and intros.
- **Keep qualifiers that make a claim true**: scope ("on macOS," "for teams," "up to 10 seats," "after setup") and status ("beta," "currently," "planned"). Deleting one broadens the claim, which adds a fact.
- **Flag inflated evidence words.** "audited," "certified," "enterprise-grade," "bank-level security," and "guaranteed" imply more than an automated check or a self-assessment. If the page's own description of the process is weaker than the word, flag it.
- **Flag third-party claims.** Statements about competitors, other companies' pricing or licensing, or platform policies need verification and a date. AI-written pages often get these wrong.
- **Handle missing evidence honestly.** You can't know whether a benchmark or figure exists. For a claim central to the product, keep the plain claim and flag `[NEEDS NUMBER]`. For a decorative claim, delete it.

## Page types

- **Hero / first screen.** What it is (category noun plus the key fact), who it's for if the source says, one proof point, and one primary action. Optionally one brand line.
- **Buttons.** Verb plus the action ("Download for Mac," "Book a call"). Never change where a button goes.
- **Feature grid.** One card per distinct capability. The heading names the capability. The body is at most one sentence carrying the mechanism, number, or limit. Cut cards that duplicate others.
- **Stat strip.** Keep numbers that measure something checkable. Cut decorative numbers ("∞ ideas," "100% passion"). Flag numbers that disagree with the rest of the page, and comparisons without a baseline ("3x faster" than what?).
- **Pricing.** Plan, price, billing period, what's included, limits, trial, and cancellation. Cut persona blurbs ("Perfect for growing teams") unless they state a limit.
- **About.** Who (as named), where, since when, what's shipped, where to see proof, and how to reach them. The specific founding reason, once. Policies stay; beliefs go.
- **Services / agency.** For each service: what you build, the stack, and the deliverables. Process sections keep durations, cadence, and artifacts ("a two-week audit that ends in a written report") and drop the adjectives.
- **FAQ.** The first sentence answers the question with yes, no, a number, or the fact. Keep questions about price, compatibility, data, support, limits, cancellation, and getting started. Cut questions no prospective customer would ask, which usually exist to repeat a feature or explain a slogan. One link per answer.
- **Release post / changelog.** List every change. Keep vague items as a short line ("plus bug fixes") instead of dropping them. Effects get a number or a flag. Say how to update. No closer.
- **Page title and meta description.** The title says what it is plus the brand, in about 60 characters. The description gives what it is plus one or two differentiating facts in about 150 characters, with no slogans and no adjective triads.

## Several pages from one site

- Each page must work for someone who lands on it from search and reads nothing else. A page may restate the one-line definition and the facts it depends on, once each.
- The full explanation of a topic lives on one page. Other pages summarize it in a sentence and link there.
- Facts must match across pages. Flag conflicts and never resolve them.
- Keep one voice across the site, and flag mismatches such as "I" on one page and "we" on another for the same solo maker.
- Don't rewrite decorative labels or art-direction text, but flag any that make a claim, repeat copy, or sit on the wrong section.

## Before you return

1. Read the revised page as a first-time visitor arriving from search. By the end of the first screen, do they know what it is, who it's for, and what to do next?
2. Account for every inventory fact: kept, merged, moved (with its link), or removed as a duplicate (with where it survives).
3. Check every output sentence against the inventory. Anything you can't trace to the source is a new claim, so remove it.
4. Recheck counts and qualifiers in every list and sentence you edited.
5. Run the delete patterns and the terse-slop list over your own output.
6. Confirm the voice matches the source.

## Output format

Use this structure every time.

```
## Revised page
Full revised copy in page order, with section labels and heading levels.
Inline flags such as [CONFLICT C1] or [NEEDS NUMBER] stay in the copy until the author resolves them.

## Section decisions
| Section | Decision | Facts it held → where they are now |

## Fact inventory
| ID | Fact | Type | Where it was | Status |
Status: kept (section) / merged (section) / moved (page + link) / duplicate removed (where it survives)

## Flags for the author
[NEEDS NUMBER] / [CONFLICT C#] / [VERIFY THIRD-PARTY] / [INFLATED CLAIM] / [STYLE], one per line with its location

## Change log
Every deletion, rewrite, move, and addition, with the rule that applies.
Allowed additions: headings built from existing facts, links to existing pages, and flags. Nothing else.

## Metrics
Words: before → after
Sections: before → after
Inventory facts: total / kept / merged / moved / duplicate removed / lost (0 unless the user asked to cut it)
New claims introduced: 0
Conflicts flagged:
Slop-pattern hits: before → after
Terse-slop hits in output: (target 0)
```

## Examples

These use an invented invoicing app, Tallyfox, whose hero already says "Invoices, receipts, and payments in one app."

**Feature card**

Before:
> **Clarity by design.**
> We believe getting paid should feel effortless. Tallyfox brings your invoices, receipts, and payments into one calm, intuitive space. Forward a receipt to your Tallyfox inbox address and it's matched to the right invoice. The result? Less admin, more time for the work you love.

After:
> **Receipts matched to invoices**
> Forward a receipt to your Tallyfox inbox address and it's matched to the right invoice.

Why: the slogan heading was rebuilt from the body's mechanism, the belief line went, "one calm, intuitive space" repeats the hero, and the last two sentences are a benefit translation.

**Services heading**

Before:
> **Mobile apps that feel at home everywhere.**
> One codebase. Two stores. Zero compromise. We build in React Native and handle App Store and Google Play releases, including phased rollouts.

After:
> **Mobile apps for the App Store and Google Play**
> We build in React Native from one codebase and handle App Store and Google Play releases, including phased rollouts.

Why: the category noun stays and the slogan tail is replaced with facts from the body. "One codebase" moved into the sentence and "Zero compromise" went. The heading says "App Store and Google Play" rather than "iOS and Android" because that's what the source says.

**FAQ answer**

Before:
> **Can my accountant use Tallyfox?**
> Great question! Collaboration is at the heart of everything we do. You can invite your accountant as a read-only member from Settings → Team. They'll see invoices and receipts but can't edit them or see your bank connection. Visit our Help Center for step-by-step guides, videos, and more.

After:
> **Can my accountant use Tallyfox?**
> Yes. Invite them as a read-only member from Settings → Team. They can see invoices and receipts but can't edit them or see your bank connection. [Help Center]

Why: the answer is now the first word, the opener and the belief went, the limitation is protected, and the Help Center keeps its link but loses its description.

**Stats with a conflict**

Before:
> Hero: Trusted by 12,000 freelancers.
> Stats: 8,000+ happy users · 4.8★ on the App Store · ∞ peace of mind

After:
> Hero: Used by 12,000 freelancers. [CONFLICT C1]
> Stats: 8,000+ users [CONFLICT C1] · 4.8★ on the App Store

Flag: C1, the user count is 12,000 in the hero and 8,000+ in the stats. Confirm one figure for both places.

**Release post, and the terse-slop trap**

Before:
> Version 3.2 is here, and it's a big one! We've completely reimagined recurring invoices, added Stripe payouts, and squashed a bunch of pesky bugs along the way. Recurring invoices now support custom schedules like "every second Tuesday." Update from the App Store today. We can't wait to hear what you think!

Wrong:
> Version 3.2. Two changes: recurring invoices and Stripe payouts. Custom schedules supported. Update today.

The count drops the bug fixes, "Custom schedules supported." is a clipped fragment, and "Update today." is a new closer.

Right:
> Version 3.2 adds Stripe payouts and custom schedules for recurring invoices (for example, "every second Tuesday"), plus bug fixes. Update from the App Store.

**About page**

Before:
> **Our story**
> It's tax season. Receipts are scattered across three inboxes and a shoebox. Sound familiar? We've been there. That's why we built Tallyfox, the tool we wished existed. Today we're a team of six in Lisbon, and we still answer every support email ourselves.

After:
> **About us**
> We're a team of six in Lisbon, and we answer every support email ourselves.

Why: the scenario went without becoming company history, the founder cliché went, and the team size, location, support policy, and "we" stayed.
