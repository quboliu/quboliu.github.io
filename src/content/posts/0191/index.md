---
lang: "zh-CN"
pubDatetime: 2026-09-17T12:30:26+08:00
timezone: "Asia/Shanghai"
title: "转载｜Error Handling: Why Every Language Gets It Wrong｜错误处理：为什么每种语言都做错了"
area: "software-engineering"
contentType: "repost"
featured: false
draft: false
tags:
  - "转载"
  - "编程语言"
  - "错误处理"
  - "Rust"
  - "Go"
  - "Java"
  - "Zig"
description: "Stephan Schmidt 关于编程语言错误处理机制的中英双语转载：Java 异常、Go 错误码、Rust Result 与 ?、Zig 错误联合类型与 Monad，哪种方案最接近最优解？"
---
> **Source and translation basis｜来源与翻译依据**
>
> **Author｜作者：** Stephan Schmidt（Amazing CTO）
>
> **Original title｜原文标题：** *Error Handling: Why Every Language Gets It Wrong*
>
> **Original publication date｜原文发表于：** May 27, 2023
>
> **Original article｜原文链接：** [The best way to handle errors for a programming language](https://www.amazingcto.com/best-way-to-handle-errors-for-a-programming-language/)
>
> 本文是 Stephan Schmidt 原文的中英双语转载。英文正文按原文顺序保留，中文翻译紧随英文段落或代码示例之后。

When we write code, errors happen inside functions at the time we call other functions:

> 当我们写代码时，错误发生在函数内部、恰好是我们调用其他函数的时刻：

```rust
fn f() {
// Error can happen when b()
// returns an error
 a = b()
 ...
}
```

The problem that arises is that

> 随之而来的问题是：

- sometimes we don't want to deal with the error and just return from our function
- sometimes we want to mitigate the error
- sometimes we want to handle the error much later—for example, with other errors. Preferably, with normal control flow continuing.

> - 有时我们不想处理错误，只想直接从当前函数返回；
> - 有时我们想缓解（mitigate）这个错误；
> - 有时我们想把错误留到很久以后再处理——比如和其他错误一起处理。最好在此过程中保持正常的控制流继续执行。

Every programming language has found a different solution to these three challenges.

> 面对这三个挑战，每种编程语言都找到了不同的解法。

Java was one of the first mass languages to rise to a higher error management state with Exceptions [^1]. `b` can throw an exception on an error. The calling function can then do nothing, in which case the calling function f returns to its caller with the exception. Or it can deal with the exception later by wrapping the call in try/catch. The downside of the Java method is we can't have normal control flow after the error occurred. Either we handle it or let it bubble up.

> Java 是最早一批凭借异常（Exceptions）登上更高错误管理层次的大众语言之一 [^1]。`b` 可以在出错时抛出异常。调用方函数随后可以什么都不做——此时函数 `f` 会带着这个异常返回给它自己的调用者；也可以用 try/catch 把调用包起来，稍后再处理异常。Java 方案的缺点在于：错误发生之后，我们无法拥有正常的控制流。要么就地处理，要么让它向上冒泡。

One of the downsides of the Java exception mechanism is the declaration of checked exceptions. If our function `f()` declares its exceptions, and the function `b()` throws different exceptions, we need to handle exceptions either way, because it can't bubble up.

> Java 异常机制的另一个缺点，是受检异常（checked exceptions）的声明。如果我们的函数 `f()` 声明了它会抛出的异常，而函数 `b()` 抛出的是另一种异常，那么我们无论如何都得处理它，因为它无法冒泡上去。

Rust found a solution to this with a mechanism to auto convert one error—that of `b()`—to another error—that of `f()`. This way again we can let the error bubble up without dealing with it. Rust uses `?` for that:

> Rust 找到了解决这个问题的办法：一种把一种错误（`b()` 的错误）自动转换为另一种错误（`f()` 的错误）的机制。这样我们又可以不处理错误、直接让它冒泡。Rust 用 `?` 来实现：

```rust
fn f() {
 // Let function f() return
 // error autoconvert and bubble up
 a = b()?
 ...
}
```

Some programming languages deal with the three challenges by returning an error code next to the value. One of these is Go.

> 有些编程语言应对这三个挑战的方式，是在返回值旁边附带一个错误码。Go 就是其中之一：

```go
a, err := b()
```

Now we can deal with the error

> 现在我们可以处理这个错误：

```go
if err != nil { .... }
```

or return from our function. We can have normal program flow after the error—in the error case—unless we want to act on `a`:

> 或者直接从函数返回。在出错的情况下，我们仍然可以保持正常的程序流程——除非我们想对 `a` 做点什么：

```go
a = a + 1
```

doesn't work, if there was an error and `a` is nil.

> 如果发生了错误、`a` 是 nil，上面这行就行不通了。

We now could check for the existence of `a` every time

> 我们现在当然可以每次都检查 `a` 是否存在：

```go
if a != nil { .... }
```

but this becomes cumbersome and unreadable fast.

> 但这样写很快就会变得繁琐且难以阅读。

Some programming languages deal with the problem of control-flow-after-error using Monads.

> 有些编程语言用 Monad 来解决"错误之后如何继续控制流"的问题：

```rust
// a is of type Result<A,E>
a = b()
```

With the Result Monad in place, I can deal with the error or return from the method. As mentioned above, for returning Rust has some special syntax:

> 有了 Result Monad，我可以处理错误，也可以从方法中返回。如前所述，Rust 为"返回"提供了专门的语法：

```rust
a = b()?
```

With the question mark, the function will return at that line when b() returns an error and the error bubbles up with auto converting.

> 有了这个问号，当 `b()` 返回错误时，函数会在那一行直接返回，错误经过自动转换后向上冒泡。

We can also have normal control flow in the case of error but still use `a`. Magic!

> 我们还可以在出错的情况下保持正常控制流，同时继续使用 `a`。神奇吧！

```rust
a = b()
c = a.map(|v| v + 1)

...
// Deal with error later
```

In the case of an error, `c` will be also be an error, otherwise `c` will contain the value of `a` increased by 1. This way we can have the same control flow after an error wether the error occured or not.

> 如果出错了，`c` 也会是一个错误；否则 `c` 就是 `a` 的值加 1。这样，无论错误是否发生，错误之后的控制流都是一致的。

This makes reasoning about the code much easier.

> 这让对代码的推理变得容易得多。

Zig has a short notion of `Result<A,E>` by annotating a type with `!`.

> Zig 用 `!` 标注类型，为 `Result<A,E>` 提供了一种简写形式：

```zig
// Returns i32
fn f() i32 {
...
}

// Returns i32 or an error
fn f() !i32 {
...
}
```

Zig also solves the Java problem of the tedious declaration of exception by flow analysis. It checks your function `f()` and find out all the errors it can return. Then, if you check for a specific error in the calling code, it makes sure it is exhaustive.

> Zig 还通过控制流分析解决了 Java 那种繁琐的异常声明问题。它检查你的函数 `f()`，找出它可能返回的所有错误。然后，如果你在调用代码中检查了某个特定错误，它会确保这种检查是穷尽的（exhaustive）。

Rust with `?` has a special syntax to return on the spot. Java has special syntax with `try/catch` to **not** return on the spot and return to the caller of the function if we don't write additional code.

> Rust 用 `?` 这个特殊语法来"就地返回"。Java 则用 `try/catch` 这个特殊语法来"不就地返回"——如果我们不写额外代码，默认是把异常返回给函数的调用者。

The question is: What do we do more often? Return on error or keep going? What we do more often, should have the less verbose syntax. With the `?` case in Rust, should we need a `?` for returning on the spot, or `?` to not return?

> 问题在于：哪种情况更常见？出错即返回，还是继续执行？更常见的那个，才应该配更简洁的语法。就 Rust 的 `?` 而言，我们应该用 `?` 表示就地返回，还是用 `?` 表示不返回？

```
a = b()?
```

The `?` can either mean, "return on error". Or the behavior could be, always return on the spot if `b()` returns an error and the `?` prevents this.

> `?` 既可以表示"出错就返回"；也可以反过来：默认行为是 `b()` 出错时就地返回，而 `?` 用来阻止这种返回。

It depends on what happens more often.

> 这取决于哪种情况发生得更多。

Golang might give us another clue. It has special syntax for cleanup when a function returns:

> Go 也许能给我们另一条线索。它有专门的语法，用于在函数返回时做清理：

```go
f := File.open("my.txt")
// Make sure we close the file
// on exiting the function
defer f.close()

a, err = b()

if err != nil {
  // f.close() is called here
  return
}
```

Java has something less elegant with finally. It looks like people think errors should bubble up, and we need some simple clean up in that case.

> Java 的 finally 就没那么优雅了。看起来人们认为错误应该向上冒泡，而在那种情况下我们只需要一些简单的清理。

And from my experience, I also suspect we would want to let most errors bubble up with auto conversion, so the `?` should perhaps signal that we don't want the function to return, the opposite of what Rust is doing.

> 根据我的经验，我也怀疑大多数情况下我们都希望错误带着自动转换向上冒泡，所以 `?` 或许应该用来表示"我们不想让函数返回"——也就是和 Rust 的做法正好相反。

It seems Java was right with exceptions. No syntax means bubble-up behavior. It missed auto conversion and `Exception<V,E>` from Rust though—and a local, simple `defer` like Go instead of the non-local, verbose `finally` of Java. And Java didn't explain how to properly use exceptions, so everyone used them the wrong way.

> 看来 Java 的异常设计方向是对的：不写语法就表示冒泡。不过它缺了 Rust 那种自动转换和 `Exception<V,E>`，也缺一个像 Go 那样局部的、简洁的 `defer`——而不是 Java 那种非局部的、冗长的 `finally`。而且 Java 没有讲清楚如何正确地使用异常，于是所有人都用错了。

**What about a hypothetical language like this:**

> **如果有一门假想中的语言，长这样：**

```
fn f() {
  // b() returns Result<V,E> or !V in Zig,
  // f() returns if b is an error
  // a is of type V
  a = b()

  // do not return on error but
  // a is of type Result<V,E> or !V
  a = b()!

  // compiles to a = a.map(|v| v + 1)
  a = a + 1

  // compiles to c = a.map(|v| v.c())
  // c is of type Result<C,E>
  c = a.c()
  ...
}
```

This has a much higher readability.

> 这样的可读性要高得多。

What should we do though when calling another method?

> 不过，当我们调用另一个方法时该怎么办？

```
// Does not work if d expects
// C as a parameter type
// and not Result<C,E>
d(c)
```

Some languages have a special language syntax to deal with the problem. E.g. Haskell has `do` and Scala has `for`. But then you have special code around errors, and a special context. Which makes things harder to read again, contrary to the intentions.

> 有些语言用专门的语法来处理这个问题，比如 Haskell 的 `do` 和 Scala 的 `for`。但这样一来，错误周围就出现了特殊的代码和特殊的上下文，反而又让代码更难读了——与设计初衷背道而驰。

So it's best to throw a compiler error. And remember, the default way is to bubble up and `a` being of type `V`.

> 所以最好的做法是直接报编译错误。别忘了，默认行为是冒泡，而 `a` 的类型是 `V`。

We can ease the pain with control flow analysis. Some programming languages like TypeScript do someting like this:

> 我们可以用控制流分析来缓解这种痛苦。像 TypeScript 这样的编程语言就是这么做的：

```
a = b()
a = a + 1 // A is still Result<V,E>
if a instanceof Error {
 return
}
// A is now of type V
// because we checked for an error
d(a)
```

It looks like every programming language holds a piece to the optimal error handling puzzle. None has succeeded from what I can see.

> 看起来每种编程语言都握着最优错误处理拼图的一块。但据我所见，还没有哪种语言拼出了完整的图。

That's All Folks.

> 就到这里吧，朋友们。

[^1]: _I've used `ON ERROR GOTO` in BASIC which is some kind of exception handling—with one of the problems right there in the `GOTO`—and LISP did everything much earlier._ ↩︎
>
> 我在 BASIC 里用过 `ON ERROR GOTO`，那也算某种异常处理——问题之一就明摆在 `GOTO` 里——而 LISP 做成这一切要早得多。
