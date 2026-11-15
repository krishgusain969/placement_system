import os
import json
import httpx

# ------------------------------------------------------------
# Recraft model client (recraft-v4.1-flash-v2) via OpenRouter
# ------------------------------------------------------------
# Set your OpenRouter API key as an environment variable or edit the
# line below.  The key you provided is inserted directly for convenience.
# In production you should keep the key secret (e.g., in a .env file).

API_KEY = os.environ.get("OPENROUTER_API_KEY", "")  # Set via environment variable or .env file

# Recraft model identifier on OpenRouter
MODEL_ID = "recraft/recraft-v4.1-flash-v2:free"

# OpenRouter endpoint for chat completions
ENDPOINT = "https://openrouter.ai/api/v1/chat/completions"


def call_recraft(messages, temperature: float = 0.7, max_tokens: int = 512):
    """Send a chat request to the Recraft model.

    Parameters
    ----------
    messages: list[dict]
        List of message dicts with ``role`` (system, user, assistant) and
        ``content`` fields, following the OpenAI chat format.
    temperature: float, optional
        Sampling temperature; default 0.7.
    max_tokens: int, optional
        Maximum tokens for the response; default 512.
    """
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "placement-system",
        "X-Title": "Recraft Demo",
    }

    payload = {
        "model": MODEL_ID,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }

    try:
        response = httpx.post(ENDPOINT, headers=headers, json=payload, timeout=30.0)
        response.raise_for_status()
        data = response.json()
        # The assistant's reply is located at choices[0].message.content
        return data["choices"][0]["message"]["content"]
    except httpx.HTTPStatusError as e:
        raise RuntimeError(f"HTTP error {e.response.status_code}: {e.response.text}")
    except Exception as e:
        raise RuntimeError(f"Request failed: {e}")


if __name__ == "__main__":
    # Simple demo – ask the model a question
    demo_messages = [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user",   "content": "Explain the difference between a list and a tuple in Python."},
    ]
    reply = call_recraft(demo_messages)
    print("Recraft response:\n", reply)
