import { supplyModel } from "@n8n/ai-node-sdk";
import { NodeConnectionTypes, UserError } from "n8n-workflow";
import type {
  INodeType,
  INodeTypeDescription,
  ISupplyDataFunctions,
  SupplyData,
  ILoadOptionsFunctions,
  INodePropertyOptions,
} from "n8n-workflow";

const baseUrl = "https://api.acedata.cloud/v1";

export class LmChatAceDataCloud implements INodeType {
  description: INodeTypeDescription = {
    displayName: "Ace Data Cloud Chat Model",
    name: "lmChatAceDataCloud",
    icon: { light: "file:icon.png", dark: "file:icon.dark.png" },
    group: ["transform"],
    version: [1],
    description: "Use an Ace Data Cloud chat model in an AI Agent or chain",
    subtitle: '={{ $parameter["model"] }}',
    defaults: { name: "Ace Data Cloud Chat Model" },
    inputs: [],
    outputs: [NodeConnectionTypes.AiLanguageModel],
    outputNames: ["Model"],
    credentials: [{ name: "aceDataChatApi", required: true }],
    codex: {
      categories: ["AI"],
      subcategories: {
        AI: ["Language Models", "Root Nodes"],
        "Language Models": ["Chat Models (Recommended)"],
      },
      resources: {
        primaryDocumentation: [
          { url: "https://github.com/AceDataCloud/AceChatN8N#quick-start" },
        ],
        credentialDocumentation: [
          {
            url: "https://github.com/AceDataCloud/AceChatN8N#3-save-the-credential-in-n8n",
          },
        ],
      },
    },
    properties: [
      {
        displayName: "Model Name or ID",
        name: "model",
        type: "options",
        typeOptions: { loadOptionsMethod: "getModels" },
        default: "gpt-4.1-mini",
        required: true,
        description:
          'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
      },
    ],
  };

  methods = {
    loadOptions: {
      async getModels(
        this: ILoadOptionsFunctions,
      ): Promise<INodePropertyOptions[]> {
        const response: unknown =
          await this.helpers.httpRequestWithAuthentication.call(
            this,
            "aceDataChatApi",
            {
              method: "GET",
              url: `${baseUrl}/models`,
              json: true,
              timeout: 30000,
            },
          );
        if (
          !response ||
          typeof response !== "object" ||
          !("data" in response) ||
          !Array.isArray(response.data)
        )
          throw new UserError(
            "The model catalog returned an unexpected response. Check API access or enter the exact chat model ID with an expression.",
          );
        const ids = new Set<string>();
        for (const entry of response.data) {
          if (
            !entry ||
            typeof entry !== "object" ||
            typeof entry.id !== "string"
          )
            continue;
          const id = entry.id.trim();
          // The public catalog also contains non-chat capabilities; never offer these as a chat model.
          if (
            !id ||
            id.length > 128 ||
            /^(?:dall-e|gpt-image|nano-banana|text-embedding|embedding|whisper|tts|sora|suno|seedance|seedream|happyhorse|flux|veo|wan|kling)(?:[-:/]|$)/i.test(
              id,
            ) ||
            id === "gpt-4o-image"
          )
            continue;
          ids.add(id);
        }
        if (!ids.size)
          throw new UserError(
            "No chat models were returned. Check model-list permissions or enter the exact chat model ID with an expression.",
          );
        return [...ids].sort().map((id) => ({ name: id, value: id }));
      },
    },
  };

  async supplyData(
    this: ISupplyDataFunctions,
    itemIndex: number,
  ): Promise<SupplyData> {
    const credentials = await this.getCredentials("aceDataChatApi");
    const token = credentials.apiToken;
    if (typeof token !== "string" || !token.trim())
      throw new UserError("An Ace Data Cloud Chat API credential is required");
    const rawModel = this.getNodeParameter("model", itemIndex);
    if (
      typeof rawModel !== "string" ||
      !rawModel.trim() ||
      rawModel.length > 128
    )
      throw new UserError(
        "Enter a chat-completions model ID of at most 128 characters",
      );
    return supplyModel(this, {
      type: "openai",
      baseUrl,
      apiKey: token.trim(),
      model: rawModel.trim(),
      useResponsesApi: false,
      maxRetries: 0,
      timeout: 300000,
    });
  }
}
