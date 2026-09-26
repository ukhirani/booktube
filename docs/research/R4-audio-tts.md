# R4 — Audio and TTS landscape

**Issue:** ukhirani/booktube#6 · **Branch:** `research/R4` · **Researched:** 2026-09-26
**Scope:** external facts only. Five distinct features are kept separate throughout and are **not** treated as equivalent:

1. **AI-generated audio articles** (short, BookTube-authored or licensed text)
2. **AI-generated summaries**
3. **Creator-recorded audio** (user's own voice)
4. **User-provided audiobooks** (uploads of existing recordings)
5. **Full AI narration of a whole copyrighted book**

All prices are list prices as published on the cited pages, checked September 2026. Where a claim rests on a secondary source it is marked *(secondary)*.

---

## 1. TTS quality tiers, latency and cost

### 1.1 Metered cost by provider (per 1,000 characters ≈ per 1M characters)

| Provider | Tier | Price | Source |
|---|---|---|---|
| ElevenLabs (API) | v3 (expressive, 5,000-char limit) | **$0.10 / 1k chars** | https://www.elevenlabs.io/pricing/api |
| ElevenLabs (API) | v3 Conversational (low latency ~280 ms) | **$0.05 / 1k chars** | https://www.elevenlabs.io/pricing/api |
| ElevenLabs (API) | v2 Multilingual (10,000-char limit) | **$0.10 / 1k chars** | https://www.elevenlabs.io/pricing/api |
| ElevenLabs (API) | Flash / Turbo (~75 ms claimed, 40,000-char limit) | **$0.05 / 1k chars** | https://www.elevenlabs.io/pricing/api |
| OpenAI | tts-1 | **$15 / 1M chars** ($0.015 / 1k) | https://developers.openai.com/api/docs/models/tts-1 |
| OpenAI | tts-1-hd | **$30 / 1M chars** ($0.030 / 1k) | https://platform.openai.com/docs/models/tts-1 |
| Google Cloud | Standard & WaveNet voices | **$4 / 1M chars** (4M chars/mo free) | https://cloud.google.com/text-to-speech/pricing |
| Google Cloud | Neural2 | **$16 / 1M chars** | same |
| Google Cloud | Chirp 3: HD | **$30 / 1M chars** (1M free/mo) | same |
| Google Cloud | Studio | **$160 / 1M chars** | same |
| Google Cloud | Gemini 2.5 Flash-Lite TTS | $0.50 / 1M text tokens + $10 / 1M audio tokens (25 audio tokens/sec) | same |
| Azure Speech | Neural / Neural HD | **$15 / 1M chars** (500k chars/mo free); commitment tiers $12 → $7.50 / 1M | https://azure.microsoft.com/pricing/details/speech/ |
| Azure Speech | Custom (professional) voice | **$24 / 1M chars** | same |
| Amazon Polly | Standard | **$4 / 1M chars** (5M chars/mo free) | https://aws.amazon.com/polly/pricing/ |
| Amazon Polly | Neural | **$16 / 1M chars** | same |
| Amazon Polly | Generative | **$30 / 1M chars** | same |
| Amazon Polly | Long-Form (audiobook-oriented) | **$100 / 1M chars** | same |
| Self-hosted open weights | Kokoro-82M | $0/char — Apache-2.0; you pay only compute | https://huggingface.co/hexgrad/Kokoro-82M |
| Self-hosted open weights | Piper | $0/char — MIT | https://github.com/rhasspy/piper/blob/master/LICENSE.md |

**Rule of thumb for conversion:** Amazon Polly's own pricing examples put 1 million characters at **≈ 23 h 8 min** of audio, a typical news article (6.5k chars) at **≈ 9 minutes**, and *Adventures of Huckleberry Finn* (≈ 600k chars) at **≈ 13 h 50 min** (https://www.amazonaws.cn/en/polly/pricing, AWS-published examples; identical rates on https://aws.amazon.com/polly/pricing/).

**Derived unit costs per hour of finished audio** (1M chars ≈ 23 h → ≈ 43.5k chars/h; illustrative, computed from the table above):

- Google WaveNet / Polly Standard @ $4/1M ≈ **$0.17 per audio-hour**
- OpenAI tts-1 @ $15/1M ≈ **$0.65 per audio-hour**
- Polly Neural / Google Neural2 @ $16/1M ≈ **$0.70 per audio-hour**
- ElevenLabs v2/v3 @ $0.10/1k ≈ **$4.35 per audio-hour**; Flash @ $0.05/1k ≈ **$2.18 per audio-hour**
- Polly Long-Form @ $100/1M ≈ **$4.35 per audio-hour**

### 1.2 Subscription shape (ElevenLabs, the most widely quoted consumer tier)

Free 10k credits/mo (≈10 min high-quality TTS), **non-commercial, attribution required**; Starter $5/mo (30k credits) is the first tier with a commercial licence; Creator $22/mo (100k credits, 192 kbps); Pro $99/mo (500k credits, 44.1 kHz PCM via API); Scale $330/mo (2M credits); Business $1,320/mo (11M credits). One credit ≈ one character for v1/v2 Multilingual models; 0.5–1 credit per character for Flash/Turbo models. (https://www.elevenlabs.io/pricing, checked Sep 2026.)

### 1.3 Latency (mostly irrelevant for batch narration, critical for any interactive feature)

- Vendor claims: ElevenLabs Flash/Turbo "~75 ms", v3 Conversational "~280 ms" (https://www.elevenlabs.io/pricing/api).
- Independent measurement (Coval TTS benchmark, 30-day averages, Sep 2026): time-to-first-audio p50 ranges ~113 ms (Fluxions vui) → 256 ms (Rime Mist v3) → 274 ms (Cartesia Sonic 3.5) → 393 ms (ElevenLabs Flash v2.5) → 404 ms (ElevenLabs v3) → 516 ms (Google Chirp 3 HD). Coval notes a typical voice-agent latency budget of **200–300 ms TTFA**. (https://benchmarks.coval.ai/models/chirp-3-hd, https://www.coval.ai/blog/benchmarks)
- Quality arena (Artificial Analysis Speech Arena, Jun 2026): top five models separated by only **24 Elo** — Fun-Realtime-TTS 1,219 ($27.59/1M), Gemini 3.1 Flash TTS 1,214 ($18.3/1M), Inworld Realtime TTS-2 1,209, Cartesia Sonic 3.5 1,203 ($39/1M). (https://artificialanalysis.ai/articles/fun-realtime-tts-new-text-to-speech-model-topping-artificial-analysis-leaderboard)
- For context: a TTS-as-a-product comparison puts Google Cloud and ElevenLabs at the top for voice quality, Cartesia/Rime for sub-200 ms streaming, Amazon/Azure for SSML control *(secondary)* (https://www.assemblyai.com/blog/top-text-to-speech-apis).

### 1.4 Quality tiers, summarised

1. **Frontier / expressive** (ElevenLabs v3, Gemini TTS, Fun-Realtime-TTS, Sonic): ~$18–39 per 1M chars, promptable emotion, multi-speaker, arena-top.
2. **Mainstream neural** (OpenAI tts-1/tts-1-hd, Google WaveNet/Neural2, Azure Neural, Polly Neural): $4–30 per 1M chars, adequate narration, SSML or instructions control.
3. **Legacy/parametric & self-hosted small models** (Google Standard, Polly Standard, Piper): $4/1M or free-but-compute; audible quality gap.
4. **"Audiobook-grade" is a marketing tier, not a spec**: Polly's dedicated **Long-Form engine at $100/1M** exists precisely because short-form neural voices degrade over hours; audiobook-specific quality claims are made by vendors *(secondary: https://www.codesota.com/speech/best-for-audiobooks)*.

---

## 2. Voice licensing, ownership, commercial use, voice-cloning law

### 2.1 Who owns the audio output

- **OpenAI:** "As between you and OpenAI … you … own the Output. We hereby assign to you all our right, title, and interest, if any, in and to Output." (https://openai.com/policies/terms-of-use/)
- **Google Cloud:** "As between Customer and Google, Google does not assert any ownership rights in any new intellectual property created in the Generated Output." (https://cloud.google.com/terms/service-terms)
- **ElevenLabs:** "Except as expressly set forth herein, as between you and ElevenLabs, you retain all rights in and to your Output." — but **free-tier use is non-commercial only**, paid plans carry the commercial licence, and content generated *outside* a paid subscription can never be used commercially (https://www.elevenlabs.io/terms-of-use, https://help.elevenlabs.io/hc/en-us/articles/13313564601361).
- **Amazon Polly:** "no restrictions on storage and reuse of voice output"; generated speech can be cached and replayed at no additional cost (https://aws.amazon.com/polly/pricing/, https://www.amazonaws.cn/en/polly/faqs).
- **Contractual caveat:** you own the *Output* only "to the extent permitted by applicable law" — output that is purely machine-generated may not be a protectable copyright work (see §2.4).

### 2.2 Who owns the *voice*

- **ElevenLabs:** uploading your voice grants ElevenLabs a **perpetual, irrevocable, royalty-free, worldwide, sub-licensable** licence to use it "to provide and improve the Services and to develop new services and products" (with a promise not to commercialise your voice standalone without permission). User Voice Models carry a similar licence back to ElevenLabs. (https://www.elevenlabs.io/terms-of-use)
- You must have the rights/consent for any voice you submit (ElevenLabs "Necessary Rights" clause; OpenAI Terms: "You represent and warrant that you have all rights, licenses, and permissions needed to provide Input").

### 2.3 Voice cloning — provider consent gates (all first-party)

- **OpenAI:** exposes a first-class `POST /audio/voice_consents` API — "A consent recording used to authorize creation of a custom voice" (https://developers.openai.com/api/reference/resources/audio/subresources/voice_consents).
- **Azure Custom Neural Voice / Personal Voice:** Limited Access feature (registration + approval, ~10 business days); customers "must warrant that they have obtained explicit written permission from voice talent"; a spoken **consent statement recording is required and speaker-verified against the training data**; deployers "must disclose the synthetic nature of the service to users and support a feedback channel." (https://learn.microsoft.com/en-us/azure/ai-services/speech-service/personal-voice-create-consent, https://github.com/MicrosoftDocs/azure-ai-docs/blob/main/articles/foundry/responsible-ai/speech-service/text-to-speech/limited-access.md, https://learn.microsoft.com/en-us/azure/foundry/responsible-ai/speech-service/text-to-speech/disclosure-voice-talent)
- **ElevenLabs:** Instant Voice Cloning from Starter tier; Professional Voice Cloning from Creator tier; ElevenAPI requires a consent attestation for every clone *(secondary: https://elevenlabs.io/blog/voice-cloning-api)*.
- **Speechify API:** cloning "from a 10-30 second sample, with verified consent from the speaker" (https://docs.speechify.ai/).

### 2.4 Copyright status of the works themselves

- **US Copyright Office, Copyright and AI Part 2 (Copyrightability, Jan 2025):** wholly AI-generated content is **not copyrightable**; a work is protectable only to the extent it has sufficient human authorship; AI-generated elements are filtered out of infringement analysis (summarised at https://authorsguild.org/news/us-copyright-office-ai-report-part-2-what-authors-should-know). Consequence: an audio file produced entirely by TTS may be **unprotected by copyright in the US**.
- **Text ≠ audio rights.** In *AAP v. Audible* (2022) publishers sued because Audible added machine-generated *text* to audiobooks — "Text and audio are different book markets, and Audible is licensed only for audio" (https://authorsguild.org/news/authors-guild-issues-statement-supporting-aaps-lawsuit-against-audible).
- **Authors Guild model clauses (2023):** publishers need the author's **written consent** to use AI-generated audiobook narration; the model audio-book clause reads "Publisher shall not permit or cause the Work to be narrated by artificial intelligence technologies or other non-hu[man]…" (https://authorsguild.org/news/ag-introduces-new-publishing-agreement-clauses-concerning-ai).
- Training-data exposure: the Authors Guild/OpenAI class action (filed Sep 2023) and the **$1.5 bn Anthropic settlement** — largest copyright settlement in history (https://authorsguild.org/news/authors-go-to-washington-capitol-hill).

### 2.5 Voice-cloning / digital-replica legal status

- **US state law:** at least seven states have enacted AI voice/digital-replica statutes since 2024 — Tennessee (ELVIS Act), California, Illinois, Montana, Arkansas, Washington, Pennsylvania (https://www.recordinglaw.com/us-laws/deepfake-laws/ai-voice-cloning-laws *(secondary)*); consent is the operative standard — cloning your own voice or with documented consent is lawful, cloning a real person without it is not (https://rinzara.com/articles/is-ai-voice-cloning-legal-2026 *(secondary)*).
- **US federal:** NO FAKES Act of 2025 (S.1367, introduced 2025-04-09) would create a federal digital-replica right with notice-and-takedown; a successor **NO FAKES Act of 2026 (S.4591, 2026-05-20)** is pending — **not yet law** (https://www.congress.gov/bill/119th-congress/senate-bill/1367, https://www.congress.gov/bill/119th-congress/senate-bill/4591).
- **EU:** AI-generated audio that resembles real people can be a "deep fake" under Art. 3(60) AI Act; deployer disclosure obligations apply (see §6).

---

## 3. Article-length narration vs full-book narration

### 3.1 Per-request character limits (the chunking problem)

| Provider | Per-request input limit | Source |
|---|---|---|
| OpenAI `/audio/speech` | **4,096 characters** | https://developers.openai.com/api/reference/resources/audio/subresources/speech/methods/create |
| Google Cloud TTS | **5,000 bytes** (content limit "cannot be increased") | https://docs.cloud.google.com/text-to-speech/quotas |
| Amazon Polly | **3,000 chars realtime; 100,000 chars asynchronous** | https://docs.aws.amazon.com/ai/responsible-ai/amazon-polly/overview.html |
| ElevenLabs | v3 **5,000**; v2 Multilingual **10,000**; Flash/Turbo **40,000** | https://www.elevenlabs.io/pricing/api |
| Speechify | speech 2,000; streaming 20,000 | https://docs.speechify.ai/build/api-reference/get-started/api-limits |
| A typical long-form wrapper (Verbatik) | 25,000 max, auto-chunks "typically 2,500–4,500" | https://docs.verbatik.com/docs/api/text-to-speech |

**Consequences:** an article (1,500 words ≈ 9,000 chars) already exceeds most single-request limits; a full book (≈ 90k words ≈ 540k chars) requires **14–180+ chunks** depending on provider. Long-form generation therefore means: sentence-boundary chunking → parallel synthesis → concatenation/re-encode → consistency review (Voices drift, pauses differ, pronunciation varies across chunks). Free wrappers do exactly this (Verbatik, Speechify docs above), which is the standard engineering shape regardless of vendor.

### 3.2 Money: article vs book (computed from §1.1, 1M chars ≈ 23 h audio)

| Item | Chars | Audio | Cheapest cloud (Google WaveNet/Polly Std @ $4/1M) | Mid (Polly Neural/OpenAI @ $15–16/1M) | ElevenLabs v2/v3 ($0.10/1k) |
|---|---|---|---|---|---|
| Article (1,500 words) | ~9,000 | ~13 min | $0.036 | $0.14 | $0.90 |
| Summary (250 words) | ~1,500 | ~2 min | $0.006 | $0.02 | $0.15 |
| Whole book (90k words) | ~540,000 | ~12.4 h | **$2.16** | **$8.64** | **$54.00** |

**Metered synthesis is never the dominant cost of a full book.** Human audiobook production is: ACX estimates **~6.2 hours of work per finished audio hour** (2 h recording + 3 h editing + 1.2 h review) (https://help.acx.com/s/article/producing-and-recording-your-audiobook), i.e. ~77 person-hours for the 12.4-hour title above — versus a few dollars of API spend. Where vendors charge more for long-form (Polly Long-Form $100/1M), the premium buys *quality/consistency and the async 100k-char job*, not raw compute.

### 3.3 Requirements that differ between the two

| Requirement | Article/summary (short) | Full book (long) |
|---|---|---|
| Chunking | often 1–2 requests | dozens–hundreds; cross-chunk voice/prosody consistency |
| Pronunciation control | optional (OpenAI `instructions`, SSML) | mandatory: names, acronyms, dialogue; lexicons/phonemes (Polly custom lexicons, SSML `<sub>/<phoneme>`, Google SSML — https://docs.cloud.google.com/text-to-speech/docs/ssml) |
| Structure | one file or streamed segments | chapter files (ACX: **max 120 minutes per file**), opening/closing credits naming title/author/**narrator**, 5-minute retail sample (https://help.acx.com/s/article/what-are-the-acx-audio-submission-requirements) |
| Rights | text you wrote or licensed for audio | **audio rights must be licensed separately from text rights** (§2.4); author consent clauses for AI narration |
| QC | spot check | full listen-through + errata pass (ACX-equivalent review ≈ 1.2 h per finished hour) |
| Latency | interactive/streaming possible | batch/offline — latency irrelevant |
| Disclosure | "AI-generated voice" label (§6) | same, plus platform-specific AI-narration labelling |

---

## 4. Text/audio synchronisation, chapters and bookmarks

### 4.1 Word/sentence-level alignment (the sync primitive)

- **Amazon Polly "speech marks":** a separate request returns line-delimited JSON — `time` (ms from audio start), `type` (`sentence`/`word`/`viseme`/`ssml`), `start`/`end` (**byte** offsets into input text), `value`. Speech marks are billed as characters and return *no* audio; the same voice must be used for marks and audio or the metadata will not match. (https://docs.aws.amazon.com/polly/latest/dg/output.html, https://docs.aws.amazon.com/polly/latest/dg/using-speechmarks.html)
- **Azure:** synthesizer raises **WordBoundary events** carrying `AudioOffset` (hundred-nanosecond units, 10,000 HNS = 1 ms) and `TextOffset`/`WordLength` — the equivalent of Polly speech marks (https://learn.microsoft.com/en-us/answers/questions/531771/text-to-speech-with-timestamp-in-json-format).
- **Speechify API:** "Speech marks — word-level timestamps for highlighting, captions, and audio-text sync" (https://docs.speechify.ai/).
- Alignment is also obtainable post-hoc by forced alignment of the audio, but the provider-side marks above are the cheap path.

### 4.2 Standards for read-along and chapter structure

- **EPUB 3 Media Overlays** — a SMIL 3 subset binding `<audio clipBegin clipEnd>` clips to text fragments (`<par>` = one sentence+audio pair, `<seq>` = chapter structure). Produces read-aloud/highlight sync, and reading systems must "start playback … based on the ID of the navigation point target", which is how **resume-at-bookmark** works. Standardised as **ISO/IEC TS 30135-5:2014** (https://www.w3.org/publishing/epub32/epub-mediaoverlays.html, https://www.iso.org/standard/63570.html, https://www.w3.org/TR/2021/WD-epub-rs-33-20210525)
- **MP3 chapter frames: ID3v2 CHAP + CTOC** (addendum v1.0, 2005-12-02) — start/end times in **milliseconds from file start**, optional embedded TIT2/TIT3/URL sub-frames; CTOC supplies ordered child element IDs. Compatible with ID3v2.3/v2.4 (https://id3.org/id3v2-chapters-1.0, http://id3.org/Developer_Information)
- **Podcast chapters:** `podcast:chapters` RSS tag pointing at an external **JSON chapters file** — chapters editable after publishing, readable by web players that cannot see ID3 tags, "compatible with normal ID3 tags" (https://podcasting2.org/docs/podcast-namespace/tags/chapters)
- **Audiobook delivery shape (ACX as the market reference):** ≤120 min per file, secondary headers for continuity, opening credits naming title/author/narrator, closing credits indicating finality, 5-minute retail sample (https://help.acx.com/s/article/what-are-the-acx-audio-submission-requirements)

### 4.3 Bookmarks

Bookmarking is application state (position + revision of the audio), but its *interchange* patterns are the ones above: EPUB Media Overlay navigation-point resumption, ID3 CHAP start times, or external JSON chapter files. Note that regenerating or re-chunking an audio item **invalidates stored offsets** — timestamps must be keyed to a specific audio artefact version.

---

## 5. Streaming, storage and offline delivery costs

### 5.1 Storage (cheap)

- **Amazon S3 Standard: $0.023/GB-month** (first 50 TB, us-east-1) (https://aws.amazon.com/s3/pricing/, https://www.devzero.io/blog/aws-s3-pricing *(secondary, verified against AWS page)*)
- Audio sizes: 1 h at 64 kbps ≈ **28.8 MB**; 1 h at 128 kbps ≈ **57.6 MB** (arithmetic).
- ⇒ 1,000 hours of 64 kbps audio ≈ 28.8 GB ≈ **$0.66/month** to store. Storage is a rounding error.

### 5.2 Egress (the recurring cost)

- **S3 direct to internet: ~$0.09/GB** first tier (https://www.finout.io/blog/cloud-storage-pricing-comparison *(secondary)*; AWS pricing pages).
- **CloudFront: $0.085/GB** (US/EU, first 10 TB/month; $0.080 next 40 TB), **1 TB/month always free**, S3→CloudFront origin transfer free, HTTPS requests $0.01/10k (https://aws.amazon.com/cloudfront/pricing/, https://egresscost.com/aws/cloudfront-pricing *(secondary, verified to AWS)*).
- **Cloudflare R2: $0.00/GB egress**, storage $0.015/GB-month (https://egresscost.com/cloudflare *(secondary)*).
- ⇒ Playing 1 hour at 64 kbps = 0.0288 GB ≈ **$0.0025 of egress** at CloudFront tier-1 rates (≈ $0.0026 at R2-with-storage, ≈ $0.0026 direct S3). Streaming an hour of audio costs roughly the same as generating ~30–100 seconds of it on the cheapest TTS tier — egress and synthesis are within an order of magnitude of each other per listening-hour, which is **not** true for video.
- **Offline delivery (downloads):** one egress event per download instead of per play; identical per-GB rates; the cost profile shifts from repeated streaming to one-shot delivery plus device storage. (No provider-specific DRM pricing was sourced in this pass; treat DRM as unexamined.)

---

## 6. AI-disclosure norms and platform labelling requirements

### 6.1 EU AI Act — Article 50 (in force since 2 August 2026)

- **Providers** of systems generating synthetic audio must mark outputs **in a machine-readable format, detectable as artificially generated**; marking must be implemented at model level and providers must supply free detection tools.
- **Deployers** must disclose AI-generated audio that constitutes a **deep fake**, at first exposure, clearly and distinguishably; artistic/creative/satirical works get a lighter-touch disclosure that must not hamper enjoyment.
- Timing: Article 50 applies **from 2 August 2026**; systems already on the market before that date have until **2 December 2026** for the Art. 50(2) marking duty (AI Omnibus). Penalties up to **€15 m or 3% of worldwide turnover**.
- Commission **Code of Practice on Transparency of AI-generated Content published 10 June 2026** (voluntary; provides EU icons/text labels); Commission **guidelines adopted 20 July 2026**.
  Sources: https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-50 · https://digital-strategy.ec.europa.eu/en/faqs/transparency-obligations-under-article-50-ai-act · https://digital-strategy.ec.europa.eu/en/policies/code-practice-ai-generated-content · https://artificialintelligenceact.eu/transparency-rules-article-50/ · https://digital-strategy.ec.europa.eu/en/news/commission-starts-enforcing-ai-act-rules-and-new-transparency-requirements-2-august

### 6.2 California AI Transparency Act (SB 942, as amended by AB 853)

- Covered providers (≥1M monthly users) must offer a free public **AI detection tool**, offer users a **manifest disclosure** (visible label) and embed a **latent disclosure** (metadata: provider name, model name/version, timestamp, unique ID) in generated **image, video or audio** content; original 1 Jan 2026 operative date **delayed to 2 Aug 2026** by AB 853, with large-online-platform provenance duties from 1 Jan 2027.
  Sources: https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=202320240SB942 · https://legiscan.com/CA/text/AB853/id/3273369 · https://epic.org/california-legislative-session-roundup-which-key-privacy-and-ai-bills-were-enacted-and-which-were-vetoed/

### 6.3 Provider-imposed disclosure duties on *their* customers

- **OpenAI:** "Our usage policies require you to provide a clear disclosure to end users that the TTS voice they are hearing is **AI-generated and not a human voice**." (https://developers.openai.com/api/docs/guides/text-to-speech)
- **Azure:** custom-voice deployers must "disclose the synthetic nature of the service to users and support a feedback channel" (https://github.com/MicrosoftDocs/azure-ai-docs/blob/main/articles/foundry/responsible-ai/speech-service/text-to-speech/limited-access.md)
- **ElevenLabs free tier:** published free-plan content must carry "elevenlabs.io" or "11.ai" **in the title** (https://help.elevenlabs.io/hc/en-us/articles/13313564601361)
- **Storytel:** user content must not contain "AI-generated or manipulated content that is misleading or deceptive **without appropriate disclosure**" (https://authors.storytel.com/terms)
- **Authors Guild position:** label AI-generated works and identify when a significant portion of a work was AI-generated (https://authorsguild.org/advocacy/artificial-intelligence/faq)

⇒ A platform that *hosts* AI-narrated audio inherits disclosure duties in the EU (deployer) and in California (provenance/labels), plus whatever its TTS vendor contractually requires. Disclosure is cheap and unconditional; it is not opt-in.

---

## 7. What comparable platforms permit contractually

### 7.1 Audible / ACX

- **Default rule: humans only.** "Your submitted audiobook must be narrated by a human unless otherwise authorized: **Unauthorized use of text-to-speech, AI, or automated recordings in ACX titles is prohibited.** Do not remit payment to a producer if you suspect unauthorized use of text-to-speech." (https://help.acx.com/s/article/what-are-the-acx-audio-submission-requirements)
- **Carve-out 1 — Voice Replica Agreement (beta since 2025-07-09):** a producer may clone **their own voice** only ("you are creating a Voice Replica of your own voice and you may not subcontract"), audition with it, and produce "VRAudiobooks"; rights-holder approval still required; Audible has sole discretion over marketing/distribution. (https://help.acx.com/s/article/voice-replica-terms-and-conditions-ua, https://www.acx.com/mp/blog/now-in-beta-narrator-voice-replicas-on-acx)
- **Carve-out 2 — publisher programme:** Audible offers end-to-end and self-service **AI narration to publishing partners**, with **100+ AI-generated voices** across English/Spanish/French/Italian, plus AI translation. (http://audible.com/about/newsroom/audible-expands-catalog-with-ai-narration-and-translation-for-publishers)
- **Human workflow still governs:** rights holder approves (i) narrator, (ii) first 15 minutes, (iii) completed audiobook; producer must clear narrator name/likeness rights for marketing (https://help.acx.com/s/article/acx-audiobook-production-standard-terms-legacy)

### 7.2 Storytel

- Operates an explicit **"AI Narrated" label/category** in its catalogue (https://www.storytel.com/tv/narrators/ai-narrated-709724) while its terms bar *undisclosed* misleading AI content (§6.3). Publisher delivery is governed by a content policy enforced with automation + human reviewers; repeated violations can terminate the supplier's catalogue or contract (https://publishersupport.storytel.com/hc/en-us/articles/17836102967580).

### 7.3 TTS vendors

- **ElevenLabs:** free = non-commercial + attribution; Starter ($5) onward = commercial licence, user owns Output, subject to Prohibited Use Policy and Beta Services exclusion; voice inputs are licensed to ElevenLabs broadly (§2.1–2.2).
- **OpenAI:** user owns Output (contractual assignment), must have rights to Input, **and** must disclose the voice is AI (§6.3). tts-1 $15/1M, tts-1-hd $30/1M, 4,096-char input cap.
- **Google Cloud:** no ownership claim on Generated Output; usage "in compliance with the Google Cloud Platform Terms of Service including compliance with all applicable law" (https://docs.cloud.google.com/text-to-speech/quotas); WaveNet $4/1M makes it the cheapest mainstream neural option.
- **Azure:** output terms sit under the Microsoft product terms; custom voices are **Limited Access** with consent + disclosure obligations (§2.3); Neural $15/1M.
- **Amazon Polly:** explicitly "no restrictions on storage and reuse of voice output"; HIPAA/PCI eligible; four price tiers from $4 to $100 per 1M chars; **3k-char realtime / 100k-char async** ceiling shapes any book pipeline (§3.1).

### 7.4 Open-source models

| Model | Licence | Commercial? | Source |
|---|---|---|---|
| Kokoro-82M | **Apache-2.0** | yes | https://huggingface.co/hexgrad/Kokoro-82M |
| Piper | **MIT** | yes | https://github.com/rhasspy/piper/blob/master/LICENSE.md |
| Coqui XTTS-v2 **weights** | **Coqui Public Model License** — "allows only non-commercial use of a machine learning model **and its outputs**" | **no** (vendor shut down Jan 2024, so commercial licences unavailable) | https://huggingface.co/coqui/XTTS-v2/blob/main/LICENSE.txt |
| Coqui TTS toolkit (code) | MPL-2.0 (copyleft on modified files) | yes, with source-disclosure conditions | https://github.com/coqui-ai/TTS/blob/dev/LICENSE.txt |

*(Secondary confirmations of the licence landscape: https://localaimaster.com/blog/xtts-coqui-commercial-license, https://www.promptquorum.com/power-local-llm/local-tts-voice-cloning-piper-coqui-xtts — note that CPML covers **outputs**, so even self-hosted XTTS output is contractually restricted to non-commercial use.)*

---

## 8. Cost model cheat-sheet (facts only)

| Line item | Unit fact | Source |
|---|---|---|
| Synthesis, cheapest cloud | $4 / 1M chars ≈ $0.17 / audio-hour | Google/Polly pricing pages |
| Synthesis, mid neural | $15–16 / 1M chars ≈ $0.65–0.70 / audio-hour | OpenAI/Azure/Polly pages |
| Synthesis, expressive (ElevenLabs) | $0.05–0.10 / 1k chars ≈ $2.18–4.35 / audio-hour | https://www.elevenlabs.io/pricing/api |
| Synthesis, Polly Long-Form | $100 / 1M chars ≈ $4.35 / audio-hour | https://aws.amazon.com/polly/pricing/ |
| Storage | $0.023 / GB-month (S3 Standard) | https://aws.amazon.com/s3/pricing/ |
| Delivery (CDN) | $0.085 / GB (first 10 TB NA/EU), 1 TB/mo free | https://aws.amazon.com/cloudfront/pricing/ |
| Delivery (zero-egress object store) | $0 / GB egress, $0.015 / GB-month | https://egresscost.com/cloudflare |
| Per listening-hour delivery @64 kbps | ≈ 0.0288 GB ≈ $0.0025 | arithmetic from above |
| Human audiobook production | ≈ 6.2 person-hours per finished audio hour | https://help.acx.com/s/article/producing-and-recording-your-audiobook |

---

## Implications for the V1 audio model decision

*Facts, not a decision — choosing BookTube's audio model is a separate human ticket.*

1. **Metered TTS cost is trivial for every feature except it isn't a cost problem at all.** A whole 90k-word book synthesises for **~$2–54** depending on tier (§3.2), an article for **$0.04–0.90**. Cost does not separate "short AI articles" from "full AI narration" — **rights, QC and consistency do**. Anyone sizing the decision on per-character price will mis-weight it.
2. **The rights wall is real and one-directional.** ACX flatly prohibits TTS/AI narration "unless otherwise authorized"; Audible's only self-serve clone path lets a narrator clone **their own voice**; the Authors Guild's model contract requires **written author consent** for AI narration; text and audio are separately licensed markets (*AAP v. Audible*). Full-book AI narration requires an audio-rights grant **plus** author consent — cheap articles you own or license for audio need neither of those hurdles.
3. **Short AI articles sit inside a disclosure obligation that is already live.** EU AI Act Art. 50 has applied since **2 Aug 2026** (deployer deepfake labelling + provider machine-readable marking, fines to €15 m/3%), California SB 942 requires latent+manifest disclosure in **audio**, and OpenAI contractually obliges customers to tell end users the voice is AI. Labelling is mandatory in both short and long cases and costs nearly nothing — it cannot be the discriminator between the features.
4. **Voice cloning is consent-gated by every serious vendor and by 7+ US states.** OpenAI has a consent-recording API, Azure requires written consent *and* speaker verification plus limited-access approval, ElevenLabs requires rights to any submitted voice. Creator-recorded/cloned audio is legally safe **only** with documented consent; cloning anyone else's voice without it is a statutory violation in TN/CA/IL/MT/AR/WA/PA and (if NO FAKES passes) federally.
5. **Pure-TTS audio may be uncopyrightable.** USCO Part 2: wholly AI-generated content has no copyright; OpenAI/Google assign Output only "to the extent permitted by applicable law." Full-book AI narration may therefore produce an asset BookTube cannot exclusively hold — a much bigger deal at book scale than at article scale.
6. **Full-book narration is an engineering-consistency problem, not a latency or money problem.** Providers cap requests at 3,000–40,000 characters (§3.1), so a book is 14–180+ chunks requiring cross-chunk voice/prosody consistency, pronunciation lexicons, ≤120-minute chapter files with credits, and a full listen-through review (ACX's own human benchmark: 6.2 h work per finished hour). Latency is irrelevant offline; streaming latency (113–516 ms TTFA, Coval) only matters if an interactive feature is added later.
7. **Delivery economics strongly favour audio over video and make caching decisive.** Storage ≈ $0.66/month per 1,000 hours; per-listening-hour egress ≈ **$0.0025** (CloudFront, 1 TB free) or **$0** (R2). Offline download just converts repeated streaming egress into one-shot egress at the same rate. Audio delivery will never be the constraint that forces a choice between features.
8. **Open weights remove per-character cost but not legal risk.** Kokoro (Apache-2.0) and Piper (MIT) are commercially safe and cost only compute, but Coqui XTTS-v2's licence covers **the model's outputs** for non-commercial use only, and even a freely self-hosted model still outputs audio whose *source text* needs an audio-rights licence and whose *voice* needs consent.
9. **Sync/bookmarks are standardised and cheap — but only if generated with timestamps.** Polly speech marks, Azure WordBoundary and Speechify speech marks give word-level alignment at generation time; EPUB Media Overlays, ID3 CHAP/CTOC and podcast JSON chapters are the interchange formats. Offsets must be keyed to an audio version — regenerated audio invalidates stored bookmarks.
10. **The comparable-platform split is contractual, not technical.** Audible permits AI narration only via publisher programme or own-voice replica; Storytel labels AI-narrated titles; ElevenLabs gates commercial use behind a paid plan; Google/Polly are cheap and permissive on reuse. What a platform *permits* is the binding constraint — and it differs completely between hosting someone's uploaded audiobook (rights warranty + takedown) and generating narration yourself (rights grant + consent + disclosure).
