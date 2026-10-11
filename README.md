# Ace Data Cloud Chat Model for n8n

Connect one Ace Data Cloud chat model to an n8n AI Agent or Basic LLM Chain. This package uses only the Ace Data Cloud chat-completions API. The screenshots show a real self-hosted n8n 2.42.3 editor in English. The n8n AI Node SDK is in preview, and Creator Portal verification is pending.

**Package:** `@acedatacloud/n8n-nodes-ace-chat-model` · [Current chat models and pricing](https://platform.acedata.cloud/models) · [Source](https://github.com/AceDataCloud/AceChatN8N)

## Quick start

### 1. Install the chat model

In self-hosted n8n, sign in as an owner or admin. Open **Settings → Community nodes → Install**, enter `@acedatacloud/n8n-nodes-ace-chat-model`, check the author **Ace Data Cloud**, accept the installation notice and select **Install**. Your server needs HTTPS access to npm and `api.acedata.cloud`. See [n8n's community installation guide](https://docs.n8n.io/integrations/community-nodes/installation-and-management/gui-installation/) for prerequisites. n8n Cloud picker availability requires separate official verification.

Search for **Ace Data Cloud Chat Model** in the node picker after installation. It is an AI language-model subnode that connects to a chain or Agent's **Model** input.

![Ace Data Cloud Chat Model in the local n8n node picker](https://raw.githubusercontent.com/AceDataCloud/AceChatN8N/main/_assets/tutorial/01-node-picker.png)

### 2. Get an API key with AI Chat access

1. Sign in at [Ace Data Cloud → Applications](https://platform.acedata.cloud/console/applications).
2. Open **General application** and copy its API key, or choose **Manage Keys → Create** for a separate n8n key.
3. Check AI Chat access, the current `gpt-4.1-mini` price and your balance. If **Allowed APIs** is enabled, include `/v1/chat/completions`. Include the read-only `/v1/models` route if you want n8n's credential test to work.

![Copy a key or open Manage Keys](https://raw.githubusercontent.com/AceDataCloud/KlingDify/d09e7c0201532a012388a277ce3cc42d2e0716c7/_assets/tutorial/get-api-key-en.png)

![Create a separate key](https://raw.githubusercontent.com/AceDataCloud/KlingDify/d09e7c0201532a012388a277ce3cc42d2e0716c7/_assets/tutorial/create-api-key-en.png)

Copy only the application token. Do not add `Bearer ` or quotation marks, and do not use a platform management token. Never paste a key into a prompt or workflow export.

### 3. Save the credential in n8n

Open the **Ace Data Cloud Chat Model** node. In **Credential**, choose **Connect to Ace Data Cloud Chat** and create a credential. Paste the token into **API Token**. Set **Allowed HTTP Request Domains** to **Specific Domains → `api.acedata.cloud`**, then save. The credential test reads `/v1/models`; passing it confirms token access to metadata, while the first chat execution checks model access.

![Empty Ace Data Cloud credential form in n8n](https://raw.githubusercontent.com/AceDataCloud/AceChatN8N/main/_assets/tutorial/02-credential.png)

### 4. Import the smallest workflow

[Download the credential-free quickstart](https://github.com/AceDataCloud/AceChatN8N/raw/refs/heads/main/examples/quickstart.json). In a new workflow, choose **⋯ → Import → From file**. The path is **Start → Basic LLM Chain**, with **Ace Data Cloud Chat Model** connected to the chain's required **Model** input. Assign your saved credential to the model node.

![Imported Basic LLM Chain and connected chat model in n8n 2.42.3](https://raw.githubusercontent.com/AceDataCloud/AceChatN8N/main/_assets/tutorial/03-workflow.png)

| Field | First-run value |
| --- | --- |
| Basic LLM Chain → Prompt | `In one sentence, explain what an API key is.` |
| Ace Data Cloud Chat Model → Model | `gpt-4.1-mini` |
| Credential | The AI Chat application key saved above |

The model ID is a chat-completions model ID, not an image or video model. The package fixes the Base URL to `https://api.acedata.cloud/v1`, which sends chat calls to `/v1/chat/completions`. Keep n8n **Retry On Fail** off and select **Execute workflow** once.

![Chat model parameters in n8n](https://raw.githubusercontent.com/AceDataCloud/AceChatN8N/main/_assets/tutorial/04-configure.png)

### 5. Read the answer and usage

Open **Basic LLM Chain** output after the run and read its answer. If the run fails or times out, check the original n8n execution and [Ace Data Cloud usage history](https://platform.acedata.cloud/console) before trying again; a request might have reached the service. Compare the key, model and execution time with the usage row. Consumption is in **Credits**, not USD; the current package rate determines its USD equivalent.

The SDK's automatic POST retry count is fixed at zero. The screenshots show an empty credential and configuration, not a credentialed model response. A real n8n answer and matching usage row have not yet been verified for this release.

## Scope and troubleshooting

This package exposes the Ace Data Cloud chat-completions service only. It does not proxy image, video, music, search or unrelated APIs. It does not send calls to the Responses or stateful-conversation APIs and does not substitute one model for another. Model IDs are entered explicitly because availability and pricing change; use a chat-completions model your key can access. Advanced model-specific parameters and tool-calling combinations have not been claimed as live n8n results.

| What you see | What to check |
| --- | --- |
| 401 or 403 | Check the application token, AI Chat access, model entitlement and Allowed APIs. |
| 400 or model unavailable | Check that the exact model ID supports chat completions and is available to this key. |
| 429 | Reduce concurrency. The SDK will not automatically retry the paid POST. |
| Timeout or 5xx | Inspect the original execution and usage before a manual retry. |
| Chat model does not appear | Confirm the package loaded in this n8n version and connect it to a chain or Agent's Model input. |

The API key stays in n8n credential storage. [Privacy](https://github.com/AceDataCloud/AceChatN8N/blob/main/PRIVACY.md) · [Report an issue](https://github.com/AceDataCloud/AceChatN8N/issues) · dev@acedata.cloud
