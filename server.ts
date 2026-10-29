import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI, Type } from '@google/genai';

import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Persistent local data store setup
const DATA_DIR = path.resolve(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const AGENTS_FILE = path.join(DATA_DIR, 'agents.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');

function readJsonFile<T>(filePath: string, fallback: T): T {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2), 'utf-8');
      return fallback;
    }
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return fallback;
  }
}

function writeJsonFile<T>(filePath: string, data: T): void {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
}

// Curated default ElevenLabs voices for conversational agents
const DEFAULT_CURATED_VOICES = [
  {
    voice_id: '21m00Tcm4TlvDq8ikWAM',
    name: 'Rachel',
    category: 'premade',
    description: 'Calm, clear, and professional American female voice. Excellent for customer support and guidance.',
    gender: 'female',
    preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/21m00Tcm4TlvDq8ikWAM/df6788f9-1955-4780-8046-134a3ee69d3d.mp3',
  },
  {
    voice_id: 'cgSgspJ2msm6clMCkdW9',
    name: 'Jessica',
    category: 'premade',
    description: 'Warm, engaging, and expressive American female voice. Perfect for sales and conversation.',
    gender: 'female',
    preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/cgSgspJ2msm6clMCkdW9/56a97bf8-b69b-448f-846c-c3a11683d45a.mp3',
  },
  {
    voice_id: 'JBFqnCBsd6RMkjVDRZzb',
    name: 'George',
    category: 'premade',
    description: 'Warm, articulate, and reassuring British male voice. Great for consultations and coaching.',
    gender: 'male',
    preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/JBFqnCBsd6RMkjVDRZzb/e6206d1a-0786-440f-a45a-33b3276570cc.mp3',
  },
  {
    voice_id: 'onwK4e9ZLuTAKqWW03F9',
    name: 'Daniel',
    category: 'premade',
    description: 'Deep, steady, and authoritative British male voice. Ideal for news, tech, and enterprise.',
    gender: 'male',
    preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/onwK4e9ZLuTAKqWW03F9/7eee0236-1a72-4b86-b303-5dcadc007ba9.mp3',
  },
  {
    voice_id: 'EXAVITQu4vr4xnSDxMaL',
    name: 'Sarah',
    category: 'premade',
    description: 'Soft, empathetic, and gentle young female voice. Great for healthcare and wellness.',
    gender: 'female',
    preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/EXAVITQu4vr4xnSDxMaL/0152d880-3b4a-437f-8d29-ab080e9f1a55.mp3',
  },
  {
    voice_id: 'IKne3meq5aSn9XLyUdCD',
    name: 'Charlie',
    category: 'premade',
    description: 'Natural, casual, and energetic Australian male voice. Friendly and relatable.',
    gender: 'male',
    preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/IKne3meq5aSn9XLyUdCD/102de6f2-22ed-410d-93c6-a2d3d02f779c.mp3',
  },
];

// Initialize Gemini SDK with User-Agent header as required
const geminiApiKey = process.env.GEMINI_API_KEY;
const ai = geminiApiKey
  ? new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// API Route: Status check
app.get('/api/status', (req, res) => {
  res.json({
    gemini_configured: Boolean(process.env.GEMINI_API_KEY),
    elevenlabs_configured: Boolean(process.env.ELEVENLABS_API_KEY),
    server_time: new Date().toISOString(),
    node_env: process.env.NODE_ENV || 'development',
  });
});

// API Route: Voices
app.get('/api/voices', async (req, res) => {
  const elevenlabsApiKey = process.env.ELEVENLABS_API_KEY;

  if (!elevenlabsApiKey) {
    // Return curated voices when key is not configured
    return res.json({
      voices: DEFAULT_CURATED_VOICES,
      source: 'curated_defaults',
      message: 'ELEVENLABS_API_KEY is not set on the server. Showing default curated ElevenLabs voices.',
    });
  }

  try {
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': elevenlabsApiKey,
      },
    });

    if (!response.ok) {
      console.warn(`ElevenLabs voices fetch failed (${response.status}): fallback to curated voices`);
      return res.json({
        voices: DEFAULT_CURATED_VOICES,
        source: 'curated_defaults_fallback',
        warning: `ElevenLabs API returned ${response.status}: using curated voice library.`,
      });
    }

    const data = await response.json();
    const voices = (data.voices || []).map((v: any) => ({
      voice_id: v.voice_id,
      name: v.name,
      category: v.category,
      description: v.labels?.description || v.labels?.accent || 'ElevenLabs Voice',
      preview_url: v.preview_url,
      gender: v.labels?.gender?.toLowerCase() || 'neutral',
    }));

    res.json({
      voices: voices.length > 0 ? voices : DEFAULT_CURATED_VOICES,
      source: 'elevenlabs_api',
    });
  } catch (error: any) {
    console.error('Error fetching ElevenLabs voices:', error);
    res.json({
      voices: DEFAULT_CURATED_VOICES,
      source: 'curated_defaults_fallback',
      warning: error.message,
    });
  }
});

