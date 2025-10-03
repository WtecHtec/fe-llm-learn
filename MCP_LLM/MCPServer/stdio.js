import WeatherServer from "../WeatherMCPServer/index.js"
async function main() {
    console.log("注册成功")
    new WeatherServer().run();
  }
  
main().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
});