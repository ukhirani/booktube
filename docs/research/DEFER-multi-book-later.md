# DEFER — Deferred multi-book capabilities: external research findings

- **Wayfinder ticket:** Issue #33 "Deferred multi-book capabilities: contradiction, sequences, collections"
- **Status:** Research only. No product decision is made here; nothing in this file gates V1.
- **Method:** Primary sources preferred — papers, official product documentation, platform policy pages. Every material claim carries a URL. Each section ends with explicit notes on what transfers to a small, launch-scale system versus what presumes large annotation budgets, large corpora, or large platforms.

---

## 1. Contradiction detection: techniques and measured accuracy/error profiles

### 1.1 The standard formulation and its benchmark numbers

**The canonical task (FEVER, 2018).** 185,445 claims classified SUPPORTED / REFUTED / NOTENOUGHINFO, annotated with sentence-level evidence; inter-annotator agreement **Fleiss κ = 0.6841**. The paper's own full pipeline scores **31.87% accuracy** when correct evidence must be retrieved, and **50.91%** when evidence correctness is ignored (i.e. right label, wrong evidence) — against a ~33% random baseline on balanced classes. Evidence retrieval F1 was only **17.47%** (recall 45.89%, precision 10.79%); the authors' oracle study concludes "the most challenging part of the task is selecting the sentences containing the evidence."
— Thorne et al., *FEVER* (NAACL 2018): https://aclanthology.org/N18-1074.pdf
— FEVER 2018 shared task (best entry: 64.21% FEVER score): https://aclanthology.org/W18-5501/

**Domain transfer matters more than model size.** A model trained on Wikipedia/news claims drops to 67.6% label accuracy on scientific claims; training in-domain lifts label accuracy to 75.7% (FEVER+SciFact: 81.9%). End-to-end open-setting performance on SciFact (1,409 expert-written claims vs 5,183 abstracts) is **F1 ≈ 46.5**, falling to 36.4 when zero-shot from FEVER. Each pipeline stage costs roughly 20 F1 points: with gold abstracts the same system reaches ~72.7, and with gold rationales too, ~83–90. Human label agreement itself is only **Cohen's κ = 0.75** (rationales κ = 0.71).
— Wadden et al., *Fact or Fiction: Verifying Scientific Claims* (EMNLP 2020): https://aclanthology.org/2020.emnlp-main.609.pdf

**Real-world open-web claims (AVeriTeC / FEVER 2024).** 21 submissions, 18 beat the baseline; the winner scored **63% AVeriTeC score** (a claim counts only if the verdict is right *and* retrieved evidence passes a quality threshold). The task has 4 classes, with NEI (7.0%) and Conflicting/cherrypicking (7.6%) rare in the dev split — one strong team reported **label accuracy 0.754 but F1 = 0.0 for both NEI and Conflicting**, concluding "humans should be cautious in trusting this system's output to verify a claim without reading the rationale." The winning paper further reports that qualitative analysis found the model's conclusions were *often more accurate than AVeriTeC's human-annotated ground truth*.
— Shared task overview (FEVER 2024): https://aclanthology.org/volumes/2024.fever-1/
— Team Papelo (label accuracy .754; NEI/Conf F1 0): https://aclanthology.org/2024.fever-1.2/
— InFact (63%, 20 competing teams, ground-truth errors): https://aclanthology.org/2024.fever-1.12/

**LLM-based fact-checking.** GPT-4-class systems with retrieved context exceed 80–89% accuracy on *non-ambiguous* verdicts but only 63–75% on average including ambiguous cases; exact-verdict accuracy 73.5%, evidence-relevance 87.5%; performance varies by language.
— Frontiers in AI (2024), *Large language models for automated fact-checking*: https://www.frontiersin.org/journals/artificial-intelligence/articles/10.3389/frai.2024.1379924/full

**Knowledge-conflict taxonomies for LLMs.** The EMNLP 2024 survey distinguishes *context-memory*, *inter-context* and *intra-memory* conflicts; RAG is the main generator of inter-context conflicts, and conflict/noise makes model outputs unreliable (order-of-presentation effects, performance drops under noisy contexts).
— Chen et al., *A Survey on Knowledge Conflicts in LLMs*: https://arxiv.org/html/2403.08319

