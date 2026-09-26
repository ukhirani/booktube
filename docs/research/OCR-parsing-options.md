# Document parsing and OCR options for V1

Research for issue #30. Planning only; no selection decision here. All cost figures dated — sources checked **2026-09-26** unless a source publication date is given. Stack context: pluggable `DocumentParser` interface (issue #11), backends as configuration.

## 1. Benchmark landscape (read the version stamps)

- **OmniDocBench** (CVPR 2025) is the standard end-to-end PDF parsing benchmark: 1,651 pages, 10 document types (incl. `book` and `colorful_textbook`), annotated for text, tables, formulas, reading order — https://arxiv.org/abs/2412.07626, dataset https://github.com/opendatalab/OmniDocBench
- Its overall metric changed over time: v1.0 used OverallEdit (lower better); from v1.5 it is `((1 − text edit) × 100 + table TEDS + formula CDM) / 3` (higher better); v1.6 (2026-04-10) added MGAM matching + 296 hard pages; v1.7 (2026-04-30) — https://github.com/opendatalab/OmniDocBench README. **Scores from different benchmark versions are not comparable.**
- Current v1.6_full leaderboard top rows: PaddleOCR-VL-1.6 **96.34**, MinerU2.5-Pro 95.75, GLM-OCR 95.22, PaddleOCR-VL-1.5 94.93; pipeline tools MinerU-Pipeline 86.47, olmOCR 85.74, Mistral OCR 85.66, Marker 78.44 — https://github.com/opendatalab/OmniDocBench (same page).
- **Docling and Unstructured were only ever evaluated on OmniDocBench v1.0 and are absent from v1.5+ leaderboards**; the maintainers state older models were not re-evaluated — https://github.com/opendatalab/OmniDocBench/issues/120 (v1.0 OverallEdit: DocLing 0.589, Unstructured 0.586, MinerU 0.133, Marker 0.296 — lower is better).
- **olmOCR-bench** (Allen AI): 1,403 PDFs + 7,010 pass/fail property tests across 8 categories (arXiv math, old scans, tables, headers/footers, multi-column, long tiny text) — https://huggingface.co/datasets/allenai/olmOCR-bench. Leaderboard (allenai/olmocr README, https://github.com/allenai/olmOCR): olmOCR v0.4.0 **82.4**, PaddleOCR-VL 80.0, Marker 1.10.1 76.1, MinerU 2.5.4 75.2, DeepSeek-OCR 75.7, **Mistral OCR API 72.0**.
- **Per-type orderings reverse** (OmniDocBench paper): pipeline tools (MinerU, Mathpix) beat VLMs on academic papers/financial reports and especially newspapers (most VLMs fail there); general VLMs generalize better on slides, handwritten notes and fuzzy scans; all systems score lower on Chinese than English; every system degrades on multi-column/complex layouts in reading order — https://arxiv.org/html/2412.07626v2 and CVPR paper https://openaccess.thecvf.com/content/CVPR2025/papers/Ouyang_OmniDocBench_Benchmarking_Diverse_PDF_Document_Parsing_with_Comprehensive_Annotations_CVPR_2025_paper.pdf.
- Component OCR text (Table 8, lower = better edit distance): PaddleOCR 0.071 EN / 0.055 ZH, far ahead of Tesseract (0.096 EN / 0.551 ZH) and EasyOCR (0.26 EN) — same paper.

## 2. Candidate backends

### 2.1 Docling (IBM Research / LF AI & Data)

