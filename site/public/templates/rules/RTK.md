# RTK Rule Template

## Rule

Prefix noisy shell commands with `rtk`.

Examples:

```bash
rtk git status
rtk rg -n "pattern" path
rtk npm run build
```

## Why

`rtk` keeps command output smaller and easier to inspect.

## Verification

```bash
which rtk
rtk --version
rtk gain
```
