---
name: antislop-copy
description: Make consumer-facing website copy as short as possible without inventing or bending anything. Use this whenever the user wants to cut, tighten, shorten, de-slop, audit, clean up, or rewrite copy for a homepage, landing page, feature section, pricing page, about page, services page, FAQ, product page, release post, or page title and meta description, including when they only say a page feels long, bloated, generic, repetitive, salesy, or AI-written. For website and marketing copy, use this instead of the humanizer skill. Not for technical docs, specs, API references, or legal text.
---

# antislop-copy

## Goal

Write the shortest copy that still gets the right visitor to act. Long pages look machine-made at a glance, and every extra line hides the ones that matter.

A true fact can still be slop. If a first-time visitor wouldn't miss it, cut it, however accurate it is. A grid of eight features usually needs three.

Cutting is safe. Adding and bending aren't. You may cut any line that fails the test below, but never add a fact or change what one says.

Get shorter by saying fewer things, not by squeezing what's left. Cutting a slop word inside a sentence is fine. Stripping articles, verbs, and connectors to save words isn't, because it produces a second AI style (see "Don't trade slop for terse slop").

If the humanizer skill is also loaded, its "rewrite, don't delete" rule doesn't apply to web pages. This skill decides what stays.

## What the page must still answer

Visitors arrive with six questions. What is it? Is it for me? Will it work for me (platform, requirements, limits)? What does it cost? Why should I believe it? How do I start?

Keep the shortest answer the source gives to each. Landing and product pages need all six, and other pages need the ones their visitors came for. Everything else competes for what's left, and most of it loses. If the source never answers a question, say so under Flags. Don't write an answer yourself.

## Budgets

Use these unless the user gives their own. Going over is fine when you can give a one-line reason, such as every item being something buyers compare. Never pad to reach a budget.

- **Hero.** Headline up to 10 words, subhead up to 25, and one primary button named for its action ("Download for Mac"). The subhead can name the concrete problem the product solves, once, if the source states it.
- **Feature grid.** 3 cards, 6 at most. A card is a heading plus one sentence of 15 words or fewer, or the heading alone.
- **Other lists** (integrations, technologies, platforms, steps). 5 items. Name the ones buyers filter on, then link to the full list or give the total if the source has one.
- **Stats.** 3 numbers, each measuring something checkable.
- **Testimonials.** 3, preferring ones with a name and a specific result.
- **FAQ.** Only questions a buyer asks before buying: price, compatibility, data, support, limits, cancellation, getting started. The first sentence answers, and two sentences is the limit.
- **About.** Who, where, since when, what's shipped, and how to reach you, in about 60 words.
- **Pricing.** Plan, price, billing period, what's included, limits, trial, and cancellation. This is the one page type where most facts stay. Cut persona blurbs ("Perfect for growing teams").
- **Section intros** ("Everything you need to get paid"). Cut them.
- **Page title and meta description.** The title is what it is plus the brand, about 60 characters. The description is what it is plus one fact that sets it apart, about 150 characters.
- **Whole page.** Expect an AI-written page to lose half its words or more. If you cut less than a third, you're protecting too much, so go through it again.

## How to cut

1. **Read everything**: headings, cards, stats, buttons, FAQ, captions, footer lines, and any other pages from the site the user gives you.
2. **Delete whole sections first.** A section goes if it repeats another, answers none of the six questions, or only fills a layout slot. Common cases are values and mission blocks, "why choose us" grids, "how we work" sections that restate the hero, closing essays, and decorative stat strips.
3. **Rank whatever is over budget.** Keep deal-breakers first (price, platform, requirements, hard limits, data handling, cancellation), then what this product does that others in its category don't, then the strongest proof (numbers with units, named customers, licenses, links). Table stakes, the features every product in the category has, are the first to cut unless visitors would doubt this one has them.
4. **Test each remaining sentence.** If it disappeared, would a first-time visitor understand less, trust less for a concrete reason, or lose something they need to act? If not, cut it. If you're unsure, cut it and put any fact it held on the cut list.
5. **Rewrite only to join what survived** into plain sentences, or to build a heading from the section's own facts.
6. **Check your work and report** as described below.