- **What:** Local pipeline — PDF text backend + page rendering → layout model (DocLayNet-trained) → reading order → TableFormer tables → typed `DoclingDocument` tree; exports Markdown/JSON/HTML. **Code licence MIT** (repo badge, https://github.com/docling-project/docling); README notes individual model licences live in their original packages. Docling-ibm-models (layout + TableFormer inference) is MIT — https://github.com/docling-project/docling-ibm-models.
- **Hierarchy:** `DoclingDocument` is an explicit tree — `body`/`furniture` roots, groups (chapters/lists), headings with levels; tech report: identifies "title, headings, paragraphs… and reflect the correct hierarchy level if possible" — https://arxiv.org/html/2408.09869v5, https://docling-project-docling.mintlify.app/concepts/docling-document.
- **OCR:** pluggable engines — RapidOCR, Tesseract (tesserocr/CLI), EasyOCR, OcrMac, Nemotron (https://docling.org/doc/). Modes: `default` (hybrid, OCR only regions that need it), `layout_regions`, `pdf_aware_layout_regions`, `full_page`; `bitmap_area_threshold` default 0.05 (5 % of page area) gates OCR on a region; `force_full_page_ocr` forces it; EasyOCR `confidence_threshold` default 0.5 filters low-confidence text — https://docling-project.github.io/docling/reference/pipeline_options/, https://github.com/docling-project/docling/blob/main/docling/datamodel/pipeline_options.py. Docs: "For hybrid PDFs (some pages scanned, some digital), Docling automatically detects which pages need OCR" — https://docling-project.github.io/docling/_generated/examples/full_page_ocr/.
- **Speed** (4,008-page benchmark, Docling tech report https://arxiv.org/html/2408.09869v4): median 0.79 s/page on x86 CPU, 0.32 s on M3 Max, 114 ms on Nvidia L4. OCR is the dominant cost (EasyOCR avg 13 s/page CPU, 1.6 s/page L4; OCR engaged on 578 pages). Head-to-head: CPU — Docling 3.1 s/page, MinerU 3.3, Unstructured 4.2, Marker >16; L4 GPU — MinerU 0.21, Docling 0.49, Marker 0.86 s/page. A 2026 community run on L4 reports 3.3 pages/s with OCR+VLM off vs 1.5 pages/s with OCR — https://github.com/docling-project/docling/discussions/3442.
- **Accuracy:** on olmOCR-bench (Marker's harness, v2.x defaults) Docling scores 50.3 overall / 64.0 digital-only at 2.1 pages/s GPU — https://github.com/datalab-to/marker (vendor-run comparison; treat as directional). On OmniDocBench v1.0 OverallEdit 0.589 (issue #120 above).
- **Languages:** language detection built in; OCR language coverage is engine-dependent (EasyOCR 80+ langs — pipeline_options docstring; Tesseract 100+ — https://pymupdf.readthedocs.io/en/latest/faq/).
- **Cost:** $0 licence fee, runs local/CPU or GPU.

### 2.2 Unstructured (OSS library + commercial API)

- **What:** `partition_pdf` with strategies `auto | fast | hi_res | ocr_only`. `fast` = pdfminer text extraction; `hi_res` = layout detection model (detectron2_onnx or YOLOX) + OCR; `ocr_only` = Tesseract then `partition_text` — https://docs.unstructured.io/open-source/core-functionality/partitioning.
- **Licence:** OSS library **Apache-2.0** (GitHub API, repo Unstructured-IO/unstructured). API/Platform is commercial; pricing page: 15,000 free pages/month, then paid tiers (custom pricing) — https://unstructured.io/pricing.
- **API data terms (material):** documents uploaded to the free-tier SaaS API are stored and used for model training; the vendor blog directs privacy-sensitive users to the commercial API or OSS — https://unstructured.io/blog/unstructured-s-commercial-saas-api.
- **Selection-rule precedent:** `auto` chooses `fast` if PDF text is extractable, else `ocr_only`; the extractability flag is document-level (`pdf_text_extractable = any(non-empty Text…)`), plus an `is_pdf_too_complex()` heuristic that forces `hi_res` — https://github.com/Unstructured-IO/unstructured/blob/main/unstructured/partition/pdf.py, https://docs.unstructured.io/open-source/core-functionality/partitioning. Docs claim `fast` is "roughly 100× faster than leading image-to-text models" — https://docs.unstructured.io/open-source/concepts/partitioning-strategies.
- **Hierarchy:** flat typed elements (`Title`, `Header`, `NarrativeText`, `ListItem`, `Table`, `Footer`, …) with `parent_id` + `category_depth` metadata computed by a rule set (`set_element_hierarchy`) — https://docs.unstructured.io/open-source/concepts/document-elements, https://github.com/Unstructured-IO/unstructured/blob/main/unstructured/partition/common/metadata.py. "More sophisticated document hierarchy detection" is listed as an API-only feature — https://docs.unstructured.io/api-reference/legacy-api/partition/document-elements.
- **OCR agents:** Tesseract (default), Paddle (Apache-2.0 fork `unstructured-paddleocr`), Google Vision — https://docs.unstructured.io/open-source/how-to/set-ocr-agent.
- **Speed:** tech-report head-to-head 4.2 s/page CPU, no GPU speed-up (Docling tech report, above).
- **Accuracy:** OmniDocBench v1.0 OverallEdit 0.586 (weak vs MinerU 0.133) — issue #120. `hi_res` documented weakness: ordering elements in multi-column documents without extractable text (partitioning docs).
- **Language:** Tesseract/Paddle language packs; element-level language detection via `langdetect`.

### 2.3 LlamaParse (LlamaIndex)

- **What:** Hosted commercial parser (SaaS), **not open source** — https://developers.llamaindex.ai/llamaparse/general/faq/. v2 tier system: Fast 1, Cost-effective 3, Agentic 10, Agentic Plus 45 credits/page — https://developers.llamaindex.ai/llamaparse/general/pricing/.
- **Cost (dated 2026-09-26):** 1,000 credits = $1.25, so Fast **$1.25/1k pages**, Cost-effective $3.75/1k, Agentic **$12.50/1k**, Agentic Plus $56.25/1k; stacked extract+parse totals 6–60 credits/page. 10,000 free credits/month renew; Starter $50/mo (40k credits), Pro $500/mo (400k) — https://developers.llamaindex.ai/llamaparse/general/billing/, conversion table https://docuocr.com/llamaparse-pricing (2026-07-19).
- **Behaviour:** outputs Markdown, per-page JSON (layout), XLSX, HTML tables, annotated PDF; "Auto Mode — smart tier routing per page (saves up to 80%)" and a Cost Optimizer routing pages between tiers — https://www.llamaindex.ai/pricing, https://developers.llamaindex.ai/llamaparse/parse/getting_started/. Files cached 48 h by default (re-parse free within window); VPC deployment on AWS/Azure marketplaces; SOC 2 II / GDPR / HIPAA — https://developers.llamaindex.ai/llamaparse/general/faq/.
- **Benchmarks:** no entry on OmniDocBench or olmOCR-bench leaderboards; agentic/VLM tiers mean output quality varies by tier and model version (version pinning available — v2 blog https://www.llamaindex.ai/blog/introducing-llamaparse-v2-simpler-better-cheaper).

### 2.4 Mistral OCR (OCR 3 / OCR 4 / 4.1)

- **What:** API-only document OCR (`/v1/ocr`), returns Markdown, bounding boxes, typed block labels (title, table, equation, …) and **per-page and per-word confidence scores**; self-host container available via enterprise agreement — https://mistral.ai/news/ocr-4/ (2026-06-23).
- **Cost (checked 2026-09-26):** OCR 4/4.1 **$4.00 per 1,000 pages** standard API, **$2.00** via Batch API (50 % discount, async), $5.00 with Document AI layer; OCR 3 (mistral-ocr-2512) was $2.00/1k with $1 batch — https://mistral.ai/pricing/api/, https://mistral.ai/news/ocr-4/, https://mistral.ai/news/mistral-ocr-3/ (2025-12-17).
- **Accuracy:** Mistral reports OlmOCRBench 85.20 (top), OmniDocBench 93.07, 170 languages, 72 % human-preference win rate (vendor-run; the post itself flags known scoring artifacts on both public benchmarks) — https://mistral.ai/news/ocr-4/. Independent leaderboards are less favourable for the older model: OmniDocBench v1.6 "Mistral OCR" 85.66 overall with table TEDS only 76.78 (weakest table scores on the board), and olmOCR-bench Mistral OCR API 72.0 vs PaddleOCR-VL 80.0 / olmOCR 82.4 — OmniDocBench README + allenai/olmocr README (links in §1).
- **Latency:** third-party API benchmark (2026-07): median response 1.3 s/page vs Google Cloud Vision 421 ms, Azure Read 542 ms; Mistral strongest on documents/forms, weaker CER than Google on the mixed set — https://voiceping.net/en/blog/research-commercial-ocr-api-benchmark-2026/.
- **Licence/terms:** proprietary API; self-host container for enterprise. EU-hosted, SOC 2 / ISO 27001 claims on Mistral's site.
- **Languages:** 170 languages across 10 language groups (Mistral's claim, OCR 4 post).

### 2.5 pdfplumber (text-layer only)

- **Licence MIT** (GitHub API, repo jsvine/pdfplumber). Pure-Python extraction from the PDF text layer; **no OCR**; character/word/bbox/curve objects plus table extraction; **no confidence scores** — text-layer extraction returns no per-glyph reliability (text-layer tools report absence of a usable CMAP instead, see PyMuPDF signal below).
- Position: the cheap path for born-digital PDFs only. Independent benchmark (2026-07-06, vendor blog — directional): ~18 pages/s vs PyMuPDF ~180 pages/s; table TEDS 0.847 vs PyMuPDF 0.692 — https://pdfmux.com/blog/pymupdf-vs-pdfplumber/.
- No layout/reading-order model, no heading levels: hierarchy must come from font sizes/positions or the PDF outline.

### 2.6 PyMuPDF / MuPDF (AGPL note)

- **Licence: AGPL-3.0** (GitHub API; https://pymupdf.io/licensing). Artifex offers paid commercial licences for proprietary/SaaS use; PyMuPDF FAQ explicitly says AGPL obligations apply when used in a commercial product's data pipeline — https://pymupdf.readthedocs.io/en/latest/faq/. A maintainer-adjacent answer on the repo states using it in a networked service would require the service's own code to be AGPL unless commercially licensed — https://github.com/pymupdf/PyMuPDF/issues/4962.
- Fastest text-layer extraction (~180 pages/s in the pdfmux benchmark above); built-in Tesseract OCR via `get_textpage_ocr()` (100+ tessdata languages — PyMuPDF FAQ).
- **PyMuPDF4LLM auto-OCR is the clearest documented per-page selection rule:** OCR triggers when a page has *no selectable text* (rasterised content) or *garbled text* (many `U+FFFD`), and only affected regions are re-OCR'ed; `force_ocr=True` overrides — https://pymupdf.readthedocs.io/en/latest/. Artifex blog on the same signal: glyphs without a valid CMap surface as `chr(0xFFFD)` — https://artifex.com/blog/text-extraction-with-pymupdf.
- **AGPL is a licence veto risk for a hosted platform** unless a commercial licence is bought; both paths are real cost inputs (commercial pricing not public).

### 2.7 PaddleOCR / PaddleOCR-VL (stronger current option)

- **What:** Apache-2.0 end-to-end stack (repo PaddlePaddle/PaddleOCR, GitHub API). PaddleOCR-VL-0.9B = NaViT dynamic-resolution encoder + ERNIE-4.5-0.3B; outputs Markdown/JSON with layout, tables, formulas, charts; **109 languages** (model paper), PaddleOCR 3.5 claims 111 languages incl. Tibetan/Bengali — https://arxiv.org/html/2510.14528v4, https://github.com/PaddlePaddle/PaddleOCR.
- **Accuracy:** OmniDocBench v1.5 92.86 (v1 of the model) → v1.5 model 94.50 → **v1.6 model 96.34**, top of the v1.6_full leaderboard ahead of Gemini 3 Pro (92.91) and GPT-5.2 (86.59); Real5-OmniDocBench (skew/warp/scan/photo robustness) 92.05 for the 1.5 model — OmniDocBench README, https://arxiv.org/html/2601.21957. olmOCR-bench 80.0 (allenai/olmocr README). Component text OCR also best on OmniDocBench Table 8 (§1).
- **Latency:** 1.43 pages/s and 2,016 tokens/s on a single A100 (FastDeploy backend, OmniDocBench v1.5 set); async 3-stage pipeline, vLLM/SGLang/FastDeploy supported — arXiv 2601.21957 Table 6.
- **Hierarchy:** "automatic cross-page … hierarchical heading identification" for long documents (PaddleOCR 3.5 release notes in README); bounding boxes + typed blocks available.
- **Cost:** $0 licence, self-hosted GPU inference; model weights on HuggingFace (apache-2.0 card).

### 2.8 Marker (Datalab)

- **What:** Text-layer-first pipeline that only calls OCR/VLM where needed (garbled/scanned pages, equations, low-confidence tables); modes `balanced | fast | disable_ocr` — https://github.com/datalab-to/marker/releases/tag/v2.0.0.
- **Licence:** **code Apache-2.0**; **model weights** under a modified AI Pubs OpenRAIL-M — free for research/personal use and for organisations under $5 M funding/revenue; commercial use beyond that requires a paid plan — https://github.com/datalab-to/marker (README).
- **Accuracy/throughput (vendor-run, B200):** olmOCR-bench balanced 76.0 (83.5 digital-only) @ 2.9 pages/s; fast 66.6 @ 7.4 pages/s; no-OCR CPU 43.6 @ 23.7 pages/s; MinerU pipeline 72.7 @ 0.54, Docling 50.3 @ 2.1 — same README. OmniDocBench v1.6: Marker 78.44 overall with table TEDS 65.77 (tables are its weak spot) — OmniDocBench README. Old-scan categories remain hard: olmOCR-bench `old_scans` 33.5 for Marker 1.10.1 vs 47.7 for olmOCR (allenai/olmocr README).
- **Languages:** Surya OCR engine underneath (vendor materials claim 90+ languages).

### 2.9 MinerU (OpenDataLab)

- **What:** Layout-first pipeline (DocLayout-YOLO + UniMERNet tables/formula) with VLM and pipeline modes; **licence moved from AGPL-3 to the "MinerU Open Source Licence", a custom licence based on Apache 2.0 "with additional conditions"** (v3.1.0, 2026-04-18) — https://github.com/opendatalab/MinerU (README + LICENSE.md). Read the conditions before shipping; GitHub reports `NOASSERTION`.
- **Accuracy:** OmniDocBench v1.6: MinerU2.5-Pro 95.75 (2nd), MinerU-Pipeline 86.47 (best pipeline tool) with the **most consistent reading-order predictions** on the benchmark (paper §4); v1.0 OverallEdit 0.133 (best of the pipelines in issue #120). olmOCR-bench 75.2 (allenai/olmocr README).
- **Speed:** 0.54 pages/s GPU on olmOCR-bench (Marker harness); 0.21 s/page on L4 in the Docling tech report (fastest GPU pipeline there); 3.3 s/page CPU. Community builds also depend on PyMuPDF (AGPL) for some paths — worth a dependency-licence check.

### 2.10 olmOCR (Allen AI)

- **What:** 7B document VLM + `olmocr-bench` benchmark suite; **Apache-2.0** (GitHub API, allenai/olmOCR); aimed at large-scale batch conversion with layout anchors; GPU inference (recent NVIDIA GPU, ~20 GB VRAM, per project README/install docs).
- **Accuracy:** olmOCR-bench best open score 82.4 (v0.4.0); OmniDocBench v1.6 85.74 overall with weak text edit (0.139) — links in §1.
- Benchmark is English-only (dataset card `language: en`).

### 2.11 Cloud vision APIs (Google / Azure / AWS)

Plain-OCR price floor is essentially identical across the three clouds:

| Service | Plain OCR | Structure tier | Source |
|---|---|---|---|
| Google Document AI — Enterprise Document OCR | **$1.50 / 1k pages** (first 1k/mo free; $0.60 above 5M) | Layout $10/1k, Form Parser $30/1k | https://cloud.google.com/document-ai/pricing (checked 2026-09-26) |
| Google Cloud Vision — TEXT/DOCUMENT_TEXT | $1.50 / 1k units (first 1k/mo free; $0.60 above 5M) | n/a | pricing cited by https://voiceping.net/en/blog/research-commercial-ocr-api-benchmark-2026/ (2026-09-19/20) |
| Azure Document Intelligence — Read | **$1.50 / 1k pages** (F0 500 pages/mo) | Prebuilt/Layout $10/1k, custom $30/1k | https://azure.microsoft.com/en-gb/pricing/details/document-intelligence/ (page renders values via API; rates verified via Microsoft Retail Prices API 2026-08 — https://invoiceextractor.ai/azure-document-intelligence-pricing; corroborated by Microsoft Q&A https://learn.microsoft.com/en-us/answers/questions/5665475/) |
| AWS Textract — DetectDocumentText | **$1.50 / 1k pages** (first 1M; $0.60 above) | Tables $15/1k, Forms $50/1k | https://aws.amazon.com/textract/pricing/ |

- Confidence: Textract returns confidence scores for blocks (FAQ: Analyze Document "provides developers with confidence scores" — https://aws.amazon.com/textract/faqs/); per-word/per-symbol confidence also exposed by Google Vision and Azure Read — comparison table https://voiceping.net/en/blog/research-commercial-ocr-api-benchmark-2026/.
- Latency (same 2026-07 study): Google Cloud Vision 60/60 success, median 421 ms; Azure Read 542 ms; Mistral 1.3 s; OCR.Space 7.6 s.
- Hierarchy: none of the plain-OCR endpoints recover book structure — Google Document AI has no "chapter" concept on the OCR processor; structure comes from Layout/Form tiers or downstream heading detection.

## 3. Hierarchy / outline recovery for books

- **PDF outline (bookmarks) is a first-class, cheap signal for born-digital books:** nested Chapter → Section bookmarks with page destinations are readable without any model — pypdf docs https://pypdf.readthedocs.io/en/latest/user/handling-outlines.html (pypdf is BSD; PyMuPDF `get_toc()` is equivalent but AGPL). Scanned PDFs typically have no outline (pypdf extract-text docs explicitly contrast born-digital vs scanned: outline items exist only in the former — https://pypdf.readthedocs.io/en/latest/user/extract-text.html).
- Beyond outlines, hierarchy must be inferred: Docling emits heading levels in a document tree; Unstructured computes `parent_id`/`category_depth` from element types; PaddleOCR-VL does hierarchical heading identification; Mistral OCR labels `title` blocks; pdfplumber/pdfminer have no heading concept at all.

## 4. Per-document selection rule — what to key on

Signals all observed in primary sources:

1. **Text-layer extractability (page-level):** run cheap extraction first; non-empty text ⇒ cheap path. Unstructured computes `pdf_text_extractable` per document (any non-empty text) and routes `auto` → `fast` else `ocr_only` — unstructured/partition/pdf.py. Unstructured also gates on `is_pdf_too_complex()` (heuristic) before attempting text extraction (same file).
2. **Garbled text ratio:** count `U+FFFD` / non-mappable glyphs — PyMuPDF4LLM triggers OCR per page when "too many characters are unreadable" (https://pymupdf.readthedocs.io/en/latest/); Artifex blog documents the CMap→`chr(0xFFFD)` mechanism.
3. **Image/bitmap coverage:** pages with no selectable text but large bitmap coverage are scans; Docling's `bitmap_area_threshold` (default 5 % of page) gates OCR per region, and `force_full_page_ocr` exists for full scans — docling pipeline_options source.
4. **Granularity matters:** Unstructured's `auto` is document-level; PyMuPDF4LLM is per-page; Marker is region-level selective; Docling is region-level with per-page fallback. Mixed digital/scanned books (common) favour per-page or finer routing.
5. **Copy protection / missing resources:** Unstructured documents fallback chains when the PDF is copy-protected or models are unavailable (partitioning docs) — the rule needs explicit fallbacks.
6. **Optional pre-check:** PDF outline presence (§3) correlates with born-digital books and gives structure for free.

## 5. Quality / confidence signals available

- **Per-page & per-word confidence:** Mistral OCR 4 (`include_blocks`) — mistral.ai/news/ocr-4/; Textract blocks — Textract FAQ; Google Vision & Azure Read word/symbol confidence — VoicePing comparison (above).
- **OCR-engine confidence:** EasyOCR confidence exposed by Docling's `confidence_threshold` (default 0.5 filters text) — docling pipeline_options source.
- **Structural proxies (text layer has no confidence):** chars/page, `U+FFFD` ratio, presence/coverage of outline, language-detection agreement (Unstructured sets per-element `language` metadata), text-vs-bitmap coverage per page.
- **Round-trip checks:** Docling and Unstructured both expose per-element bounding boxes (DoclingDocument layout info; Unstructured coordinates) enabling overlap/coverage checks between extraction and page render.
- **Documented failure heuristics:** Unstructured `is_pdf_too_complex`; Docling `document_timeout` (90–120 s recommended in docs) as a bad-parse tripwire.

## 6. Implications for the V1 backend selection

Facts only; selection belongs to implementation gated on this ticket.

1. **The cheap path and the OCR path differ by ~2 orders of magnitude in cost:** text extraction runs at ~180 pages/s (pdfplumber: ~18 pages/s) and near-zero cost, while per-page cloud OCR is $1.50–$4.00/1k pages and local VLM OCR needs a GPU (PaddleOCR-VL 1.43 pages/s on A100; Docling CPU median 0.79 s/page) — pdfmux benchmark (2026-07-06), AWS/Google/Azure/Mistral pricing pages (checked 2026-09-26), arXiv 2601.21957, Docling tech report.
2. **Accuracy rankings flip by document type and by benchmark version** — pipeline tools win on newspapers/academic pages, VLMs win on fuzzy scans/notes/handwriting; and Docling/Unstructured scores exist only for OmniDocBench v1.0 while the board now runs v1.6 — OmniDocBench paper; issue #120. Any backend claim must name benchmark + version + document type.
3. **On current benchmarks the open weights lead:** PaddleOCR-VL-1.6 (Apache-2.0, 0.9B) tops OmniDocBench v1.6 at 96.34 and scores 80.0 on olmOCR-bench, ahead of Mistral OCR API (72.0 olmOCR-bench) — OmniDocBench README, allenai/olmocr README. Mistral counters with API simplicity, per-word confidence and $4/1k pricing, but its leaderboard table-TEDS (76.78) is the worst on the v1.6 board.
4. **Licence constraints are sharply bimodal:** MIT (Docling), Apache-2.0 (Unstructured OSS, PaddleOCR, Marker code, olmOCR) vs **AGPL (PyMuPDF)**, custom Apache-with-conditions (MinerU), model-weight revenue cap (Marker weights: free <$5 M revenue), and non-open SaaS (LlamaParse, Mistral API) — GitHub licence API checks 2026-09-26; respective READMEs.
5. **Unstructured's free API tier trains on your uploads** (documents stored for model training); its paid tiers page-count your data (15k free pages/mo then custom) — unstructured.io blog + pricing. This is a data-handling constraint, not just a price.
6. **Cost per tier is known and stable:** LlamaParse $1.25–$56.25/1k pages by tier (10k free credits/mo); Mistral OCR $4/1k ($2 batch); cloud OCR $1.50/1k everywhere; structure tiers 7–40× dearer (Google Form Parser $30/1k, Textract Forms $50/1k, Azure prebuilt $10/1k) — official pricing pages, checked 2026-09-26.
7. **A per-document rule is already well-specified by prior art:** page-level text extractability + `U+FFFD` garble ratio + bitmap coverage are the three signals used by Unstructured (`auto`), PyMuPDF4LLM (per-page auto-OCR) and Docling (`bitmap_area_threshold`/hybrid page detection); Unstructured's own `auto` is document-level, which mishandles mixed digital/scanned books — source links in §4.
8. **Confidence for gating exists only on OCR paths:** Mistral (per-page/per-word), Textract/Google/Azure (per-block/word), EasyOCR via Docling threshold; text-layer extraction offers no confidence — only proxies (chars/page, garble ratio, outline presence). A quality gate therefore needs its own proxy metric for the cheap path — §5.
9. **Book structure has two independent sources:** the PDF outline/bookmarks (free, reliable on born-digital books, absent on scans — pypdf docs) and model-inferred headings (Docling heading levels, Unstructured `parent_id`/`category_depth`, PaddleOCR hierarchical headings); pdfplumber alone provides neither — §3.
10. **Latency/throughput envelopes:** local pipelines 0.2–4 s/page depending on GPU and OCR engagement (Docling tech report; Marker 2.9–23.7 pages/s by mode on B200); OCR APIs median 0.4–1.3 s/page (VoicePing 2026-07) — batch expectations for a worker fleet should be built on per-page numbers, not per-book ones.

## Sources

Primary sources are linked inline above. Key primary sets: benchmark repos (opendatalab/OmniDocBench, allenai/olmOCR-bench), vendor pricing pages (mistral.ai/pricing/api, aws.amazon.com/textract/pricing, cloud.google.com/document-ai/pricing, azure.microsoft.com/pricing/details/document-intelligence, unstructured.io/pricing, llamaindex.ai/pricing), project repos (docling-project/docling, Unstructured-IO/unstructured, datalab-to/marker, opendatalab/MinerU, PaddlePaddle/PaddleOCR, allenai/olmOCR, jsvine/pdfplumber, pymupdf/PyMuPDF), papers (OmniDocBench CVPR 2025, Docling tech report, PaddleOCR-VL reports).