// API Route: AI-powered Structured Agent Generation
app.post('/api/generate-agent', async (req, res) => {
  const { description, role, style, language = 'en', voice_preference } = req.body;

  if (!description || typeof description !== 'string' || !description.trim()) {
    return res.status(400).json({ error: 'Description is required to generate an agent.' });
  }

  if (!ai) {
    return res.status(500).json({
      error: 'GEMINI_API_KEY is not configured on the server. Cannot generate agent configuration.',
    });
  }

  try {
    const prompt = `You are an elite Voice AI Prompt & Systems Engineer for conversational speech agents running on ElevenLabs Conversational AI.
Create a structured, production-grade conversational voice agent configuration based on the user's requirements:

User's description: "${description}"
${role ? `Target Role/Domain: "${role}"` : ''}
${style ? `Desired Tone/Style: "${style}"` : ''}
${language ? `Language: "${language}"` : ''}
${voice_preference ? `Voice Preference: "${voice_preference}"` : ''}

CRITICAL RULES FOR SPOKEN VOICE AGENTS:
1. Spoken voice models DO NOT speak markdown headers, bullet points, asterisks, or tables. The system prompt MUST instruct the agent to speak naturally in clear conversational sentences.
2. The agent's first message should be warm, concise (under 20 words), and open-ended.
3. The system prompt should include:
   - Persona & tone definition
   - Primary goal & conversational boundaries
   - Spoken formatting rules (concise answers 1-3 sentences max, natural pacing, no jargon, no emojis or markdown symbols)
   - Graceful fallback instructions for out-of-scope queries
4. Select one appropriate ElevenLabs Voice ID from:
   - "21m00Tcm4TlvDq8ikWAM" (Rachel - calm, clear American female)
   - "cgSgspJ2msm6clMCkdW9" (Jessica - warm, expressive American female)
   - "JBFqnCBsd6RMkjVDRZzb" (George - articulate, reassuring British male)
   - "onwK4e9ZLuTAKqWW03F9" (Daniel - deep, authoritative British male)
   - "EXAVITQu4vr4xnSDxMaL" (Sarah - gentle, empathetic female)
   - "IKne3meq5aSn9XLyUdCD" (Charlie - friendly, casual male)
5. Generate 3 to 4 realistic test questions that a human tester can speak into their microphone to test the agent.

Generate the response matching the JSON schema.`;

    let response;
    try {
      response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: 'Catchy, professional name for the voice agent' },
              description: { type: Type.STRING, description: 'One-line summary of what this agent does' },
              role: { type: Type.STRING, description: 'Specific role, e.g. Customer Support Specialist or SDR' },
              first_message: { type: Type.STRING, description: 'Spoken greeting under 25 words' },
              system_prompt: { type: Type.STRING, description: 'Complete conversational system instructions' },
              voice_id: { type: Type.STRING, description: 'ElevenLabs voice ID' },
              voice_name: { type: Type.STRING, description: 'Name of the selected voice' },
              language: { type: Type.STRING, description: 'Language code like en' },
              temperature: { type: Type.NUMBER, description: 'Sampling temperature between 0.5 and 0.8' },
              turn_timeout: { type: Type.INTEGER, description: 'Turn timeout in seconds (5-10)' },
              suggested_questions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '3-4 realistic spoken questions for testing',
              },
            },
            required: [
              'name',
              'description',
              'role',
              'first_message',
              'system_prompt',
              'voice_id',
              'voice_name',
              'language',
              'temperature',
              'turn_timeout',
              'suggested_questions',
            ],
          },
        },
      });
    } catch (primaryErr: any) {
      console.warn('Primary model error, falling back to gemini-3.1-flash-lite:', primaryErr?.message);
      response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: 'Catchy, professional name for the voice agent' },
              description: { type: Type.STRING, description: 'One-line summary of what this agent does' },
              role: { type: Type.STRING, description: 'Specific role, e.g. Customer Support Specialist or SDR' },
              first_message: { type: Type.STRING, description: 'Spoken greeting under 25 words' },
              system_prompt: { type: Type.STRING, description: 'Complete conversational system instructions' },
              voice_id: { type: Type.STRING, description: 'ElevenLabs voice ID' },
              voice_name: { type: Type.STRING, description: 'Name of the selected voice' },
              language: { type: Type.STRING, description: 'Language code like en' },
              temperature: { type: Type.NUMBER, description: 'Sampling temperature between 0.5 and 0.8' },
              turn_timeout: { type: Type.INTEGER, description: 'Turn timeout in seconds (5-10)' },
              suggested_questions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '3-4 realistic spoken questions for testing',
              },
            },
            required: [
              'name',
              'description',
              'role',
              'first_message',
              'system_prompt',
              'voice_id',
              'voice_name',
              'language',
              'temperature',
              'turn_timeout',
              'suggested_questions',
            ],
          },
        },
      });
    }

    const text = response.text?.trim() || '{}';
    const parsed = JSON.parse(text);

    const agentConfig = {
      id: `agent_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: parsed.name || 'Voice Assistant',
      description: parsed.description || description,
      role: parsed.role || 'Assistant',
      first_message: parsed.first_message || 'Hello! How can I help you today?',
      system_prompt: parsed.system_prompt || 'You are a helpful and polite voice assistant.',
      voice_id: parsed.voice_id || '21m00Tcm4TlvDq8ikWAM',
      voice_name: parsed.voice_name || 'Rachel',
      language: parsed.language || language || 'en',
      temperature: typeof parsed.temperature === 'number' ? parsed.temperature : 0.7,
      turn_timeout: typeof parsed.turn_timeout === 'number' ? parsed.turn_timeout : 7,
      suggested_questions: Array.isArray(parsed.suggested_questions) ? parsed.suggested_questions : [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Save to agents file
    const currentAgents = readJsonFile<any[]>(AGENTS_FILE, []);
    currentAgents.unshift(agentConfig);
    writeJsonFile(AGENTS_FILE, currentAgents);

    res.json(agentConfig);
  } catch (err: any) {
    console.error('Error in agent generation:', err);
    res.status(500).json({
      error: `Failed to generate agent configuration: ${err.message || 'Unknown error'}`,
    });
  }
});

// API Route: Deploy / Update Agent on ElevenLabs
app.post('/api/elevenlabs/agent', async (req, res) => {
  const elevenlabsApiKey = process.env.ELEVENLABS_API_KEY;

  if (!elevenlabsApiKey) {
    return res.status(400).json({
      error:
        'ELEVENLABS_API_KEY is not configured on the server. To deploy real agents to ElevenLabs and start live browser voice calls, please add ELEVENLABS_API_KEY in your server environment or the Secrets panel.',
      status: 'missing_key',
    });
  }

  const {
    id,
    name,
    system_prompt,
    first_message,
    voice_id,
    language = 'en',
    turn_timeout = 7,
    elevenlabs_agent_id,
  } = req.body;

  if (!name || !system_prompt || !first_message) {
    return res.status(400).json({ error: 'Name, system_prompt, and first_message are required.' });
  }

  const payload = {
    name: name,
    conversation_config: {
      agent: {
        prompt: {
          prompt: system_prompt,
        },
        first_message: first_message,
        language: language,
      },
      tts: {
        voice_id: voice_id || '21m00Tcm4TlvDq8ikWAM',
        model_id: "eleven_turbo_v2",
      },
      turn: {
        turn_timeout: turn_timeout,
      },
    },
  };

  try {
    let elevenAgentId = elevenlabs_agent_id;
    let isNew = !elevenAgentId;

    if (elevenAgentId) {
      // Update existing agent via PATCH
      const patchRes = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${elevenAgentId}`, {
        method: 'PATCH',
        headers: {
          'xi-api-key': elevenlabsApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!patchRes.ok) {
        const patchError = await patchRes.text();
        console.warn(`PATCH agent failed (${patchRes.status}), attempting create: ${patchError}`);
        // Fall back to creating a new one if patch fails
        isNew = true;
        elevenAgentId = null;
      }
    }

    if (isNew || !elevenAgentId) {
      // Create new agent via POST
      const createRes = await fetch('https://api.elevenlabs.io/v1/convai/agents/create', {
        method: 'POST',
        headers: {
          'xi-api-key': elevenlabsApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!createRes.ok) {
        const errText = await createRes.text();
        console.error('ElevenLabs create agent error:', createRes.status, errText);
        return res.status(createRes.status).json({
          error: `ElevenLabs API error (${createRes.status}): ${errText}`,
        });
      }

      const createData = await createRes.json();
      elevenAgentId = createData.agent_id;
    }

    // Update local agent database with elevenlabs_agent_id
    const currentAgents = readJsonFile<any[]>(AGENTS_FILE, []);
    const index = currentAgents.findIndex((a) => a.id === id);
    if (index !== -1) {
      currentAgents[index].elevenlabs_agent_id = elevenAgentId;
      currentAgents[index].updated_at = new Date().toISOString();
      writeJsonFile(AGENTS_FILE, currentAgents);
    }

    res.json({
      agent_id: elevenAgentId,
      is_new: isNew,
      message: isNew
        ? 'Real ElevenLabs Conversational Agent created successfully!'
        : 'Real ElevenLabs Conversational Agent updated successfully!',
    });
  } catch (error: any) {
    console.error('Failed to communicate with ElevenLabs Conversational API:', error);
    res.status(500).json({
      error: `ElevenLabs request failed: ${error.message || 'Network error'}`,
    });
  }
});

