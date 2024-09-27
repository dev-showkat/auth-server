export const logger = (...args) => {
  const message = args.join(" ");
  console.log(`[${new Date().toLocaleString()}] : ${message}`);
};
