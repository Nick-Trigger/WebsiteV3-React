"""Hardening applied to the Python sandbox before any user code runs.

IMPORTANT — what this is and is not:

This module is *hygiene*, not the security boundary. The boundary is the Web
Worker (no DOM, no page state, no cookies) wrapping a WebAssembly VM with a
CDN-only fetch allowlist and a hard kill-timeout on the main thread. Code
running here cannot reach the page or the network regardless of what this
module does, and a determined caller can work around the patches below from
inside Python. They exist to stop casual misuse and — more usefully — to keep
a program from wrecking the interpreter that later runs in the same session.

Two things are enforced:

1. ``exec`` / ``eval`` / ``compile`` are refused when called from user code.
   The check is caller-based rather than a blanket removal, because Pyodide
   itself compiles and execs the submitted program, and stdlib machinery like
   ``dataclasses`` and ``collections.namedtuple`` build classes with ``exec``.
   Those callers live in their own modules and keep working; only calls made
   from ``__main__`` (the program in the editor) are rejected.

2. Destructive filesystem calls are refused for the directories that hold the
   interpreter itself. The virtual filesystem is per-tab and in-memory, so
   this is not about protecting the visitor's machine — it is about a program
   not being able to delete ``/lib/python3.14`` and leave every later run in
   the session broken. The working directory stays fully writable so that
   ordinary file I/O still works.
"""

import builtins
import os
import shutil
import sys

# Directories holding the interpreter and the playground's own modules.
# Everything else — notably /home/pyodide (the working directory) and /tmp —
# stays writable.
_PROTECTED_PREFIXES = ("/lib", "/usr", "/bin", "/sbin", "/proc", "/dev")

_USER_MODULE = "__main__"

# Pristine callables, captured once so re-applying never wraps a wrapper.
_originals = {}
_installed = False


class SandboxError(RuntimeError):
    """Raised when a program attempts something the playground disallows."""


# --------------------------------------------------------------------------
# Dynamic code execution
# --------------------------------------------------------------------------
def _called_by_user_code():
    """True when the code that called our wrapper is the editor's program."""
    try:
        frame = sys._getframe(2)
    except ValueError:  # pragma: no cover - stack shallower than expected
        return False
    return frame.f_globals.get("__name__") == _USER_MODULE


def _guard_dynamic(name, original, hint):
    def wrapper(*args, **kwargs):
        if _called_by_user_code():
            raise SandboxError("%s() is disabled in this playground. %s" % (name, hint))
        return original(*args, **kwargs)

    wrapper.__name__ = name
    wrapper.__doc__ = original.__doc__
    wrapper._playground_guarded = True
    return wrapper


# --------------------------------------------------------------------------
# Filesystem
# --------------------------------------------------------------------------
def _is_protected(path):
    """True when *path* lands inside the interpreter's own directories."""
    if path is None or isinstance(path, int):
        # An int is an already-open file descriptor; nothing to resolve.
        return False
    try:
        resolved = os.path.abspath(os.fspath(path))
    except (TypeError, ValueError):
        return False
    return any(
        resolved == prefix or resolved.startswith(prefix + "/")
        for prefix in _PROTECTED_PREFIXES
    )


def _refuse(path):
    raise SandboxError(
        "Writing to %s is disabled — that directory holds the Python "
        "interpreter itself. Your working directory is writable, so use a "
        "relative path such as 'data.txt' instead." % path
    )


def _guard_paths(original, positions=(0,)):
    """Wrap a function, refusing calls that target a protected path."""

    def wrapper(*args, **kwargs):
        for index in positions:
            if index < len(args) and _is_protected(args[index]):
                _refuse(args[index])
        return original(*args, **kwargs)

    wrapper.__name__ = getattr(original, "__name__", "wrapped")
    wrapper.__doc__ = original.__doc__
    wrapper._playground_guarded = True
    return wrapper


def _guard_open(original):
    def wrapper(file, mode="r", *args, **kwargs):
        if any(flag in mode for flag in ("w", "a", "x", "+")) and _is_protected(file):
            _refuse(file)
        return original(file, mode, *args, **kwargs)

    wrapper.__name__ = "open"
    wrapper.__doc__ = original.__doc__
    wrapper._playground_guarded = True
    return wrapper


# --------------------------------------------------------------------------
# Installation
# --------------------------------------------------------------------------
_OS_SINGLE = ("remove", "unlink", "rmdir", "removedirs", "truncate")
_OS_PAIR = ("rename", "replace")
_SHUTIL_DEST = ("move", "copy", "copy2", "copyfile")


def _capture():
    """Remember the untouched callables the first time through."""
    if _originals:
        return
    for name in ("exec", "eval", "compile", "open"):
        _originals["builtins." + name] = getattr(builtins, name)
    for name in _OS_SINGLE + _OS_PAIR:
        if hasattr(os, name):
            _originals["os." + name] = getattr(os, name)
    _originals["shutil.rmtree"] = shutil.rmtree
    for name in _SHUTIL_DEST:
        if hasattr(shutil, name):
            _originals["shutil." + name] = getattr(shutil, name)


def _apply():
    """(Re-)install every wrapper, always built from the pristine original."""
    builtins.exec = _guard_dynamic(
        "exec",
        _originals["builtins.exec"],
        "Write the statements out directly instead.",
    )
    builtins.eval = _guard_dynamic(
        "eval",
        _originals["builtins.eval"],
        "Use ast.literal_eval() to parse literals, or json.loads() for JSON.",
    )
    builtins.compile = _guard_dynamic(
        "compile",
        _originals["builtins.compile"],
        "Use the ast module if you need to inspect source code.",
    )
    builtins.open = _guard_open(_originals["builtins.open"])

    for name in _OS_SINGLE:
        key = "os." + name
        if key in _originals:
            setattr(os, name, _guard_paths(_originals[key]))
    for name in _OS_PAIR:
        key = "os." + name
        if key in _originals:
            setattr(os, name, _guard_paths(_originals[key], positions=(0, 1)))

    shutil.rmtree = _guard_paths(_originals["shutil.rmtree"])
    for name in _SHUTIL_DEST:
        key = "shutil." + name
        if key in _originals:
            setattr(shutil, name, _guard_paths(_originals[key], positions=(1,)))


def install():
    """Apply every patch. Safe to call more than once."""
    global _installed
    _capture()
    _apply()
    _installed = True


def refresh():
    """Re-apply anything a previous run replaced.

    ``builtins`` and the imported modules survive between runs, so a program
    that reassigns ``builtins.exec`` would otherwise leave the next run
    unguarded. Re-installing from the captured originals is cheap, so it runs
    before every program.
    """
    if not _installed:
        install()
        return
    guarded = getattr(builtins.exec, "_playground_guarded", False) and getattr(
        builtins.open, "_playground_guarded", False
    )
    if not guarded:
        _apply()
