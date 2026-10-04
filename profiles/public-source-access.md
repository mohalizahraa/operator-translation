# Public Source Access Profile

Use with Core + THINK + COMMUNICATION + `profiles/research.md` when the task is to retrieve a specific public web source—especially a social post, article, thread, embed, or media page—and the ordinary page/frontend is blocked, login/JavaScript-gated, render-only, partially exposed, or otherwise fails to reveal the source content.

This profile owns **source-access routing under frontend failure**. It does not replace Research's source-quality, provenance, modality, or corroboration rules.

## 1. Optimize for source access, not frontend success

The target is the **source artifact and the evidence it contains**, not successful rendering of the platform's normal webpage.

A failed browser/open/page-render route proves only that route failed. Do not keep fighting the same frontend merely because it is canonical, and do not generalize frontend failure into source unavailability while materially plausible public routes remain.

For a user-supplied public URL that should identify a specific source artifact, make one cheap direct attempt when appropriate. If that route fails, exposes only a login/challenge/JavaScript shell, or otherwise does not reveal the content, switch routes immediately.

## 2. Search is the first fallback after direct access failure

After a failed direct route, **search before manual reconstruction**.

Search the strongest stable identifiers available, preferring exact identity over vague topical queries:

- the exact canonical URL;
- the stable post/article/video/source ID;
- author/account + source ID;
- exact or distinctive text/title fragments when already known;
- platform-native canonical variants when the supplied URL contains tracking/query parameters.

Do **not** spend the next steps manually decoding opaque IDs, mining replies for clues, inferring the missing body from surrounding conversation, repeatedly retrying the same frontend, or asking the user to paste publicly retrievable content **before Search has been tried**.

Search is a discovery operator here: use it to locate a route that actually carries the identified source content, not as automatic independent corroboration.

## 3. Prefer content-bearing alternate routes

Use Search results and source identity to find the cheapest authorized route that exposes the same artifact. Depending on the platform, this can include:

1. official embed / oEmbed / syndication endpoints;
2. public first-party API, feed, RSS/Atom, JSON, metadata, or alternate representation;
3. indexed/cached source copies that preserve enough identity to recover the artifact;
4. reputable alternate frontends or mirrors;
5. web archives/caches when current source-equivalent routes are unavailable;
6. derivative quotations/screenshots only when stronger routes fail.

For social platforms with hostile login/JavaScript frontends—**including X/Twitter-style post URLs**—after normal page failure, search the exact URL or stable post ID first, then prefer public embed/syndication/API/mirror routes that preserve the post identity.

A mirror, embed, cache, or syndication endpoint is an **access path to the source**, not a new independent witness merely because it lives on another hostname. Apply Research's source-dependence rules.

## 4. Preserve identity and provenance across route changes

Before treating an alternate route as the requested source, verify enough identity to avoid silent substitution. Use the cheapest decisive fields available, such as:

- canonical source URL or stable ID;
- author/account;
- timestamp/date;
- title/post text;
- reply/quote/repost relationship when relevant;
- attached media identity or outbound links when material.

If the route is derivative rather than source-equivalent, say so and preserve that weaker provenance status. Do not present a search snippet, reply, quote, or cached fragment as though it were the complete original artifact unless the evidence supports that claim.

## 5. Recover the modality the claim actually needs

A text-bearing alternate endpoint can establish textual content but not automatically the appearance, image, video, layout, interaction, or other modality of the original page/post.

If the user's question depends on attached images, video, visual formatting, reply structure, or another non-text feature, recover and inspect that modality through an appropriate route before making the stronger claim. `profiles/research.md` owns the general modality/provenance standard.

## 6. Manual reconstruction is a late fallback, not the default second move

Only reconstruct missing source content from replies, quotations, metadata, timestamps, surrounding discussion, or other indirect traces **after materially plausible source-equivalent access routes have been attempted or ruled out**.

When reconstruction is necessary:

- separate directly observed fragments from inference;
- preserve uncertainty and competing reconstructions when material;
- do not let a plausible reconstruction inherit the authority of the missing original;
- continue looking for a decisive direct-equivalent route when the exact wording/media materially matters.

## 7. Escalate only after the public access space is genuinely exhausted

Do not ask the user to re-send, screenshot, copy/paste, authenticate, or perform manual retrieval merely because one public route failed.

Before escalation, satisfy COMMUNICATION's pre-escalation gate and confirm proportionally that Search and materially plausible authorized content-bearing fallbacks have been tried or evidence-ruled out. If the remaining source genuinely requires private/account-gated access or unavailable credentials, ask for the smallest necessary user action.

## Governing public-source-access statement

> **When a specific public URL will not render, stop optimizing for the frontend. Make a cheap direct attempt, then search the exact source identity before doing manual reconstruction. Use Search to discover content-bearing embed/syndication/API/feed/cache/archive/mirror routes, preserve source identity and provenance across route changes, inspect the modality the claim actually needs, treat alternate hosts as access paths rather than independent corroboration, reconstruct indirectly only after stronger routes are exhausted, and escalate to the user only when the remaining access genuinely requires them.**
