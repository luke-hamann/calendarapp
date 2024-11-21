const workerFiles = ["discord", "email"]
const workers = [];
for (const workerFile of workerFiles) {
  const worker = new Worker(
    import.meta.resolve(`./consumers/${workerFile}.ts`),
    { type: "module" });
  workers.push(worker);
}
