import { reactive } from 'vue';

export const modalState = reactive({
  isCreateTicketOpen: false,
});

export function openCreateTicketModal() {
  modalState.isCreateTicketOpen = true;
}

export function closeCreateTicketModal() {
  modalState.isCreateTicketOpen = false;
}
