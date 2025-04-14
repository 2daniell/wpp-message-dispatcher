export declare global {
  interface Window {
    botAPI: {
      createBot: (name: string, reqId: string) => Promise<any>;
      listBots: () => Promise<any>;
      closeApp: () => void;
      getQRCodeData: (data, canvas) => Promise<any>,
      onBotEvent: (reqId: string, callback: (data: any) => void) => void;
      onStatusUpdate: (callback) => Promise<any>,
    };
  }
}
