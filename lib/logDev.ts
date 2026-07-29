
export const logDev = (message: string, data?: any) => {
  if (process.env.NODE_ENV === "development" || process.env.DEVELOPMENT === "true") {
    console.log(`[DEV LOGS] ${message}`, data ? JSON.stringify(data) : data);
  }
};