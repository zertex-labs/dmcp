(() => {
  Bun.write('src/Logs.log', '');
  console.log('Cleared logs.');
})();
