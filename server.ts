import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry header requested in SKILL.md
let ai: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// 1. API: Health Check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasApiKey: !!process.env.GEMINI_API_KEY,
  });
});

// Helper dictionary for mock custom fallback generation when API key is missing
const MOCK_TOPICS: Record<string, any> = {
  cars: {
    name: "Classic Sports Cars",
    description: "Retro speed and legendary designs of classic automotive history.",
    items: [
      {
        name: "Mustang",
        clue: "A legendary American pony car introduced by Ford in 1964, famous for its roaring V8 and athletic muscle look.",
        choices: ["Mustang", "Camaro", "Corvette", "Challenger"],
        searchQuery: "classic mustang car"
      },
      {
        name: "Porsche 911",
        clue: "An iconic rear-engined German sports car introduced in 1964, renowned for its beetle-inspired continuous silhouette.",
        choices: ["Porsche 911", "Ferrari Dino", "Aston Martin DB5", "Jaguar E-Type"],
        searchQuery: "porsche 911 retro"
      },
      {
        name: "Beetle",
        clue: "An ubiquitous, air-cooled bubble car designed in Germany, becoming a global symbol of retro counter-culture.",
        choices: ["Beetle", "Mini Cooper", "Fiat 500", "Citroen 2CV"],
        searchQuery: "vw beetle classic"
      },
      {
        name: "Corvette",
        clue: "America's hallmark fiberglass-bodied sports car, introduced by Chevrolet with a sleek stingray silhouette.",
        choices: ["Corvette", "Thunderbird", "Cobra", "Firebird"],
        searchQuery: "chevrolet corvette vintage"
      }
    ]
  },
  cats: {
    name: "Feline Companions",
    description: "Elegant household hunters and fluffy cat breeds.",
    items: [
      {
        name: "Siamese",
        clue: "An elegant, blue-eyed cat breed from Thailand, characterized by dark 'points' on its ears, face, paws, and tail.",
        choices: ["Siamese", "Persian", "Maine Coon", "Bengal"],
        searchQuery: "siamese cat"
      },
      {
        name: "Maine Coon",
        clue: "One of the largest domesticated feline breeds, known for its thick shaggy coat, tufted ears, and dog-like behavior.",
        choices: ["Maine Coon", "Siberian", "Ragdoll", "British Shorthair"],
        searchQuery: "maine coon cat"
      },
      {
        name: "Persian",
        clue: "A glamorous long-haired cat breed with a distinctive flat face, snub nose, and round copper eyes.",
        choices: ["Persian", "Himalayan", "Angora", "Scottish Fold"],
        searchQuery: "persian cat fluffy"
      }
    ]
  }
};

// 2. API: Generate Custom Quiz Category via Gemini 3.5 Flash
app.post("/api/gemini/generate-category", async (req, res) => {
  const { topic } = req.body;
  
  if (!topic || typeof topic !== "string" || topic.trim() === "") {
    return res.status(400).json({ error: "A valid topic string has not been provided." });
  }

  const cleanTopic = topic.trim();

  // If there's no API key loaded in the system, fall back gracefully to a robust generator or direct responses
  if (!ai) {
    console.log("No GEMINI_API_KEY detected. Running educational fallback mock category generator.");
    
    // Check if we have a direct match for key mock topics
    const normalized = cleanTopic.toLowerCase();
    let selectedMock = MOCK_TOPICS[normalized];
    
    if (!selectedMock) {
      // Find partial or default
      const keys = Object.keys(MOCK_TOPICS);
      const matchingKey = keys.find(k => normalized.includes(k) || k.includes(normalized));
      if (matchingKey) {
        selectedMock = MOCK_TOPICS[matchingKey];
      } else {
        // Build a dynamic generic mock based on their input topic
        selectedMock = {
          name: cleanTopic.charAt(0).toUpperCase() + cleanTopic.slice(1),
          description: `An engaging knowledge review game celebrating the subject of ${cleanTopic}.`,
          items: [
            {
              name: `${cleanTopic} Item Alpha`,
              clue: `A prominent example representing the theme of ${cleanTopic}, widely studied for its iconic features.`,
              choices: [`${cleanTopic} Item Alpha`, `Alternative Beta`, `Competitor Gamma`, `Specimen Delta`],
              searchQuery: `${cleanTopic} iconic`
            },
            {
              name: `${cleanTopic} Item Beta`,
              clue: `Another critical pillar of ${cleanTopic} which brings historic value and distinct characteristics.`,
              choices: [`${cleanTopic} Item Beta`, `Alternative Alpha`, `Specimen Theta`, `Variant Epsilon`],
              searchQuery: `${cleanTopic} item`
            },
            {
              name: `${cleanTopic} Gem`,
              clue: `A beloved, rare specimen under ${cleanTopic} that collectors, historians, or specialists pride incredibly.`,
              choices: [`${cleanTopic} Gem`, `Standard Classic`, `Basic Replica`, `Vintage Model`],
              searchQuery: `${cleanTopic} aesthetic`
            }
          ]
        };
      }
    }
    
    return res.json({ 
      category: selectedMock,
      note: "No Gemini API key was provided, so a local topic compiler generated this item list."
    });
  }

  try {
    const prompt = `Develop a "Name and Photo Guessing" game category based around the theme of "${cleanTopic}".
      Provide exactly 6 unique, recognizable items belonging to this category.
      Ensure the items are visually distinct so that search queries generate high-quality photos.
      Provide highly descriptive, educational "clues" (like definitions) that do not explicitly blurt out the correct item name.
      Provide four multiple-choice options for each item (including the correct item name).
      Include a super specific, clean searchQuery suitable to get stock photos (e.g. if the item is 'Einstein', search query is 'Albert Einstein face portrait').`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a professional quiz maker and visual education curriculum designer. You write engaging, child-friendly, highly accurate quiz sets in strict JSON layout.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: {
              type: Type.STRING,
              description: "A capitalized, elegant name of the visual category, e.g., 'Retro Spaceships' or 'Ancient Castles'."
            },
            description: {
              type: Type.STRING,
              description: "A short, engaging pitch explaining what learners will recognize here."
            },
            items: {
              type: Type.ARRAY,
              description: "Exactly 6 detailed visual units for guessing.",
              items: {
                type: Type.OBJECT,
                properties: {
                  name: {
                    type: Type.STRING,
                    description: "The official human-readable name of the item (e.g. 'Golden Gate Bridge', 'Mustang GT', 'Avocado'). 1 to 3 words max."
                  },
                  clue: {
                    type: Type.STRING,
                    description: "An educational description outlining its purpose, size, history, or appearance without using the actual name."
                  },
                  choices: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Exactly 4 multiple choice options, which must contain the correct name parameter."
                  },
                  searchQuery: {
                    type: Type.STRING,
                    description: "A descriptive keyword query (no punctuation, pure nouns) to query high-quality photography, e.g. 'golden gate bridge foggy sunset' or 'fresh sliced avocado fruit'."
                  }
                },
                required: ["name", "clue", "choices", "searchQuery"]
              }
            }
          },
          required: ["name", "description", "items"]
        }
      }
    });

    const bodyText = response.text;
    if (!bodyText) {
      throw new Error("No textual response was returned by Gemini.");
    }

    const parsed = JSON.parse(bodyText.trim());
    return res.json({ category: parsed });
  } catch (error: any) {
    console.error("Gemini category generation failed:", error);
    return res.status(500).json({ 
      error: "Failed to generate dynamic category via Gemini API.", 
      details: error?.message || error
    });
  }
});

// Vite Server Configuration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server successfully running on port http://0.0.0.0:${PORT}`);
  });
}

startServer();
