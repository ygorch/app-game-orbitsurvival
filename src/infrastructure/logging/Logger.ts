export const Logger = {
    error: (context: string, error: any) => {
        console.error(`[SourLate Error | ${context}]`, error);
        // Futuramente pode ser conectado a um Sentry ou outro sistema de monitoramento
    },
    info: (context: string, message: string) => {
        console.info(`[SourLate Info | ${context}]`, message);
    },
    warn: (context: string, message: string) => {
        console.warn(`[SourLate Warn | ${context}]`, message);
    }
};
