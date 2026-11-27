export type DepositRequest = {
    bookingId: string;
    phone: string;
    amountKes: number;
    reference: string;
};

export type DepositResult = 
    | { ok: true; providerReference: string }
    | { ok: false; error: string };

export interface PaymentProvider {
    requestDeposit(request: DepositRequest): Promise<DepositResult>;
}

export const simulatedPaymentProvider: PaymentProvider = {
    async requestDeposit(request) {
        if (request.amountKes <= 0) {
            return { ok: false, error: "Deposit amount must be greater than zero."};
        }
        return{
            ok: true,
            providerReference: `SIM-${request.reference}-${Date.now()}`,
        };
    },
};

