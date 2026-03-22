import request from '../request';
import { ApiResponse, PageResponse } from '../types';

/** 后端万能卡流水 */
export interface CardTransactionRecord {
  id: number;
  userId: string;
  amount: number;
  transactionType?: string;
  referenceId?: string | null;
  description?: string | null;
  createdAt?: string;
}

const cardTransactionsService = {
  async page(query: { page?: number; size?: number }): Promise<ApiResponse<PageResponse<CardTransactionRecord>>> {
    return await request.get('/card-transactions/page', { params: query });
  },
};

export default cardTransactionsService;
