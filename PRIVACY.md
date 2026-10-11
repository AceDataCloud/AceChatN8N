# Privacy

The model node sends the messages and options supplied by the connected n8n AI Agent or chain, with the application API token, to the Ace Data Cloud chat-completions API at `https://api.acedata.cloud/v1/chat/completions`. The node does not read local files or environment variables or add its own telemetry. n8n stores the token in its credential store; workflow exports should not contain it. Send only content you are authorized to process.

See the [Ace Data Cloud privacy policy](https://platform.acedata.cloud/privacy) and [current chat models and pricing](https://platform.acedata.cloud/models).
