import { ApiError } from '../utilities/ApiError.js';

const getAiBaseUrl = () => {
    const url = process.env.AI_BACKEND_URL;
    if (!url) {
        throw new ApiError(500, "AI Backend microservice URL is not configured in .env");
    }
    return url;
};

/**
 * HTTP Integration Broker to the FastAPI AI microservice
 */
class AiServiceGateway {
    /**
     * FastAPI: POST /api/v1/sessions
     */
    static async createSession(sessionId) {
        try {
            const response = await fetch(`${getAiBaseUrl()}/api/v1/sessions`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: sessionId }) // Maps 1:1 with our PostgreSQL session ID
            });
            if (!response.ok) throw new Error(await response.text());
            return await response.json();
        } catch (error) {
            console.error("[AI Service Connection Error] Failed to create session:", error.message);
            throw new ApiError(502, "AI Engine initialization failed");
        }
    }

    /**
     * FastAPI: POST /api/v1/sessions/{id}/documents/upload
     */
    static async uploadDocument(sessionId, documentId, fileBuffer, mimeType, fileName) {
        try {
            const formData = new FormData();

            // Convert Buffer to Blob for native fetch standards
            const blob = new Blob([fileBuffer], { type: mimeType });
            formData.append("file", blob, fileName);

            const response = await fetch(`${getAiBaseUrl()}/api/v1/sessions/${sessionId}/documents/upload`, {
                method: "POST",
                body: formData
            });

            if (!response.ok) throw new Error(await response.text());
            return await response.json();
        } catch (error) {
            console.error("[AI Service Connection Error] OCR document extraction failed:", error.message);
            throw new ApiError(502, "Document AI processing failed");
        }
    }

    /**
     * FastAPI: POST /api/v1/sessions/{id}/conversation/answer
     */
    static async submitConversationAnswer(sessionId, textAnswer) {
        try {
            const response = await fetch(`${getAiBaseUrl()}/api/v1/sessions/${sessionId}/conversation/answer`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ answer: textAnswer })
            });
            if (!response.ok) throw new Error(await response.text());
            return await response.json();
        } catch (error) {
            console.error("[AI Service Connection Error] Conversation submit failed:", error.message);
            throw new ApiError(502, "Dialogue engine update failed");
        }
    }

    /**
     * FastAPI: GET /api/v1/sessions/{id}/conversation/state
     */
    static async getConversationState(sessionId) {
        try {
            const response = await fetch(`${getAiBaseUrl()}/api/v1/sessions/${sessionId}/conversation/state`);
            if (!response.ok) throw new Error(await response.text());
            return await response.json();
        } catch (error) {
            console.error("[AI Service Connection Error] Failed to fetch state:", error.message);
            throw new ApiError(502, "Could not fetch active dialogue state");
        }
    }
}

export default AiServiceGateway;