import "dotenv/config";

export const useLocal = process.env?.useLocal === 'true' ? true : false;