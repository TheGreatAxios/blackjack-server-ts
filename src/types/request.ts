export interface HttpRequest {
    method: string;
    params: string[];
    url: string;
    protocol: string;
    host: string;
    port: number;
    userAgent: string;
}