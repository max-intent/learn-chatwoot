<script lang="ts">
import { ref, onMounted, defineComponent, nextTick } from "vue";
import chatwootService from "../services/chatwootService";

export default defineComponent({
  setup() {
    const conversations = ref<any[]>([]);
    const selectedConversation = ref<any>(null);
    const newMessage = ref("");
    const conversationMessages = ref<any[]>([]);
    const accountId = "106820";
    const isLoading = ref(false);
    const isSending = ref(false);
    const messagesAreaRef = ref<HTMLElement | null>(null);

    const scrollToBottom = () => {
      nextTick(() => {
        if (messagesAreaRef.value) {
          // Ensure the element is fully rendered before scrolling
          messagesAreaRef.value.scrollTop = messagesAreaRef.value.scrollHeight;
          console.log("scrolled to bottom", messagesAreaRef.value.scrollHeight);
        }
      });
    };

    const fetchConversations = async () => {
      try {
        const response = await chatwootService.getConversations(accountId);
        conversations.value = response.data.data.payload;
      } catch (error) {
        console.error("Error fetching conversations:", error);
      }
    };

    const selectConversation = async (conversation: any) => {
      isLoading.value = true;
      selectedConversation.value = conversation;
      try {
        const response = await chatwootService.getConversation(
          accountId,
          conversation.id
        );
        conversationMessages.value = response.data.payload;
        // Wait for DOM update and then scroll
        await nextTick();
        scrollToBottom();
      } catch (error) {
        console.error("Error fetching conversation messages:", error);
      } finally {
        isLoading.value = false;
      }
    };

    const sendMessage = async () => {
      if (!newMessage.value.trim() || !selectedConversation.value) return;

      isSending.value = true;
      try {
        await chatwootService.sendMessage(
          accountId,
          selectedConversation.value.id,
          newMessage.value
        );
        newMessage.value = "";

        const response = await chatwootService.getConversation(
          accountId,
          selectedConversation.value.id
        );
        conversationMessages.value = response.data.payload;
      } catch (error) {
        console.error("Error sending message:", error);
      } finally {
        isSending.value = false;
      }
    };

    const formatDate = (date: string) => {
      // Convert seconds to milliseconds by multiplying by 1000
      const timestamp = parseInt(date) * 1000;
      return new Date(timestamp).toLocaleDateString();
    };

    onMounted(fetchConversations);

    return {
      conversations,
      selectedConversation,
      conversationMessages,
      newMessage,
      selectConversation,
      sendMessage,
      formatDate,
      isLoading,
      isSending,
      messagesAreaRef,
    };
  },
});
</script>

