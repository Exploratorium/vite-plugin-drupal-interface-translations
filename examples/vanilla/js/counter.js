export function setupCounter(element) {
  let counter = 0;
  const setCounter = (count) => {
    counter = count;
    element.innerHTML = Drupal.formatPlural(
      counter,
      'counted @count time',
      'counted @count times',
    );
  };
  element.addEventListener('click', () => setCounter(counter + 1));
  setCounter(0);
}
