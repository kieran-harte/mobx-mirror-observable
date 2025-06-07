# mobx-mirror-observable

Two-way MobX sync across same-origin browser windows/tabs using `BroadcastChannel`.

## Installation

```bash
npm install mobx-mirror-observable
```

## Quick start

```ts
import { mirrorObservable } from 'mobx-mirror-observable'

// Start syncing a specific observable property across windows
const stop = mirrorObservable(myStore, 'someObservableKey')

// Optionally, stop the sync if no longer needed:
stop()
```

Now, any changes to `myStore.someObservableKey` will be automatically mirrored across other tabs on the same origin.

## API

```ts
const stop = mirrorObservable(
  store: object,
  key: keyof typeof store,
  channelName?: string
): () => void
```

| Parameter   | Type   | Default                    | Description                                                |
| ----------- | ------ | -------------------------- | ---------------------------------------------------------- |
| store       | object | —                          | The MobX store containing the observable                   |
| key         | string | —                          | The observable property to sync                            |
| channelName | string | `"mobx-mirror-observable"` | (Optional) Name of the `BroadcastChannel` used for syncing |

### Return value

A cleanup function:

| Property | Type         | Description                                      |
| -------- | ------------ | ------------------------------------------------ |
| `stop()` | `() => void` | Disposes the sync, reaction, and event listeners |

### Notes

- Sync is **two-way**, with feedback loops prevented automatically.
- On startup, the tab will request the current value from others.
- Only **same-origin** tabs or windows are supported.
- Uses the native `BroadcastChannel` API (supported in modern browsers).

## License

MIT © 2025 Kieran Harte
