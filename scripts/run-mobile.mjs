const host = process.env.ANDROID_API_HOST || "10.0.2.2";
const port = process.env.ANDROID_API_PORT || process.env.API_PORT || "4000";

console.log(`Running Android mobile suite against http://${host}:${port}`);
console.log(
  "Start the Android emulator separately, then run the mobile app and your chosen automation suite against it."
);
