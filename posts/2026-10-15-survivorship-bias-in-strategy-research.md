---
title: "Survivorship Bias and Multiple Testing in Strategy Research"
date: 2026-10-15
excerpt: "Why convincing backtests appear out of pure noise — the expected maximum of N null strategies, and the methodological defences that actually work."
slug: survivorship-bias-in-strategy-research
subject: markets
type: note
tags: [survivorship, multiple-testing, backtesting, data-snooping]
related: [walk-forward-validation, bayes-theorem, open-questions]
---

A methodological study note about two related ways quantitative research deceives its author: **survivorship bias** (the sample is not what you think it is) and **multiple testing** (search until something looks significant). Both produce spectacular results from nothing. Neither is fixed by having more data.

## Survivorship bias

Survivorship bias is the error of studying a population defined by having survived a filter. Classic example: assessing fighter-plane armour by examining aircraft that returned from missions — the bullet holes map where a plane *can* be hit and still return, not where it is fatal. The missing data (the planes that did not return) carry the signal.

Its modern forms in markets and sports:

- **Token and fund datasets** that list only currently-trading instruments. The delisted, rugged, and bankrupt entries are absent, so every long-holding strategy looks better than it was, because the worst outcomes were never in the sample to begin with.
- **"Winning" strategy archives** — publicised systems come disproportionately from authors whose systems happened to work (or appeared to), conditioned on publication, which is itself a survivor filter.
- **Team and player statistics** conditioned on still being in the league, still playing, still listed.

The general shape: if inclusion in the dataset depends on the outcome you are trying to predict, the dataset is contaminated at the point of construction, and no amount of downstream modelling repairs it.

## Multiple testing: the expected maximum of noise

The second failure is subtler. Suppose you test $N$ trading rules that have **no genuine edge whatsoever** — pure noise, each with expected return zero and return volatility $\sigma$. You keep the best one. What do you expect to observe?

For $N$ independent standard normals, the expected maximum grows asymptotically like

$$\mathbb{E}[\max_{1 \le i \le N} Z_i] \approx \sqrt{2 \ln N}.$$

So the best of $N$ null strategies shows an apparent performance on the order of $\sigma\sqrt{2 \ln N}$ — and this grows with $N$, even though every individual strategy was worthless. Scan ten thousand parameter combinations and the noise alone produces a "strategy" whose backtest Sharpe ratio looks institutional. This is not a hypothetical failure mode; it is the arithmetic of selection.

The mechanism has many names — data snooping, the garden of forking paths, overfitting to the backtest — but the mathematics is the same: **the reported statistic was selected on the same data used to estimate it**.

## Defences that actually work

- **Out-of-sample honesty.** Hold out data untouched by the entire search — ideally a genuinely later time period, evaluated once ([walk-forward validation](/blog/walk-forward-validation/) for the time-series case). Reusing the holdout for further tuning converts it back into training data.
- **Selection-adjusted inference.** Methods that ask "what maximum should $N$ null trials produce?" before believing a maximum — simple Bonferroni-style corrections, or the expected-maximum calculation above as a sanity floor.
- **Pre-registration of the search.** Fix the strategy family, parameters to be scanned, and success criterion before seeing results. The flexibility of the search is itself a degree of freedom, and the only way to account for it is to constrain it in advance.
- **Parsimony.** Every parameter is a channel through which noise can be memorised. A two-parameter rule that survives out-of-sample is more credible than a fifty-parameter rule that merely fits.
- **Base rates and priors.** Most candidate strategies have no edge; [Bayesian reasoning](/blog/bayes-theorem/) keeps the burden of proof where it belongs — on the evidence, scaled by how rare genuine edges are.

## What this note is not

This is a methodological note, not a report of trading results. No performance numbers, strategies, or datasets are claimed here. The formula above is standard asymptotic theory for maxima of Gaussian sequences; the failure modes it describes are documented across statistics and quantitative finance. Nothing in this archive should be read as investment advice or as a claim of exploitable edge.

## Where this connects

- [Walk-forward validation](/blog/walk-forward-validation/) defends against look-ahead; this note defends against *selection*. A backtest needs both defences; each is blind to the other's failure mode.
- The quantitative interests this archive documents — sports probability models, market micro-structure research, meme-coin data studies — are exactly the environments where these two biases thrive: small samples, heavy filtering, and enormous search spaces. Methodology first, results second.