// API Route: Get signed conversation URL for browser live testing
app.post('/api/elevenlabs/session', async (req, res) => {
  const elevenlabsApiKey = process.env.ELEVENLABS_API_KEY;
  const { agent_id } = req.body;

  if (!agent_id) {
    return res.status(400).json({ error: 'agent_id is required to start a live voice session.' });
  }

  if (!elevenlabsApiKey) {
    return res.status(400).json({
      error:
        'ELEVENLABS_API_KEY is not configured on the server. A real ElevenLabs API key is required to issue signed conversation session tokens.',
      status: 'missing_key',
    });
  }

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${encodeURIComponent(agent_id)}`,
      {
        method: 'GET',
        headers: {
          'xi-api-key': elevenlabsApiKey,
        },
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('Failed to get signed URL from ElevenLabs:', response.status, errText);
      return res.status(response.status).json({
        error: `ElevenLabs signed URL request failed (${response.status}): ${errText}`,
      });
    }

    const data = await response.json();
    res.json({
      signed_url: data.signed_url,
    });
  } catch (error: any) {
    console.error('Error obtaining ElevenLabs signed conversation URL:', error);
    res.status(500).json({
      error: `Could not obtain signed session URL: ${error.message}`,
    });
  }
});

// API Route: CRUD for Local Agents
app.get('/api/agents', (req, res) => {
  const agents = readJsonFile<any[]>(AGENTS_FILE, []);
  res.json({ agents });
});

app.post('/api/agents', (req, res) => {
  const agent = req.body;
  if (!agent || !agent.name) {
    return res.status(400).json({ error: 'Valid agent data is required.' });
  }

  const agents = readJsonFile<any[]>(AGENTS_FILE, []);
  const index = agents.findIndex((a) => a.id === agent.id);

  if (index !== -1) {
    agents[index] = { ...agents[index], ...agent, updated_at: new Date().toISOString() };
  } else {
    agents.unshift({
      ...agent,
      id: agent.id || `agent_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      created_at: agent.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  writeJsonFile(AGENTS_FILE, agents);
  res.json({ agent: agents[index !== -1 ? index : 0] });
});

app.delete('/api/agents/:id', (req, res) => {
  const { id } = req.params;
  let agents = readJsonFile<any[]>(AGENTS_FILE, []);
  agents = agents.filter((a) => a.id !== id);
  writeJsonFile(AGENTS_FILE, agents);
  res.json({ success: true });
});

// API Route: CRUD for Session History
app.get('/api/sessions', (req, res) => {
  const sessions = readJsonFile<any[]>(SESSIONS_FILE, []);
  res.json({ sessions });
});

app.post('/api/sessions', (req, res) => {
  const session = req.body;
  if (!session || !session.agent_id) {
    return res.status(400).json({ error: 'Valid session payload is required.' });
  }

  const sessions = readJsonFile<any[]>(SESSIONS_FILE, []);
  const newSession = {
    ...session,
    id: `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    created_at: new Date().toISOString(),
  };

  sessions.unshift(newSession);
  writeJsonFile(SESSIONS_FILE, sessions);
  res.json({ session: newSession });
});

// Vite Middleware integration in development vs Static serving in production
async function startServer() {
  if (process.env.NODE_ENV === 'production' && fs.existsSync(path.resolve(process.cwd(), 'dist'))) {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`VoiceForge AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
