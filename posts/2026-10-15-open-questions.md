---
title: "Open Questions — October 2026"
date: 2026-10-15
excerpt: "A research notebook entry: the questions currently held open across sports modelling, markets, calibration, and the archive's own methodology."
slug: open-questions
subject: general
type: notebook
tags: [research-questions, calibration, sports, markets]
related: [walk-forward-validation, survivorship-bias-in-strategy-research]
---

A dated snapshot of questions currently held open. Nothing here is answered; several entries may be abandoned. The point of recording them is to make the state of thinking inspectable — including its unfinished parts.

## Sports probability modelling

- How much of apparent team-strength signal in low-scoring markets is genuine persistence versus noise in small samples of matches? What sample sizes are actually needed before a "form" feature earns its place?
- What is the honest baseline for a football outcome model: always-favourite, historical frequencies, or a properly calibrated bookmaker consensus — and how should calibration be measured when the reference itself is uncertain?
- Do confidence scores derived from model agreement and historical stability ([Dira-s-Engine](https://github.com/EngD3nnis/Dira-s-Engine)'s 0–100 design) track empirical outcome frequencies when binned? Calibration curves, not anecdotes.

## Markets and speculative data

- Can holder-concentration and liquidity-pool metrics for small-cap tokens be collected *without* conditioning on survival — i.e. is it possible to build a dataset that includes the dead, or is the data landscape itself survivorship-filtered at the source?
- What minimum liquidity and spread assumptions turn a paper return into an executable one, and at what trade size does slippage erase the apparent edge? (Requires market data collection; no results yet.)
- How should drawdown and ruin risk be framed for small, high-variance speculative positions — Kelly-style fractional sizing under genuinely uncertain edge estimates, not point estimates?

## Calibration and evaluation

- Proper scoring rules (Brier, log score) versus raw accuracy: at what point does accuracy cease to discriminate between two forecasting systems on imbalanced outcomes?
- How stable are calibration estimates under the [walk-forward](/blog/walk-forward-validation/) protocol itself — does the validation design change the calibration picture, and by how much?

## Archive methodology

- Should entries record explicit **corrections** sections when an earlier derivation is found wrong? (Current answer: yes — transparency is the point; mechanism still to be designed.)
- At what archive size does the subject taxonomy need revision? Nine subjects feel right now; premature taxonomy is its own failure mode.
- Which future entries deserve code repositories versus inline code, and when does a worked example stop being a note and become a [project case study](https://github.com/EngD3nnis)?

## Next steps, honestly stated

Most of the above is blocked on data collection, not on ideas. The sports questions need match-level datasets assembled with explicit provenance; the market questions need order-book and on-chain data pipelines that survive the [survivorship](/blog/survivorship-bias-in-strategy-research/) critique. Until those exist, the right move is to keep the questions precise and resist the temptation to answer them with whatever data is easiest to obtain.
