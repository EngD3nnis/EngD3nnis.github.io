---
title: "Linear Algebra You Actually Need for ML"
date: 2025-09-20
excerpt: "Vectors, matrices, eigenvalues — what matters and what doesn't when building ML systems."
slug: linear-algebra-ml
subject: mathematics
type: essay
tags: [linear-algebra, matrices, machine-learning]
related: [gradient-descent, building-from-scratch]
---

Every machine learning textbook starts with a linear algebra chapter. Most of them cover too much. Here's what you actually need, and why.

## Vectors are data

A single data point with $n$ features is a vector $\mathbf{x} \in \mathbb{R}^n$. A dataset of $m$ points is a matrix $X \in \mathbb{R}^{m \times n}$. Once you accept this framing, every ML operation becomes a matrix operation.

```python
import numpy as np

# 100 data points, 5 features each
X = np.random.randn(100, 5)

# A linear model is a matrix multiply
W = np.random.randn(5, 1)
predictions = X @ W  # shape: (100, 1)
```

That `@` symbol is the entire forward pass of a linear model. Everything else is just making this more expressive.

## Matrix multiplication is composition

If you apply transformation $A$ then transformation $B$, the combined transformation is $BA$. Neural network layers are exactly this: a sequence of linear transformations (matrix multiplies) interleaved with nonlinearities.

The key insight: **the order matters**. $AB \neq BA$ in general. This is why the order of layers in a neural network matters.

## The four operations that matter

### 1. Matrix-vector multiply ($A\mathbf{x}$)

This is the forward pass. Your model takes input $\mathbf{x}$ and produces output $A\mathbf{x}$. Understanding this means understanding what your model does.

### 2. Transpose ($A^T$)

The transpose appears everywhere in gradients. If the forward pass is $y = Ax$, the gradient with respect to $A$ involves $x^T$. You'll see this in every backpropagation derivation.

### 3. Inverse ($A^{-1}$)

You rarely compute inverses explicitly — it's numerically unstable and slow. But the concept matters: solving $Ax = b$ is finding $x = A^{-1}b$. In practice, you use decompositions.

### 4. Eigendecomposition

A matrix $A$ has eigenvalues $\lambda_i$ and eigenvectors $\mathbf{v}_i$ such that $A\mathbf{v}_i = \lambda_i \mathbf{v}_i$. This tells you the "natural axes" of a transformation.

Where this matters:
- **PCA** — the principal components are eigenvectors of the covariance matrix
- **Stability** — a system is stable if all eigenvalues have magnitude less than 1
- **Condition number** — ratio of largest to smallest eigenvalue tells you how numerically stable your problem is

## The dot product is similarity

$$\mathbf{a} \cdot \mathbf{b} = \|\mathbf{a}\| \|\mathbf{b}\| \cos\theta$$

Two vectors pointing in the same direction have a large positive dot product. Orthogonal vectors have zero. This is the foundation of:

- **Cosine similarity** in embedding spaces
- **Attention mechanisms** in transformers
- **Kernel methods** in SVMs

## What you can skip (for now)

- Tensor algebra beyond rank 2 — you'll pick this up as needed
- Abstract vector spaces — you're working in $\mathbb{R}^n$, not function spaces
- Proofs of existence and uniqueness — useful for math, not for engineering
- Jordan normal form — you will likely never need this

## The practical test

If you can implement these from scratch in NumPy, you know enough linear algebra for ML:

1. Matrix multiplication
2. Solving a linear system
3. Computing eigenvalues
4. PCA on a dataset

Everything else builds on these four. Start here, then learn more as specific problems demand it.
