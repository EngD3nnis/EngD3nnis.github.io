---
title: "Bayes' Theorem: Statement, Intuition, and a Fully Worked Example"
date: 2026-10-15
excerpt: "A study note on conditional probability — the formula, why it is true, one complete numerical example, and the mistakes people make with it."
slug: bayes-theorem
subject: probability
type: note
tags: [bayes, conditional-probability, base-rates]
related: [central-limit-theorem, survivorship-bias-in-strategy-research]
---

A study note recording the statement of Bayes' theorem, a short derivation, one fully worked numerical example, and the common failure modes. Everything here is standard probability; the point of writing it out is to make the reasoning inspectable.

## Statement

For events $A$ and $B$ with $P(B) > 0$:

$$P(A \mid B) = \frac{P(B \mid A)\, P(A)}{P(B)}$$

- $P(A)$ is the **prior**: what you believed before seeing $B$.
- $P(B \mid A)$ is the **likelihood**: how probable $B$ is if $A$ holds.
- $P(A \mid B)$ is the **posterior**: what you believe after seeing $B$.
- $P(B)$ is the **evidence**, obtained from the law of total probability:

$$P(B) = P(B \mid A)P(A) + P(B \mid \neg A)\,P(\neg A)$$

## Why it is true

Both $P(A \mid B)P(B)$ and $P(B \mid A)P(A)$ equal the joint probability $P(A \cap B)$. Setting them equal and dividing by $P(B)$ gives the theorem. No deep machinery — just the definition of conditional probability applied twice.

## Worked example: the classic test

A disease affects $1$ in $1{,}000$ people. A test for it is correct $99\%$ of the time: it returns positive with probability $0.99$ for a person who has the disease, and returns negative with probability $0.99$ for a person who does not. A randomly chosen person tests positive. What is the probability they have the disease?

Define:

- $D$ = has the disease, $+$ = positive test.
- $P(D) = 0.001$, $P(+ \mid D) = 0.99$, $P(+ \mid \neg D) = 0.01$.

By the theorem:

$$P(D \mid +) = \frac{P(+ \mid D)\,P(D)}{P(+ \mid D)\,P(D) + P(+ \mid \neg D)\,P(\neg D)}$$

$$= \frac{0.99 \times 0.001}{0.99 \times 0.001 + 0.01 \times 0.999} = \frac{0.00099}{0.00099 + 0.00999} = \frac{0.00099}{0.01098} \approx 0.0902$$

The positive test implies only about a **9%** probability of having the disease — despite the test being "99% accurate". The prior probability was so low that false positives dominate.

A quick sanity check of the arithmetic: in a population of $100{,}000$, roughly $100$ people have the disease and test positive ($\approx 99$), while roughly $99{,}900$ do not and $1\%$ of them false-positive ($\approx 999$). So $99 / (99 + 999) \approx 0.091$. Consistent.

## The likelihood-ratio form

The same result can be read through the **positive likelihood ratio**:

$$\mathrm{LR}^+ = \frac{P(+ \mid D)}{P(+ \mid \neg D)} = \frac{0.99}{0.01} = 99$$

Evidence multiplies odds. Prior odds of $0.001 / 0.999 \approx 1/999$; multiply by $99$ and you get posterior odds of roughly $99/999 \approx 1/10.1$, i.e. a probability near $9\%$. This "odds × likelihood-ratio" form is often easier to reason with than the raw formula, and it makes one thing obvious: **evidence updates beliefs in proportion to how discriminating it actually is**, not in proportion to how impressive it sounds.

## Where this reasoning fails in practice

- **The prior is doing real work.** Ignoring base rates is the most common error in interpreting tests, forecasts, and backtests. A strategy that "passes" on weak evidence remains weak if the prior probability of a genuine edge was low.
- **Assumed independence.** The derivation above treats each person's outcome as independent given status. If test errors cluster (a bad batch of reagents, a leaky feature in a model), the effective sample size is smaller than it looks.
- **Assuming the likelihood is known.** In real applications $P(B \mid A)$ is itself estimated, with uncertainty. The formula does not protect you from a misspecified likelihood.
- **Optional stopping and repeated testing.** Updating once with pre-specified evidence is not the same as peeking at data until a threshold is crossed; the latter inflates false positives in ways a naive single update does not reflect.

## Where this connects to the archive

- The [central limit theorem](/blog/central-limit-theorem/) concerns how estimates behave under sampling; Bayes' theorem concerns how beliefs should update given evidence. Different questions, frequently confused.
- [Survivorship bias in strategy research](/blog/survivorship-bias-in-strategy-research/) is, at its core, a base-rate failure: the observed sample is not the sample the prior described.
