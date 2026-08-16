import test from 'node:test'
import assert from 'node:assert/strict'

// Minimal react shim: the factory only defines components (no render happens
// at apply time), so createElement/hooks can be structural.
const reactShim = {
  createElement: (type, props, ...children) => ({ type, props, children }),
  useState: (initial) => [initial, () => {}],
  useEffect: () => {},
}

let loadedDef = null
const createdTags = []
globalThis.window = {
  __ModuleLoader__: { load(def) { loadedDef = def } },
  setInterval: () => 0,
  clearInterval: () => {},
  setTimeout: () => 0,
}
globalThis.document = {
  createElement: (tag) => { const el = { tag, dataset: {}, textContent: '', remove() {} }; createdTags.push(el); return el },
  head: { appendChild: () => {} },
}

await import('../lib/client.js')

test('client bundle hands off through the module loader', () => {
  assert.ok(loadedDef, 'window.__ModuleLoader__.load was called')
  assert.equal(loadedDef.id, 'dsh-usage-tracker')
  assert.equal(typeof loadedDef.factory, 'function')
})

test('client apply registers the four UI surfaces', () => {
  const injected = []
  const registered = []
  const ctx = {
    get() { return undefined },
    effect(fn) { fn(); return () => {} },
    slots: {
      inject(name, factory) { injected.push({ name, factory }) },
      register(options, component) { registered.push({ options, component }); return () => {} },
    },
  }

  const { apply, inject } = loadedDef.factory((id) => (id === 'react' ? reactShim : undefined))
  assert.deepEqual(inject, ['slots'])

  apply(ctx)

  const names = injected.map((x) => x.name).sort()
  assert.deepEqual(names, [
    'conversation.composer.dock',
    'settings.section',
    'shell.overlay',
    'sidebar.footer.action',
  ].sort())

  // Each inject factory, when the slot declares, registers into it.
  for (const { name, factory } of injected) {
    factory()
  }
  assert.equal(registered.length, 4)
  for (const { options } of registered) {
    assert.equal(typeof options.id, 'string')
  }
  assert.ok(registered.some((r) => r.options.name === 'sidebar.footer.action' && r.options.id === 'usage-tracker'))
  assert.ok(registered.some((r) => r.options.name === 'shell.overlay' && r.options.id === 'usage-tracker-panel'))
})
