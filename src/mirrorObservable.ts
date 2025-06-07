/* eslint-disable @typescript-eslint/no-explicit-any */
import { reaction, runInAction } from 'mobx'

/**
 * Two-way MobX sync across same-origin windows using BroadcastChannels
 */
export function mirrorObservable<T extends object>(
  store: T,
  key: keyof T,
  channelName = 'mobx-sync'
) {
  const channel = new BroadcastChannel(channelName)
  const myId = crypto.randomUUID() // unique per window
  let suppressLocalBroadcast = false // prevents loops
  let gotFirstValue = false // stops duplicate initial writes

  /* Request the initial value */
  channel.postMessage({ type: 'get', key, from: myId })

  /* Broadcast local changes */
  const disposeReaction = reaction(
    () => (store as any)[key],
    value => {
      if (suppressLocalBroadcast) return // another window is sending us its value so don't broadcast
      channel.postMessage({ type: 'set', key, value, from: myId })
    }
  )

  const handleMessage = (ev: any) => {
    const msg = ev.data ?? {}
    if (msg.key !== key) return

    switch (msg.type) {
      // Another window is requesting our value
      case 'get':
        if (msg.from !== myId) {
          channel.postMessage({
            type: 'set',
            key,
            value: (store as any)[key],
            to: msg.from,
            from: myId
          })
        }
        break

      // Another window is sending their value
      case 'set':
        if (msg.from === myId) return // ignore our own broadcasts
        if (msg.to && msg.to !== myId) return // not addressed to us
        if (gotFirstValue && msg.value === (store as any)[key]) return

        suppressLocalBroadcast = true
        runInAction(() => {
          ;(store as any)[key] = msg.value
        })
        suppressLocalBroadcast = false
        gotFirstValue = true
        break
    }
  }

  /* Process inbound messages */
  channel.addEventListener('message', handleMessage)

  const cleanup = () => {
    disposeReaction()
    channel.removeEventListener('message', handleMessage)
    channel.close()
  }

  window.addEventListener('beforeunload', cleanup)

  return cleanup
}
