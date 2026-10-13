---
title: "Building a Neural Network from Scratch"
date: 2026-01-10
excerpt: "A feedforward network in pure NumPy — forward pass, backprop, and training loop with nothing hidden."
slug: building-from-scratch
---

Frameworks hide the mechanics. That's useful for production, but dangerous for understanding. Here's a neural network built with nothing but NumPy.

## The architecture

A simple feedforward network with one hidden layer:

- Input: $\mathbf{x} \in \mathbb{R}^{d}$
- Hidden: $\mathbf{h} = \sigma(W_1 \mathbf{x} + \mathbf{b}_1)$ where $\sigma$ is ReLU
- Output: $\hat{y} = W_2 \mathbf{h} + \mathbf{b}_2$

For binary classification, pass the output through sigmoid and use binary cross-entropy loss.

## The code

```python
import numpy as np

class NeuralNet:
    def __init__(self, input_dim, hidden_dim, output_dim):
        # Xavier initialization
        self.W1 = np.random.randn(input_dim, hidden_dim) * np.sqrt(2.0 / input_dim)
        self.b1 = np.zeros(hidden_dim)
        self.W2 = np.random.randn(hidden_dim, output_dim) * np.sqrt(2.0 / hidden_dim)
        self.b2 = np.zeros(output_dim)

    def relu(self, x):
        return np.maximum(0, x)

    def sigmoid(self, x):
        return 1 / (1 + np.exp(-np.clip(x, -500, 500)))

    def forward(self, X):
        self.z1 = X @ self.W1 + self.b1
        self.h = self.relu(self.z1)
        self.z2 = self.h @ self.W2 + self.b2
        self.out = self.sigmoid(self.z2)
        return self.out

    def backward(self, X, y, lr=0.01):
        m = X.shape[0]

        # Output gradient
        dz2 = self.out - y.reshape(-1, 1)
        dW2 = (self.h.T @ dz2) / m
        db2 = dz2.mean(axis=0)

        # Hidden gradient
        dh = dz2 @ self.W2.T
        dz1 = dh * (self.z1 > 0).astype(float)  # ReLU derivative
        dW1 = (X.T @ dz1) / m
        db1 = dz1.mean(axis=0)

        # Update
        self.W2 -= lr * dW2
        self.b2 -= lr * db2
        self.W1 -= lr * dW1
        self.b1 -= lr * db1

    def loss(self, y):
        eps = 1e-8
        y = y.reshape(-1, 1)
        return -np.mean(y * np.log(self.out + eps) + (1 - y) * np.log(1 - self.out + eps))
```

That's the entire network. No autograd, no computational graph, no framework magic. Just matrices and calculus.

## Training loop

```python
# Generate synthetic data
np.random.seed(42)
X = np.random.randn(500, 2)
y = ((X[:, 0]**2 + X[:, 1]**2) < 1.5).astype(float)

net = NeuralNet(input_dim=2, hidden_dim=16, output_dim=1)

for epoch in range(1000):
    pred = net.forward(X)
    net.backward(X, y, lr=0.1)

    if epoch % 100 == 0:
        l = net.loss(y)
        acc = ((pred.flatten() > 0.5) == y).mean()
        print(f"Epoch {epoch:4d}  loss={l:.4f}  acc={acc:.3f}")
```

## What you learn from this

### 1. Shapes are everything

The most common bug in neural network code is a shape mismatch. When you build from scratch, you learn to track shapes through every operation:

- `X`: (m, d) — m samples, d features
- `W1`: (d, h) — maps input to hidden
- `z1`: (m, h) — pre-activation
- And so on through every layer

### 2. Gradients flow backward

Backpropagation is just the chain rule applied systematically. The gradient of the loss with respect to `W1` flows through `W2`, through the ReLU, and finally reaches `W1`. Understanding this flow is understanding why deep networks can be hard to train.

### 3. Initialization matters

Try replacing Xavier initialization with `np.random.randn(...) * 10`. Watch the network fail. Large initial weights cause saturated activations and vanishing gradients. The `sqrt(2/n)` scaling factor keeps signals in a reasonable range.

### 4. Learning rate is the most important hyperparameter

Too high: loss explodes. Too low: loss barely moves. There's no formula — you develop intuition by watching training curves.

## When to stop doing this

Once you understand forward passes, backpropagation, and gradient updates at the matrix level, use a framework. PyTorch and JAX exist for good reasons. But build from scratch at least once. The understanding pays dividends every time you debug a model that isn't training.
