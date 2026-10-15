---
title: "Gradient Descent from First Principles"
date: 2025-06-15
excerpt: "The geometry and math behind gradient descent — from intuition to a working implementation."
slug: gradient-descent
subject: mathematics
type: derivation
tags: [optimization, calculus, implementation]
related: [building-from-scratch, linear-algebra-ml]
---

Every optimization algorithm in machine learning traces back to one idea: move downhill. Gradient descent is that idea made precise.

## The setup

You have a function $f(\theta)$ that measures how wrong your model is. You want to find the $\theta$ that minimizes it. You can't solve this analytically for most interesting problems, so instead you iterate.

The gradient $\nabla f(\theta)$ points in the direction of steepest ascent. To minimize, go the opposite way:

$$\theta_{t+1} = \theta_t - \alpha \nabla f(\theta_t)$$

where $\alpha$ is the learning rate — how big a step you take.

## Why it works

Think of a bowl. Drop a marble in. Gravity pulls it toward the bottom. The steeper the slope, the faster it moves. That's gradient descent. The gradient tells you slope and direction. The learning rate controls speed.

The critical insight: you don't need to know the shape of the entire bowl. You only need the local slope at your current position. This makes gradient descent tractable even when $\theta$ has millions of dimensions.

## The learning rate problem

Too large and you overshoot the minimum, bouncing around or diverging entirely. Too small and convergence takes forever. This is the fundamental tension.

```python
import numpy as np

def gradient_descent(grad_f, theta_init, lr=0.01, steps=1000):
    """Vanilla gradient descent."""
    theta = theta_init.copy()
    history = [theta.copy()]

    for _ in range(steps):
        g = grad_f(theta)
        theta = theta - lr * g
        history.append(theta.copy())

    return theta, history
```

## A concrete example

Consider minimizing $f(x) = x^2 + 3\sin(x)$. The derivative is $f'(x) = 2x + 3\cos(x)$.

```python
def f(x):
    return x**2 + 3 * np.sin(x)

def grad_f(x):
    return 2 * x + 3 * np.cos(x)

x_init = np.array([4.0])
x_opt, path = gradient_descent(grad_f, x_init, lr=0.1, steps=50)
print(f"Minimum found at x = {x_opt[0]:.4f}, f(x) = {f(x_opt[0]):.4f}")
```

Run this and watch the path converge. Change the learning rate. Watch it break. That's the whole lesson.

## Variants worth knowing

- **Stochastic gradient descent (SGD)** — use a random subset of data per step. Noisy but fast.
- **Momentum** — accumulate velocity. Helps with narrow valleys.
- **Adam** — adaptive learning rates per parameter. The default choice for most deep learning.

Each variant addresses a real limitation of vanilla gradient descent. Understanding the base case makes the variants intuitive.

## The takeaway

Gradient descent is simple. That simplicity is its power — it scales to billions of parameters because the core operation (compute gradient, take step) stays the same regardless of dimension. Everything else in optimization is a refinement of this loop.
