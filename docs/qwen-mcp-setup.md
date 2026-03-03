# Qwen MCP Image Generation - Quick Reference

## Status: 🔲 Pending Installation

The skill has been updated to support Qwen MCP. Once you install the Qwen MCP server, image generation will work seamlessly.

## Installation Steps

### 1. Install Qwen MCP Server

```bash
# Via npm (if using Node.js MCP server)
npm install -g qwen-mcp-server

# Or via pip (if using Python MCP server)
pip install qwen-mcp-server
```

### 2. Configure Claude MCP

Add to your Claude MCP configuration (typically in `~/.claude/mcp_config.json` or similar):

```json
{
  "mcpServers": {
    "qwen-image": {
      "command": "node",
      "args": ["/path/to/qwen-mcp-server/dist/index.js"],
      "env": {
        "QWEN_API_KEY": "your-qwen-api-key-here"
      }
    }
  }
}
```

### 3. Get Qwen API Key

1. Visit [Qwen AI Platform](https://qwen.ai) or your Qwen provider
2. Create an account and generate an API key
3. Add the key to your MCP configuration

## Usage After Installation

### Command Line

```bash
# Generate with Qwen MCP
~/.claude/skills/gemini-image-generator/scripts/generate-mcp.py \
  --backend qwen \
  --subject "Bitcoin with blockchain network" \
  --slug "what-is-bitcoin" \
  --category crypto-basics
```

### Via Claude (when MCP is available)

Simply ask Claude to generate an image:

```
Generate a featured image for "What is Bitcoin?" article
using the qwen backend
```

## Backend Comparison

| Backend | Cost | Speed | Quality | Quota |
|---------|------|-------|--------|-------|
| Gemini | Free tier limited | Fast | Good | 0/day (free) |
| Qwen | TBD | Fast | Good | TBD |
| OpenAI | Paid | Fast | Excellent | Based on plan |

## Troubleshooting

### Qwen MCP not detected
- Check MCP server is running: `ps aux | grep qwen`
- Verify Claude MCP configuration
- Check QWEN_API_KEY is set

### Fallback behavior
The script will automatically fall back to Gemini if Qwen is not available.

## Files Created

- `generate-mcp.py` - Multi-backend generator script
- `skill.md` - Updated skill documentation
- This setup guide

---

**Ready to use once Qwen MCP is installed!**