<template>
  <div class="chat-container">
    <div class="conversations-list">
      <h2 class="chat-header">Conversations</h2>
      <div class="conversation-items">
        <div
          v-for="conversation in conversations"
          :key="conversation.id"
          class="conversation-item"
          :class="{ active: selectedConversation?.id === conversation.id }"
          @click="selectConversation(conversation)"
        >
          <div class="conversation-preview">
            <span class="contact-name">Contact #{{ conversation.id }}</span>
            <p class="last-message">
              {{ conversation.messages[0]?.content || "No messages" }}
            </p>
            <span class="status" :class="conversation.status">{{
              conversation.status
            }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="chat-area" v-if="selectedConversation">
      <div class="chat-header-area">
        <span class="contact-name">Contact #{{ selectedConversation.id }}</span>
        <span class="status" :class="selectedConversation.status">{{
          selectedConversation.status
        }}</span>
      </div>

      <div class="messages-area" ref="messagesAreaRef">
        <div v-if="isLoading" class="skeleton-container">
          <div class="date-divider skeleton">Today</div>
          <div class="message incoming">
            <div class="message-content skeleton"></div>
          </div>
          <div class="message outgoing">
            <div class="message-content skeleton"></div>
          </div>
          <div class="message incoming">
            <div class="message-content skeleton"></div>
          </div>
          <div class="message outgoing">
            <div class="message-content skeleton"></div>
          </div>
          <div class="message incoming">
            <div class="message-content skeleton"></div>
          </div>
          <div class="message outgoing">
            <div class="message-content skeleton"></div>
          </div>
          <div class="message incoming">
            <div class="message-content skeleton"></div>
          </div>
        </div>
        <template
          v-else
          v-for="(message, index) in conversationMessages"
          :key="index"
        >
          <div
            v-if="
              index === 0 ||
              formatDate(message.created_at) !==
                formatDate(conversationMessages[index - 1].created_at)
            "
            class="date-divider"
          >
            {{ formatDate(message.created_at) }}
          </div>
          <div
            class="message"
            :class="message.message_type === 0 ? 'incoming' : 'outgoing'"
          >
            <div class="message-content">
              {{ message.content }}
              <span class="message-time">{{
                new Date(parseInt(message.created_at) * 1000).toLocaleString(
                  [],
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                )
              }}</span>
            </div>
          </div>
        </template>
      </div>

      <div class="message-input-area">
        <input
          v-model="newMessage"
          type="text"
          placeholder="Type a message..."
          @keyup.enter="sendMessage"
          :disabled="isSending"
        />
        <button @click="sendMessage" :disabled="isSending">
          {{ isSending ? "Sending..." : "Send" }}
        </button>
      </div>
    </div>

    <div class="empty-state" v-else>
      <p>Select a conversation to start chatting</p>
    </div>
  </div>
</template>

<style scoped>
.chat-container {
  max-width: 1200px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  height: 97.5vh;
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 1rem;
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.conversations-list {
  background: #fff;
  border-right: 1px solid #e2e2e2;
  display: flex;
  flex-direction: column;
  min-width: 0;
  height: 100%;
  overflow-y: auto;
}

.conversation-items {
  flex: 1;
}

.conversation-item {
  padding: 1rem;
  border-bottom: 1px solid #f0f2f5;
  cursor: pointer;
}

.conversation-item:hover {
  background: #f5f6f6;
}

.conversation-item.active {
  background: #f0f2f5;
}

.last-message {
  color: #667781;
  font-size: 0.9rem;
  margin: 0.3rem 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-header {
  background: #075e54;
  color: white;
  padding: 1rem;
  margin: 0;
}

.chat-area {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-width: 0;
  position: relative;
  overflow-y: hidden;
}

.chat-header-area {
  background: #f0f2f5;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e2e2e2;
}

.messages-area {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  padding-bottom: 90px;
  background: #e5ddd5;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.message-input-area {
  padding: 1rem;
  background: #f0f2f5;
  display: flex;
  gap: 0.5rem;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  border-top: 1px solid #e2e2e2;
}

.message-input-area input {
  flex: 1;
  padding: 0.8rem;
  border: none;
  border-radius: 8px;
  outline: none;
}

.message-input-area input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.message-input-area button {
  padding: 0.8rem 1.5rem;
  background: #075e54;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.message-input-area button:disabled {
  background: #128c7e;
  cursor: not-allowed;
  opacity: 0.7;
}

.message-input-area button:hover:not(:disabled) {
  background: #128c7e;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: #f0f2f5;
  color: #667781;
}

.contact-name {
  font-weight: bold;
}

.status {
  padding: 0.3rem 0.6rem;
  border-radius: 12px;
  font-size: 0.8rem;
  text-transform: capitalize;
}

.status.open {
  background: #dcf8c6;
}
.status.resolved {
  background: #25d366;
  color: white;
}
.status.pending {
  background: #ffe69c;
}

.message {
  max-width: 65%;
  min-width: 150px;
  padding: 0.5rem;
  border-radius: 7.5px;
}

.message.incoming {
  align-self: flex-start;
  background: white;
  border: 1px solid #e2e2e2;
}

.message.outgoing {
  align-self: flex-end;
  background: #dcf8c6;
}

.message-content {
  position: relative;
  padding-bottom: 15px;
  word-break: break-word;
}

.message-time {
  position: absolute;
  bottom: -5px;
  right: 0;
  font-size: 0.7rem;
  color: #667781;
}

.date-divider {
  align-self: center;
  background: rgba(225, 245, 254, 0.92);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  font-size: 0.9rem;
  color: #075e54;
}

.skeleton-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.skeleton {
  animation: pulse 1.5s infinite;
  background: #f0f0f0 !important;
  color: transparent !important;
  border: none !important;
}

.skeleton.message-content {
  height: 20px;
}

@keyframes pulse {
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 0.3;
  }
  100% {
    opacity: 0.6;
  }
}
</style>
