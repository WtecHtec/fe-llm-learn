

import { CopilotKit } from "@copilotkit/react-core";
import { CopilotChat } from "@copilotkit/react-ui";
import "@copilotkit/react-ui/styles.css";
import useShowWeather from "./hooks/useShowWeather.jsx"
import useToolRenderer from "./hooks/useToolRenderer.jsx";


function Chat() {
  useShowWeather()
  useToolRenderer()
  return <CopilotChat
    instructions={"You are assisting the user as best as you can. Answer in the best way possible given the data you have."}
    labels={{
      title: "AI助手",
      initial: "Hi! 👋 有什么帮助您的?",
    }}
  />
}
function App() {

  return (
    <CopilotKit runtimeUrl={`http://localhost:3200/copilotkit`}
    showDevConsole={false}>
        <Chat />
    </CopilotKit>
  )
}

export default App
