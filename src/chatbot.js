import { OpenAI } from "openai";

const API_KEY = import.meta.env.VITE_API_KEY;
const ASSISTANT_KEY = import.meta.env.VITE_ASSISTANT_KEY;

const openai = new OpenAI({
    apiKey: API_KEY,
    dangerouslyAllowBrowser: true
});

async function createThread() {
  console.log("Creating a new thread...");
  const thread = await openai.beta.threads.create();
  return thread;
}

async function addMessage(threadId, message) {
  console.log("Adding a new message to thread");
  const response = await openai.beta.threads.messages.create(threadId, {
    role: "user",
    content: message,
  });
  return response;
}

async function runAssistant(threadId, assistantId) {
  console.log("Running assistant for thread");
  const response = await openai.beta.threads.runs.create(threadId, {
    assistant_id: assistantId,
  });
  return response;
}

async function checkingStatus(threadId, runId) {
  const runObject = await openai.beta.threads.runs.retrieve(threadId, runId);

  const status = runObject.status;
  console.log("Current status: " + status);

  if (status === "completed") {
    const messagesList = await openai.beta.threads.messages.list(threadId, {
      order: "desc",
    });
    let message = "";
    if (messagesList.data[0].content[0].type === "text") {
      message = messagesList.data[0].content[0].text.value;
    }
    return message;
  } else {
    console.error("Run did not complete:", runObject);
  }
}

export async function getChatResponse(message) {
  const assistant = await openai.beta.assistants.retrieve(ASSISTANT_KEY);
  const thread = await createThread();
  await addMessage(thread.id, message);
  const run = await runAssistant(thread.id, assistant.id);

  let response = "";
  const pollingInterval = setInterval(async () => {
    const messages = await checkingStatus(thread.id, run.id);
    if (messages) {
      response = messages;
      clearInterval(pollingInterval);
    }
  }, 1000);

  return new Promise((resolve) => {
    const waitForResponse = setInterval(() => {
      if (response.length > 0) {
        clearInterval(waitForResponse);
        resolve(response);
      }
    }, 100);
  });
}
