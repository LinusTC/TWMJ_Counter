export interface RemoteTemplatePayload {
    name: string;
    rules: Record<string, number>;
    rules_enabled: Record<string, boolean>;
}

export interface TemplateTransferRecord {
    uuid: string;
    expires_at: string;
    template: RemoteTemplatePayload;
}

export interface TemplateExportPayload extends RemoteTemplatePayload {
    uuid: string;
}