## What always goes

Match on meaning, not keywords. "For the tenth time" is an idiom, not a count.

- **Repeats.** The same point in the hero, features, about, FAQ, and closer. Keep the most specific version once. Different wording for one fact is still a repeat ("configs are isolated," "instances share no state," "your work setup never touches your personal one").
- **Beliefs and mission statements.** "We believe," "quality isn't an afterthought," "the compiler is a colleague." Keep a policy only when it changes what the buyer gets ("fixed price," "no subcontractors").
- **Slogans.** Slogan headings ("Built to scale," "Zero ceremony") and slogan tails on category headings ("Mobile apps that feel at home everywhere" becomes "Mobile apps," which keeps the noun people search for). A page gets one brand line at most, in the hero, and only if the next line says plainly what the product is.
- **Benefit translations** of a mechanism the page already stated ("Spend less time on admin and more on the work you love").
- **Framing.** Scenario openers ("It's 2 a.m. and prod is down"), founder legends ("the tool we wished existed"), question headings, counted headings ("Four pillars"), "not just X, it's Y," UI narration ("Explore our features below"), and closers ("Ready to get started?").
- **Self-praise and unmeasured quality words** such as seamless, powerful, robust, intuitive, world-class, blazing-fast, carefully, and rigorously. If that quality is the product's main claim, like speed for a performance tool, keep the plain word and add [NEEDS NUMBER].
- **Docs-grade detail** on a marketing page (command references, flags, config). Leave one line and a link to the docs, or move it to the cut list if there are no docs.
- **Extra links.** One per item.

## Accuracy

These rules beat the budgets. A short page with a false line is worse than the slop it replaced.

- **Add nothing.** No new fact, number, name, event, quote, customer, or claim. Turning a hypothetical into company history counts as adding, and so does joining two facts into a claim neither one made.
- **Don't leave a claim broken.** If a cut would leave a line false, broader, or unsupported because it lost its scope, status, or source ("on macOS," "beta," "40 customers told us"), cut that line too or keep the words that make it true.
- **Fix counts.** After cutting list items, correct or drop any number that counted them ("Three changes:", "8 integrations").
- **Don't pick between conflicting values.** If the site gives two values for one thing, keep one mention showing both, like "[7 or 8? CONFLICT]", and list it under Flags.
- **Leave some things alone.** Don't alter legal text, prices, or the words inside quotes and testimonials, though cutting a whole quote is fine. Never change where a button goes.
- **Release notes keep every change**, each as a short line. A vague one becomes "plus bug fixes," not nothing.
- **Mark what you can't check.** Add [VERIFY] to claims about competitors or platform policies, to absolutes about data or security ("nothing leaves your device"), and to words like "audited," "certified," or "bank-level" that the page doesn't back up.

## Don't trade slop for terse slop

Cut copy has its own tells, so check your output for them.

- No colon reveals ("The result:", "Here's how:") and no counted lead-ins ("Three changes:").
- No runs of short sentences for rhythm, no fragment triplets ("Fast. Simple. Secure."), and no section ending on a three-word line.
- No new closer or tagline in place of a deleted one. When the facts end, stop.
- Headings must read correctly on their own. "One seat per client" reads as a limit even if it wasn't meant as one.
- Keep the site's voice. Solo makers say "I," companies say "we," and the reader is "you." Never swap "we" for "the team" or "[Brand] is built by."
- Don't make the product name the subject of sentence after sentence.
- Use contractions unless the site never does, and don't use em dashes.

## Several pages from one site

Each page has to make sense to someone who lands on it from search and reads nothing else, so it can restate the one-line definition. Explain any topic fully on one page only, and give other pages a sentence and a link. Facts must match across pages, so flag every mismatch.

## Check before returning

