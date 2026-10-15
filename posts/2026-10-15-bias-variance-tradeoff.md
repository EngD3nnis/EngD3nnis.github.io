---
title: "The Bias–Variance Trade-off"
date: 2026-10-15
excerpt: "A study note on the error decomposition behind overfitting — what each term means, where the decomposition comes from, and its honest limitations."
slug: bias-variance-tradeoff
subject: data-science
type: note
tags: [overfitting, generalization, regression]
related: [gradient-descent, building-from-scratch, walk-forward-validation]
---

A study note on the bias–variance decomposition: the standard formal statement under squared loss, an intuitive reading of each term, and a candid list of where the picture breaks down.

## The decomposition (squared loss)

Suppose observations are $y = f(\mathbf{x}) + \varepsilon$ with $\mathbb{E}[\varepsilon] = 0$ and $\mathrm{Var}(\varepsilon) = \sigma^2$, and let $\hat{f}$ be an estimator of $f$ trained on a sample. For a fresh point $\mathbf{x}$, the expected prediction error decomposes as:

$$\mathbb{E}\left[(y - \hat{f}(\mathbf{x}))^2\right] = \underbrace{\left(f(\mathbf{x}) - \mathbb{E}[\hat{f}(\mathbf{x})]\right)^2}_{\text{bias}^2} + \underbrace{\mathbb{E}\left[\left(\hat{f}(\mathbf{x}) - \mathbb{E}[\hat{f}(\mathbf{x})]\right)^2\right]}_{\text{variance}} + \underbrace{\sigma^2}_{\text{irreducible noise}}$$

The expectation is over both the training sample and the noise. Sketch of the algebra: write $y - \hat{f} = (f - \mathbb{E}[\hat{f}]) + (\mathbb{E}[\hat{f}] - \hat{f}) + \varepsilon$, expand the square, and note that the cross terms vanish because $\varepsilon$ is mean-zero and independent of $\hat{f}$, and because the middle term is mean-zero by construction.

## Reading the terms

- **Bias.** The systematic error of the estimator: how far its average prediction sits from the truth. High bias is the signature of models that are too rigid for the problem — a linear model fitted to a clearly curved relationship.
- **Variance.** How much the estimator's predictions swing with a resample of the training data. High variance is the signature of models with enough flexibility to memorise the particular sample they were trained on.
- **Irreducible noise.** The part no estimator can remove: genuine randomness in the data-generating process. Any claim of "eliminating" this term is a claim about the data being cleaner than it is.

## The trade-off

As model flexibility increases (higher-degree polynomials, deeper trees, less regularisation), bias typically falls and variance typically rises. Somewhere between "too rigid" and "too flexible" sits the minimum of their sum. This is the sense in which they trade off.

In practice the operative tools are:

- **Regularisation** — shrink estimator variance at a small bias cost ([gradient descent](/blog/gradient-descent/) is the machinery that fits many such models).
- **Validation on held-out data** — the only honest way to estimate the sum, since neither term is directly observable from a single fitted model.
- **More data** — reduces variance terms (typically like $1/n$) without touching bias; it cannot fix a misspecified model.

## Honest limitations of the picture

- The clean additive decomposition relies on squared loss. For other losses there are analogous but messier expressions; the intuition transfers imperfectly.
- "Bias" and "variance" here are properties of an *estimator averaged over hypothetical training sets*, not of a single fitted model. You never observe either term directly — you observe one realised fit and one validation score.
- The two terms are not always independent dials: in modern overparameterised networks, both can be small simultaneously in regimes the classical picture struggles to describe (the so-called double-descent phenomena). The trade-off remains a useful first mental model, not a law.
- High test error has causes beyond bias and variance: leakage, distribution shift between train and test, label noise, and evaluation mistakes all produce the same symptom.

## Where this connects

- [Building a neural network from scratch](/blog/building-from-scratch/) makes the flexibility concrete: hidden-layer width is a bias–variance dial you can feel when training curves diverge from validation curves.
- [Walk-forward validation](/blog/walk-forward-validation/) is the correct way to estimate the sum when the data are time-ordered — random splits estimate the wrong quantity.
