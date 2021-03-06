export function normalize<T>(
  array: T[],
  selector: (item: T) => number = (item: any) => item.id,
) {
  const object: {
    [key: string]: T;
  } = {};
  array.forEach(item => {
    object[selector(item)] = item;
  });
  return object;
}