- Read the first screen as a stranger from search. Do they know what it is, who it's for, and what to do next?
- Trace every sentence to the source. Anything you can't trace is a new claim, so remove it.
- Recheck counts and qualifiers in every line you edited.
- Run "What always goes" and the terse-slop list over your own output.
- Make sure every flag and note describes the copy as it now reads.

## Output

Return these four parts and nothing more unless the user asks. The report shouldn't be longer than the page, and every extra note is one more thing that can be wrong.

```
## Revised copy
In page order, with section labels. Inline flags stay in place.

## Flags
One line each: [CONFLICT], [NEEDS NUMBER], [VERIFY], or a question the page never answers.

## Cut list
Concrete facts you cut (features, numbers, terms, names), a few words each, grouped by section, so the author can restore any of them. Skip slogans and filler.

## Words
Before → after. Count with a tool if you have one.
```

## Examples

These use an invented invoicing app, Tallyfox, whose standout feature is matching receipts to invoices.

**A feature grid over budget**

Before:
> **Everything you need to get paid**
> Powerful features designed to simplify every step of your invoicing workflow.
> **Smart invoices.** Create beautiful, professional invoices in seconds with customizable templates.
> **Receipt matching.** Forward a receipt to your Tallyfox inbox address and it's matched to the right invoice.
> **Recurring billing.** Set it and forget it. Invoices go out on your schedule, like every second Tuesday.
> **Multi-currency.** Bill clients in 30+ currencies with live exchange rates.
> **Stripe payouts.** Accept cards through Stripe, with payouts in 2 business days.
> **Real-time insights.** Beautiful dashboards give you a clear view of your business health.
> **Bank-level security.** Your data is protected with industry-leading encryption.
> **Always-on support.** Our friendly team is here for you every step of the way.

After:
> **Card payments through Stripe**
> Payouts in 2 business days.
> **30+ currencies with live exchange rates**
> **Receipts matched to invoices**
> Forward a receipt to your Tallyfox inbox address and it's matched to the right invoice.

Cut list: recurring invoices on custom schedules; invoice templates; dashboards.

Why: the heading and intro described the section, not the product. How you get paid and which currencies work are deal-breakers, and receipt matching is the differentiator. Templates, recurring billing, and dashboards are standard in invoicing apps, so they wait on the cut list. The security and support cards had no fact under their adjectives.

**A cut that breaks a claim**

Before:
> We interviewed 40 freelancers before building Tallyfox. Most told us they lose a full day every month chasing late payments. That's why Tallyfox sends automatic reminders.

Wrong:
> Freelancers lose a full day every month chasing late payments. Tallyfox sends automatic reminders.

Cutting the source turned one survey answer into a universal fact.

Right:
> Tallyfox sends automatic reminders for late payments.

If the finding is the page's main argument, keep its source instead: "Most of the 40 freelancers we interviewed told us they lose a full day every month chasing late payments."

**The terse-slop trap**

Before:
> Version 3.2 is here, and it's a big one! We've completely reimagined recurring invoices, added Stripe payouts, and squashed a bunch of pesky bugs along the way. Recurring invoices now support custom schedules like "every second Tuesday." Update from the App Store today. We can't wait to hear what you think!

Wrong:
> Version 3.2. Two changes: recurring invoices and Stripe payouts. Custom schedules supported. Update today.

The count drops the bug fixes, "Custom schedules supported." is a clipped fragment, and "Update today." is a new closer.

Right:
> Version 3.2 adds Stripe payouts and custom schedules for recurring invoices, like "every second Tuesday," plus bug fixes. Update from the App Store.

**About page**

Before:
> **Our story**
> It's tax season. Receipts are scattered across three inboxes and a shoebox. Sound familiar? We've been there. That's why we built Tallyfox, the tool we wished existed. Today we're a team of six in Lisbon, and we still answer every support email ourselves.

After:
> **About us**
> We're a team of six in Lisbon, and we answer every support email ourselves.

The scenario and the founder cliché went without turning into company history. Team size, location, the support policy, and "we" stayed.
