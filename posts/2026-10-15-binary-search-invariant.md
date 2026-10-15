---
title: "Binary Search: Correctness by Loop Invariant"
date: 2026-10-15
excerpt: "A complete correctness argument and complexity derivation for binary search — written out because invariants are the skill, not the algorithm."
slug: binary-search-invariant
subject: algorithms
type: derivation
tags: [binary-search, invariants, complexity, proofs]
related: []
---

Binary search is taught everywhere and proved properly almost nowhere. This note records the full argument — the loop invariant, why it is correct, and the complexity derivation — because the *technique* of proving a loop correct with an invariant transfers to every algorithm that follows.

## Problem

Given a sorted array $A[0 \dots n-1]$ (non-decreasing) and a target value $x$, return an index $i$ with $A[i] = x$, or report that no such index exists.

## The algorithm

```
lo ← 0; hi ← n − 1
while lo ≤ hi:
    mid ← lo + ⌊(hi − lo)/2⌋
    if A[mid] = x: return mid
    else if A[mid] < x: lo ← mid + 1
    else: hi ← mid − 1
return NOT_FOUND
```

The form matters: `hi ← n − 1` with `lo ≤ hi`, and `mid` computed as `lo + (hi − lo) // 2` (the subtraction avoids overflow in languages with fixed-width integers — irrelevant in Python, essential discipline elsewhere).

## Correctness by loop invariant

Maintain the invariant: **if $x$ exists in $A$, it lies in $A[lo \dots hi]$.**

**Initialisation.** Before the first iteration, $lo = 0$ and $hi = n-1$, so $A[lo \dots hi]$ is the whole array. If $x$ is anywhere in $A$, it is certainly in the whole array. The invariant holds.

**Maintenance.** Suppose the invariant holds at the top of an iteration and $A[\mathrm{mid}] \neq x$. Three cases:

1. $A[\mathrm{mid}] < x$. Since $A$ is sorted, every element at index $\le \mathrm{mid}$ is $\le A[\mathrm{mid}] < x$, so $x$ cannot lie in $A[lo \dots \mathrm{mid}]$. It must lie in $A[\mathrm{mid}+1 \dots hi]$ — which is exactly the new search window after `lo ← mid + 1`. (If no such element exists, the invariant's conditional is vacuously true; the loop will correctly fail to find $x$.)
2. $A[\mathrm{mid}] > x$. Symmetric: $x$ cannot lie in $A[\mathrm{mid} \dots hi]$, so it lies in $A[lo \dots \mathrm{mid}-1]$, the new window after `hi ← mid − 1`.
3. $A[\mathrm{mid}] = x$: we returned the answer, so no further reasoning about the loop is needed.

In every continuing case the invariant is restored for the smaller window.

**Termination.** The loop ends when $lo > hi$, i.e. the window is empty. If $x$ existed in $A$, the invariant says it lies in the window — but an empty window contains nothing, a contradiction. So $x$ does not exist in $A$ and `NOT_FOUND` is correct. (Note the argument structure: the invariant is used *at termination*, which is the step most informal proofs skip.)

The algorithm is therefore correct. $\blacksquare$

## Complexity

**Time.** Each iteration discards at least half of the current window (the mid element plus one side). After $k$ iterations the window size is at most $\lfloor n / 2^k \rfloor$. The loop stops once the window is empty, so the number of iterations $k$ satisfies $2^k \ge n$, giving

$$k = \lceil \log_2 n \rceil + O(1) = O(\log n).$$

Worst case: the target is absent (or at a position forcing the last reduction), and every comparison is made. Best case: one comparison. Average case: $\Theta(\log n)$.

**Space.** The iterative version is $O(1)$: three indices, no recursion stack.

## Edge cases and honest caveats

- **Empty array** ($n = 0$): `hi = −1`, the loop body never runs, `NOT_FOUND` — correct.
- **Duplicates.** The argument above finds *a* matching index, not the first or last. Variants that return the leftmost/rightmost match need a slightly stronger invariant (searching for a *boundary*) and are easy to get subtly wrong; worth re-deriving from scratch before using one from memory.
- **Unsorted input.** The invariant depends entirely on sortedness. With unsorted data the proof collapses and so does the algorithm — silently returning wrong answers rather than crashing. Tests should include this assumption explicitly.
- **$O(\log n)$ is a worst-case guarantee, not a prophecy for wall-clock time.** For small $n$ a linear scan can be faster in practice (better constants, no branching, cache-friendly), which is why production libraries use interpolation or branchless variants, and why Python's `bisect` sits on top of a list while hash-based lookup is preferred when ordering is irrelevant.

## Why write this out

The invariant technique — state what the loop preserves, prove it initially true, prove it preserved, use it at termination — is the same argument pattern used for sorting correctness, Dijkstra's algorithm, and dynamic-programming recurrences. Binary search is simply the shortest complete example worth memorising.
