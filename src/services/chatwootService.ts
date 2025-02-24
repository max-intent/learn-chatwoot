import axios from "axios";

const CHATWOOT_API_BASE = "/api"
const API_TOKEN = import.meta.env.VITE_API_TOKEN;

const chatwootApi = axios.create({
  baseURL: CHATWOOT_API_BASE,
  headers: {
    "api_access_token": API_TOKEN,
    "Content-Type": "application/json; charset=utf-8",
  },
});

export default {
  async getConversations(accountId: string) {
    return chatwootApi.get(`/accounts/${accountId}/conversations`);
  },
  async getConversation(accountId: string, conversationId: string) {
    return chatwootApi.get(`/accounts/${accountId}/conversations/${conversationId}/messages`);
  },
  async sendMessage(accountId: string, conversationId: string, message: string) {
    return chatwootApi.post(`/accounts/${accountId}/conversations/${conversationId}/messages`, {
      content: message,
      message_type: "outgoing",
    });
  },
};
