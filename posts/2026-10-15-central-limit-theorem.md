---
title: "The Central Limit Theorem: What It Says and What It Does Not"
date: 2026-10-15
excerpt: "A study note on the CLT — the precise statement, the assumptions that make it true, and the several things people wrongly conclude from it."
slug: central-limit-theorem
subject: probability
type: note
tags: [clt, sampling, inference]
related: [bayes-theorem, walk-forward-validation]
---

A study note recording a careful statement of the central limit theorem, the assumptions it needs, and — more usefully — a list of conclusions it does **not** license.

## Statement (one standard version)

Let $X_1, X_2, \dots$ be independent and identically distributed random variables with mean $\mu$ and finite variance $\sigma^2 > 0$. Define the sample mean

$$\bar{X}_n = \frac{1}{n}\sum_{i=1}^{n} X_i.$$

Then, as $n \to \infty$, the standardized sample mean converges in distribution to a standard normal:

$$\frac{\bar{X}_n - \mu}{\sigma / \sqrt{n}} \xrightarrow{\;d\;} \mathcal{N}(0, 1).$$

Equivalently, $\bar{X}_n \approx \mathcal{N}(\mu, \sigma^2 / n)$ for large $n$. The standard error of the mean shrinks like $1/\sqrt{n}$: quadrupling the sample size halves the standard error.

## The assumptions, stated plainly

1. **Identically distributed.** Every observation comes from the same distribution.
2. **Independent.** No observation informs another. This is the assumption most often violated with real, especially time-ordered, data.
3. **Finite, non-zero variance.** The theorem says nothing useful about heavy-tailed laws with infinite variance (the Cauchy distribution is the standard counterexample: its sample mean has the same distribution as a single draw, for every $n$).

There are generalizations that relax identical distribution (Lindeberg conditions on triangular arrays, various weak-dependence results), but they replace the simple assumptions with conditions that must actually be checked — not assumed.

## A simulation you can run

Drawing means of $n=30$ samples from an exponential distribution (itself strongly skewed) and histogramming them produces an approximately bell-shaped distribution centred at the exponential's mean. The skewed parent distribution matters less and less as $n$ grows. This is the CLT doing its job; it is a five-line NumPy exercise, not a research result.

## What the CLT does **not** say

- **It does not say your data are normal.** It says *sample means* are approximately normal for large $n$. Individual observations keep their parent distribution.
- **It does not say $n=30$ is always enough.** The rate of convergence depends on the parent distribution's skewness and tails. Highly skewed or heavy-tailed data may need far larger $n$; for some distributions with infinite variance, no $n$ suffices.
- **It does not rescue biased estimators.** If your measurement procedure is biased, averaging more biased measurements converges faster to the wrong value. The CLT describes spread around the mean of the estimator, not its distance from the truth.
- **It does not apply to dependent data as stated.** Time series, clustered samples, and graph-connected observations violate independence. Using the i.i.d. formula understates uncertainty; effective sample size is smaller than the raw count.
- **It does not make selection irrelevant.** If you choose what to average after looking at the data — selecting features, matches, or strategies that "worked" — the sampling distribution of the selected quantity is not the one the theorem describes.

## Why this matters for the rest of the archive

Almost every applied argument that begins "the average of… is approximately normal…" is a claim that the CLT's assumptions hold for *that* situation. The productive question is never the slogan; it is: which assumption is shakiest here — the independence, the identical distribution, or the finite variance? In sports and market data, it is almost always the independence.

- [Walk-forward validation](/blog/walk-forward-validation/) exists because time-ordered data are not i.i.d., and pretending otherwise produces confidence intervals that are far too narrow.
- [Bayes' theorem](/blog/bayes-theorem/) handles belief updating; the CLT handles sampling variability. Confusing the two is a common source of loose reasoning about "statistical significance".