### 1.2 Where contradiction detection breaks

**Near-identical pairs.** VitaminC (400k+ contrastive evidence pairs built from Wikipedia revisions) shows a FEVER-trained classifier flips its prediction on only **56%** of pairs that differ by a single factual change; with VitaminC training this rises to 86%, and the best model reaches 89% on real revisions. Training on such pairs improves adversarial robustness (+10% on ANLI) and out-of-domain transfer (+6%).
— Wirth et al., *VitaminC* (NAACL 2021): https://aclanthology.org/2021.naacl-main.52/

**Adversarial collection.** ANLI's human-and-model-in-the-loop rounds show a model at 92.6% on MNLI falling to roughly **47.6 / 25.4 / 22.1** on rounds 1–3 when trained on SNLI+MNLI (Table 6); round 3 alone contains ~103k adversarial examples, and the paper reports annotation cost measured in **hundreds of seconds per verified example** — adversarial data is expensive to produce.
— Nie et al., *ANLI* (ACL 2020): https://aclanthology.org/2020.acl-main.441.pdf

**Class rarity → false positives dominate.** Contradiction is a low-base-rate event: in scite's citation-statement corpus the distribution is ~**92.6% mentioning / 6.5% supporting / 0.8% contrasting**, annotated multi-blind by experts over a 9,708-statement holdout. Any detector tuned for recall will fire mostly on non-contradictions in production.
— Cagliero & Jahan, *scite's citation classification* (Quantitative Science Studies): https://direct.mit.edu/qss/article/2/3/882/102990/
— Also: NEI/Conflicting unpredictability in AVeriTeC (§1.1, https://aclanthology.org/2024.fever-1.2/)

### 1.3 Transfer notes (§1)

- Published accuracy for *closed-corpus* claim verification sits in the **30–75%** band depending on whether gold evidence is assumed; for *open-web* claims the winning system scored 63% on a strict joint metric and ~75% label accuracy. No method in these sources justifies automatically declaring two books "contradictory" without a human in the loop.
- Evidence retrieval — not classification — is the dominant failure mode (FEVER F1 17.47%; SciFact ~40-point oracle gap). A contradiction feature would need its own retrieval/QA subsystem, not just an LLM prompt.
- Evaluation is bottlenecked by expensive gold data (FEVER 185k crowd-annotated claims; SciFact 1.4k expert claims; ANLI hundreds of seconds per item) and human agreement itself is κ ≈ 0.68–0.75. "Accuracy" claims in this field carry an inherent ±10–25% disagreement floor.

---

## 2. Trust & reputation infrastructure: how systems signal disputed claims

The design pattern across every mature platform found here is **attribute-and-signal rather than adjudicate**: expose who says what, mark disputes, and let the user weigh sources. No major system publishes a single "the truth is X" verdict it derived itself.

### 2.1 Wikipedia: policy + machine-readable dispute tags

- **NPOV policy**: represent views "fairly, proportionately, and, as far as possible, without editorial bias, all the significant views that have been published by reliable sources"; Wikipedia "aims to describe disputes, but not engage in them."
  — https://en.wikipedia.org/wiki/Wikipedia:NPOV
- **When sources disagree**: "maintain a neutral point of view and present what the various sources say, giving each side its due weight"; require in-text attribution — *"John Smith argues X, while Paul Jones maintains Y"* — followed by an inline citation.
  — Wikipedia:Verifiability: https://en.wikipedia.org/wiki/Wikipedia:NOSOURCES
- **Signalling machinery**: a layered template system — {{Disputed}} (article-level factual accuracy dispute, requires a talk-page section, files the article into *Category:Accuracy disputes*), {{Disputed section}}/{{Dispute about}}, {{POV}}/{{POV section}} (neutrality), {{Dubious}}, {{contradictory inline}}, {{inconsistent}}, {{citation needed}}. Tags are explicitly *removable* when discussion resolves or goes dormant — there is "no deadline"; drive-by tagging is discouraged.
  — https://en.wikipedia.org/wiki/Template:Disputed ; https://en.wikipedia.org/wiki/Template:Neutrality ; https://en.wikipedia.org/wiki/Template:Citationneeded

### 2.2 Google: decline, label, or phase out

- **Knowledge Panel policy**: Google states it "may decline to act on facts that are reasonably disputed or lack demonstrable evidence" — i.e. a *refusal* rule, not an adjudication engine.
  — https://support.google.com/knowledgepanel/answer/9787176
- **ClaimReview markup**: the schema carries per-claim verdicts with an explicit rating scheme (1 = "False" … 5 = "True") and Google's doc warns that "different fact-checking projects have a variety of rating schemes… It is important to document such rating schemes". Eligibility requires a **corrections policy / error-report mechanism**, clear attribution of the claim to a distinct origin, and traceable, transparent sourcing. Google is **phasing out ClaimReview in Search**; it remains supported only by the Fact Check Explorer tool.
  — https://developers.google.cn/search/docs/appearance/structured-data/factcheck
- **Documented failure of automated dispute labelling**: Google's "Reviewed Claims" experiment (fact-check labels surfaced beside links) was suspended in Jan 2018 over quality problems — fact-checks were being attached to the wrong topics/publishers.
  — https://www.poynter.org/fact-checking/2018/google-suspends-fact-checking-feature-over-quality-concerns/
- **Consensus framing**: when Google began surfacing fact-check labels it explicitly noted multiple fact-checkers may rate the same claim differently and that showing all of them helps users "understand the degree of consensus around a particular claim".
  — https://www.poynter.org/fact-checking/2017/google-is-now-highlighting-fact-checks-in-search/
- **Quality rater guidance**: raters research the *external* reputation of websites and creators (§3.3) under E-E-A-T, with Trust as the most important component; YMYL topics carry the highest standards.
  — https://guidelines.raterhub.com/searchqualityevaluatorguidelines.pdf

### 2.3 Meta: verdict labels tested and removed

- Facebook removed its **"Disputed" red flag** in Dec 2017: research showed a strong image like a red flag "may actually entrench deeply held beliefs — the opposite effect to what we intended"; replacing it with Related Articles (context) "leads to fewer shares than when the Disputed Flag is shown". The same post notes demoted false news loses **80% of its traffic** — the effective lever was *distribution*, not labelling.
  — https://about.fb.com/news/2017/12/news-feed-fyi-updates-in-our-fight-against-misinformation/

### 2.4 Community consensus: X (Twitter) Community Notes

- Notes begin as "Needs More Ratings" until ≥5 ratings; a note becomes visible only if its Note Helpfulness Score passes a threshold (default **0.40**, which includes <10% of notes); ranking uses matrix factorization with positive and negative "factor groups" so a note must be judged helpful *across viewpoints* (bridging), plus contributor-reputation weighting. All data is public.
  — https://github.com/twitter/communitynotes/blob/main/documentation/under-the-hood/ranking-notes.md

### 2.5 Editorial scorekeeping: NewsGuard and scite

- **NewsGuard**: nine weighted pass/fail criteria, a 0–100 score, five bands (90–100 → 0–25), published evidence and a right of reply — a *transparent rubric + human analysts* model rather than an opaque model score.
  — https://www.newsguardtech.com/ratings/rating-process-criteria/
- **scite**: classifies citation statements as supporting / contrasting / mentioning, with the rare-class distribution noted in §1.2 — useful as a *signal layer* over an existing citation graph, not as a verdict service.
  — https://docs.scite.ai/concepts/citation-model

**Transfer notes (§2).**
- Every documented mechanism here is a *presentation and provenance* layer: attribution by weight (Wikipedia), refusal under dispute (Google KG), per-source labels with documented schemes and a corrections path (ClaimReview), context instead of flags (Meta), multi-viewer consensus with a high bar (Community Notes). None requires a working contradiction detector.
- Two documented warnings: automated dispute-labelling was **shipped and withdrawn** for quality (Google 2018), and hard verdict labels **backfired** behaviourally (Meta 2017). Both are cheap mistakes to avoid and expensive to repeat.
- Reputation research (Google QRG) is *external* — raters leave the system to check who published something. A future BookTube trust feature can lean on source provenance (who is speaking, what they cite) rather than inventing an internal reputation score.

---

## 3. Cross-book reading sequences: precedents and measured accuracy/cost

### 3.1 Product precedents: order is *declared*, not inferred

- **Amazon KDP series metadata**: authors publish series as *ordered* or *unordered*; series numbers ("1", "1.5", "2") drive an automatically assembled Series Collection page shown "in order of series numbers". The largest bookstore's cross-book ordering is **author-supplied metadata**, not algorithmically derived.
  — https://kdp.amazon.com/en_US/help/topic/G201097560
- **Comics reading-order sites**: hand-built, community-maintained, editorially curated orders — e.g. comicbookreadingorders.com (curated character orders covering decades, CSV/Excel exports), dcreadingorder.com (whose FAQ states the project applies readability *and* continuity rules rather than pure chronology, and that "no one person can put all this together"), marvelguides.com (era-based guides). The production model is **human editorial + community correction**, often crowdfunded.
  — https://comicbookreadingorders.com/ ; https://www.dcreadingorder.com/faq.php ; https://www.marvelguides.com/
- **Author-published reading orders**: writers publish official reading-order pages/FAQs (e.g. Sylvia Day's FAQ) and commercially sell "reading order and checklist" ebooks — another form of declared, authoritative metadata.
- **Curated-list infrastructure exists at academic scale too**: the TutorialBank resource pool required collecting **~6,300 resources manually** across 200 topics (794 prerequisite edges; avg 3.94 resources per generated reading list).
  — Gurpur et al., *TutorialBank* (ACL 2018): https://aclanthology.org/P18-1057.pdf

### 3.2 Research: how well can prerequisites be inferred?

| Method | Reported quality | Source |
|---|---|---|
| RefD (Wikipedia link asymmetry, unsupervised) | Outperforms supervised baselines across 7 domains / 2 datasets (no absolute accuracy claimed) | https://harrylclc.github.io/files/emnlp15_prerequisite.pdf |
| CPR-Recover (course prerequisites) | P@50 = 0.54, P@100 = 0.50 (best baseline 0.46); **human annotators: precision 0.75 ± 0.13, F1 0.75 ± 0.08** | https://clgiles.ist.psu.edu/pubs/AAAI2017-course.pdf |
| PREREQ (AAAI 2019) | University course F1 = 59.68; MOOC F1 = 60.73 | https://ojs.aaai.org/index.php/AAAI/article/download/5020/4893 |
| KG + gradient-boosted classifier | Precision 76–96% depending on pruning threshold (80-concept ground truth) | https://link.springer.com/article/10.1186/s40561-019-0104-3 |
| CPRL (NAACL 2021) | Notes explicitly that "labeling training data is enormously expensive and time consuming, especially when domain expertise is required" | https://aclanthology.org/2021.naacl-main.164.pdf |

### 3.3 Reading-list generation: evaluation is the scarce resource

- **Human-expert baselines are modest**: system-generated topic lists were edited by advanced learners at **average edit distance 0.33 (system) vs 0.22 (expert)** — "near the quality of those generated by domain experts".
  — Gordon et al., *TechKnAcq* (EMNLP-W 2017): https://aclanthology.org/W17-5029.pdf
- **Gold standards are tiny because they are expensive**: Jardine's thesis built only **8 expert reading lists** and introduced a custom metric (CSC), noting gold-standard creation is expensive so evaluations "are generally small in scale".
  — https://www.cl.cam.ac.uk/techreports/UCAM-CL-TR-848.pdf
- **The current largest benchmark** (ACL-rlg, COLING 2025) has **85 expert lists / 662 papers**, is explicitly too small to train on, found that scholarly search engines perform *poorly* at the task, and found GPT-4o best of the tested systems but with **signs of data contamination/hallucination**.
  — https://aclanthology.org/2025.coling-main.327/

**Transfer notes (§3).**
- In the wild, cross-book order is **declared metadata** (KDP series numbers, author guides) or **community editorial** (comics orders). Both are viable at launch scale; neither requires ML.
- Automated prerequisite/sequence learning tops out around **F1 ≈ 0.5–0.6** on course-like data, with *humans themselves only ~0.75 precise* against consensus labels — accuracy is insufficient for automatically telling readers "read B before A" without a correction path.
- Any sequence feature needs a **human-reviewable correction loop**: system proposal → editor accepts/edits (like KDP series numbers or the comics sites), because evaluation datasets of expert lists are 8–85 items.

---

## 4. Automatic thematic collections: precedents, failure modes, cost

### 4.1 Precedents

- **Netflix microgenres**: ~**76,897** hand-labelled niche genres built by paid human taggers working from a detailed tagger guide, combined into "Mad Libs"-style collection titles — the canonical example of rich thematic collections being *human taxonomy labour* first, automation second. (Secondary journalism source.)
  — https://www.theatlantic.com/technology/archive/2014/01/how-netflix-reverse-engineered-hollywood/282679/
- **Full-text book genre classification (DeepGenre, Gutenberg)**: multi-label classification from complete e-book text reaches **weighted accuracy 0.9284 (BERT)** — but the paper also documents a failure mode: random paragraph sampling proved "quite ineffective" versus targeted passage selection, i.e. *what you feed the model dominates the result*.
  — https://scott-liu.com/assets/pdfs/deepgenre.pdf
- **Book-cover genre classification (PLOS ONE 2025, 57k covers / 30 categories)**: top-1 accuracy ranges from ~**7.20% (Health, Fitness & Dieting)** upward; "for more generalised or diverse categories, achieving precise classification poses a challenge" — per-category variance is extreme.
  — https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0331011
- **Hierarchical multi-modal genre tagging (IMAGINE, ~11.3k books, 1–6 labels each)**: fiction leaf-genre mean F1 **80.52 (SD 7.87)**; sparse/ambiguous genres (fashion, comics, humanities) drop to ~**67–71 F1** due to data sparsity and confusability.
  — https://arxiv.org/html/2505.03839v2

### 4.2 Failure modes documented in the literature

1. **Internal metrics mislead**: held-out likelihood can *negatively correlate* with human-interpretability of topics; more fine-grained topics are less useful to humans; word-intrusion/topic-intrusion human evaluation is the only reliable check.
   — Chang et al., *Reading Tea Leaves* (NIPS 2009): https://papers.nips.cc/paper_files/paper/2009/file/f92586a25bb3145facd64ab20fd554ff-Paper.pdf
2. **Class-imbalance / sparse-label collapse**: F1 falls 10–15 points on under-represented genres (IMAGINE; PLOS cover classifier).
3. **Sampling artefacts**: which passages you embed changes accuracy more than the classifier choice (DeepGenre).
4. **Genre ≠ theme**: all high-performing precedents classify against *fixed taxonomies* (BISAC-like categories, 30 cover categories); "emergent thematic collections" (a theme a user didn't pre-select) has no comparable accuracy benchmark in these sources — it is the topic-model regime of failure mode 1.

### 4.3 Cost profile

- **Inference is cheap**: text embeddings list at **$0.02 / 1M tokens** (≈62,500 pages per dollar at ~800 tokens/page), with an **8,192-token input limit** forcing chunking of full books.
  — https://developers.openai.com/api/docs/guides/embeddings
- **The real cost is taxonomy + guidelines + evaluation**: Netflix's tagger guide and human tagging teams (§4.1), TutorialBank's ~6,300 manual resources (§3.1), and Chang et al.'s human intrusion evaluations (§4.2) all show labour, not compute, as the binding constraint.

**Transfer notes (§4).**
- Auto-grouping a catalog into *pre-defined* labels (genre, mood, topic buckets) is technically feasible and cheap at any catalog size, but per-category accuracy varies from ~7% to ~93% — never publish collections without a human review gate, and never pick clusters by internal metrics (likelihood/cohesion); use human evaluation (intrusion-style checks).
- Truly *emergent* thematic collections have no strong published precedent outside Netflix's human-tagging pipeline; the documented reliable path is human taxonomy + model assistance, not unsupervised clusters surfaced to users.

---

## Implications for future-version decisions

*Facts only — the decisions belong to the human tickets that pick these capabilities up.*

1. **Contradiction detection accuracy is the headline risk**: 31.9% (FEVER, gold evidence required) → 46.5 F1 (SciFact end-to-end) → ~63% AVeriTeC score / 75.4% label accuracy on open web, with **0.0 F1 on the "conflicting evidence" class itself** (https://aclanthology.org/N18-1074.pdf ; https://aclanthology.org/2020.emnlp-main.609.pdf ; https://aclanthology.org/2024.fever-1.2/). Expect a **10–40% error rate** on any automatic contradiction flag.
2. **Evidence retrieval, not reasoning, is the bottleneck** (FEVER evidence F1 17.47%; SciFact ~40-point oracle gap) — a contradiction feature is a retrieval system with a verdict bolted on, not a prompt (https://aclanthology.org/N18-1074.pdf).
3. **Contradictions are rare in the wild** (0.8% of citation statements; NEI+Conflicting ≈ 15% of AVeriTeC dev) → false positives dominate at production volume; precision, not recall, is the metric that matters (https://direct.mit.edu/qss/article/2/3/882/102990/).
4. **Human adjudication cost is the real floor**: ANLI ~200–355 s per verified example; expert gold sets of 8–85 items; human agreement κ ≈ 0.68–0.75 (https://aclanthology.org/2020.acl-main.441.pdf ; https://aclanthology.org/2025.coling-main.327/). Any trust feature inherits these economics.
5. **Every large platform signals dispute instead of adjudicating**: Wikipedia (attribute by weight + dispute templates), Google KG (declines "reasonably disputed" facts), Google ClaimReview (per-source labels + corrections policy — now phasing out in Search), Meta (removed red flags after documented backfire), Community Notes (≥5 ratings, ≥0.40 helpfulness, cross-viewpoint bridging) (§2 sources). **One platform shipped and then withdrew automated dispute labelling for quality** (Google 2018, https://www.poynter.org/fact-checking/2018/google-suspends-fact-checking-feature-over-quality-concerns/).
6. **Reading order in production is declared metadata**: KDP ordered/unordered series numbers and hand-curated comics orders are the precedents; inferred prerequisite learning reaches only F1 ≈ 0.5–0.6 with humans at ~0.75 agreement (https://kdp.amazon.com/en_US/help/topic/G201097560 ; https://ojs.aaai.org/index.php/AAAI/article/download/5020/4893). Design for **user/author-declared order with system-assisted completion + corrections**, not inference.
7. **Sequence/collection evaluation is data-starved**: best reading-list benchmark = 85 expert lists, explicitly "insufficient for training", with GPT-4o contamination concerns (https://aclanthology.org/2025.coling-main.327/). Any auto-generated list needs an editor-accept/fix loop, matching the TutorialBank and comics-site production models.
8. **Automatic grouping quality swings 7%–93% by category** and internal cluster metrics anti-correlate with human interpretability (PLOS 2025; Chang et al. NIPS 2009) → human evaluation is mandatory before anything is surfaced as a collection.
9. **ML tagging cost is now negligible; guideline and evaluation labour is not**: embeddings ≈ $0.02/1M tokens (~62,500 pages/$, 8k-token chunking limit) versus Netflix's human tagger guide for 76,897 microgenres and TutorialBank's ~6,300 manual resources (https://developers.openai.com/api/docs/guides/embeddings ; https://www.theatlantic.com/technology/archive/2014/01/how-netflix-reverse-engineered-hollywood/282679/).
10. **LLM contradiction handling is provenance-sensitive** (order-of-presentation effects, intra-memory inconsistency, degradation under noisy context) — any future conflict feature should store source, date and attribution per claim rather than trusting a model to remain consistent across sessions (https://arxiv.org/html/2403.08319).

---

*Researcher's note: `docs/` does not yet exist on `origin/main`; this file follows the `docs/research/<TICKET>-<slug>.md` convention established by the sibling research branches (R1–R5) on this ticket's tracker.*
