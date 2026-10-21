export type Entry<T> = readonly [id: string, value: T]

export interface Store<T> {
  get(id: string): Promise<T | undefined>
  set(id: string, value: T): Promise<void>
  remove(id: string): Promise<void>
  list(): Promise<readonly Entry<T>[]>
}

export function localStore<T>(namespace: string): Store<T> {
  const read = (): Record<string, T> => JSON.parse(localStorage.getItem(namespace) ?? "{}") as Record<string, T>
  const write = (entries: Record<string, T>): void => localStorage.setItem(namespace, JSON.stringify(entries))
  return {
    get: async (id) => read()[id],
    set: async (id, value) => write({ ...read(), [id]: value }),
    remove: async (id) => {
      const { [id]: _removed, ...rest } = read()
      write(rest)
    },
    list: async () => Object.entries(read()),
  }
}
